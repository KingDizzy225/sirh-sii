const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des commandes groupées du midi
let commandesMidi = [
    {
        id: 'pop-1',
        siteNom: 'Agence Orange Plateau Postel 2001',
        restaurantChoisi: 'Maquis Chez Tantie Marie (Spécialités Ivoiriennes)',
        menuDuJour: 'Attiéké Poisson Braisé / Foutou Sauce Graine / Alloco Poulet',
        heureLivraisonPrevue: '12:30',
        totalParticipants: 6,
        cagnotteOmTotalFcfa: 15000,
        statutCommande: 'COMMANDE_VALIDEE', // 'VOTE_EN_COURS' | 'COMMANDE_VALIDEE' | 'LIVRE'
        commandesSalaries: [
            { nom: 'Aïcha Traoré', plat: 'Attiéké Poisson Braisé', montant: 2500 },
            { nom: 'Kouassi Konan', plat: 'Foutou Sauce Graine', montant: 2500 },
            { nom: 'Jean-Marc Koffi', plat: 'Alloco Poulet Rôti', montant: 2500 }
        ]
    }
];

/**
 * GET /api/popote-agence/commandes
 * Liste des popotes du midi par agence
 */
router.get('/commandes', (req, res) => {
    res.json({
        succes: true,
        commandes: commandesMidi
    });
});

/**
 * POST /api/popote-agence/rejoindre
 * Ajouter son plat à la commande groupée du midi
 */
router.post('/rejoindre', (req, res) => {
    const { commandeId, employeNom, platChoisi, montant } = req.body || {};
    const cmd = commandesMidi.find(c => c.id === commandeId) || commandesMidi[0];
    const prix = parseInt(montant, 10) || 2500;

    cmd.commandesSalaries.push({
        nom: employeNom || req.user?.name || 'Collaborateur',
        plat: platChoisi || 'Plat du jour',
        montant: prix
    });
    cmd.totalParticipants = cmd.commandesSalaries.length;
    cmd.cagnotteOmTotalFcfa += prix;

    res.json({
        succes: true,
        message: `Plat ajouté ! Livraison prévue à 12h30 en salle de pause. Bon appétit !`,
        commande: cmd
    });
});

module.exports = router;
