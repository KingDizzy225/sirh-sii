const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// The employee creates a support ticket without auth
router.post('/tickets', publicController.createPublicTicket);

// The employee views their ticket status using the tracking ID
router.get('/tickets/:id', publicController.getPublicTicketStatus);

// The employee adds a message to their ticket
router.post('/tickets/:id/messages', publicController.addPublicMessage);

module.exports = router;
