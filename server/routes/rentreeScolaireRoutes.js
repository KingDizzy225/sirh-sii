const express = require('express');
const router = express.Router();

let commandesKits = [
    {
        id: 'kit-01',
        employeNom: 'Yao Kouamé David',
        niveauScolaire: 'Collège (6ème à 3ème)',
        nombreEnfants: 2,
        valeurTotaleFcfa: 70000,
        subventionSiiFcfa: 25000,
        resteAChargeSalarieFcfa: 45000,
        formulePrelevement: '15 000 FCFA / mois sur Septembre, Octobre, Novembre',
        statutLivraison: 'LIVRE_EN_AGENCE',
        agenceRetrait: 'Agence Orange Yopougon Siporex'
    },
    {
        id: 'kit-02',
        employeNom: 'Diallo Aïssatou',
        niveauScolaire: 'Primaire (CP1 à CM2)',
        nombreEnfants: 1,
        valeurTotaleFcfa: 35000,
        subventionSiiFcfa: 15000,
        resteAChargeSalarieFcfa: 20000,
        formulePrelevement: '10 000 FCFA / mois sur Septembre et Octobre',
        statutLivraison: 'EN_PREPARATION_LIBRAIRIE',
        agenceRetrait: 'Agence Orange Plateau Postel 2001'
    }
];

router.get('/kits', (req, res) => {
    res.json({
        succes: true,
        partenairesLibrairies: ['Librairie de France Abidjan', 'Maison du Livre Cocody'],
        commandes: commandesKits
    });
});

router.post('/commander', (req, res) => {
    const { employeNom, niveauScolaire, nombreEnfants, agenceRetrait } = req.body || {};
    const nb = parseInt(nombreEnfants, 10) || 1;
    const valeur = nb * 35000;
    const subvention = nb * 15000;
    const reste = valeur - subvention;
    const nouveau = {
        id: `kit-${Date.now()}`,
        employeNom: employeNom || 'Collaborateur SII',
        niveauScolaire: niveauScolaire || 'Collège',
        nombreEnfants: nb,
        valeurTotaleFcfa: valeur,
        subventionSiiFcfa: subvention,
        resteAChargeSalarieFcfa: reste,
        formulePrelevement: `${Math.round(reste / 3).toLocaleString('fr-FR')} FCFA / mois (sur 3 mois sans frais)`,
        statutLivraison: 'CONFIRMEE_A_PREPARER',
        agenceRetrait: agenceRetrait || 'Agence Orange Abidjan'
    };
    commandesKits.unshift(nouveau);
    res.json({ succes: true, commande: nouveau, message: 'Pack rentrée scolaire réservé avec subvention employeur appliquée !' });
});

module.exports = router;
