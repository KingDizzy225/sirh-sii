const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des naissances et accompagnements
let berceauxSii = [
    {
        id: 'bb-1',
        employeNom: 'Mariam Diabaté',
        matricule: 'EMP-0433',
        siteNom: 'Agence Cap Sud Marcory',
        evenement: 'Naissance d\'une petite fille (Aminata)',
        dateEvenement: '05 Octobre 2026',
        kitLayetteEnvoye: true,
        primeNaissanceOMFcfa: 75000,
        statutPrime: 'VIREMENT_OM_EFFECTUE',
        parrainageMamanNom: 'Kady Sangaré (Marraine d\'accueil)',
        dateReprisePrevue: '05 Janvier 2027'
    },
    {
        id: 'bb-2',
        employeNom: 'Yves Koffi',
        matricule: 'EMP-0312',
        siteNom: 'Agence Yopougon Siporex',
        evenement: 'Paternité (Garçon : Yannick)',
        dateEvenement: '12 Octobre 2026',
        kitLayetteEnvoye: true,
        primeNaissanceOMFcfa: 40000,
        statutPrime: 'VIREMENT_OM_EFFECTUE',
        parrainageMamanNom: null,
        dateReprisePrevue: 'Reprise immédiate (Congé légal 10 jours pris)'
    }
];

/**
 * GET /api/berceau-sii/dossiers
 * Liste des accompagnements maternité / paternité
 */
router.get('/dossiers', (req, res) => {
    res.json({
        succes: true,
        dossiers: berceauxSii
    });
});

/**
 * POST /api/berceau-sii/declarer
 * Déclarer un heureux événement et déclencher le kit et la prime
 */
router.post('/declarer', (req, res) => {
    const { employeNom, matricule, siteNom, evenement, type, dateEvenement } = req.body || {};
    const estMaternite = type === 'MATERNITE';

    const dossier = {
        id: `bb-${Date.now()}`,
        employeNom: employeNom || req.user?.name || 'Collaborateur SII',
        matricule: matricule || 'EMP-SII',
        siteNom: siteNom || 'Agence Orange CI',
        evenement: evenement || 'Heureux événement familial',
        dateEvenement: dateEvenement || new Date().toLocaleDateString('fr-FR'),
        kitLayetteEnvoye: true,
        primeNaissanceOMFcfa: estMaternite ? 75000 : 40000,
        statutPrime: 'EN_ATTENTE_VIREMENT_OM',
        parrainageMamanNom: estMaternite ? 'Désignation en cours' : null,
        dateReprisePrevue: estMaternite ? 'Dans 14 semaines' : 'Dans 10 jours'
    };

    berceauxSii.unshift(dossier);

    res.status(201).json({
        succes: true,
        dossier,
        message: "Félicitations ! Le coffret de naissance SII et la prime Orange Money sont déclenchés."
    });
});

module.exports = router;
