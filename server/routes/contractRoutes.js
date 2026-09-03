const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/templates', verifyToken, contractController.getTemplates);
router.post('/templates', verifyToken, contractController.createTemplate);
router.post('/generate', verifyToken, contractController.generateContract);

module.exports = router;
