const express = require('express');
const router = express.Router();

let mentoratFeminin = [
    {
        id: 'fem-01',
        filleuleNom: 'Traoré Kadiatou',
        posteActuel: 'Conseillère Commerciale Fibre (Boutique Cocody)',
        posteCible: 'Cheffe d\'Agence Commerciale SII',
        mentoreNom: 'Mme Koné Viviane (Directrice des Opérations Réseau)',
        progressionParcoursPourcent: 75,
        modulesSuivis: ['Pilotage du P&L Agence', 'Leadership & Motivation d\'Équipe', 'Gestion des Conflits Clients'],
        statutMentorat: 'EN_BONNE_VOIE_PROMOTION_PROCHAINE',
        prochaineSession: 'Jeudi 22 Octobre à 14h'
    },
    {
        id: 'fem-02',
        filleuleNom: 'Bahi Estelle',
        posteActuel: 'Animatrice Caravane Mobile Orange',
        posteCible: 'Superviseure Régionale Street Marketing',
        mentoreNom: 'Mme Touré Awa (Cheffe d\'Agence Treichville)',
        progressionParcoursPourcent: 50,
        modulesSuivis: ['Logistique Événementielle', 'Gestion des Stocks de Cartes SIM'],
        statutMentorat: 'ACTIF',
        prochaineSession: 'Vendredi 23 Octobre à 10h'
    }
];

router.get('/programme', (req, res) => {
    res.json({
        succes: true,
        objectifMixite: '45% de femmes chefs d\'agence d\'ici fin 2027',
        binomes: mentoratFeminin
    });
});

router.post('/rejoindre-programme', (req, res) => {
    const { nomCollaboratrice, posteActuel, ambitionPoste } = req.body || {};
    res.json({
        succes: true,
        message: `Candidature de ${nomCollaboratrice || 'Collaboratrice'} enregistrée au programme Leadership Féminin SII ! Une directrice mentore vous sera assignée sous 48h.`
    });
});

module.exports = router;
