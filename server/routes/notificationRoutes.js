const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, notificationController.getNotifications);
router.patch('/:notifId/read', verifyToken, notificationController.markAsRead);
router.post('/read-all', verifyToken, notificationController.markAllAsRead);

module.exports = router;
