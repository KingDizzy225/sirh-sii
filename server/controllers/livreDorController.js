const prisma = require('../prismaClient');
const livres = require('../lib/livreDor');

/**
 * Livres d'or : ouverture et modération par la RH, écriture par les collègues,
 * lecture par la personne à qui il est dédié.
 */

const vueRh = (l) => ({
    id: l.id,
    titre: l.titre,
    occasion: l.occasion,
    occasionLibelle: livres.OCCASIONS[l.occasion] || l.occasion,
    beneficiaire: l.beneficiaire ? `${l.beneficiaire.firstName} ${l.beneficiaire.lastName}` : null,
    telephoneBeneficiaire: l.beneficiaire?.phone || null,
    dateRemise: l.dateRemise,
    afficherMur: l.afficherMur,
    clotureLe: l.clotureLe,
    remiseOuverteLe: l.remiseOuverteLe,
    ouvertAuxMots: livres.ouvertAuxMots(l),
    lienContribution: livres.lienContribution(l.jetonContribution),
    lienRemise: livres.lienRemise(l.jetonRemise),
    nombreMots: l._count?.mots ?? 0,
    creeLe: l.creeLe
});

exports.lister = async (req, res) => {
    try {
        const lignes = await prisma.livreDor.findMany({
            orderBy: { dateRemise: 'desc' },
            take: 100,
            include: {
                beneficiaire: { select: { firstName: true, lastName: true, phone: true } },
                _count: { select: { mots: { where: { masque: false } } } }
            }
        });
        res.json({ occasions: livres.OCCASIONS, livres: lignes.map(vueRh) });
    } catch (erreur) {
        console.error("[LIVRE D'OR] Lecture impossible :", erreur.message);
        res.status(500).json({ error: "Lecture des livres d'or impossible." });
    }
};

exports.creer = async (req, res) => {
    try {
        const { beneficiaireId, occasion, afficherMur } = req.body || {};
        const titre = String(req.body?.titre || '').trim();
        const dateRemise = new Date(req.body?.dateRemise);

        if (!livres.OCCASIONS[occasion]) return res.status(400).json({ error: 'Occasion inconnue.' });
        if (titre.length < 3 || titre.length > 120) return res.status(400).json({ error: 'Donner un titre (3 à 120 caractères).' });
        if (isNaN(dateRemise.getTime())) return res.status(400).json({ error: 'Date de remise invalide.' });
        const hier = new Date();
        hier.setUTCDate(hier.getUTCDate() - 1);
        if (dateRemise < hier) return res.status(400).json({ error: 'La date de remise est passée.' });

        const beneficiaire = beneficiaireId ? await prisma.employee.findUnique({ where: { id: beneficiaireId } }) : null;
        if (!beneficiaire) return res.status(400).json({ error: 'Choisir la personne à qui le livre est dédié.' });

        const livre = await prisma.livreDor.create({
            data: {
                titre, occasion, dateRemise, beneficiaireId,
                afficherMur: afficherMur === true,
                jetonContribution: livres.nouveauJeton(),
                jetonRemise: livres.nouveauJeton(),
                creePar: req.user?.name || req.user?.email || null
            },
            include: { beneficiaire: { select: { firstName: true, lastName: true, phone: true } }, _count: { select: { mots: true } } }
        });
        res.status(201).json(vueRh(livre));
    } catch (erreur) {
        console.error("[LIVRE D'OR] Création impossible :", erreur.message);
        res.status(500).json({ error: "Création du livre d'or impossible." });
    }
};

exports.mots = async (req, res) => {
    try {
        const mots = await prisma.motLivreDor.findMany({
            where: { livreId: req.params.id },
            orderBy: { creeLe: 'asc' },
            select: { id: true, auteur: true, message: true, creeLe: true, masque: true }
        });
        res.json(mots);
    } catch (erreur) {
        console.error("[LIVRE D'OR] Mots illisibles :", erreur.message);
        res.status(500).json({ error: 'Lecture des mots impossible.' });
    }
};

exports.masquer = async (req, res) => {
    try {
        const { count } = await prisma.motLivreDor.updateMany({
            where: { id: req.params.motId, livreId: req.params.id },
            data: { masque: req.body?.masque !== false }
        });
        if (count === 0) return res.status(404).json({ error: 'Mot introuvable.' });
        res.json({ message: req.body?.masque === false ? 'Mot rétabli.' : 'Mot masqué : il ne sera ni remis ni affiché.' });
    } catch (erreur) {
        console.error("[LIVRE D'OR] Modération impossible :", erreur.message);
        res.status(500).json({ error: 'Modération impossible.' });
    }
};

exports.clore = async (req, res) => {
    try {
        const { count } = await prisma.livreDor.updateMany({ where: { id: req.params.id, clotureLe: null }, data: { clotureLe: new Date() } });
        if (count === 0) return res.status(409).json({ error: 'Livre introuvable ou déjà clos.' });
        res.json({ message: "Livre clos : plus personne ne peut y écrire. La remise reste possible." });
    } catch (erreur) {
        console.error("[LIVRE D'OR] Clôture impossible :", erreur.message);
        res.status(500).json({ error: 'Clôture impossible.' });
    }
};

const jetonValide = (j) => /^[a-f0-9]{48}$/.test(String(j || ''));

/** Page d'écriture : de quoi savoir pour qui on écrit, rien des autres mots. */
exports.contribution = async (req, res) => {
    try {
        const livre = jetonValide(req.params.jeton)
            ? await prisma.livreDor.findUnique({
                where: { jetonContribution: req.params.jeton },
                include: { beneficiaire: { select: { firstName: true } }, _count: { select: { mots: { where: { masque: false } } } } }
            })
            : null;
        if (!livre) return res.status(404).json({ error: "Ce livre d'or n'existe pas." });
        res.set('Cache-Control', 'no-store');
        res.json({
            titre: livre.titre,
            occasion: livres.OCCASIONS[livre.occasion],
            prenom: livre.beneficiaire.firstName,
            dateRemise: livre.dateRemise,
            nombreMots: livre._count.mots,
            ouvert: livres.ouvertAuxMots(livre),
            messageMax: livres.MESSAGE_MAX,
            organisation: process.env.ORGANISATION_NAME || 'SIRH-SII'
        });
    } catch (erreur) {
        console.error("[LIVRE D'OR] Page indisponible :", erreur.message);
        res.status(500).json({ error: 'Page indisponible.' });
    }
};

exports.ecrire = async (req, res) => {
    try {
        const livre = jetonValide(req.params.jeton)
            ? await prisma.livreDor.findUnique({ where: { jetonContribution: req.params.jeton } })
            : null;
        if (!livre) return res.status(404).json({ error: "Ce livre d'or n'existe pas." });
        if (!livres.ouvertAuxMots(livre)) return res.status(410).json({ error: 'Ce livre est clos : il n\'accepte plus de mots.' });

        const propre = livres.nettoyer(req.body || {});
        if (propre.erreur) return res.status(400).json({ error: propre.erreur });

        // Derrière le proxy de l'hébergeur, req.ip est l'adresse du proxy pour
        // tout le monde : la dernière entrée de X-Forwarded-For est celle qu'il a
        // vue, la seule qu'un client ne puisse pas écrire à sa place.
        const adresse = String(req.get?.('x-forwarded-for') || '').split(',').pop().trim() || req.ip;
        const empreinteIp = livres.empreinte(adresse, livre.id);
        const [total, depuisAdresse] = await Promise.all([
            prisma.motLivreDor.count({ where: { livreId: livre.id } }),
            empreinteIp ? prisma.motLivreDor.count({ where: { livreId: livre.id, empreinteIp } }) : 0
        ]);
        if (total >= livres.MOTS_MAX) return res.status(409).json({ error: 'Ce livre est complet.' });
        if (depuisAdresse >= livres.ENVOIS_PAR_ADRESSE) {
            return res.status(429).json({ error: 'Plusieurs mots ont déjà été envoyés depuis cet appareil. Merci !' });
        }

        await prisma.motLivreDor.create({ data: { livreId: livre.id, ...propre, empreinteIp } });
        res.status(201).json({ message: 'Merci ! Votre mot sera remis le jour venu.' });
    } catch (erreur) {
        console.error("[LIVRE D'OR] Écriture impossible :", erreur.message);
        res.status(500).json({ error: 'Envoi impossible. Réessayez.' });
    }
};

/** Remise : tous les mots non masqués, à partir du jour prévu. */
exports.remise = async (req, res) => {
    try {
        const livre = jetonValide(req.params.jeton)
            ? await prisma.livreDor.findUnique({
                where: { jetonRemise: req.params.jeton },
                include: {
                    beneficiaire: { select: { firstName: true } },
                    mots: { where: { masque: false }, orderBy: { creeLe: 'asc' }, select: { auteur: true, message: true } }
                }
            })
            : null;
        if (!livre) return res.status(404).json({ error: "Ce livre d'or n'existe pas." });
        if (!livres.lisible(livre)) {
            return res.status(403).json({ error: 'Patience : ce livre se dévoile le jour prévu.', dateRemise: livre.dateRemise });
        }
        if (!livre.remiseOuverteLe) {
            await prisma.livreDor.update({ where: { id: livre.id }, data: { remiseOuverteLe: new Date() } });
        }
        res.set('Cache-Control', 'no-store');
        res.json({
            titre: livre.titre,
            occasion: livres.OCCASIONS[livre.occasion],
            prenom: livre.beneficiaire.firstName,
            organisation: process.env.ORGANISATION_NAME || 'SIRH-SII',
            mots: livre.mots
        });
    } catch (erreur) {
        console.error("[LIVRE D'OR] Remise indisponible :", erreur.message);
        res.status(500).json({ error: 'Page indisponible.' });
    }
};
