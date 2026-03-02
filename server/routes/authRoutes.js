const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ces routes gèreront l'authentification
router.post('/login', authController.login);
// router.get('/profile', verifyToken, authController.getProfile); // (Sera protégé plus tard)

module.exports = router;
