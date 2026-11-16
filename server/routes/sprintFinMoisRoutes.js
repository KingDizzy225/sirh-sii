const express = require('express');
const router = express.Router();

let sentinelleSprint = [
    {
        id: 'spr-01',
        agenceNom: 'Agence Orange Cocody Angré',
        objectifsRestantsPourcentage: 8,
        joursRestantsAvantCloture: 3,
        indicePressionEquipe: 'MODERE_STIMULANT', // 'SEREIN' | 'MODERE_STIMULANT' | 'SURCHAUFFE_ALERTE'
        heuresSuppEstimeesSemaine: 4.5,
        pauseGouterOfferte: true,
        menuGouterJour: 'Jus de Bissap frais & Dégué / Pâtisseries locales',
        statutBienEtre: 'Bon esprit combatif - Pause collective de 16h respectée'
    },
    {
        id: 'spr-02',
        agenceNom: 'Agence Orange Koumassi Remblais',
        objectifsRestantsPourcentage: 19,
        joursRestantsAvantCloture: 3,
        indicePressionEquipe: 'SURCHAUFFE_ALERTE',
        heuresSuppEstimeesSemaine: 8.0,
        pauseGouterOfferte: true,
        menuGouterJour: 'Fruits frais coupés (Ananas, Pastèque) & Cocktails vitaminés',
        statutBienEtre: 'Superviseur RH dépêché pour appui vente et allégement du guichet caisse'
    }
];

router.get('/statuts', (req, res) => {
    res.json({
        succes: true,
        dispositifAntiBurnout: 'Interdiction des fermetures au-delà de 19h30 + Pause goûter tonus offerte par SII à 16h',
        agences: sentinelleSprint
    });
});

router.post('/commander-gouter-equipe', (req, res) => {
    const { agenceNom } = req.body || {};
    const ag = sentinelleSprint.find(a => a.agenceNom === agenceNom) || sentinelleSprint[0];
    ag.pauseGouterOfferte = true;
    res.json({
        succes: true,
        message: `Pause goûter énergisante commandée pour toute l'équipe de ${ag.agenceNom} ! Décompression garantie pour le sprint final.`
    });
});

module.exports = router;
