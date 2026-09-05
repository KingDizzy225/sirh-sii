const express = require('express');
const router = express.Router();
const subcontractorController = require('../controllers/subcontractorController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
// Only HR / Admin for managing external workforce
router.use(requireRole(['Administrator', 'HR']));

router.get('/', subcontractorController.getSubcontractors);
router.post('/', requireRole(['ADMIN', 'HR']), subcontractorController.createSubcontractor);
router.put('/:id', requireRole(['ADMIN', 'HR']), subcontractorController.updateSubcontractor);

module.exports = router;
