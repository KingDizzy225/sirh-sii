const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const taskBoardController = require('../controllers/taskBoardController');

// Le tableau réunit intégrations et départs de toute l'entreprise. Le filtrage
// par profil est fait dans le contrôleur : un salarié n'y voit que ses propres
// tâches, la RH et l'administration voient l'ensemble.
router.get('/', verifyToken, taskBoardController.getBoard);

// Déplacer une carte modifie l'avancement réel de l'intégration ou du départ :
// réservé à la RH et à l'administration.
router.patch('/:source/:id', verifyToken, requireRole(['ADMIN', 'HR']), taskBoardController.updateStatus);

module.exports = router;
