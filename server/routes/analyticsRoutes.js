const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Accessible par HR, Admin et Manager (pour la vue synthétique)
router.get('/dashboard', verifyToken, requireRole('HR', 'ADMIN', 'MANAGER'), analyticsController.getDashboardAnalytics);

module.exports = router;
