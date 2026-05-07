const express = require('express');
const router = express.Router();
const disciplinaryController = require('../controllers/disciplinaryController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/:employeeId', protect, disciplinaryController.getEmployeeRecords);
router.post('/:employeeId', protect, requireRole(['HR', 'ADMIN']), disciplinaryController.addRecord);

module.exports = router;
