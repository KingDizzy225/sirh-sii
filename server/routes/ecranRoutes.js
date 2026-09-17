const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const ecranController = require('../controllers/ecranController');

// Écrans d'agence. L'affichage lui-même est public (routes/publicRoutes.js).
router.get('/', requireRole(['ADMIN', 'HR']), ecranController.lister);
router.post('/', requireRole(['ADMIN', 'HR']), ecranController.creer);
router.post('/:id/revoquer', requireRole(['ADMIN', 'HR']), ecranController.revoquer);

module.exports = router;
