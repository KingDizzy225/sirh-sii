const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const primeAnnuelleController = require('../controllers/primeAnnuelleController');

// Prime de fin d'année : provision toute l'année, arrêté en fin d'exercice.
router.get('/', requireRole(['ADMIN', 'HR']), primeAnnuelleController.provision);
router.post('/arreter', requireRole(['ADMIN', 'HR']), primeAnnuelleController.arreter);
router.post('/:id/annuler', requireRole(['ADMIN', 'HR']), primeAnnuelleController.annuler);

module.exports = router;
