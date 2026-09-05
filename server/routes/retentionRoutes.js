const express = require('express');
const router = express.Router();
const retentionController = require('../controllers/retentionController');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', retentionController.getRetentionActions);
router.post('/', requireRole(['ADMIN', 'HR']), retentionController.createRetentionAction);
router.put('/:id', requireRole(['ADMIN', 'HR']), retentionController.updateRetentionStatus);
router.delete('/:id', requireRole(['ADMIN', 'HR']), retentionController.deleteRetentionAction);

module.exports = router;
