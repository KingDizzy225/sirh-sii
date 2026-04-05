const express = require('express');
const router = express.Router();
const c = require('../controllers/rewardsController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/leaderboard', verifyToken, c.getLeaderboard);
router.get('/my-history', verifyToken, c.getMyHistory);
router.post('/award', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.awardPoints);

module.exports = router;
