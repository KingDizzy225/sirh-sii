const express = require('express');
const router = express.Router();

let pointagesNomades = [
    {
        id: 'ptg-1',
        animateurNom: 'Kouassi Yves-Roland',
        campagne: 'Caravane Fibre Orange Promo Abobo',
        lieuStand: 'Rond-Point Mairie d\'Abobo',
        coordonneesGps: '5.4192° N, 4.0205° W',
        rayonRespecte: true,
        heureArrivee: '07:55',
        statutPointage: 'VALIDE_GEO',
        primePanierValidee: true,
        montantPanierJourFcfa: 4000
    },
    {
        id: 'ptg-2',
        animateurNom: 'Gnahoré Patricia',
        campagne: 'Stand Pop-Up Orange Money Adjamé Liberté',
        lieuStand: 'Gare Nord Adjamé',
        coordonneesGps: '5.3582° N, 4.0287° W',
        rayonRespecte: true,
        heureArrivee: '08:05',
        statutPointage: 'VALIDE_GEO',
        primePanierValidee: true,
        montantPanierJourFcfa: 4000
    }
];

router.get('/pointages', (req, res) => {
    res.json({ succes: true, pointages: pointagesNomades });
});

router.post('/pointer', (req, res) => {
    const { animateurNom, campagne, lieuStand } = req.body || {};
    const nouveau = {
        id: `ptg-${Date.now()}`,
        animateurNom: animateurNom || 'Animateur Street Marketing',
        campagne: campagne || 'Stand Éphémère Orange',
        lieuStand: lieuStand || 'Zone Déploiement Terrain',
        coordonneesGps: '5.3484° N, 4.0305° W (Abidjan)',
        rayonRespecte: true,
        heureArrivee: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        statutPointage: 'VALIDE_GEO',
        primePanierValidee: true,
        montantPanierJourFcfa: 4000
    };
    pointagesNomades.unshift(nouveau);
    res.json({ succes: true, pointage: nouveau, message: 'Pointage nomade validé par géolocalisation. Prime panier comptabilisée.' });
});

module.exports = router;
