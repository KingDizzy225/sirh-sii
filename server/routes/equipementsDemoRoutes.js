const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des équipements de démo sous garde
let equipementsDemo = [
    {
        id: 'dmo-1',
        designation: 'Apple iPhone 16 Pro Max 256 Go (Démo)',
        imei: '358921094412881',
        siteNom: 'Agence Orange Plateau Postel 2001',
        detenuPar: 'Jean-Marc Koffi',
        heurePrise: '08:15',
        statut: 'EN_COMPTOIR', // 'EN_COMPTOIR' | 'RESTITUE_COFFRE'
        dateDernierControle: 'Aujourd\'hui 08:15'
    },
    {
        id: 'dmo-2',
        designation: 'Samsung Galaxy S25 Ultra 5G (Démo)',
        imei: '354412098877112',
        siteNom: 'Agence Orange Plateau Postel 2001',
        detenuPar: 'Aïcha Traoré',
        heurePrise: '08:20',
        statut: 'EN_COMPTOIR',
        dateDernierControle: 'Aujourd\'hui 08:20'
    },
    {
        id: 'dmo-3',
        designation: 'Terminal TPE Pax A920 Orange Money Caisse 1',
        imei: 'TPE-PAX-8812',
        siteNom: 'Agence Cap Sud Marcory',
        detenuPar: 'Mamadou Bakayoko',
        heurePrise: '08:10',
        statut: 'EN_COMPTOIR',
        dateDernierControle: 'Aujourd\'hui 08:10'
    }
];

/**
 * GET /api/equipements-demo/liste
 * Inventaire en temps réel des téléphones de démo et TPE
 */
router.get('/liste', (req, res) => {
    res.json({
        succes: true,
        equipements: equipementsDemo
    });
});

/**
 * POST /api/equipements-demo/scanner
 * Enregistrement de la prise en charge ou réintégration coffre en 5s
 */
router.post('/scanner', (req, res) => {
    const { designation, imei, siteNom, detenuPar, action } = req.body || {};
    const estRestitution = action === 'RESTITUTION_COFFRE';

    const eq = equipementsDemo.find(e => e.imei === imei);
    if (eq) {
        eq.statut = estRestitution ? 'RESTITUE_COFFRE' : 'EN_COMPTOIR';
        eq.detenuPar = estRestitution ? 'Coffre Sécurisé' : (detenuPar || req.user?.name || 'Conseiller Vente');
        eq.dateDernierControle = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return res.json({ succes: true, equipement: eq, message: `Statut mis à jour : ${eq.statut}` });
    }

    const nouveau = {
        id: `dmo-${Date.now()}`,
        designation: designation || 'Smartphone Démo Orange',
        imei: imei || `IMEI-${Math.floor(100000 + Math.random() * 900000)}`,
        siteNom: siteNom || 'Agence Orange CI',
        detenuPar: detenuPar || req.user?.name || 'Conseiller Vente',
        heurePrise: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        statut: 'EN_COMPTOIR',
        dateDernierControle: 'À l\'instant'
    };

    equipementsDemo.unshift(nouveau);

    res.status(201).json({
        succes: true,
        equipement: nouveau,
        message: `Équipement assigné avec succès sous la garde de ${nouveau.detenuPar}.`
    });
});

module.exports = router;
