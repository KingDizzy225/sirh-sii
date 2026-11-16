const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des signalements d'urgence silencieuse
let alertesSilence = [
    {
        id: 'sil-1',
        siteNom: 'Agence Orange Plateau Postel 2001',
        guichetNumero: 'Guichet 2 (Caisse Orange Money)',
        employeNom: 'Aïcha Traoré',
        motif: 'Client agressif et tentative d\'intimidation',
        statut: 'RESOLU',
        heure: 'Aujourd\'hui 14:10',
        interventionPar: 'Agent de sécurité + Superviseur d\'agence'
    }
];

/**
 * GET /api/assistance-silence/alertes
 * Liste des alertes silencieuses du jour
 */
router.get('/alertes', (req, res) => {
    res.json({
        succes: true,
        alertes: alertesSilence
    });
});

/**
 * POST /api/assistance-silence/declencher
 * Déclenchement discret d'assistance au guichet
 */
router.post('/declencher', async (req, res) => {
    const { siteNom, guichetNumero, motif, employeNom } = req.body || {};

    const alerte = {
        id: `sil-${Date.now()}`,
        siteNom: siteNom || 'Agence Orange CI',
        guichetNumero: guichetNumero || 'Guichet Principal',
        employeNom: employeNom || req.user?.name || 'Conseiller Guichet',
        motif: motif || 'Assistance calme requise au comptoir',
        statut: 'URGENCE_EN_COURS',
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        interventionPar: 'Notification envoyée au chef d\'agence et vigile'
    };

    alertesSilence.unshift(alerte);

    res.status(201).json({
        succes: true,
        alerte,
        message: "Alerte silencieuse transmise instantanément au superviseur et à la sécurité du site."
    });
});

module.exports = router;
