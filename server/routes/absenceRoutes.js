const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absenceController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Route Publique (Libre-service sans connexion)
router.post('/public', upload.single('justificatif'), absenceController.createPublicAbsence);

// RH/Admin/Manager : liste globale + création + validation
router.get('/', verifyToken, requireRole(['HR', 'ADMIN', 'MANAGER']), absenceController.getAbsences);
router.post('/', verifyToken, upload.single('justificatif'), absenceController.createAbsence);
router.put('/:id/status', verifyToken, requireRole(['HR', 'ADMIN', 'MANAGER']), absenceController.updateAbsenceStatus);
router.delete('/:id', verifyToken, requireRole(['HR', 'ADMIN']), absenceController.deleteAbsence);

// Employé : ses propres absences + upload justificatif
router.get('/my', verifyToken, absenceController.getMyAbsences);
router.post('/:id/justificatif', verifyToken, upload.single('justificatif'), absenceController.uploadJustificatif);

module.exports = router;
