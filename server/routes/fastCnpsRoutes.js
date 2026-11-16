const express = require('express');
const router = express.Router();

let dossiersCnps = [
    {
        id: 'cnps-doc-01',
        employeNom: 'Brou Koffi David',
        matricule: 'EMP-7721',
        typePrestation: 'ALLOCATIONS_FAMILIALES_NOUVEAU_NE',
        nomEnfant: 'Brou Marie-Emmanuelle',
        dateNaissanceEnfant: '14/09/2026',
        piecesTeleversees: ['Extrait de naissance certifié', 'Certificat de vie et d\'entretien', 'Livret de famille'],
        statutTeletransmission: 'TRANSMIS_PORTAIL_CNPS_CI',
        numeroDossierCnps: 'CNPS-CI-2026-992182',
        montantMensuelEstimeFcfa: 15000,
        dateDepotDigital: '02/10/2026'
    },
    {
        id: 'cnps-doc-02',
        employeNom: 'N\'Guessan Amoin Solange',
        matricule: 'EMP-5519',
        typePrestation: 'CONGE_MATERNITE_INDEMNITES_JOURNALIERES',
        nomEnfant: 'N\'Guessan Aaron',
        dateNaissanceEnfant: '28/08/2026',
        piecesTeleversees: ['Certificat d\'accouchement', 'Attestation de suspension de salaire'],
        statutTeletransmission: 'PAIEMENT_VALIDE_VIREMENT_DIRECT',
        numeroDossierCnps: 'CNPS-CI-2026-441098',
        montantMensuelEstimeFcfa: 145000,
        dateDepotDigital: '15/09/2026'
    }
];

router.get('/dossiers', (req, res) => {
    res.json({
        succes: true,
        guichetPartenaire: 'Liaison directe Télétransmission e-CNPS Côte d\'Ivoire sans déplacement physique',
        dossiers: dossiersCnps
    });
});

router.post('/teletransmettre', (req, res) => {
    const { employeNom, typePrestation, nomEnfant, dateNaissanceEnfant } = req.body || {};
    const nouveau = {
        id: `cnps-doc-${Date.now()}`,
        employeNom: employeNom || 'Collaborateur SII',
        matricule: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        typePrestation: typePrestation || 'ALLOCATIONS_FAMILIALES',
        nomEnfant: nomEnfant || 'Enfant du salarié',
        dateNaissanceEnfant: dateNaissanceEnfant || 'Récente',
        piecesTeleversees: ['Extrait de naissance scanné', 'Livret de famille complet'],
        statutTeletransmission: 'TRANSMIS_PORTAIL_CNPS_CI',
        numeroDossierCnps: `CNPS-CI-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        montantMensuelEstimeFcfa: 15000,
        dateDepotDigital: new Date().toLocaleDateString('fr-FR')
    };
    dossiersCnps.unshift(nouveau);
    res.json({
        succes: true,
        dossier: nouveau,
        message: 'Dossier télétransmis avec succès à la CNPS. Fini les files d\'attente !'
    });
});

module.exports = router;
