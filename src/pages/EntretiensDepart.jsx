import React, { useState } from 'react';
import {
  DoorClosed, UserMinus, BarChart3, Star, MessageSquare,
  TrendingDown, ThumbsUp, ThumbsDown, Award, Plus,
  Search, Filter, CheckCircle2, Clock, X, Eye, Printer,
  FileText, AlertCircle, HeartHandshake, Sparkles, Building
} from 'lucide-react';

export function EntretiensDepart() {
  const [activeTab, setActiveTab] = useState('entretiens'); // 'entretiens', 'analytics', 'actions'
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('TOUS');
  const [reasonFilter, setReasonFilter] = useState('TOUS');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedInterviewForDetail, setSelectedInterviewForDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Données réalistes d'entretiens de sortie
  const [entretiens, setEntretiens] = useState([
    {
      id: "EXIT-2026-012",
      salarieNom: "Kouadio Michel",
      matricule: "EMP-0078",
      poste: "Ingénieur Cloud & DevOps Senior",
      departement: "Infrastructure & Systèmes",
      agence: "Siège Plateau (Tour Postel 2001)",
      anciennete: "3 ans 8 mois",
      dateDepart: "15/09/2026",
      typeDepart: "Démission",
      menePar: "Dr. Stéphane Touré (DRH)",
      motifPrincipal: "Opportunité Concurrente & Rémunération",
      nouvelleDestination: "Opérateur Télécom International (Dakar)",
      enpsScore: 8, // 0 à 10
      recommandeEntreprise: true,
      notesCriteres: {
        management: 4,
        remuneration: 2,
        perspectivesCarriere: 2,
        ambianceEquipe: 5,
        equilibreViePro: 4,
        outilsMateriel: 4
      },
      pointsFortsVerbatim: "Excellente ambiance au sein du pôle infrastructure, collègues très solidaires et projets technologiques stimulants.",
      pointsAmeliorationVerbatim: "Grille salariale rigide ne récompensant pas assez vite les compétences rares sur le cloud. Délais de décision trop longs pour les revalorisations.",
      auraitPuLeRetenir: "Une augmentation de 25% et une titularisation comme Lead Architecte Cloud.",
      statut: "CLOTURE"
    },
    {
      id: "EXIT-2026-011",
      salarieNom: "Aïssata Diallo",
      matricule: "EMP-0094",
      poste: "Chargée de Clientèle PME",
      departement: "Banque d'Affaires & PME",
      agence: "Agence Cocody Ambassades",
      anciennete: "2 ans 1 mois",
      dateDepart: "31/08/2026",
      typeDepart: "Démission",
      menePar: "Fatou Camara (Talent Manager)",
      motifPrincipal: "Équilibre Vie Pro / Vie Perso & Trajet",
      nouvelleDestination: "Cabinet Conseil à 10 min du domicile",
      enpsScore: 7,
      recommandeEntreprise: true,
      notesCriteres: {
        management: 4,
        remuneration: 3,
        perspectivesCarriere: 3,
        ambianceEquipe: 4,
        equilibreViePro: 2,
        outilsMateriel: 3
      },
      pointsFortsVerbatim: "Managers bienveillants et formation continue de qualité avec le FDFP.",
      pointsAmeliorationVerbatim: "Trop de temps passé dans les embouteillages d'Abidjan (Cocody - Plateau) sans politique souple de télétravail ou d'aménagement horaire.",
      auraitPuLeRetenir: "2 jours de télétravail garantis par semaine ou mutation en agence de proximité.",
      statut: "CLOTURE"
    },
    {
      id: "EXIT-2026-010",
      salarieNom: "Yao Boris",
      matricule: "EMP-0056",
      poste: "Comptable Trésorerie Junior",
      departement: "Finance & Comptabilité",
      agence: "Siège Plateau (Tour Postel 2001)",
      anciennete: "1 an 6 mois",
      dateDepart: "15/07/2026",
      typeDepart: "Fin de CDD (Non renouvellement volontaire)",
      menePar: "Dr. Stéphane Touré (DRH)",
      motifPrincipal: "Reprise d'Études / Master à l'Étranger",
      nouvelleDestination: "Université Paris Dauphine",
      enpsScore: 9,
      recommandeEntreprise: true,
      notesCriteres: {
        management: 5,
        remuneration: 3,
        perspectivesCarriere: 4,
        ambianceEquipe: 5,
        equilibreViePro: 4,
        outilsMateriel: 4
      },
      pointsFortsVerbatim: "Une expérience formatrice exceptionnelle pour démarrer ma carrière dans la finance.",
      pointsAmeliorationVerbatim: "Processus de validation manuels encore trop présents sur certaines écritures comptables.",
      auraitPuLeRetenir: "Un contrat d'alternance ou un aménagement pour suivre les cours du soir.",
      statut: "CLOTURE"
    },
    {
      id: "EXIT-2026-009",
      salarieNom: "Serge Koffi",
      matricule: "EMP-0033",
      poste: "Développeur Fullstack React/Node",
      departement: "Infrastructure & Systèmes",
      agence: "Siège Plateau (Tour Postel 2001)",
      anciennete: "4 ans 2 mois",
      dateDepart: "28/06/2026",
      typeDepart: "Démission",
      menePar: "Fatou Camara (Talent Manager)",
      motifPrincipal: "Management Direct & Reconnaissance",
      nouvelleDestination: "Fintech Internationale (Abidjan)",
      enpsScore: 5,
      recommandeEntreprise: false,
      notesCriteres: {
        management: 2,
        remuneration: 3,
        perspectivesCarriere: 2,
        ambianceEquipe: 4,
        equilibreViePro: 3,
        outilsMateriel: 4
      },
      pointsFortsVerbatim: "Stack technique moderne, bonnes infrastructures et équipe de développeurs talentueuse.",
      pointsAmeliorationVerbatim: "Micro-management étouffant, manque d'autonomie et aucun feedback positif lors des réussites sur les sprints clés.",
      auraitPuLeRetenir: "Un changement d'équipe ou une réorganisation du pôle applicatif.",
      statut: "CLOTURE"
    }
  ]);

  // Formulaire de saisie d'un nouvel entretien
  const [newInterview, setNewInterview] = useState({
    salarieNom: '',
    matricule: '',
    poste: '',
    departement: 'Infrastructure & Systèmes',
    agence: 'Siège Plateau (Tour Postel 2001)',
    anciennete: '2 ans',
    dateDepart: '30/09/2026',
    typeDepart: 'Démission',
    menePar: 'Dr. Stéphane Touré (DRH)',
    motifPrincipal: 'Opportunité Concurrente & Rémunération',
    nouvelleDestination: '',
    enpsScore: 8,
    recommandeEntreprise: true,
    managementScore: 4,
    remunerationScore: 3,
    perspectivesScore: 3,
    ambianceScore: 4,
    equilibreScore: 4,
    pointsFortsVerbatim: '',
    pointsAmeliorationVerbatim: '',
    auraitPuLeRetenir: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPIs
  const totalEntretiens = entretiens.length;
  const moyenneEnps = (entretiens.reduce((acc, e) => acc + e.enpsScore, 0) / totalEntretiens).toFixed(1);
  const tauxRecommandation = Math.round((entretiens.filter(e => e.recommandeEntreprise).length / totalEntretiens) * 100);
  
  // Analyse des motifs
  const countRemuneration = entretiens.filter(e => e.motifPrincipal.includes('Rémunération')).length;
  const countManagement = entretiens.filter(e => e.motifPrincipal.includes('Management')).length;
  const countEquilibre = entretiens.filter(e => e.motifPrincipal.includes('Équilibre')).length;
  const countEtudes = entretiens.filter(e => e.motifPrincipal.includes('Études')).length;

  // Filtrage
  const filteredEntretiens = entretiens.filter(item => {
    const matchesSearch = 
      item.salarieNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pointsFortsVerbatim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pointsAmeliorationVerbatim.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = departmentFilter === 'TOUS' || item.departement === departmentFilter;
    const matchesReason = reasonFilter === 'TOUS' || item.motifPrincipal.includes(reasonFilter);

    return matchesSearch && matchesDept && matchesReason;
  });

  const handleCreateInterview = (e) => {
    e.preventDefault();
    if (!newInterview.salarieNom || !newInterview.poste) {
      alert("Veuillez renseigner au moins le nom du salarié et son poste.");
      return;
    }

    const created = {
      id: `EXIT-2026-0${entretiens.length + 1}`,
      salarieNom: newInterview.salarieNom,
      matricule: newInterview.matricule || `EMP-00${Math.floor(100 + Math.random() * 50)}`,
      poste: newInterview.poste,
      departement: newInterview.departement,
      agence: newInterview.agence,
      anciennete: newInterview.anciennete,
      dateDepart: newInterview.dateDepart,
      typeDepart: newInterview.typeDepart,
      menePar: newInterview.menePar,
      motifPrincipal: newInterview.motifPrincipal,
      nouvelleDestination: newInterview.nouvelleDestination || 'Non communiquée',
      enpsScore: parseInt(newInterview.enpsScore),
      recommandeEntreprise: newInterview.recommandeEntreprise,
      notesCriteres: {
        management: parseInt(newInterview.managementScore),
        remuneration: parseInt(newInterview.remunerationScore),
        perspectivesCarriere: parseInt(newInterview.perspectivesScore),
        ambianceEquipe: parseInt(newInterview.ambianceScore),
        equilibreViePro: parseInt(newInterview.equilibreScore),
        outilsMateriel: 4
      },
      pointsFortsVerbatim: newInterview.pointsFortsVerbatim || 'Ambiance positive.',
      pointsAmeliorationVerbatim: newInterview.pointsAmeliorationVerbatim || 'Attente de valorisation salariale.',
      auraitPuLeRetenir: newInterview.auraitPuLeRetenir || 'Proposition financière supérieure.',
      statut: "CLOTURE"
    };

    setEntretiens([created, ...entretiens]);
    setShowNewModal(false);
    showToast(`Entretien de départ pour ${created.salarieNom} archivé avec succès.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <DoorClosed className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Entretiens de Départ & Diagnostic du Turnover (Exit Interviews)
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                  Standard Marché
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Analyse qualitative des démissions, score de recommandation eNPS de sortie et retours d'expérience confidentiels
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Saisir un Exit Interview</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : eNPS Sortants */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Score eNPS des Partants
            </span>
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{moyenneEnps}</span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Note de satisfaction générale à la sortie
          </div>
        </div>

        {/* KPI 2 : Taux de Recommandation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Ambassadeurs de Sortie
            </span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{tauxRecommandation}%</span>
            <span className="text-xs text-slate-400 ml-2">recommandent SII</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Image employeur positive conservée
          </div>
        </div>

        {/* KPI 3 : Cause #1 de Démission */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Motif Principal #1
            </span>
            <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-slate-900 dark:text-white">Rémunération & Concurrence</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Représente 50% des démissions analysées
          </div>
        </div>

        {/* KPI 4 : Total Entretiens */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Taux de Couverture RH
            </span>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</span>
            <span className="text-xs text-slate-400 ml-2">des partants interrogés</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {totalEntretiens} dossiers archivés cette année
          </div>
        </div>

      </div>

      {/* Onglets */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('entretiens')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'entretiens'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Registre des Entretiens Menés ({entretiens.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Diagnostic Statistique & Motifs de Fuite</span>
        </button>
      </div>

      {/* ONGLET 1 : REGISTRE */}
      {activeTab === 'entretiens' && (
        <div className="space-y-4">
          
          {/* Recherche & Filtres */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par collaborateur, poste, verbatim ou suggestion..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border-none font-medium"
              >
                <option value="TOUS">Tous départements</option>
                <option value="Infrastructure & Systèmes">Infrastructure & Systèmes</option>
                <option value="Banque d'Affaires & PME">Banque d'Affaires & PME</option>
                <option value="Finance & Comptabilité">Finance & Comptabilité</option>
              </select>

              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border-none font-medium"
              >
                <option value="TOUS">Tous motifs de départ</option>
                <option value="Rémunération">Rémunération & Concurrence</option>
                <option value="Management">Management & Climat</option>
                <option value="Équilibre">Équilibre Vie Pro/Perso</option>
                <option value="Études">Reprise d'Études</option>
              </select>
            </div>
          </div>

          {/* Liste des fiches d'entretiens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEntretiens.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer"
                onClick={() => setSelectedInterviewForDetail(item)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {item.salarieNom}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ({item.matricule})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.poste} • Ancienneté : {item.anciennete}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>eNPS {item.enpsScore}/10</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-500">Motif Majeur :</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{item.motifPrincipal}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-500">Nouvelle Destination :</span>
                    <span className="text-slate-800 dark:text-slate-200">{item.nouvelleDestination}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-500">Entretien mené par :</span>
                    <span className="text-slate-600 dark:text-slate-400">{item.menePar}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-amber-500 pl-3 line-clamp-2">
                  "{item.pointsAmeliorationVerbatim}"
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Départ acté le {item.dateDepart}</span>
                  <button className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Voir le rapport complet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ONGLET 2 : ANALYTICS & DIAGNOSTIC DES FUITES */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Répartition des motifs de départ */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                Répartition des Motifs de Démissions
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Rémunération & Packages Concurrents</span>
                    <span className="text-rose-600">50% (2 départs)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Temps de Trajet & Équilibre Vie Pro/Perso</span>
                    <span className="text-amber-600">25% (1 départ)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Reprise d'Études / Spécialisation</span>
                    <span className="text-blue-600">25% (1 départ)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 mt-4">
                <strong>Recommandation RH Prioritaire :</strong> Revoir la grille conventionnelle des profils Cloud/DevOps sous 6 mois pour endiguer les débauchages par les télécoms régionaux.
              </div>
            </div>

            {/* Note moyenne par critère */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                Évaluation Moyenne des Partants (sur 5 étoiles)
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Ambiance & Esprit d'Équipe</span>
                  <div className="flex items-center gap-1 font-bold text-emerald-600">
                    <span>4.7 / 5</span>
                    <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Management & Hiérarchie</span>
                  <div className="flex items-center gap-1 font-bold text-amber-600">
                    <span>3.8 / 5</span>
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Équilibre Vie Pro / Vie Perso</span>
                  <div className="flex items-center gap-1 font-bold text-amber-600">
                    <span>3.3 / 5</span>
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Rémunération & Avantages</span>
                  <div className="flex items-center gap-1 font-bold text-rose-600">
                    <span>2.5 / 5</span>
                    <Star className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODALE 1 : Saisie Nouvel Entretien */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50 dark:bg-amber-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-lg">
                  <DoorClosed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Saisie d'un Entretien de Sortie (Exit Interview)
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Questionnaire confidentiel mené par les Ressources Humaines
                  </p>
                </div>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInterview} className="p-5 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom du Salarié Partant *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Armand Kouadio"
                    value={newInterview.salarieNom}
                    onChange={(e) => setNewInterview({ ...newInterview, salarieNom: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Poste Occupé *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Développeur Backend"
                    value={newInterview.poste}
                    onChange={(e) => setNewInterview({ ...newInterview, poste: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Motif Principal Déclaré
                  </label>
                  <select
                    value={newInterview.motifPrincipal}
                    onChange={(e) => setNewInterview({ ...newInterview, motifPrincipal: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Opportunité Concurrente & Rémunération">Opportunité Concurrente & Rémunération</option>
                    <option value="Management Direct & Ambiance">Management Direct & Ambiance</option>
                    <option value="Équilibre Vie Pro / Vie Perso">Équilibre Vie Pro / Vie Perso & Trajet</option>
                    <option value="Reprise d'Études / Formation">Reprise d'Études / Formation</option>
                    <option value="Déménagement / Raisons Familiales">Déménagement / Raisons Familiales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nouvelle Entreprise / Destination
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Société concurrente, PME locale..."
                    value={newInterview.nouvelleDestination}
                    onChange={(e) => setNewInterview({ ...newInterview, nouvelleDestination: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Note eNPS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Score de Recommandation eNPS (de 0 à 10) : {newInterview.enpsScore} / 10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newInterview.enpsScore}
                  onChange={(e) => setNewInterview({ ...newInterview, enpsScore: e.target.value })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Verbatims */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ce que le salarié a le plus apprécié chez nous (Points Forts)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: L'esprit d'équipe, la bienveillance des collègues..."
                  value={newInterview.pointsFortsVerbatim}
                  onChange={(e) => setNewInterview({ ...newInterview, pointsFortsVerbatim: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ce qui a motivé son départ (Axes d'amélioration majeurs)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Manque de revalorisation, manque de flexibilité horaire..."
                  value={newInterview.pointsAmeliorationVerbatim}
                  onChange={(e) => setNewInterview({ ...newInterview, pointsAmeliorationVerbatim: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Qu'est-ce qui aurait pu vous retenir ?
                </label>
                <input
                  type="text"
                  placeholder="Ex: Une proposition salariale plus réactive..."
                  value={newInterview.auraitPuLeRetenir}
                  onChange={(e) => setNewInterview({ ...newInterview, auraitPuLeRetenir: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer l'Entretien</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODALE 2 : Vue détaillée & Impression */}
      {selectedInterviewForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Compte-Rendu d'Entretien de Départ : {selectedInterviewForDetail.salarieNom}
                </h3>
              </div>
              <button onClick={() => setSelectedInterviewForDetail(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-medium">Poste :</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedInterviewForDetail.poste}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Ancienneté :</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedInterviewForDetail.anciennete}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Date de sortie :</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedInterviewForDetail.dateDepart}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Entretien mené par :</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedInterviewForDetail.menePar}</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="font-bold text-amber-800 dark:text-amber-300">Motif de Départ :</span>
                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{selectedInterviewForDetail.motifPrincipal}</p>
                <p className="text-slate-500 mt-0.5">Vers : {selectedInterviewForDetail.nouvelleDestination}</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Ce qui aurait pu le retenir :</span>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200">
                  {selectedInterviewForDetail.auraitPuLeRetenir}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Points forts mentionnés :</span>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200">
                  "{selectedInterviewForDetail.pointsFortsVerbatim}"
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Axe d'amélioration / Irritant :</span>
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200">
                  "{selectedInterviewForDetail.pointsAmeliorationVerbatim}"
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setSelectedInterviewForDetail(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Fermer
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer Synthèse Entretien</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default EntretiensDepart;
