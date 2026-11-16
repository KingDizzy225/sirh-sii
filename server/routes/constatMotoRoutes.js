const express = require('express');
const router = express.Router();

let constatsMoto = [
    {
        id: 'acc-2026-04',
        coursierNom: 'Drogba Sylvain',
        matricule: 'MOT-302',
        motoImmatriculation: '4489 KH 01 (Yamaha Crux 110)',
        lieuAccident: 'Boulevard VGE, carrefour Solibra Treichville',
        gravite: 'LEGER_DEGATS_MATERIELS', // 'LEGER' | 'SOINS_URGENTS' | 'HOSPITALISATION'
        statutSante: 'Soins infirmerie clinique partenaire Bia-Sud effectués. RAS.',
        photosJointes: 3,
        constatPolice: 'Fait à l\'amiable avec tiers',
        motoRemplacementLivree: true,
        dateHeure: 'Hier à 14:20'
    }
];

router.get('/liste', (req, res) => {
    res.json({ succes: true, constats: constatsMoto });
});

router.post('/declarer', (req, res) => {
    const { coursierNom, motoImmatriculation, lieuAccident, gravite, description } = req.body || {};
    const nouveau = {
        id: `acc-2026-${Math.floor(10 + Math.random() * 90)}`,
        coursierNom: coursierNom || 'Coursier / Technicien SII',
        matricule: 'MOT-' + Math.floor(100 + Math.random() * 900),
        motoImmatriculation: motoImmatriculation || '6721 JJ 01',
        lieuAccident: lieuAccident || 'Abidjan',
        gravite: gravite || 'LEGER_DEGATS_MATERIELS',
        statutSante: 'Prise en charge médicale et assistance dépannage déclenchées.',
        photosJointes: 2,
        constatPolice: 'En cours',
        motoRemplacementLivree: true,
        dateHeure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    constatsMoto.unshift(nouveau);
    res.json({ succes: true, constat: nouveau, message: 'Constat enregistré. Superviseur et assistance médicale SII alertés en direct.' });
});

module.exports = router;
