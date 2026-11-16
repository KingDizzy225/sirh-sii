const express = require('express');
const router = express.Router();

let techniciensHauteur = [
    {
        id: 'tec-101',
        technicienNom: 'Sanogo Brahima',
        matricule: 'FIB-890',
        zoneIntervention: 'Abidjan Nord (Abobo, Anyama)',
        certificationHauteur: 'HABILITATION_CIE_ORANGE_N2',
        validiteJusquau: '18/08/2027',
        statutEpi: 'CONFORME_INSPECTE',
        dateDerniereInspectionHarnais: '01/10/2026',
        photoChecklistDuJour: true,
        autoriseMonterPoteau: true
    },
    {
        id: 'tec-102',
        technicienNom: 'N\'Zué Patrick',
        matricule: 'FIB-612',
        zoneIntervention: 'Bouaké & Région du Gbêkê',
        certificationHauteur: 'HABILITATION_CIE_ORANGE_N1',
        validiteJusquau: '15/11/2026', // Proche recyclage
        statutEpi: 'A_RECYCLER_SOUS_30_JOURS',
        dateDerniereInspectionHarnais: '20/09/2026',
        photoChecklistDuJour: true,
        autoriseMonterPoteau: true
    }
];

router.get('/techniciens', (req, res) => {
    res.json({
        succes: true,
        normeSecurite: 'Standard Sécurité Fibre Orange & Norme Électrique CIE',
        techniciens: techniciensHauteur
    });
});

router.post('/valider-checklist-jour', (req, res) => {
    const { technicienId, etatHarnais, etatCasque, etatEchelle } = req.body || {};
    const t = techniciensHauteur.find(item => item.id === technicienId) || techniciensHauteur[0];
    t.photoChecklistDuJour = true;
    t.dateDerniereInspectionHarnais = new Date().toLocaleDateString('fr-FR');
    res.json({ succes: true, message: `Checklist sécurité EPI validée pour ${t.technicienNom}. Autorisation de raccordement délivrée.` });
});

module.exports = router;
