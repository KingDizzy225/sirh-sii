const express = require('express');
const router = express.Router();

let alertesDeluge = [
    {
        id: 'deluge-1',
        zone: 'Carrefour Duncan / Riviera 2 & Attoban',
        niveauAlerte: 'CRITIQUE', // 'VIGILANCE' | 'ORANGE' | 'CRITIQUE'
        agencesImpactees: ['Agence Orange Riviera Palmeraie', 'Agence Orange Cocody St Jean'],
        passVtcActifs: 18,
        montantVoucherFcfa: 7500,
        statutNavette: 'EN_ROUTE_VERS_AGENCES',
        heureDeclenchement: '16:45',
        consigneSecurite: 'Interdiction de franchir les cuvettes d\'eau. Rapatriement Yango/Uber pris en charge à 100% par SII.'
    },
    {
        id: 'deluge-2',
        zone: 'Carrefour Siporex & Bel Air (Yopougon)',
        niveauAlerte: 'ORANGE',
        agencesImpactees: ['Agence Orange Yopougon Siporex', 'Kiosque Lubafrique'],
        passVtcActifs: 12,
        montantVoucherFcfa: 5000,
        statutNavette: 'STANDBY',
        heureDeclenchement: '17:10',
        consigneSecurite: 'Regroupement à l\'agence jusqu\'à décrue ou départ par navette sécurisée SII.'
    }
];

let demandesVouchers = [
    {
        id: 'vch-101',
        employeNom: 'Amina Bamba',
        matricule: 'EMP-7721',
        agenceDepart: 'Agence Orange Riviera Palmeraie',
        quartierDestination: 'Abobo Baoulé',
        plateformeVtc: 'Yango Business SII',
        codeVoucher: 'DELUGE-YNG-8942',
        statut: 'VALIDE_EMIS',
        heureEmission: '17:15'
    }
];

router.get('/statuts', (req, res) => {
    res.json({
        succes: true,
        alertes: alertesDeluge,
        vouchers: demandesVouchers
    });
});

router.post('/demande-voucher', (req, res) => {
    const { employeNom, agenceDepart, quartierDestination } = req.body || {};
    const nouveau = {
        id: `vch-${Date.now()}`,
        employeNom: employeNom || 'Conseiller SII',
        matricule: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        agenceDepart: agenceDepart || 'Agence Orange Cocody',
        quartierDestination: quartierDestination || 'Domicile collaborateur',
        plateformeVtc: 'Yango Business SII',
        codeVoucher: `DELUGE-YNG-${Math.floor(1000 + Math.random() * 9000)}`,
        statut: 'VALIDE_EMIS',
        heureEmission: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    demandesVouchers.unshift(nouveau);
    res.json({ succes: true, voucher: nouveau, message: 'Pass VTC généré avec succès. Bon retour sécurisé !' });
});

module.exports = router;
