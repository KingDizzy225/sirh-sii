const express = require('express');
const router = express.Router();
const kudoController = require('../controllers/kudoController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, kudoController.sendKudo);
router.get('/', verifyToken, kudoController.getKudos);
router.get('/leaderboard', verifyToken, kudoController.getLeaderboard);

module.exports = router;
