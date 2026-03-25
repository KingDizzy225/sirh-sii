const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const verifyToken = require('../middleware/authMiddleware');

// The requester creates a support ticket
router.post('/', verifyToken, supportController.createTicket);

// The user views their tickets or social worker views all
router.get('/', verifyToken, supportController.getTickets);

// Update a ticket's status or reply (mocked as status change for simplicity)
router.put('/:id', verifyToken, supportController.updateTicket);

// Add message to ticket chat
router.post('/:ticketId/messages', verifyToken, supportController.addMessage);

module.exports = router;
