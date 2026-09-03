const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, surveyController.getSurveys);
router.post('/', verifyToken, surveyController.createSurvey);
router.post('/response', verifyToken, surveyController.submitResponse);
router.get('/:surveyId/ai-analysis', verifyToken, surveyController.analyzeSentimentWithAi);

module.exports = router;
