const express = require('express');
const router = express.Router();

let boursesEtPrix = [
    {
        id: 'brs-01',
        parentNom: 'Koné Amadou',
        matricule: 'EMP-3901',
        enfantNom: 'Mariam Koné',
        age: 18,
        examenPasse: 'BACCALAURÉAT SÉRIE C (Session 2026)',
        mentionObtenue: 'TRÈS BIEN (16.4/20)',
        ecoleProvenance: 'Lycée Scientifique de Yamoussoukro',
        primeExcellenceFcfa: 150000,
        kitFournituresOffert: 'PC Portable Dell Pro SII + Sac à dos + Clé 4G Orange 50 Go',
        statutDossier: 'PRIME_VERSE_OM',
        dateRemise: '15/09/2026'
    },
    {
        id: 'brs-02',
        parentNom: 'Clarisse Bamba',
        matricule: 'EMP-4882',
        enfantNom: 'Stéphane Bamba',
        age: 15,
        examenPasse: 'BEPC (Session 2026)',
        mentionObtenue: 'BIEN (240 points)',
        ecoleProvenance: 'Collège Moderne de Cocody',
        primeExcellenceFcfa: 75000,
        kitFournituresOffert: 'Kit Complet Manuels Scolaires Classe de 2nde C + Sac',
        statutDossier: 'PRIME_VERSE_OM',
        dateRemise: '18/09/2026'
    },
    {
        id: 'brs-03',
        parentNom: 'Salif Coulibaly',
        matricule: 'EMP-6102',
        enfantNom: 'Fatimata Coulibaly',
        age: 11,
        examenPasse: 'CEPE & Entrée en 6ème (Session 2026)',
        mentionObtenue: 'ADMIS AVEC 148 POINTS',
        ecoleProvenance: 'EPP Plateau Dokui 2',
        primeExcellenceFcfa: 50000,
        kitFournituresOffert: 'Kit Scolaire Complet Cartable d\'Or SII + Cahiers & Géométrie',
        statutDossier: 'PRIME_VERSE_OM',
        dateRemise: '20/09/2026'
    }
];

let statistiquesCampagne = {
    budgetTotalAlloueFcfa: 12000000,
    totalEnfantsRecompenses: 78,
    tauxReussiteEnfantsSalaries: '96.2%',
    kitsDistribues: 215,
    prochaineCeremonieArbreNoel: '19 Décembre 2026 au Siège SII'
};

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        statistiques: statistiquesCampagne,
        laureats: boursesEtPrix
    });
});

router.post('/declarer-laureat', (req, res) => {
    const { parentNom, matricule, enfantNom, examenPasse, mention, primeFcfa } = req.body;
    const nouveau = {
        id: `brs-${Date.now().toString().slice(-4)}`,
        parentNom: parentNom || 'Collaborateur SII',
        matricule: matricule || 'EMP-7788',
        enfantNom: enfantNom || 'Enfant Collaborateur',
        age: 14,
        examenPasse: examenPasse || 'Examen Officiel 2026',
        mentionObtenue: mention || 'ADMIS AVEC DISTINCTION',
        ecoleProvenance: 'Établissement Scolaire de Côte d\'Ivoire',
        primeExcellenceFcfa: Number(primeFcfa) || 60000,
        kitFournituresOffert: 'Kit d\'Honneur SII Excellence',
        statutDossier: 'EN_COURS_VALIDATION_RH',
        dateRemise: new Date().toLocaleDateString('fr-FR')
    };
    boursesEtPrix.unshift(nouveau);
    res.json({ succes: true, laureat: nouveau });
});

module.exports = router;
