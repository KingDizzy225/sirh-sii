const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorshipController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, mentorshipController.getMentorships);
router.post('/request', verifyToken, mentorshipController.requestMentorship);
router.patch('/:id/status', verifyToken, mentorshipController.updateMentorshipStatus);
router.post('/sessions', verifyToken, mentorshipController.createSession);

module.exports = router;
