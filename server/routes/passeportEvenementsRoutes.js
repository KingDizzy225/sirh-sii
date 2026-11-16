const express = require('express');
const router = express.Router();

let missionsEvenementielles = [
    {
        id: 'evt-01',
        nomEvenement: 'Concert Géant Orange Palais de la Culture Treichville',
        typeEvenement: 'CONCERT_ET_FESTIVAL',
        dateMission: '28/10/2026',
        conseillersSelectionnes: [
            { nom: 'Kouassi Yves-Roland', matricule: 'EMP-7712', agence: 'Yopougon Siporex', role: 'Vente SIM & Recharges Orange Money' },
            { nom: 'Diomandé Mariam', matricule: 'EMP-5510', agence: 'Plateau Postel', role: 'Démonstration Fibre & 5G' }
        ],
        primeMissionJourFcfa: 25000,
        badgeVipLivres: true,
        panierRepasInclus: true,
        statutMission: 'EQUIPE_CONFIRMEE'
    },
    {
        id: 'evt-02',
        nomEvenement: 'Salon International de l\'Agriculture (SARA Abidjan)',
        typeEvenement: 'SALON_PROFESSIONNEL_VIP',
        dateMission: '15/11/2026',
        conseillersSelectionnes: [
            { nom: 'Gouaméné Marc', matricule: 'EMP-3319', agence: 'Marcory Résidentiel', role: 'Offres Pro & Flottes Entreprises' }
        ],
        primeMissionJourFcfa: 35000,
        badgeVipLivres: false,
        panierRepasInclus: true,
        statutMission: 'EN_COURS_DE_SELECTION_ROTATIVE'
    }
];

router.get('/missions', (req, res) => {
    res.json({
        succes: true,
        principeSelection: 'Roulement équitable : priorité aux conseillers n\'ayant pas participé aux 2 dernières missions VIP',
        missions: missionsEvenementielles
    });
});

router.post('/candidater', (req, res) => {
    const { nomEvenement, conseillerNom, agence } = req.body || {};
    res.json({
        succes: true,
        message: `Candidature de ${conseillerNom || 'Conseiller'} enregistrée pour ${nomEvenement || 'l\'événement Orange'}. Validation selon le barème de roulement équitable.`
    });
});

module.exports = router;
