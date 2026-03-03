const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const verifyToken = require('../middleware/authMiddleware');

// === GOALS ===
router.get('/goals', verifyToken, performanceController.getGoals);
router.post('/goals', verifyToken, performanceController.createGoal);
router.patch('/goals/:goalId/progress', verifyToken, performanceController.updateGoalProgress);

// === REVIEWS ===
router.get('/reviews', verifyToken, performanceController.getReviews);
router.post('/reviews/self-eval', verifyToken, performanceController.submitSelfEval);

module.exports = router;
