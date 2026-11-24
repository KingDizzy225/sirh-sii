const express = require('express');
const router = express.Router();

let agencesCapacite = [
  {
    id: 1,
    nomAgence: 'Agence Yopougon Bel Air Express',
    commune: 'Yopougon',
    effectifEtpReel: 12,
    visiteursMoyensJour: 640,
    transactionsMoyennesJour: 510,
    tempsAttenteMoyenMinutes: 14.2,
    tauxSaturationCharge: 122, // 122% = Surchargé (Zone Rouge)
    statutTension: 'SURCHARGE_CRITIQUE',
    recommandationDimensionnement: '+2 conseillers de caisse d\'urgence en renfort pour ramener l\'attente sous 8 min.'
  },
  {
    id: 2,
    nomAgence: 'Agence Plateau Pyramide',
    commune: 'Plateau',
    effectifEtpReel: 8,
    visiteursMoyensJour: 380,
    transactionsMoyennesJour: 320,
    tempsAttenteMoyenMinutes: 6.8,
    tauxSaturationCharge: 94, // 94% = Équilibré optimal
    statutTension: 'CHARGE_OPTIMALE',
    recommandationDimensionnement: 'Capacité idéale. Aucun renfort requis.'
  },
  {
    id: 3,
    nomAgence: 'Agence Treichville Arras',
    commune: 'Treichville',
    effectifEtpReel: 8,
    visiteursMoyensJour: 430,
    transactionsMoyennesJour: 370,
    tempsAttenteMoyenMinutes: 11.5,
    tauxSaturationCharge: 108, // 108% = Tension modérée
    statutTension: 'TENSION_MODEREE',
    recommandationDimensionnement: 'Optimisation de la ligne de file d\'attente ou aménagement d\'un guichet express.'
  },
  {
    id: 4,
    nomAgence: 'Boutique Aéroport Félix H.B.',
    commune: 'Port-Bouët',
    effectifEtpReel: 4,
    visiteursMoyensJour: 120,
    transactionsMoyennesJour: 95,
    tempsAttenteMoyenMinutes: 3.5,
    tauxSaturationCharge: 68, // 68% = Sous-charge relative
    statutTension: 'SOUS_CAPACITE',
    recommandationDimensionnement: 'Capacité excédentaire. Possibilité de détacher un profil 1 jour/semaine sur Koumassi.'
  }
];

router.get('/diagnostic', (req, res) => {
  res.json({
    success: true,
    agences: agencesCapacite,
    statistiquesGlobales: {
      totalEtpDeployes: agencesCapacite.reduce((acc, a) => acc + a.effectifEtpReel, 0),
      visiteursJourCumules: agencesCapacite.reduce((acc, a) => acc + a.visiteursMoyensJour, 0),
      tauxSaturationMoyenReseau: '98.5%',
      agencesEnSurcharge: agencesCapacite.filter(a => a.statutTension === 'SURCHARGE_CRITIQUE').length
    }
  });
});

router.post('/simuler', (req, res) => {
  const { agenceId, hausseTraficPourcent, etpAdditionnels } = req.body;
  const agence = agencesCapacite.find(a => a.id === parseInt(agenceId));
  if (!agence) {
    return res.status(404).json({ success: false, error: 'Agence non trouvée' });
  }

  const hausse = parseFloat(hausseTraficPourcent) || 25; // +25%
  const renfort = parseInt(etpAdditionnels) || 0;

  const visiteursSimules = Math.round(agence.visiteursMoyensJour * (1 + hausse / 100));
  const etpTotal = agence.effectifEtpReel + renfort;
  const nouveauTauxSaturation = Math.round((visiteursSimules / (etpTotal * 45)) * 100);
  const tempsAttenteSimuleMinutes = Math.max(3, Math.round((nouveauTauxSaturation / 100) * 11));

  res.json({
    success: true,
    simulation: {
      agenceNom: agence.nomAgence,
      visiteursActuels: agence.visiteursMoyensJour,
      visiteursSimules,
      etpActuels: agence.effectifEtpReel,
      etpApresRenfort: etpTotal,
      tauxSaturationSimule: nouveauTauxSaturation,
      tempsAttenteEstimeMinutes: tempsAttenteSimuleMinutes,
      diagnosticSimulation: nouveauTauxSaturation > 115 
        ? 'Alerte Surcharge : Le renfort est insuffisant pour absorber ce pic d\'activité.'
        : 'Équilibré : Le flux simulé est absorbé dans des conditions optimales.'
    }
  });
});

module.exports = router;
