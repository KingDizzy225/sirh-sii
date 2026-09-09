const path = require('path');
const fs = require('fs');
const prisma = require('../prismaClient');
const remise = require('../lib/remise');

/**
 * Remise de documents aux salariés.
 *
 * La RH produit un lien, le transmet par le canal de son choix, et voit ensuite
 * si le document a été retiré. Le salarié n'ouvre pas de session : le lien est
 * la clé, encadré par une expiration, une vérification et une trace.
 *
 * Une règle traverse ce fichier : **la partie publique ne dit jamais rien
 * qu'un porteur de lien légitime n'aurait déjà**. Ni le nom du salarié avant
 * vérification, ni la distinction entre un jeton inconnu et un jeton expiré —
 * qui permettrait de savoir qu'un lien a existé.
 */

const ADRESSE_IP = (req) =>
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || null;

/**
 * Retrouve le fichier derrière une source, et son intitulé.
 * @returns {Promise<{chemin:string, titre:string}|{erreur:string}>}
 */
async function localiserSource(sourceType, sourceId) {
    if (sourceType === 'BULLETIN') {
        const bulletin = await prisma.payroll.findUnique({
            where: { id: sourceId },
            select: { pdfPath: true, period: true, employeeId: true }
        });
        if (!bulletin) return { erreur: 'Bulletin introuvable.' };
        if (!bulletin.pdfPath) {
            return { erreur: "Ce bulletin n'a pas de PDF enregistré : le relancer avant de le remettre." };
        }
        const mois = new Date(bulletin.period)
            .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return { chemin: bulletin.pdfPath, titre: `Bulletin de paie — ${mois}`, employeeId: bulletin.employeeId };
    }

    if (sourceType === 'DOCUMENT') {
        const doc = await prisma.employeeDocument.findUnique({
            where: { id: sourceId },
            select: { filePath: true, title: true, employeeId: true }
        });
        if (!doc) return { erreur: 'Document introuvable.' };
        return { chemin: doc.filePath, titre: doc.title, employeeId: doc.employeeId };
    }

    return { erreur: `Nature de document inconnue : ${sourceType}.` };
}

/** Chemin absolu vérifié, ou null si le fichier sort de l'arborescence servie. */
function cheminSur(relatif) {
    if (!relatif) return null;
    // Le chemin est produit par le serveur, mais la vérification coûte moins
    // cher que la confiance.
    const nettoye = path.normalize(relatif).replace(/^(\.\.[/\\])+/, '').replace(/^\/+/, '');
    const racine = path.join(__dirname, '..');
    const complet = path.join(racine, nettoye);
    return complet.startsWith(racine) ? complet : null;
}

/**
 * POST /api/remises — produit un lien de remise.
 *
 * Réservé à la RH. Le lien est rendu une fois ; il reste consultable ensuite
 * dans la liste des remises du salarié.
 */
exports.remettre = async (req, res) => {
    try {
        const { sourceType, sourceId, verification, validiteJours } = req.body || {};

        if (!remise.SOURCES[sourceType]) {
            return res.status(400).json({
                error: `Nature attendue : ${Object.keys(remise.SOURCES).join(', ')}.`
            });
        }
        if (!sourceId) return res.status(400).json({ error: 'Document à remettre non précisé.' });

        const source = await localiserSource(sourceType, sourceId);
        if (source.erreur) return res.status(404).json({ error: source.erreur });

        const salarie = await prisma.employee.findUnique({
            where: { id: source.employeeId },
            select: { id: true, firstName: true, lastName: true, birthDate: true }
        });
        if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });

        // Le fichier doit exister avant qu'on promette un téléchargement : un
        // lien qui mène à une erreur est pire que pas de lien du tout.
        const complet = cheminSur(source.chemin);
        if (!complet || !fs.existsSync(complet)) {
            return res.status(409).json({
                error: "Le fichier n'est pas présent sur le serveur ; le lien mènerait à une erreur.",
                remede: "Régénérer le document, et vérifier qu'un disque persistant est attaché à l'hébergement."
            });
        }

        /**
         * La vérification par date de naissance est demandée par défaut, mais
         * elle suppose que la date soit au dossier. Sans elle, le salarié
         * serait bloqué devant un contrôle impossible à satisfaire : on refuse
         * la remise plutôt que de produire un lien inutilisable, et le message
         * dit quoi faire.
         */
        const controle = verification === 'AUCUNE' ? 'AUCUNE' : 'NAISSANCE';
        if (controle === 'NAISSANCE' && !salarie.birthDate) {
            return res.status(409).json({
                error: `La date de naissance de ${salarie.firstName} ${salarie.lastName} n'est pas `
                    + "renseignée : le salarié ne pourrait pas franchir la vérification.",
                remede: 'Renseigner la date au dossier, ou produire le lien sans vérification.'
            });
        }

        const jours = Math.min(Math.max(parseInt(validiteJours, 10) || remise.VALIDITE_JOURS, 1), 365);

        const creee = await prisma.remiseDocument.create({
            data: {
                token: remise.nouveauJeton(),
                employeeId: salarie.id,
                sourceType,
                sourceId,
                // L'intitulé est figé ici : renommer la source plus tard ne doit
                // pas changer ce que le salarié a reçu.
                titre: source.titre,
                remisPar: req.user?.name || req.user?.email || null,
                expireLe: remise.echeance(jours),
                verification: controle
            }
        });

        res.status(201).json({
            ...remise.pourRh(creee),
            salarie: `${salarie.firstName} ${salarie.lastName}`,
            consigne: controle === 'NAISSANCE'
                ? "Transmettez ce lien au salarié. Sa date de naissance lui sera demandée à l'ouverture."
                : 'Transmettez ce lien au salarié. Aucune vérification ne sera demandée : '
                  + "quiconque l'ouvre pourra télécharger le document."
        });
    } catch (error) {
        console.error('Erreur remise de document :', error);
        res.status(500).json({ error: 'Erreur lors de la production du lien.' });
    }
};

/** GET /api/remises/employe/:employeeId — l'historique des remises d'un salarié. */
exports.listerParEmploye = async (req, res) => {
    try {
        const remises = await prisma.remiseDocument.findMany({
            where: { employeeId: req.params.employeeId },
            orderBy: { remisLe: 'desc' }
        });
        res.json(remises.map(remise.pourRh));
    } catch (error) {
        console.error('Erreur lecture des remises :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des remises.' });
    }
};

/** POST /api/remises/:id/revoquer — coupe un lien transmis par erreur. */
exports.revoquer = async (req, res) => {
    try {
        const { motif } = req.body || {};
        const existante = await prisma.remiseDocument.findUnique({ where: { id: req.params.id } });
        if (!existante) return res.status(404).json({ error: 'Remise introuvable.' });
        if (existante.revoqueeLe) return res.status(409).json({ error: 'Ce lien est déjà annulé.' });

        await prisma.remiseDocument.update({
            where: { id: existante.id },
            data: { revoqueeLe: new Date(), revoqueeMotif: motif || null }
        });

        res.json({
            message: 'Lien annulé. Il ne permet plus de télécharger le document.',
            // Ce qui est déjà téléchargé l'est : le dire évite une fausse
            // impression de rattrapage.
            reserve: existante.telechargements > 0
                ? `Le document avait déjà été téléchargé ${existante.telechargements} fois. `
                  + "L'annulation n'y change rien."
                : null
        });
    } catch (error) {
        console.error('Erreur révocation de remise :', error);
        res.status(500).json({ error: "Erreur lors de l'annulation." });
    }
};

// ---------------------------------------------------------------------------
// Partie publique : aucune session, le jeton fait foi.
// ---------------------------------------------------------------------------

/**
 * GET /api/public/documents/:token
 *
 * Ce que voit le visiteur avant d'avoir prouvé quoi que ce soit : le strict
 * nécessaire pour savoir quoi faire. Ni le nom du salarié, ni l'intitulé du
 * document — un lien transféré ne doit pas révéler de qui il s'agit.
 */
exports.consulter = async (req, res) => {
    try {
        const enregistrement = await prisma.remiseDocument.findUnique({
            where: { token: String(req.params.token || '') }
        });

        const situation = remise.etat(enregistrement);
        if (situation !== 'VALIDE') {
            // Un jeton inconnu et un jeton expiré se répondent de la même
            // façon : distinguer les deux dirait qu'un lien a existé.
            return res.status(404).json({ valide: false, motif: remise.MOTIFS[situation] });
        }

        await prisma.remiseDocument.update({
            where: { id: enregistrement.id },
            data: {
                ouvertLe: enregistrement.ouvertLe || new Date(),
                derniereIp: ADRESSE_IP(req)
            }
        }).catch(() => { /* la trace ne doit pas empêcher la remise */ });

        res.json({
            valide: true,
            verification: enregistrement.verification,
            // L'intitulé n'est rendu qu'une fois la vérification franchie.
            titre: enregistrement.verification === 'AUCUNE' ? enregistrement.titre : null,
            expireLe: enregistrement.expireLe,
            organisation: process.env.ORGANISATION_NAME || 'SIRH-SII'
        });
    } catch (error) {
        console.error('Erreur consultation de remise :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture du lien.' });
    }
};

/**
 * POST /api/public/documents/:token/ouvrir
 *
 * Franchit la vérification et rend l'intitulé du document. Le téléchargement
 * proprement dit passe par la route suivante.
 */
exports.ouvrir = async (req, res) => {
    try {
        const enregistrement = await prisma.remiseDocument.findUnique({
            where: { token: String(req.params.token || '') },
            include: { employee: { select: { firstName: true, lastName: true, birthDate: true } } }
        });

        const situation = remise.etat(enregistrement);
        if (situation !== 'VALIDE') {
            return res.status(404).json({ valide: false, motif: remise.MOTIFS[situation] });
        }

        const controle = remise.verifier(enregistrement, enregistrement.employee, req.body?.naissance);
        if (!controle.ok) {
            const echecs = enregistrement.echecs + 1;
            await prisma.remiseDocument.update({
                where: { id: enregistrement.id },
                data: { echecs, derniereIp: ADRESSE_IP(req) }
            });
            return res.status(403).json({
                valide: false,
                motif: controle.motif,
                // Le nombre d'essais restants est dit : sans cela, le salarié
                // découvre le blocage sans l'avoir vu venir.
                essaisRestants: Math.max(remise.ECHECS_MAX - echecs, 0)
            });
        }

        res.json({
            valide: true,
            titre: enregistrement.titre,
            remisLe: enregistrement.remisLe,
            expireLe: enregistrement.expireLe,
            destinataire: `${enregistrement.employee.firstName} ${enregistrement.employee.lastName}`
        });
    } catch (error) {
        console.error('Erreur ouverture de remise :', error);
        res.status(500).json({ error: "Erreur lors de l'ouverture du document." });
    }
};

/**
 * GET /api/public/documents/:token/fichier?naissance=AAAA-MM-JJ
 *
 * Le téléchargement refait la vérification : la route précédente ne délivre
 * aucun laissez-passer, et l'adresse du fichier pourrait être appelée seule.
 */
exports.telecharger = async (req, res) => {
    try {
        const enregistrement = await prisma.remiseDocument.findUnique({
            where: { token: String(req.params.token || '') },
            include: { employee: { select: { firstName: true, lastName: true, birthDate: true } } }
        });

        const situation = remise.etat(enregistrement);
        if (situation !== 'VALIDE') {
            return res.status(404).json({ error: remise.MOTIFS[situation] });
        }

        const controle = remise.verifier(enregistrement, enregistrement.employee, req.query?.naissance);
        if (!controle.ok) {
            await prisma.remiseDocument.update({
                where: { id: enregistrement.id },
                data: { echecs: enregistrement.echecs + 1, derniereIp: ADRESSE_IP(req) }
            });
            return res.status(403).json({ error: controle.motif });
        }

        const source = await localiserSource(enregistrement.sourceType, enregistrement.sourceId);
        if (source.erreur) return res.status(404).json({ error: source.erreur });

        const complet = cheminSur(source.chemin);
        if (!complet || !fs.existsSync(complet)) {
            return res.status(404).json({
                error: "Le fichier n'est plus présent sur le serveur. "
                    + 'Demandez un nouveau lien au service des ressources humaines.'
            });
        }

        await prisma.remiseDocument.update({
            where: { id: enregistrement.id },
            data: {
                telechargeLe: new Date(),
                telechargements: { increment: 1 },
                derniereIp: ADRESSE_IP(req)
            }
        }).catch(() => { /* la trace ne doit pas empêcher la remise */ });

        const nom = `${enregistrement.titre.replace(/[^\w\-]+/g, '_')}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${nom}"`);
        res.sendFile(complet);
    } catch (error) {
        console.error('Erreur téléchargement de remise :', error);
        if (!res.headersSent) res.status(500).json({ error: 'Erreur lors du téléchargement.' });
    }
};
