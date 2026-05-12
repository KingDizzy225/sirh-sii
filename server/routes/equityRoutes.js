const express = require('express');
const router = express.Router();
const equityController = require('../controllers/equityController');

router.get('/', equityController.getPayEquityData);

module.exports = router;
