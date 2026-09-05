const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');
const requireRole = require('../middleware/roleMiddleware');

router.post('/', requireRole(['ADMIN', 'HR']), simulationController.createSimulation);
router.get('/', simulationController.getSimulations);
router.get('/:id', simulationController.getSimulationById);
router.delete('/:id', requireRole(['ADMIN', 'HR']), simulationController.deleteSimulation);

router.post('/nodes', requireRole(['ADMIN', 'HR']), simulationController.createNode);
router.put('/nodes/:id', requireRole(['ADMIN', 'HR']), simulationController.updateNode);
router.delete('/nodes/:id', requireRole(['ADMIN', 'HR']), simulationController.deleteNode);

module.exports = router;
