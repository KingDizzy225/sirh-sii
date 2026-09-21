const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const grilleController = require('../controllers/grilleController');

// Grille conventionnelle : minima opposables et affectation des salariés.
router.get('/', requireRole(['ADMIN', 'HR']), grilleController.lister);
router.post('/', requireRole(['ADMIN', 'HR']), grilleController.enregistrer);
router.post('/:id/retirer', requireRole(['ADMIN', 'HR']), grilleController.retirer);
router.post('/affecter/:employeeId', requireRole(['ADMIN', 'HR']), grilleController.affecter);

module.exports = router;
