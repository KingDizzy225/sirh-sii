const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const astreinteController = require('../controllers/astreinteController');

// Le planning se consulte et se remplit par les responsables ; la constatation
// et l'annulation, qui engagent une compensation, restent aux RH.
router.get('/', requireRole(['ADMIN', 'HR', 'MANAGER']), astreinteController.planning);
router.post('/', requireRole(['ADMIN', 'HR', 'MANAGER']), astreinteController.planifier);
router.post('/:id/constater', requireRole(['ADMIN', 'HR']), astreinteController.constater);
router.post('/:id/annuler', requireRole(['ADMIN', 'HR']), astreinteController.annuler);

module.exports = router;
