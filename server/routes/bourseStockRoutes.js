const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des demandes de transfert matériel
let demandesStock = [
    {
        id: 'stk-1',
        demandeurNom: 'Moussa Fofana',
        siteDemandeur: 'Agence Orange Cocody Saint-Jean',
        materiel: 'Cartes SIM Physiques 4G/5G',
        quantiteDemandee: 50,
        urgence: 'HAUTE', // 'NORMALE' | 'HAUTE' | 'CRITIQUE'
        siteCedeurPropose: 'Agence Orange 2 Plateaux Vallon (2.8 km)',
        statut: 'EN_ATTENTE_LIVRAISON', // 'OUVERTE' | 'EN_ATTENTE_LIVRAISON' | 'LIVRE'
        dateDemande: 'Aujourd\'hui 10:15',
        bonDeTransfertRef: 'BT-SII-2026-089'
    },
    {
        id: 'stk-2',
        demandeurNom: 'Kady Sangaré',
        siteDemandeur: 'Agence Cap Sud Marcory',
        materiel: 'Routeurs Flybox 4G Home',
        quantiteDemandee: 10,
        urgence: 'NORMALE',
        siteCedeurPropose: 'Agence Treichville Arras (3.5 km)',
        statut: 'OUVERTE',
        dateDemande: 'Aujourd\'hui 09:30',
        bonDeTransfertRef: null
    }
];

/**
 * GET /api/bourse-stock/demandes
 * Liste des alertes de dépannage stock inter-agences
 */
router.get('/demandes', (req, res) => {
    res.json({
        succes: true,
        demandes: demandesStock
    });
});

/**
 * POST /api/bourse-stock/demander
 * Publier un appel à dépannage de matériel
 */
router.post('/demander', (req, res) => {
    const { siteDemandeur, materiel, quantiteDemandee, urgence } = req.body || {};
    
    const nouvelle = {
        id: `stk-${Date.now()}`,
        demandeurNom: req.user?.name || 'Chef de Vente',
        siteDemandeur: siteDemandeur || 'Agence Orange',
        materiel: materiel || 'Cartes SIM',
        quantiteDemandee: parseInt(quantiteDemandee, 10) || 20,
        urgence: urgence || 'HAUTE',
        siteCedeurPropose: 'Agence voisine la plus proche',
        statut: 'OUVERTE',
        dateDemande: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        bonDeTransfertRef: null
    };

    demandesStock.unshift(nouvelle);

    res.status(201).json({
        succes: true,
        demande: nouvelle,
        message: "SOS Dépannage matériel diffusé aux agences du secteur !"
    });
});

/**
 * POST /api/bourse-stock/accepter/:id
 * Une agence voisine accepte de céder son stock excédentaire
 */
router.post('/accepter/:id', (req, res) => {
    const { id } = req.params;
    const { siteCedeur } = req.body || {};
    const demande = demandesStock.find(d => d.id === id);
    if (!demande) return res.status(404).json({ error: "Demande introuvable." });

    demande.statut = 'EN_ATTENTE_LIVRAISON';
    demande.siteCedeurPropose = siteCedeur || req.user?.name || 'Agence Cédante';
    demande.bonDeTransfertRef = `BT-SII-2026-${Math.floor(100 + Math.random() * 900)}`;

    res.json({
        succes: true,
        demande,
        message: `Dépannage accepté ! Bon de transfert émis : ${demande.bonDeTransfertRef}`
    });
});

module.exports = router;
