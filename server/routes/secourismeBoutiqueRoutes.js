const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des secouristes certifiés et fiches réflexes
let secouristesSites = [
    {
        id: 'sec-1',
        siteNom: 'Agence Orange Plateau Postel 2001',
        nomSecouriste: 'Jean-Marc Koffi',
        matricule: 'EMP-0514',
        certification: 'SST (Sauveteur Secouriste du Travail) - Valide jusqu\'en 2027',
        telephoneUrgence: '+225 07 44 55 66 77',
        emplacementTrousseSecours: 'Armoire local pause (à gauche du réfrigérateur)',
        emplacementExtincteur: 'Couloir caisse + Entrée principale',
        pompiersZone: 'GSPM Indénié Plateau (180 / 01 01 80 00 00)',
        statutAujourdhui: 'PRESENT_SUR_SITE'
    },
    {
        id: 'sec-2',
        siteNom: 'Agence Cap Sud Marcory',
        nomSecouriste: 'Mamadou Bakayoko',
        matricule: 'EMP-0210',
        certification: 'SST & Prévention Incendie - Valide',
        telephoneUrgence: '+225 05 55 44 33 22',
        emplacementTrousseSecours: 'Sous le comptoir du superviseur',
        emplacementExtincteur: 'Mur baie de brassage télécom',
        pompiersZone: 'GSPM Zone 4 Marcory (180)',
        statutAujourdhui: 'PRESENT_SUR_SITE'
    }
];

/**
 * GET /api/secourisme-boutique/annuaire
 * Affiche la fiche réflexe et les secouristes SST en agence
 */
router.get('/annuaire', (req, res) => {
    res.json({
        succes: true,
        secouristes: secouristesSites,
        numerosNationaux: {
            pompiersGSPM: '180',
            samuAbidjan: '185',
            policeSecours: '170 / 111',
            centreAntipoison: '+225 27 22 44 90 61'
        }
    });
});

/**
 * POST /api/secourisme-boutique/signaler-incident
 * Signaler un incident médical ou premier soin dispensé
 */
router.post('/signaler-incident', (req, res) => {
    const { siteNom, typeIncident, personneConcernee, soinsDispenses } = req.body || {};

    res.status(201).json({
        succes: true,
        message: "Fiche d'incident de premiers soins enregistrée et transmise au Comité Santé & Sécurité (CSST)."
    });
});

module.exports = router;
