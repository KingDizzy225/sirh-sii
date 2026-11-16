const express = require('express');
const router = express.Router();

let programmeStaffFibre = [
    {
        id: 'amb-1',
        employeNom: 'Koné Alimata',
        quartier: 'Koumassi Remblais',
        debitSouscrit: 'Fibre Sérénité 300 Mbps',
        tarifPublicFcfa: 25000,
        tarifStaffSiiFcfa: 12500, // 50% de réduction
        voisinsParraines: 6,
        bonusCumuleGagneFcfa: 60000, // 10 000 FCFA par voisin raccordé
        statutLigne: 'ACTIVE_TRES_HAUT_DEBIT'
    },
    {
        id: 'amb-2',
        employeNom: 'Traoré Bakari',
        quartier: 'Yopougon Académie',
        debitSouscrit: 'Fibre Passion 500 Mbps',
        tarifPublicFcfa: 35000,
        tarifStaffSiiFcfa: 17500,
        voisinsParraines: 4,
        bonusCumuleGagneFcfa: 40000,
        statutLigne: 'ACTIVE_TRES_HAUT_DEBIT'
    }
];

router.get('/statuts', (req, res) => {
    res.json({
        succes: true,
        remiseStaffPourcentage: 50,
        bonusParParrainageFcfa: 10000,
        ambassadeurs: programmeStaffFibre
    });
});

router.post('/parrainer-voisin', (req, res) => {
    const { employeNom, nomVoisin, telephoneVoisin, localisationVoisin } = req.body || {};
    const amb = programmeStaffFibre[0];
    amb.voisinsParraines += 1;
    amb.bonusCumuleGagneFcfa += 10000;
    res.json({
        succes: true,
        message: `Félicitations ! Voisin ${nomVoisin || 'Client'} enregistré pour éligibilité Fibre. Prime de 10 000 FCFA créditée sur votre compte SII.`
    });
});

module.exports = router;
