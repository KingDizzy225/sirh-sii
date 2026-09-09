const express = require('express');
const router = express.Router();
const pretController = require('../controllers/pretController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

const RH = ['Administrator', 'HR', 'ADMIN'];

// Un salarié voit les siens ; la RH voit tout. Le tri se fait dans le contrôleur.
router.get('/', pretController.lister);

// Routes fixes avant les routes à paramètre.
router.get('/echeances/:periode', requireRole(RH), pretController.echeancesDues);
router.post('/simuler', requireRole(RH), pretController.simuler);

router.post('/', requireRole(RH), pretController.accorder);
router.post('/:id/annuler', requireRole(RH), pretController.annuler);

module.exports = router;
