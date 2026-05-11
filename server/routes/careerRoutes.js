const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { authenticateToken } = require('../middleware/auth');

router.get('/path/:employeeId', authenticateToken, careerController.getCareerPath);
router.get('/timeline/:employeeId', authenticateToken, careerController.getTimeline);

module.exports = router;
