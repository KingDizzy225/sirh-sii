const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const missionController = require('../controllers/missionController');

// Les responsables demandent et consultent ; autoriser et solder engagent
// l'entreprise et restent aux RH.
router.get('/', requireRole(['ADMIN', 'HR', 'MANAGER']), missionController.lister);
router.post('/', requireRole(['ADMIN', 'HR', 'MANAGER']), missionController.demander);
router.post('/:id/decider', requireRole(['ADMIN', 'HR']), missionController.decider);
router.post('/:id/cloturer', requireRole(['ADMIN', 'HR']), missionController.cloturer);

module.exports = router;
