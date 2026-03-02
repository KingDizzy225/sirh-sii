const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auditTrail = require('../middleware/auditTrail');

// Apply Audit Trail
router.use(auditTrail);

// Leave Routes
router.get('/', leaveController.getAllLeaves);
router.post('/', leaveController.createLeave);
router.put('/:id/status', leaveController.updateLeaveStatus);

module.exports = router;
