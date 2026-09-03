const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/command', verifyToken, whatsappController.executeCommand);
router.get('/logs', verifyToken, whatsappController.getLogs);

module.exports = router;
