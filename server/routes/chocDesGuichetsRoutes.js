const express = require('express');
const router = express.Router();

let duelsEnCours = [
  {
    id: 1,
    titre: 'Le Choc de la Lagune : Plateau Central vs Treichville Arras',
    statut: 'en_cours', // en_cours, termine, programme
    dateDebut: '2026-11-10T08:00:00Z',
    dateFin: '2026-11-10T18:00:00Z',
    equipeA: {
      nom: 'Agence Plateau Pyramide',
      leader: 'Kouassi Marc',
      effectif: 8,
      pointsTotal: 1420,
      ventesSim: 312,
      reabonnementsFibre: 44,
      depotsOMWave: 215,
      progressionVsObjectif: 114
    },
    equipeB: {
      nom: 'Agence Treichville Arras',
      leader: 'Bamba Awa',
      effectif: 8,
      pointsTotal: 1380,
      ventesSim: 298,
      reabonnementsFibre: 49,
      depotsOMWave: 198,
      progressionVsObjectif: 109
    },
    defiFlash: 'Double points sur les forfaits 4G/5G illimités jusqu\'à 16h !',
    primeEnJeu: '250 000 FCFA partagée + Trophée Guichet d\'Or'
  },
  {
    id: 2,
    titre: 'Duel du Nord : Yopougon Bel Air vs Abobo Gare',
    statut: 'en_cours',
    dateDebut: '2026-11-10T08:00:00Z',
    dateFin: '2026-11-10T18:00:00Z',
    equipeA: {
      nom: 'Yopougon Bel Air Express',
      leader: 'Traore Ibrahim',
      effectif: 12,
      pointsTotal: 2180,
      ventesSim: 480,
      reabonnementsFibre: 62,
      depotsOMWave: 340,
      progressionVsObjectif: 128
    },
    equipeB: {
      nom: 'Abobo Gare Grand Marché',
      leader: 'Koné Fatou',
      effectif: 11,
      pointsTotal: 2210,
      ventesSim: 510,
      reabonnementsFibre: 58,
      depotsOMWave: 365,
      progressionVsObjectif: 132
    },
    defiFlash: 'Sprint Sim 4G : 50 points bonus par pack SIM activé et identifié avec pièce CNI valide',
    primeEnJeu: '300 000 FCFA cagnotte équipe + Déjeuner VIP direction'
  }
];

let classementGeneral = [
  { rang: 1, agence: 'Abobo Gare Grand Marché', victoires: 14, defaites: 2, pointsCumules: 28450, ratioVictoire: '87.5%' },
  { rang: 2, agence: 'Yopougon Bel Air Express', victoires: 13, defaites: 3, pointsCumules: 27120, ratioVictoire: '81.2%' },
  { rang: 3, agence: 'Agence Plateau Pyramide', victoires: 11, defaites: 5, pointsCumules: 24800, ratioVictoire: '68.7%' },
  { rang: 4, agence: 'Agence Treichville Arras', victoires: 10, defaites: 6, pointsCumules: 23650, ratioVictoire: '62.5%' },
  { rang: 5, agence: 'Koumassi Remblais Agence', victoires: 9, defaites: 7, pointsCumules: 21900, ratioVictoire: '56.2%' },
  { rang: 6, agence: 'Cocody Deux-Plateaux Vallon', victoires: 8, defaites: 8, pointsCumules: 19800, ratioVictoire: '50.0%' }
];

router.get('/duels', (req, res) => {
  res.json({
    success: true,
    duels: duelsEnCours,
    classement: classementGeneral,
    timestamp: new Date().toISOString()
  });
});

router.post('/score', (req, res) => {
  const { duelId, equipe, typeOperation, valeur } = req.body;
  const duel = duelsEnCours.find(d => d.id === parseInt(duelId));
  if (!duel) {
    return res.status(404).json({ success: false, error: 'Duel non trouvé' });
  }

  const cible = equipe === 'A' ? duel.equipeA : duel.equipeB;
  const pointsParAction = {
    ventesSim: 5,
    reabonnementsFibre: 15,
    depotsOMWave: 2
  };

  const delta = (pointsParAction[typeOperation] || 5) * (valeur || 1);
  cible.pointsTotal += delta;
  if (cible[typeOperation] !== undefined) {
    cible[typeOperation] += (valeur || 1);
  }

  res.json({
    success: true,
    duel,
    message: `+${delta} points ajoutés à ${cible.nom} !`
  });
});

module.exports = router;
