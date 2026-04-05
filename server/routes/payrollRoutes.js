const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getPayrolls, getMyPayrolls, runPayroll, downloadPayslip } = require('../controllers/payrollController');

// Accès administrateur / RH
router.get('/', verifyToken, getPayrolls);
router.post('/run', verifyToken, runPayroll);

// Accès collaborateur (Self-service : voir ses fiches)
router.get('/my', verifyToken, getMyPayrolls);
router.get('/:id/download', verifyToken, downloadPayslip);

module.exports = router;
