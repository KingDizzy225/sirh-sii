const express = require('express');
const router = express.Router();

let equipementsReconditionnes = [
    {
        id: 'stf-eq-01',
        designation: 'Samsung Galaxy S24 Ultra 256GB (Ex-Démo Boutique)',
        etatEsthetique: 'Comme neuf (Batterie 98%, testé banc Orange)',
        prixPublicMarcheFcfa: 750000,
        prixStaffSiiFcfa: 225000, // -70% privilège
        garantieMois: 12,
        stockDisponible: 3,
        prelevementSalairePossible: '75 000 FCFA / mois sur 3 mois',
        statutVente: 'VENTE_FLASH_OUVERTE'
    },
    {
        id: 'stf-eq-02',
        designation: 'Apple iPhone 15 Pro Max 128GB (Retour SAV Remplacé)',
        etatEsthetique: 'Reconditionné Grade A+ (Écran & batterie neufs)',
        prixPublicMarcheFcfa: 800000,
        prixStaffSiiFcfa: 260000,
        garantieMois: 12,
        stockDisponible: 2,
        prelevementSalairePossible: '86 600 FCFA / mois sur 3 mois',
        statutVente: 'VENTE_FLASH_OUVERTE'
    },
    {
        id: 'stf-eq-03',
        designation: 'Routeur Box 5G Orange Flybox Home (Reconditionnée)',
        etatEsthetique: 'Parfait état de marche avec bloc alimentation officiel',
        prixPublicMarcheFcfa: 70000,
        prixStaffSiiFcfa: 15000,
        garantieMois: 6,
        stockDisponible: 8,
        prelevementSalairePossible: 'Paiement comptant ou fin de mois',
        statutVente: 'VENTE_FLASH_OUVERTE'
    }
];

let reservationsStaff = [
    {
        id: 'res-stf-101',
        employeNom: 'Gouaméné Marc',
        matricule: 'EMP-3319',
        article: 'Samsung Galaxy S24 Ultra 256GB',
        montantTotalFcfa: 225000,
        modeReglement: 'Prélèvement échelonné sur paie (3 mois sans frais)',
        statutLivraison: 'PREPARE_EXPEDITION_AGENCE',
        agenceRetrait: 'Agence Orange Marcory'
    }
];

router.get('/catalogue', (req, res) => {
    res.json({
        succes: true,
        remisePrivilege: 'Jusqu\'à -70% sur les équipements Orange testés et certifiés',
        catalogue: equipementsReconditionnes,
        reservations: reservationsStaff
    });
});

router.post('/reserver', (req, res) => {
    const { equipementId, employeNom, agenceRetrait } = req.body || {};
    const eq = equipementsReconditionnes.find(e => e.id === equipementId) || equipementsReconditionnes[0];
    const nouvelleRes = {
        id: `res-stf-${Date.now()}`,
        employeNom: employeNom || 'Collaborateur SII',
        matricule: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        article: eq.designation,
        montantTotalFcfa: eq.prixStaffSiiFcfa,
        modeReglement: eq.prelevementSalairePossible,
        statutLivraison: 'COMMANDE_CONFIRMEE_STOCK_RESERVE',
        agenceRetrait: agenceRetrait || 'Agence Orange Abidjan'
    };
    reservationsStaff.unshift(nouvelleRes);
    res.json({
        succes: true,
        reservation: nouvelleRes,
        message: `Félicitations ! Votre équipement ${eq.designation} a été réservé au tarif staff privilège de ${eq.prixStaffSiiFcfa.toLocaleString('fr-FR')} FCFA.`
    });
});

module.exports = router;
