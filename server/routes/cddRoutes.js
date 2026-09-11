const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const cddController = require('../controllers/cddController');

// Suivi des CDD : cumul, renouvellements, plafond. Réservé à la RH.
router.get('/', requireRole(['ADMIN', 'HR']), cddController.lister);
router.post('/:employeeId/renouveler', requireRole(['ADMIN', 'HR']), cddController.renouveler);

module.exports = router;
