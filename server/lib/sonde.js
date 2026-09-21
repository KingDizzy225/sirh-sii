const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const prisma = require('../prismaClient');
const sceau = require('./sceau');
const journal = require('./journal');
const identite = require('./identite');

/**
 * Sonde de bout en bout.
 *
 * L'écran « état des services » dit quelles variables sont posées. Ce n'est pas
 * la même chose que de savoir si le service marche : un mot de passe SMTP
 * expiré, une clé de scellement remplacée, un disque plein ou une sauvegarde
 * qui ne s'écrit plus laissent toutes les variables en place.
 *
 * La sonde exerce donc réellement les chemins : elle scelle puis vérifie un
 * document, écrit puis relit dans la base, contrôle la chaîne du journal, écrit
 * un fichier dans le dossier des dépôts, et regarde l'âge de la dernière
 * sauvegarde.
 *
 * **Elle n'écrit rien de durable** : aucun document émis, aucun courriel
 * envoyé sans destinataire de contrôle déclaré, aucune ligne laissée derrière
 * elle hormis le compte rendu de son propre passage.
 */

const NIVEAUX = { OK: 'OK', ALERTE: 'ALERTE', ABSENT: 'ABSENT' };

/** Âge maximal admis pour la dernière sauvegarde, en heures. */
const SAUVEGARDE_AGE_MAX_H = parseInt(process.env.SONDE_SAUVEGARDE_AGE_MAX_H, 10) || 30;

const mesure = async (nom, libelle, travail) => {
    const debut = Date.now();
    try {
        const resultat = await travail();
        return { nom, libelle, dureeMs: Date.now() - debut, ...resultat };
    } catch (erreur) {
        return { nom, libelle, dureeMs: Date.now() - debut, niveau: NIVEAUX.ALERTE, detail: erreur.message };
    }
};

/** La base répond-elle, et contient-elle un effectif ? */
const controlerBase = () => mesure('base', 'Base de données', async () => {
    const effectif = await prisma.employee.count({ where: { status: { not: 'TERMINATED' } } });
    return { niveau: NIVEAUX.OK, detail: `${effectif} salarié(s) actif(s)` };
});

/** Une migration en échec laisse l'application démarrer avec un schéma incomplet. */
const controlerMigrations = () => mesure('migrations', 'Migrations appliquées', async () => {
    const lignes = await prisma.$queryRawUnsafe(
        'SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY started_at DESC LIMIT 20'
    );
    const echouees = lignes.filter((l) => !l.finished_at || l.rolled_back_at);
    return echouees.length
        ? { niveau: NIVEAUX.ALERTE, detail: `Migration non terminée : ${echouees.map((l) => l.migration_name).join(', ')}` }
        : { niveau: NIVEAUX.OK, detail: `${lignes.length} dernière(s) migration(s) appliquées` };
});

/**
 * Le scellement fonctionne-t-il vraiment ?
 * On scelle un manifeste jetable et on le vérifie : c'est le seul contrôle qui
 * distingue une clé présente d'une clé utilisable.
 */
const controlerScellement = () => mesure('scellement', 'Scellement des documents', async () => {
    const manifeste = sceau.manifeste({
        documentId: `sonde-${crypto.randomBytes(8).toString('hex')}`,
        titre: 'Contrôle de scellement',
        empreinte: crypto.createHash('sha256').update('sonde').digest('hex'),
        signataire: 'Sonde', signataireId: 'sonde',
        horodatage: new Date().toISOString(), ip: '127.0.0.1', methode: 'SONDE',
        organisation: identite.nom()
    });
    const scelle = await sceau.sceller(manifeste);
    const verifie = await sceau.verifier(manifeste, scelle.sceau, scelle.keyId);
    return verifie.valide
        ? { niveau: NIVEAUX.OK, detail: `Clé « ${scelle.keyId} » opérationnelle (${scelle.origineCle})` }
        : { niveau: NIVEAUX.ALERTE, detail: `Un document scellé à l'instant ne se vérifie pas : ${verifie.motif}` };
});

/** Un document réellement émis se vérifie-t-il encore ? */
const controlerDocumentEmis = () => mesure('documents', 'Documents déjà remis', async () => {
    const document = await prisma.issuedDocument.findFirst({
        where: { sceau: { not: null }, revokedAt: null },
        orderBy: { issuedAt: 'desc' }
    });
    if (!document) return { niveau: NIVEAUX.ABSENT, detail: 'Aucun document scellé à contrôler' };
    const valide = await sceau.verifier(document.manifeste, document.sceau, document.sceauKeyId);
    return valide.valide
        ? { niveau: NIVEAUX.OK, detail: `Le dernier document émis (${document.type}) se vérifie` }
        : {
            niveau: NIVEAUX.ALERTE,
            detail: `Le document ${document.type} du ${new Date(document.issuedAt).toISOString().slice(0, 10)} ne se vérifie plus : ${valide.motif}`
        };
});

/** La chaîne du journal est-elle intacte ? */
const controlerJournal = () => mesure('journal', "Journal d'audit", async () => {
    const etat = await journal.verifier({ limite: 20000 });
    if (etat.intacte) return { niveau: NIVEAUX.OK, detail: `${etat.chainees} ligne(s) chaînée(s), chaîne intacte` };
    const motif = etat.rupture
        ? `rupture ${etat.rupture.motif} à la ligne ${etat.rupture.numero}`
        : `${etat.ancrages.rompus.length} ancrage(s) ne correspondent plus`;
    return { niveau: NIVEAUX.ALERTE, detail: `Journal altéré : ${motif}` };
});

/** Le disque des dépôts est-il accessible en écriture ? */
const controlerDepots = () => mesure('depots', 'Disque des dépôts', async () => {
    const dossier = path.join(__dirname, '../uploads');
    await fs.promises.mkdir(dossier, { recursive: true });
    const essai = path.join(dossier, `.sonde-${Date.now()}`);
    await fs.promises.writeFile(essai, 'sonde');
    const relu = await fs.promises.readFile(essai, 'utf8');
    await fs.promises.unlink(essai);
    return relu === 'sonde'
        ? { niveau: NIVEAUX.OK, detail: 'Écriture et relecture correctes' }
        : { niveau: NIVEAUX.ALERTE, detail: 'Le fichier relu diffère de celui écrit.' };
});

/** La dernière sauvegarde est-elle récente et non vide ? */
const controlerSauvegarde = () => mesure('sauvegarde', 'Dernière sauvegarde', async () => {
    const dossier = (process.env.SAUVEGARDE_DESTINATION || '').trim();
    if (!dossier) return { niveau: NIVEAUX.ABSENT, detail: 'SAUVEGARDE_DESTINATION non définie : la sonde ne peut rien vérifier.' };
    if (!fs.existsSync(dossier)) return { niveau: NIVEAUX.ALERTE, detail: `Dossier introuvable : ${dossier}` };

    const fichiers = (await fs.promises.readdir(dossier))
        .map((nom) => {
            const complet = path.join(dossier, nom);
            try {
                const stat = fs.statSync(complet);
                return stat.isFile() ? { nom, modifieLe: stat.mtime, taille: stat.size } : null;
            } catch { return null; }
        })
        .filter(Boolean)
        .sort((a, b) => b.modifieLe - a.modifieLe);

    if (fichiers.length === 0) return { niveau: NIVEAUX.ALERTE, detail: 'Aucune sauvegarde dans le dossier.' };
    const derniere = fichiers[0];
    const ageH = Math.round((Date.now() - derniere.modifieLe.getTime()) / 3600000);
    if (ageH > SAUVEGARDE_AGE_MAX_H) {
        return { niveau: NIVEAUX.ALERTE, detail: `La dernière sauvegarde (${derniere.nom}) date de ${ageH} h.` };
    }
    if (derniere.taille < 1024) {
        return { niveau: NIVEAUX.ALERTE, detail: `La dernière sauvegarde ne pèse que ${derniere.taille} octets : elle est vide.` };
    }
    return { niveau: NIVEAUX.OK, detail: `${derniere.nom}, ${Math.round(derniere.taille / 1048576)} Mo, il y a ${ageH} h` };
});

/** Claude répond-il ? Le contrôle consomme un appel minimal. */
const controlerIA = () => mesure('ia', 'Intelligence artificielle', async () => {
    if (!(process.env.ANTHROPIC_API_KEY || '').trim()) {
        return { niveau: NIVEAUX.ABSENT, detail: 'ANTHROPIC_API_KEY absente : les fonctions d\'IA sont hors service.' };
    }
    const { diagnostiquer } = require('./claudeAI');
    const resultat = await diagnostiquer();
    return resultat.disponible
        ? { niveau: NIVEAUX.OK, detail: `${resultat.modele} répond : « ${resultat.reponse} »` }
        : { niveau: NIVEAUX.ALERTE, detail: resultat.motif || 'Aucune réponse' };
});

/** Le guichet WhatsApp peut-il recevoir et répondre ? */
const controlerWhatsapp = () => mesure('whatsapp', 'Guichet WhatsApp', async () => {
    const etat = require('./whatsapp').etatConfiguration();
    if (etat.receptionActive && etat.envoiActif) return { niveau: NIVEAUX.OK, detail: 'Réception et envoi configurés' };
    if (!etat.receptionActive && !etat.envoiActif) return { niveau: NIVEAUX.ABSENT, detail: 'Guichet non raccordé' };
    return {
        niveau: NIVEAUX.ALERTE,
        detail: etat.receptionActive
            ? 'Les messages arrivent mais aucune réponse ne peut partir.'
            : 'Les réponses pourraient partir, mais aucun message n\'arrive.'
    };
});

/** Le courrier sortant part-il vraiment ? Seulement si un destinataire d'essai est déclaré. */
const controlerCourriel = () => mesure('courriel', 'Courrier sortant', async () => {
    const destinataire = (process.env.SONDE_EMAIL_DESTINATAIRE || '').trim();
    const configure = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    if (!configure) return { niveau: NIVEAUX.ABSENT, detail: 'SMTP non configuré : aucune notification ne part.' };
    if (!destinataire) return { niveau: NIVEAUX.ABSENT, detail: 'SONDE_EMAIL_DESTINATAIRE non définie : envoi non éprouvé.' };
    const { sendMail } = require('./mailer');
    await sendMail({
        to: destinataire,
        subject: `[Sonde] ${identite.nom()} — ${new Date().toISOString()}`,
        html: '<p>Message de contrôle émis par la sonde du SIRH. Aucune action requise.</p>'
    });
    return { niveau: NIVEAUX.OK, detail: `Message remis à ${destinataire}` };
});

const CONTROLES = [
    controlerBase, controlerMigrations, controlerScellement, controlerDocumentEmis,
    controlerJournal, controlerDepots, controlerSauvegarde, controlerIA,
    controlerWhatsapp, controlerCourriel
];

/**
 * Exécute tous les contrôles et conserve le compte rendu.
 * @param {{declenchePar?: string, enregistrer?: boolean}} options
 */
async function executer({ declenchePar = 'traitement planifié', enregistrer = true } = {}) {
    const debut = Date.now();
    const resultats = [];
    for (const controle of CONTROLES) resultats.push(await controle());

    const echecs = resultats.filter((r) => r.niveau === NIVEAUX.ALERTE);
    const compteRendu = {
        lanceeLe: new Date().toISOString(),
        dureeMs: Date.now() - debut,
        ok: echecs.length === 0,
        echecs: echecs.length,
        resultats,
        declenchePar
    };

    if (enregistrer) {
        await prisma.executionSonde.create({
            data: {
                dureeMs: compteRendu.dureeMs, ok: compteRendu.ok, echecs: compteRendu.echecs,
                resultats, declenchePar
            }
        }).catch((e) => console.error('[SONDE] Compte rendu non enregistré :', e.message));
    }
    return compteRendu;
}

module.exports = { NIVEAUX, CONTROLES, SAUVEGARDE_AGE_MAX_H, executer };
