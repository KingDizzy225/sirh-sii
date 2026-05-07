const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/:employeeId', protect, careerController.getEmployeeHistory);
router.post('/:employeeId', protect, requireRole(['HR', 'ADMIN']), careerController.addHistoryEvent);

module.exports = router;
