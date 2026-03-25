const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getPayrolls, getMyPayrolls, runPayroll } = require('../controllers/payrollController');

// Accès administrateur / RH
router.get('/', verifyToken, getPayrolls);
router.post('/run', verifyToken, runPayroll);

// Accès collaborateur (Self-service : voir ses fiches)
router.get('/my', verifyToken, getMyPayrolls);

module.exports = router;
