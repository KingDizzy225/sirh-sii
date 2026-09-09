const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const verifyToken = require('../middleware/authMiddleware');
const { runAllDue } = require('../jobs');
const requireRole = require('../middleware/roleMiddleware');

/**
 * Suivi des traitements RH récurrents.
 * Un traitement de fond invisible est un traitement invérifiable : cet
 * historique permet de confirmer que l'acquisition des congés et les alertes
 * d'échéances ont bien tourné, et quand.
 */
router.get('/status', verifyToken, requireRole(['ADMIN', 'HR']), async (req, res) => {
    try {
        const runs = await prisma.scheduledJobRun.findMany({
            orderBy: { runAt: 'desc' },
            take: 20
        });
        res.json({
            planificationActive: process.env.DISABLE_SCHEDULED_JOBS !== 'true',
            acquisitionParMois: parseFloat(process.env.LEAVE_ACCRUAL_DAYS_PER_MONTH || '2.2'),
            executions: runs
        });
    } catch (error) {
        console.error('Error fetching job status:', error);
        res.status(500).json({ error: "Erreur lors de la lecture des traitements planifiés." });
    }
});

/** Déclenchement manuel — sans effet si la période a déjà été traitée. */
router.post('/run', verifyToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        await runAllDue();
        const runs = await prisma.scheduledJobRun.findMany({
            orderBy: { runAt: 'desc' },
            take: 5
        });
        res.json({ message: 'Traitements exécutés.', executions: runs });
    } catch (error) {
        console.error('Error running jobs:', error);
        res.status(500).json({ error: "Erreur lors de l'exécution des traitements." });
    }
});

/**
 * Diagnostic de l'IA. Placé ici, auprès du suivi des traitements : c'est la
 * même question d'exploitation — « qu'est-ce qui tourne, et qu'est-ce qui ne
 * tourne pas ».
 */
router.get('/ia', verifyToken, requireRole(['ADMIN', 'HR']), async (req, res) => {
    const { diagnostiquer } = require('../lib/claudeAI');
    res.json(await diagnostiquer());
});

/**
 * État des services extérieurs.
 *
 * Le diagnostic de l'IA existait, derrière une adresse qui exige un jeton :
 * la coller dans un navigateur répond « Token non fourni ». Il était donc
 * inatteignable sans outils de développement. Cet état est consultable depuis
 * l'écran des paramètres.
 *
 * `?tester=true` interroge réellement l'IA — ce qui consomme un appel, et n'est
 * donc pas fait à chaque ouverture de l'écran.
 */
router.get('/etat-services', verifyToken, requireRole(['ADMIN', 'HR']), async (req, res) => {
    try {
        const { etat } = require('../lib/etatServices');
        res.json(await etat({ testerIA: req.query.tester === 'true' }));
    } catch (error) {
        console.error('Erreur état des services :', error);
        res.status(500).json({ error: "Erreur lors de la lecture de l'état des services." });
    }
});

module.exports = router;
