const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const retrospectiveController = require('../controllers/retrospectiveController');

// « Mon année chez SII ». L'ouverture par le salarié est publique (routes/publicRoutes.js).
router.get('/', requireRole(['ADMIN', 'HR']), retrospectiveController.lister);
router.post('/generer', requireRole(['ADMIN', 'HR']), retrospectiveController.generer);
router.post('/:id/revoquer', requireRole(['ADMIN', 'HR']), retrospectiveController.revoquer);

module.exports = router;
