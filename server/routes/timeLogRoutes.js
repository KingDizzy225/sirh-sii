const express = require('express');
const router = express.Router();
const timeLogController = require('../controllers/timeLogController');

router.get('/today', timeLogController.getTodayLogs);
router.get('/today/all', timeLogController.getAllTodayLogs); // HR View
router.post('/', timeLogController.logTime);

module.exports = router;
