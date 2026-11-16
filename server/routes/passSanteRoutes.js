const express = require('express');
const router = express.Router();

let prisesEnCharge = [
    {
        id: 'pec-2026-01',
        employeNom: 'Moussa Fofana',
        matricule: 'EMP-4412',
        beneficiaire: 'Assia Fofana (Fille, 6 ans)',
        etablissement: 'Polyclinique Sainte Anne-Marie (PISAM Cocody)',
        prestation: 'Consultation Pédiatrique + Bilan Biologique Paludisme & Typhoïde',
        montantTotalFcfa: 45000,
        partAssuranceFcfa: 36000, // 80%
        partSalarieFcfa: 9000, // 20%
        statutBon: 'VALIDE_CODE_GENERE',
        codeBonDigital: 'PISAM-SII-88412',
        dateEmission: '09/11/2026',
        heureValidite: 'Valable 48h dans le réseau conventionné'
    },
    {
        id: 'pec-2026-02',
        employeNom: 'Béatrice Kra',
        matricule: 'EMP-3108',
        beneficiaire: 'Salarié Titulaire',
        etablissement: 'Pharmacie de la Corniche (Plateau)',
        prestation: 'Délivrance Ordonnance Médicaments Anti-inflammatoires & Antalgiques',
        montantTotalFcfa: 28500,
        partAssuranceFcfa: 22800,
        partSalarieFcfa: 5700,
        statutBon: 'BON_CONSOMME',
        codeBonDigital: 'PHARM-SII-19022',
        dateEmission: '06/11/2026',
        heureValidite: 'Consommé le 06/11 à 18:22'
    },
    {
        id: 'pec-2026-03',
        employeNom: 'Ibrahim Dosso',
        matricule: 'EMP-5891',
        beneficiaire: 'Salarié Titulaire',
        etablissement: 'Centre Médical Saint Joseph (San Pedro)',
        prestation: 'Consultation Ophtalmologie & Prescription Verres Correcteurs',
        montantTotalFcfa: 75000,
        partAssuranceFcfa: 60000,
        partSalarieFcfa: 15000,
        statutBon: 'VALIDE_CODE_GENERE',
        codeBonDigital: 'OPHTA-SII-77190',
        dateEmission: '08/11/2026',
        heureValidite: 'Valable jusqu\'au 15/11/2026'
    }
];

let centresConventionnes = [
    { id: 'cnt-1', nom: 'Polyclinique Sainte Anne-Marie (PISAM)', ville: 'Abidjan (Cocody)', convention: 'Prise en charge 80% Tiers-Payant', contact: '+225 27 22 48 31 31' },
    { id: 'cnt-2', nom: 'Polyclinique Internationale Hôtel-Dieu', ville: 'Abidjan (Treichville)', convention: 'Urgences 24/7 & Chirurgie', contact: '+225 27 21 25 79 00' },
    { id: 'cnt-3', nom: 'Clinique Farandole', ville: 'Abidjan (Deux-Plateaux)', convention: 'Pédiatrie & Maternité', contact: '+225 27 22 41 89 00' },
    { id: 'cnt-4', nom: 'Clinique de l\'Aurore', ville: 'Bouaké (Ahougnanssou)', convention: 'Médecine générale & laboratoire', contact: '+225 27 31 63 12 00' },
    { id: 'cnt-5', nom: 'Centre Médical Saint Joseph', ville: 'San Pedro (Cité)', convention: 'Soins infirmiers & Imagerie', contact: '+225 27 34 71 00 22' }
];

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        tauxCouvertureGlobal: '80% Tiers-Payant',
        salariesAdherents: 385,
        ayantsDroitCouverts: 940,
        totalBonsDelivresMois: prisesEnCharge.length,
        prisesEnCharge: prisesEnCharge,
        centres: centresConventionnes
    });
});

router.post('/generer-bon', (req, res) => {
    const { employeNom, matricule, beneficiaire, etablissement, montantEstimeFcfa } = req.body;
    const total = Number(montantEstimeFcfa) || 35000;
    const nouveauBon = {
        id: `pec-${Date.now().toString().slice(-4)}`,
        employeNom: employeNom || 'Salarié Titulaire',
        matricule: matricule || 'EMP-7711',
        beneficiaire: beneficiaire || 'Salarié Titulaire',
        etablissement: etablissement || 'Clinique Conventionnée Réseau SII',
        prestation: 'Consultation & Soins Ambulatoires',
        montantTotalFcfa: total,
        partAssuranceFcfa: Math.round(total * 0.8),
        partSalarieFcfa: Math.round(total * 0.2),
        statutBon: 'VALIDE_CODE_GENERE',
        codeBonDigital: `SANTE-SII-${Math.floor(10000 + Math.random() * 90000)}`,
        dateEmission: new Date().toLocaleDateString('fr-FR'),
        heureValidite: 'Valable 48h dans tout le réseau agréé'
    };
    prisesEnCharge.unshift(nouveauBon);
    res.json({ succes: true, bon: nouveauBon });
});

module.exports = router;
