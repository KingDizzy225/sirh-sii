const express = require('express');
const router = express.Router();

let plansCommissions = [
  {
    codePlan: 'PLAN-COMMERCIAL-B2C-2026',
    nom: 'Plan National Force de Vente Agences & Boutiques',
    statut: 'ACTIF',
    devise: 'FCFA',
    reglesProduits: [
      { produit: 'SIM 4G/5G Activée & Identifiée', commissionUnitaireBase: 500, objectifMensuelParAgent: 120 },
      { produit: 'Raccordement Box Fibre Optique Orange', commissionUnitaireBase: 12000, objectifMensuelParAgent: 15 },
      { produit: 'Ouverture Compte Orange Money / Wave marchand', commissionUnitaireBase: 1500, objectifMensuelParAgent: 40 },
      { produit: 'Smartphone Vendu avec Forfait Post-Payé', commissionUnitaireBase: 6000, objectifMensuelParAgent: 8 }
    ],
    accelerateurs: [
      { palier: 'Palier 1 (< 80%)', multiplicateur: 0.5, libelle: 'Sous-performance (Malus 50%)' },
      { palier: 'Palier 2 (80% - 99%)', multiplicateur: 1.0, libelle: 'Taux Standard (100%)' },
      { palier: 'Palier 3 (100% - 119%)', multiplicateur: 1.25, libelle: 'Objectif Atteint (+25% de bonus)' },
      { palier: 'Palier 4 (>= 120%)', multiplicateur: 1.50, libelle: 'Hyper-Performance (+50% d\'accélérateur)' }
    ]
  }
];

let bordereauxMensuels = [
  {
    id: 'BORD-2026-10-AG01',
    periode: '2026-10',
    agence: 'Agence Plateau Pyramide',
    responsableAgence: 'Kouassi Marc',
    effectifCommerciaux: 8,
    totalVentesSim: 1140,
    totalVentesFibre: 132,
    totalOuverturesOM: 380,
    chiffreAffairesGenereCfa: 38450000,
    montantBrutCommissionsCfa: 3120000,
    statutWorkflow: 'VALIDE_DRH_PRET_PAIE', // BROUILLON_CHEF_AGENCE, SOUMIS_CONTROLE_GESTION, VALIDE_DRH_PRET_PAIE, INJECTE_BULLETIN
    historiqueWorkflow: [
      { etape: 'Soumission par Chef d\'agence', date: '2026-10-28', auteur: 'Kouassi Marc' },
      { etape: 'Audit & rapprochement ventes réelles', date: '2026-10-29', auteur: 'Contrôle de Gestion Commercial' },
      { etape: 'Validation finale & bon à payer', date: '2026-10-30', auteur: 'Direction des Ressources Humaines' }
    ],
    topVendeurMois: { nom: 'Bamba Awa', commissionIndividuelleCfa: 540000, tauxAtteinte: '138%' }
  },
  {
    id: 'BORD-2026-10-AG02',
    periode: '2026-10',
    agence: 'Agence Yopougon Bel Air Express',
    responsableAgence: 'Traore Ibrahim',
    effectifCommerciaux: 12,
    totalVentesSim: 1820,
    totalVentesFibre: 165,
    totalOuverturesOM: 540,
    chiffreAffairesGenereCfa: 52100000,
    montantBrutCommissionsCfa: 4680000,
    statutWorkflow: 'SOUMIS_CONTROLE_GESTION',
    historiqueWorkflow: [
      { etape: 'Soumission par Chef d\'agence', date: '2026-10-29', auteur: 'Traore Ibrahim' }
    ],
    topVendeurMois: { nom: 'Koffi Serge', commissionIndividuelleCfa: 610000, tauxAtteinte: '142%' }
  },
  {
    id: 'BORD-2026-10-AG03',
    periode: '2026-10',
    agence: 'Agence Treichville Arras',
    responsableAgence: 'Bamba Awa',
    effectifCommerciaux: 8,
    totalVentesSim: 980,
    totalVentesFibre: 110,
    totalOuverturesOM: 290,
    chiffreAffairesGenereCfa: 29800000,
    montantBrutCommissionsCfa: 2450000,
    statutWorkflow: 'BROUILLON_CHEF_AGENCE',
    historiqueWorkflow: [],
    topVendeurMois: { nom: 'Koné Fatou', commissionIndividuelleCfa: 390000, tauxAtteinte: '104%' }
  }
];

router.get('/bordereaux', (req, res) => {
  res.json({
    success: true,
    plans: plansCommissions,
    bordereaux: bordereauxMensuels,
    syntheseGlobale: {
      totalCommissionsACeJourCfa: bordereauxMensuels.reduce((acc, b) => acc + b.montantBrutCommissionsCfa, 0),
      totalVendeursEligibles: bordereauxMensuels.reduce((acc, b) => acc + b.effectifCommerciaux, 0),
      tauxMoyenAtteinteObjectif: '118.5%',
      impactDirectChiffreAffairesCfa: bordereauxMensuels.reduce((acc, b) => acc + b.chiffreAffairesGenereCfa, 0)
    }
  });
});

router.post('/valider-etape', (req, res) => {
  const { bordereauId, roleValidateur, commentaire } = req.body;
  const b = bordereauxMensuels.find(item => item.id === bordereauId);
  if (!b) {
    return res.status(404).json({ success: false, error: 'Bordereau introuvable' });
  }

  if (b.statutWorkflow === 'BROUILLON_CHEF_AGENCE') {
    b.statutWorkflow = 'SOUMIS_CONTROLE_GESTION';
    b.historiqueWorkflow.push({ etape: 'Soumission par Chef d\'agence', date: new Date().toISOString().slice(0, 10), auteur: roleValidateur || 'Chef Agence' });
  } else if (b.statutWorkflow === 'SOUMIS_CONTROLE_GESTION') {
    b.statutWorkflow = 'VALIDE_DRH_PRET_PAIE';
    b.historiqueWorkflow.push({ etape: 'Audit & validation Contrôle de Gestion', date: new Date().toISOString().slice(0, 10), auteur: roleValidateur || 'Contrôleur de Gestion' });
  } else if (b.statutWorkflow === 'VALIDE_DRH_PRET_PAIE') {
    b.statutWorkflow = 'INJECTE_BULLETIN';
    b.historiqueWorkflow.push({ etape: 'Injection Paie & Bon à Payer', date: new Date().toISOString().slice(0, 10), auteur: roleValidateur || 'Direction RH' });
  }

  res.json({
    success: true,
    bordereau: b,
    message: `Statut du bordereau mis à jour : ${b.statutWorkflow}`
  });
});

module.exports = router;
