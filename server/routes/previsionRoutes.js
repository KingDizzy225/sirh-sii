const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const prevision = require('../lib/previsionAbsences');

// Prévision des absences par site : noms des salariés en congé compris, donc RH.
router.get('/absences', requireRole(['ADMIN', 'HR']), async (req, res) => {
    try {
        const jours = Math.min(90, Math.max(7, parseInt(req.query.jours, 10) || 42));
        res.set('Cache-Control', 'no-store');
        res.json(await prevision.prevoir(new Date(), jours));
    } catch (erreur) {
        console.error('[PRÉVISION] Calcul impossible :', erreur.message);
        res.status(500).json({ error: 'Prévision indisponible.' });
    }
});

module.exports = router;
