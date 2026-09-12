const express = require('express');
const router = express.Router();
const offboardingController = require('../controllers/offboardingController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const finContrat = require('../controllers/finContratController');

router.use(verifyToken);

router.get('/tasks', offboardingController.getOffboardingTasks);
router.post('/tasks', requireRole(['Administrator', 'HR']), offboardingController.createOffboardingTask);
router.put('/tasks/:id', requireRole(['Administrator', 'HR']), offboardingController.updateOffboardingTask);

// Projet de décompte final : réservé à la RH et à l'administration
router.get('/settlement/:employeeId', requireRole(['Administrator', 'HR', 'ADMIN']), offboardingController.getFinalSettlement);

// Entretien de sortie : recueil et synthèse des motifs de départ
const RH = ['Administrator', 'HR', 'ADMIN'];
router.get('/exit-interview/options', requireRole(RH), offboardingController.getExitInterviewOptions);
router.get('/exit-insights', requireRole(RH), offboardingController.getExitInsights);
router.post('/exit-interview/:employeeId', requireRole(RH), offboardingController.saveExitInterview);

/**
 * Documents de fin de contrat.
 *
 * Les lettres de rupture annonçaient au salarié son solde de tout compte, son
 * certificat de travail et son attestation ; aucun des trois n'était produit.
 * Ils le sont ici, signés et scellés comme les autres documents émis.
 */
router.get('/:employeeId/certificat-travail', requireRole(RH), finContrat.certificatTravail);
router.get('/:employeeId/attestation-cessation', requireRole(RH), finContrat.attestationCessation);

// Le reçu fait décharge : il n'est édité que depuis un décompte arrêté.
// Projection avant décision : ce que coûterait chaque nature de départ.
router.get('/:employeeId/solde/simulation', requireRole(RH), finContrat.simulerDepart);
router.get('/:employeeId/solde/arrete', requireRole(RH), finContrat.lireArreteSolde);
router.post('/:employeeId/solde/arreter', requireRole(RH), finContrat.arreterSolde);
router.get('/:employeeId/solde/recu', requireRole(RH), finContrat.recuSolde);

module.exports = router;
