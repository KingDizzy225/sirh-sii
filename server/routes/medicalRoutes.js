const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { traceAccess, cibles } = require('../middleware/accessTrace');


// Lecture : filtrée dans le contrôleur (dossier personnel pour un employé,
// suivi complet pour la RH, l'administration et le service social)
// Données de santé : les consultations du registre par un profil habilité sont
// journalisées. L'accès était correctement restreint, mais rien n'enregistrait
// qui avait ouvert le suivi médical de l'entreprise — la première question
// posée lors d'un contrôle.
router.get('/', verifyToken,
    traceAccess('MEDICAL', cibles.registre(['ADMIN', 'HR', 'SOCIAL_WORKER'])),
    medicalController.getMedicalRecords);

// Écriture : réservée aux profils habilités à saisir une visite médicale
router.post('/', verifyToken, requireRole(['ADMIN', 'HR', 'SOCIAL_WORKER']), medicalController.createMedicalRecord);
router.delete('/:id', verifyToken, requireRole(['ADMIN', 'HR', 'SOCIAL_WORKER']), medicalController.deleteMedicalRecord);

module.exports = router;
