const express = require('express');
const router = express.Router();

let auditsCaissesJournalieres = [
    {
        id: 'aud-caisse-01',
        agence: 'Agence Orange Treichville Arras',
        caissierNom: 'Sylvie Konan',
        dateCloture: 'Aujourd\'hui, 18:30',
        encaissementDeclareFcfa: 4850000,
        activationsSimSysteme: 142,
        valeurTheoriqueVentesFcfa: 4850000,
        ecartConstatFcfa: 0,
        statutAudit: 'PARFAIT_EQUILIBRE',
        lotSimVerifie: 'LOT-SIM-ARTCI-2026-T3-094',
        observationAudit: 'Tous les justificatifs CNPS/CNI scannés sont conformes.'
    },
    {
        id: 'aud-caisse-02',
        agence: 'Agence Orange Cocody Angré 8ème Tranche',
        caissierNom: 'Gervais Yobouet',
        dateCloture: 'Aujourd\'hui, 18:45',
        encaissementDeclareFcfa: 3120000,
        activationsSimSysteme: 98,
        valeurTheoriqueVentesFcfa: 3145000,
        ecartConstatFcfa: -25000, // Manquant
        statutAudit: 'ECART_A_JUSTIFIER',
        lotSimVerifie: 'LOT-SIM-ARTCI-2026-A8-112',
        observationAudit: 'Différence de 25 000 FCFA constatée sur le tiroir Orange Money. Ticket d\'annulation client en cours de vérification.'
    },
    {
        id: 'aud-caisse-03',
        agence: 'Agence Orange Bouaké Commerce',
        caissierNom: 'Patricia Méité',
        dateCloture: 'Hier, 18:15',
        encaissementDeclareFcfa: 5200000,
        activationsSimSysteme: 165,
        valeurTheoriqueVentesFcfa: 5200000,
        ecartConstatFcfa: 0,
        statutAudit: 'PARFAIT_EQUILIBRE',
        lotSimVerifie: 'LOT-SIM-BKE-2026-044',
        observationAudit: 'Clôture validée par le superviseur régional.'
    }
];

let indicateursSecuriteCaisse = {
    tauxConformiteGlobal: '98.8%',
    totalFondsSecurisesJourFcfa: 13170000,
    nombreCaissesVerifiees: auditsCaissesJournalieres.length,
    incidentsFraudeMois: 0,
    regleVerrouillage: 'Délai maximal de remise en banque / Brinks : J+1 à 10h00'
};

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        indicateurs: indicateursSecuriteCaisse,
        audits: auditsCaissesJournalieres
    });
});

router.post('/valider-cloture', (req, res) => {
    const { agence, caissierNom, encaissementDeclareFcfa, activationsSimSysteme, ecartConstatFcfa } = req.body;
    const nouveau = {
        id: `aud-caisse-${Date.now().toString().slice(-4)}`,
        agence: agence || 'Agence Orange Plateau',
        caissierNom: caissierNom || 'Caissier Guichet',
        dateCloture: 'À l\'instant',
        encaissementDeclareFcfa: Number(encaissementDeclareFcfa) || 2500000,
        activationsSimSysteme: Number(activationsSimSysteme) || 75,
        valeurTheoriqueVentesFcfa: Number(encaissementDeclareFcfa) || 2500000,
        ecartConstatFcfa: Number(ecartConstatFcfa) || 0,
        statutAudit: Number(ecartConstatFcfa) === 0 ? 'PARFAIT_EQUILIBRE' : 'ECART_A_JUSTIFIER',
        lotSimVerifie: `LOT-SIM-CI-${Math.floor(100 + Math.random() * 900)}`,
        observationAudit: 'Déclaration enregistrée et transmise au contrôle de gestion.'
    };
    auditsCaissesJournalieres.unshift(nouveau);
    res.json({ succes: true, audit: nouveau });
});

module.exports = router;
