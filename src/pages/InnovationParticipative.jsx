import React, { useState } from 'react';
import {
  Lightbulb, Sparkles, ThumbsUp, MessageSquare, Award,
  CheckCircle2, Clock, Filter, Plus, Search, Eye, X,
  TrendingUp, Coins, Rocket, ShieldCheck, Flame, Tag,
  FileCheck, Users
} from 'lucide-react';

export function InnovationParticipative() {
  const [activeTab, setActiveTab] = useState('toutes'); // 'toutes', 'pilotes', 'recompensees'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TOUS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIdeaForDetail, setSelectedIdeaForDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Registre des idées soumises
  const [idees, setIdees] = useState([
    {
      id: "IDEA-2026-024",
      titre: "Automatisation de la Réconciliation Bancaire par Script IA",
      auteur: "Armand Kouassi",
      auteurPoste: "Comptable Fournisseurs",
      auteurAgence: "Siège Plateau",
      categorie: "Efficacité & Économie de Coûts",
      description: "Remplacement du rapprochement manuel des relevés bancaires SGBCI et Ecobank par un script OCR automatisé analysant les bordereaux en quelques secondes.",
      impactEstime: "Gain de 18 heures de travail par mois et 0% d'erreur de saisie.",
      economieEstimee: "4 200 000 FCFA / an",
      votes: 42,
      aVote: true,
      commentairesNb: 8,
      statut: "EN_COURS_DEPLOIEMENT", // SOUMISE, A_L_ETUDE, PILOTE_APPROUVE, EN_COURS_DEPLOIEMENT, RECOMPENSEE
      primeVersee: "350 000 FCFA",
      dateSoumission: "02/09/2026",
      comiteAvis: "Projet validé à l'unanimité par la DAF et la Direction Générale. Déploiement en cours."
    },
    {
      id: "IDEA-2026-023",
      titre: "Installation de Fontaines d'Eau Micro-filtrée & Élimination du Plastique à Usage Unique",
      auteur: "Fatou Camara",
      auteurPoste: "Responsable QVT",
      auteurAgence: "Siège Plateau & Cocody",
      categorie: "RSE & Environnement",
      description: "Remplacement des bonbonnes plastiques jetables par des fontaines raccordées au réseau SODECI avec système de micro-filtration UV et gourdes isothermes SII offertes aux salariés.",
      impactEstime: "Suppression de 1 200 bouteilles plastiques par mois et réduction de l'empreinte carbone.",
      economieEstimee: "1 800 000 FCFA / an",
      votes: 38,
      aVote: false,
      commentairesNb: 12,
      statut: "PILOTE_APPROUVE",
      primeVersee: "150 000 FCFA",
      dateSoumission: "18/08/2026",
      comiteAvis: "Approuvé par le CSST. Phase test initiée à l'agence Cocody."
    },
    {
      id: "IDEA-2026-022",
      titre: "Algorithme d'Optimisation des Itinéraires de Déplacement Flotte (Éco-Conduite)",
      auteur: "Kouamé N'Dri",
      auteurPoste: "Chauffeur de Direction",
      auteurAgence: "Siège Plateau",
      categorie: "Logistique & Carburant",
      description: "Utilisation d'une application d'agrégation de trafic pour éviter les zones d'embouteillages saturées d'Abidjan (Pont de Gaulle, VGE) lors des courses de plis et transports de collaborateurs.",
      impactEstime: "Baisse de 15% de la facture mensuelle carburant TotalEnergies.",
      economieEstimee: "2 600 000 FCFA / an",
      votes: 29,
      aVote: false,
      commentairesNb: 5,
      statut: "RECOMPENSEE",
      primeVersee: "250 000 FCFA",
      dateSoumission: "10/07/2026",
      comiteAvis: "Idée adoptée à 100%. Prime versée sur la paie d'août 2026."
    },
    {
      id: "IDEA-2026-021",
      titre: "Module de Pointage Mobile par Géorepérage pour Équipes Déportées",
      auteur: "Mamadou Bakayoko",
      auteurPoste: "Technicien Réseaux",
      auteurAgence: "Hub Zone 4 Marcory",
      categorie: "Tech & Digitalisation",
      description: "Permettre aux techniciens en intervention client d'émarger leur arrivée sur site client via une balise GPS sécurisée sans avoir à repasser par l'agence.",
      impactEstime: "Gain de 45 minutes par jour sur les tournées techniques.",
      economieEstimee: "Gain d'efficacité opérationnelle",
      votes: 35,
      aVote: true,
      commentairesNb: 6,
      statut: "A_L_ETUDE",
      primeVersee: "À déterminer",
      dateSoumission: "12/09/2026",
      comiteAvis: "À l'étude par le responsable informatique pour vérifier la conformité avec l'ARTCI."
    }
  ]);

  // Formulaire d'ajout
  const [newIdea, setNewIdea] = useState({
    titre: '',
    categorie: 'Efficacité & Économie de Coûts',
    description: '',
    impactEstime: '',
    economieEstimee: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle vote
  const handleVote = (id) => {
    setIdees(prev => prev.map(item => {
      if (item.id === id) {
        const nextVote = !item.aVote;
        return {
          ...item,
          aVote: nextVote,
          votes: nextVote ? item.votes + 1 : item.votes - 1
        };
      }
      return item;
    }));
  };

  // Filtrage
  const filteredIdees = idees.filter(idea => {
    const matchesSearch = 
      idea.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.auteur.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = categoryFilter === 'TOUS' || idea.categorie === categoryFilter;
    
    if (activeTab === 'pilotes') return matchesSearch && matchesCat && (idea.statut === 'PILOTE_APPROUVE' || idea.statut === 'EN_COURS_DEPLOIEMENT');
    if (activeTab === 'recompensees') return matchesSearch && matchesCat && idea.statut === 'RECOMPENSEE';
    return matchesSearch && matchesCat;
  });

  // KPI
  const totalIdees = idees.length;
  const ideesRetenues = idees.filter(i => i.statut !== 'SOUMISE' && i.statut !== 'A_L_ETUDE').length;
  const totalPrimes = "750 000 FCFA";
  const totalEconomies = "8 600 000 FCFA";

  const handleCreateIdea = (e) => {
    e.preventDefault();
    if (!newIdea.titre || !newIdea.description) {
      alert("Veuillez renseigner au minimum un titre et une description.");
      return;
    }

    const created = {
      id: `IDEA-2026-0${idees.length + 1}`,
      titre: newIdea.titre,
      auteur: "Julie Konan",
      auteurPoste: "Chargée de Clientèle Senior",
      auteurAgence: "Siège Plateau",
      categorie: newIdea.categorie,
      description: newIdea.description,
      impactEstime: newIdea.impactEstime || "Amélioration continue de nos processus.",
      economieEstimee: newIdea.economieEstimee || "Gain de temps et satisfaction accrue",
      votes: 1,
      aVote: true,
      commentairesNb: 0,
      statut: "SOUMISE",
      primeVersee: "En cours d'évaluation",
      dateSoumission: "23/09/2026",
      comiteAvis: "Idée fraîchement soumise. En attente de revue par le Comité d'Innovation."
    };

    setIdees([created, ...idees]);
    setShowAddModal(false);
    setNewIdea({
      titre: '',
      categorie: 'Efficacité & Économie de Coûts',
      description: '',
      impactEstime: '',
      economieEstimee: ''
    });
    showToast(`Votre idée "${created.titre}" a été soumise avec succès au Comité d'Innovation !`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast Alert */}
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
              <Lightbulb className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Boîte à Idées 2.0 & Innovation Participative
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                  Primes & Brevets
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Proposez vos idées d'amélioration, votez pour les meilleures innovations et recevez des primes de gratification
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Proposer une Idée</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Idées retenues */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Projets Retenus & Déployés
            </span>
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Rocket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{ideesRetenues}</span>
            <span className="text-xs text-slate-400 ml-2">innovations en cours</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Sur {totalIdees} propositions soumises
          </div>
        </div>

        {/* KPI 2 : Économies générées */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Économies Annuelles Générées
            </span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalEconomies}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Gains d'efficacité et réduction de gaspillage
          </div>
        </div>

        {/* KPI 3 : Primes versées */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Primes d'Innovation Versées
            </span>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalPrimes}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Récompenses directes versées sur bulletin de paie
          </div>
        </div>

        {/* KPI 4 : Taux de Participation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Participation Collaborative
            </span>
            <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">144</span>
            <span className="text-xs text-slate-400 ml-2">votes exprimés</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Émulation positive entre agences
          </div>
        </div>

      </div>

      {/* Onglets */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('toutes')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'toutes'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Toutes les Idées ({idees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pilotes')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pilotes'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Projets Pilotes & Déploiements ({idees.filter(i => i.statut === 'PILOTE_APPROUVE' || i.statut === 'EN_COURS_DEPLOIEMENT').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recompensees')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'recompensees'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Innovations Récompensées ({idees.filter(i => i.statut === 'RECOMPENSEE').length})</span>
        </button>
      </div>

      {/* Recherche & Filtre Catégorie */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une idée, un auteur, une innovation..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border-none font-medium"
        >
          <option value="TOUS">Toutes les catégories</option>
          <option value="Efficacité & Économie de Coûts">Efficacité & Économie de Coûts</option>
          <option value="RSE & Environnement">RSE & Environnement</option>
          <option value="Logistique & Carburant">Logistique & Carburant</option>
          <option value="Tech & Digitalisation">Tech & Digitalisation</option>
        </select>
      </div>

      {/* Cartes des Idées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdees.map((idea) => (
          <div
            key={idea.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {idea.categorie}
                </span>

                {/* Badge Statut */}
                {idea.statut === 'RECOMPENSEE' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Prime : {idea.primeVersee}
                  </span>
                )}
                {idea.statut === 'EN_COURS_DEPLOIEMENT' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Déploiement en cours
                  </span>
                )}
                {idea.statut === 'PILOTE_APPROUVE' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    Projet Pilote
                  </span>
                )}
                {idea.statut === 'A_L_ETUDE' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    À l'étude
                  </span>
                )}
                {idea.statut === 'SOUMISE' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Nouvelle idée
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {idea.titre}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                  {idea.description}
                </p>
              </div>

              {/* Impact chiffré */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Impact estimé :</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{idea.impactEstime}</span>
                </div>
                {idea.economieEstimee && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Économie budgétaire :</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{idea.economieEstimee}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pied de carte avec votes et auteur */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">{idea.auteur}</span>
                <span className="text-slate-400 block text-[11px]">{idea.auteurPoste} ({idea.auteurAgence})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIdeaForDetail(idea)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100"
                  title="Voir les détails"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Bouton de vote Upvote */}
                <button
                  onClick={() => handleVote(idea.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    idea.aVote
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/60'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${idea.aVote ? 'fill-white' : ''}`} />
                  <span>{idea.votes}</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODALE 1 : Proposer une Idée */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50 dark:bg-amber-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-lg">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Proposer une Idée d'Innovation
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Chaque idée retenue ouvre droit à une prime d'innovation
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titre de l'Idée (Court et percutant) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mise en place d'un système de navette inter-agences..."
                  value={newIdea.titre}
                  onChange={(e) => setNewIdea({ ...newIdea, titre: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={newIdea.categorie}
                  onChange={(e) => setNewIdea({ ...newIdea, categorie: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Efficacité & Économie de Coûts">Efficacité & Économie de Coûts</option>
                  <option value="RSE & Environnement">RSE & Environnement</option>
                  <option value="Logistique & Carburant">Logistique & Carburant</option>
                  <option value="Tech & Digitalisation">Tech & Digitalisation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description du Problème & de la Solution Proposée *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Expliquez concrètement en quoi consiste votre idée et comment elle peut être mise en œuvre..."
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Impact Estimé (Gain de temps, confort, productivité)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Économie de 2h par semaine pour chaque collaborateur"
                  value={newIdea.impactEstime}
                  onChange={(e) => setNewIdea({ ...newIdea, impactEstime: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Soumettre l'Idée</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE 2 : Vue détaillée & Avis du Comité */}
      {selectedIdeaForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Détail de l'Innovation : {selectedIdeaForDetail.id}
                </h3>
              </div>
              <button onClick={() => setSelectedIdeaForDetail(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  {selectedIdeaForDetail.categorie}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedIdeaForDetail.titre}
                </h3>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-700 dark:text-slate-300">
                {selectedIdeaForDetail.description}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-400">Auteur :</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{selectedIdeaForDetail.auteur}</div>
                </div>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-400">Date de dépôt :</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{selectedIdeaForDetail.dateSoumission}</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <Award className="w-4 h-4" />
                  <span>Avis du Comité d'Innovation & Direction :</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200">{selectedIdeaForDetail.comiteAvis}</p>
                <div className="pt-1 font-semibold text-emerald-600">
                  Prime : {selectedIdeaForDetail.primeVersee}
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setSelectedIdeaForDetail(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Fermer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default InnovationParticipative;
