const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire de la bourse aux dons de congés et heures de récup
let donsConges = [
    {
        id: 'don-1',
        donateurNom: 'Collaborateur Anonyme (Agence Plateau)',
        beneficiaireNom: 'Awa Traoré',
        matriculeBeneficiaire: 'EMP-0411',
        motifBeneficiaire: 'Enfant hospitalisé (besoin de présence au chevet)',
        joursOfferts: 2,
        typeJour: 'JOUR_RECUPERATION', // 'JOUR_RECUPERATION' | 'RTT'
        statut: 'VALIDE_RH',
        dateDon: 'Aujourd\'hui 09:15'
    }
];

let appelsSolidarite = [
    {
        id: 'apl-1',
        beneficiaireNom: 'Awa Traoré',
        siteNom: 'Agence Orange Plateau Postel 2001',
        motif: 'Accompagnement pédiatrique d\'urgence — Solde de congé annuel épuisé.',
        joursDemandes: 5,
        joursRecueillis: 2,
        statut: 'CAMPAGNE_ACTIVE'
    }
];

/**
 * GET /api/solidarite-conges/campagnes
 * Liste des appels à solidarité et dons de jours
 */
router.get('/campagnes', (req, res) => {
    res.json({
        succes: true,
        appels: appelsSolidarite,
        dons: donsConges
    });
});

/**
 * POST /api/solidarite-conges/donner
 * Offrir 1 ou plusieurs jours de récupération à un collègue
 */
router.post('/donner', (req, res) => {
    const { appelId, joursOfferts, donateurAnonyme } = req.body || {};
    const appel = appelsSolidarite.find(a => a.id === appelId) || appelsSolidarite[0];
    const nbJours = parseInt(joursOfferts, 10) || 1;

    appel.joursRecueillis += nbJours;

    const don = {
        id: `don-${Date.now()}`,
        donateurNom: donateurAnonyme ? 'Collaborateur Solidaire (Anonyme)' : (req.user?.name || 'Collègue Solidaire'),
        beneficiaireNom: appel.beneficiaireNom,
        matriculeBeneficiaire: 'EMP-BENEF',
        motifBeneficiaire: appel.motif,
        joursOfferts: nbJours,
        typeJour: 'JOUR_RECUPERATION',
        statut: 'VALIDE_RH',
        dateDon: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    donsConges.unshift(don);

    res.status(201).json({
        succes: true,
        don,
        message: `Geste de fraternité validé ! Vos ${nbJours} jour(s) ont été transférés à ${appel.beneficiaireNom}. La RH vous remercie chaleureusement.`
    });
});

module.exports = router;
