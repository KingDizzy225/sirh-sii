const express = require('express');
const router = express.Router();

let campagnesFestives = [
    {
        id: 'fete-1',
        evenement: 'Tabaski & Fêtes Musulmanes 2026',
        dotationType: 'Bon d\'Achat Prosuma / Carrefour + Sac de Riz 25kg',
        valeurBonFcfa: 40000,
        beneficiairesConcernes: 142,
        statutDistribution: 'BON_VIRÉ_WALLET_ET_LIVRAISON_EN_COURS',
        dateFete: 'Juin 2026',
        roulementAstreinte: 'Équitable (permanence assurée par les volontaires avec prime x2)'
    },
    {
        id: 'fete-2',
        evenement: 'Pâques & Paquinou 2026',
        dotationType: 'Bon d\'Achat Alimentaire + Forfait Transport Région',
        valeurBonFcfa: 35000,
        beneficiairesConcernes: 185,
        statutDistribution: 'CLÔTURÉ_SATISFAIT',
        dateFete: 'Avril 2026',
        roulementAstreinte: 'Validé en réunion de délégués du personnel'
    }
];

let listeDotationsSalarie = [
    {
        id: 'dot-1',
        employeNom: 'Cissé Mamadou',
        matricule: 'EMP-1102',
        campagne: 'Tabaski 2026',
        codeBonVoucher: 'PRS-TBK-9921',
        montantFcfa: 40000,
        statutRetrait: 'UTILISE_EN_MAGASIN',
        astreinteValidee: 'Non (En repos familial)'
    },
    {
        id: 'dot-2',
        employeNom: 'N\'Dri Kouadio',
        matricule: 'EMP-2903',
        campagne: 'Paquinou 2026',
        codeBonVoucher: 'PRS-PQN-3301',
        montantFcfa: 35000,
        statutRetrait: 'LIVRE_CONFIRME',
        astreinteValidee: 'Oui (Astreinte payée double)'
    }
];

router.get('/campagnes', (req, res) => {
    res.json({
        succes: true,
        campagnes: campagnesFestives,
        dotations: listeDotationsSalarie
    });
});

router.post('/attribuer', (req, res) => {
    const { employeNom, campagne, montantFcfa, astreinte } = req.body || {};
    const nouvelle = {
        id: `dot-${Date.now()}`,
        employeNom: employeNom || 'Collaborateur SII',
        matricule: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        campagne: campagne || 'Fêtes de Fin d\'Année 2026',
        codeBonVoucher: `PRS-FST-${Math.floor(1000 + Math.random() * 9000)}`,
        montantFcfa: parseInt(montantFcfa, 10) || 40000,
        statutRetrait: 'BON_DISPONIBLE_ESPACE_SALARIE',
        astreinteValidee: astreinte || 'Non (Repos)'
    };
    listeDotationsSalarie.unshift(nouvelle);
    res.json({ succes: true, dotation: nouvelle, message: 'Bon festif et planning attribués avec équité !' });
});

module.exports = router;
