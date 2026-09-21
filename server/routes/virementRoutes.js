const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/roleMiddleware');
const virementController = require('../controllers/virementController');

// Lots de virement : c'est le seul chemin qui marque un bulletin « payé ».
router.get('/formats', requireRole(['ADMIN', 'HR']), virementController.formats);
router.post('/formats', requireRole(['ADMIN', 'HR']), virementController.enregistrerFormat);
router.get('/preparation', requireRole(['ADMIN', 'HR']), virementController.preparation);
router.get('/', requireRole(['ADMIN', 'HR']), virementController.lister);
router.post('/', requireRole(['ADMIN', 'HR']), virementController.creer);
router.get('/:id/fichier', requireRole(['ADMIN', 'HR']), virementController.fichier);
router.post('/:id/emettre', requireRole(['ADMIN', 'HR']), virementController.emettre);
router.post('/:id/annuler', requireRole(['ADMIN', 'HR']), virementController.annuler);

module.exports = router;
