const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des annonces de trajets et demandes de bons de transport
let trajets = [
    {
        id: 'trj-1',
        chauffeurNom: 'Kouassi Konan',
        departNom: 'Agence Orange Plateau',
        arriveeZone: 'Yopougon Siporex / Niangon',
        heureDepart: '19:15',
        placesDispos: 3,
        placesOccupees: ['Awa Traoré'],
        telephone: '+225 07 08 11 22 33',
        vehicule: 'Véhicule personnel (Toyota Corolla)'
    },
    {
        id: 'trj-2',
        chauffeurNom: 'Mamadou Bakayoko',
        departNom: 'Agence Cap Sud Marcory',
        arriveeZone: 'Koumassi Remblais / Port-Bouët',
        heureDepart: '20:00',
        placesDispos: 2,
        placesOccupees: ['Sékou Touré'],
        telephone: '+225 05 55 44 33 22',
        vehicule: 'Véhicule personnel (Hyundai Tucson)'
    }
];

let bonsTransport = [
    {
        id: 'bon-1',
        employeNom: 'Fatou Bamba',
        siteNom: 'Agence Angré 8ème Tranche',
        motif: 'Inventaire de caisse nocturne (fin à 21h30)',
        montantFcfa: 3500,
        statut: 'VALIDE',
        partenaire: 'Yango Corporate SII',
        codeBon: 'SII-YG-8821'
    }
];

/**
 * GET /api/covoiturage/trajets
 * Récupère les départs du soir et trajets partagés
 */
router.get('/trajets', (req, res) => {
    res.json({
        succes: true,
        trajets,
        bonsTransport
    });
});

/**
 * POST /api/covoiturage/proposer
 * Un salarié propose des places dans son véhicule
 */
router.post('/proposer', (req, res) => {
    const { chauffeurNom, departNom, arriveeZone, heureDepart, placesDispos, telephone, vehicule } = req.body || {};
    if (!departNom || !arriveeZone || !heureDepart) {
        return res.status(400).json({ error: "Départ, destination et heure sont requis." });
    }

    const nouveau = {
        id: `trj-${Date.now()}`,
        chauffeurNom: chauffeurNom || req.user?.name || 'Collaborateur SII',
        departNom,
        arriveeZone,
        heureDepart,
        placesDispos: parseInt(placesDispos, 10) || 3,
        placesOccupees: [],
        telephone: telephone || '',
        vehicule: vehicule || 'Véhicule personnel'
    };

    trajets.unshift(nouveau);
    res.status(201).json({ succes: true, trajet: nouveau, message: "Trajet partagé publié avec succès !" });
});

/**
 * POST /api/covoiturage/rejoindre/:id
 * Réserver une place dans une navette collègue
 */
router.post('/rejoindre/:id', (req, res) => {
    const { id } = req.params;
    const { nomPassager } = req.body || {};
    const trajet = trajets.find(t => t.id === id);
    if (!trajet) return res.status(404).json({ error: "Trajet introuvable." });

    if (trajet.placesOccupees.length >= trajet.placesDispos) {
        return res.status(400).json({ error: "Plus de place disponible sur ce trajet." });
    }

    const passager = nomPassager || req.user?.name || 'Collaborateur';
    trajet.placesOccupees.push(passager);

    res.json({
        succes: true,
        message: `Place confirmée pour ${passager} avec ${trajet.chauffeurNom} (${trajet.heureDepart}).`,
        trajet
    });
});

/**
 * POST /api/covoiturage/bon-transport
 * Demander un bon de taxi sécurisé pour fermeture tardive
 */
router.post('/bon-transport', (req, res) => {
    const { employeNom, siteNom, motif, montantEstime } = req.body || {};
    const bon = {
        id: `bon-${Date.now()}`,
        employeNom: employeNom || req.user?.name || 'Salarié SII',
        siteNom: siteNom || 'Agence Orange',
        motif: motif || 'Fermeture tardive agence',
        montantFcfa: parseInt(montantEstime, 10) || 4000,
        statut: 'VALIDE',
        partenaire: 'Yango / Uber Partenaire SII',
        codeBon: `SII-SEC-${Math.floor(1000 + Math.random() * 9000)}`
    };

    bonsTransport.unshift(bon);
    res.status(201).json({
        succes: true,
        bon,
        message: `Bon de transport nocturne activé ! Code chauffeur : ${bon.codeBon}`
    });
});

module.exports = router;
