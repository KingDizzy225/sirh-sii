const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Define specific routes first
router.get('/stats', dashboardController.getStats);

module.exports = router;
