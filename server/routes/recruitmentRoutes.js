const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');

// Job Offers Routes
router.get('/jobs', recruitmentController.getAllJobOffers);
router.post('/jobs', recruitmentController.createJobOffer);
router.put('/jobs/:id/status', recruitmentController.updateJobOfferStatus);

// Applicants Routes
router.get('/applicants', recruitmentController.getAllApplicants);
router.post('/applicants', recruitmentController.createApplicant);
router.put('/applicants/:id/status', recruitmentController.updateApplicantStatus);

module.exports = router;
