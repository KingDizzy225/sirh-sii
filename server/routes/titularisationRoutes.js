const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des titularisations
let titularisations = [
    {
        id: 'cdi-1',
        employeNom: 'Jean-Marc Koffi',
        matricule: 'EMP-0514',
        poste: 'Conseiller Commercial Fibre & B2B',
        siteNom: 'Agence Orange Plateau',
        dateTitularisation: '01 Octobre 2026',
        ancienneteStagiaireMois: 12,
        statutPasseport: 'ACTIF',
        motDirection: 'Toutes nos félicitations pour ton passage en CDI. Ton engagement et ta rigueur commerciale font la fierté de SII et de notre partenariat Orange CI !',
        kitRemis: { poloBrode: true, badgeDore: true, primeBienvenue: true }
    },
    {
        id: 'cdi-2',
        employeNom: 'Aïcha Traoré',
        matricule: 'EMP-0498',
        poste: 'Gestionnaire Caisse Orange Money',
        siteNom: 'Agence Orange Yopougon',
        dateTitularisation: '15 Septembre 2026',
        ancienneteStagiaireMois: 18,
        statutPasseport: 'ACTIF',
        motDirection: 'Bienvenue officiellement dans la grande famille des salariés permanents de SII. Continue de briller !',
        kitRemis: { poloBrode: true, badgeDore: true, primeBienvenue: true }
    }
];

/**
 * GET /api/titularisation/liste
 * Renvoie les titularisations récentes et passeports CDI
 */
router.get('/liste', (req, res) => {
    res.json({
        succes: true,
        titularisations
    });
});

/**
 * POST /api/titularisation/celebrer
 * Valider la titularisation d'un salarié, générer son passeport CDI et lancer la célébration TV
 */
router.post('/celebrer', async (req, res) => {
    const { employeNom, matricule, poste, siteNom, motDirection } = req.body || {};

    const nouveauPasseport = {
        id: `cdi-${Date.now()}`,
        employeNom: employeNom || 'Collaborateur SII',
        matricule: matricule || 'EMP-NEW',
        poste: poste || 'Conseiller Clientèle',
        siteNom: siteNom || 'Agence Orange CI',
        dateTitularisation: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        ancienneteStagiaireMois: 12,
        statutPasseport: 'ACTIF',
        motDirection: motDirection || 'Félicitations pour ta titularisation en CDI au sein de SII !',
        kitRemis: { poloBrode: true, badgeDore: true, primeBienvenue: true }
    };

    titularisations.unshift(nouveauPasseport);

    // Déclencher automatiquement le mode célébration sur les écrans
    try {
        const ecransLib = require('../lib/ecranAgence');
        if (ecransLib.declencherCelebration) {
            ecransLib.declencherCelebration({
                id: 'global',
                type: 'TITULARISATION_CDI',
                titre: `🎉 Félicitations ${nouveauPasseport.employeNom} !`,
                sousTitre: `Titularisation officielle en CDI au poste de ${nouveauPasseport.poste} à ${nouveauPasseport.siteNom} ! 🥂`,
                beneficiaire: nouveauPasseport.employeNom,
                dureeSecondes: 90
            });
        }
    } catch (e) {
        console.error('Erreur déclenchement célébration titularisation:', e.message);
    }

    res.status(201).json({
        succes: true,
        passeport: nouveauPasseport,
        message: `Passeport CDI édité et mode célébration TV activé pour ${nouveauPasseport.employeNom} !`
    });
});

module.exports = router;
