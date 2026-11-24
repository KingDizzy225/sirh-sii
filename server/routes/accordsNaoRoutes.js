const express = require('express');
const router = express.Router();

let sessionsNao = [
  {
    id: 1,
    annee: 2026,
    titre: 'Négociations Annuelles Obligatoires 2026 (NAO)',
    statut: 'CLOTUREE_SIGNEE', // EN_COURS, CLOTUREE_SIGNEE, EN_NEGOCIATION
    dateDebut: '2026-01-15',
    dateSignature: '2026-03-28',
    organisationsSyndicales: ['SYNAPOSTEL CI', 'Délégués du Personnel SII'],
    representantDirection: 'Mme Bamba (Directrice des Ressources Humaines)',
    themesNegocies: [
      'Revalorisation salariale des grilles CCNI Catégories 1 à 5 (+6.5%)',
      'Indemnité forfaitaire de transport lagunaires et bus SOTRA',
      'Aménagement des horaires de garde et d\'astreinte réseau'
    ],
    referenceDepotGreffe: 'DEPOT-DGT-CI-2026-0428-ABJ',
    dateDepotLegal: '2026-04-05'
  },
  {
    id: 2,
    annee: 2027,
    titre: 'Préparation du Protocole d\'Accord NAO 2027',
    statut: 'EN_NEGOCIATION',
    dateDebut: '2026-11-02',
    dateSignature: null,
    organisationsSyndicales: ['SYNAPOSTEL CI', 'Collectif des Délégués Régionaux'],
    representantDirection: 'Direction des Ressources Humaines & DAF',
    themesNegocies: [
      'Généralisation de la mutuelle santé aux ayants droit enfants majeurs étudiants',
      'Prime d\'ancienneté déplafonnée au-delà de 15 ans'
    ],
    referenceDepotGreffe: 'En cours de rédaction préliminaire',
    dateDepotLegal: null
  }
];

let registreEngagements = [
  {
    id: 'ENG-2026-01',
    accordTitre: 'Accord Salaires & Pouvoir d\'Achat 2026',
    clause: 'Augmentation générale de +6.5% sur le salaire de base des employés Cat. 1 à 5',
    echeance: '2026-05-01',
    tauxRealisation: 100,
    statut: 'EFFECTUE',
    responsableAction: 'Pôle Paie & C&B',
    preuvVerification: 'Grilles de paie de mai 2026 auditées et conformes'
  },
  {
    id: 'ENG-2026-02',
    accordTitre: 'Accord Mobilité & Transports Salariés',
    clause: 'Prise en charge à 70% des pass navette bateaux-bus STL/SOTRA pour les agents du littoral',
    echeance: '2026-09-01',
    tauxRealisation: 100,
    statut: 'EFFECTUE',
    responsableAction: 'Services Généraux & RH',
    preuvVerification: 'Convention cadre signée avec SOTRA et 45 bénéficiaires actifs'
  },
  {
    id: 'ENG-2026-03',
    accordTitre: 'Accord Égalité Professionnelle & Parentalité',
    clause: 'Création du forfait Berceau SII (150 000 FCFA à la naissance) et aménagement congé maternité',
    echeance: '2026-12-31',
    tauxRealisation: 85,
    statut: 'EN_COURS',
    responsableAction: 'Comité Égalité & RSE',
    preuvVerification: '18 primes de naissance versées à ce jour'
  },
  {
    id: 'ENG-2026-04',
    accordTitre: 'Accord Sécurité & Ergonomie Guichet',
    clause: 'Remplacement des sièges d\'agence par du mobilier ergonomique certifié CSST',
    echeance: '2027-01-31',
    tauxRealisation: 40,
    statut: 'EN_COURS',
    responsableAction: 'Responsable QHSE & Achats',
    preuvVerification: 'Lot 1 livré sur Plateau et Treichville (Lot 2 Yopougon en commande)'
  }
];

router.get('/accords', (req, res) => {
  res.json({
    success: true,
    sessions: sessionsNao,
    engagements: registreEngagements,
    statistiques: {
      totalAccordsSignes: sessionsNao.filter(s => s.statut === 'CLOTUREE_SIGNEE').length,
      tauxGlobalExecutionEngagements: '88.5%',
      engagementsEnCours: registreEngagements.filter(e => e.statut === 'EN_COURS').length,
      prochaineReunionSyndicale: '2026-11-25 (Ordre du jour : Synthèse NAO 2027)'
    }
  });
});

router.post('/engagements/statut', (req, res) => {
  const { engagementId, nouveauTaux, statut } = req.body;
  const eng = registreEngagements.find(e => e.id === engagementId);
  if (!eng) {
    return res.status(404).json({ success: false, error: 'Engagement non trouvé' });
  }

  if (nouveauTaux !== undefined) eng.tauxRealisation = parseInt(nouveauTaux);
  if (statut) eng.statut = statut;

  res.json({
    success: true,
    engagement: eng,
    message: `Engagement ${eng.id} mis à jour avec succès (${eng.tauxRealisation}%).`
  });
});

module.exports = router;
