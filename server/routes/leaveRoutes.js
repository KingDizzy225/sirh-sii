const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auditTrail = require('../middleware/auditTrail');
const upload = require('../middleware/uploadMiddleware');

// Apply Audit Trail
router.use(auditTrail);

// Leave Routes
router.get('/', leaveController.getAllLeaves);
router.post('/', upload.single('attachment'), leaveController.createLeave);
router.put('/:id/status', leaveController.updateLeaveStatus);

module.exports = router;
