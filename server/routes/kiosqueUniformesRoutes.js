const express = require('express');
const router = express.Router();

let commandesUniformes = [
    {
        id: 'unif-01',
        employeNom: 'Zadi Marina',
        agenceNom: 'Agence Orange Cocody Deux Plateaux',
        article: 'Pack 3 Polos Orange Officiels SII + Gilet Hivernage',
        taille: 'M (Femme)',
        statutCommande: 'EXPEDIE_AGENCE',
        pressingPartenaire: 'Clean & Net Cocody (50% subventionné)',
        codePressingMois: 'PRESS-SII-8821',
        dateDemande: '10/10/2026'
    },
    {
        id: 'unif-02',
        employeNom: 'N\'Goran Serge',
        agenceNom: 'Agence Orange Koumassi Remblais',
        article: 'Chemise Cérémonie Manches Longues Orange Business',
        taille: 'L (Homme)',
        statutCommande: 'LIVRE_CONFIRME',
        pressingPartenaire: 'Pressing Élite Marcory (50% subventionné)',
        codePressingMois: 'PRESS-SII-4402',
        dateDemande: '08/10/2026'
    }
];

router.get('/statuts', (req, res) => {
    res.json({
        succes: true,
        quotaGratuitAnnuel: '2 packs complets par conseiller / an',
        reductionPressingPourcentage: 50,
        commandes: commandesUniformes
    });
});

router.post('/commander', (req, res) => {
    const { employeNom, agenceNom, article, taille } = req.body || {};
    const nouvelle = {
        id: `unif-${Date.now()}`,
        employeNom: employeNom || 'Conseiller SII',
        agenceNom: agenceNom || 'Agence Orange Abidjan',
        article: article || 'Pack 3 Polos Orange Officiels',
        taille: taille || 'M',
        statutCommande: 'COMMANDE_VALIDEE_EN_COURS',
        pressingPartenaire: 'Pressing Partenaire SII Abidjan',
        codePressingMois: `PRESS-SII-${Math.floor(1000 + Math.random() * 9000)}`,
        dateDemande: new Date().toLocaleDateString('fr-FR')
    };
    commandesUniformes.unshift(nouvelle);
    res.json({ succes: true, commande: nouvelle, message: 'Commande de tenue officielle validée avec bon pressing offert !' });
});

module.exports = router;
