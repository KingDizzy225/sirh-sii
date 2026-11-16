const express = require('express');
const router = express.Router();

let alertesChurn = [
    {
        id: 'churn-1',
        employeNom: 'Jean-Luc Koffi',
        matricule: 'EMP-3882',
        agence: 'Agence Orange Marcory Résidentiel',
        poste: 'Chargé d\'Affaires PME/PMI',
        ancienneteMois: 26,
        scoreRisque: 84, // 0 - 100
        niveauRisque: 'ELEVE', // 'FAIBLE' | 'MODERE' | 'ELEVE'
        facteursDetectes: [
            'Chute de 38% des validations de quiz techniques depuis 45 jours',
            '3 demandes d\'avances sur salaire consécutives en 2 mois',
            'Baisse soudaine de la ponctualité le matin (4 retards en 2 semaines)',
            'Pic de consultations de son profil et attestations sur le portail SIRH'
        ],
        recommandationIA: 'Planifier un entretien RH informel autour d\'un café, proposer une revalorisation de palier de commissionnement ou un poste de Chef de Vente adjoint.',
        statutSuivi: 'ENTRETIEN_PLANIFIE',
        responsableRH: 'Mireille Dago (RH Réseau Sud)'
    },
    {
        id: 'churn-2',
        employeNom: 'Christelle N\'Guessan',
        matricule: 'EMP-5190',
        agence: 'Agence Orange Bouaké Commerce',
        poste: 'Animatrice des Ventes Terrain',
        ancienneteMois: 14,
        scoreRisque: 62,
        niveauRisque: 'MODERE',
        facteursDetectes: [
            'Écart moyen de 25% par rapport aux objectifs de vente Fibre de zone',
            'Signalement d\'usure lors des tournées moto en zone rurale',
            'Score d\'humeur au sondage hebdomadaire passé de 4.8/5 à 2.9/5'
        ],
        recommandationIA: 'Accorder 3 jours de récupération, réajuster le secteur géographique et proposer un binôme de soutien.',
        statutSuivi: 'PLAN_ACTION_ENGAGE',
        responsableRH: 'Hervé Bamba (RH Zone Centre)'
    },
    {
        id: 'churn-3',
        employeNom: 'Marc-Aurèle Diabagaté',
        matricule: 'EMP-7231',
        agence: 'Agence Orange Yopougon Maroc',
        poste: 'Conseiller Clientèle Guichet',
        ancienneteMois: 8,
        scoreRisque: 28,
        niveauRisque: 'FAIBLE',
        facteursDetectes: [
            'Excellente progression aux certifications Orange CI',
            'Participation active à la Tontine RH et au Maracana',
            'Stabilité totale des indicateurs de présence'
        ],
        recommandationIA: 'Profil à fort potentiel. Identifier pour le programme Pépinière Talents 2027.',
        statutSuivi: 'SOUS_RADAR_POSITIF',
        responsableRH: 'Mireille Dago'
    }
];

router.get('/statistiques', (req, res) => {
    res.json({
        succes: true,
        effectifEvalue: 385,
        tauxRetentionGlobal: '94.2%',
        profilsSousSurveillance: alertesChurn.length,
        economieEstimeeRecrutementFcfa: 18500000,
        alertes: alertesChurn
    });
});

router.post('/planifier-action', (req, res) => {
    const { alerteId, decision, commentaire } = req.body;
    const alerte = alertesChurn.find(a => a.id === alerteId);
    if (alerte) {
        alerte.statutSuivi = decision || 'ACTION_VALIDEE';
        alerte.recommandationIA = commentaire ? `${alerte.recommandationIA} | Note RH: ${commentaire}` : alerte.recommandationIA;
    }
    res.json({ succes: true, alerte });
});

module.exports = router;
