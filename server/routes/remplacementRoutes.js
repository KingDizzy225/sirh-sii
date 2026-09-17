const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const remplacementController = require('../controllers/remplacementController');

// Validation des remplacements. La proposition et la reprise passent par le badge
// du salarié (routes/publicRoutes.js).
router.get('/', requireRole(['ADMIN', 'HR', 'MANAGER']), remplacementController.lister);
router.post('/:id/valider', requireRole(['ADMIN', 'HR', 'MANAGER']), remplacementController.valider);
router.post('/:id/refuser', requireRole(['ADMIN', 'HR', 'MANAGER']), remplacementController.refuser);

module.exports = router;
