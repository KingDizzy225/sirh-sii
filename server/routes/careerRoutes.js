const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/path/:employeeId', verifyToken, careerController.getCareerPath);
router.get('/timeline/:employeeId', verifyToken, careerController.getTimeline);

module.exports = router;
