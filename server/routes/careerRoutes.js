const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const verifyToken = require('../middleware/authMiddleware');

// Référentiel métiers générique : pas de donnée personnelle, accessible sans session
router.get('/catalog', careerController.getCatalog);

router.get('/path/:employeeId', verifyToken, careerController.getCareerPath);
router.get('/timeline/:employeeId', verifyToken, careerController.getTimeline);

module.exports = router;
