const prisma = require('../prismaClient');
const { runOnce, monthPeriod } = require('./runOnce');

// Acquisition légale ivoirienne : 2,2 jours ouvrables par mois de travail
// effectif, soit 26,4 jours par an (Code du travail, art. 25.1).
// Ajustable sans redéploiement via les variables d'environnement.
const DAYS_PER_MONTH = parseFloat(process.env.LEAVE_ACCRUAL_DAYS_PER_MONTH || '2.2');
const MAX_BALANCE = parseFloat(process.env.LEAVE_MAX_BALANCE || '60');

/**
 * Crédite le compteur de congés de chaque salarié présent.
 *
 * Sans ce traitement, le solde n'était que décrémenté à chaque congé validé :
 * les compteurs descendaient jusqu'à zéro sans jamais se reconstituer.
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
            select: { id: true, annualLeaveBalance: true, firstName: true }
        });

        let credited = 0;
        let capped = 0;

        for (const employee of employees) {
            const current = employee.annualLeaveBalance || 0;
            if (current >= MAX_BALANCE) {
                capped++;
                continue;
            }
            const next = Math.min(current + DAYS_PER_MONTH, MAX_BALANCE);
            await prisma.employee.update({
                where: { id: employee.id },
                data: { annualLeaveBalance: next }
            });
            credited++;
        }

        return `${credited} salarié(s) crédité(s) de ${DAYS_PER_MONTH} jour(s)` +
               (capped ? `, ${capped} au plafond de ${MAX_BALANCE} jours` : '');
    });
}

module.exports = { accrueMonthlyLeave, DAYS_PER_MONTH, MAX_BALANCE };
