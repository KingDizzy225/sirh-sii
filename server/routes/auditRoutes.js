const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const requireRole = require('../middleware/roleMiddleware');

// Seul l'ADMIN peut voir la piste d'audit pour des raisons de sécurité Zero-Trust
router.get('/', requireRole(['ADMIN']), auditController.getAuditLogs);

// Transparence : tout salarié voit qui a consulté son propre dossier
router.get('/my-access', auditController.getMyAccessTrace);

module.exports = router;
