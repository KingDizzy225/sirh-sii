const express = require('express');
const router = express.Router();

let agencesConnectivite = [
    {
        id: 'ag-off-1',
        nom: 'Agence Orange Bouaké Ville',
        statutReseau: 'OFFLINE_SUR_BATTERIE',
        derniereConnexion: 'Il y a 42 min',
        motifCoupure: 'Incident Fibre Optique Axe Tiébissou-Bouaké',
        elementsEnAttenteLocal: 34, // pointages, audits, quiz
        tailleCacheMo: 14.8,
        modeDegradeActif: true,
        batterieRouteur4G: '78%',
        prioriteSync: 'HAUTE'
    },
    {
        id: 'ag-off-2',
        nom: 'Agence Orange San Pedro Port',
        statutReseau: 'ONLINE_STABLE',
        derniereConnexion: 'Actif temps réel (Fibre 100 Mbps)',
        motifCoupure: 'Aucun',
        elementsEnAttenteLocal: 0,
        tailleCacheMo: 2.1,
        modeDegradeActif: false,
        batterieRouteur4G: '100%',
        prioriteSync: 'NORMAL'
    },
    {
        id: 'ag-off-3',
        nom: 'Kiosque Mobile Marché d\'Abobo',
        statutReseau: 'ONLINE_4G_DEGRADEE',
        derniereConnexion: 'Il y a 3 min (Latence 420 ms)',
        motifCoupure: 'Saturation antenne relais marché',
        elementsEnAttenteLocal: 7,
        tailleCacheMo: 4.5,
        modeDegradeActif: false,
        batterieRouteur4G: '62%',
        prioriteSync: 'MOYENNE'
    },
    {
        id: 'ag-off-4',
        nom: 'Agence Orange Korhogo Ferké',
        statutReseau: 'SYNCHRONISATION_EN_COURS',
        derniereConnexion: 'Connexion rétablie (Synchro 68%)',
        motifCoupure: 'Reprise après délestage CIE 2h',
        elementsEnAttenteLocal: 12,
        tailleCacheMo: 8.2,
        modeDegradeActif: false,
        batterieRouteur4G: '95%',
        prioriteSync: 'EN_COURS'
    }
];

router.get('/statut', (req, res) => {
    const totalEnAttente = agencesConnectivite.reduce((acc, a) => acc + a.elementsEnAttenteLocal, 0);
    res.json({
        succes: true,
        agencesSupervisees: agencesConnectivite.length,
        agencesHorsLigne: agencesConnectivite.filter(a => a.statutReseau.includes('OFFLINE')).length,
        totalOperationsEnAttente: totalEnAttente,
        debitMoyenSynchroKoSec: 320,
        agences: agencesConnectivite
    });
});

router.post('/forcer-synchro', (req, res) => {
    const { agenceId } = req.body;
    const agence = agencesConnectivite.find(a => a.id === agenceId);
    if (agence) {
        agence.elementsEnAttenteLocal = 0;
        agence.statutReseau = 'ONLINE_STABLE';
        agence.derniereConnexion = 'Synchronisé à l\'instant';
    }
    res.json({ succes: true, agence });
});

module.exports = router;
