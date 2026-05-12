const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

router.post('/', simulationController.createSimulation);
router.get('/', simulationController.getSimulations);
router.get('/:id', simulationController.getSimulationById);
router.delete('/:id', simulationController.deleteSimulation);

router.post('/nodes', simulationController.createNode);
router.put('/nodes/:id', simulationController.updateNode);
router.delete('/nodes/:id', simulationController.deleteNode);

module.exports = router;
