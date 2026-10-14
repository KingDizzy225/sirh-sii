const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des prises en charge médicales d'urgence
let bonsMedicaux = [
    {
        id: 'med-1',
        employeNom: 'Bintou Sékou',
        matricule: 'EMP-0412',
        beneficiaire: 'Salarié (Bintou S.)',
        typeSoins: 'Pharmacie / Traitement Paludisme & Urgence',
        etablissementPartenaire: 'Pharmacie de la Grâce (Plateau)',
        plafondAutoriseFcfa: 40000,
        statut: 'ACTIF_VALIDE',
        qrCodeJeton: 'SII-PEC-2026-99124',
        emisLe: new Date()
    },
    {
        id: 'med-2',
        employeNom: 'Amadou Koné',
        matricule: 'EMP-0288',
        beneficiaire: 'Enfant (Koffi Koné, 6 ans)',
        typeSoins: 'Consultation Pédiatrique & Soins d\'Urgence',
        etablissementPartenaire: 'Polyclinique Sainte Anne-Marie (PISAM)',
        plafondAutoriseFcfa: 75000,
        statut: 'ACTIF_VALIDE',
        qrCodeJeton: 'SII-PEC-2026-88412',
        emisLe: new Date(Date.now() - 3600000)
    }
];

/**
 * GET /api/sante-express/bons
 * Liste des bons de prise en charge médicale express
 */
router.get('/bons', (req, res) => {
    res.json({
        succes: true,
        bons: bonsMedicaux
    });
});

/**
 * POST /api/sante-express/generer
 * Génère instantanément une attestation de garantie médicale sans avance de trésorerie
 */
router.post('/generer', (req, res) => {
    const { employeNom, matricule, beneficiaire, typeSoins, etablissementPartenaire, montantEstime } = req.body || {};

    const bon = {
        id: `med-${Date.now()}`,
        employeNom: employeNom || req.user?.name || 'Salarié SII',
        matricule: matricule || 'EMP-SII',
        beneficiaire: beneficiaire || 'Salarié',
        typeSoins: typeSoins || 'Soins & Pharmacie d\'Urgence',
        etablissementPartenaire: etablissementPartenaire || 'Établissement conventionné',
        plafondAutoriseFcfa: parseInt(montantEstime, 10) || 50000,
        statut: 'ACTIF_VALIDE',
        qrCodeJeton: `SII-PEC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        emisLe: new Date()
    };

    bonsMedicaux.unshift(bon);

    res.status(201).json({
        succes: true,
        bon,
        message: `Bon de prise en charge N° ${bon.qrCodeJeton} généré ! Présentez ce pass sur votre téléphone au guichet partenaire.`
    });
});

module.exports = router;
