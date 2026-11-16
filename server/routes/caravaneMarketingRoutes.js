const express = require('express');
const router = express.Router();

let tournéesCaravanes = [
    {
        id: 'carav-01',
        nomCampagne: 'Caravane 4G/5G Orange Festi-Marchés Adjamé',
        dateDebut: '10/11/2026',
        dateFin: '15/11/2026',
        zoneCible: 'Carrefour Roxy, Forum des Marchés & Liberté (Adjamé)',
        chefEquipeNom: 'Koffi Serge (Superviseur B2C)',
        animateursPresents: 12,
        materielDeploye: '1x Camion Podium Sonorisé + 2x Tentes Orange + 1x Mascotte',
        dotationGoodies: '400 T-shirts Orange, 250 Casquettes, 1 000 Flyers, 150 Parapluies',
        caisseRoulementFcfa: 750000,
        activationsSimJour: 340,
        primeActivationTotalFcfa: 170000,
        statutMission: 'EN_COURS_DEPLOIEMENT',
        geolocalisationLive: 'Carrefour Liberté (Adjamé)'
    },
    {
        id: 'carav-02',
        nomCampagne: 'Roadshow Box Fibre Pro Zone Industrielle Yopougon',
        dateDebut: '05/11/2026',
        dateFin: '08/11/2026',
        zoneCible: 'Zone Industrielle & Bel Air (Yopougon)',
        chefEquipeNom: 'Amina Diaby (Responsable Vente Directe)',
        animateursPresents: 8,
        materielDeploye: '2x Pick-up Flotte SII + Stand Démo Fibre Interactive',
        dotationGoodies: '150 Polos Entreprise, 300 Stylos métal, 200 Bloc-notes',
        caisseRoulementFcfa: 500000,
        activationsSimJour: 85,
        primeActivationTotalFcfa: 85000,
        statutMission: 'CLOTURE_REUSSIE',
        geolocalisationLive: 'Terminé (Bilan transmis)'
    }
];

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        caravanesActives: tournéesCaravanes.filter(c => c.statutMission === 'EN_COURS_DEPLOIEMENT').length,
        totalActivationsSemaine: 845,
        primesVerseesOrangeMoneyFcfa: 422500,
        caravanes: tournéesCaravanes
    });
});

router.post('/planifier-caravane', (req, res) => {
    const { nomCampagne, zoneCible, chefEquipeNom, animateursPresents, caisseRoulementFcfa } = req.body;
    const nouvelle = {
        id: `carav-${Date.now().toString().slice(-4)}`,
        nomCampagne: nomCampagne || 'Caravane Vente Flash Orange',
        dateDebut: new Date().toLocaleDateString('fr-FR'),
        dateFin: 'Sous 5 jours',
        zoneCible: zoneCible || 'Carrefour Siporex (Yopougon)',
        chefEquipeNom: chefEquipeNom || 'Superviseur Terrain SII',
        animateursPresents: Number(animateursPresents) || 10,
        materielDeploye: '1x Pick-up Podium Sono + Kits de Vente Nomades',
        dotationGoodies: '300 T-shirts + 500 flyers Orange CI',
        caisseRoulementFcfa: Number(caisseRoulementFcfa) || 500000,
        activationsSimJour: 0,
        primeActivationTotalFcfa: 0,
        statutMission: 'EN_COURS_DEPLOIEMENT',
        geolocalisationLive: zoneCible || 'Zone de déploiement active'
    };
    tournéesCaravanes.unshift(nouvelle);
    res.json({ succes: true, caravane: nouvelle });
});

module.exports = router;
