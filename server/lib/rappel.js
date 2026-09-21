const prisma = require('../prismaClient');
const paie = require('./paie');
const remuneration = require('./remuneration');

/**
 * Rappels de salaire : ce qui était dû et n'a pas été versé.
 *
 * Une augmentation signée en juin avec effet au 1er mars ne produisait rien.
 * L'écart des trois mois écoulés était saisi à la main dans le champ
 * « prime » : un montant sans période, sans détail, que personne ne pouvait
 * refaire — ni le salarié qui le reçoit, ni l'inspection qui le contrôle.
 *
 * **Ce que le module calcule.** Pour chaque mois couvert, il reprend le
 * bulletin enregistré, remplace le seul salaire de base par celui qui aurait
 * dû s'appliquer, et refait le calcul du brut avec les mêmes heures, les mêmes
 * absences, les mêmes primes. L'écart de brut est le rappel de ce mois-là.
 * Passer par le calcul complet plutôt que par la différence des bases n'est
 * pas un luxe : les heures supplémentaires et la prime d'ancienneté sont
 * indexées sur la base, et une différence de bases les oublierait.
 *
 * **Ce qu'il ne fait pas.** Il ne recalcule pas les cotisations du mois
 * d'origine. Le rappel entre dans le brut du mois où il est versé et y est
 * cotisé au taux de ce mois-là — c'est la pratique courante, et c'est ce que
 * le bulletin dira. Si le cabinet impose un rattachement aux mois d'origine,
 * le montant reste juste mais sa ventilation fiscale devra être revue.
 *
 * **Ce qu'il refuse.** Un mois sans bulletin enregistré ne produit pas de
 * rappel : il n'y a rien à rattraper, il y a une paie à faire. Le module le
 * signale au lieu de compter zéro en silence.
 */

const MOTIF_SANS_BULLETIN = 'Aucun bulletin enregistré pour ce mois.';
const MOTIF_SANS_REFERENCE = "Aucune rémunération de référence connue à cette date.";

const cle = (d) => new Date(d).toISOString().slice(0, 7);
const arrondir = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** Premiers jours des mois couverts, bornes comprises. */
function moisCouverts(debut, fin) {
    const liste = [];
    const d = new Date(Date.UTC(new Date(debut).getUTCFullYear(), new Date(debut).getUTCMonth(), 1));
    const terme = new Date(Date.UTC(new Date(fin).getUTCFullYear(), new Date(fin).getUTCMonth(), 1));
    while (d <= terme) {
        liste.push(new Date(d));
        d.setUTCMonth(d.getUTCMonth() + 1);
    }
    return liste;
}

/**
 * Brut d'un bulletin recalculé avec une autre base. Fonction pure.
 *
 * Les éléments qui ne dépendent pas de la base — rappel antérieur, prime de
 * fin d'année, indemnité d'astreinte — sont écartés des deux calculs : ils se
 * neutraliseraient dans la différence, mais les laisser inviterait à croire
 * qu'ils sont rattrapés eux aussi.
 */
function brutAvecBase(bulletin, base, hireDate) {
    return paie.calculerPaie({
        baseSalary: base,
        bonus: bulletin.bonus,
        overtimeHours: bulletin.overtimeHours,
        heuresSupDetail: bulletin.heuresSupDetail,
        leaveDays: bulletin.leaveDays,
        deductions: 0,
        primeTransport: bulletin.primeTransport,
        avantagesNature: Array.isArray(bulletin.avantagesNatureDetail) ? bulletin.avantagesNatureDetail : [],
        hireDate,
        periode: bulletin.period
    }).grossSalary;
}

/**
 * Établit le détail d'un rappel, sans rien enregistrer.
 * @returns {Promise<{lignes: Array, total: number, manques: Array}>}
 */
async function calculer({ employeeId, dateEffet, jusqua = new Date() }) {
    const salarie = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true, firstName: true, lastName: true, hireDate: true }
    });
    if (!salarie) throw new Error('Salarié introuvable.');

    const mois = moisCouverts(dateEffet, jusqua);
    const bulletins = await prisma.payroll.findMany({
        where: { employeeId, period: { gte: mois[0], lte: mois[mois.length - 1] } },
        orderBy: { period: 'asc' }
    });
    const parPeriode = new Map(bulletins.map((b) => [cle(b.period), b]));

    const lignes = [];
    const manques = [];

    for (const m of mois) {
        const periode = cle(m);
        const bulletin = parPeriode.get(periode);
        if (!bulletin) {
            manques.push({ periode, motif: MOTIF_SANS_BULLETIN });
            continue;
        }
        const due = await remuneration.salaireA(employeeId, m);
        if (due.montant == null) {
            manques.push({ periode, motif: MOTIF_SANS_REFERENCE });
            continue;
        }

        const verse = bulletin.baseSalary;
        const brutVerse = brutAvecBase(bulletin, verse, salarie.hireDate);
        const brutDu = brutAvecBase(bulletin, due.montant, salarie.hireDate);
        const ecart = arrondir(brutDu - brutVerse);

        lignes.push({
            periode,
            baseVersee: arrondir(verse),
            baseDue: arrondir(due.montant),
            brutVerse: arrondir(brutVerse),
            brutDu: arrondir(brutDu),
            ecart
        });
    }

    const retenues = lignes.filter((l) => l.ecart > 0);
    return {
        employeeId,
        nom: `${salarie.lastName} ${salarie.firstName}`.trim(),
        // Seuls les écarts positifs constituent un rappel : un trop-perçu se
        // récupère par une procédure distincte, avec l'accord du salarié, et
        // ne se compense pas au détour d'une régularisation.
        lignes: retenues,
        ignorees: lignes.filter((l) => l.ecart <= 0),
        total: arrondir(retenues.reduce((s, l) => s + l.ecart, 0)),
        manques
    };
}

/** Enregistre un rappel à verser. */
async function enregistrer({ employeeId, motif, dateEffet, jusqua, creePar }) {
    const detail = await calculer({ employeeId, dateEffet, jusqua });
    if (detail.total <= 0) {
        const raison = detail.manques.length
            ? "Aucun écart à rattraper sur les mois disposant d'un bulletin."
            : 'Aucun écart à rattraper sur la période.';
        throw Object.assign(new Error(raison), { statut: 409, manques: detail.manques });
    }
    const mois = detail.lignes.map((l) => l.periode);
    return prisma.rappelSalaire.create({
        data: {
            employeeId,
            motif: String(motif || 'Régularisation de rémunération'),
            dateEffet: new Date(dateEffet),
            periodeDebut: new Date(`${mois[0]}-01T00:00:00.000Z`),
            periodeFin: new Date(`${mois[mois.length - 1]}-01T00:00:00.000Z`),
            lignes: detail.lignes,
            total: detail.total,
            creePar: creePar || null
        }
    });
}

/** Rappels à porter sur la paie d'une période, pour un salarié. */
async function aVerser(employeeId, payrollId = null) {
    return prisma.rappelSalaire.findMany({
        where: {
            employeeId,
            OR: [
                { statut: 'A_VERSER' },
                // Une paie relancée sur la même période doit reporter le rappel
                // qu'elle portait déjà : sans cela, il disparaîtrait du bulletin
                // rectifié sans jamais être versé.
                ...(payrollId ? [{ statut: 'VERSE', payrollId }] : [])
            ]
        },
        orderBy: { creeLe: 'asc' }
    });
}

module.exports = { moisCouverts, brutAvecBase, calculer, enregistrer, aVerser, MOTIF_SANS_BULLETIN };
