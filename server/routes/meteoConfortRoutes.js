const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire de la météo confort agence
let relevesConfort = [
    {
        id: 'cnf-1',
        siteNom: 'Agence Orange Yopougon Siporex',
        temperatureRessentie: 33,
        etatClimatisation: 'EN_PANNE', // 'OPTIMAL' | 'DEGRADE' | 'EN_PANNE'
        signalementsEquipe: 4,
        ticketFrigoriste: 'TKT-CLIM-2026-081',
        packsEauLivres: true,
        heureDernierSignalement: 'Aujourd\'hui 11:30',
        recommandationRh: 'Livraison de 4 packs d\'eau minérale effectuée. Frigoriste attendu avant 14h00.'
    },
    {
        id: 'cnf-2',
        siteNom: 'Agence Orange Plateau Postel 2001',
        temperatureRessentie: 23,
        etatClimatisation: 'OPTIMAL',
        signalementsEquipe: 0,
        ticketFrigoriste: null,
        packsEauLivres: false,
        heureDernierSignalement: 'Aujourd\'hui 09:00',
        recommandationRh: 'Conditions de confort optimales pour le personnel et la clientèle.'
    }
];

/**
 * GET /api/meteo-confort/statuts
 * Liste de l'état thermique des agences
 */
router.get('/statuts', (req, res) => {
    res.json({
        succes: true,
        agences: relevesConfort
    });
});

/**
 * POST /api/meteo-confort/signaler
 * Signaler une panne de climatisation ou forte chaleur
 */
router.post('/signaler', (req, res) => {
    const { siteNom, temperatureRessentie, etatClimatisation, details } = req.body || {};
    const temp = parseInt(temperatureRessentie, 10) || 32;

    const alerte = {
        id: `cnf-${Date.now()}`,
        siteNom: siteNom || 'Agence Orange CI',
        temperatureRessentie: temp,
        etatClimatisation: etatClimatisation || 'EN_PANNE',
        signalementsEquipe: 1,
        ticketFrigoriste: temp >= 30 ? `TKT-CLIM-2026-${Math.floor(100 + Math.random() * 900)}` : null,
        packsEauLivres: temp >= 31,
        heureDernierSignalement: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        recommandationRh: temp >= 31 
            ? "Alerte canicule boutique : Ticket frigoriste SLA 4h ouvert + commande packs d'eau fraîche validée."
            : "Signalement enregistré dans le carnet d'entretien."
    };

    relevesConfort.unshift(alerte);

    res.status(201).json({
        succes: true,
        alerte,
        message: temp >= 31 
            ? `🚨 Alerte chaleur émise pour ${alerte.siteNom} ! Prestataire frigoriste et packs d'eau déclenchés.` 
            : "Signalement confort enregistré."
    });
});

module.exports = router;
