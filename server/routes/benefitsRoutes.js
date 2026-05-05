const express = require('express');
const router = express.Router();
const benefitsController = require('../controllers/benefitsController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', benefitsController.getBenefits);
router.post('/enroll', benefitsController.enrollBenefit); // Employees can enroll
router.put('/:id', requireRole(['Administrator', 'HR']), benefitsController.updateBenefit);

module.exports = router;
