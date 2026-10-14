const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const juridiqueController = require('../controllers/juridiqueController');

// Réservé à l'administration RH
router.post('/consulter', requireRole(['ADMIN', 'HR']), juridiqueController.consulter);
router.post('/generer-courrier', requireRole(['ADMIN', 'HR']), juridiqueController.genererCourrier);
router.post('/calculer-bareme', requireRole(['ADMIN', 'HR']), juridiqueController.calculerBareme);

module.exports = router;
