const express = require('express');
const router = express.Router();
const procedureController = require('../controllers/procedureController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { traceAccess, cibles } = require('../middleware/accessTrace');

// Procédures disciplinaires et de rupture : données sensibles, réservées à la
// RH et à l'administration, comme le dossier disciplinaire dont elles relèvent.
const RH = ['ADMIN', 'HR'];

router.use(verifyToken);

// Route nommée avant `/:id`, que « modeles » ne doit pas être pris pour un identifiant.
router.get('/modeles', requireRole(RH), procedureController.getModeles);

// Une procédure de licenciement est au moins aussi sensible que le dossier
// disciplinaire qu'elle alimente, lequel est tracé depuis l'origine. Les
// consultations le sont donc aussi, dossier par dossier et registre entier.
router.get('/', requireRole(RH), traceAccess('PROCEDURE', cibles.registre(RH)), procedureController.lister);
router.post('/', requireRole(RH), procedureController.ouvrir);
router.get('/:id', requireRole(RH), traceAccess('PROCEDURE', cibles.parProcedure), procedureController.detail);
router.get('/:id/courriers', requireRole(RH), procedureController.getCourriers);
// Le courrier reprend le motif du dossier : sa consultation est tracée comme
// celle du dossier lui-même.
router.get('/:id/courriers/:code', requireRole(RH),
    traceAccess('PROCEDURE', cibles.parProcedure), procedureController.telechargerCourrier);

router.post('/:id/etapes/:etapeId', requireRole(RH), procedureController.franchir);
router.post('/:id/cloturer', requireRole(RH), procedureController.cloturer);

module.exports = router;
