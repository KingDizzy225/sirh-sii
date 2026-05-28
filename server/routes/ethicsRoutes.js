const express = require('express');
const router = express.Router();
const ethicsController = require('../controllers/ethicsController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Public routes (No token check)
router.post('/submit', ethicsController.submitReport);
router.get('/status/:trackingId', ethicsController.checkStatus);

// Protected routes (Admin / Compliance only - here defaulted to ADMIN/HR)
router.get('/', verifyToken, requireRole(['ADMIN', 'HR', 'Administrator', 'HR_MANAGER']), ethicsController.getReports);
router.put('/:id', verifyToken, requireRole(['ADMIN', 'HR', 'Administrator', 'HR_MANAGER']), ethicsController.updateReport);

module.exports = router;
