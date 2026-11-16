const express = require('express');
const router = express.Router();

let pointagesBiometriques = [
    {
        id: 'bio-901',
        employeNom: 'Mamadou Diabaté',
        matricule: 'EMP-3391',
        agenceAffectation: 'Agence Orange Riviera Palmeraie',
        heurePointage: '07:48:12',
        typePointage: 'PRISE_DE_POSTE_MATIN',
        scoreReconnaissanceFaciale: '99.4%',
        testVivacite: 'SUCCÈS (Clignement + Sourire validés)',
        geolocalisation: {
            latitude: 5.3614,
            longitude: -3.9782,
            distanceMetresAgence: 14,
            geofencingValide: true
        },
        deviceInfo: 'Samsung Galaxy A15 Entreprise MDM SII',
        statutValidation: 'POINTAGE_CERTIFIE'
    },
    {
        id: 'bio-902',
        employeNom: 'Sarah Akissi Kouamé',
        matricule: 'EMP-6712',
        agenceAffectation: 'Agence Orange Yopougon Siporex',
        heurePointage: '07:55:04',
        typePointage: 'PRISE_DE_POSTE_MATIN',
        scoreReconnaissanceFaciale: '98.8%',
        testVivacite: 'SUCCÈS (Mouvement tête validé)',
        geolocalisation: {
            latitude: 5.3421,
            longitude: -4.0789,
            distanceMetresAgence: 22,
            geofencingValide: true
        },
        deviceInfo: 'Infinix Hot 40 Pro Commercial',
        statutValidation: 'POINTAGE_CERTIFIE'
    },
    {
        id: 'bio-903',
        employeNom: 'Désiré N\'Dri',
        matricule: 'EMP-8021',
        agenceAffectation: 'Agence Orange Treichville Arras',
        heurePointage: '08:14:33',
        typePointage: 'TENTATIVE_ANORMALE',
        scoreReconnaissanceFaciale: '64.1% (ÉCHEC)',
        testVivacite: 'ÉCHEC_VIVACITE (Photo statique sur écran détectée)',
        geolocalisation: {
            latitude: 5.3102,
            longitude: -4.0041,
            distanceMetresAgence: 450, // Hors zone !
            geofencingValide: false
        },
        deviceInfo: 'Appareil Non Reconnu (Tentative de fraude)',
        statutValidation: 'ALERTE_FRAUDE_BLOQUEE'
    }
];

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        tauxSuccesBiometrique: '99.2%',
        totalPointagesDuJour: pointagesBiometriques.length,
        tentativesFraudeRejetees: pointagesBiometriques.filter(p => p.statutValidation.includes('FRAUDE')).length,
        rayonGeofencingMetres: 50,
        pointages: pointagesBiometriques
    });
});

router.post('/simuler-scan', (req, res) => {
    const { employeNom, agence, typePointage } = req.body;
    const nouveau = {
        id: `bio-${Date.now().toString().slice(-4)}`,
        employeNom: employeNom || 'Conseiller Commercial',
        matricule: 'EMP-LIVE',
        agenceAffectation: agence || 'Agence Orange Plateau République',
        heurePointage: new Date().toLocaleTimeString('fr-FR'),
        typePointage: typePointage || 'PRISE_DE_POSTE',
        scoreReconnaissanceFaciale: '99.1%',
        testVivacite: 'SUCCÈS (Vivacité faciale certifiée)',
        geolocalisation: {
            latitude: 5.3250,
            longitude: -4.0180,
            distanceMetresAgence: 12,
            geofencingValide: true
        },
        deviceInfo: 'Smartphone Flotte Orange CI sécurisé',
        statutValidation: 'POINTAGE_CERTIFIE'
    };
    pointagesBiometriques.unshift(nouveau);
    res.json({ succes: true, pointage: nouveau });
});

module.exports = router;
