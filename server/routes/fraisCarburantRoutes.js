const express = require('express');
const router = express.Router();

let tournéesSuperviseurs = [
    {
        id: 'trn-1',
        superviseurNom: 'Aka Jean-Baptiste',
        zoneSupervision: 'Zone Sud Abidjan (Port-Bouët, Koumassi, Marcory)',
        vehiculeType: 'Toyota Hilux 4x4 SII (7892 KJ 01)',
        soldeCarteTotalFcfa: 45000,
        kmParcourusMois: 1420,
        pointsDeVenteVisites: 28,
        conformeItineraireGps: true,
        rechargeAutoDeclenchee: false,
        dernierRavitaillement: 'Hier à la Station Total VGE'
    },
    {
        id: 'trn-2',
        superviseurNom: 'Kouassi Félicien',
        zoneSupervision: 'Zone Ouest Intérieur (Daloa, Gagnoa, Issia)',
        vehiculeType: 'Duster Dacia SII (3301 KH 01)',
        soldeCarteTotalFcfa: 12000, // Bas
        kmParcourusMois: 2850,
        pointsDeVenteVisites: 45,
        conformeItineraireGps: true,
        rechargeAutoDeclenchee: true,
        dernierRavitaillement: 'Recharge automatique 50 000 FCFA validée'
    }
];

router.get('/statuts', (req, res) => {
    res.json({
        succes: true,
        plafondMensuelZoneFcfa: 150000,
        tournees: tournéesSuperviseurs
    });
});

router.post('/demander-recharge', (req, res) => {
    const { superviseurNom, montantFcfa, motif } = req.body || {};
    const t = tournéesSuperviseurs[0];
    const mt = parseInt(montantFcfa, 10) || 50000;
    t.soldeCarteTotalFcfa += mt;
    t.rechargeAutoDeclenchee = false;
    res.json({
        succes: true,
        message: `Carte Carburant de ${superviseurNom || t.superviseurNom} rechargée avec succès de ${mt.toLocaleString('fr-FR')} FCFA.`
    });
});

module.exports = router;
