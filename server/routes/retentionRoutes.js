const express = require('express');
const router = express.Router();
const retentionController = require('../controllers/retentionController');

router.get('/', retentionController.getRetentionActions);
router.post('/', retentionController.createRetentionAction);
router.put('/:id', retentionController.updateRetentionStatus);
router.delete('/:id', retentionController.deleteRetentionAction);

module.exports = router;
