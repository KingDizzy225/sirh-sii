const prisma = require('../prismaClient');

/**
 * Passation d'équipe en agence.
 *
 * À la relève, ce qui n'est pas dit est perdu : le client à rappeler, le
 * terminal en panne, la consigne du responsable. La passation l'écrit, l'équipe
 * suivante l'acquitte, et un élément reste ouvert tant que personne ne l'a
 * résolu — il réapparaît à la relève suivante au lieu de disparaître.
 *
 * Un salarié écrit et lit les passations des sites où il a pointé ces trente
 * derniers jours : c'est son agence de fait, sans affectation à inventer.
 */

const CATEGORIES = {
    INCIDENT: 'Incident',
    CLIENT: 'Client à rappeler',
    CONSIGNE: 'Consigne',
    MATERIEL: 'Matériel'
};

const ELEMENTS_MAX = 10;
const TEXTE_MIN = 3;
const TEXTE_MAX = 500;
/** Fenêtre des passations montrées à la relève. */
const HEURES_RECENTES = parseInt(process.env.PASSATION_HEURES, 10) || 36;
/** Au-delà, un élément ouvert n'est plus reporté : il relève du suivi RH. */
const JOURS_REPORT = parseInt(process.env.PASSATION_JOURS_REPORT, 10) || 7;

/** @returns {{elements: Array}|{erreur: string}} */
function valider(elements) {
    if (!Array.isArray(elements) || elements.length === 0) return { erreur: 'Ajoutez au moins un élément.' };
    if (elements.length > ELEMENTS_MAX) return { erreur: `${ELEMENTS_MAX} éléments au plus par passation.` };
    const propres = [];
    for (const e of elements) {
        if (!CATEGORIES[e?.categorie]) return { erreur: 'Catégorie inconnue.' };
        const texte = String(e.texte || '').replace(/\s+/g, ' ').trim();
        if (texte.length < TEXTE_MIN) return { erreur: 'Un élément est vide.' };
        if (texte.length > TEXTE_MAX) return { erreur: `Un élément dépasse ${TEXTE_MAX} caractères.` };
        propres.push({ categorie: e.categorie, texte });
    }
    return { elements: propres };
}

/** Sites où le salarié a pointé ces trente derniers jours. */
async function sitesDuSalarie(employeeId, reference = new Date()) {
    const depuis = new Date(reference);
    depuis.setUTCDate(depuis.getUTCDate() - 30);
    const lignes = await prisma.timeLog.findMany({
        where: { employeeId, workSiteId: { not: null }, timestamp: { gte: depuis } },
        distinct: ['workSiteId'],
        select: { workSite: { select: { id: true, name: true, isActive: true } } }
    });
    return lignes.map((l) => l.workSite).filter((s) => s?.isActive);
}

/**
 * Statistique par site, pour la direction. Fonction pure.
 * Compte ce qui a été signalé et ce qui reste ouvert ; elle ne prétend pas
 * reconnaître qu'« un même terminal » revient — elle montre les éléments.
 */
function bilanParSite(passations, reference = new Date()) {
    const parSite = new Map();
    for (const p of passations) {
        const site = parSite.get(p.workSiteId) || {
            workSiteId: p.workSiteId, nom: p.workSite?.name || null, passations: 0,
            parCategorie: Object.fromEntries(Object.keys(CATEGORIES).map((c) => [c, 0])),
            ouverts: 0, plusAncienOuvert: null
        };
        site.passations += 1;
        for (const e of p.elements || []) {
            site.parCategorie[e.categorie] = (site.parCategorie[e.categorie] || 0) + 1;
            if (!e.resoluLe) {
                site.ouverts += 1;
                if (!site.plusAncienOuvert || new Date(p.creeLe) < new Date(site.plusAncienOuvert)) site.plusAncienOuvert = p.creeLe;
            }
        }
        parSite.set(p.workSiteId, site);
    }
    return [...parSite.values()].map((s) => ({
        ...s,
        joursOuvert: s.plusAncienOuvert ? Math.floor((reference - new Date(s.plusAncienOuvert)) / 86400000) : null
    })).sort((a, b) => b.ouverts - a.ouverts);
}

module.exports = { CATEGORIES, ELEMENTS_MAX, TEXTE_MAX, HEURES_RECENTES, JOURS_REPORT, valider, sitesDuSalarie, bilanParSite };
