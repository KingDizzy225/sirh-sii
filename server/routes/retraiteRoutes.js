const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const retraiteController = require('../controllers/retraiteController');

// Prévision des départs à la retraite.
router.get('/', requireRole(['ADMIN', 'HR']), retraiteController.prevision);

module.exports = router;
