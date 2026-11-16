const express = require('express');
const router = express.Router();

let bilansSante = [
    {
        id: 'med-01',
        employeNom: 'Bamba Aïcha',
        agenceNom: 'Agence Orange Plateau Postel 2001',
        dateExamen: '02/10/2026',
        centreMedicalPartenaire: 'Polyclinique Sainte Anne-Marie (PISAM Abidjan)',
        examenVisuel: 'Légère fatigue oculaire (écrans caisse 8h/j) - Verres anti-lumière bleue prescrits',
        examenAuditif: 'Normal (100% acuité)',
        tensionArterielle: '12/8 (Optimale)',
        priseEnChargeLunettesFcfa: 45000,
        subventionSiiAccordee: true,
        prochainControle: 'Octobre 2027'
    },
    {
        id: 'med-02',
        employeNom: 'Kouassi Fabrice',
        agenceNom: 'Agence Orange Koumassi',
        dateExamen: '04/10/2026',
        centreMedicalPartenaire: 'Centre Médical du Salariat Treichville',
        examenVisuel: 'Parfait',
        examenAuditif: 'Parfait',
        tensionArterielle: '13/8',
        priseEnChargeLunettesFcfa: 0,
        subventionSiiAccordee: false,
        prochainControle: 'Octobre 2027'
    }
];

router.get('/bilans', (req, res) => {
    res.json({
        succes: true,
        priseEnChargeForfaitLunettesFcfa: 50000,
        tauxCouvertureMutuelle: '80% + Subvention SII 20%',
        bilans: bilansSante
    });
});

router.post('/demander-bilan', (req, res) => {
    const { employeNom, agenceNom, besoinLunettes } = req.body || {};
    const nouveau = {
        id: `med-${Date.now()}`,
        employeNom: employeNom || 'Collaborateur SII',
        agenceNom: agenceNom || 'Agence Orange Abidjan',
        dateExamen: 'Rendez-vous planifié sous 5 jours ouvrés',
        centreMedicalPartenaire: 'Polyclinique Partenaire SII',
        examenVisuel: besoinLunettes ? 'Bilan ophtalmologique demandé' : 'Bilan complet standard',
        examenAuditif: 'Audiométrie de routine',
        tensionArterielle: 'À mesurer en cabinet',
        priseEnChargeLunettesFcfa: 50000,
        subventionSiiAccordee: true,
        prochainControle: 'Annuel'
    };
    bilansSante.unshift(nouveau);
    res.json({ succes: true, bilan: nouveau, message: 'Rendez-vous bilan santé en agence réservé avec prise en charge mutuelle validée.' });
});

module.exports = router;
