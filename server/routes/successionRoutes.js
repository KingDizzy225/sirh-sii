const express = require('express');
const router = express.Router();
const successionController = require('../controllers/successionController');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', successionController.getSuccessionPlans);
router.post('/', requireRole('Administrator', 'HR'), successionController.createPlan);
router.delete('/:id', requireRole('Administrator', 'HR'), successionController.deletePlan);

router.post('/successors', requireRole('Administrator', 'HR'), successionController.addSuccessor);
router.put('/successors/:id', requireRole('Administrator', 'HR'), successionController.updateSuccessor);
router.delete('/successors/:id', requireRole('Administrator', 'HR'), successionController.removeSuccessor);

module.exports = router;
