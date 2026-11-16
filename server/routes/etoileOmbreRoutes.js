const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des nominations et votes Étoile de l'Ombre
let etoilesOmbre = [
    {
        id: 'etoile-1',
        employeNom: 'Brou Koffi',
        poste: 'Agent d\'Entretien & Propreté Agence',
        siteNom: 'Agence Orange Plateau Postel 2001',
        votesRecueillis: 14,
        mois: 'Octobre 2026',
        commentairesEquipe: [
            '« Grâce à lui, l\'agence sent toujours bon le matin et les comptoirs brillent pour les clients. » — Aïcha T.',
            '« Toujours le sourire et une disponibilité sans faille, merci tonton Brou ! » — Kouassi K.'
        ],
        tropheeDecerne: true,
        primeSpecialeOMFcfa: 30000
    },
    {
        id: 'etoile-2',
        employeNom: 'Bakary Cissé',
        poste: 'Agent de Sécurité & Filtrage Clients',
        siteNom: 'Agence Cap Sud Marcory',
        votesRecueillis: 11,
        mois: 'Octobre 2026',
        commentairesEquipe: [
            '« Calme extraordinaire avec les clients impatients le samedi, il désamorce tout avec politesse. » — Mamadou B.'
        ],
        tropheeDecerne: false,
        primeSpecialeOMFcfa: 25000
    }
];

/**
 * GET /api/etoile-ombre/palmares
 * Liste des lauréats et votes de l'Étoile de l'Ombre
 */
router.get('/palmares', (req, res) => {
    res.json({
        succes: true,
        palmares: etoilesOmbre
    });
});

/**
 * POST /api/etoile-ombre/voter
 * Voter pour un collaborateur des métiers support / de l'ombre
 */
router.post('/voter', (req, res) => {
    const { candidatId, motEncouragement } = req.body || {};
    const candidat = etoilesOmbre.find(e => e.id === candidatId) || etoilesOmbre[0];

    candidat.votesRecueillis += 1;
    if (motEncouragement) {
        candidat.commentairesEquipe.push(`« ${motEncouragement} » — Collègue`);
    }

    res.json({
        succes: true,
        message: `Vote enregistré avec succès pour ${candidat.employeNom} ! Merci pour cette reconnaissance bienveillante.`,
        candidat
    });
});

module.exports = router;
