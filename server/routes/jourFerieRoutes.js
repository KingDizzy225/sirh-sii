const express = require('express');
const router = express.Router();
const jourFerieController = require('../controllers/jourFerieController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

const RH = ['Administrator', 'HR', 'ADMIN'];

// La lecture est ouverte à tout compte connecté : le calendrier des fériés
// conditionne le décompte d'un congé, et le salarié doit pouvoir le vérifier.
router.get('/', jourFerieController.lister);

router.post('/', requireRole(RH), jourFerieController.creer);
router.post('/engendrer', requireRole(RH), jourFerieController.engendrer);
router.delete('/:id', requireRole(RH), jourFerieController.supprimer);

module.exports = router;
