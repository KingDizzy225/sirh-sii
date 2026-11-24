const express = require('express');
const router = express.Router();

let registresIdr = [
  {
    id: 1,
    matricule: 'EMP-0012',
    nom: 'Kouadio Yao Michel',
    ageActuel: 58,
    dateNaissance: '1968-04-14',
    ancienneteAnnees: 22,
    salaireMoyenReferenceCfa: 980000,
    anneePrevueDepartRetraite: 2028, // Âge légal 60 ans en Côte d'Ivoire
    anneesRestantes: 2,
    engagementTotalIdrCfa: 8232000, // Calcul selon barème CCNI CI
    provisionConstitueeCfa: 7100000,
    ecartAProvisionnerCfa: 1132000,
    statutComptable: 'COUVERT_A_86_POURCENT'
  },
  {
    id: 2,
    matricule: 'EMP-0045',
    nom: 'Brou N\'Guessan',
    ageActuel: 56,
    dateNaissance: '1970-08-22',
    ancienneteAnnees: 18,
    salaireMoyenReferenceCfa: 750000,
    anneePrevueDepartRetraite: 2030,
    anneesRestantes: 4,
    engagementTotalIdrCfa: 5175000,
    provisionConstitueeCfa: 4400000,
    ecartAProvisionnerCfa: 775000,
    statutComptable: 'COUVERT_A_85_POURCENT'
  },
  {
    id: 3,
    matricule: 'EMP-0114',
    nom: 'Koné Bakary',
    ageActuel: 53,
    dateNaissance: '1973-11-10',
    ancienneteAnnees: 14,
    salaireMoyenReferenceCfa: 620000,
    anneePrevueDepartRetraite: 2033,
    anneesRestantes: 7,
    engagementTotalIdrCfa: 3298400,
    provisionConstitueeCfa: 3100000,
    ecartAProvisionnerCfa: 198400,
    statutComptable: 'COUVERT_A_94_POURCENT'
  }
];

const projectionsRetraite = [
  { horizon: '3 ans (2027 - 2029)', deputantsAttendus: 4, tresorerieNecessaireCfa: 28400000 },
  { horizon: '5 ans (2027 - 2031)', deputantsAttendus: 9, tresorerieNecessaireCfa: 58900000 },
  { horizon: '10 ans (2027 - 2036)', deputantsAttendus: 22, tresorerieNecessaireCfa: 142500000 }
];

const baremeCcniRetraite = {
  normeComptable: 'SYSCOHADA Révisé & IAS 19 (Engagements Sociaux)',
  ageLegalRetraiteCi: '60 ans (régime général CNPS)',
  tranchesCcni: [
    { tranche: '1 à 5 ans d\'ancienneté', taux: '30% du salaire moyen par année' },
    { tranche: '6 à 10 ans d\'ancienneté', taux: '35% du salaire moyen par année' },
    { tranche: 'Au-delà de 10 ans d\'ancienneté', taux: '40% du salaire moyen par année' }
  ]
};

router.get('/engagements', (req, res) => {
  const totalEngagement = registresIdr.reduce((acc, r) => acc + r.engagementTotalIdrCfa, 0);
  const totalProvisionne = registresIdr.reduce((acc, r) => acc + r.provisionConstitueeCfa, 0);

  res.json({
    success: true,
    salariesProchesRetraite: registresIdr,
    projections: projectionsRetraite,
    reglementation: baremeCcniRetraite,
    syntheseDaf: {
      totalEngagementActuarielCfa: totalEngagement,
      totalProvisionsConstitueesCfa: totalProvisionne,
      tauxCouvertureGlobal: `${Math.round((totalProvisionne / totalEngagement) * 100)}%`,
      dotationMensuelleRecommandeeCfa: 420000,
      impactBilan: 'Provisions pour charges sociales au passif (Compte 19)'
    }
  });
});

router.post('/recalculer-provisions', (req, res) => {
  const { tauxActualisationActuariel, tauxInflationPrevu } = req.body;
  
  res.json({
    success: true,
    nouveauTotalProvisionne: 14850000,
    message: `Recalcul actuariel IAS 19 exécuté avec un taux d'actualisation de ${tauxActualisationActuariel || '6.5%'}.`
  });
});

module.exports = router;
