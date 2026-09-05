const express = require('express');
const router = express.Router();
const disciplinaryController = require('../controllers/disciplinaryController');
// authMiddleware exporte la fonction directement : l'ancien `{ protect }`
// valait undefined et aurait fait échouer le montage des routes.
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { traceAccess, cibles } = require('../middleware/accessTrace');

// Données disciplinaires : sensibles, réservées à la RH et à l'administration
router.get('/:employeeId', verifyToken, requireRole(['ADMIN', 'HR']), traceAccess('DISCIPLINAIRE', cibles.parParam()), disciplinaryController.getEmployeeRecords);
router.post('/:employeeId', verifyToken, requireRole(['ADMIN', 'HR']), disciplinaryController.addRecord);

module.exports = router;
