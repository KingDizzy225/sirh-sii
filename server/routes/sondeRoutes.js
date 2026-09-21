const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const prisma = require('../prismaClient');
const sonde = require('../lib/sonde');

/**
 * Sonde de bout en bout. Réservée à l'administration : un passage consomme un
 * appel d'IA et peut envoyer un courriel de contrôle.
 */
router.get('/', requireRole(['ADMIN', 'HR']), async (req, res) => {
    try {
        const executions = await prisma.executionSonde.findMany({ orderBy: { lanceeLe: 'desc' }, take: 20 });
        res.json({
            derniere: executions[0] || null,
            historique: executions.map((e) => ({ id: e.id, lanceeLe: e.lanceeLe, ok: e.ok, echecs: e.echecs, dureeMs: e.dureeMs }))
        });
    } catch (erreur) {
        console.error('[SONDE] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Comptes rendus indisponibles.' });
    }
});

router.post('/', requireRole(['ADMIN']), async (req, res) => {
    try {
        res.json(await sonde.executer({ declenchePar: req.user?.name || req.user?.email || 'administrateur' }));
    } catch (erreur) {
        console.error('[SONDE] Exécution impossible :', erreur.message);
        res.status(500).json({ error: 'La sonde n\'a pas pu s\'exécuter.' });
    }
});

module.exports = router;
