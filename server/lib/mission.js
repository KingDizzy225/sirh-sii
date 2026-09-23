const prisma = require('../prismaClient');

/**
 * Ordres de mission et frais de déplacement.
 *
 * Les notes de frais existaient : on remboursait après coup, sur présentation.
 * Ce qui manquait est ce qui vient avant — l'autorisation écrite de partir, et
 * l'indemnité forfaitaire de séjour. Deux conséquences quotidiennes : un
 * salarié envoyé en mission sans trace de qui l'y avait autorisé, et un per
 * diem négocié de mémoire à chaque déplacement.
 *
 * **Aucun montant n'est inventé.** `MISSION_PER_DIEM` porte les forfaits par
 * zone, en FCFA et par jour. Sans paramétrage, l'ordre de mission s'établit
 * quand même — l'autorisation vaut déjà par elle-même — mais le montant reste
 * à saisir, et l'écran le dit.
 *
 * **Le per diem n'est pas un remboursement.** Il couvre le séjour au forfait ;
 * les frais réels justifiés (transport, hébergement facturé) restent des notes
 * de frais. Les confondre revient à payer deux fois la même nuit d'hôtel.
 */

const ZONES = ['LOCALE', 'INTERIEUR', 'ETRANGER'];
const STATUTS = ['DEMANDEE', 'AUTORISEE', 'EFFECTUEE', 'SOLDEE', 'REFUSEE', 'ANNULEE'];

/** Forfaits journaliers par zone, s'ils ont été déclarés. */
function forfaits() {
    const brut = (process.env.MISSION_PER_DIEM || '').trim();
    if (!brut) return null;
    try {
        const lu = JSON.parse(brut);
        const retenus = {};
        for (const zone of ZONES) {
            const montant = parseFloat(lu[zone]);
            if (Number.isFinite(montant) && montant >= 0) retenus[zone] = montant;
        }
        return Object.keys(retenus).length ? retenus : null;
    } catch {
        console.error('[MISSION] MISSION_PER_DIEM illisible : les forfaits sont ignorés.');
        return null;
    }
}

/** Forfait d'une zone, ou null s'il n'est pas déclaré. */
function forfaitPour(zone, table = forfaits()) {
    if (!table) return null;
    const montant = table[String(zone || '').toUpperCase()];
    return Number.isFinite(montant) ? montant : null;
}

/**
 * Jours de mission, bornes comprises. Fonction pure.
 *
 * Un aller-retour dans la journée compte pour un jour, non pour zéro : c'est
 * la différence entre indemniser un déplacement et n'indemniser que les nuits.
 */
function joursDeMission(debut, fin) {
    const d = new Date(debut);
    const f = new Date(fin);
    if (Number.isNaN(d.getTime()) || Number.isNaN(f.getTime()) || f < d) return 0;
    return Math.floor((f - d) / 86400000) + 1;
}

/** Indemnité prévisible d'une mission. Fonction pure. */
function indemnite({ debut, fin, zone, perDiemJour = null }) {
    const jours = joursDeMission(debut, fin);
    const forfait = perDiemJour != null ? Number(perDiemJour) : forfaitPour(zone);
    if (forfait == null || !Number.isFinite(forfait)) {
        return { jours, perDiemJour: null, total: null, chiffrable: false };
    }
    return { jours, perDiemJour: forfait, total: Math.round(jours * forfait), chiffrable: true };
}

/**
 * Missions d'une période, avec ce qui reste à solder.
 *
 * Une mission effectuée et non soldée est de l'argent avancé que personne ne
 * réclame — c'est ce que cette vue existe pour montrer.
 */
async function registre({ depuis = null, jusqua = null } = {}) {
    const ou = {};
    if (depuis) ou.debut = { gte: new Date(depuis) };
    if (jusqua) ou.fin = { lte: new Date(jusqua) };

    const missions = await prisma.ordreMission.findMany({
        where: ou,
        orderBy: { debut: 'desc' },
        take: 300,
        include: { employee: { select: { firstName: true, lastName: true, positionTitle: true } } }
    });

    const lignes = missions.map((m) => ({
        id: m.id,
        employeeId: m.employeeId,
        nom: `${m.employee.lastName} ${m.employee.firstName}`.trim(),
        fonction: m.employee.positionTitle,
        objet: m.objet,
        destination: m.destination,
        zone: m.zone,
        debut: m.debut,
        fin: m.fin,
        jours: joursDeMission(m.debut, m.fin),
        perDiemJour: m.perDiemJour,
        montantPrevu: m.montantPrevu,
        avance: m.avance,
        statut: m.statut,
        autorisePar: m.autorisePar,
        autoriseeLe: m.autoriseeLe,
        motifRefus: m.motifRefus
    }));

    return {
        zones: ZONES,
        statuts: STATUTS,
        forfaits: forfaits(),
        lignes,
        enAttente: lignes.filter((l) => l.statut === 'DEMANDEE').length,
        // Missions terminées dont l'avance n'a pas été soldée.
        aSolder: lignes.filter((l) => l.statut === 'EFFECTUEE' && l.avance > 0),
        avanceNonSoldee: lignes
            .filter((l) => l.statut === 'EFFECTUEE')
            .reduce((s, l) => s + (l.avance || 0), 0)
    };
}

module.exports = { ZONES, STATUTS, forfaits, forfaitPour, joursDeMission, indemnite, registre };
