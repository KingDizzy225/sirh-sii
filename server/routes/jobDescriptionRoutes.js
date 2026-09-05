const express = require('express');
const router = express.Router();
const jobDescriptionController = require('../controllers/jobDescriptionController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', jobDescriptionController.getJobDescriptions);
router.post('/generate', requireRole('ADMIN', 'HR', 'Administrator', 'HR_MANAGER'), jobDescriptionController.generateJobDescription);
router.get('/:id', jobDescriptionController.getJobDescriptionById);
router.put('/:id', requireRole('ADMIN', 'HR', 'Administrator', 'HR_MANAGER'), jobDescriptionController.updateJobDescription);
router.delete('/:id', requireRole('ADMIN', 'HR', 'Administrator', 'HR_MANAGER'), jobDescriptionController.deleteJobDescription);

module.exports = router;
