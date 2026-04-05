const express = require('express');
const router = express.Router();
const talentController = require('../controllers/talentController');
const auditTrail = require('../middleware/auditTrail');

// Middleware for audit logging
router.use(auditTrail);

// Talent Management Routes
router.get('/', talentController.getTalentProfiles);
router.put('/:id', talentController.updateTalentProfile);

module.exports = router;
