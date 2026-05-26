const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getPayrolls, getMyPayrolls, runPayroll, downloadPayslip, signPayroll, getPayslip } = require('../controllers/payrollController');

// Accès administrateur / RH
router.get('/', verifyToken, getPayrolls);
router.post('/run', verifyToken, runPayroll);

// Accès collaborateur (Self-service : voir ses fiches)
router.get('/my', verifyToken, getMyPayrolls);
router.get('/:id', verifyToken, getPayslip);
router.get('/:id/download', verifyToken, downloadPayslip);
router.post('/:id/sign', verifyToken, signPayroll);

module.exports = router;
