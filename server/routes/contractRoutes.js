const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/templates', verifyToken, contractController.getTemplates);
router.post('/templates', verifyToken, requireRole(['ADMIN', 'HR']),  contractController.createTemplate);
router.post('/generate', verifyToken, requireRole(['ADMIN', 'HR']),  contractController.generateContract);
// Contrat en PDF, signé et scellé : remplace l'export par la boîte
// d'impression, qui imposait d'imprimer, faire signer, puis rescanner.
router.post('/pdf', verifyToken, requireRole(['ADMIN', 'HR']), contractController.telechargerPdf);

module.exports = router;
