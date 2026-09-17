const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const preAccueilController = require('../controllers/preAccueilController');

// Pré-accueil des futurs salariés. La page d'accueil et le dépôt de pièces sont
// publics (routes/publicRoutes.js).
router.get('/', requireRole(['ADMIN', 'HR']), preAccueilController.lister);
router.post('/:employeeId', requireRole(['ADMIN', 'HR']), preAccueilController.enregistrer);
router.post('/:employeeId/supprimer', requireRole(['ADMIN', 'HR']), preAccueilController.supprimer);

module.exports = router;
