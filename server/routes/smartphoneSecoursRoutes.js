const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des prêts de secours de smartphone
let pretsSmartphone = [
    {
        id: 'jok-1',
        employeNom: 'Yves Koffi',
        matricule: 'EMP-0312',
        siteNom: 'Agence Yopougon Siporex',
        motif: 'Écran brisé en rentrant hier soir',
        modelePrete: 'Orange Neva Zen 4G (Stock Tampon Agence)',
        imei: '864201048821901',
        datePret: 'Aujourd\'hui 08:35',
        dureeJours: 7,
        statut: 'EN_COURS', // 'EN_COURS' | 'RESTITUE'
        optionAchatSubventionne: true
    }
];

/**
 * GET /api/smartphone-secours/prets
 * Liste des prêts de smartphones tampon
 */
router.get('/prets', (req, res) => {
    res.json({
        succes: true,
        prets: pretsSmartphone
    });
});

/**
 * POST /api/smartphone-secours/attribuer
 * Attribuer un téléphone tampon à un conseiller en panne
 */
router.post('/attribuer', (req, res) => {
    const { employeNom, matricule, siteNom, motif, modelePrete, dureeJours } = req.body || {};

    const pret = {
        id: `jok-${Date.now()}`,
        employeNom: employeNom || req.user?.name || 'Conseiller Vente',
        matricule: matricule || 'EMP-SII',
        siteNom: siteNom || 'Agence Orange CI',
        motif: motif || 'Dépannage casse/perte smartphone',
        modelePrete: modelePrete || 'Smartphone Tampon SII 4G',
        imei: `86420104${Math.floor(1000000 + Math.random() * 9000000)}`,
        datePret: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        dureeJours: parseInt(dureeJours, 10) || 7,
        statut: 'EN_COURS',
        optionAchatSubventionne: true
    };

    pretsSmartphone.unshift(pret);

    res.status(201).json({
        succes: true,
        pret,
        message: `Smartphone Joker attribué à ${pret.employeNom} pour ${pret.dureeJours} jours. Configuration Orange opérationnelle !`
    });
});

module.exports = router;
