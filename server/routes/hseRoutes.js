const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const hse = require('../controllers/hseController');

// Le registre des accidents nomme des salariés et décrit leur état de santé :
// il reste réservé à la RH, à l'administration et au service social.
const HSE_ROLES = ['ADMIN', 'HR', 'Social Worker'];

router.get('/accidents', verifyToken, requireRole(HSE_ROLES), hse.getAccidents);
router.post('/accidents', verifyToken, requireRole(HSE_ROLES), hse.createAccident);
router.patch('/accidents/:id', verifyToken, requireRole(HSE_ROLES), hse.updateAccident);

// Conformité des visites médicales : lecture seule, à partir des dossiers
// saisis dans le module de médecine du travail.
router.get('/visites', verifyToken, requireRole(HSE_ROLES), hse.getSuiviVisites);

module.exports = router;
