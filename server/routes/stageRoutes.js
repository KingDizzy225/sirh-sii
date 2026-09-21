const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const stageController = require('../controllers/stageController');

// Stagiaires et apprentis : convention, tuteur, terme, gratification.
router.get('/', requireRole(['ADMIN', 'HR']), stageController.lister);
router.post('/:employeeId', requireRole(['ADMIN', 'HR']), stageController.enregistrer);
router.post('/:employeeId/supprimer', requireRole(['ADMIN', 'HR']), stageController.supprimer);

module.exports = router;
