const express = require('express');
const router = express.Router();

let palmaresRegions = [
    {
        rang: 1,
        agenceNom: 'Agence Orange San Pedro Commerce',
        region: 'Bas-Sassandra (Zone Portuaire)',
        chefAgence: 'Bamba Lanciné',
        tauxAtteinteObjectifs: 138,
        scorePondere: 98.4,
        ventesFibreMois: 142,
        ventesSimPostpayees: 520,
        volumeOrangeMoneyMillionsFcfa: 48.5,
        primeEquipeGagneeFcfa: 350000,
        badgeDistinction: '🏆 Champion Régions 2026'
    },
    {
        rang: 2,
        agenceNom: 'Agence Orange Bouaké Commerce',
        region: 'Gbêkê (Centre)',
        chefAgence: 'Konan Adjoua Florence',
        tauxAtteinteObjectifs: 124,
        scorePondere: 94.1,
        ventesFibreMois: 118,
        ventesSimPostpayees: 480,
        volumeOrangeMoneyMillionsFcfa: 41.2,
        primeEquipeGagneeFcfa: 250000,
        badgeDistinction: '🥈 Étoile du Centre'
    },
    {
        rang: 3,
        agenceNom: 'Agence Orange Korhogo Cité Verte',
        region: 'Poro (Grand Nord)',
        chefAgence: 'Ouattara Souleymane',
        tauxAtteinteObjectifs: 119,
        scorePondere: 91.8,
        ventesFibreMois: 95,
        ventesSimPostpayees: 410,
        volumeOrangeMoneyMillionsFcfa: 36.8,
        primeEquipeGagneeFcfa: 150000,
        badgeDistinction: '🥉 Pilier du Nord'
    }
];

router.get('/classement', (req, res) => {
    res.json({
        succes: true,
        moisEnCours: 'Octobre 2026',
        criteresPonderation: 'Objectifs adaptés au pouvoir d\'achat local et à la couverture réseau régionale',
        palmares: palmaresRegions
    });
});

module.exports = router;
