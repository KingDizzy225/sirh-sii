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

// Entretien de sortie : recueil et synthèse des motifs de départ
const RH = ['Administrator', 'HR', 'ADMIN'];
router.get('/exit-interview/options', requireRole(RH), offboardingController.getExitInterviewOptions);
router.get('/exit-insights', requireRole(RH), offboardingController.getExitInsights);
router.post('/exit-interview/:employeeId', requireRole(RH), offboardingController.saveExitInterview);

module.exports = router;
