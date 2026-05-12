const express = require('express');
const router = express.Router();
const jobDescriptionController = require('../controllers/jobDescriptionController');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', jobDescriptionController.getJobDescriptions);
router.post('/generate', requireRole('Administrator', 'HR'), jobDescriptionController.generateJobDescription);
router.get('/:id', jobDescriptionController.getJobDescriptionById);
router.put('/:id', requireRole('Administrator', 'HR'), jobDescriptionController.updateJobDescription);
router.delete('/:id', requireRole('Administrator', 'HR'), jobDescriptionController.deleteJobDescription);

module.exports = router;
