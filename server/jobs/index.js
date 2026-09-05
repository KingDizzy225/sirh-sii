const cron = require('node-cron');
const { accrueMonthlyLeave } = require('./leaveAccrual');
const { scanDeadlines } = require('./deadlineAlerts');
const { relancerDemandesEnAttente } = require('./pendingReminders');
const { detecterAnomaliesPointage } = require('./timeLogAnomalies');
const { celebrerLeJour } = require('./celebrations');
const { envoyerRecapHebdomadaire } = require('./weeklyDigest');

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
    await safely('relance des demandes en attente', () => relancerDemandesEnAttente());
    await safely('anomalies de pointage', () => detecterAnomaliesPointage());
    await safely('célébrations du jour', () => celebrerLeJour());
    await safely('récapitulatif hebdomadaire', () => envoyerRecapHebdomadaire());
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

    // Relance des demandes sans réponse : chaque jour à 08h00, à l'arrivée
    cron.schedule('0 8 * * *', () => {
        safely('relance des demandes en attente', () => relancerDemandesEnAttente());
    }, { timezone: TIMEZONE });

    // Anomalies de pointage : chaque jour à 06h00, la veille étant close
    cron.schedule('0 6 * * *', () => {
        safely('anomalies de pointage', () => detecterAnomaliesPointage());
    }, { timezone: TIMEZONE });

    // Célébrations : chaque jour à 07h30, pour que l'annonce soit là à l'arrivée
    cron.schedule('30 7 * * *', () => {
        safely('célébrations du jour', () => celebrerLeJour());
    }, { timezone: TIMEZONE });

    // Récapitulatif hebdomadaire : lundi 08h00, pour ouvrir la semaine
    cron.schedule('0 8 * * 1', () => {
        safely('récapitulatif hebdomadaire', () => envoyerRecapHebdomadaire());
    }, { timezone: TIMEZONE });

    console.log(`[JOB] Traitements planifiés actifs (fuseau ${TIMEZONE}).`);
}

module.exports = { startScheduledJobs, runAllDue };
