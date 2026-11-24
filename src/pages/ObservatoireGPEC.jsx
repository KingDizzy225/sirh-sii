import React, { useState } from 'react';
import { 
  BrainCircuit, TrendingUp, Sparkles, AlertTriangle, CheckCircle2, 
  Users, Award, BookOpen, Layers, ArrowUpRight, Search, 
  Filter, ChevronRight, BarChart3, Target, ShieldCheck, Zap, X, GraduationCap
} from 'lucide-react';

export function ObservatoireGPEC() {
  const [selectedMetierId, setSelectedMetierId] = useState(1);
  const [filterEvolution, setFilterEvolution] = useState('TOUS'); // 'TOUS', 'EMERGENT', 'STABLE', 'MUTATION'
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // Cartographie prospective des familles de métiers
  const metiers = [];

  const currentMetier = metiers.find(m => m.id === selectedMetierId) || metiers[0];

  // Calculs KPI
  const totalMetiers = metiers.length;
  const metiersEmergents = metiers.filter(m => m.tendance === 'EMERGENT').length;
  const metiersMutation = metiers.filter(m => m.tendance === 'MUTATION').length;
  const ecartsCritiques = currentMetier.competences.filter(c => c.ecart >= 2).length;

  // Filtrage
  const filteredMetiers = metiers.filter(m => {
    if (filterEvolution === 'TOUS') return true;
    return m.tendance === filterEvolution;
  });

  const getTendanceBadge = (tendance) => {
    switch (tendance) {
      case 'EMERGENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <TrendingUp className="w-3.5 h-3.5" /> Métier Émergent & En Croissance
          </span>
        );
      case 'STABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <ShieldCheck className="w-3.5 h-3.5" /> Métier Pilier Stable
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Zap className="w-3.5 h-3.5" /> En Forte Mutation (Reconversion)
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 text-white rounded-lg shadow-sm">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Observatoire GPEC & Diagnostic des Écarts de Compétences
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gestion Prévisionnelle des Emplois et des Compétences, prospective métiers et plans de formation certifiants
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Simuler un Diagnostic Collaborateur
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Familles de Métiers
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalMetiers}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Référentiel cartographié de l'entreprise</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Métiers d'Avenir (Expansion)
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{metiersEmergents}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Forte demande en compétences digitales</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Métiers en Mutation
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{metiersMutation}</p>
          <p className="text-xs text-amber-500 font-medium mt-1">Passerelles de reconversion requises</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Adéquation Globale
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">79%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Compétences maîtrisées vs Cible 2027</p>
        </div>
      </div>

      {/* Interface GPEC : Sélection du métier & Diagnostic Skill Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche : Répertoire des métiers */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Postes & Familles de Métiers
              </h3>
              <select
                value={filterEvolution}
                onChange={(e) => setFilterEvolution(e.target.value)}
                className="text-xs px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300"
              >
                <option value="TOUS">Toutes tendances</option>
                <option value="EMERGENT">Émergents</option>
                <option value="STABLE">Stables</option>
                <option value="MUTATION">En mutation</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredMetiers.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedMetierId(m.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    selectedMetierId === m.id
                      ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {m.titre}
                    </span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${
                      selectedMetierId === m.id ? 'text-purple-600 rotate-90' : 'text-slate-400'
                    }`} />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.famille}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Effectif : <strong>{m.effectifActuel}</strong></span>
                    {getTendanceBadge(m.tendance)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne Droite : Radar des Écarts (Skill Gap Comparator) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            {/* Titre du Métier sélectionné */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-purple-600 dark:text-purple-400">
                    {currentMetier.famille}
                  </span>
                  <span className="text-xs text-slate-400">• Réf : <strong>{currentMetier.referentVitrine}</strong></span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {currentMetier.titre}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {currentMetier.impactIA}
                </p>
              </div>

              <div className="text-right">
                {getTendanceBadge(currentMetier.tendance)}
                <span className="text-[11px] text-slate-400 block mt-1">
                  {currentMetier.evolutionHorizon}
                </span>
              </div>
            </div>

            {/* Comparateur Visuel des Compétences */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  Diagnostic des Écarts de Compétences (Niveau Actuel vs Cible 2027)
                </h3>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Niveau Actuel (1 à 5)
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                    <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" /> Cible Requise (1 à 5)
                  </span>
                </div>
              </div>

              {/* Barres d'écart */}
              <div className="space-y-4">
                {currentMetier.competences.map((comp, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {comp.nom}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500">Actuel : <strong>{comp.niveauActuel}/5</strong></span>
                        <span className="text-slate-300">→</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold">Cible : {comp.niveauCible}/5</span>
                        {comp.alerte && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            Déficit Critique (-{comp.ecart})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Barres doubles comparatives */}
                    <div className="space-y-1">
                      {/* Barre niveau actuel */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-400 h-2 rounded-full"
                          style={{ width: `${(comp.niveauActuel / 5) * 100}%` }}
                        />
                      </div>
                      {/* Barre cible requise */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            comp.alerte ? 'bg-rose-500' : 'bg-purple-600'
                          }`}
                          style={{ width: `${(comp.niveauCible / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommandations de Formations Agréées FDFP */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                Actions d'Upskilling & Formations Prioritaires (Financement FDFP Éligible)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentMetier.formationsRecommandees.map((form, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 text-xs space-y-1"
                  >
                    <p className="font-bold text-slate-900 dark:text-white">{form.titre}</p>
                    <p className="text-slate-500 text-[11px]">{form.organisme} • Durée : {form.duree}</p>
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">{form.budget}</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Remboursable FDFP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Simulation Diagnostic */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Simulation d'Adéquation de Profil Collaborateur
              </h3>
              <button onClick={() => setShowSimulateModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Choisir le collaborateur à évaluer :
                </label>
                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
                  <option value="1">Jean-Marc Koffi (Directeur d'Agence)</option>
                  <option value="3">Armand Kouassi (Comptable Fournisseurs)</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 space-y-2">
                <p className="font-bold text-purple-900 dark:text-purple-200">
                  Résultat du diagnostic :
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Adéquation actuelle de <strong>86%</strong> avec les exigences du poste d'ici 2027.
                  Un axe de renforcement prioritaire a été détecté sur l'utilisation des <strong>assistants IA de scoring crédit</strong>.
                </p>
                <p className="text-emerald-700 dark:text-emerald-300 font-semibold pt-1">
                  ✅ Parcours recommandé : Masterclass IA & Négociation B2B (3 jours).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Fermer la Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
