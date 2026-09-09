const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auditTrail = require('../middleware/auditTrail');
const upload = require('../middleware/uploadMiddleware');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Apply Audit Trail
router.use(auditTrail);

// Public Route (Self-Service sans connexion)
router.post('/public', upload.single('attachment'), leaveController.createPublicLeave);

// Leave Routes (Protected)
// Aperçu avant demande : ce que le congé coûtera, et qui sera absent en même
// temps. Déclaré avant les routes à paramètre.
router.get('/apercu', verifyToken, leaveController.apercu);

router.get('/', verifyToken, leaveController.getAllLeaves);
router.post('/', verifyToken, upload.single('attachment'), leaveController.createLeave);
router.put('/:id/status', verifyToken, requireRole(['ADMIN', 'HR', 'MANAGER']),  leaveController.updateLeaveStatus);

module.exports = router;
