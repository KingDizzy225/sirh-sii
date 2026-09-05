const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', verifyToken, surveyController.getSurveys);
router.post('/', verifyToken, requireRole(['ADMIN', 'HR']),  surveyController.createSurvey);
router.post('/response', verifyToken, surveyController.submitResponse);
router.get('/:surveyId/ai-analysis', verifyToken, surveyController.analyzeSentimentWithAi);

module.exports = router;
