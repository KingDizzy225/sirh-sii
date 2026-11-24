const express = require('express');
const router = express.Router();

let postesEvalues = [
  {
    id: 1,
    intitule: 'Conseiller Commercial Boutique (B2C)',
    departement: 'Réseau Agences Abidjan',
    facteurs: {
      competences: {
        profondeurTechnique: 'Niveau D - Connaissances spécialisées télécoms & encaissement OM',
        ampleurManagement: 'Niveau I - Contribution individuelle (pas de management direct)',
        relationsHumaines: 'Niveau 3 - Compétences relationnelles critiques (conviction & accueil)'
      },
      resolutionProblemes: {
        cadreDePensee: 'Niveau C - Procédures établies avec adaptation aux réclamations clients',
        exigencePensee: 'Niveau 2 - Situations variables avec diagnostic guidé'
      },
      finalite: {
        liberteAction: 'Niveau C - Activité encadrée par le superviseur d\'agence',
        impactFinancier: 'Niveau 2 - Impact direct sur le chiffre d\'affaires de la caisse/boutique',
        ampleurControle: 'Niveau 1 - Impact localisé guichet'
      }
    },
    pointsHay: {
      competencesPoints: 152,
      resolutionProblemesPoints: 38,
      finalitePoints: 50,
      totalPointsHay: 240
    },
    classificationCcni: 'Catégorie 5 - Employé Qualifié',
    fourchetteSalariale: {
      minimum: 280000,
      pointMedian: 350000,
      maximum: 420000
    },
    statutEquite: 'CONFORME_MARCHE',
    titulairesActifs: 84
  },
  {
    id: 2,
    intitule: 'Superviseur d\'Agence Télécom (Chef de Boutique)',
    departement: 'Réseau Agences Abidjan',
    facteurs: {
      competences: {
        profondeurTechnique: 'Niveau E - Maîtrise avancée des opérations, gestion de stock et sécurité caisse',
        ampleurManagement: 'Niveau II - Management direct d\'équipe (8 à 15 conseillers)',
        relationsHumaines: 'Niveau 3 - Leadership, négociation litiges complexes et motivation'
      },
      resolutionProblemes: {
        cadreDePensee: 'Niveau D - Directives générales avec gestion des imprévus opérationnels',
        exigencePensee: 'Niveau 3 - Analyse des flux boutique, arbitrage et décisions rapides'
      },
      finalite: {
        liberteAction: 'Niveau D - Autonomie opérationnelle dans le cadre des règles Orange CI',
        impactFinancier: 'Niveau 3 - Responsabilité directe du CA mensuel agence (50M - 150M FCFA)',
        ampleurControle: 'Niveau 2 - Périmètre de l\'agence complète'
      }
    },
    pointsHay: {
      competencesPoints: 264,
      resolutionProblemesPoints: 87,
      finalitePoints: 115,
      totalPointsHay: 466
    },
    classificationCcni: 'Catégorie 8 / Cadre C1 - Maîtrise Supérieure',
    fourchetteSalariale: {
      minimum: 650000,
      pointMedian: 850000,
      maximum: 1100000
    },
    statutEquite: 'CONFORME_MARCHE',
    titulairesActifs: 18
  },
  {
    id: 3,
    intitule: 'Ingénieur Déploiement Fibre Optique & Réseau',
    departement: 'Technique & Infrastructure',
    facteurs: {
      competences: {
        profondeurTechnique: 'Niveau F - Expertise technique avancée (génie télécom, réflectométrie OTDR)',
        ampleurManagement: 'Niveau I - Rôle expert avec coordination des sous-traitants',
        relationsHumaines: 'Niveau 2 - Relations techniques et négociation de voirie'
      },
      resolutionProblemes: {
        cadreDePensee: 'Niveau E - Problématiques complexes d\'ingénierie et d\'optimisation de boucle locale',
        exigencePensee: 'Niveau 4 - Résolution de blocages d\'infrastructure inédits'
      },
      finalite: {
        liberteAction: 'Niveau E - Autonomie d\'ingénierie soumise aux validations de la direction technique',
        impactFinancier: 'Niveau 3 - Impact sur le budget investissement réseau (CAPEX)',
        ampleurControle: 'Niveau 3 - Régional'
      }
    },
    pointsHay: {
      competencesPoints: 304,
      resolutionProblemesPoints: 115,
      finalitePoints: 132,
      totalPointsHay: 551
    },
    classificationCcni: 'Cadre C2 - Ingénieur Confirmé',
    fourchetteSalariale: {
      minimum: 950000,
      pointMedian: 1250000,
      maximum: 1600000
    },
    statutEquite: 'CONFORME_MARCHE',
    titulairesActifs: 12
  }
];

const baremeHayReference = {
  niveauxCompetences: ['D-1-3', 'E-2-3', 'F-1-2', 'F-2-3', 'G-3-3'],
  paliersPoints: [
    { pointsMin: 100, pointsMax: 200, categorieCcni: 'Catégorie 3 à 4', fourchetteDefaut: [180000, 250000] },
    { pointsMin: 201, pointsMax: 350, categorieCcni: 'Catégorie 5 à 6', fourchetteDefaut: [280000, 450000] },
    { pointsMin: 351, pointsMax: 500, categorieCcni: 'Catégorie 7 à 8 (Agent de Maîtrise)', fourchetteDefaut: [500000, 850000] },
    { pointsMin: 501, pointsMax: 700, categorieCcni: 'Cadre C1 à C2', fourchetteDefaut: [900000, 1600000] },
    { pointsMin: 701, pointsMax: 1200, categorieCcni: 'Cadre Dirigeant C3 à C4', fourchetteDefaut: [1800000, 3500000] }
  ]
};

// GET : Liste des postes évalués
router.get('/postes', (req, res) => {
  res.json({
    success: true,
    postes: postesEvalues,
    baremeReference: baremeHayReference,
    stats: {
      totalPostesEvalues: postesEvalues.length,
      salariesCouverts: postesEvalues.reduce((acc, p) => acc + p.titulairesActifs, 0),
      tauxConformiteEquite: '96.4%',
      prochaineRevueComite: '2026-12-15'
    }
  });
});

// POST : Nouvelle évaluation d'un poste
router.post('/evaluer', (req, res) => {
  const { intitule, departement, competencesPoints, resolutionProblemesPoints, finalitePoints, titulairesActifs } = req.body;
  
  if (!intitule || !departement) {
    return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' });
  }

  const cp = parseInt(competencesPoints) || 150;
  const rp = parseInt(resolutionProblemesPoints) || 40;
  const fp = parseInt(finalitePoints) || 50;
  const total = cp + rp + fp;

  // Calcul palier CCNI
  const palier = baremeHayReference.paliersPoints.find(p => total >= p.pointsMin && total <= p.pointsMax) || baremeHayReference.paliersPoints[1];

  const nouveauPoste = {
    id: postesEvalues.length + 1,
    intitule,
    departement,
    facteurs: {
      competences: { profondeurTechnique: 'Évaluation Hay Validée', ampleurManagement: 'Standard', relationsHumaines: 'Professionnelles' },
      resolutionProblemes: { cadreDePensee: 'Standard', exigencePensee: 'Analyse' },
      finalite: { liberteAction: 'Directives', impactFinancier: 'Direct', ampleurControle: 'Département' }
    },
    pointsHay: {
      competencesPoints: cp,
      resolutionProblemesPoints: rp,
      finalitePoints: fp,
      totalPointsHay: total
    },
    classificationCcni: palier.categorieCcni,
    fourchetteSalariale: {
      minimum: palier.fourchetteDefaut[0],
      pointMedian: Math.round((palier.fourchetteDefaut[0] + palier.fourchetteDefaut[1]) / 2),
      maximum: palier.fourchetteDefaut[1]
    },
    statutEquite: 'CONFORME_MARCHE',
    titulairesActifs: parseInt(titulairesActifs) || 1
  };

  postesEvalues.unshift(nouveauPoste);
  res.status(201).json({
    success: true,
    poste: nouveauPoste,
    message: `Pesée Hay réussie : ${total} Points Hay attribués (Classification : ${palier.categorieCcni}).`
  });
});

module.exports = router;
