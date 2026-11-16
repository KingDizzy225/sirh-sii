const express = require('express');
const router = express.Router();

let fichesIncivilites = [
    {
        id: 'inc-01',
        conseillerNom: 'Soro Fatoumata',
        agenceNom: 'Agence Orange Cocody Angré',
        motifClient: 'Compte Orange Money bloqué suite à erreur de code PIN',
        typeAgression: 'VERBALE_INSULTES_MENACES',
        droitRetrait15MinUtilise: true,
        suiviPsychologiqueSouhaite: false,
        interventionVigile: true,
        rapportTransmisDirecteur: true,
        statutDossier: 'CLOTURE_AGENT_APAISÉ',
        dateHeure: 'Aujourd\'hui à 11:20'
    },
    {
        id: 'inc-02',
        conseillerNom: 'Kouamé Eric',
        agenceNom: 'Agence Orange Yopougon Bel Air',
        motifClient: 'Délai d\'activation box Fibre à domicile',
        typeAgression: 'INJURES_TENTATIVE_DEGRADATION_GUICHET',
        droitRetrait15MinUtilise: true,
        suiviPsychologiqueSouhaite: true,
        interventionVigile: true,
        rapportTransmisDirecteur: true,
        statutDossier: 'RDV_PSYCHOLOGUE_PLANIFIE',
        dateHeure: 'Hier à 16:45'
    }
];

router.get('/statistiques', (req, res) => {
    res.json({
        succes: true,
        permanenceEcoute247: '+225 27 20 00 11 22',
        incidents: fichesIncivilites
    });
});

router.post('/declarer', (req, res) => {
    const { conseillerNom, agenceNom, motifClient, typeAgression, suiviPsy } = req.body || {};
    const nouvelle = {
        id: `inc-${Date.now()}`,
        conseillerNom: conseillerNom || 'Conseiller SII',
        agenceNom: agenceNom || 'Agence Orange Abidjan',
        motifClient: motifClient || 'Contestation client en caisse',
        typeAgression: typeAgression || 'VERBALE_INSULTES',
        droitRetrait15MinUtilise: true,
        suiviPsychologiqueSouhaite: !!suiviPsy,
        interventionVigile: true,
        rapportTransmisDirecteur: true,
        statutDossier: suiviPsy ? 'RDV_PSYCHOLOGUE_PLANIFIE' : 'PAUSE_DECOMPRESSION_ACTIVEE',
        dateHeure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    fichesIncivilites.unshift(nouvelle);
    res.json({
        succes: true,
        fiche: nouvelle,
        message: 'Déclaration prise en compte. Droit de décompression de 15 min immédiat en salle de repos accordé.'
    });
});

module.exports = router;
