const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const delegueController = require('../controllers/delegueController');

// Délégués du personnel : obligation, scrutins, mandats, réunions.
router.get('/', requireRole(['ADMIN', 'HR']), delegueController.situation);
router.post('/scrutins', requireRole(['ADMIN', 'HR']), delegueController.enregistrerScrutin);
router.post('/mandats/:id/terminer', requireRole(['ADMIN', 'HR']), delegueController.terminerMandat);
router.post('/reunions', requireRole(['ADMIN', 'HR']), delegueController.enregistrerReunion);

module.exports = router;
