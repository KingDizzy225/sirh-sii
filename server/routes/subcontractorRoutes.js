const express = require('express');
const router = express.Router();
const subcontractorController = require('../controllers/subcontractorController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
// Only HR / Admin for managing external workforce
router.use(requireRole(['Administrator', 'HR']));

// Routes nommées avant `/:id` : « conformite » et « pieces » ne doivent pas
// être pris pour des identifiants de prestataire.
router.get('/conformite', subcontractorController.getConformite);
router.get('/pieces', subcontractorController.getPieces);

router.get('/', subcontractorController.getSubcontractors);
router.post('/', requireRole(['ADMIN', 'HR']), subcontractorController.createSubcontractor);
router.put('/:id', requireRole(['ADMIN', 'HR']), subcontractorController.updateSubcontractor);

// Pièces justificatives du prestataire
router.get('/:id/documents', subcontractorController.getDocuments);
router.post('/:id/documents', requireRole(['ADMIN', 'HR']), subcontractorController.addDocument);
router.delete('/documents/:documentId', requireRole(['ADMIN', 'HR']), subcontractorController.deleteDocument);

module.exports = router;
