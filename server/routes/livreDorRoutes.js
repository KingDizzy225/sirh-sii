const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const livreDorController = require('../controllers/livreDorController');

// Livres d'or. L'écriture et la remise sont publiques (routes/publicRoutes.js).
router.get('/', requireRole(['ADMIN', 'HR']), livreDorController.lister);
router.post('/', requireRole(['ADMIN', 'HR']), livreDorController.creer);
router.get('/:id/mots', requireRole(['ADMIN', 'HR']), livreDorController.mots);
router.post('/:id/mots/:motId/masquer', requireRole(['ADMIN', 'HR']), livreDorController.masquer);
router.post('/:id/clore', requireRole(['ADMIN', 'HR']), livreDorController.clore);

module.exports = router;
