const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const bilanSocialController = require('../controllers/bilanSocialController');

// Bilan social annuel.
router.get('/', requireRole(['ADMIN', 'HR']), bilanSocialController.produire);

module.exports = router;
