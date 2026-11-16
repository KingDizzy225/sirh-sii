const express = require('express');
const router = express.Router();

let demandesProvince = [
    {
        id: 'urg-prov-01',
        employeNom: 'Kouassi Kouamé Patrice',
        matricule: 'EMP-3392',
        agenceAffectation: 'Agence Orange Treichville Arras',
        destinationVillage: 'Dimbokro (Région du N\'Zi)',
        compagnieTransport: 'UTB Express Gare Treichville',
        motifUrgence: 'Obsèques d\'un ascendant direct (Père)',
        avanceUrgenceFcfa: 50000,
        billetCarSubventionneFcfa: 15000,
        statutDossier: 'DEPART_VALIDE_ET_FONDS_VIRES',
        dateDemande: '13/10/2026 à 14:10',
        joursAbsenceAutorises: 4
    },
    {
        id: 'urg-prov-02',
        employeNom: 'Tuho Gnénéma',
        matricule: 'EMP-4109',
        agenceAffectation: 'Agence Orange Plateau Postel 2001',
        destinationVillage: 'Ferkessédougou (Tchologo)',
        compagnieTransport: 'CTE VIP Adjamé',
        motifUrgence: 'Accouchement compliqué conjointe au village',
        avanceUrgenceFcfa: 60000,
        billetCarSubventionneFcfa: 25000,
        statutDossier: 'DEPART_VALIDE_ET_FONDS_VIRES',
        dateDemande: '14/10/2026 à 08:30',
        joursAbsenceAutorises: 3
    }
];

router.get('/statuts', (req, res) => {
    res.json({
        succes: true,
        partenairesCars: ['UTB (Union des Transports de Bouaké)', 'CTE Transport', 'STIF VIP', 'AVS'],
        demandes: demandesProvince
    });
});

router.post('/demander-depart', (req, res) => {
    const { employeNom, destinationVillage, compagnieTransport, motifUrgence, avanceFcfa } = req.body || {};
    const nouveau = {
        id: `urg-prov-${Date.now()}`,
        employeNom: employeNom || 'Collaborateur SII',
        matricule: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        agenceAffectation: 'Agence Orange Abidjan',
        destinationVillage: destinationVillage || 'Village en province',
        compagnieTransport: compagnieTransport || 'UTB Express',
        motifUrgence: motifUrgence || 'Urgence familiale majeure',
        avanceUrgenceFcfa: parseInt(avanceFcfa, 10) || 50000,
        billetCarSubventionneFcfa: 18000,
        statutDossier: 'DEPART_VALIDE_ET_FONDS_VIRES',
        dateDemande: 'Aujourd\'hui à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        joursAbsenceAutorises: 4
    };
    demandesProvince.unshift(nouveau);
    res.json({
        succes: true,
        demande: nouveau,
        message: 'Pass Urgence Village validé ! Billet de car subventionné et avance virée instantanément sur votre Orange Money.'
    });
});

module.exports = router;
