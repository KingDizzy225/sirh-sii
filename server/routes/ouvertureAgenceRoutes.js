const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des audits et ouvertures
let auditsOuverture = [
    {
        id: 'chk-1',
        siteNom: 'Agence Orange Plateau Postel 2001',
        responsableNom: 'Kouassi Konan',
        heure: '08:14',
        statut: 'CONFORME', // 'CONFORME' | 'INCIDENT_MAJEUR' | 'ATTENTION'
        pointsVerifies: {
            coffreArme: true,
            fondCaisseOm: true,
            climFonctionnelle: true,
            presentoirsAllumes: true,
            flyersAjour: true
        },
        photosUrls: [
            'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&auto=format&fit=crop&q=60'
        ],
        incidentsDetectes: []
    },
    {
        id: 'chk-2',
        siteNom: 'Agence Orange Yopougon Siporex',
        responsableNom: 'Aïcha Coulibaly',
        heure: '08:22',
        statut: 'ATTENTION',
        pointsVerifies: {
            coffreArme: true,
            fondCaisseOm: true,
            climFonctionnelle: false,
            presentoirsAllumes: true,
            flyersAjour: true
        },
        photosUrls: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60'
        ],
        incidentsDetectes: [
            'Climatisation centrale en panne (salle d\'attente client à 31°C). Ticket maintenance créé automatiquement.'
        ]
    }
];

/**
 * GET /api/ouverture-agence/audits
 * Liste des audits d'ouverture de boutique du jour
 */
router.get('/audits', (req, res) => {
    const total = auditsOuverture.length;
    const conformes = auditsOuverture.filter(a => a.statut === 'CONFORME').length;
    const avecIncidents = auditsOuverture.filter(a => a.statut !== 'CONFORME').length;

    res.json({
        succes: true,
        total,
        conformes,
        avecIncidents,
        audits: auditsOuverture
    });
});

/**
 * POST /api/ouverture-agence/valider
 * Validation de la prise de poste et de la check-list par le manager
 */
router.post('/valider', (req, res) => {
    const { siteNom, responsableNom, pointsVerifies, remarques, photosUrls } = req.body || {};
    
    const sansIncident = pointsVerifies?.coffreArme && 
                         pointsVerifies?.fondCaisseOm && 
                         pointsVerifies?.climFonctionnelle && 
                         pointsVerifies?.presentoirsAllumes && 
                         pointsVerifies?.flyersAjour;

    const incidentsDetectes = [];
    if (!pointsVerifies?.climFonctionnelle) incidentsDetectes.push("Climatisation non fonctionnelle.");
    if (!pointsVerifies?.fondCaisseOm) incidentsDetectes.push("Fond de caisse Orange Money insuffisant.");
    if (!pointsVerifies?.coffreArme) incidentsDetectes.push("Anomalie système d'armement du coffre.");
    if (remarques) incidentsDetectes.push(remarques);

    const audit = {
        id: `chk-${Date.now()}`,
        siteNom: siteNom || 'Agence Orange CI',
        responsableNom: responsableNom || req.user?.name || 'Chef d\'Agence',
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        statut: sansIncident ? 'CONFORME' : 'ATTENTION',
        pointsVerifies: pointsVerifies || {},
        photosUrls: photosUrls || [],
        incidentsDetectes
    };

    auditsOuverture.unshift(audit);

    res.status(201).json({
        succes: true,
        audit,
        message: sansIncident 
            ? "Boutique auditée conforme. Excellente ouverture de caisse !" 
            : "Audit consigné avec signalement technique immédiat à la direction logistique."
    });
});

module.exports = router;
