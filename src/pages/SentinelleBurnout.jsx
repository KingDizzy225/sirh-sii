import React, { useState } from 'react';
import {
  BrainCircuit, ShieldAlert, HeartPulse, Sparkles, CheckCircle2,
  AlertTriangle, Clock, Calendar, Users, Eye, Plus, ArrowRight,
  TrendingUp, RefreshCw, X, ChevronRight, Activity, Smile, Frown
} from 'lucide-react';

export function SentinelleBurnout() {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('TOUS');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('TOUS'); // TOUS, CRITIQUE, VIGILANCE, EQUILIBRE
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedSignalDetail, setSelectedSignalDetail] = useState(null);

  // Registre des signaux faibles de charge de travail détectés par l'IA
  const [signaux, setSignaux] = useState([
    {
      id: "SIG-2026-081",
      employeNom: "Moussa Soro",
      poste: "Responsable Infrastructure & IT",
      departement: "Infrastructure & Systèmes",
      agence: "Siège Plateau (Tour Postel 2001)",
      scorePression: 89, // sur 100
      niveauRisque: "CRITIQUE", // CRITIQUE, VIGILANCE, EQUILIBRE
      facteursDeclencheurs: [
        "4 astreintes de nuit consécutives sur les 21 derniers jours",
        "18 jours de congés payés non posés depuis plus de 9 mois",
        "Connexions tardives au VPN d'entreprise après 21h30 (6 occurrences)"
      ],
      recommandationIA: "Risque aigu de surmenage identifié. Programmer d'urgence un repos récupérateur de 48h et transférer la prochaine astreinte au technicien de back-up.",
      actionStatut: "A_TRAITER", // A_TRAITER, EN_COURS, RESOLU
      manager: "Directeur Général Adjoint",
      dateAlerte: "22/09/2026"
    },
    {
      id: "SIG-2026-080",
      employeNom: "Julie Konan",
      poste: "Chargée de Clientèle Entreprises Senior",
      departement: "Banque d'Affaires & PME",
      agence: "Siège Plateau (Tour Postel 2001)",
      scorePression: 68,
      niveauRisque: "VIGILANCE",
      facteursDeclencheurs: [
        "Plafond hebdomadaire d'heures dépassé de 12% en période de clôture",
        "Aucune pause méridienne supérieure à 30 minutes enregistrée cette semaine"
      ],
      recommandationIA: "Tension modérée liée aux clôtures trimestrielles. Recommander une délégation temporaire des dossiers administratifs pour soulager le portefeuille.",
      actionStatut: "EN_COURS",
      manager: "Jean-Marc Koffi",
      dateAlerte: "20/09/2026"
    },
    {
      id: "SIG-2026-079",
      employeNom: "Armand Kouassi",
      poste: "Comptable Fournisseurs",
      departement: "Finance & Comptabilité",
      agence: "Siège Plateau (Tour Postel 2001)",
      scorePression: 62,
      niveauRisque: "VIGILANCE",
      facteursDeclencheurs: [
        "Volume de factures à traiter en hausse de 40% sur le mois",
        "12 jours de congés en attente de planification"
      ],
      recommandationIA: "Accélérer l'automatisation des écritures pour absorber la hausse de charge et valider la pose de congés de repos.",
      actionStatut: "RESOLU",
      manager: "Directeur Administratif & Financier",
      dateAlerte: "18/09/2026"
    },
    {
      id: "SIG-2026-078",
      employeNom: "Fatou Camara",
      poste: "Responsable QVT & Relations Salariées",
      departement: "Ressources Humaines",
      agence: "Agence Cocody Ambassades",
      scorePression: 38,
      niveauRisque: "EQUILIBRE",
      facteursDeclencheurs: [
        "Respect continu des temps de repos légaux (11h consécutives)",
        "Congés régulièrement planifiés et posés par anticipation"
      ],
      recommandationIA: "Charge équilibrée. Rythme soutenable et dynamique positive.",
      actionStatut: "RESOLU",
      manager: "Dr. Stéphane Touré (DRH)",
      dateAlerte: "15/09/2026"
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResolveSignal = (id, message) => {
    setSignaux(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, actionStatut: "RESOLU" };
      }
      return s;
    }));
    showToast(message);
  };

  // Filtrage
  const filteredSignaux = signaux.filter(s => {
    const matchesDept = selectedDeptFilter === 'TOUS' || s.departement === selectedDeptFilter;
    const matchesRisk = selectedRiskFilter === 'TOUS' || s.niveauRisque === selectedRiskFilter;
    return matchesDept && matchesRisk;
  });

  // KPIs
  const indiceSérénitéGlobal = 76; // sur 100
  const totalCritiques = signaux.filter(s => s.niveauRisque === 'CRITIQUE' && s.actionStatut !== 'RESOLU').length;
  const totalVigilances = signaux.filter(s => s.niveauRisque === 'VIGILANCE' && s.actionStatut !== 'RESOLU').length;
  const actionsResolues = signaux.filter(s => s.actionStatut === 'RESOLU').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast */}
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
            <div className="p-2.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Sentinelle IA Anti-Burnout & Prévention Surcharge
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                  IA Prédictive
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Détection algorithmique des signaux faibles de fatigue, régulation des astreintes et alertes managériales bienveillantes
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => showToast("Scan prédictif des plannings et astreintes réactualisé.")}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-blue-600" />
          <span>Actualiser l'Analyse IA</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Indice Sérénité */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Indice Global de Sérénité
            </span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Smile className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{indiceSérénitéGlobal}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Équilibre général des équipes satisfaisant
          </div>
        </div>

        {/* KPI 2 : Risque Critique */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Surcharge Critique Détectée
            </span>
            <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{totalCritiques}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold ml-2">intervention requise</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Astreintes cumulées + congés non pris
          </div>
        </div>

        {/* KPI 3 : Vigilance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Zone de Vigilance
            </span>
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalVigilances}</span>
            <span className="text-xs text-slate-400 ml-2">collaborateur(s)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Tensions horaires à rééquilibrer
          </div>
        </div>

        {/* KPI 4 : Actions Résolues */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Actions Régulatrices Prises
            </span>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{actionsResolues}</span>
            <span className="text-xs text-emerald-600 font-semibold ml-2">apaisements validés</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Repos récupérateurs et congés posés
          </div>
        </div>

      </div>

      {/* Filtres & Statuts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filtrer par niveau de risque :</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setSelectedRiskFilter('TOUS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedRiskFilter === 'TOUS' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tous ({signaux.length})
            </button>
            <button
              onClick={() => setSelectedRiskFilter('CRITIQUE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedRiskFilter === 'CRITIQUE' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Critique
            </button>
            <button
              onClick={() => setSelectedRiskFilter('VIGILANCE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedRiskFilter === 'VIGILANCE' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Vigilance
            </button>
          </div>
        </div>

        <select
          value={selectedDeptFilter}
          onChange={(e) => setSelectedDeptFilter(e.target.value)}
          className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border-none font-medium"
        >
          <option value="TOUS">Tous départements</option>
          <option value="Infrastructure & Systèmes">Infrastructure & Systèmes</option>
          <option value="Banque d'Affaires & PME">Banque d'Affaires & PME</option>
          <option value="Finance & Comptabilité">Finance & Comptabilité</option>
          <option value="Ressources Humaines">Ressources Humaines</option>
        </select>
      </div>

      {/* Cartes des Alertes et Signaux Faibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSignaux.map((sig) => (
          <div
            key={sig.id}
            className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm space-y-4 transition-all flex flex-col justify-between ${
              sig.niveauRisque === 'CRITIQUE'
                ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                : sig.niveauRisque === 'VIGILANCE'
                ? 'border-amber-300 dark:border-amber-900/60'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {sig.employeNom}
                    </span>
                    <span className="text-xs text-slate-400">({sig.id})</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {sig.poste} • {sig.departement}
                  </div>
                </div>

                <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                  sig.niveauRisque === 'CRITIQUE'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : sig.niveauRisque === 'VIGILANCE'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Score Pression : {sig.scorePression}/100</span>
                </div>
              </div>

              {/* Facteurs déclencheurs */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block">
                  Signaux Faibles Analysés :
                </span>
                {sig.facteursDeclencheurs.map((facteur, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{facteur}</span>
                  </div>
                ))}
              </div>

              {/* Recommandation IA */}
              <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Préconisation de l'IA Sentinelle :</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200">
                  {sig.recommandationIA}
                </p>
              </div>
            </div>

            {/* Actions du Manager */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Alerte générée le {sig.dateAlerte}
              </span>

              {sig.actionStatut === 'RESOLU' ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Action Validée
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveSignal(sig.id, `Repos récupérateur de 48h accordé pour ${sig.employeNom}.`)}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accorder Repos 48h</span>
                  </button>
                  <button
                    onClick={() => handleResolveSignal(sig.id, `Entretien bienveillant planifié avec ${sig.employeNom}.`)}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    Entretien d'Écoute
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
export default SentinelleBurnout;
