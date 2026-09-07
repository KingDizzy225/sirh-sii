const express = require('express');
const router = express.Router();
const procedureController = require('../controllers/procedureController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Procédures disciplinaires et de rupture : données sensibles, réservées à la
// RH et à l'administration, comme le dossier disciplinaire dont elles relèvent.
const RH = ['ADMIN', 'HR'];

router.use(verifyToken);

// Route nommée avant `/:id`, que « modeles » ne doit pas être pris pour un identifiant.
router.get('/modeles', requireRole(RH), procedureController.getModeles);

router.get('/', requireRole(RH), procedureController.lister);
router.post('/', requireRole(RH), procedureController.ouvrir);
router.get('/:id', requireRole(RH), procedureController.detail);
router.post('/:id/etapes/:etapeId', requireRole(RH), procedureController.franchir);
router.post('/:id/cloturer', requireRole(RH), procedureController.cloturer);

module.exports = router;
