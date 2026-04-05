const express = require('express');
const router = express.Router();
const c = require('../controllers/medicalController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.getMedicalVisits);
router.get('/alerts', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.getMedicalAlerts);
router.post('/', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.createMedicalVisit);
router.delete('/:id', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.deleteMedicalVisit);

module.exports = router;
