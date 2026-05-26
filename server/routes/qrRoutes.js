const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const verifyToken = require('../middleware/authMiddleware');

// Route to generate a QR Code for an employee (requires authentication)
router.get('/generate/:employeeId', verifyToken, qrController.generateQRCode);

// Route to scan a QR code and clock in (public, used by the kiosk/scanner app)
router.post('/scan', qrController.clockIn);

module.exports = router;
