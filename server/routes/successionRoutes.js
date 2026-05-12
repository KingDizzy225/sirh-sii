const express = require('express');
const router = express.Router();
const successionController = require('../controllers/successionController');

router.get('/', successionController.getSuccessionPlans);
router.post('/', successionController.createPlan);
router.delete('/:id', successionController.deletePlan);

router.post('/successors', successionController.addSuccessor);
router.put('/successors/:id', successionController.updateSuccessor);
router.delete('/successors/:id', successionController.removeSuccessor);

module.exports = router;
