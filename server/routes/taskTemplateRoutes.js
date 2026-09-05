const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/taskTemplateController');

// Ces modèles déterminent les formalités créées à chaque arrivée : leur
// édition est réservée à la RH et à l'administration.
const ROLES = ['ADMIN', 'HR'];

router.get('/', verifyToken, requireRole(ROLES), ctrl.getTemplates);
router.post('/', verifyToken, requireRole(ROLES), ctrl.createTemplate);
router.post('/importer-socle', verifyToken, requireRole(ROLES), ctrl.importerSocle);
router.put('/:id', verifyToken, requireRole(ROLES), ctrl.updateTemplate);
router.delete('/:id', verifyToken, requireRole(ROLES), ctrl.deleteTemplate);

module.exports = router;
