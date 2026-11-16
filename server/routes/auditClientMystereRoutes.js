const express = require('express');
const router = express.Router();

let visitesMysteres = [
    {
        id: 'aud-01',
        agenceNom: 'Agence Orange Treichville Arras',
        dateVisite: '06/10/2026',
        auditeurCabinet: 'Cabinet Qualitas Afrique (Mandaté Orange CI)',
        noteAccueil: 96,
        notePropreteUniforme: 100,
        noteMaitriseOffreFibre: 94,
        noteSourireRapidite: 95,
        scoreGlobalPourcent: 96.2,
        mention: 'EXCELLENCE_OR',
        primeEquipeBoutiqueFcfa: 200000,
        verbatimAuditeur: 'Accueil chaleureux dès l\'entrée avec le vigile, prise en charge en moins de 3 minutes, excellente explication de la Fibre Orange.'
    },
    {
        id: 'aud-02',
        agenceNom: 'Agence Orange Cocody Angré 8ème Tranche',
        dateVisite: '09/10/2026',
        auditeurCabinet: 'Cabinet Qualitas Afrique',
        noteAccueil: 92,
        notePropreteUniforme: 98,
        noteMaitriseOffreFibre: 90,
        noteSourireRapidite: 91,
        scoreGlobalPourcent: 92.7,
        mention: 'TRES_SATISFAISANT',
        primeEquipeBoutiqueFcfa: 100000,
        verbatimAuditeur: 'Très bon esprit d\'équipe, boutique bien climatisée et propre. Conseillers très professionnels.'
    }
];

router.get('/visites', (req, res) => {
    res.json({
        succes: true,
        moyenneReseauSii: '94.4%',
        visites: visitesMysteres
    });
});

module.exports = router;
