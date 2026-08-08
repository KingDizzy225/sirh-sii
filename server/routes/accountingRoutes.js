const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');

// Tableau de bord de l'Agent Comptable IA
router.get('/dashboard', accountingController.getDashboard);

// Pièces comptables (boîte de réception)
router.get('/documents', accountingController.getDocuments);
router.post('/documents', accountingController.upload.single('piece'), accountingController.uploadDocument);
router.post('/documents/:id/analyze', accountingController.analyzeDocument);
router.put('/documents/:id/status', accountingController.updateDocumentStatus);
router.delete('/documents/:id', accountingController.deleteDocument);

// Boîte email de réception des pièces
router.get('/inbox/status', accountingController.getInboxStatus);
router.post('/inbox/check', accountingController.checkInbox);

// Journal comptable (SYSCOHADA)
router.get('/journal', accountingController.getJournalEntries);
router.put('/journal/:id/status', accountingController.updateEntryStatus);
router.delete('/journal/:id', accountingController.deleteEntry);

// Échéanciers de paiement
router.get('/schedules', accountingController.getSchedules);
router.post('/schedules', accountingController.createSchedule);
router.put('/schedules/:id/cancel', accountingController.cancelSchedule);
router.put('/schedules/installments/:installmentId/pay', accountingController.payInstallment);

module.exports = router;
