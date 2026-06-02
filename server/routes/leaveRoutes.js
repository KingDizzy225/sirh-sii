const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auditTrail = require('../middleware/auditTrail');
const upload = require('../middleware/uploadMiddleware');
const verifyToken = require('../middleware/authMiddleware');

// Apply Audit Trail
router.use(auditTrail);

// Public Route (Self-Service sans connexion)
router.post('/public', upload.single('attachment'), leaveController.createPublicLeave);

// Leave Routes (Protected)
router.get('/', verifyToken, leaveController.getAllLeaves);
router.post('/', verifyToken, upload.single('attachment'), leaveController.createLeave);
router.put('/:id/status', verifyToken, leaveController.updateLeaveStatus);

module.exports = router;
