const express = require('express');
const router = express.Router();
const timeLogController = require('../controllers/timeLogController');

router.get('/today', timeLogController.getTodayLogs);
router.get('/today/all', timeLogController.getAllTodayLogs); // HR View
// Relevé mensuel : ce que les pointages disent des heures travaillées, et des
// heures supplémentaires qui en découlent.
router.get('/releve', timeLogController.getReleveMensuel);

router.post('/', timeLogController.logTime);

module.exports = router;
