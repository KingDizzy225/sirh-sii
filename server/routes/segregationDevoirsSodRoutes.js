const express = require('express');
const router = express.Router();

let reglesIncompatibiliteSod = [
  {
    codeRegle: 'SOD-R01',
    titre: 'Création Collaborateur vs Émission Virement Bancaire Paie',
    risqueFraude: 'CRITIQUE',
    description: 'Une même personne ne peut pas créer une fiche employé et approuver l\'ordre de virement de salaire (risque de salarié fictif/fantôme).',
    roleA: 'Gestionnaire Administration RH',
    roleB: 'Approbateur Fichier de Virement DAF',
    statutViolation: 'ZERO_CONFLIT'
  },
  {
    codeRegle: 'SOD-R02',
    titre: 'Encaissement Guichet Vente vs Annulation Transaction Orange Money',
    risqueFraude: 'ELEVE',
    description: 'Le conseiller qui encaisse les fonds ne peut pas autoriser seul les annulations ou remboursements de recharges.',
    roleA: 'Caissier / Conseiller Commercial',
    roleB: 'Superviseur Annulation & Recrédit OM',
    statutViolation: 'ALERTE_IDENTIFIEE' // 1 utilisateur en anomalie
  },
  {
    codeRegle: 'SOD-R03',
    titre: 'Passation Commande SIM/Fibre vs Réception Physique Entrepôt',
    risqueFraude: 'ELEVE',
    description: 'L\'acheteur télécom ne peut pas valider seul l\'entrée en stock des cartons de cartes SIM et box.',
    roleA: 'Acheteur Approvisionnement Réseau',
    roleB: 'Magasinier Réceptionnaire Vridi',
    statutViolation: 'ZERO_CONFLIT'
  },
  {
    codeRegle: 'SOD-R04',
    titre: 'Saisie Heures Supplémentaires vs Auto-Validation Pointage',
    risqueFraude: 'MOYEN',
    description: 'Un manager ne peut pas valider ses propres heures supplémentaires ou repos compensateurs.',
    roleA: 'Bénéficiaire Heures Sup',
    roleB: 'Valideur Hiérarchique',
    statutViolation: 'ZERO_CONFLIT'
  }
];

let utilisateursEnConflit = [
  {
    id: 1,
    matricule: 'EMP-0782',
    nom: 'Koffi Blaise',
    agence: 'Agence Yopougon Keneya',
    rolePrincipal: 'Conseiller Commercial Vente',
    roleIncompatibleCumule: 'Habilitation Superviseur Annulation OM (Délégation temporaire non révoquée)',
    regleViolee: 'SOD-R02',
    dateDetection: '2026-11-14',
    statutAction: 'A_CORRIGER_URGENT',
    recommandation: 'Révoquer immédiatement le profil d\'approbation temporaire accordé pendant le congé du chef d\'agence.'
  }
];

let campagneRecertification = {
  campagneId: 'RECERT-2026-Q4',
  periode: '4ème Trimestre 2026',
  echeance: '2026-12-15',
  totalComptesActifs: 194,
  comptesRecertifies: 168,
  tauxProgression: '86.6%',
  managersParticipants: 14,
  statut: 'EN_COURS'
};

router.get('/matrice', (req, res) => {
  res.json({
    success: true,
    regles: reglesIncompatibiliteSod,
    conflitsActifs: utilisateursEnConflit,
    campagne: campagneRecertification,
    statistiques: {
      scoreSanteSod: '98.5%',
      totalReglesControlees: reglesIncompatibiliteSod.length,
      violationsCritiques: 0,
      violationsMajeures: utilisateursEnConflit.length
    }
  });
});

router.post('/recertifier', (req, res) => {
  const { conflitId, actionCorrective } = req.body;
  const conflit = utilisateursEnConflit.find(u => u.id === parseInt(conflitId));
  if (!conflit) {
    return res.status(404).json({ success: false, error: 'Conflit non trouvé' });
  }

  conflit.statutAction = 'RESOLU_DROITS_REVOQUES';
  conflit.actionCorrective = actionCorrective || 'Droits incompatibles révoqués avec succès.';

  // Mise à jour de la règle
  const regle = reglesIncompatibiliteSod.find(r => r.codeRegle === conflit.regleViolee);
  if (regle) regle.statutViolation = 'ZERO_CONFLIT';

  res.json({
    success: true,
    conflit,
    message: `Conflit résolu : habilitation superflue révoquée pour ${conflit.nom}.`
  });
});

module.exports = router;
