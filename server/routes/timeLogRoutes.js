const express = require('express');
const router = express.Router();
const timeLogController = require('../controllers/timeLogController');

router.get('/today', timeLogController.getTodayLogs);
router.post('/', timeLogController.logTime);

module.exports = router;
