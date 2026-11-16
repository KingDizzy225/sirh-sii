const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire du suivi des commissions en temps réel
let commissionsConseillers = [
    {
        id: 'com-1',
        employeNom: 'Jean-Marc Koffi',
        matricule: 'EMP-0514',
        siteNom: 'Agence Orange Plateau Postel 2001',
        mois: 'Octobre 2026',
        ventesFibre: 18, // 2 500 F / box
        ventesSim: 45, // 500 F / sim
        volumeOmPalier: 4, // 5 000 F / palier
        totalCommissionsFcfa: 87500,
        palierActuel: 'Palier Or (80 000 F+)',
        prochainPalier: {
            nom: 'Palier Platine (100 000 F+)',
            ventesManquantes: 5,
            bonusAdditionnelFcfa: 25000
        }
    },
    {
        id: 'com-2',
        employeNom: 'Aïcha Traoré',
        matricule: 'EMP-0498',
        siteNom: 'Agence Orange Plateau',
        mois: 'Octobre 2026',
        ventesFibre: 12,
        ventesSim: 60,
        volumeOmPalier: 6,
        totalCommissionsFcfa: 90000,
        palierActuel: 'Palier Or',
        prochainPalier: {
            nom: 'Palier Platine',
            ventesManquantes: 4,
            bonusAdditionnelFcfa: 25000
        }
    }
];

/**
 * GET /api/commissions-live/mon-compteur
 * Renvoie les commissions en temps réel et objectifs paliers
 */
router.get('/mon-compteur', (req, res) => {
    res.json({
        succes: true,
        conseillers: commissionsConseillers,
        reglesCalcul: {
            primeBoxFibre: '2 500 FCFA / box installée',
            primeSimEsim: '500 FCFA / activation réussie',
            primePalierOM: '5 000 FCFA / palier 1M FCFA brassé'
        }
    });
});

module.exports = router;
