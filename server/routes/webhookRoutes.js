const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', verifyToken, requireRole(['HR', 'ADMIN']), webhookController.getWebhooks);
// Catalogue des événements réellement émis : l'écran n'en propose pas d'autres.
router.get('/evenements', verifyToken, requireRole(['HR', 'ADMIN']), webhookController.getCatalogue);
router.post('/', verifyToken, requireRole(['HR', 'ADMIN']), webhookController.createWebhook);
router.delete('/:id', verifyToken, requireRole(['HR', 'ADMIN']), webhookController.deleteWebhook);

module.exports = router;
