const express = require('express');
const router = express.Router();
const c = require('../controllers/advanceController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Public route (Self-Service sans connexion)
router.post('/public', c.createPublicAdvance);

// Salaire déjà gagné et mobilisable — self-service
router.get('/earned', verifyToken, c.getEarnedWage);

router.get('/', verifyToken, c.getAdvances);
router.post('/', verifyToken, c.createAdvance);
router.put('/:id/status', verifyToken, requireRole('HR', 'ADMIN', 'Administrator', 'Manager'), c.updateAdvanceStatus);

module.exports = router;
