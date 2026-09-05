const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Référentiel métiers générique : pas de donnée personnelle, accessible sans session
router.get('/catalog', careerController.getCatalog);

router.get('/path/:employeeId', verifyToken, careerController.getCareerPath);
router.get('/timeline/:employeeId', verifyToken, careerController.getTimeline);

// Ajout d'un événement de carrière : réservé aux profils RH/administration
router.post('/:employeeId', verifyToken, requireRole(['ADMIN', 'HR']), careerController.addCareerEvent);

module.exports = router;
