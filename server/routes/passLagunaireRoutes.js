const express = require('express');
const router = express.Router();

let abonnementsLagunaires = [
    {
        id: 'lag-01',
        employeNom: 'Bonaventure N\'Guessan',
        matricule: 'EMP-3810',
        domicile: 'Abobo-Doumé (Attécoubé)',
        agenceAffectation: 'Agence Orange Plateau République',
        compagnieBateau: 'SOTRA Bateau-Bus Aqualines',
        gareDepart: 'Gare Lagunaire Abobo-Doumé',
        gareArrivee: 'Gare Lagunaire Plateau Marché',
        tempsTrajetFluvialMin: 12, // au lieu de 1h30 en voiture !
        coutMensuelPrisEnChargeFcfa: 25000,
        numeroCartePass: 'SOTRA-PASS-2026-9018',
        statutAbonnement: 'ACTIF_RECHARGE_CONFIRME',
        gainTempsJournalierHeures: 2.2
    },
    {
        id: 'lag-02',
        employeNom: 'Carole Kouassi',
        matricule: 'EMP-4991',
        domicile: 'Cocody Blockhauss',
        agenceAffectation: 'Agence Orange Treichville Arras',
        compagnieBateau: 'STL (Société de Transport Lagunaire)',
        gareDepart: 'Gare STL Blockhauss',
        gareArrivee: 'Gare STL Treichville Pont Houphouët',
        tempsTrajetFluvialMin: 8, // au lieu de 45 min de bouchon pont HKB
        coutMensuelPrisEnChargeFcfa: 30000,
        numeroCartePass: 'STL-CONFORT-44912',
        statutAbonnement: 'ACTIF_RECHARGE_CONFIRME',
        gainTempsJournalierHeures: 1.5
    },
    {
        id: 'lag-03',
        employeNom: 'Marc Akpa',
        matricule: 'EMP-6120',
        domicile: 'Yopougon Niangon Sud',
        agenceAffectation: 'Agence Orange Plateau Postel 2001',
        compagnieBateau: 'CITRANS Aqualines',
        gareDepart: 'Gare Lagunaire Yopougon Kouté',
        gareArrivee: 'Gare Lagunaire Plateau',
        tempsTrajetFluvialMin: 18,
        coutMensuelPrisEnChargeFcfa: 28000,
        numeroCartePass: 'CITRANS-VIP-8812',
        statutAbonnement: 'EN_ATTENTE_RENOUVELLEMENT',
        gainTempsJournalierHeures: 2.0
    }
];

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        salariesBeneficiairesLagunaire: abonnementsLagunaires.length,
        budgetMensuelMobiliteFcfa: 83000,
        heuresBouchonsEviteesParMois: 168,
        tauxPonctualiteAgentsBateau: '99.4%',
        abonnements: abonnementsLagunaires
    });
});

router.post('/souscrire-pass', (req, res) => {
    const { employeNom, matricule, domicile, agenceAffectation, compagnieBateau } = req.body;
    const nouveau = {
        id: `lag-${Date.now().toString().slice(-4)}`,
        employeNom: employeNom || 'Conseiller Commercial',
        matricule: matricule || 'EMP-7722',
        domicile: domicile || 'Yopougon Abobodoumé',
        agenceAffectation: agenceAffectation || 'Agence Orange Plateau',
        compagnieBateau: compagnieBateau || 'SOTRA Bateau-Bus Aqualines',
        gareDepart: 'Gare Lagunaire la plus proche',
        gareArrivee: 'Gare Centrale Plateau / Treichville',
        tempsTrajetFluvialMin: 15,
        coutMensuelPrisEnChargeFcfa: 25000,
        numeroCartePass: `PASS-FLUVIAL-${Math.floor(1000 + Math.random() * 9000)}`,
        statutAbonnement: 'ACTIF_RECHARGE_CONFIRME',
        gainTempsJournalierHeures: 2.0
    };
    abonnementsLagunaires.unshift(nouveau);
    res.json({ succes: true, abonnement: nouveau });
});

module.exports = router;
