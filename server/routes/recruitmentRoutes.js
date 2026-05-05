const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');

// Jobs
router.get('/jobs', recruitmentController.getAllJobOffers);
router.post('/jobs', recruitmentController.createJobOffer);
router.put('/jobs/:id/status', recruitmentController.updateJobOfferStatus);

// Applicants
router.get('/applicants', recruitmentController.getAllApplicants);
router.post('/applicants', recruitmentController.createApplicant);
router.put('/applicants/:id/status', recruitmentController.updateApplicantStatus);

// AI
router.post('/applicants/:id/ai-match', recruitmentController.analyzeCandidateWithAI);

module.exports = router;
