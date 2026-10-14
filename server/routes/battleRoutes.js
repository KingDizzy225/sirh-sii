const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en direct des battles et des KPIs commerciaux d'agence
let agencesBattle = [
    {
        id: 'bg-yop',
        nom: 'Agence Orange Yopougon Siporex',
        zone: 'Abidjan Ouest',
        simActivees: 142,
        boxFibreVendues: 28,
        volumeOmFcfa: 18500000,
        scorePoints: 2450,
        rang: 1,
        progression: '+18%',
        etoileMois: 'Aïcha Coulibaly (Top Fibre)'
    },
    {
        id: 'bg-pla',
        nom: 'Agence Orange Plateau Postel 2001',
        zone: 'Abidjan Centre',
        simActivees: 120,
        boxFibreVendues: 32,
        volumeOmFcfa: 22400000,
        scorePoints: 2380,
        rang: 2,
        progression: '+12%',
        etoileMois: 'Jean-Eudes Yao (Top OM B2B)'
    },
    {
        id: 'bg-mar',
        nom: 'Agence Orange Cap Sud Marcory',
        zone: 'Abidjan Sud',
        simActivees: 115,
        boxFibreVendues: 24,
        volumeOmFcfa: 16200000,
        scorePoints: 1980,
        rang: 3,
        progression: '+8%',
        etoileMois: 'Kady Sangaré (Top eSIM)'
    },
    {
        id: 'bg-bou',
        nom: 'Agence Orange Bouaké Commerce',
        zone: 'Intérieur - Gbêkê',
        simActivees: 98,
        boxFibreVendues: 15,
        volumeOmFcfa: 14100000,
        scorePoints: 1720,
        rang: 4,
        progression: '+22%',
        etoileMois: 'Amadou Koné (Top Forfaits)'
    }
];

let challengesActifs = [
    {
        id: 'ch-fibre',
        titre: '🚀 Sprint Fibre Max Orange (Semaine en cours)',
        description: 'La première agence atteignant 40 box Fibre installées remporte un dîner d\'équipe + 25 000 FCFA de prime OM par conseiller.',
        cible: 40,
        leaderActuel: 'Agence Orange Plateau (32 box)',
        dateFin: 'Samedi 18h00'
    },
    {
        id: 'ch-esim',
        titre: '📲 Ruée vers l\'eSIM & 5G',
        description: 'Objectif 150 conversions eSIM réussies par boutique.',
        cible: 150,
        leaderActuel: 'Agence Orange Yopougon (142 activées)',
        dateFin: 'Fin du mois'
    }
];

/**
 * GET /api/battle/leaderboard
 * Retourne le classement en temps réel des boutiques
 */
router.get('/leaderboard', (req, res) => {
    // Calcul et tri par points
    const trie = [...agencesBattle].sort((a, b) => b.scorePoints - a.scorePoints).map((ag, idx) => ({
        ...ag,
        rang: idx + 1
    }));
    res.json({
        succes: true,
        agences: trie,
        challenges: challengesActifs,
        actualiseLe: new Date()
    });
});

/**
 * POST /api/battle/saisir-vente
 * Enregistrement rapide d'une vente ou d'une performance par un manager
 */
router.post('/saisir-vente', (req, res) => {
    const { agenceId, typeVente, quantite } = req.body || {};
    const agence = agencesBattle.find(a => a.id === agenceId);
    if (!agence) return res.status(404).json({ error: "Agence introuvable." });

    const qte = parseInt(quantite, 10) || 1;
    let pointsGagnes = 0;

    if (typeVente === 'FIBRE') {
        agence.boxFibreVendues += qte;
        pointsGagnes = qte * 50;
    } else if (typeVente === 'SIM') {
        agence.simActivees += qte;
        pointsGagnes = qte * 10;
    } else if (typeVente === 'OM') {
        agence.volumeOmFcfa += (qte * 100000);
        pointsGagnes = qte * 25;
    } else {
        pointsGagnes = qte * 15;
    }

    agence.scorePoints += pointsGagnes;

    res.json({
        succes: true,
        message: `+${pointsGagnes} points ajoutés à ${agence.nom} !`,
        agence
    });
});

module.exports = router;
