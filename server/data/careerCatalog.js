// Référentiel métiers de l'entreprise : familles, postes, niveaux (1 à 5) et compétences clés.
// Sert l'Explorateur de Carrière : progressions verticales au sein d'une famille
// et passerelles (BRIDGES) entre familles.

const ROLES = [
    // ─── Direction Générale ───
    { id: 'dg1', title: 'Chief of Staff', department: 'Direction Générale', level: 4, skills: ['Pilotage transverse', 'Communication exécutive', 'Gestion de projets stratégiques'] },
    { id: 'dg2', title: 'Directeur Général Adjoint', department: 'Direction Générale', level: 5, skills: ['Stratégie d\'entreprise', 'Leadership', 'Pilotage de la performance'] },
    { id: 'dg3', title: 'Directeur Général', department: 'Direction Générale', level: 5, skills: ['Vision stratégique', 'Gouvernance', 'Représentation externe'] },

    // ─── Tech / IT ───
    { id: 'tech1', title: 'Technicien Support IT', department: 'Tech / IT', level: 1, skills: ['Diagnostic incidents', 'Relation utilisateurs', 'Outils ITSM'] },
    { id: 'tech2', title: 'Administrateur Systèmes & Réseaux', department: 'Tech / IT', level: 2, skills: ['Administration Linux/Windows', 'Réseaux TCP/IP', 'Supervision'] },
    { id: 'tech3', title: 'Développeur Junior', department: 'Tech / IT', level: 1, skills: ['Algorithmique', 'Git', 'Un langage majeur (JS, Java, Python…)'] },
    { id: 'tech4', title: 'Développeur Confirmé', department: 'Tech / IT', level: 2, skills: ['Conception logicielle', 'Tests automatisés', 'Revue de code'] },
    { id: 'tech5', title: 'Développeur Senior', department: 'Tech / IT', level: 3, skills: ['Architecture applicative', 'Mentorat', 'Performance & sécurité'] },
    { id: 'tech6', title: 'Ingénieur DevOps', department: 'Tech / IT', level: 3, skills: ['CI/CD', 'Cloud (AWS/GCP/Azure)', 'Infrastructure as Code'] },
    { id: 'tech7', title: 'Ingénieur QA', department: 'Tech / IT', level: 2, skills: ['Stratégie de test', 'Automatisation', 'Qualité logicielle'] },
    { id: 'tech8', title: 'Lead Developer', department: 'Tech / IT', level: 4, skills: ['Leadership technique', 'Architecture', 'Encadrement d\'équipe'] },
    { id: 'tech9', title: 'Architecte Solution', department: 'Tech / IT', level: 4, skills: ['Architecture d\'entreprise', 'Urbanisation SI', 'Conseil aux métiers'] },
    { id: 'tech10', title: 'Engineering Manager', department: 'Tech / IT', level: 4, skills: ['Management d\'équipe', 'Delivery', 'Développement des talents'] },
    { id: 'tech11', title: 'Directeur Technique (CTO)', department: 'Tech / IT', level: 5, skills: ['Stratégie technologique', 'Innovation', 'Leadership'] },

    // ─── Data & IA ───
    { id: 'data1', title: 'Data Analyst', department: 'Data & IA', level: 2, skills: ['SQL', 'Dataviz', 'Analyse statistique'] },
    { id: 'data2', title: 'Data Engineer', department: 'Data & IA', level: 3, skills: ['Pipelines de données', 'Big Data', 'Cloud data'] },
    { id: 'data3', title: 'Data Scientist', department: 'Data & IA', level: 3, skills: ['Machine Learning', 'Python', 'Modélisation'] },
    { id: 'data4', title: 'Lead Data', department: 'Data & IA', level: 4, skills: ['Gouvernance des données', 'Encadrement', 'Stratégie data'] },
    { id: 'data5', title: 'Chief Data Officer', department: 'Data & IA', level: 5, skills: ['Stratégie data & IA', 'Conformité', 'Transformation'] },

    // ─── Cybersécurité ───
    { id: 'sec1', title: 'Analyste SOC', department: 'Cybersécurité', level: 2, skills: ['Détection d\'incidents', 'SIEM', 'Analyse de menaces'] },
    { id: 'sec2', title: 'Ingénieur Sécurité', department: 'Cybersécurité', level: 3, skills: ['Durcissement des systèmes', 'Tests d\'intrusion', 'Gestion des vulnérabilités'] },
    { id: 'sec3', title: 'Responsable Sécurité (RSSI)', department: 'Cybersécurité', level: 4, skills: ['Politique de sécurité', 'Gestion des risques', 'Conformité ISO 27001'] },

    // ─── Produit & Design ───
    { id: 'prod1', title: 'UX/UI Designer', department: 'Produit & Design', level: 2, skills: ['Recherche utilisateur', 'Prototypage', 'Design system'] },
    { id: 'prod2', title: 'Product Owner', department: 'Produit & Design', level: 2, skills: ['Backlog & priorisation', 'Agilité', 'Rédaction de user stories'] },
    { id: 'prod3', title: 'Product Manager', department: 'Produit & Design', level: 3, skills: ['Vision produit', 'Discovery', 'Pilotage par la donnée'] },
    { id: 'prod4', title: 'Lead Designer', department: 'Produit & Design', level: 3, skills: ['Direction artistique', 'Encadrement design', 'Design ops'] },
    { id: 'prod5', title: 'Head of Product', department: 'Produit & Design', level: 4, skills: ['Stratégie produit', 'Management', 'Alignement business'] },
    { id: 'prod6', title: 'Chief Product Officer', department: 'Produit & Design', level: 5, skills: ['Vision long terme', 'Organisation produit', 'Leadership'] },

    // ─── Ressources Humaines ───
    { id: 'hr1', title: 'Assistant RH', department: 'Ressources Humaines', level: 1, skills: ['Administration du personnel', 'Outils SIRH', 'Rigueur'] },
    { id: 'hr2', title: 'Chargé de Recrutement', department: 'Ressources Humaines', level: 2, skills: ['Sourcing', 'Entretiens', 'Marque employeur'] },
    { id: 'hr3', title: 'Chargé de Formation', department: 'Ressources Humaines', level: 2, skills: ['Ingénierie pédagogique', 'Plan de formation', 'Gestion de budget'] },
    { id: 'hr4', title: 'Gestionnaire Paie', department: 'Ressources Humaines', level: 2, skills: ['Paie & charges sociales', 'Droit social', 'Déclarations (CNPS, ITS)'] },
    { id: 'hr5', title: 'HR Business Partner', department: 'Ressources Humaines', level: 3, skills: ['Conseil aux managers', 'Relations sociales', 'Gestion des talents'] },
    { id: 'hr6', title: 'Responsable RH', department: 'Ressources Humaines', level: 4, skills: ['Politique RH', 'Management', 'GPEC'] },
    { id: 'hr7', title: 'Directeur RH', department: 'Ressources Humaines', level: 5, skills: ['Stratégie RH', 'Dialogue social', 'Transformation'] },

    // ─── Finance & Comptabilité ───
    { id: 'fin1', title: 'Comptable Junior', department: 'Finance', level: 1, skills: ['Saisie comptable', 'Rapprochements', 'SYSCOHADA'] },
    { id: 'fin2', title: 'Comptable Senior', department: 'Finance', level: 2, skills: ['Clôtures', 'Fiscalité', 'Immobilisations'] },
    { id: 'fin3', title: 'Trésorier', department: 'Finance', level: 3, skills: ['Gestion de trésorerie', 'Relations bancaires', 'Prévisions de cash'] },
    { id: 'fin4', title: 'Contrôleur de Gestion', department: 'Finance', level: 3, skills: ['Budgets & forecasts', 'Analyse des écarts', 'Reporting'] },
    { id: 'fin5', title: 'Auditeur Interne', department: 'Finance', level: 3, skills: ['Contrôle interne', 'Cartographie des risques', 'Recommandations'] },
    { id: 'fin6', title: 'Responsable Comptable', department: 'Finance', level: 4, skills: ['Supervision comptable', 'Normes & conformité', 'Management'] },
    { id: 'fin7', title: 'Directeur Financier (DAF)', department: 'Finance', level: 5, skills: ['Stratégie financière', 'Financement', 'Pilotage de la performance'] },

    // ─── Juridique & Conformité ───
    { id: 'jur1', title: 'Juriste', department: 'Juridique & Conformité', level: 2, skills: ['Droit des contrats', 'Veille juridique', 'Rédaction d\'actes'] },
    { id: 'jur2', title: 'Délégué à la Protection des Données (DPO)', department: 'Juridique & Conformité', level: 3, skills: ['Protection des données', 'Registre des traitements', 'Sensibilisation'] },
    { id: 'jur3', title: 'Responsable Conformité', department: 'Juridique & Conformité', level: 4, skills: ['Programmes de conformité', 'Anti-corruption', 'Gestion des risques'] },
    { id: 'jur4', title: 'Directeur Juridique', department: 'Juridique & Conformité', level: 5, skills: ['Stratégie juridique', 'Contentieux', 'Gouvernance'] },

    // ─── Commercial & Ventes ───
    { id: 'sal1', title: 'Business Developer Junior (SDR)', department: 'Commercial & Ventes', level: 1, skills: ['Prospection', 'Qualification de leads', 'CRM'] },
    { id: 'sal2', title: 'Commercial Confirmé', department: 'Commercial & Ventes', level: 2, skills: ['Cycle de vente', 'Négociation', 'Closing'] },
    { id: 'sal3', title: 'Key Account Manager', department: 'Commercial & Ventes', level: 3, skills: ['Grands comptes', 'Négociation complexe', 'Fidélisation'] },
    { id: 'sal4', title: 'Responsable des Ventes', department: 'Commercial & Ventes', level: 4, skills: ['Management commercial', 'Pilotage du pipe', 'Stratégie de vente'] },
    { id: 'sal5', title: 'Directeur Commercial', department: 'Commercial & Ventes', level: 5, skills: ['Stratégie commerciale', 'Partenariats', 'Croissance'] },

    // ─── Marketing & Communication ───
    { id: 'mkt1', title: 'Chargé de Communication', department: 'Marketing & Communication', level: 1, skills: ['Rédaction', 'Réseaux sociaux', 'Événementiel'] },
    { id: 'mkt2', title: 'Community Manager', department: 'Marketing & Communication', level: 1, skills: ['Animation de communautés', 'Création de contenus', 'Analytics social media'] },
    { id: 'mkt3', title: 'Chargé de Marketing Digital', department: 'Marketing & Communication', level: 2, skills: ['SEO/SEA', 'Campagnes digitales', 'Marketing automation'] },
    { id: 'mkt4', title: 'Chef de Produit Marketing', department: 'Marketing & Communication', level: 3, skills: ['Étude de marché', 'Positionnement', 'Lancement produit'] },
    { id: 'mkt5', title: 'Responsable Marketing', department: 'Marketing & Communication', level: 4, skills: ['Stratégie marketing', 'Budget & ROI', 'Management'] },
    { id: 'mkt6', title: 'Directeur Marketing (CMO)', department: 'Marketing & Communication', level: 5, skills: ['Stratégie de marque', 'Croissance', 'Leadership'] },

    // ─── Achats & Supply Chain ───
    { id: 'ach1', title: 'Assistant Achats', department: 'Achats & Supply Chain', level: 1, skills: ['Gestion des commandes', 'Suivi fournisseurs', 'ERP'] },
    { id: 'ach2', title: 'Acheteur', department: 'Achats & Supply Chain', level: 2, skills: ['Négociation fournisseurs', 'Appels d\'offres', 'Analyse des coûts'] },
    { id: 'ach3', title: 'Logisticien', department: 'Achats & Supply Chain', level: 2, skills: ['Gestion des stocks', 'Transport', 'Planification'] },
    { id: 'ach4', title: 'Supply Chain Manager', department: 'Achats & Supply Chain', level: 3, skills: ['Optimisation des flux', 'Prévisions', 'Pilotage logistique'] },
    { id: 'ach5', title: 'Responsable Achats', department: 'Achats & Supply Chain', level: 4, skills: ['Stratégie achats', 'Panel fournisseurs', 'Management'] },
    { id: 'ach6', title: 'Directeur Achats & Supply Chain', department: 'Achats & Supply Chain', level: 5, skills: ['Stratégie sourcing', 'Transformation', 'Gestion des risques'] },

    // ─── Opérations / Production ───
    { id: 'ops1', title: 'Opérateur de Production', department: 'Opérations', level: 1, skills: ['Procédures de production', 'Qualité', 'Sécurité au poste'] },
    { id: 'ops2', title: 'Chef d\'Équipe', department: 'Opérations', level: 2, skills: ['Animation d\'équipe', 'Planification', 'Amélioration continue'] },
    { id: 'ops3', title: 'Responsable de Production', department: 'Opérations', level: 3, skills: ['Pilotage de la production', 'Lean management', 'Indicateurs de performance'] },
    { id: 'ops4', title: 'Responsable des Opérations', department: 'Opérations', level: 4, skills: ['Excellence opérationnelle', 'Management transverse', 'Budget'] },
    { id: 'ops5', title: 'Directeur des Opérations (COO)', department: 'Opérations', level: 5, skills: ['Stratégie opérationnelle', 'Transformation', 'Leadership'] },

    // ─── Service Client ───
    { id: 'cli1', title: 'Conseiller Client', department: 'Service Client', level: 1, skills: ['Écoute active', 'Résolution de problèmes', 'Outils de ticketing'] },
    { id: 'cli2', title: 'Superviseur Service Client', department: 'Service Client', level: 2, skills: ['Encadrement d\'équipe', 'Gestion des escalades', 'Qualité de service'] },
    { id: 'cli3', title: 'Customer Success Manager', department: 'Service Client', level: 3, skills: ['Adoption produit', 'Rétention', 'Relation client B2B'] },
    { id: 'cli4', title: 'Responsable Expérience Client', department: 'Service Client', level: 4, skills: ['Parcours client', 'Voix du client', 'Stratégie CX'] },

    // ─── QHSE ───
    { id: 'hse1', title: 'Agent HSE', department: 'QHSE', level: 1, skills: ['Consignes de sécurité', 'Premiers secours', 'Contrôles terrain'] },
    { id: 'hse2', title: 'Inspecteur HSE', department: 'QHSE', level: 2, skills: ['Audits sécurité', 'Analyse des risques', 'Réglementation'] },
    { id: 'hse3', title: 'Responsable QHSE', department: 'QHSE', level: 3, skills: ['Système de management QHSE', 'Certifications ISO', 'Plans de prévention'] },
    { id: 'hse4', title: 'Directeur QHSE', department: 'QHSE', level: 4, skills: ['Politique QHSE groupe', 'Culture sécurité', 'Conformité réglementaire'] },

    // ─── Administration & Services Généraux ───
    { id: 'adm1', title: 'Assistant Administratif', department: 'Administration', level: 1, skills: ['Gestion documentaire', 'Accueil', 'Bureautique'] },
    { id: 'adm2', title: 'Office Manager', department: 'Administration', level: 2, skills: ['Coordination interne', 'Gestion des prestataires', 'Organisation d\'événements'] },
    { id: 'adm3', title: 'Responsable Services Généraux', department: 'Administration', level: 3, skills: ['Gestion des locaux', 'Budgets de fonctionnement', 'Contrats de maintenance'] },
    { id: 'adm4', title: 'Directeur Administratif', department: 'Administration', level: 4, skills: ['Pilotage administratif', 'Optimisation des coûts', 'Management'] }
];

// Passerelles inter-familles : évolutions transverses reconnues (source -> target, par titre)
const BRIDGES = [
    // Tech vers Produit / Data / Sécurité / Management
    { source: 'Développeur Senior', target: 'Product Owner' },
    { source: 'Développeur Senior', target: 'Data Engineer' },
    { source: 'Développeur Senior', target: 'Ingénieur Sécurité' },
    { source: 'Lead Developer', target: 'Engineering Manager' },
    { source: 'Lead Developer', target: 'Architecte Solution' },
    { source: 'Ingénieur DevOps', target: 'Ingénieur Sécurité' },
    { source: 'Administrateur Systèmes & Réseaux', target: 'Analyste SOC' },
    { source: 'Ingénieur QA', target: 'Product Owner' },
    { source: 'Engineering Manager', target: 'Directeur Technique (CTO)' },
    { source: 'Architecte Solution', target: 'Directeur Technique (CTO)' },

    // Data
    { source: 'Data Analyst', target: 'Data Scientist' },
    { source: 'Data Analyst', target: 'Contrôleur de Gestion' },
    { source: 'Lead Data', target: 'Chief Data Officer' },

    // Produit
    { source: 'Product Manager', target: 'Head of Product' },
    { source: 'UX/UI Designer', target: 'Product Owner' },
    { source: 'Product Manager', target: 'Chef de Produit Marketing' },

    // Sécurité / Juridique
    { source: 'Ingénieur Sécurité', target: 'Responsable Sécurité (RSSI)' },
    { source: 'Juriste', target: 'Délégué à la Protection des Données (DPO)' },
    { source: 'Responsable Sécurité (RSSI)', target: 'Responsable Conformité' },

    // RH
    { source: 'Chargé de Recrutement', target: 'HR Business Partner' },
    { source: 'Chargé de Formation', target: 'HR Business Partner' },
    { source: 'Gestionnaire Paie', target: 'Comptable Senior' },
    { source: 'Office Manager', target: 'Assistant RH' },

    // Finance
    { source: 'Comptable Senior', target: 'Contrôleur de Gestion' },
    { source: 'Comptable Senior', target: 'Auditeur Interne' },
    { source: 'Contrôleur de Gestion', target: 'Responsable Comptable' },
    { source: 'Auditeur Interne', target: 'Responsable Conformité' },

    // Commercial / Marketing / Client
    { source: 'Conseiller Client', target: 'Business Developer Junior (SDR)' },
    { source: 'Commercial Confirmé', target: 'Customer Success Manager' },
    { source: 'Customer Success Manager', target: 'Key Account Manager' },
    { source: 'Community Manager', target: 'Chargé de Marketing Digital' },
    { source: 'Chef de Produit Marketing', target: 'Product Manager' },
    { source: 'Key Account Manager', target: 'Responsable des Ventes' },

    // Opérations / Achats / QHSE
    { source: 'Chef d\'Équipe', target: 'Inspecteur HSE' },
    { source: 'Logisticien', target: 'Supply Chain Manager' },
    { source: 'Responsable de Production', target: 'Responsable des Opérations' },
    { source: 'Responsable QHSE', target: 'Responsable des Opérations' },

    // Vers la Direction Générale
    { source: 'Directeur Financier (DAF)', target: 'Directeur Général Adjoint' },
    { source: 'Directeur des Opérations (COO)', target: 'Directeur Général Adjoint' },
    { source: 'Directeur Commercial', target: 'Directeur Général Adjoint' },
    { source: 'Directeur Général Adjoint', target: 'Directeur Général' },
    { source: 'Chief of Staff', target: 'Directeur Général Adjoint' }
];

module.exports = { ROLES, BRIDGES };
