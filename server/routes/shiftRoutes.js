const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', shiftController.getShifts);
router.post('/', requireRole(['Administrator', 'HR', 'Manager']), shiftController.createShift);
router.put('/:id', requireRole(['Administrator', 'HR', 'Manager']), shiftController.updateShift);
router.delete('/:id', requireRole(['Administrator', 'HR', 'Manager']), shiftController.deleteShift);

module.exports = router;
