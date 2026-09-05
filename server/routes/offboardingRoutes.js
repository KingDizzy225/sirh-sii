const express = require('express');
const router = express.Router();
const offboardingController = require('../controllers/offboardingController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/tasks', offboardingController.getOffboardingTasks);
router.post('/tasks', requireRole(['Administrator', 'HR']), offboardingController.createOffboardingTask);
router.put('/tasks/:id', requireRole(['Administrator', 'HR']), offboardingController.updateOffboardingTask);

// Projet de décompte final : réservé à la RH et à l'administration
router.get('/settlement/:employeeId', requireRole(['Administrator', 'HR', 'ADMIN']), offboardingController.getFinalSettlement);

module.exports = router;
