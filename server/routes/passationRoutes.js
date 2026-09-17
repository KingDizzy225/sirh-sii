const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const passationController = require('../controllers/passationController');

// Suivi des passations d'équipe. L'écriture et la lecture en agence passent par
// le badge (routes/publicRoutes.js).
router.get('/', requireRole(['ADMIN', 'HR']), passationController.suivi);

module.exports = router;
