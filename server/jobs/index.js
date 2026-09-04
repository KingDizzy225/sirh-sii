const cron = require('node-cron');
const { accrueMonthlyLeave } = require('./leaveAccrual');
const { scanDeadlines } = require('./deadlineAlerts');

/**
 * Ordonnanceur des traitements RH récurrents.
 *
 * Le plan Render met le service en veille après inactivité : une planification
 * horaire seule laisserait passer des exécutions. Chaque traitement est donc
 * aussi lancé au démarrage, et le journal ScheduledJobRun garantit qu'une
 * période déjà traitée n'est jamais rejouée. Le serveur rattrape ainsi
 * naturellement ce qu'il a manqué pendant sa veille.
 *
 * Désactivable avec DISABLE_SCHEDULED_JOBS=true (utile en développement).
 */

const TIMEZONE = process.env.JOBS_TIMEZONE || 'Africa/Abidjan';

const safely = async (label, work) => {
    try {
        await work();
    } catch (error) {
        // Un traitement en échec ne doit jamais empêcher l'API de servir
        console.error(`[JOB] Échec de ${label} :`, error.message);
    }
};

const runAllDue = async () => {
    await safely('acquisition des congés', () => accrueMonthlyLeave());
    await safely('alertes d\'échéances', () => scanDeadlines());
};

function startScheduledJobs() {
    if (process.env.DISABLE_SCHEDULED_JOBS === 'true') {
        console.log('[JOB] Traitements planifiés désactivés (DISABLE_SCHEDULED_JOBS=true).');
        return;
    }

    // Rattrapage au démarrage, légèrement différé pour ne pas ralentir le boot
    setTimeout(() => {
        runAllDue().catch(err => console.error('[JOB] Rattrapage au démarrage :', err.message));
    }, 10000);

    // Acquisition des congés : le 1er de chaque mois à 02h00
    cron.schedule('0 2 1 * *', () => {
        safely('acquisition des congés', () => accrueMonthlyLeave());
    }, { timezone: TIMEZONE });

    // Alertes d'échéances : chaque jour à 07h00
    cron.schedule('0 7 * * *', () => {
        safely('alertes d\'échéances', () => scanDeadlines());
    }, { timezone: TIMEZONE });

    console.log(`[JOB] Traitements planifiés actifs (fuseau ${TIMEZONE}).`);
}

module.exports = { startScheduledJobs, runAllDue };
