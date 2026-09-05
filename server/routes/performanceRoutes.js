const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// === GOALS ===
router.get('/goals', verifyToken, performanceController.getGoals);
router.post('/goals', verifyToken, performanceController.createGoal);
router.patch('/goals/:goalId/progress', verifyToken, performanceController.updateGoalProgress);

// === REVIEWS ===
router.get('/reviews', verifyToken, performanceController.getReviews);
router.post('/reviews/self-eval', verifyToken, performanceController.submitSelfEval);

// === FEEDBACKS ===
router.get('/feedbacks', verifyToken, performanceController.getFeedbacks);
router.post('/feedbacks', verifyToken, performanceController.requestFeedback);
router.post('/feedbacks/360', verifyToken, performanceController.sendFeedback);

// Campagnes d'entretiens : lancement et suivi, réservés à la RH
router.get('/campaigns', verifyToken, requireRole(['ADMIN', 'HR']), performanceController.getCampaigns);
router.post('/campaigns', verifyToken, requireRole(['ADMIN', 'HR']), performanceController.launchCampaign);

module.exports = router;
