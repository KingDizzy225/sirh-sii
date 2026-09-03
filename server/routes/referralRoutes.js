const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, referralController.getAllReferrals);
router.post('/', verifyToken, referralController.createReferral);
router.patch('/:id/status', verifyToken, referralController.updateReferralStatus);
router.put('/:id/status', verifyToken, referralController.updateReferralStatus);
router.get('/stats', verifyToken, referralController.getReferralStats);

module.exports = router;
