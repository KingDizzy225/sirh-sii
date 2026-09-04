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

module.exports = router;
