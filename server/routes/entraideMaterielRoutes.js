const express = require('express');
const router = express.Router();

let missionsEntraide = [
    {
        id: 'ent-101',
        agenceDemanseuse: 'Agence Orange Treichville Arras',
        agencePreteuse: 'Agence Orange Marcory Zone 4',
        equipementRequis: '1x Lecteur de Carte SIM ARTCI / Gemalto USB',
        motifUrgence: 'Lecteur principal grillé suite à surtension CIE. 25 clients bloqués pour identification SIM.',
        statutMission: 'EN_LIVRAISON_YANGO_MOTO',
        coursierNom: 'Koffi Express Moto',
        coursierTelephone: '+225 07 48 99 12 01',
        delaiEstimeMin: 22,
        heureDemande: '10:14',
        heureRetourPrevue: 'Demain, 14:00 (après réception lot neuf)',
        priorite: 'CRITIQUE'
    },
    {
        id: 'ent-102',
        agenceDemanseuse: 'Agence Orange Yopougon Maroc',
        agencePreteuse: 'Agence Orange Yopougon Siporex',
        equipementRequis: '2x Rouleaux Thermiques 80mm pour Reçus Orange Money',
        motifUrgence: 'Rupture stock de bobines avant le rush des salaires de fin de mois.',
        statutMission: 'LIVRE_EFFECTUE',
        coursierNom: 'Mamadou Navette Interne SII',
        coursierTelephone: '+225 05 64 22 19 88',
        delaiEstimeMin: 0,
        heureDemande: '08:30',
        heureRetourPrevue: 'Consommable non retournable (compensation sur commande générale)',
        priorite: 'MOYENNE'
    },
    {
        id: 'ent-103',
        agenceDemanseuse: 'Agence Orange Cocody Angré 8ème Tranche',
        agencePreteuse: 'Agence Orange Riviera Palmeraie',
        equipementRequis: '1x Terminal TPE Bancaire / Orange Money Mobile',
        motifUrgence: 'Batterie TPE gonflée, impossibilité d\'encaisser les règlements par carte bancaire.',
        statutMission: 'EN_ATTENTE_PREPARATION',
        coursierNom: 'Coursier Yango Business',
        coursierTelephone: '+225 01 02 03 04 05',
        delaiEstimeMin: 35,
        heureDemande: '11:02',
        heureRetourPrevue: 'Fin de semaine (Vendredi 18h)',
        priorite: 'HAUTE'
    }
];

let inventaireReserveSecours = [
    { id: 'mat-1', type: 'Lecteur SIM Biométrique ARTCI', dispoPlateau: 4, dispoMarcory: 2, dispoYopougon: 1 },
    { id: 'mat-2', type: 'TPE Mobile Sans Contact', dispoPlateau: 3, dispoMarcory: 1, dispoYopougon: 2 },
    { id: 'mat-3', type: 'Imprimante Reçus Thermique Bluetooth', dispoPlateau: 5, dispoMarcory: 2, dispoYopougon: 3 },
    { id: 'mat-4', type: 'Routeur 4G Secours Huawei Orange Pro', dispoPlateau: 6, dispoMarcory: 3, dispoYopougon: 2 }
];

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        missionsActives: missionsEntraide.filter(m => m.statutMission !== 'LIVRE_EFFECTUE').length,
        tempsMoyenAcheminementMin: 28,
        tauxSuccesSauvetageBoutique: '99.1%',
        missions: missionsEntraide,
        reserveSecours: inventaireReserveSecours
    });
});

router.post('/demande-secours', (req, res) => {
    const { agenceDemanseuse, agencePreteuse, equipementRequis, motifUrgence, priorite } = req.body;
    const nouvelle = {
        id: `ent-${Date.now().toString().slice(-4)}`,
        agenceDemanseuse: agenceDemanseuse || 'Agence Orange Plateau',
        agencePreteuse: agencePreteuse || 'Hub Logistique SII Marcory',
        equipementRequis: equipementRequis || '1x TPE de Secours',
        motifUrgence: motifUrgence || 'Panne subite en agence',
        statutMission: 'EN_LIVRAISON_YANGO_MOTO',
        coursierNom: 'Coursier Express Allô Moto',
        coursierTelephone: '+225 07 00 11 22 33',
        delaiEstimeMin: 25,
        heureDemande: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        heureRetourPrevue: 'Sous 48h',
        priorite: priorite || 'HAUTE'
    };
    missionsEntraide.unshift(nouvelle);
    res.json({ succes: true, mission: nouvelle });
});

module.exports = router;
