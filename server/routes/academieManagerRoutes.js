const express = require('express');
const router = express.Router();

let capsulesJour = [
    {
        id: 'cap-01',
        titre: 'Animer le Briefing Express de 8h15 en Boutique',
        dureeMinutes: 3,
        thematique: 'LEADERSHIP_TERRAIN',
        pointsCles: [
            'Féliciter un exploit de la veille (ex: une vente Fibre Sérénité)',
            'Rappeler l\'objectif de l\'équipe du jour sans pression négative',
            'S\'assurer de la bonne humeur et de l\'état d\'esprit de chaque conseiller'
        ],
        quizRapide: 'Quelle est la première chose à faire au briefing ? Réponse : Célébrer une victoire collective.',
        badgeDebloque: '🚀 Maître du Morning Kick-off',
        tauxCompletionManager: 88
    },
    {
        id: 'cap-02',
        titre: 'Désamorcer une Tension en Caisse sans Perdre son Calme',
        dureeMinutes: 4,
        thematique: 'RELATION_CLIENT',
        pointsCles: [
            'Isoler le client mécontent dans l\'espace VIP sans public',
            'Écouter 60 secondes complètes sans interrompre',
            'Proposer une solution immédiate avec le superviseur'
        ],
        quizRapide: 'Où gérer un client énervé ? Réponse : En espace calme isolé.',
        badgeDebloque: '🛡️ Gardien de la Sérénité',
        tauxCompletionManager: 92
    }
];

router.get('/capsules', (req, res) => {
    res.json({
        succes: true,
        scoreHebdoManager: '4.8/5 étoiles',
        capsules: capsulesJour
    });
});

router.post('/valider-capsule', (req, res) => {
    const { capsuleId, managerNom } = req.body || {};
    res.json({
        succes: true,
        message: `Capsule complétée avec succès par ${managerNom || 'Chef d\'Agence'} ! Badge de compétence ajouté à votre dossier de manager SII.`
    });
});

module.exports = router;
