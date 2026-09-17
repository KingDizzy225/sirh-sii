const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const emargementController = require('../controllers/emargementController');

// Émargement des formations. L'écran projeté et le scan sont publics
// (routes/publicRoutes.js).
router.get('/', requireRole(['ADMIN', 'HR']), emargementController.lister);
router.post('/:sessionId/ouvrir', requireRole(['ADMIN', 'HR']), emargementController.ouvrir);
router.post('/:sessionId/fermer', requireRole(['ADMIN', 'HR']), emargementController.fermer);
router.get('/:sessionId/csv', requireRole(['ADMIN', 'HR']), emargementController.csv);
router.get('/:sessionId', requireRole(['ADMIN', 'HR']), emargementController.feuille);

module.exports = router;
