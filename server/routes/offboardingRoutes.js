const express = require('express');
const router = express.Router();
const offboardingController = require('../controllers/offboardingController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/tasks', offboardingController.getOffboardingTasks);
router.post('/tasks', requireRole(['Administrator', 'HR']), offboardingController.createOffboardingTask);
router.put('/tasks/:id', requireRole(['Administrator', 'HR']), offboardingController.updateOffboardingTask);

module.exports = router;
