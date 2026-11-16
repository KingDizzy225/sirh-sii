const express = require('express');
const router = express.Router();

let avancesExpress = [
    {
        id: 'sos-1',
        employeNom: 'Brou Koffi Germain',
        matricule: 'EMP-4421',
        montantFcfa: 25000,
        motifUrgence: 'Ordonnance pédiatrique en clinique de garde',
        canalPaiement: 'Orange Money (+225 07 09 88 12 34)',
        statutVirement: 'VIRE_INSTANTANE',
        referenceTransaction: 'OM-CI-20261014-99812',
        dateDemande: '13/10/2026 à 21:14',
        remboursementPrevu: 'Retenue paie fin de mois (0% intérêt)'
    },
    {
        id: 'sos-2',
        employeNom: 'Coulibaly Salimata',
        matricule: 'EMP-3890',
        montantFcfa: 15000,
        motifUrgence: 'Panne mécanique moto en route pour l\'agence',
        canalPaiement: 'Wave (+225 05 55 22 11 00)',
        statutVirement: 'VIRE_INSTANTANE',
        referenceTransaction: 'WV-CI-20261014-44109',
        dateDemande: '14/10/2026 à 07:22',
        remboursementPrevu: 'Retenue paie fin de mois (0% intérêt)'
    }
];

router.get('/historique', (req, res) => {
    res.json({
        succes: true,
        plafondMaximumFcfa: 30000,
        delaiMoyenMinutes: 2,
        avances: avancesExpress
    });
});

router.post('/demander', (req, res) => {
    const { employeNom, montantFcfa, motifUrgence, canalPaiement, telephonePaiement } = req.body || {};
    const montant = Math.min(parseInt(montantFcfa, 10) || 15000, 30000);
    const nouvelleAvance = {
        id: `sos-${Date.now()}`,
        employeNom: employeNom || 'Collaborateur SII',
        matricule: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        montantFcfa: montant,
        motifUrgence: motifUrgence || 'Urgence familiale',
        canalPaiement: `${canalPaiement || 'Orange Money'} (${telephonePaiement || '+225 07 XX XX XX XX'})`,
        statutVirement: 'VIRE_INSTANTANE',
        referenceTransaction: `TX-SII-${Date.now().toString().slice(-8)}`,
        dateDemande: 'Aujourd\'hui à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        remboursementPrevu: 'Retenue paie fin de mois (0% intérêt)'
    };
    avancesExpress.unshift(nouvelleAvance);
    res.json({ succes: true, avance: nouvelleAvance, message: `Avance SOS de ${montant.toLocaleString('fr-FR')} FCFA virée avec succès !` });
});

module.exports = router;
