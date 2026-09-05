const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');
const requireRole = require('../middleware/roleMiddleware');

// Jobs
router.get('/jobs', recruitmentController.getAllJobOffers);
router.post('/jobs', requireRole(['ADMIN', 'HR']), recruitmentController.createJobOffer);
router.put('/jobs/:id/status', requireRole(['ADMIN', 'HR']), recruitmentController.updateJobOfferStatus);

// Applicants
router.get('/applicants', recruitmentController.getAllApplicants);
router.post('/applicants', requireRole(['ADMIN', 'HR']), recruitmentController.createApplicant);
router.put('/applicants/:id/status', requireRole(['ADMIN', 'HR']), recruitmentController.updateApplicantStatus);

// AI
const aiSourcingController = require('../controllers/aiSourcingController');
router.post('/applicants/:id/ai-match', requireRole(['ADMIN', 'HR']), recruitmentController.analyzeCandidateWithAI);
router.post('/ai-source', requireRole(['ADMIN', 'HR']), aiSourcingController.analyzeCandidates);

// Public API
router.post('/public-apply', recruitmentController.uploadCV.single('resume'), recruitmentController.publicApply);

module.exports = router;
