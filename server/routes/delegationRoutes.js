const express = require('express');
const router = express.Router();
const c = require('../controllers/delegationController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

// Chacun peut savoir ce qu'il a reçu et ce qu'il a donné : une délégation
// qu'on ignore ne vaut pas mieux qu'une absence de délégation.
router.get('/miennes', c.mesDelegations);

router.get('/', requireRole(['ADMIN', 'HR']), c.lister);
router.post('/', requireRole(['ADMIN', 'HR']), c.creer);
router.post('/:id/revoquer', requireRole(['ADMIN', 'HR']), c.revoquer);

module.exports = router;
