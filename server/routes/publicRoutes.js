const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// The employee creates a support ticket without auth
router.post('/tickets', publicController.createPublicTicket);

// The employee views their ticket status using the tracking ID
router.get('/tickets/:id', publicController.getPublicTicketStatus);

// The employee adds a message to their ticket
router.post('/tickets/:id/messages', publicController.addPublicMessage);

// The employee clocks in directly from the login page
router.post('/clock-in', publicController.publicClockIn);

// Vérification d'authenticité d'un document par son QR code (banque, bailleur,
// administration). Aucune donnée sensible n'est exposée — voir le contrôleur.
const verificationController = require('../controllers/verificationController');
router.get('/verify/:token', verificationController.verifyDocument);

// Suivi d'un dépôt par sa référence. Elle est rendue au salarié après chaque
// demande, et ne menait jusqu'ici nulle part.
router.get('/suivi/:reference', publicController.suivreDemande);

/**
 * Remise d'un document au salarié, par lien.
 *
 * Hors de toute session : les salariés n'ouvrent plus de compte, et c'est le
 * jeton du lien qui vaut autorisation. La vérification est refaite à chaque
 * étape — l'ouverture ne délivre aucun laissez-passer.
 */
const remiseController = require('../controllers/remiseController');
router.get('/documents/:token', remiseController.consulter);
router.post('/documents/:token/ouvrir', remiseController.ouvrir);
router.get('/documents/:token/fichier', remiseController.telecharger);

module.exports = router;
