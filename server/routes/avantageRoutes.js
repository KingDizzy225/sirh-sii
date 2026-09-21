const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const avantageController = require('../controllers/avantageController');

// Prime de transport et avantages en nature.
router.get('/', requireRole(['ADMIN', 'HR']), avantageController.lister);
router.post('/transport/:employeeId', requireRole(['ADMIN', 'HR']), avantageController.definirTransport);
router.post('/:employeeId', requireRole(['ADMIN', 'HR']), avantageController.ajouter);
router.post('/:id/terminer', requireRole(['ADMIN', 'HR']), avantageController.terminer);

module.exports = router;
