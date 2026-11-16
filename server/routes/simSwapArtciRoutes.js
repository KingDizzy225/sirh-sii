const express = require('express');
const router = express.Router();

let registreSimSwaps = [
    {
        id: 'swp-8921',
        numeroLigne: '+225 07 48 90 12 34',
        clientNom: 'Konan Yao Albert',
        cniNumero: 'CI0028919283 (Valide)',
        motif: 'PERTE_VOL', // 'PERTE_VOL' | 'USURE' | 'PASSAGE_ESIM'
        conseillerNom: 'Diallo Oumar',
        agenceNom: 'Agence Orange Treichville Arras',
        statutArtci: 'CONFORME_ENREGISTRE',
        otpEnvoye: '6291',
        dateHeure: 'Aujourd\'hui 10:15',
        risqueFraude: 'FAIBLE'
    },
    {
        id: 'swp-8922',
        numeroLigne: '+225 05 77 12 99 00',
        clientNom: 'N\'Guessan Mireille',
        cniNumero: 'CI0031829011 (Valide)',
        motif: 'PASSAGE_ESIM',
        conseillerNom: 'Touré Alassane',
        agenceNom: 'Agence Orange Plateau Postel 2001',
        statutArtci: 'CONFORME_ENREGISTRE',
        otpEnvoye: '8834',
        dateHeure: 'Aujourd\'hui 11:40',
        risqueFraude: 'FAIBLE'
    }
];

router.get('/registre', (req, res) => {
    res.json({ succes: true, swaps: registreSimSwaps });
});

router.post('/valider-swap', (req, res) => {
    const { numeroLigne, clientNom, cniNumero, motif, conseillerNom, agenceNom } = req.body || {};
    const nouveau = {
        id: `swp-${Math.floor(1000 + Math.random() * 9000)}`,
        numeroLigne: numeroLigne || '+225 07 00 00 00 00',
        clientNom: clientNom || 'Client Orange CI',
        cniNumero: cniNumero || 'CI0048192001 (Vérifiée)',
        motif: motif || 'PERTE_VOL',
        conseillerNom: conseillerNom || 'Conseiller SII',
        agenceNom: agenceNom || 'Agence Orange Abidjan',
        statutArtci: 'CONFORME_ENREGISTRE',
        otpEnvoye: `${Math.floor(1000 + Math.random() * 9000)}`,
        dateHeure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        risqueFraude: 'FAIBLE'
    };
    registreSimSwaps.unshift(nouveau);
    res.json({ succes: true, swap: nouveau, message: 'Swap SIM enregistré avec traçabilité juridique et conformité ARTCI certifiée.' });
});

module.exports = router;
