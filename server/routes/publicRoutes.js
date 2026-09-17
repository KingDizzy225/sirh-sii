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

// Mur d'agence : l'écran de boutique ne se connecte pas, son jeton l'autorise.
router.get('/ecrans/:token', require('../controllers/ecranController').afficher);

// Badge numérique : la carte du porteur, sa photo, et la vérification par un tiers.
const badgeController = require('../controllers/badgeController');
router.get('/badges/verifier/:jeton', badgeController.verifier);
router.get('/badges/:jeton', badgeController.carte);
router.get('/badges/:jeton/photo', badgeController.photo);

// « Mon année chez SII » : accueil, puis bilan après vérification.
const retrospectiveController = require('../controllers/retrospectiveController');
router.get('/retrospectives/:token', retrospectiveController.accueil);
router.post('/retrospectives/:token/ouvrir', retrospectiveController.ouvrir);

module.exports = router;
