const express = require('express');
const router = express.Router();

let declarationsConflits = [
  {
    id: 'CONF-2026-001',
    matricule: 'EMP-0245',
    declarantNom: 'Kouassi Yves',
    departement: 'Ventes Réseau B2C & Distribution',
    typeDeclaration: 'LIEN_PARENTE_PARTENAIRE', // LIEN_PARENTE_PARTENAIRE, CADEAU_FOURNISSEUR, ACTIVITE_EXTERIEURE
    natureDeclaration: 'Un frère germain est gérant d\'un point de vente demi-grossiste Orange Money à Yopougon',
    tiersConcerne: 'ETS Kouassi & Frères (Distributeur agréé)',
    valeurEstimeeCfa: 0,
    dateDeclaration: '2026-10-12',
    statutCompliance: 'AUTORISE_AVEC_MESURES', // EN_ATTENTE_ARBITRAGE, AUTORISE_SANS_RESERVE, AUTORISE_AVEC_MESURES, REFUSE_INCOMPATIBLE
    mesuresPrevention: 'Déport strict : l\'agent n\'a aucun pouvoir de décision sur les dotations de stocks ou litiges de ce distributeur.',
    complianceOfficer: 'M. Touré (Directeur Juridique & Conformité)'
  },
  {
    id: 'CONF-2026-002',
    matricule: 'EMP-0189',
    declarantNom: 'Diallo Oumar',
    departement: 'Logistique & Gestion Flotte',
    typeDeclaration: 'CADEAU_FOURNISSEUR',
    natureDeclaration: 'Invitation VIP dîner de gala + coffret cadeau électronique reçu d\'un concessionnaire moto',
    tiersConcerne: 'Société Ivoirienne de Deux-Roues (SIDR)',
    valeurEstimeeCfa: 85000, // Dépasse le seuil des 50 000 FCFA
    dateDeclaration: '2026-11-04',
    statutCompliance: 'EN_ATTENTE_ARBITRAGE',
    mesuresPrevention: 'En cours d\'évaluation : possible versement du coffret au lot de la fête annuelle du personnel.',
    complianceOfficer: 'M. Touré (Directeur Juridique & Conformité)'
  },
  {
    id: 'CONF-2026-003',
    matricule: 'EMP-0412',
    declarantNom: 'Adingra Patricia',
    departement: 'Finance & Trésorerie',
    typeDeclaration: 'ACTIVITE_EXTERIEURE',
    natureDeclaration: 'Prestation de cours du soir en comptabilité générale à l\'Institut National Polytechnique (INP-HB)',
    tiersConcerne: 'INP-HB Yamoussoukro',
    valeurEstimeeCfa: 150000,
    dateDeclaration: '2026-09-20',
    statutCompliance: 'AUTORISE_SANS_RESERVE',
    mesuresPrevention: 'Activité académique le samedi, aucun impact sur les heures de travail contractuelles.',
    complianceOfficer: 'M. Touré (Directeur Juridique & Conformité)'
  }
];

const seuilsCompliance = {
  seuilCadeauToleranceCfa: 50000,
  charteReference: 'Code d\'Éthique et Déontologie des Affaires SII CI (Normes UEMOA & Sapin II)',
  obligations: [
    'Toute invitation ou cadeau > 50 000 FCFA doit être déclaré sous 5 jours ouvrés.',
    'Tout lien familial au 1er ou 2ème degré avec un fournisseur ou sous-distributeur exige un déport formel.',
    'Les fonctions de caisse et de passation de commandes font l\'objet d\'un audit d\'intégrité annuel.'
  ]
};

router.get('/declarations', (req, res) => {
  res.json({
    success: true,
    declarations: declarationsConflits,
    reglementation: seuilsCompliance,
    statistiques: {
      totalDeclarations: declarationsConflits.length,
      enAttenteArbitrage: declarationsConflits.filter(d => d.statutCompliance === 'EN_ATTENTE_ARBITRAGE').length,
      autorisesAvecDeport: declarationsConflits.filter(d => d.statutCompliance === 'AUTORISE_AVEC_MESURES').length,
      scoreConformiteEntreprise: '98.2%'
    }
  });
});

router.post('/declarer', (req, res) => {
  const { matricule, declarantNom, departement, typeDeclaration, natureDeclaration, tiersConcerne, valeurEstimeeCfa } = req.body;
  if (!matricule || !natureDeclaration || !typeDeclaration) {
    return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' });
  }

  const nouvelleDeclaration = {
    id: `CONF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    matricule,
    declarantNom: declarantNom || 'Agent Déclarant',
    departement: departement || 'Opérations Générales',
    typeDeclaration,
    natureDeclaration,
    tiersConcerne: tiersConcerne || 'Non précisé',
    valeurEstimeeCfa: parseInt(valeurEstimeeCfa) || 0,
    dateDeclaration: new Date().toISOString().slice(0, 10),
    statutCompliance: 'EN_ATTENTE_ARBITRAGE',
    mesuresPrevention: 'En cours d\'analyse par la Cellule de Conformité Éthique',
    complianceOfficer: 'Cellule Juridique & Déontologie'
  };

  declarationsConflits.unshift(nouvelleDeclaration);
  res.status(201).json({
    success: true,
    declaration: nouvelleDeclaration,
    message: 'Déclaration de transparence transmise avec succès au Compliance Officer.'
  });
});

router.post('/arbitrer', (req, res) => {
  const { declarationId, statutCompliance, mesuresPrevention } = req.body;
  const dec = declarationsConflits.find(d => d.id === declarationId);
  if (!dec) {
    return res.status(404).json({ success: false, error: 'Déclaration non trouvée' });
  }

  dec.statutCompliance = statutCompliance || 'AUTORISE_AVEC_MESURES';
  if (mesuresPrevention) dec.mesuresPrevention = mesuresPrevention;
  dec.complianceOfficer = 'M. Touré (Directeur Juridique & Conformité)';

  res.json({
    success: true,
    declaration: dec,
    message: `Arbitrage enregistré : statut mis à jour en ${dec.statutCompliance}.`
  });
});

module.exports = router;
