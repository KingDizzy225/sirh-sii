const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', requireRole('HR', 'ADMIN', 'Administrator'), assetController.getAllAssets);
router.post('/', requireRole('HR', 'ADMIN', 'Administrator'), assetController.createAsset);

module.exports = router;
