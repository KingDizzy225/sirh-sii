const express = require('express');
const router = express.Router();

let classementMaracana = [
    {
        rang: 1,
        equipeNom: 'Les Éléphants de Yopougon (Siporex & Bel Air)',
        points: 15,
        matchsJoues: 5,
        victoires: 5,
        nuls: 0,
        defaites: 0,
        butsPour: 14,
        butsContre: 3,
        capitaine: 'Kouassi Yves (Chef d\'Agence)',
        prochainMatch: 'Samedi 16h vs Team Plateau'
    },
    {
        rang: 2,
        equipeNom: 'Team Fibre & Techniciens Terrain',
        points: 12,
        matchsJoues: 5,
        victoires: 4,
        nuls: 0,
        defaites: 1,
        butsPour: 11,
        butsContre: 5,
        capitaine: 'Sanogo Brahima',
        prochainMatch: 'Samedi 17h vs Les Requins de Treichville'
    },
    {
        rang: 3,
        equipeNom: 'FC Plateau Postel (Vente & Corporate)',
        points: 9,
        matchsJoues: 5,
        victoires: 3,
        nuls: 0,
        defaites: 2,
        butsPour: 8,
        butsContre: 6,
        capitaine: 'Diallo Oumar',
        prochainMatch: 'Samedi 16h vs Éléphants de Yopougon'
    }
];

let prochainsMatchs = [
    {
        id: 'mtc-01',
        affiche: 'Yopougon Siporex 🆚 FC Plateau Postel',
        terrain: 'Complexe Sportif Jesse Jackson Yopougon',
        dateHeure: 'Ce Samedi 18 Octobre à 16h00',
        animationTroisiemeMiTemps: 'Alloco Party & Rafraîchissements offerts par le CE SII',
        statut: 'INSCRIPTIONS_SUPPORTERS_OUVERTES'
    }
];

router.get('/tournoi', (req, res) => {
    res.json({
        succes: true,
        edition: 'Ligue des Champions Maracana & Fitness SII 2026',
        classement: classementMaracana,
        programme: prochainsMatchs
    });
});

router.post('/inscrire-joueur', (req, res) => {
    const { nomJoueur, equipeSouhaitee, posteTerrain } = req.body || {};
    res.json({
        succes: true,
        message: `Inscription de ${nomJoueur || 'Joueur'} validée dans l'équipe ${equipeSouhaitee || 'Boutique'} ! Rendez-vous samedi pour le coup d'envoi.`
    });
});

module.exports = router;
