const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des registres de clés et coffres
let passationsCles = [
    {
        id: 'cle-1',
        siteNom: 'Agence Orange Plateau Postel 2001',
        elementCle: 'Clé Principale Coffre-Fort & Armoire SIM',
        remisPar: 'Kouassi Konan (Chef d\'Agence)',
        recuPar: 'Aïcha Traoré (Caissière Principale)',
        heure: 'Aujourd\'hui 08:20',
        statut: 'ACTIF_EN_MAIN', // 'ACTIF_EN_MAIN' | 'REMIS_COFFRE'
        dateRemise: new Date()
    },
    {
        id: 'cle-2',
        siteNom: 'Agence Cap Sud Marcory',
        elementCle: 'Trousseau Rideau Métallique & Alarme',
        remisPar: 'Mamadou Bakayoko',
        recuPar: 'Bintou Sékou',
        heure: 'Aujourd\'hui 08:15',
        statut: 'ACTIF_EN_MAIN',
        dateRemise: new Date()
    }
];

/**
 * GET /api/cles-coffres/passations
 * Liste des détentions de clés actives et historique
 */
router.get('/passations', (req, res) => {
    res.json({
        succes: true,
        passations: passationsCles
    });
});

/**
 * POST /api/cles-coffres/transmettre
 * Enregistrement sécurisé de la passation de clé entre 2 salariés
 */
router.post('/transmettre', (req, res) => {
    const { siteNom, elementCle, remisPar, recuPar } = req.body || {};

    const passation = {
        id: `cle-${Date.now()}`,
        siteNom: siteNom || 'Agence Orange CI',
        elementCle: elementCle || 'Clé Coffre-Fort & Stock SIM',
        remisPar: remisPar || req.user?.name || 'Collaborateur Remettant',
        recuPar: recuPar || 'Collaborateur Réceptionnaire',
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        statut: 'ACTIF_EN_MAIN',
        dateRemise: new Date()
    };

    passationsCles.unshift(passation);

    res.status(201).json({
        succes: true,
        passation,
        message: `Passation validée : ${passation.elementCle} est désormais officiellement sous la garde de ${passation.recuPar}.`
    });
});

module.exports = router;
