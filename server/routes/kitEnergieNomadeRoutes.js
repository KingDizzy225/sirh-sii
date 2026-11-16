const express = require('express');
const router = express.Router();

let parcPowerbanks = [
    {
        id: 'pwb-101',
        animateurNom: 'Kouakou N\'Dri Jean',
        matricule: 'ST-881',
        equipeTerrain: 'Caravane Promotion Fibre Adjamé & Abobo',
        modeleBatterie: 'Anker PowerCore 20 000 mAh Heavy-Duty Orange SII',
        numeroSerie: 'SN-ANK-2026-9921',
        etatBatteriePourcent: 100,
        statutDotation: 'EN_SERVICE_TERRAIN',
        dateAttribution: '01/10/2026',
        chargeRapideTPE: true
    },
    {
        id: 'pwb-102',
        animateurNom: 'Zran Pascal',
        matricule: 'ST-904',
        equipeTerrain: 'Vente Mobile Marché de Koumassi',
        modeleBatterie: 'Anker PowerCore 20 000 mAh Heavy-Duty Orange SII',
        numeroSerie: 'SN-ANK-2026-4410',
        etatBatteriePourcent: 92,
        statutDotation: 'EN_SERVICE_TERRAIN',
        dateAttribution: '05/10/2026',
        chargeRapideTPE: true
    }
];

router.get('/statuts', (req, res) => {
    res.json({
        succes: true,
        normeTerrain: 'Garantie 0 panne de batterie pour les terminaux TPE, smartphones d\'enregistrement et box de démonstration',
        parc: parcPowerbanks
    });
});

router.post('/demander-remplacement', (req, res) => {
    const { animateurNom, motif } = req.body || {};
    res.json({
        succes: true,
        message: `Demande de remplacement de batterie nomade prise en compte pour ${animateurNom || 'Animateur'}. Échange standard disponible au dépôt SII sous 24h.`
    });
});

module.exports = router;
