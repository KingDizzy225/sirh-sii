const express = require('express');
const router = express.Router();

let registreObjets = [
    {
        id: 'obj-2026-01',
        descriptionObjet: 'Portefeuille en cuir noir contenant CNI ivoirienne + carte bancaire Visa',
        proprietairePresume: 'Koné Bakary (CNI N° CI002910293)',
        telephoneContact: '+225 07 48 90 22 11',
        lieuDecouverte: 'Guichet N°3 Caisse Orange Money',
        agenceNom: 'Agence Orange Cocody Deux Plateaux',
        agentDecouvreur: 'Soro Marina (Conseillère)',
        lieuStockageSecurise: 'Coffre-fort d\'agence (Casier N°2)',
        smsNotificationEnvoye: true,
        statutRestitution: 'EN_ATTENTE_RETRAIT_CLIENT',
        dateDepot: 'Aujourd\'hui 09:30'
    },
    {
        id: 'obj-2026-02',
        descriptionObjet: 'Téléphone Samsung Galaxy A15 avec étui bleu',
        proprietairePresume: 'Dame Ouattara Kadiatou',
        telephoneContact: '+225 05 55 12 88 90',
        lieuDecouverte: 'Espace Attente VIP Fibre',
        agenceNom: 'Agence Orange Plateau Postel 2001',
        agentDecouvreur: 'Vigile Sécurité Seydou',
        lieuStockageSecurise: 'Coffre-fort d\'agence',
        smsNotificationEnvoye: true,
        statutRestitution: 'RESTITUE_AVEC_DECHARGE',
        dateDepot: 'Hier 16:15'
    }
];

router.get('/liste', (req, res) => {
    res.json({
        succes: true,
        securiteProcedure: 'Tous les objets de valeur sont placés sous double clé dans le coffre d\'agence avec signature du chef d\'agence',
        objets: registreObjets
    });
});

router.post('/enregistrer', (req, res) => {
    const { descriptionObjet, proprietairePresume, telephoneContact, lieuDecouverte, agenceNom, agentDecouvreur } = req.body || {};
    const nouveau = {
        id: `obj-2026-${Math.floor(10 + Math.random() * 90)}`,
        descriptionObjet: descriptionObjet || 'Objet oublié au guichet',
        proprietairePresume: proprietairePresume || 'Client inconnu',
        telephoneContact: telephoneContact || '+225 07 XX XX XX XX',
        lieuDecouverte: lieuDecouverte || 'Comptoir agence',
        agenceNom: agenceNom || 'Agence Orange Abidjan',
        agentDecouvreur: agentDecouvreur || 'Agent SII',
        lieuStockageSecurise: 'Coffre-fort d\'agence (Sous clé)',
        smsNotificationEnvoye: true,
        statutRestitution: 'EN_ATTENTE_RETRAIT_CLIENT',
        dateDepot: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    registreObjets.unshift(nouveau);
    res.json({
        succes: true,
        objet: nouveau,
        message: 'Objet consigné au coffre-fort d\'agence. SMS de convocation généré pour le client.'
    });
});

module.exports = router;
