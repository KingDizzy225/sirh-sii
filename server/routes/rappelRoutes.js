const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const rappelController = require('../controllers/rappelController');

// Rappels de salaire : régularisation des mois écoulés.
router.get('/', requireRole(['ADMIN', 'HR']), rappelController.lister);
router.get('/simulation/:employeeId', requireRole(['ADMIN', 'HR']), rappelController.simuler);
router.post('/:employeeId', requireRole(['ADMIN', 'HR']), rappelController.enregistrer);
router.post('/:id/annuler', requireRole(['ADMIN', 'HR']), rappelController.annuler);

module.exports = router;
