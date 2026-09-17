const prisma = require('../prismaClient');
const retro = require('../lib/retrospective');
const remise = require('../lib/remise');

/**
 * « Mon année chez SII » : production des liens par la RH, ouverture par le
 * salarié après vérification de sa date de naissance.
 *
 * Le bilan contient l'évolution de la rémunération : un lien transféré ne doit
 * pas suffire à la lire. D'où la même vérification, et le même plafond
 * d'échecs, qu'une remise de bulletin.
 */

const anneeDemandee = (valeur) => {
    const annee = parseInt(valeur, 10);
    return Number.isInteger(annee) ? annee : new Date().getUTCFullYear();
};

function etatLien(lien, reference = new Date()) {
    if (!lien) return 'INTROUVABLE';
    if (lien.revoqueeLe) return 'REVOQUEE';
    if (lien.echecs >= remise.ECHECS_MAX) return 'BLOQUEE';
    if (new Date(lien.expireLe) < reference) return 'EXPIREE';
    return 'VALIDE';
}

exports.lister = async (req, res) => {
    try {
        const annee = anneeDemandee(req.query.annee);
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            select: {
                id: true, firstName: true, lastName: true, phone: true, birthDate: true,
                retrospectives: { where: { annee } }
            }
        });
        res.json({
            annee,
            lignes: salaries.map((s) => {
                const lien = s.retrospectives[0];
                return {
                    employeeId: s.id,
                    nom: `${s.firstName} ${s.lastName}`,
                    prenom: s.firstName,
                    telephone: s.phone,
                    dateNaissanceConnue: Boolean(s.birthDate),
                    lien: lien ? {
                        id: lien.id,
                        url: retro.lienDe(lien.token),
                        etat: etatLien(lien),
                        creeLe: lien.creeLe,
                        expireLe: lien.expireLe,
                        ouvertLe: lien.ouvertLe,
                        ouvertures: lien.ouvertures
                    } : null
                };
            })
        });
    } catch (erreur) {
        console.error('[RÉTROSPECTIVE] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des bilans impossible.' });
    }
};

/**
 * Produit les liens manquants de l'année pour tous les salariés actifs.
 * Un lien existant est conservé : le renvoyer ne doit pas casser celui déjà
 * transmis. Un salarié sans date de naissance n'en reçoit pas — il faudrait
 * ouvrir son bilan sans vérification.
 */
exports.generer = async (req, res) => {
    try {
        const annee = anneeDemandee(req.body?.annee);
        if (annee > new Date().getUTCFullYear()) {
            return res.status(400).json({ error: "Impossible de produire le bilan d'une année qui n'a pas commencé." });
        }
        const auteur = req.user?.name || req.user?.email || null;
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            select: { id: true, birthDate: true, retrospectives: { where: { annee }, select: { id: true } } }
        });

        let crees = 0;
        let sansDateNaissance = 0;
        for (const s of salaries) {
            if (s.retrospectives.length > 0) continue;
            if (!s.birthDate) { sansDateNaissance += 1; continue; }
            await prisma.retrospectiveAnnuelle.create({
                data: { token: retro.nouveauJeton(), employeeId: s.id, annee, creePar: auteur, expireLe: retro.echeance(annee) }
            });
            crees += 1;
        }

        const message = `${crees} lien(s) produit(s) pour ${annee}.` +
            (sansDateNaissance ? ` ${sansDateNaissance} salarié(s) sans date de naissance au dossier : aucun lien, faute de pouvoir vérifier qui l'ouvre.` : '');
        res.status(201).json({ annee, crees, sansDateNaissance, message });
    } catch (erreur) {
        console.error('[RÉTROSPECTIVE] Production impossible :', erreur.message);
        res.status(500).json({ error: 'Production des liens impossible.' });
    }
};

exports.revoquer = async (req, res) => {
    try {
        const lien = await prisma.retrospectiveAnnuelle.findUnique({ where: { id: req.params.id } });
        if (!lien) return res.status(404).json({ error: 'Lien introuvable.' });
        // Révoquer libère la place : un nouveau lien pourra être produit.
        await prisma.retrospectiveAnnuelle.delete({ where: { id: lien.id } });
        res.json({ message: 'Lien annulé. Un nouveau lien peut être produit.' });
    } catch (erreur) {
        console.error('[RÉTROSPECTIVE] Révocation impossible :', erreur.message);
        res.status(500).json({ error: 'Annulation du lien impossible.' });
    }
};

const trouver = (token) => (/^[a-f0-9]{64}$/.test(String(token || ''))
    ? prisma.retrospectiveAnnuelle.findUnique({
        where: { token },
        include: { employee: { select: { id: true, firstName: true, birthDate: true } } }
    })
    : Promise.resolve(null));

/** Accueil public : prénom et année, rien d'autre avant vérification. */
exports.accueil = async (req, res) => {
    try {
        const lien = await trouver(req.params.token);
        const etat = etatLien(lien);
        if (etat !== 'VALIDE') {
            return res.status(etat === 'INTROUVABLE' ? 404 : 410).json({ etat, motif: remise.MOTIFS[etat] });
        }
        res.json({
            etat,
            prenom: lien.employee.firstName,
            annee: lien.annee,
            organisation: require('../lib/identite').nom()
        });
    } catch (erreur) {
        console.error('[RÉTROSPECTIVE] Accueil indisponible :', erreur.message);
        res.status(500).json({ error: 'Bilan indisponible.' });
    }
};

exports.ouvrir = async (req, res) => {
    try {
        const lien = await trouver(req.params.token);
        const etat = etatLien(lien);
        if (etat !== 'VALIDE') {
            return res.status(etat === 'INTROUVABLE' ? 404 : 410).json({ etat, motif: remise.MOTIFS[etat] });
        }

        if (!remise.memeJour(req.body?.dateNaissance, lien.employee.birthDate)) {
            const echecs = lien.echecs + 1;
            await prisma.retrospectiveAnnuelle.update({ where: { id: lien.id }, data: { echecs } });
            const restantes = Math.max(0, remise.ECHECS_MAX - echecs);
            return res.status(403).json({
                error: restantes > 0
                    ? `La date de naissance ne correspond pas. ${restantes} essai(s) restant(s).`
                    : remise.MOTIFS.BLOQUEE
            });
        }

        const contenu = await retro.bilan(lien.employee.id, lien.annee);
        await prisma.retrospectiveAnnuelle.update({
            where: { id: lien.id },
            data: { ouvertLe: lien.ouvertLe || new Date(), ouvertures: { increment: 1 } }
        });
        res.set('Cache-Control', 'no-store');
        res.json(contenu);
    } catch (erreur) {
        console.error('[RÉTROSPECTIVE] Ouverture impossible :', erreur.message);
        res.status(500).json({ error: 'Bilan indisponible.' });
    }
};
