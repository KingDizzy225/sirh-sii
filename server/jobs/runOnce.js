const prisma = require('../prismaClient');

/**
 * Exécute un traitement une seule fois par période, même si le serveur
 * redémarre plusieurs fois (cas courant sur Render, où le service s'endort).
 *
 * L'unicité est garantie par la contrainte (jobName, period) en base : deux
 * instances qui démarreraient simultanément ne peuvent pas appliquer deux fois
 * le même traitement — la seconde reçoit une erreur d'unicité et s'arrête.
 *
 * @param {string} jobName  identifiant du traitement, ex. 'LEAVE_ACCRUAL'
 * @param {string} period   période traitée, ex. '2026-09' ou '2026-09-04'
 * @param {Function} work   fonction async retournant un résumé lisible
 * @returns {Promise<{skipped: boolean, details?: string}>}
 */
async function runOnce(jobName, period, work) {
    const already = await prisma.scheduledJobRun.findUnique({
        where: { jobName_period: { jobName, period } }
    });
    if (already) return { skipped: true };

    // On réserve la période avant d'agir : si deux instances démarrent en même
    // temps, une seule passe cette étape.
    try {
        await prisma.scheduledJobRun.create({ data: { jobName, period } });
    } catch (error) {
        if (error.code === 'P2002') return { skipped: true }; // déjà réservé ailleurs
        throw error;
    }

    try {
        const details = await work();
        await prisma.scheduledJobRun.update({
            where: { jobName_period: { jobName, period } },
            data: { details: String(details || '').slice(0, 500) }
        });
        console.log(`[JOB] ${jobName} ${period} : ${details}`);
        return { skipped: false, details };
    } catch (error) {
        // En cas d'échec, on libère la période pour permettre un nouvel essai
        await prisma.scheduledJobRun.delete({
            where: { jobName_period: { jobName, period } }
        }).catch(() => {});
        throw error;
    }
}

/** Période mensuelle au format YYYY-MM. */
const monthPeriod = (date = new Date()) => date.toISOString().slice(0, 7);

/** Période quotidienne au format YYYY-MM-DD. */
const dayPeriod = (date = new Date()) => date.toISOString().slice(0, 10);

module.exports = { runOnce, monthPeriod, dayPeriod };
