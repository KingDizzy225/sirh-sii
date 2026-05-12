const express = require('express');
const router = express.Router();
const jobDescriptionController = require('../controllers/jobDescriptionController');

router.get('/', jobDescriptionController.getJobDescriptions);
router.post('/generate', jobDescriptionController.generateJobDescription);
router.get('/:id', jobDescriptionController.getJobDescriptionById);
router.put('/:id', jobDescriptionController.updateJobDescription);
router.delete('/:id', jobDescriptionController.deleteJobDescription);

module.exports = router;
