const prisma = require('../prismaClient');
const { runOnce, monthPeriod } = require('./runOnce');
const {
    JOURS_PAR_MOIS,
    SOLDE_MAX,
    anciennete,
    congesSupplementaires
} = require('../lib/conges');

// Les barèmes viennent de lib/conges.js, qui sert aussi au calcul du solde
// d'ouverture et au décompte de départ. Deux tables de valeurs auraient fini
// par diverger, et le salarié aurait vu un solde différent selon l'écran.
const DAYS_PER_MONTH = JOURS_PAR_MOIS;
const MAX_BALANCE = SOLDE_MAX;

/**
 * Crédite le compteur de congés de chaque salarié présent.
 *
 * Sans ce traitement, le solde n'était que décrémenté à chaque congé validé :
 * les compteurs descendaient jusqu'à zéro sans jamais se reconstituer.
 *
 * Deux crédits distincts :
 *  - l'acquisition de base, chaque mois, pour tout salarié présent ;
 *  - les congés supplémentaires d'ancienneté et pour enfants à charge, une fois
 *    l'an, le mois de l'anniversaire d'embauche. Ce sont des droits annuels :
 *    les répartir sur douze mois les aurait crédités par douzièmes à un salarié
 *    qui y a droit en une fois.
 *
 * Exclusions : salariés sortis (TERMINATED) et salariés embauchés après la fin
 * du mois traité. Le solde est plafonné pour éviter les cumuls infinis sur des
 * comptes inactifs.
 */
async function accrueMonthlyLeave(referenceDate = new Date()) {
    const period = monthPeriod(referenceDate);

    return runOnce('LEAVE_ACCRUAL', period, async () => {
        // Fin du mois traité : un salarié embauché après n'acquiert rien
        const endOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59);

        const employees = await prisma.employee.findMany({
            where: {
                status: { not: 'TERMINATED' },
                hireDate: { lte: endOfMonth }
            },
            select: {
                id: true, annualLeaveBalance: true, firstName: true,
                hireDate: true, gender: true, childrenCount: true
            }
        });

        let credited = 0;
        let capped = 0;
        let majores = 0;

        for (const employee of employees) {
            const current = employee.annualLeaveBalance || 0;
            if (current >= MAX_BALANCE) {
                capped++;
                continue;
            }

            // Anniversaire d'embauche dans le mois traité, au moins un an de
            // maison : les droits annuels supplémentaires sont dus.
            const embauche = new Date(employee.hireDate);
            const anniversaire =
                embauche.getMonth() === referenceDate.getMonth() &&
                anciennete(employee.hireDate, endOfMonth) >= 1;

            const supplement = anniversaire ? congesSupplementaires(employee, endOfMonth) : 0;

            // Arrondi au dixième : 23,4 + 2,2 + 8 valait 33,59999999999999 en
            // virgule flottante, chiffre affiché tel quel au salarié et repris
            // au centime près dans l'indemnité de congés payés du départ.
            const next = Math.round(
                Math.min(current + DAYS_PER_MONTH + supplement, MAX_BALANCE) * 10
            ) / 10;
            await prisma.employee.update({
                where: { id: employee.id },
                data: { annualLeaveBalance: next }
            });
            credited++;
            if (supplement > 0) majores++;
        }

        return `${credited} salarié(s) crédité(s) de ${DAYS_PER_MONTH} jour(s)` +
               (majores ? `, dont ${majores} avec congés supplémentaires d'anniversaire` : '') +
               (capped ? `, ${capped} au plafond de ${MAX_BALANCE} jours` : '');
    });
}

module.exports = { accrueMonthlyLeave, DAYS_PER_MONTH, MAX_BALANCE };
