const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Le budget met en regard des salaires et des décisions d'effectif : même
// réserve que la paie, à la direction et aux ressources humaines.
router.use(verifyToken);
router.use(requireRole(['ADMIN', 'HR']));

router.get('/', budgetController.getSynthese);
router.post('/', budgetController.enregistrer);
router.delete('/:id', budgetController.supprimer);

module.exports = router;
