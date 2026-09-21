const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const provisionController = require('../controllers/provisionController');

// Provision pour congés payés : la dette sociale, et ses arrêtés datés.
router.get('/', requireRole(['ADMIN', 'HR']), provisionController.etat);
router.get('/:id', requireRole(['ADMIN', 'HR']), provisionController.detail);
router.post('/arreter', requireRole(['ADMIN', 'HR']), provisionController.arreter);

module.exports = router;
