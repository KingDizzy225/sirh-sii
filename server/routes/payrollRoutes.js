const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getPayrolls, getMyPayrolls, runPayroll, downloadPayslip, signPayroll, getPayslip, getExplication, getPrimeAnciennete, exportSage, getDeclaration, getCloture, cloturer, reouvrir, getPreparation } = require('../controllers/payrollController');
const requireRole = require('../middleware/roleMiddleware');
const { traceAccess, cibles } = require('../middleware/accessTrace');

// Accès administrateur / RH : la masse salariale de toute l'entreprise
router.get('/', verifyToken, requireRole(['ADMIN', 'HR']), getPayrolls);
router.post('/run', verifyToken, requireRole(['ADMIN', 'HR']), runPayroll);
router.get('/export/sage', verifyToken, requireRole(['ADMIN', 'HR']), exportSage);

// Ce que la prime d'ancienneté coûterait si elle était activée. Déclaré avec
// les routes fixes : placé après /:id, il serait pris pour un identifiant.
router.get('/prime-anciennete', verifyToken, requireRole(['ADMIN', 'HR']), getPrimeAnciennete);

// Récapitulatif de la déclaration sociale du mois, à consulter avant dépôt.
// Placée avant `/:id` : sans cela, « declaration » serait pris pour un
// identifiant de bulletin et la route ne serait jamais atteinte.
router.get('/declaration', verifyToken, requireRole(['ADMIN', 'HR']), getDeclaration);

// Clôture mensuelle : un mois clôturé ne se relance plus. La réouverture, qui
// ouvre la voie au bulletin rectificatif, est réservée à l'administration.
router.get('/cloture', verifyToken, requireRole(['ADMIN', 'HR']), getCloture);
// Éléments variables proposés : congés sans solde, heures sup. ventilées, prêts.
router.get('/preparation', verifyToken, requireRole(['ADMIN', 'HR']), getPreparation);
router.post('/cloture', verifyToken, requireRole(['ADMIN', 'HR']), cloturer);
router.post('/cloture/reouvrir', verifyToken, requireRole(['ADMIN']), reouvrir);

// Accès collaborateur (Self-service : voir ses fiches)
// Les routes /:id vérifient la propriété de la fiche dans le contrôleur
router.get('/my', verifyToken, getMyPayrolls);
router.get('/:id', verifyToken, traceAccess('PAIE', cibles.parBulletin), getPayslip);
router.get('/:id/download', verifyToken, traceAccess('PAIE', cibles.parBulletin), downloadPayslip);
// Le bulletin expliqué : même contrôle d'accès que le bulletin lui-même.
router.get('/:id/explication', verifyToken, traceAccess('PAIE', cibles.parBulletin), getExplication);
router.post('/:id/sign', verifyToken, signPayroll);

module.exports = router;
