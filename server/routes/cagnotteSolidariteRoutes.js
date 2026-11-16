const express = require('express');
const router = express.Router();

let cagnottesEnCours = [
    {
        id: 'cgt-01',
        beneficiaireNom: 'Famille de feu Koné Bakary (Conseiller Vente Koumassi)',
        cause: 'DEUIL_PARENT_DIRECT',
        description: 'Soutien fraternel pour les obsèques de la mère de notre collègue.',
        objectifFcfa: 400000,
        collecteEmployesFcfa: 265000,
        abondementSiiFcfa: 265000, // SII double les dons à 100%
        totalCollecteFcfa: 530000,
        nombreDonateurs: 68,
        statut: 'VERSEMENT_EFFECTUE_FAMILLE',
        dateOuverture: '05/10/2026'
    },
    {
        id: 'cgt-02',
        beneficiaireNom: 'Amani Clarisse (Technicienne Fibre San Pedro)',
        cause: 'SINISTRE_INCENDIE_DOMICILE',
        description: 'Aide d\'urgence suite à un sinistre au domicile familial.',
        objectifFcfa: 500000,
        collecteEmployesFcfa: 180000,
        abondementSiiFcfa: 180000,
        totalCollecteFcfa: 360000,
        nombreDonateurs: 42,
        statut: 'EN_COURS_COLLECTE',
        dateOuverture: '11/10/2026'
    }
];

router.get('/liste', (req, res) => {
    res.json({
        succes: true,
        tauxAbondementEntreprise: '100% (Pour chaque 1 000 FCFA versé par un collègue, SII verse 1 000 FCFA)',
        cagnottes: cagnottesEnCours
    });
});

router.post('/participer', (req, res) => {
    const { cagnotteId, donateurNom, montantDonFcfa } = req.body || {};
    const don = parseInt(montantDonFcfa, 10) || 5000;
    const c = cagnottesEnCours.find(item => item.id === cagnotteId) || cagnottesEnCours[0];
    c.collecteEmployesFcfa += don;
    c.abondementSiiFcfa += don;
    c.totalCollecteFcfa += (don * 2);
    c.nombreDonateurs += 1;

    res.json({
        succes: true,
        message: `Merci pour votre solidarité ! Don de ${don.toLocaleString('fr-FR')} FCFA validé + abondement automatique SII de ${don.toLocaleString('fr-FR')} FCFA. Total généré : ${(don * 2).toLocaleString('fr-FR')} FCFA.`
    });
});

module.exports = router;
