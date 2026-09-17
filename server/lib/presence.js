const prisma = require('../prismaClient');

/**
 * Qui est là, maintenant.
 *
 * Le mur d'agence et la carte des sites posent la même question, et il ne faut
 * pas qu'ils y répondent différemment : un écran qui annonce six présents
 * quand la carte en montre quatre suffit à ce que plus personne ne croie ni
 * l'un ni l'autre.
 *
 * Un salarié est présent si son dernier pointage du jour est une arrivée. Le
 * site est celui de cette arrivée. La journée est prise en temps universel :
 * la Côte d'Ivoire vit à UTC+0 toute l'année.
 */

function debutDuJour(reference = new Date()) {
    const d = new Date(reference);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

/**
 * Réduit les pointages du jour à l'état de chaque salarié.
 * Fonction pure : les pointages doivent être triés par heure croissante.
 *
 * @returns {Map<string, {present:boolean, arrivee:Date|null, workSiteId:string|null,
 *           horsPerimetre:boolean, pointages:number, salarie:object|undefined}>}
 */
function etatPresences(pointages) {
    const etats = new Map();
    for (const p of pointages) {
        const etat = etats.get(p.employeeId) || {
            present: false, arrivee: null, workSiteId: null,
            horsPerimetre: false, pointages: 0, salarie: p.employee
        };
        etat.pointages += 1;
        if (p.withinPerimeter === false) etat.horsPerimetre = true;
        if (p.type === 'CLOCK_IN') {
            etat.present = true;
            etat.arrivee = p.timestamp;
            etat.workSiteId = p.workSiteId || null;
        } else if (p.type === 'CLOCK_OUT') {
            etat.present = false;
        }
        etats.set(p.employeeId, etat);
    }
    return etats;
}

/** Pointages du jour, avec l'identité minimale de leur auteur. */
async function pointagesDuJour(reference = new Date()) {
    return prisma.timeLog.findMany({
        where: { timestamp: { gte: debutDuJour(reference), lte: reference } },
        orderBy: { timestamp: 'asc' },
        select: {
            employeeId: true, type: true, timestamp: true, workSiteId: true, withinPerimeter: true,
            employee: { select: { firstName: true, lastName: true, positionTitle: true, status: true } }
        }
    });
}

/**
 * Salariés rattachés de fait à un site : ceux qui y ont pointé récemment.
 *
 * Le dossier ne dit pas où travaille un salarié. Plutôt qu'inventer une
 * affectation, on la lit dans les pointages des trente derniers jours.
 */
async function salariesDuSite(workSiteId, reference = new Date(), jours = 30) {
    const depuis = new Date(reference);
    depuis.setUTCDate(depuis.getUTCDate() - jours);
    const lignes = await prisma.timeLog.findMany({
        where: { workSiteId, timestamp: { gte: depuis, lte: reference } },
        distinct: ['employeeId'],
        select: { employeeId: true }
    });
    return lignes.map((l) => l.employeeId);
}

/** « Awa K. » : ce qu'un écran partagé peut afficher d'un nom. */
function prenomInitiale(salarie) {
    if (!salarie) return '';
    const initiale = (salarie.lastName || '').trim().charAt(0);
    return initiale ? `${salarie.firstName} ${initiale.toUpperCase()}.` : salarie.firstName;
}

module.exports = { debutDuJour, etatPresences, pointagesDuJour, salariesDuSite, prenomInitiale };
