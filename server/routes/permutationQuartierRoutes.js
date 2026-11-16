const express = require('express');
const router = express.Router();

let annoncesPermutation = [
    {
        id: 'perm-1',
        demandeurNom: 'Koffi Jean-Eudes',
        poste: 'Conseiller Commercial Fibre & SIM',
        agenceActuelle: 'Agence Orange Yopougon Maroc',
        quartierHabite: 'Cocody Angré 8ème Tranche',
        agenceSouhaitee: 'Agence Orange Cocody Angré ou St Jean',
        gainTrajetEstimeMinutes: 110,
        statut: 'EN_ATTENTE_CORRESPONDANCE',
        datePublication: '12/10/2026'
    },
    {
        id: 'perm-2',
        demandeurNom: 'Bakayoko Mariam',
        poste: 'Conseillère Commerciale Boutique',
        agenceActuelle: 'Agence Orange Plateau Postel 2001',
        quartierHabite: 'Yopougon Niangon Sud',
        agenceSouhaitee: 'Agence Orange Yopougon Siporex ou Bel Air',
        gainTrajetEstimeMinutes: 95,
        statut: 'MATCH_TROUVE',
        datePublication: '09/10/2026'
    }
];

router.get('/annonces', (req, res) => {
    res.json({ succes: true, permutations: annoncesPermutation });
});

router.post('/publier', (req, res) => {
    const { demandeurNom, poste, agenceActuelle, quartierHabite, agenceSouhaitee } = req.body || {};
    const nouvelle = {
        id: `perm-${Date.now()}`,
        demandeurNom: demandeurNom || 'Collaborateur SII',
        poste: poste || 'Conseiller Commercial',
        agenceActuelle: agenceActuelle || 'Agence Orange Abidjan',
        quartierHabite: quartierHabite || 'Quartier Domicile',
        agenceSouhaitee: agenceSouhaitee || 'Agence Proche Domicile',
        gainTrajetEstimeMinutes: 90,
        statut: 'EN_ATTENTE_CORRESPONDANCE',
        datePublication: new Date().toLocaleDateString('fr-FR')
    };
    annoncesPermutation.unshift(nouvelle);
    res.json({ succes: true, annonce: nouvelle, message: 'Demande de permutation publiée avec succès sur la bourse interne SII.' });
});

module.exports = router;
