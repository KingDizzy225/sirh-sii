const express = require('express');
const router = express.Router();
const c = require('../controllers/requeteurController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Le requêteur atteint des données de paie et des coordonnées : même réserve
// que les écrans dont il tire ses listes.
router.use(verifyToken);
router.use(requireRole(['ADMIN', 'HR']));

router.get('/catalogue', c.getCatalogue);
router.post('/executer', c.executer);
router.post('/exporter', c.exporter);

module.exports = router;
