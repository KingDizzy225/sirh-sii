const express = require('express');
const router = express.Router();

let collectesDece = [
    {
        id: 'rec-01',
        agenceNom: 'Agence Orange Treichville Arras',
        kilosBatteriesCollectees: 42.5,
        telephonesHorsUsageRecus: 118,
        cablesChargeursKilos: 18.0,
        primeEcoEquipeGagneeFcfa: 85000,
        partenaireRecyclage: 'ONG Recyclage Électronique Côte d\'Ivoire & Orange Vert',
        statutEnlevement: 'COLLECTEUR_PASSE_PESEE_VALIDEE',
        datePesee: '08/10/2026'
    },
    {
        id: 'rec-02',
        agenceNom: 'Agence Orange Yopougon Maroc',
        kilosBatteriesCollectees: 31.0,
        telephonesHorsUsageRecus: 84,
        cablesChargeursKilos: 14.5,
        primeEcoEquipeGagneeFcfa: 62000,
        partenaireRecyclage: 'ONG Recyclage Électronique Côte d\'Ivoire',
        statutEnlevement: 'BAC_EN_COURS_DE_REMPLISSAGE',
        datePesee: '12/10/2026'
    }
];

router.get('/statistiques', (req, res) => {
    res.json({
        succes: true,
        baremePrime: '500 FCFA par téléphone hors d\'usage collecté + 1 000 FCFA / kg de batteries usagées reversés dans la cagnotte équipe boutique',
        agences: collectesDece
    });
});

router.post('/peser-bac', (req, res) => {
    const { agenceNom, nbTelephones, kgBatteries } = req.body || {};
    const ag = collectesDece[0];
    const nb = parseInt(nbTelephones, 10) || 10;
    const kg = parseFloat(kgBatteries) || 5;
    const gain = (nb * 500) + Math.round(kg * 1000);
    ag.primeEcoEquipeGagneeFcfa += gain;

    res.json({
        succes: true,
        message: `Pesée enregistrée pour ${agenceNom || ag.agenceNom} ! +${gain.toLocaleString('fr-FR')} FCFA ajoutés à la cagnotte de fin d'année de l'équipe.`
    });
});

module.exports = router;
