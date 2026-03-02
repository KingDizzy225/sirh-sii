const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// Ces routes gèreront l'authentification
router.post('/login', authController.login);
router.put('/update-credentials', verifyToken, authController.updateCredentials);
// router.get('/profile', verifyToken, authController.getProfile); // (Sera protégé plus tard)

module.exports = router;
