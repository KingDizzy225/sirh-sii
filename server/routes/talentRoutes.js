const express = require('express');
const router = express.Router();
const talentController = require('../controllers/talentController');
const auditTrail = require('../middleware/auditTrail');
const requireRole = require('../middleware/roleMiddleware');

// Middleware for audit logging
router.use(auditTrail);

// Talent Management Routes
router.get('/', talentController.getTalentProfiles);
router.put('/:id', requireRole(['ADMIN', 'HR']), talentController.updateTalentProfile);

module.exports = router;
