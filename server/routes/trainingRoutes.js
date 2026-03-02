const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Récupérer le cahier de formation (tous les rôles connectés peuvent voir)
router.get('/', verifyToken, trainingController.getAllTrainings);

// Ajouter une nouvelle formation (réservé aux HR ou ADMIN, ou formateur)
router.post('/', verifyToken, requireRole(['HR', 'ADMIN']), trainingController.createTraining);

module.exports = router;
