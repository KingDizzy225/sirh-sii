const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des cercles de tontine
let cerclesTontine = [
    {
        id: 'tnt-1',
        nom: 'Tontine Élite Agences Abidjan Sud',
        montantCotisationMensuelle: 25000,
        nombreMembres: 10,
        potMensuelTotal: 250000,
        tourActuelMois: 'Octobre 2026 (Tour 4/10)',
        beneficiaireDuMois: 'Kouassi Konan (Agence Plateau)',
        statutPrelevement: 'PRELEVE_PAIE_OK',
        dateVirementOM: '28 Octobre 2026',
        membres: [
            { nom: 'Aïcha Traoré', site: 'Agence Plateau', tourMois: 'Juillet 2026', aRecu: true },
            { nom: 'Mamadou Bakayoko', site: 'Agence Cap Sud', tourMois: 'Août 2026', aRecu: true },
            { nom: 'Bintou Sékou', site: 'Agence Cap Sud', tourMois: 'Septembre 2026', aRecu: true },
            { nom: 'Kouassi Konan', site: 'Agence Plateau', tourMois: 'Octobre 2026', aRecu: false },
            { nom: 'Jean-Marc Koffi', site: 'Agence Plateau', tourMois: 'Novembre 2026', aRecu: false }
        ]
    },
    {
        id: 'tnt-2',
        nom: 'Tontine Solidarité Yopougon & Intérieur',
        montantCotisationMensuelle: 15000,
        nombreMembres: 8,
        potMensuelTotal: 120000,
        tourActuelMois: 'Octobre 2026 (Tour 2/8)',
        beneficiaireDuMois: 'Amadou Koné (Agence Bouaké)',
        statutPrelevement: 'PRELEVE_PAIE_OK',
        dateVirementOM: '28 Octobre 2026',
        membres: [
            { nom: 'Fatou Bamba', site: 'Agence Yopougon', tourMois: 'Septembre 2026', aRecu: true },
            { nom: 'Amadou Koné', site: 'Agence Bouaké', tourMois: 'Octobre 2026', aRecu: false }
        ]
    }
];

/**
 * GET /api/tontine-rh/cercles
 * Renvoie les cercles de tontine RH actifs
 */
router.get('/cercles', (req, res) => {
    res.json({
        succes: true,
        cercles: cerclesTontine
    });
});

/**
 * POST /api/tontine-rh/creer
 * Créer un nouveau cercle d'épargne collaborative avec prélèvement paie sécurisé
 */
router.post('/creer', (req, res) => {
    const { nom, montantCotisation, nombreMembres } = req.body || {};
    const cotis = parseInt(montantCotisation, 10) || 20000;
    const nb = parseInt(nombreMembres, 10) || 10;

    const nouveauCercle = {
        id: `tnt-${Date.now()}`,
        nom: nom || 'Tontine Salariés SII',
        montantCotisationMensuelle: cotis,
        nombreMembres: nb,
        potMensuelTotal: cotis * nb,
        tourActuelMois: 'Prochain mois (Tour 1)',
        beneficiaireDuMois: 'Attribution en cours',
        statutPrelevement: 'EN_ATTENTE_LANCEMENT',
        dateVirementOM: 'Fin de mois',
        membres: []
    };

    cerclesTontine.unshift(nouveauCercle);

    res.status(201).json({
        succes: true,
        cercle: nouveauCercle,
        message: "Cercle de tontine RH créé avec succès ! Les prélèvements seront automatisés sur la paie."
    });
});

module.exports = router;
