const express = require('express');
const router = express.Router();

let groupesElectrogenes = [
    {
        id: 'grp-01',
        agenceNom: 'Agence Orange Yopougon Siporex',
        modeleGroupe: 'Caterpillar 45 kVA Diesel',
        capaciteReservoirLitres: 180,
        niveauActuelPourcent: 35, // Alerte seuil bas
        litresRestants: 63,
        autonomieEstimeeHeures: 6.5,
        statutFonctionnement: 'EN_FONCTIONNEMENT_DELESTAGE_CIE',
        derniereLivraisonGasoil: '10/10/2026 (120 Litres)',
        ticketRavitaillementAuto: 'TKT-GASOIL-2026-901',
        fournisseurGasoil: 'TotalEnergies Siporex',
        alerteSeuilBas: true
    },
    {
        id: 'grp-02',
        agenceNom: 'Agence Orange Cocody Angré 8ème Tranche',
        modeleGroupe: 'Perkins 30 kVA Insonorisé',
        capaciteReservoirLitres: 120,
        niveauActuelPourcent: 85,
        litresRestants: 102,
        autonomieEstimeeHeures: 14.0,
        statutFonctionnement: 'STANDBY_SECTEUR_CIE_NORMAL',
        derniereLivraisonGasoil: '12/10/2026 (80 Litres)',
        ticketRavitaillementAuto: null,
        fournisseurGasoil: 'Station Shell Angré',
        alerteSeuilBas: false
    }
];

router.get('/statuts', (req, res) => {
    res.json({
        succes: true,
        seuilCritiqueAlerte: '40% du réservoir',
        groupes: groupesElectrogenes
    });
});

router.post('/commander-gasoil', (req, res) => {
    const { agenceNom, litresDemandes, motif } = req.body || {};
    const grp = groupesElectrogenes.find(g => g.agenceNom === agenceNom) || groupesElectrogenes[0];
    const litres = parseInt(litresDemandes, 10) || 100;
    grp.niveauActuelPourcent = Math.min(100, grp.niveauActuelPourcent + 50);
    grp.litresRestants = Math.min(grp.capaciteReservoirLitres, grp.litresRestants + litres);
    grp.alerteSeuilBas = false;
    grp.derniereLivraisonGasoil = `Aujourd'hui (${litres} Litres livrés)`;

    res.json({
        succes: true,
        message: `Ravitaillement urgent de ${litres}L de gasoil validé pour ${grp.agenceNom}. Alimentation électrique garantie pour la boutique !`
    });
});

module.exports = router;
