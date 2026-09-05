const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getPayrolls, getMyPayrolls, runPayroll, downloadPayslip, signPayroll, getPayslip, exportSage, getDeclaration } = require('../controllers/payrollController');
const requireRole = require('../middleware/roleMiddleware');
const { traceAccess, cibles } = require('../middleware/accessTrace');

// Accès administrateur / RH : la masse salariale de toute l'entreprise
router.get('/', verifyToken, requireRole(['ADMIN', 'HR']), getPayrolls);
router.post('/run', verifyToken, requireRole(['ADMIN', 'HR']), runPayroll);
router.get('/export/sage', verifyToken, requireRole(['ADMIN', 'HR']), exportSage);

// Récapitulatif de la déclaration sociale du mois, à consulter avant dépôt.
// Placée avant `/:id` : sans cela, « declaration » serait pris pour un
// identifiant de bulletin et la route ne serait jamais atteinte.
router.get('/declaration', verifyToken, requireRole(['ADMIN', 'HR']), getDeclaration);

// Accès collaborateur (Self-service : voir ses fiches)
// Les routes /:id vérifient la propriété de la fiche dans le contrôleur
router.get('/my', verifyToken, getMyPayrolls);
router.get('/:id', verifyToken, traceAccess('PAIE', cibles.parBulletin), getPayslip);
router.get('/:id/download', verifyToken, traceAccess('PAIE', cibles.parBulletin), downloadPayslip);
router.post('/:id/sign', verifyToken, signPayroll);

module.exports = router;
