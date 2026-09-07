const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/policyController');

// Ces règles fondent les réponses données aux salariés sur leurs droits :
// leur édition est réservée à la RH et à l'administration.
const ROLES = ['ADMIN', 'HR'];

// Lecture ouverte à tout collaborateur connecté : ces règles fondent ses
// droits, il doit pouvoir les lire sans passer par l'assistant. Seules les
// règles actives sont rendues, et l'édition reste réservée.
router.get('/consultation', verifyToken, ctrl.getPoliciesPubliques);

router.get('/', verifyToken, requireRole(ROLES), ctrl.getPolicies);
router.post('/', verifyToken, requireRole(ROLES), ctrl.createPolicy);
router.post('/proposer', verifyToken, requireRole(ROLES), ctrl.proposerDepuisDocument);
router.put('/:id', verifyToken, requireRole(ROLES), ctrl.updatePolicy);
router.delete('/:id', verifyToken, requireRole(ROLES), ctrl.deletePolicy);

module.exports = router;
