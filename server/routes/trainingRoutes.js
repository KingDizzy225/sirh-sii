const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Récupérer le cahier de formation (tous les rôles connectés peuvent voir)
router.get('/', verifyToken, trainingController.getAllTrainings);

// Ajouter une nouvelle formation (réservé aux HR ou ADMIN, ou formateur)
router.post('/', verifyToken, requireRole(['HR', 'ADMIN']), trainingController.createTraining);

// Générer une formation par IA
router.post('/generate', verifyToken, requireRole(['HR', 'ADMIN']), trainingController.generateAITraining);

// S'inscrire à une formation existante (LMS)
router.post('/enroll', verifyToken, trainingController.enrollInTraining);

// Modules du cours
router.post('/:sessionId/modules', verifyToken, requireRole(['HR', 'ADMIN']), trainingController.createModule);
router.delete('/modules/:moduleId', verifyToken, requireRole(['HR', 'ADMIN']), trainingController.deleteModule);

// Validation d'un module par un employé
router.post('/progress', verifyToken, trainingController.markProgressCompleted);

module.exports = router;
