const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const ijController = require('../controllers/indemniteJournaliereController');

// Créances d'indemnités journalières CNPS : maternité et accident du travail.
router.get('/', requireRole(['ADMIN', 'HR']), ijController.lister);
router.post('/', requireRole(['ADMIN', 'HR']), ijController.ouvrir);
router.post('/:id/reclamer', requireRole(['ADMIN', 'HR']), ijController.reclamer);
router.post('/:id/encaisser', requireRole(['ADMIN', 'HR']), ijController.encaisser);

module.exports = router;
