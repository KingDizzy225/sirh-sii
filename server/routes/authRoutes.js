const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Ces routes gèreront l'authentification
router.post('/login', authController.login);
router.put('/update-credentials', verifyToken, authController.updateCredentials);

// Gestion des utilisateurs (Super Admin uniquement)
router.get('/users', verifyToken, requireRole(['ADMIN']), authController.getAllUsers);
router.post('/users', verifyToken, requireRole(['ADMIN']), authController.createUser);

module.exports = router;
