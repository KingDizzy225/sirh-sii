const prisma = require('../prismaClient');

/**
 * Indemnités journalières de la CNPS : maternité et accident du travail.
 *
 * Pendant un congé de maternité ou un arrêt consécutif à un accident du
 * travail, l'employeur continue de payer le salaire, et la CNPS lui rembourse
 * des indemnités journalières. L'application suivait les congés, suivait les
 * accidents, payait les bulletins — et ne réclamait jamais rien. L'avance
 * était faite chaque fois, la créance jamais ouverte : de l'argent sorti dont
 * personne ne tenait le compte.
 *
 * **Ce module ne calcule pas le droit.** Le taux, les plafonds et la durée
 * indemnisable relèvent du régime CNPS, et changent. Il rapproche ce que
 * l'entreprise a effectivement avancé de ce qui reste à réclamer, ouvre la
 * créance, et suit son encaissement. Le montant réclamé est celui que la RH
 * inscrit, ou celui qu'un taux déclaré (`CNPS_TAUX_IJ`) permet d'estimer — et
 * l'écran distingue toujours l'estimation du montant obtenu.
 */

const TYPES = {
    MATERNITE: { code: 'MATERNITE', libelle: 'Congé de maternité', origine: 'CONGE' },
    ACCIDENT: { code: 'ACCIDENT', libelle: 'Accident du travail', origine: 'ACCIDENT' }
};
const STATUTS = ['A_RECLAMER', 'RECLAMEE', 'REMBOURSEE', 'ABANDONNEE'];

/** Taux d'indemnisation estimé, si l'entreprise en a déclaré un. */
const TAUX = (() => {
    const n = parseFloat(process.env.CNPS_TAUX_IJ);
    return Number.isFinite(n) && n > 0 && n <= 1 ? n : null;
})();

/** Délai de forclusion pour déposer une demande, en jours. */
const DELAI_DEPOT_JOURS = Math.max(parseInt(process.env.CNPS_IJ_DELAI_JOURS, 10) || 730, 1);

const arrondir = (n) => Math.round((Number(n) || 0) * 100) / 100;
const jours = (de, a) => Math.floor((new Date(a) - new Date(de)) / 86400000) + 1;

/**
 * Salaire journalier de référence, tiré des bulletins précédant l'arrêt.
 *
 * Pris avant l'arrêt et non pendant : un mois d'absence indemnisée ferait
 * baisser la référence, et donc la créance qu'on réclame.
 */
async function salaireJournalier(employeeId, avant, moisRetenus = 3) {
    const bulletins = await prisma.payroll.findMany({
        where: { employeeId, period: { lt: new Date(avant) } },
        orderBy: { period: 'desc' },
        take: moisRetenus,
        select: { grossSalary: true, baseSalary: true }
    });
    const montants = bulletins
        .map((b) => (b.grossSalary != null ? b.grossSalary : b.baseSalary))
        .filter((m) => Number.isFinite(m) && m > 0);
    if (montants.length === 0) return { journalier: null, moisRetenus: 0 };
    const moyen = montants.reduce((a, b) => a + b, 0) / montants.length;
    return { journalier: arrondir(moyen / 30), moisRetenus: montants.length };
}

/** Estimation de la créance. Fonction pure. */
function estimer(joursArret, journalier, taux = TAUX) {
    if (taux == null || journalier == null) {
        return { montant: null, estimable: false, taux: null };
    }
    return {
        montant: Math.round(Math.max(joursArret, 0) * journalier * taux),
        estimable: true,
        taux
    };
}

/**
 * Arrêts ouvrant une créance et non encore rattachés à une demande.
 *
 * Un arrêt déjà suivi n'est pas reproposé ; un arrêt trop ancien pour être
 * déposé est signalé plutôt que masqué, parce que c'est précisément la perte
 * qu'il fallait voir venir.
 */
async function candidats(reference = new Date()) {
    const suivis = await prisma.indemniteJournaliere.findMany({ select: { origineId: true } });
    const dejaSuivis = new Set(suivis.map((s) => s.origineId));

    const congesMaternite = await prisma.leave.findMany({
        where: { type: 'Maternity', status: 'Approved' },
        orderBy: { startDate: 'desc' },
        take: 200,
        include: { employee: { select: { firstName: true, lastName: true } } }
    });

    const accidents = await prisma.workAccident.findMany({
        where: { daysOff: { gt: 0 }, type: { not: 'Presque-accident' } },
        orderBy: { occurredAt: 'desc' },
        take: 200,
        include: { employee: { select: { firstName: true, lastName: true } } }
    });

    const lignes = [];

    for (const conge of congesMaternite) {
        if (dejaSuivis.has(conge.id)) continue;
        const depuis = Math.floor((reference - new Date(conge.endDate)) / 86400000);
        lignes.push({
            origineId: conge.id,
            type: 'MATERNITE',
            employeeId: conge.employeeId,
            nom: `${conge.employee.lastName} ${conge.employee.firstName}`.trim(),
            debut: conge.startDate,
            fin: conge.endDate,
            jours: conge.durationDays || jours(conge.startDate, conge.endDate),
            forclos: depuis > DELAI_DEPOT_JOURS,
            joursDepuisLaFin: depuis
        });
    }

    for (const accident of accidents) {
        if (dejaSuivis.has(accident.id)) continue;
        const fin = new Date(accident.occurredAt);
        fin.setUTCDate(fin.getUTCDate() + accident.daysOff);
        const depuis = Math.floor((reference - fin) / 86400000);
        lignes.push({
            origineId: accident.id,
            type: 'ACCIDENT',
            employeeId: accident.employeeId,
            nom: `${accident.employee.lastName} ${accident.employee.firstName}`.trim(),
            debut: accident.occurredAt,
            fin,
            jours: accident.daysOff,
            declareCnps: accident.declaredToCnps,
            forclos: depuis > DELAI_DEPOT_JOURS,
            joursDepuisLaFin: depuis
        });
    }

    return lignes.sort((a, b) => new Date(b.debut) - new Date(a.debut));
}

/** Ouvre une créance sur un arrêt. */
async function ouvrir({ type, origineId, employeeId, debut, fin, joursArret, montantReclame = null, creePar = null }) {
    if (!TYPES[type]) throw Object.assign(new Error('Type inconnu.'), { statut: 400 });
    const existante = await prisma.indemniteJournaliere.findFirst({ where: { origineId } });
    if (existante) {
        throw Object.assign(new Error('Une créance est déjà ouverte sur cet arrêt.'), { statut: 409 });
    }

    const reference = await salaireJournalier(employeeId, debut);
    const estimation = estimer(joursArret, reference.journalier);

    return prisma.indemniteJournaliere.create({
        data: {
            employeeId,
            type,
            origineId,
            debut: new Date(debut),
            fin: new Date(fin),
            jours: Math.max(parseInt(joursArret, 10) || 0, 0),
            salaireJournalier: reference.journalier,
            montantEstime: estimation.montant,
            montantReclame: montantReclame != null ? Math.max(Number(montantReclame) || 0, 0) : null,
            creePar
        }
    });
}

/** Le registre, et ce qu'il représente en argent. */
async function registre() {
    const creances = await prisma.indemniteJournaliere.findMany({
        orderBy: { debut: 'desc' },
        take: 300,
        include: { employee: { select: { firstName: true, lastName: true } } }
    });

    const lignes = creances.map((c) => ({
        id: c.id,
        employeeId: c.employeeId,
        nom: `${c.employee.lastName} ${c.employee.firstName}`.trim(),
        type: c.type,
        debut: c.debut,
        fin: c.fin,
        jours: c.jours,
        salaireJournalier: c.salaireJournalier,
        montantEstime: c.montantEstime,
        montantReclame: c.montantReclame,
        montantRembourse: c.montantRembourse,
        statut: c.statut,
        reference: c.reference,
        reclameeLe: c.reclameeLe,
        rembourseeLe: c.rembourseeLe
    }));

    const ouvertes = lignes.filter((l) => l.statut === 'A_RECLAMER' || l.statut === 'RECLAMEE');
    return {
        types: TYPES,
        statuts: STATUTS,
        taux: TAUX,
        delaiDepotJours: DELAI_DEPOT_JOURS,
        lignes,
        // Ce qui est estimé n'est pas ce qui est dû : les deux totaux sont
        // rendus séparément pour qu'aucun tableau de bord ne les additionne.
        totalEstime: ouvertes.reduce((s, l) => s + (l.montantEstime || 0), 0),
        totalReclame: ouvertes.reduce((s, l) => s + (l.montantReclame || 0), 0),
        totalRembourse: lignes.reduce((s, l) => s + (l.montantRembourse || 0), 0),
        estimationsSansTaux: TAUX === null
    };
}

module.exports = {
    TYPES, STATUTS, TAUX, DELAI_DEPOT_JOURS,
    salaireJournalier, estimer, candidats, ouvrir, registre
};
