const prisma = require('../prismaClient');
const ecrans = require('../lib/ecranAgence');

/**
 * Écrans d'agence : création et révocation par la RH, affichage public par jeton.
 */

const pourRh = (e) => ({
    id: e.id,
    nom: e.nom,
    site: e.workSite ? { id: e.workSite.id, nom: e.workSite.name } : null,
    visibleClientele: e.visibleClientele,
    lien: ecrans.lienDe(e.token),
    creeLe: e.creeLe,
    creePar: e.creePar,
    derniereConsultation: e.derniereConsultation,
    revoqueLe: e.revoqueLe
});

exports.lister = async (req, res) => {
    try {
        const lignes = await prisma.ecranAgence.findMany({
            orderBy: [{ revoqueLe: 'asc' }, { creeLe: 'desc' }],
            include: { workSite: { select: { id: true, name: true } } }
        });
        res.json(lignes.map(pourRh));
    } catch (erreur) {
        console.error('[ÉCRANS] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des écrans impossible.' });
    }
};

exports.creer = async (req, res) => {
    try {
        const nom = String(req.body?.nom || '').trim();
        const { workSiteId } = req.body || {};
        const visibleClientele = req.body?.visibleClientele;

        if (nom.length < 3) return res.status(400).json({ error: "Donner un nom à l'écran (3 caractères au moins)." });
        // Le choix est exigé, pas supposé : il décide si des noms s'affichent en vitrine.
        if (typeof visibleClientele !== 'boolean') {
            return res.status(400).json({ error: "Préciser si l'écran est visible de la clientèle." });
        }
        if (workSiteId) {
            const site = await prisma.workSite.findUnique({ where: { id: workSiteId } });
            if (!site) return res.status(400).json({ error: 'Site introuvable.' });
        }

        const ecran = await prisma.ecranAgence.create({
            data: {
                token: ecrans.nouveauJeton(),
                nom,
                workSiteId: workSiteId || null,
                visibleClientele,
                creePar: req.user?.name || req.user?.email || null
            },
            include: { workSite: { select: { id: true, name: true } } }
        });
        res.status(201).json(pourRh(ecran));
    } catch (erreur) {
        console.error('[ÉCRANS] Création impossible :', erreur.message);
        res.status(500).json({ error: "Création de l'écran impossible." });
    }
};

exports.revoquer = async (req, res) => {
    try {
        const ecran = await prisma.ecranAgence.findUnique({ where: { id: req.params.id } });
        if (!ecran) return res.status(404).json({ error: 'Écran introuvable.' });
        if (ecran.revoqueLe) return res.status(409).json({ error: 'Cet écran est déjà révoqué.' });
        await prisma.ecranAgence.update({ where: { id: ecran.id }, data: { revoqueLe: new Date() } });
        res.json({ message: "Écran révoqué : la page s'éteindra à son prochain rafraîchissement." });
    } catch (erreur) {
        console.error('[ÉCRANS] Révocation impossible :', erreur.message);
        res.status(500).json({ error: "Révocation de l'écran impossible." });
    }
};

/** Affichage public. Aucune session : le jeton vaut autorisation. */
exports.afficher = async (req, res) => {
    try {
        const { token } = req.params;
        if (!/^[a-f0-9]{64}$/.test(String(token || ''))) {
            return res.status(404).json({ error: 'Écran inconnu.' });
        }
        const ecran = await prisma.ecranAgence.findUnique({
            where: { token },
            include: { workSite: { select: { name: true } } }
        });
        if (!ecran || ecran.revoqueLe) {
            // Même réponse pour un écran révoqué et un écran inconnu.
            return res.status(404).json({ error: 'Écran inconnu ou désactivé.' });
        }

        const contenu = await ecrans.contenu(ecran);
        // La trace de consultation dit à la RH si la TV est encore allumée.
        prisma.ecranAgence.update({ where: { id: ecran.id }, data: { derniereConsultation: new Date() } })
            .catch((e) => console.error('[ÉCRANS] Trace de consultation :', e.message));
        res.set('Cache-Control', 'no-store');
        res.json(contenu);
    } catch (erreur) {
        console.error('[ÉCRANS] Affichage impossible :', erreur.message);
        res.status(500).json({ error: "Contenu de l'écran indisponible." });
    }
};
