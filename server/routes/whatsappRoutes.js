const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const verifyToken = require('../middleware/authMiddleware');

// Webhook de l'opérateur : nécessairement public, Meta ne présente aucun jeton
// de session. L'authenticité de l'appel est établie par la signature du corps
// du message (x-hub-signature-256), vérifiée dans le contrôleur.
router.get('/webhook', whatsappController.verifierWebhook);
router.post('/webhook', whatsappController.recevoirWebhook);

router.get('/configuration', verifyToken, whatsappController.getConfiguration);
router.post('/command', verifyToken, whatsappController.executeCommand);
router.get('/logs', verifyToken, whatsappController.getLogs);

module.exports = router;
