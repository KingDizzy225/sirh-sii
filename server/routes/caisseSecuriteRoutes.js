const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des clôtures de caisse
let cloturesCaisse = [
    {
        id: 'cls-1',
        siteNom: 'Agence Orange Plateau Postel 2001',
        caissierNom: 'Aïcha Traoré',
        matricule: 'EMP-0498',
        dateHeure: 'Aujourd\'hui 18:45',
        fondInitialFcfa: 150000,
        soldeOrangeMoneyTheorique: 12450000,
        soldeOrangeMoneyReel: 12450000,
        especesTheoriquesFcfa: 2850000,
        especesCompteesFcfa: 2850000,
        detailBillets: {
            dixMille: 200,
            cinqMille: 130,
            deuxMille: 80,
            mille: 40
        },
        ecartFcfa: 0,
        statut: 'PARFAIT', // 'PARFAIT' | 'ANOMALIE'
        badgeDecerne: 'Badge Caisse Parfaite 🏆 (+5 000 FCFA trimestriel)'
    },
    {
        id: 'cls-2',
        siteNom: 'Agence Orange Yopougon Siporex',
        caissierNom: 'Yves Koffi',
        matricule: 'EMP-0312',
        dateHeure: 'Aujourd\'hui 18:30',
        fondInitialFcfa: 200000,
        soldeOrangeMoneyTheorique: 8900000,
        soldeOrangeMoneyReel: 8900000,
        especesTheoriquesFcfa: 1650000,
        especesCompteesFcfa: 1645000,
        detailBillets: {
            dixMille: 120,
            cinqMille: 70,
            deuxMille: 40,
            mille: 15
        },
        ecartFcfa: -5000,
        statut: 'ANOMALIE',
        badgeDecerne: null
    }
];

/**
 * GET /api/caisse-securite/clotures
 * Liste des clôtures et états de caisse du jour
 */
router.get('/clotures', (req, res) => {
    const total = cloturesCaisse.length;
    const parfaites = cloturesCaisse.filter(c => c.statut === 'PARFAIT').length;
    res.json({
        succes: true,
        total,
        parfaites,
        tauxConformite: total > 0 ? Math.round((parfaites / total) * 100) : 100,
        clotures: cloturesCaisse
    });
});

/**
 * POST /api/caisse-securite/enregistrer
 * Clôture de caisse en 3 minutes avec calcul automatique d'écart
 */
router.post('/enregistrer', (req, res) => {
    const { 
        siteNom, caissierNom, matricule, 
        fondInitialFcfa, soldeOmTheorique, soldeOmReel,
        especesTheoriquesFcfa, detailBillets 
    } = req.body || {};

    const dix = (parseInt(detailBillets?.dixMille, 10) || 0) * 10000;
    const cinq = (parseInt(detailBillets?.cinqMille, 10) || 0) * 5000;
    const deux = (parseInt(detailBillets?.deuxMille, 10) || 0) * 2000;
    const mille = (parseInt(detailBillets?.mille, 10) || 0) * 1000;
    const totalEspecesComptees = dix + cinq + deux + mille;

    const ecartEspeces = totalEspecesComptees - (parseInt(especesTheoriquesFcfa, 10) || 0);
    const ecartOm = (parseInt(soldeOmReel, 10) || 0) - (parseInt(soldeOmTheorique, 10) || 0);
    const ecartTotal = ecartEspeces + ecartOm;
    const estParfait = ecartTotal === 0;

    const nouvelleCloture = {
        id: `cls-${Date.now()}`,
        siteNom: siteNom || 'Agence Orange',
        caissierNom: caissierNom || req.user?.name || 'Caissier Guichet',
        matricule: matricule || 'EMP-CAISSE',
        dateHeure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        fondInitialFcfa: parseInt(fondInitialFcfa, 10) || 150000,
        soldeOrangeMoneyTheorique: parseInt(soldeOmTheorique, 10) || 0,
        soldeOrangeMoneyReel: parseInt(soldeOmReel, 10) || 0,
        especesTheoriquesFcfa: parseInt(especesTheoriquesFcfa, 10) || 0,
        especesCompteesFcfa: totalEspecesComptees,
        detailBillets: detailBillets || {},
        ecartFcfa: ecartTotal,
        statut: estParfait ? 'PARFAIT' : 'ANOMALIE',
        badgeDecerne: estParfait ? 'Badge Caisse Parfaite 🏆' : null
    };

    cloturesCaisse.unshift(nouvelleCloture);

    res.status(201).json({
        succes: true,
        cloture: nouvelleCloture,
        message: estParfait
            ? "✨ Rapprochement parfait à 0 FCFA d'écart ! Badge Caisse Parfaite attribué."
            : `⚠️ Écart constaté de ${ecartTotal.toLocaleString()} FCFA. Protocole de vérification consigné.`
    });
});

module.exports = router;
