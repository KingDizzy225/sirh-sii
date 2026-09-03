const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, medicalController.getMedicalRecords);
router.post('/', verifyToken, medicalController.createMedicalRecord);

module.exports = router;
