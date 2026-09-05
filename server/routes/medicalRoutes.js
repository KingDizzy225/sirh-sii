const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const verifyToken = require('../middleware/authMiddleware');

const requireRole = require('../middleware/roleMiddleware');

// Lecture : filtrée dans le contrôleur (dossier personnel pour un employé,
// suivi complet pour la RH, l'administration et le service social)
router.get('/', verifyToken, medicalController.getMedicalRecords);

// Écriture : réservée aux profils habilités à saisir une visite médicale
router.post('/', verifyToken, requireRole(['ADMIN', 'HR', 'SOCIAL_WORKER']), medicalController.createMedicalRecord);
router.delete('/:id', verifyToken, requireRole(['ADMIN', 'HR', 'SOCIAL_WORKER']), medicalController.deleteMedicalRecord);

module.exports = router;
