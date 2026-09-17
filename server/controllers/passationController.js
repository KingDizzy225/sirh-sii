const prisma = require('../prismaClient');
const passation = require('../lib/passation');
const { _interne: { porteur } } = require('./espaceSalarieController');

/**
 * Passations d'équipe : écriture et lecture depuis le badge, suivi par la RH.
 */

const refuserBadge = (res) => res.status(403).json({
    error: "Votre badge n'est pas valide sur ce téléphone. Rouvrez le lien de votre badge."
});

const prenomInitiale = (e) => (e ? `${e.firstName} ${String(e.lastName || '').charAt(0)}.`.trim() : null);

const vuePassation = (p, employeeId) => ({
    id: p.id,
    creeLe: p.creeLe,
    auteur: prenomInitiale(p.auteur),
    acquittements: p.acquittements.length,
    acquitteeParMoi: p.acquittements.some((a) => a.employeeId === employeeId),
    elements: p.elements.map((e) => ({
        id: e.id,
        categorie: e.categorie,
        categorieLibelle: passation.CATEGORIES[e.categorie],
        texte: e.texte,
        resoluLe: e.resoluLe,
        resoluPar: prenomInitiale(e.resoluPar)
    }))
});

const INCLURE = {
    auteur: { select: { firstName: true, lastName: true } },
    acquittements: { select: { employeeId: true } },
    elements: { orderBy: { id: 'asc' }, include: { resoluPar: { select: { firstName: true, lastName: true } } } }
};

exports.espace = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);

        const maintenant = new Date();
        const recentes = new Date(maintenant.getTime() - passation.HEURES_RECENTES * 3600000);
        const report = new Date(maintenant);
        report.setUTCDate(report.getUTCDate() - passation.JOURS_REPORT);

        const sites = await passation.sitesDuSalarie(salarie.id, maintenant);
        const resultat = [];
        for (const site of sites) {
            const [dernieres, ouverts] = await Promise.all([
                prisma.passation.findMany({
                    where: { workSiteId: site.id, creeLe: { gte: recentes } },
                    orderBy: { creeLe: 'desc' },
                    take: 5,
                    include: INCLURE
                }),
                prisma.elementPassation.findMany({
                    where: { resoluLe: null, passation: { workSiteId: site.id, creeLe: { gte: report, lt: recentes } } },
                    orderBy: { passation: { creeLe: 'asc' } },
                    include: { passation: { select: { creeLe: true, auteur: { select: { firstName: true, lastName: true } } } } }
                })
            ]);
            resultat.push({
                site: { id: site.id, nom: site.name },
                passations: dernieres.map((p) => vuePassation(p, salarie.id)),
                // Ce qui traîne depuis plus longtemps que la relève précédente.
                reportes: ouverts.map((e) => ({
                    id: e.id, categorie: e.categorie, categorieLibelle: passation.CATEGORIES[e.categorie],
                    texte: e.texte, depuis: e.passation.creeLe, auteur: prenomInitiale(e.passation.auteur)
                }))
            });
        }
        res.set('Cache-Control', 'no-store');
        res.json({ categories: passation.CATEGORIES, sites: resultat });
    } catch (erreur) {
        console.error('[PASSATION] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Passations indisponibles.' });
    }
};

/** Le site doit être l'un de ceux où le salarié travaille. */
async function siteAutorise(salarie, workSiteId) {
    const sites = await passation.sitesDuSalarie(salarie.id);
    return sites.some((s) => s.id === workSiteId);
}

exports.ecrire = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);
        const { workSiteId } = req.body || {};
        if (!workSiteId || !(await siteAutorise(salarie, workSiteId))) {
            return res.status(403).json({ error: "Vous ne pouvez écrire que pour une agence où vous avez pointé ce mois-ci." });
        }
        const propre = passation.valider(req.body?.elements);
        if (propre.erreur) return res.status(400).json({ error: propre.erreur });

        await prisma.passation.create({
            data: {
                workSiteId, auteurId: salarie.id,
                elements: { create: propre.elements },
                // L'auteur a évidemment lu ce qu'il écrit.
                acquittements: { create: [{ employeeId: salarie.id }] }
            }
        });
        res.status(201).json({ message: "Passation transmise à l'équipe suivante." });
    } catch (erreur) {
        console.error('[PASSATION] Écriture impossible :', erreur.message);
        res.status(500).json({ error: 'Envoi impossible.' });
    }
};

exports.acquitter = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);
        const p = await prisma.passation.findUnique({ where: { id: req.params.id } });
        if (!p || !(await siteAutorise(salarie, p.workSiteId))) return res.status(404).json({ error: 'Passation introuvable.' });
        await prisma.acquittementPassation.upsert({
            where: { passationId_employeeId: { passationId: p.id, employeeId: salarie.id } },
            create: { passationId: p.id, employeeId: salarie.id },
            update: {}
        });
        res.json({ message: 'Lu.' });
    } catch (erreur) {
        console.error('[PASSATION] Acquittement impossible :', erreur.message);
        res.status(500).json({ error: 'Action impossible.' });
    }
};

exports.resoudre = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);
        const element = await prisma.elementPassation.findUnique({ where: { id: req.params.id }, include: { passation: true } });
        if (!element || !(await siteAutorise(salarie, element.passation.workSiteId))) return res.status(404).json({ error: 'Élément introuvable.' });
        if (element.resoluLe) return res.status(409).json({ error: 'Déjà résolu.' });
        await prisma.elementPassation.update({ where: { id: element.id }, data: { resoluLe: new Date(), resoluParId: salarie.id } });
        res.json({ message: 'Marqué comme résolu.' });
    } catch (erreur) {
        console.error('[PASSATION] Résolution impossible :', erreur.message);
        res.status(500).json({ error: 'Action impossible.' });
    }
};

/** Suivi RH : bilan par site et passations récentes. */
exports.suivi = async (req, res) => {
    try {
        const jours = Math.min(90, Math.max(1, parseInt(req.query.jours, 10) || 30));
        const depuis = new Date();
        depuis.setUTCDate(depuis.getUTCDate() - jours);
        const where = { creeLe: { gte: depuis }, ...(req.query.site ? { workSiteId: String(req.query.site) } : {}) };
        const passations = await prisma.passation.findMany({
            where,
            orderBy: { creeLe: 'desc' },
            include: { ...INCLURE, workSite: { select: { name: true } } }
        });
        res.json({
            jours,
            categories: passation.CATEGORIES,
            bilan: passation.bilanParSite(passations),
            recentes: passations.slice(0, 50).map((p) => ({ ...vuePassation(p, null), site: p.workSite?.name || null, workSiteId: p.workSiteId }))
        });
    } catch (erreur) {
        console.error('[PASSATION] Suivi indisponible :', erreur.message);
        res.status(500).json({ error: 'Suivi des passations indisponible.' });
    }
};
