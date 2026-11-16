const express = require('express');
const router = express.Router();

let salariesNonNationaux = [
    {
        id: 'ced-001',
        employeNom: 'Mamadou Oumar Diallo',
        matricule: 'EMP-3109',
        nationalite: 'Guinéenne (Guinée-Conakry)',
        statutZone: 'RESSORTISSANT_CEDEAO',
        poste: 'Ingénieur Systèmes Réseau & Fibre',
        agence: 'Siège SII Marcory / Réseau Abidjan',
        typeTitre: 'CARTE_RESIDENT_BIOMETRIQUE_ONECI',
        numeroPiece: 'CR-ONECI-2024-998124',
        dateDelivrance: '14/02/2024',
        dateExpiration: '14/02/2029',
        joursRestantsAvantExpiration: 825,
        visaTravailMEPS: 'VISA_AGEPE_APPROUVE_2024',
        statutRegul: 'REGULIER_A_JOUR',
        actionsRH: 'Titre en cours de validité (reste 2 ans et 3 mois)'
    },
    {
        id: 'ced-002',
        employeNom: 'Boukary Ouédraogo',
        matricule: 'EMP-4421',
        nationalite: 'Burkinabè (Burkina Faso)',
        statutZone: 'RESSORTISSANT_CEDEAO',
        poste: 'Superviseur Logistique & Stocks SIM',
        agence: 'Hub Central Plateau & Agence Treichville',
        typeTitre: 'CARTE_CONSULAIRE_BIOMETRIQUE',
        numeroPiece: 'CONS-BFA-ABJ-88102',
        dateDelivrance: '10/12/2023',
        dateExpiration: '10/12/2026',
        joursRestantsAvantExpiration: 30, // Alerte J-30 !
        visaTravailMEPS: 'AUTORISATION_TRAVAIL_CONFORME',
        statutRegul: 'ALERTE_RENOUVELLEMENT_J30',
        actionsRH: 'Dossier de renouvellement déposé au Consulat Général du Burkina Faso à Abidjan'
    },
    {
        id: 'ced-003',
        employeNom: 'Fatoumata Binta Diakité',
        matricule: 'EMP-5912',
        nationalite: 'Malienne (Mali)',
        statutZone: 'RESSORTISSANT_CEDEAO',
        poste: 'Chargée de Clientèle VIP Entreprises',
        agence: 'Agence Orange Cocody Deux-Plateaux',
        typeTitre: 'CARTE_RESIDENT_CEDEAO_ONECI',
        numeroPiece: 'CR-MLI-2025-04192',
        dateDelivrance: '05/06/2025',
        dateExpiration: '05/06/2030',
        joursRestantsAvantExpiration: 1300,
        visaTravailMEPS: 'VISA_AGEPE_APPROUVE_2025',
        statutRegul: 'REGULIER_A_JOUR',
        actionsRH: 'Titre biométrique parfaitement à jour'
    },
    {
        id: 'ced-004',
        employeNom: 'Kofi Mensah',
        matricule: 'EMP-6881',
        nationalite: 'Ghanéenne (Ghana)',
        statutZone: 'RESSORTISSANT_CEDEAO',
        poste: 'Technicien Déploiement Fibre & Box',
        agence: 'Agence Orange San Pedro Port',
        typeTitre: 'PASSEPORT_ECOWAS_ET_VISA_TRAVAIL',
        numeroPiece: 'GHA-PASS-990142',
        dateDelivrance: '18/01/2025',
        dateExpiration: '18/01/2027',
        joursRestantsAvantExpiration: 434,
        visaTravailMEPS: 'VISA_AGEPE_VALIDE_2027',
        statutRegul: 'REGULIER_A_JOUR',
        actionsRH: 'Conforme réglementation sur l\'emploi régional'
    }
];

let indicateursNationalisation = {
    effectifTotalEntreprise: 385,
    salariesNationauxIvoiriens: 362, // 94%
    salariesRessortissantsCEDEAO: 21, // 5.5%
    salariesHorsCEDEAOExpat: 2, // 0.5%
    tauxIvoirisationEmplois: '94.0%',
    seuilLegalIvoirisationRequis: 'Minimum 90% (Respecté avec marge)',
    conformiteGlobaleMEPS: '100% REGULIER'
};

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        indicateurs: indicateursNationalisation,
        salaries: salariesNonNationaux,
        alertesRenouvellement: salariesNonNationaux.filter(s => s.statutRegul.includes('ALERTE')).length
    });
});

router.post('/enregistrer-titre', (req, res) => {
    const { employeNom, matricule, nationalite, poste, agence, typeTitre, numeroPiece, dateExpiration } = req.body;
    const nouveau = {
        id: `ced-${Date.now().toString().slice(-4)}`,
        employeNom: employeNom || 'Salarié Non-National',
        matricule: matricule || 'EMP-7700',
        nationalite: nationalite || 'Sénégalaise (Sénégal)',
        statutZone: 'RESSORTISSANT_CEDEAO',
        poste: poste || 'Conseiller Commercial',
        agence: agence || 'Agence Orange Plateau',
        typeTitre: typeTitre || 'CARTE_RESIDENT_BIOMETRIQUE_ONECI',
        numeroPiece: numeroPiece || 'CR-ONECI-2026-LIVE',
        dateDelivrance: new Date().toLocaleDateString('fr-FR'),
        dateExpiration: dateExpiration || '31/12/2029',
        joursRestantsAvantExpiration: 1100,
        visaTravailMEPS: 'EN_COURS_HOMOLOGATION_MEPS',
        statutRegul: 'REGULIER_A_JOUR',
        actionsRH: 'Titre enregistré et consigné au registre des travailleurs étrangers'
    };
    salariesNonNationaux.unshift(nouveau);
    res.json({ succes: true, salarie: nouveau });
});

module.exports = router;
