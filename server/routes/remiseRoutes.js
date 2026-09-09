const express = require('express');
const router = express.Router();
const remiseController = require('../controllers/remiseController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

/**
 * Remise de documents : côté RH.
 *
 * La partie publique — celle que le salarié ouvre avec son lien — vit dans
 * publicRoutes, hors de toute session : c'est tout l'objet du dispositif.
 */
router.use(verifyToken);

const RH = ['Administrator', 'HR', 'ADMIN'];

router.post('/', requireRole(RH), remiseController.remettre);
router.get('/employe/:employeeId', requireRole(RH), remiseController.listerParEmploye);
router.post('/:id/revoquer', requireRole(RH), remiseController.revoquer);

module.exports = router;
