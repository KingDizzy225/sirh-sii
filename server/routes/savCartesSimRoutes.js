const express = require('express');
const router = express.Router();

let diagnosticSavSim = [
    {
        id: 'sav-sim-101',
        numeroIccid: '8922501099281920192',
        numeroTelephoneClient: '+225 07 79 12 34 56',
        clientNom: 'Bamba Soualiho',
        panneConstatee: 'PUCE_NON_RECONNUE_APRES_CHOC',
        testBancPuceEffectue: true,
        verdictTechnique: 'CARTE_DEFECTUEUSE_RETOUR_ORANGE_CI',
        agenceTraitement: 'Agence Orange Riviera Palmeraie',
        conseillerNom: 'Yao N\'Guessan',
        echangeGratuitEffectue: true,
        avoirOrangeObtenuFcfa: 1500,
        dateHeure: 'Aujourd\'hui 10:45'
    },
    {
        id: 'sav-sim-102',
        numeroIccid: '8922501044192084918',
        numeroTelephoneClient: '+225 05 54 88 90 11',
        clientNom: 'Adiko Jeanne',
        panneConstatee: 'ECHEC_LECTURE_RESEAU_4G_5G',
        testBancPuceEffectue: true,
        verdictTechnique: 'USURE_NATURELLE_CONNECTEURS_OR',
        agenceTraitement: 'Agence Orange Plateau Postel 2001',
        conseillerNom: 'Diallo Oumar',
        echangeGratuitEffectue: true,
        avoirOrangeObtenuFcfa: 1500,
        dateHeure: 'Hier 15:20'
    }
];

router.get('/statistiques', (req, res) => {
    res.json({
        succes: true,
        tauxEchangeImmediat: '100% sans frais pour le client Orange',
        remboursementOperateur: '1 500 FCFA remboursés par carte défectueuse à SII par Orange CI',
        dossiers: diagnosticSavSim
    });
});

router.post('/diagnostiquer-echanger', (req, res) => {
    const { numeroIccid, numeroTelephoneClient, clientNom, panneConstatee, agenceTraitement, conseillerNom } = req.body || {};
    const nouveau = {
        id: `sav-sim-${Date.now()}`,
        numeroIccid: numeroIccid || '89225010' + Math.floor(1000000000 + Math.random() * 9000000000),
        numeroTelephoneClient: numeroTelephoneClient || '+225 07 00 00 00 00',
        clientNom: clientNom || 'Client Orange',
        panneConstatee: panneConstatee || 'PUCE_NON_DETECTEE',
        testBancPuceEffectue: true,
        verdictTechnique: 'DEFECTUEUSE_ECHANGE_VALIDE',
        agenceTraitement: agenceTraitement || 'Agence Orange Abidjan',
        conseillerNom: conseillerNom || 'Conseiller SII',
        echangeGratuitEffectue: true,
        avoirOrangeObtenuFcfa: 1500,
        dateHeure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    diagnosticSavSim.unshift(nouveau);
    res.json({
        succes: true,
        dossier: nouveau,
        message: 'Diagnostic SAV validé : Échange de SIM gratuit effectué pour le client. Avoir Orange CI enregistré au profit de l\'agence.'
    });
});

module.exports = router;
