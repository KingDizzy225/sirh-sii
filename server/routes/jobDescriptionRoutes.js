const express = require('express');
const router = express.Router();
const jobDescriptionController = require('../controllers/jobDescriptionController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', jobDescriptionController.getJobDescriptions);
router.post('/generate', requireRole('ADMIN', 'HR', 'Administrator', 'HR_MANAGER'), jobDescriptionController.generateJobDescription);
// Fiche de poste à la trame de l'entreprise. Routes nommées avant `/:id`.
const RH = ['ADMIN', 'HR', 'Administrator', 'HR_MANAGER'];
router.post('/proposer', requireRole(RH), jobDescriptionController.proposerFiche);
router.post('/fiche', requireRole(RH), jobDescriptionController.enregistrerFiche);

router.get('/:id', jobDescriptionController.getJobDescriptionById);
router.get('/:id/pdf', jobDescriptionController.telechargerFiche);
router.put('/:id/fiche', requireRole(RH), jobDescriptionController.enregistrerFiche);
router.put('/:id', requireRole('ADMIN', 'HR', 'Administrator', 'HR_MANAGER'), jobDescriptionController.updateJobDescription);
router.delete('/:id', requireRole('ADMIN', 'HR', 'Administrator', 'HR_MANAGER'), jobDescriptionController.deleteJobDescription);

module.exports = router;
