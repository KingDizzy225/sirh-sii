const express = require('express');
const router = express.Router();

let decomptesHeuresSup = [
  {
    id: 1,
    matricule: 'EMP-0245',
    nom: 'Kouassi Yves',
    agence: 'Agence Plateau Pyramide',
    periode: '2026-10',
    heuresContractuellesMois: 173.33,
    heuresReellementTravaillees: 198.5,
    totalHeuresSupplementaires: 25.17,
    repartitionLegaleCi: {
      majoration15: 14.0, // 41e à 46e heure hebdomadaire (+15%)
      majoration50: 6.5,  // au-delà de 46h (+50%)
      majoration75Nuit: 3.0, // travail de nuit 21h-5h (+75%)
      majoration100DimancheFerie: 1.67 // dimanches de permanence (+75% à 100%)
    },
    contingentAnnuel: {
      cumulHeuresSupAnnee: 58.5,
      plafondLegalAnnuelCi: 75.0,
      soldeRestantAvantPlafond: 16.5,
      alerteDepassement: false
    },
    reposCompensateur: {
      heuresRcoAcquises: 4.5,
      heuresRcoPrises: 0,
      soldeRcoDisponible: 4.5
    },
    valorisationFinanciereBruteCfa: 98450,
    statutValidation: 'VALIDE_PAIE'
  },
  {
    id: 2,
    matricule: 'EMP-0412',
    nom: 'Adingra Patricia',
    agence: 'Agence Yopougon Bel Air',
    periode: '2026-10',
    heuresContractuellesMois: 173.33,
    heuresReellementTravaillees: 204.0,
    totalHeuresSupplementaires: 30.67,
    repartitionLegaleCi: {
      majoration15: 16.0,
      majoration50: 8.67,
      majoration75Nuit: 4.0,
      majoration100DimancheFerie: 2.0
    },
    contingentAnnuel: {
      cumulHeuresSupAnnee: 72.0,
      plafondLegalAnnuelCi: 75.0,
      soldeRestantAvantPlafond: 3.0,
      alerteDepassement: true // alerte seuil 75h presque atteint
    },
    reposCompensateur: {
      heuresRcoAcquises: 6.0,
      heuresRcoPrises: 2.0,
      soldeRcoDisponible: 4.0
    },
    valorisationFinanciereBruteCfa: 124300,
    statutValidation: 'EN_ATTENTE_VALIDATION_RH'
  },
  {
    id: 3,
    matricule: 'EMP-0189',
    nom: 'Diallo Oumar',
    agence: 'Flotte Logistique & Coursiers',
    periode: '2026-10',
    heuresContractuellesMois: 173.33,
    heuresReellementTravaillees: 185.0,
    totalHeuresSupplementaires: 11.67,
    repartitionLegaleCi: {
      majoration15: 8.0,
      majoration50: 3.67,
      majoration75Nuit: 0,
      majoration100DimancheFerie: 0
    },
    contingentAnnuel: {
      cumulHeuresSupAnnee: 34.0,
      plafondLegalAnnuelCi: 75.0,
      soldeRestantAvantPlafond: 41.0,
      alerteDepassement: false
    },
    reposCompensateur: {
      heuresRcoAcquises: 2.0,
      heuresRcoPrises: 0,
      soldeRcoDisponible: 2.0
    },
    valorisationFinanciereBruteCfa: 42800,
    statutValidation: 'VALIDE_PAIE'
  }
];

const textesLegauxCi = {
  decretReference: 'Décret N° 96-203 du 7 mars 1996 relatif à la durée du travail en Côte d\'Ivoire',
  articleContingent: 'Article 15 : Le contingent annuel d\'heures supplémentaires ne peut excéder 75 heures par travailleur sauf autorisation expresse de l\'Inspecteur du Travail.',
  tauxMajoration: [
    { tranche: '41e à 46e heure hebdomadaire', taux: '+15%' },
    { tranche: 'Au-delà de la 46e heure', taux: '+50%' },
    { tranche: 'Heures de nuit en semaine (21h à 5h)', taux: '+75%' },
    { tranche: 'Dimanches et jours fériés de jour', taux: '+75%' },
    { tranche: 'Dimanches et jours fériés de nuit', taux: '+100%' }
  ]
};

router.get('/decomptes', (req, res) => {
  res.json({
    success: true,
    decomptes: decomptesHeuresSup,
    textesLegaux: textesLegauxCi,
    statistiques: {
      totalHeuresSupMois: decomptesHeuresSup.reduce((acc, d) => acc + d.totalHeuresSupplementaires, 0),
      montantGlobalMajoreCfa: decomptesHeuresSup.reduce((acc, d) => acc + d.valorisationFinanciereBruteCfa, 0),
      alertesPlafond75h: decomptesHeuresSup.filter(d => d.contingentAnnuel.alerteDepassement).length,
      heuresRcoEnAttente: decomptesHeuresSup.reduce((acc, d) => acc + d.reposCompensateur.soldeRcoDisponible, 0)
    }
  });
});

router.post('/convertir-rco', (req, res) => {
  const { decomptId, heuresAConvertir } = req.body;
  const item = decomptesHeuresSup.find(d => d.id === parseInt(decomptId));
  if (!item) {
    return res.status(404).json({ success: false, error: 'Décompte introuvable' });
  }

  const heures = parseFloat(heuresAConvertir) || 2;
  item.reposCompensateur.heuresRcoAcquises += heures;
  item.reposCompensateur.soldeRcoDisponible += heures;
  item.valorisationFinanciereBruteCfa = Math.max(0, item.valorisationFinanciereBruteCfa - (heures * 4500));

  res.json({
    success: true,
    decompte: item,
    message: `${heures}h supplémentaires converties avec succès en Repos Compensateur Obligatoire (RCO).`
  });
});

module.exports = router;
