const express = require('express');
const router = express.Router();

let commerciauxFlotteMoto = [
    {
        id: 'moto-01',
        commercialNom: 'Seydou Touré',
        matricule: 'EMP-3891',
        modeleMoto: 'Yamaha Crux 110cc (Immat: 8891-JJ-01)',
        zoneTournee: 'Zone Abidjan Sud (Marcory, Treichville, Port-Bouët)',
        ecoScore: 96, // 0 - 100
        kilometrageMensuel: 1240,
        consommationMoyenne: '2.1 L / 100 km (Optimale)',
        infractionsVitesse: 0,
        portCasqueCertifie: '100% (Caméra / Contrôle superviseur)',
        primeZeroAccidentFcfa: 25000,
        statutPrime: 'ELIGIBLE_ACTIVEE',
        dernierControleTechnique: '02/11/2026'
    },
    {
        id: 'moto-02',
        commercialNom: 'Aristide Kouassi',
        matricule: 'EMP-4720',
        modeleMoto: 'Honda Ace 125cc (Immat: 4410-KL-01)',
        zoneTournee: 'Zone Abidjan Nord (Yopougon, Songon)',
        ecoScore: 91,
        kilometrageMensuel: 1580,
        consommationMoyenne: '2.4 L / 100 km',
        infractionsVitesse: 0,
        portCasqueCertifie: '100%',
        primeZeroAccidentFcfa: 25000,
        statutPrime: 'ELIGIBLE_ACTIVEE',
        dernierControleTechnique: '28/10/2026'
    },
    {
        id: 'moto-03',
        commercialNom: 'Ousmane Sangaré',
        matricule: 'EMP-5914',
        modeleMoto: 'Yamaha YBR 125cc (Immat: 1102-GH-01)',
        zoneTournee: 'Zone Intérieur - Yamoussoukro / Toumodi',
        ecoScore: 78,
        kilometrageMensuel: 2100,
        consommationMoyenne: '2.9 L / 100 km',
        infractionsVitesse: 2, // 2 alertes accélération brusque
        portCasqueCertifie: '100%',
        primeZeroAccidentFcfa: 0,
        statutPrime: 'EN_COURS_CORRECTION',
        dernierControleTechnique: '15/10/2026'
    }
];

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        flotteMotosTotal: 45,
        ecoScoreMoyenFlotte: 92,
        primesZeroAccidentAttribuees: commerciauxFlotteMoto.filter(c => c.statutPrime === 'ELIGIBLE_ACTIVEE').length,
        carburantEconomiseLitres: 480,
        joursConsecutifsSansAccident: 184,
        commerciaux: commerciauxFlotteMoto
    });
});

router.post('/ajuster-score', (req, res) => {
    const { commercialId, ecoScore, bonusAttribue } = req.body;
    const comm = commerciauxFlotteMoto.find(c => c.id === commercialId);
    if (comm) {
        if (ecoScore) comm.ecoScore = Number(ecoScore);
        if (bonusAttribue !== undefined) {
            comm.statutPrime = bonusAttribue ? 'ELIGIBLE_ACTIVEE' : 'EN_COURS_CORRECTION';
            comm.primeZeroAccidentFcfa = bonusAttribue ? 25000 : 0;
        }
    }
    res.json({ succes: true, commercial: comm });
});

module.exports = router;
