const express = require('express');
const router = express.Router();

let equipementsQhse = [
    {
        id: 'qhse-01',
        agence: 'Agence Orange Cocody Deux-Plateaux',
        equipement: 'Groupe Électrogène Insonorisé Perkins 65 kVA',
        type: 'ENERGIE_SECOURS',
        dernierEntretien: '12/10/2026',
        heuresFonctionnementCumulees: 342,
        prochaineVidangeHeures: 400,
        niveauCarburant: '84% (Plein OK)',
        etatBatterieDemarrage: 'OPTIMALE (12.8V)',
        statutConformite: 'CONFORME_PRET',
        technicienResponsable: 'Général Diesel CI'
    },
    {
        id: 'qhse-02',
        agence: 'Agence Orange Yopougon Siporex',
        equipement: 'Système Climatisation Centrale Carrier 48 000 BTU',
        type: 'CONFORT_ET_VENTILATION',
        dernierEntretien: '18/08/2026',
        heuresFonctionnementCumulees: 1280,
        prochaineVidangeHeures: 1300,
        niveauCarburant: 'N/A (Électrique CIE)',
        etatBatterieDemarrage: 'Compresseur 2 bruyant à vérifier',
        statutConformite: 'MAINTENANCE_PREVENTIVE_REQUISE',
        technicienResponsable: 'Clim Ivoire Services'
    },
    {
        id: 'qhse-03',
        agence: 'Agence Orange Plateau République',
        equipement: 'Extincteurs CO2 5kg & Poudre Polyvalente ABC (Lot de 4)',
        type: 'SECURITE_INCENDIE',
        dernierEntretien: '05/01/2026',
        heuresFonctionnementCumulees: 0,
        prochaineVidangeHeures: 0,
        niveauCarburant: 'Pression Manomètre dans le Vert',
        etatBatterieDemarrage: 'Goupilles et plombs certifiés ONPC',
        statutConformite: 'CONFORME_PRET',
        technicienResponsable: 'Sécurité Incendie Côte d\'Ivoire (SICI)'
    },
    {
        id: 'qhse-04',
        agence: 'Agence Orange Bouaké Commerce',
        equipement: 'Trousse Pharmacie Urgence & Tensiomètre Électronique',
        type: 'PREMIERS_SECOURS_RH',
        dernierEntretien: '15/09/2026',
        heuresFonctionnementCumulees: 0,
        prochaineVidangeHeures: 0,
        niveauCarburant: 'Réapprovisionné',
        etatBatterieDemarrage: 'Piles tensiomètre neuves',
        statutConformite: 'CONFORME_PRET',
        technicienResponsable: 'Médecine du Travail SII'
    }
];

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        totalEquipementsSupervises: equipementsQhse.length,
        conformiteGlobale: '92.5%',
        alertesIntervention: equipementsQhse.filter(e => e.statutConformite !== 'CONFORME_PRET').length,
        prochainControleGeneralDate: '25/11/2026',
        equipements: equipementsQhse
    });
});

router.post('/declarer-maintenance', (req, res) => {
    const { equipementId, technicien, notes } = req.body;
    const eq = equipementsQhse.find(e => e.id === equipementId);
    if (eq) {
        eq.dernierEntretien = new Date().toLocaleDateString('fr-FR');
        eq.statutConformite = 'CONFORME_PRET';
        eq.etatBatterieDemarrage = notes || 'Maintenance préventive effectuée avec succès.';
        if (technicien) eq.technicienResponsable = technicien;
    }
    res.json({ succes: true, equipement: eq });
});

module.exports = router;
