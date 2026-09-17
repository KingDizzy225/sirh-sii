const prisma = require('../prismaClient');
const presence = require('./presence');

/**
 * Carte des agences : l'état du réseau, site par site, à l'instant.
 *
 * Les sites et les pointages géolocalisés sont en base depuis longtemps ; rien
 * ne les montrait ensemble. La direction lisait des tableaux pour savoir ce
 * qu'une carte dit d'un regard : quelle agence est ouverte, laquelle est vide,
 * où l'on pointe hors du périmètre.
 *
 * Les postes vacants n'y figurent pas : une offre d'emploi n'est rattachée à
 * aucun site, et la carte ne le devinera pas.
 */

/**
 * Compose l'état des sites. Fonction pure.
 * @param {Array} sites - sites actifs
 * @param {Map} etats - issu de presence.etatPresences
 * @param {Map<string, number>} habituels - salariés ayant pointé sur le site en 30 jours
 */
function composer(sites, etats, habituels) {
    const parSite = new Map(sites.map((s) => [s.id, {
        id: s.id,
        nom: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        rayonMetres: s.radiusMeters,
        presents: [],
        pointesAujourdhui: 0,
        horsPerimetre: 0,
        effectifHabituel: habituels.get(s.id) || 0
    }]));

    const sansSite = { presents: 0, pointesAujourdhui: 0 };

    for (const [employeeId, e] of etats) {
        if (e.salarie?.status === 'TERMINATED') continue;
        const site = e.workSiteId ? parSite.get(e.workSiteId) : null;
        if (!site) {
            sansSite.pointesAujourdhui += 1;
            if (e.present) sansSite.presents += 1;
            continue;
        }
        site.pointesAujourdhui += 1;
        if (e.horsPerimetre) site.horsPerimetre += 1;
        if (e.present) {
            site.presents.push({
                employeeId,
                nom: `${e.salarie?.firstName || ''} ${e.salarie?.lastName || ''}`.trim(),
                fonction: e.salarie?.positionTitle || null,
                arrivee: e.arrivee
            });
        }
    }

    const lignes = [...parSite.values()].map((s) => ({
        ...s,
        nombrePresents: s.presents.length,
        // Un site où l'on pointe d'habitude et où personne n'est arrivé.
        etat: s.presents.length > 0 ? 'OUVERT' : (s.effectifHabituel > 0 ? 'SANS_PRESENCE' : 'INACTIF')
    }));

    return {
        sites: lignes,
        sansSite,
        totaux: {
            sites: lignes.length,
            ouverts: lignes.filter((s) => s.etat === 'OUVERT').length,
            presents: lignes.reduce((t, s) => t + s.nombrePresents, 0) + sansSite.presents,
            horsPerimetre: lignes.reduce((t, s) => t + s.horsPerimetre, 0)
        }
    };
}

async function etat(reference = new Date()) {
    const depuis = new Date(reference);
    depuis.setUTCDate(depuis.getUTCDate() - 30);

    const [sites, pointages, groupes] = await Promise.all([
        prisma.workSite.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
        presence.pointagesDuJour(reference),
        prisma.timeLog.groupBy({
            by: ['workSiteId', 'employeeId'],
            where: { workSiteId: { not: null }, timestamp: { gte: depuis, lte: reference } }
        })
    ]);

    const habituels = new Map();
    for (const g of groupes) habituels.set(g.workSiteId, (habituels.get(g.workSiteId) || 0) + 1);

    return { genereLe: reference.toISOString(), ...composer(sites, presence.etatPresences(pointages), habituels) };
}

module.exports = { composer, etat };
