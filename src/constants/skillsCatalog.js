export const skillsCatalog = [
  {
    category: "Soft Skills (Savoir-être)",
    skills: [
      "Communication Orale",
      "Communication Écrite",
      "Écoute Active",
      "Résolution de Problèmes",
      "Esprit Critique",
      "Esprit d'Équipe",
      "Gestion du Temps",
      "Adaptabilité / Flexibilité",
      "Négociation",
      "Intelligence Émotionnelle",
      "Gestion du Stress",
      "Créativité / Innovation",
      "Autonomie",
      "Prise de Décision",
      "Empathie",
      "Leadership",
      "Sens de l'Organisation"
    ]
  },
  {
    category: "Management & Gestion de Projet",
    skills: [
      "Management d'Équipe",
      "Gestion de Projet (Classique)",
      "Méthodes Agiles (Scrum, Kanban)",
      "Gestion des Risques",
      "Planification Stratégique",
      "Conduite du Changement",
      "Gestion de Budget",
      "Lean Management",
      "Design Thinking",
      "Suivi des KPI / OKR",
      "Délégation"
    ]
  },
  {
    category: "Informatique & Tech (IT)",
    skills: [
      "Développement Front-End (React, Vue, Angular)",
      "Développement Back-End (Node.js, Java, Python, C#)",
      "Développement Mobile (iOS, Android, React Native, Flutter)",
      "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
      "Architecture Logicielle",
      "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
      "Cloud Computing (AWS, Azure, Google Cloud)",
      "Cybersécurité",
      "Administration Système (Linux, Windows Server)",
      "Réseaux et Télécoms",
      "Support IT / Helpdesk",
      "Tests & QA (Cypress, Selenium, Jest)",
      "Analyse de Données (Data Science, Big Data)",
      "Machine Learning / IA",
      "UI/UX Design"
    ]
  },
  {
    category: "Ressources Humaines (RH)",
    skills: [
      "Recrutement et Sourcing",
      "Gestion de la Paie",
      "Droit du Travail",
      "Gestion Administrative du Personnel",
      "Formation et Développement des Compétences",
      "GPEC (Gestion Prévisionnelle des Emplois et Compétences)",
      "Marque Employeur",
      "Gestion des Conflits",
      "Entretiens Annuels / Évaluation",
      "Politique de Rémunération",
      "Qualité de Vie au Travail (QVT)"
    ]
  },
  {
    category: "Finance, Comptabilité & Légal",
    skills: [
      "Comptabilité Générale",
      "Comptabilité Analytique",
      "Analyse Financière",
      "Contrôle de Gestion",
      "Audit Financier",
      "Fiscalité",
      "Trésorerie",
      "Reporting Financier",
      "Droit des Affaires",
      "Conformité / Compliance (RGPD, etc.)"
    ]
  },
  {
    category: "Vente, Marketing & Commerce",
    skills: [
      "Stratégie Marketing",
      "Marketing Digital",
      "SEO / SEA",
      "Gestion des Réseaux Sociaux (Community Management)",
      "Prospection Commerciale",
      "Négociation de Contrats B2B/B2C",
      "Gestion de la Relation Client (CRM)",
      "Service Client / SAV",
      "Copywriting",
      "Inbound Marketing",
      "Analyse de Données Marketing (Google Analytics)",
      "E-commerce"
    ]
  },
  {
    category: "Opérations & Logistique",
    skills: [
      "Supply Chain Management",
      "Gestion des Stocks",
      "Achat / Procurement",
      "Logistique de Transport",
      "Amélioration Continue",
      "Contrôle Qualité",
      "Planification de Production"
    ]
  },
  {
    category: "Langues",
    skills: [
      "Anglais (Professionnel courant)",
      "Anglais (Technique)",
      "Français (Langue maternelle)",
      "Espagnol",
      "Allemand",
      "Mandarin",
      "Arabe",
      "Italien",
      "Portugais"
    ]
  }
];

export const getAllSkillsFlat = () => {
  const flatList = [];
  skillsCatalog.forEach(category => {
    category.skills.forEach(skill => {
      flatList.push({ category: category.category, skill });
    });
  });
  return flatList;
};
