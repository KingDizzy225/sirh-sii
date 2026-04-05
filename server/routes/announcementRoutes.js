const express = require('express');
const router = express.Router();
const c = require('../controllers/announcementController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', verifyToken, c.getAnnouncements);
router.post('/', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.createAnnouncement);
router.put('/:id', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.updateAnnouncement);
router.delete('/:id', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.deleteAnnouncement);

module.exports = router;
