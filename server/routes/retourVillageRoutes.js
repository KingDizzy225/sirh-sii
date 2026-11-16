const express = require('express');
const router = express.Router();

let rotationsFetes = [
    {
        id: 'rot-01',
        employeNom: 'Gaston Kouamé',
        matricule: 'EMP-2901',
        agence: 'Agence Orange Cocody St Jean',
        destinationVillage: 'Daoukro (Région de l\'Iffou)',
        feteSollicitee: 'Noël & Nouvel An 2026',
        sessionAttribution: 'VAGUE_1 (Du 21 Déc au 28 Déc)',
        statutRotation: 'ATTRIBUE_CONFIRME',
        historiquePrecedent: 'Était en permanence à l\'agence à Noël 2025 (Priorité 1)',
        primeTransportFcfa: 45000,
        permanenceRemplaceePar: 'Seydou Touré (Tournée Janvier)'
    },
    {
        id: 'rot-02',
        employeNom: 'Aïssatou Diallo',
        matricule: 'EMP-3490',
        agence: 'Agence Orange Treichville Arras',
        destinationVillage: 'Man (Région du Tonkpi)',
        feteSollicitee: 'Noël & Nouvel An 2026',
        sessionAttribution: 'VAGUE_2 (Du 29 Déc au 05 Jan)',
        statutRotation: 'ATTRIBUE_CONFIRME',
        historiquePrecedent: 'A assuré la permanence Tabaski 2026',
        primeTransportFcfa: 55000,
        permanenceRemplaceePar: 'Kouassi Konan Yao'
    },
    {
        id: 'rot-03',
        employeNom: 'Jean-Baptiste Yapi',
        matricule: 'EMP-5120',
        agence: 'Agence Orange Yopougon Siporex',
        destinationVillage: 'Agboville (Région de l\'Agnéby-Tiassa)',
        feteSollicitee: 'Noël 2026',
        sessionAttribution: 'EN_ATTENTE_ARBITRAGE',
        statutRotation: 'CANDIDATURE_DEPOSEE',
        historiquePrecedent: 'Était parti au village à Noël 2025 (Rotation alternative requise)',
        primeTransportFcfa: 30000,
        permanenceRemplaceePar: 'En cours d\'affectation'
    }
];

let reglesEquite = {
    criterePrincipal: 'Principe d\'alternance stricte (1 année sur 2)',
    quotaPermanenceBoutique: 'Minimum 60% de l\'équipe maintenue en agence pour le rush des fêtes',
    primeDeplacementProvince: 'Prise en charge forfaitaire du car UTB / CTE / transport selon la zone',
    bonusPermanenceFetes: '+50 000 FCFA de prime spéciale de présence pour les agents assurant le guichet le 24, 25 et 31 Décembre'
};

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        feteEnPreparation: 'Fêtes de Fin d\'Année 2026 (Noël & Réveillon)',
        tauxCouverturePermanenceBoutiques: '68.4% (Conforme seuil Orange)',
        totalDemandesEnregistrees: rotationsFetes.length,
        demandesAttribuees: rotationsFetes.filter(r => r.statutRotation.includes('CONFIRME')).length,
        regles: reglesEquite,
        rotations: rotationsFetes
    });
});

router.post('/demande-rotation', (req, res) => {
    const { employeNom, agence, destinationVillage, feteSollicitee, vagueSouhaitee } = req.body;
    const nouvelle = {
        id: `rot-${Date.now().toString().slice(-4)}`,
        employeNom: employeNom || 'Conseiller Clientèle',
        matricule: 'EMP-NOUVEAU',
        agence: agence || 'Agence Orange Plateau',
        destinationVillage: destinationVillage || 'Korhogo (Poro)',
        feteSollicitee: feteSollicitee || 'Noël 2026',
        sessionAttribution: vagueSouhaitee || 'VAGUE_1 (Du 21 au 28 Déc)',
        statutRotation: 'ATTRIBUE_CONFIRME',
        historiquePrecedent: 'Candidature arbitrée favorablement par la commission paritaire RH',
        primeTransportFcfa: 50000,
        permanenceRemplaceePar: 'Binôme désigné au planning d\'agence'
    };
    rotationsFetes.unshift(nouvelle);
    res.json({ succes: true, rotation: nouvelle });
});

module.exports = router;
