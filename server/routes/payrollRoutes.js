const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const auditTrail = require('../middleware/auditTrail');

// Apply Audit Trail - Crucial for financial changes
router.use(auditTrail);

// Payroll Routes
router.get('/', payrollController.getAllPayrolls);
router.post('/', payrollController.createPayroll);
router.put('/:id/status', payrollController.updatePayrollStatus);

module.exports = router;
