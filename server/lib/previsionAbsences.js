const prisma = require('../prismaClient');
const { indexFeries } = require('./calendrier');
const { cleJour } = require('./joursFeries');

/**
 * Prévision des absences, agence par agence.
 *
 * L'écran d'absentéisme mesure le passé ; rien n'anticipait. Cette prévision
 * dit, pour chaque site et chaque jour à venir, quelle part de l'effectif
 * habituel sera disponible.
 *
 * **Deux étages, et on dit lequel parle.**
 *  1. Ce qui est **connu** : les congés validés et les jours fériés. C'est un
 *     plancher certain, disponible dès le premier jour.
 *  2. Ce qui est **estimé** : le taux de présence observé, jour de semaine par
 *     jour de semaine. Il n'est calculé qu'avec assez d'historique
 *     (`PREVISION_SEMAINES_MIN`) ; en deçà, la case reste vide plutôt que
 *     d'extrapoler deux semaines d'usage.
 *
 * L'effectif habituel d'un site est l'ensemble des salariés qui y ont pointé
 * ces trente derniers jours.
 */

const SEUIL_TENDU = parseFloat(process.env.PREVISION_SEUIL_TENDU) || 0.7;
const SEUIL_CRITIQUE = parseFloat(process.env.PREVISION_SEUIL_CRITIQUE) || 0.5;
const SEMAINES_MIN = parseInt(process.env.PREVISION_SEMAINES_MIN, 10) || 8;
const SEMAINES_HISTORIQUE = 12;
const STATUTS_ACCORDES = ['APPROVED', 'Approved', 'Approuvé'];

const debutJour = (d) => {
    const x = new Date(d);
    return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
};
const ajouterJours = (d, n) => {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + n);
    return x;
};
const mediane = (valeurs) => {
    if (!valeurs.length) return null;
    const t = [...valeurs].sort((a, b) => a - b);
    const m = Math.floor(t.length / 2);
    return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2;
};

/** Un jour ouvré coincé entre un férié et le week-end. */
function estPont(jour, feries) {
    const j = jour.getUTCDay();
    if (j === 1) return feries.has(cleJour(ajouterJours(jour, 1)));
    if (j === 5) return feries.has(cleJour(ajouterJours(jour, -1)));
    return false;
}

/**
 * Ratios de présence observés, par site et par jour de semaine. Fonction pure.
 * @param {Map<string, Map<string, number>>} presentsParSiteEtJour site → (AAAA-MM-JJ → présents)
 * @returns {Map<string, {ratios: Map<number, number|null>, dimancheTravaille: boolean, semaines: number}>}
 */
function historique({ presentsParSiteEtJour, habituels, feries, debut, fin }) {
    const resultat = new Map();
    const semaines = Math.floor((fin - debut) / (7 * 86400000));
    for (const [siteId, effectif] of habituels) {
        const presents = presentsParSiteEtJour.get(siteId) || new Map();
        const echantillons = new Map([0, 1, 2, 3, 4, 5, 6].map((j) => [j, []]));
        let dimancheTravaille = false;
        for (let d = new Date(debut); d < fin; d = ajouterJours(d, 1)) {
            const cle = cleJour(d);
            const n = presents.get(cle) || 0;
            if (d.getUTCDay() === 0 && n > 0) dimancheTravaille = true;
            if (feries.has(cle) || effectif.size === 0) continue;
            echantillons.get(d.getUTCDay()).push(Math.min(1, n / effectif.size));
        }
        const ratios = new Map();
        for (const [j, valeurs] of echantillons) {
            // Un jour où personne n'a pointé sur un site ouvert d'habitude est
            // une fermeture ou une coupure, pas une absence : on l'écarte.
            const utiles = valeurs.filter((v) => v > 0);
            ratios.set(j, utiles.length >= SEMAINES_MIN ? mediane(utiles) : null);
        }
        resultat.set(siteId, { ratios, dimancheTravaille, semaines });
    }
    return resultat;
}

function niveau(taux) {
    if (taux === null) return 'INCONNU';
    if (taux < SEUIL_CRITIQUE) return 'CRITIQUE';
    if (taux < SEUIL_TENDU) return 'TENDU';
    return 'NORMAL';
}

/**
 * Calcule la prévision. Fonction pure.
 */
function calculer({ sites, habituels, conges, feries, hist, debut, jours }) {
    const dates = Array.from({ length: jours }, (_, i) => ajouterJours(debut, i));
    return sites.map((site) => {
        const effectif = habituels.get(site.id) || new Set();
        const h = hist?.get(site.id);
        return {
            id: site.id,
            nom: site.name,
            habituel: effectif.size,
            historiqueSuffisant: Boolean(h && [...h.ratios.values()].some((r) => r !== null)),
            jours: dates.map((jour) => {
                const cle = cleJour(jour);
                const base = { date: cle, jourSemaine: jour.getUTCDay() };
                if (feries.has(cle)) return { ...base, niveau: 'FERIE', ferie: feries.get(cle) };
                if (jour.getUTCDay() === 0 && h && !h.dimancheTravaille) return { ...base, niveau: 'FERME' };
                if (effectif.size === 0) return { ...base, niveau: 'INCONNU' };

                const absents = conges.filter((c) => effectif.has(c.employeeId)
                    && debutJour(c.startDate) <= jour && debutJour(c.endDate) >= jour);
                const enConge = new Set(absents.map((c) => c.employeeId));
                const disponibilite = (effectif.size - enConge.size) / effectif.size;
                const ratio = h?.ratios.get(jour.getUTCDay()) ?? null;
                const estimation = ratio === null ? null : Math.max(0, Math.min(disponibilite, disponibilite * ratio));
                return {
                    ...base,
                    enConge: enConge.size,
                    noms: [...new Map(absents.map((c) => [c.employeeId, c.nom])).values()],
                    disponibilitePct: Math.round(disponibilite * 100),
                    estimationPct: estimation === null ? null : Math.round(estimation * 100),
                    pont: estPont(jour, feries),
                    niveau: niveau(estimation ?? disponibilite)
                };
            })
        };
    });
}

async function prevoir(reference = new Date(), jours = 42) {
    const aujourdhui = debutJour(reference);
    const fin = ajouterJours(aujourdhui, jours);
    const debutHabituel = ajouterJours(aujourdhui, -30);
    const debutHistorique = ajouterJours(aujourdhui, -7 * SEMAINES_HISTORIQUE);

    const [sites, groupes, feries] = await Promise.all([
        prisma.workSite.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
        prisma.timeLog.groupBy({
            by: ['workSiteId', 'employeeId'],
            where: { workSiteId: { not: null }, timestamp: { gte: debutHabituel, lt: aujourdhui } }
        }),
        indexFeries(debutHistorique, fin)
    ]);

    const habituels = new Map(sites.map((s) => [s.id, new Set()]));
    for (const g of groupes) habituels.get(g.workSiteId)?.add(g.employeeId);
    const tous = [...new Set(groupes.map((g) => g.employeeId))];

    const [leaves, arrivees] = await Promise.all([
        prisma.leave.findMany({
            where: { employeeId: { in: tous }, status: { in: STATUTS_ACCORDES }, startDate: { lt: fin }, endDate: { gte: aujourdhui } },
            select: { employeeId: true, startDate: true, endDate: true, employee: { select: { firstName: true, lastName: true } } }
        }),
        prisma.timeLog.findMany({
            where: { type: 'CLOCK_IN', workSiteId: { not: null }, timestamp: { gte: debutHistorique, lt: aujourdhui } },
            select: { workSiteId: true, employeeId: true, timestamp: true }
        })
    ]);

    const distincts = new Map();
    for (const a of arrivees) {
        const cle = `${a.workSiteId}|${cleJour(a.timestamp)}`;
        if (!distincts.has(cle)) distincts.set(cle, new Set());
        distincts.get(cle).add(a.employeeId);
    }
    const presentsParSiteEtJour = new Map();
    for (const [cle, ensemble] of distincts) {
        const [siteId, jour] = cle.split('|');
        if (!presentsParSiteEtJour.has(siteId)) presentsParSiteEtJour.set(siteId, new Map());
        presentsParSiteEtJour.get(siteId).set(jour, ensemble.size);
    }

    // L'historique ne commence qu'au premier pointage : compter douze semaines
    // quand la base n'en a que deux ferait croire à un historique suffisant.
    const premier = arrivees.reduce((min, a) => (!min || a.timestamp < min ? a.timestamp : min), null);
    const debutReel = premier ? debutJour(premier) : aujourdhui;
    const hist = historique({ presentsParSiteEtJour, habituels, feries, debut: debutReel, fin: aujourdhui });

    return {
        genereLe: reference.toISOString(),
        debut: cleJour(aujourdhui),
        jours,
        seuils: { tendu: SEUIL_TENDU, critique: SEUIL_CRITIQUE },
        historique: {
            semaines: Math.floor((aujourdhui - debutReel) / (7 * 86400000)),
            semainesRequises: SEMAINES_MIN
        },
        sites: calculer({
            sites, habituels,
            conges: leaves.map((l) => ({ ...l, nom: `${l.employee.firstName} ${l.employee.lastName}` })),
            feries, hist, debut: aujourdhui, jours
        })
    };
}

module.exports = { SEUIL_TENDU, SEUIL_CRITIQUE, SEMAINES_MIN, estPont, historique, niveau, calculer, prevoir };
