const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', verifyToken, requireRole(['HR', 'ADMIN']), complianceController.getComplianceRules);
router.post('/', verifyToken, requireRole(['HR', 'ADMIN']), complianceController.createComplianceRule);
router.delete('/:id', verifyToken, requireRole(['HR', 'ADMIN']), complianceController.deleteComplianceRule);

module.exports = router;
