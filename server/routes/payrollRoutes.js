const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { getPayrolls, getMyPayrolls, runPayroll, downloadPayslip, signPayroll, getPayslip, exportSage } = require('../controllers/payrollController');

// Accès administrateur / RH : la masse salariale de toute l'entreprise
router.get('/', verifyToken, requireRole(['ADMIN', 'HR']), getPayrolls);
router.post('/run', verifyToken, requireRole(['ADMIN', 'HR']), runPayroll);
router.get('/export/sage', verifyToken, requireRole(['ADMIN', 'HR']), exportSage);

// Accès collaborateur (Self-service : voir ses fiches)
// Les routes /:id vérifient la propriété de la fiche dans le contrôleur
router.get('/my', verifyToken, getMyPayrolls);
router.get('/:id', verifyToken, getPayslip);
router.get('/:id/download', verifyToken, downloadPayslip);
router.post('/:id/sign', verifyToken, signPayroll);

module.exports = router;
