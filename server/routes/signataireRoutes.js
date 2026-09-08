const express = require('express');
const router = express.Router();
const c = require('../controllers/signataireController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

/**
 * Une signature enregistrée est une image qui engage l'entreprise : sa gestion
 * est réservée à l'administration et aux ressources humaines.
 *
 * Deux routes échappent à l'authentification, et c'est leur objet même :
 * vérifier un document reçu doit être possible pour un tiers — une banque, un
 * bailleur, l'inspection — qui n'a pas de compte ici.
 */
router.post('/verification', c.verifierSceau);
router.get('/cle-publique', c.getClePublique);

router.use(verifyToken);
router.use(requireRole(['ADMIN', 'HR']));

router.get('/', c.lister);
router.post('/', c.creer);
router.get('/:id/image', c.getImage);
router.put('/:id', c.modifier);
router.delete('/:id', c.supprimer);

module.exports = router;
