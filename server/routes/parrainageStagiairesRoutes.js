const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des évaluations juniors et offres Fast-Track
let stagiairesEvaluations = [
    {
        id: 'stg-1',
        stagiaireNom: 'Moussa Diakité',
        ecoleProvenance: 'INP-HB Yamoussoukro (Génie Commercial)',
        siteNom: 'Agence Orange Plateau',
        tuteurNom: 'Kouassi Konan',
        scoreGlobal: 96, // Sur 100
        criteres: {
            postureClient: 98,
            rapiditeCaisseOm: 94,
            espritEquipe: 96
        },
        statutOffre: 'OFFRE_CDI_GENEREE', // 'EN_EVALUATION' | 'OFFRE_CDI_GENEREE' | 'SIGNE'
        dateFinStage: '30 Octobre 2026',
        offreProposee: 'Conseiller Commercial Junior CDI — Salaire conventionnel + primes'
    },
    {
        id: 'stg-2',
        stagiaireNom: 'Priscille Gnahoré',
        ecoleProvenance: 'Pigier Côte d\'Ivoire (Marketing Télécom)',
        siteNom: 'Agence Cap Sud Marcory',
        tuteurNom: 'Mamadou Bakayoko',
        scoreGlobal: 92,
        criteres: {
            postureClient: 95,
            rapiditeCaisseOm: 90,
            espritEquipe: 91
        },
        statutOffre: 'OFFRE_CDI_GENEREE',
        dateFinStage: '15 Novembre 2026',
        offreProposee: 'Conseillère Relation Clientèle Boutique CDI'
    }
];

/**
 * GET /api/parrainage-stagiaires/talents
 * Liste des stagiaires en évaluation et éligibles Fast-Track CDI
 */
router.get('/talents', (req, res) => {
    res.json({
        succes: true,
        stagiaires: stagiairesEvaluations
    });
});

/**
 * POST /api/parrainage-stagiaires/evaluer
 * Évaluation du tuteur et déclenchement automatique de l'offre CDI si score >= 90%
 */
router.post('/evaluer', (req, res) => {
    const { stagiaireNom, ecoleProvenance, siteNom, postureClient, rapiditeCaisseOm, espritEquipe } = req.body || {};

    const p = parseInt(postureClient, 10) || 90;
    const r = parseInt(rapiditeCaisseOm, 10) || 90;
    const e = parseInt(espritEquipe, 10) || 90;
    const moyenne = Math.round((p + r + e) / 3);
    const estEligibleFastTrack = moyenne >= 90;

    const evalStg = {
        id: `stg-${Date.now()}`,
        stagiaireNom: stagiaireNom || 'Stagiaire Junior',
        ecoleProvenance: ecoleProvenance || 'Grande École CI',
        siteNom: siteNom || 'Agence Orange CI',
        tuteurNom: req.user?.name || 'Tuteur Référent',
        scoreGlobal: moyenne,
        criteres: { postureClient: p, rapiditeCaisseOm: r, espritEquipe: e },
        statutOffre: estEligibleFastTrack ? 'OFFRE_CDI_GENEREE' : 'EN_EVALUATION',
        dateFinStage: 'Fin de mois',
        offreProposee: estEligibleFastTrack ? 'Proposition d\'embauche directe en CDI' : null
    };

    stagiairesEvaluations.unshift(evalStg);

    res.status(201).json({
        succes: true,
        evaluation: evalStg,
        message: estEligibleFastTrack 
            ? `🌟 Score exceptionnel de ${moyenne}% ! Offre d'embauche CDI Fast-Track pré-remplie pour ${evalStg.stagiaireNom}.`
            : `Évaluation enregistrée (${moyenne}%).`
    });
});

module.exports = router;
