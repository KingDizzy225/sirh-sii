import React, { useState } from 'react';
import { 
  Users, Award, ShieldAlert, AlertTriangle, CheckCircle2, 
  Clock, Plus, Search, Filter, ArrowUpRight, UserCheck, 
  Building2, Briefcase, FileSpreadsheet, Eye, X, ChevronRight,
  TrendingUp, Sparkles, AlertCircle
} from 'lucide-react';

export function PlanSuccession() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('TOUS');
  const [riskFilter, setRiskFilter] = useState('TOUS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState(null);

  const [postes, setPostes] = useState([
    {
      id: 1,
      titre: "Directeur d'Agence Principale (Plateau)",
      departement: "Réseau Agences",
      titulaire: "Jean-Marc Koffi",
      matricule: "EMP-0012",
      titulaireAnciennete: "7 ans",
      risqueDepart: "Moyen",
      motifRisque: "Départ à la retraite prévu d'ici 24 mois",
      criticite: "CRITIQUE",
      tauxCouverture: "100%",
      successeurs: [
        {
          id: 101,
          nom: "Julie Konan",
          posteActuel: "Chargée de Clientèle Entreprises Senior",
          maturite: "IMMEDIAT", // IMMEDIAT, MOYEN_TERME, LONG_TERME
          adequation: 92,
          actionsDev: "Formation Leadership FDFP complétée, Shadowing CODIR en cours",
          recommandePar: "Jean-Marc Koffi"
        },
        {
          id: 102,
          nom: "Patrick Bamba",
          posteActuel: "Responsable d'Agence Adjoint (Marcory)",
          maturite: "MOYEN_TERME",
          adequation: 80,
          actionsDev: "Plan de renforcement en gestion budgétaire & risques crédit",
          recommandePar: "DRH"
        }
      ]
    },
    {
      id: 2,
      titre: "Responsable Paie & Fiscalité Sociale (CI)",
      departement: "Direction des Ressources Humaines",
      titulaire: "Aïcha Ouattara",
      matricule: "EMP-0034",
      titulaireAnciennete: "4 ans",
      risqueDepart: "Élevé",
      motifRisque: "Forte sollicitation marché / chasse de têtes cabinets d'audit",
      criticite: "CRITIQUE",
      tauxCouverture: "50%",
      successeurs: [
        {
          id: 201,
          nom: "Salimata Touré",
          posteActuel: "Gestionnaire RH & Administration du Personnel",
          maturite: "MOYEN_TERME",
          adequation: 74,
          actionsDev: "Certification paie Sage & fiscalité ivoirienne requise (État 301, DISA)",
          recommandePar: "Aïcha Ouattara"
        }
      ]
    },
    {
      id: 3,
      titre: "Chief Technology Officer / Architecte SI",
      departement: "Systèmes d'Information & Tech",
      titulaire: "Daniel Kouamé",
      matricule: "EMP-0008",
      titulaireAnciennete: "5 ans",
      risqueDepart: "Élevé",
      motifRisque: "Projet de création d'entreprise à moyen terme",
      criticite: "CRITIQUE",
      tauxCouverture: "0%",
      successeurs: []
    },
    {
      id: 4,
      titre: "Responsable HSE & Sécurité Industrielle",
      departement: "Opérations & Logistique",
      titulaire: "Moussa Diabaté",
      matricule: "EMP-0045",
      titulaireAnciennete: "6 ans",
      risqueDepart: "Faible",
      motifRisque: "Fidélisé, engagement fort",
      criticite: "MODÉRÉ",
      tauxCouverture: "100%",
      successeurs: [
        {
          id: 401,
          nom: "Fatou N'Dri",
          posteActuel: "Chargée de Conformité HSE",
          maturite: "IMMEDIAT",
          adequation: 95,
          actionsDev: "Habilitation d'audit tierce partie ISO 45001 validée",
          recommandePar: "Directeur des Opérations"
        }
      ]
    },
    {
      id: 5,
      titre: "Contrôleur de Gestion Opérationnel",
      departement: "Direction Financière",
      titulaire: "Christian Koffi",
      matricule: "EMP-0056",
      titulaireAnciennete: "3 ans",
      risqueDepart: "Moyen",
      motifRisque: "Opportunité de mobilité interne sous-régionale",
      criticite: "ÉLEVÉ",
      tauxCouverture: "100%",
      successeurs: [
        {
          id: 501,
          nom: "Armand Kouassi",
          posteActuel: "Comptable Fournisseurs Senior",
          maturite: "MOYEN_TERME",
          adequation: 82,
          actionsDev: "Programme de mentoring avec le DAF",
          recommandePar: "Christian Koffi"
        }
      ]
    }
  ]);

  // Modal new successor form state
  const [newSuccessor, setNewSuccessor] = useState({
    posteId: 1,
    nom: '',
    posteActuel: '',
    maturite: 'IMMEDIAT',
    adequation: 85,
    actionsDev: '',
    recommandePar: ''
  });

  const handleAddSuccessor = (e) => {
    e.preventDefault();
    if (!newSuccessor.nom || !newSuccessor.posteActuel) return;

    setPostes(postes.map(p => {
      if (p.id === Number(newSuccessor.posteId)) {
        const updated = [
          ...p.successeurs,
          {
            id: Date.now(),
            nom: newSuccessor.nom,
            posteActuel: newSuccessor.posteActuel,
            maturite: newSuccessor.maturite,
            adequation: Number(newSuccessor.adequation),
            actionsDev: newSuccessor.actionsDev || "Plan de développement à formaliser",
            recommandePar: newSuccessor.recommandePar || "Direction"
          }
        ];
        return {
          ...p,
          successeurs: updated,
          tauxCouverture: updated.length > 0 ? "100%" : "0%"
        };
      }
      return p;
    }));

    setNewSuccessor({
      posteId: 1,
      nom: '',
      posteActuel: '',
      maturite: 'IMMEDIAT',
      adequation: 85,
      actionsDev: '',
      recommandePar: ''
    });
    setShowAddModal(false);
  };

  // Metrics
  const totalPostes = postes.length;
  const postesSansRelève = postes.filter(p => p.successeurs.length === 0).length;
  const totalSuccesseurs = postes.reduce((acc, p) => acc + p.successeurs.length, 0);
  const tauxCouvertureGlobal = Math.round(((totalPostes - postesSansRelève) / totalPostes) * 100);

  // Filters
  const filteredPostes = postes.filter(p => {
    const matchSearch = p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.titulaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.departement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = departmentFilter === 'TOUS' || p.departement === departmentFilter;
    const matchRisk = riskFilter === 'TOUS' || 
                      (riskFilter === 'SANS_RELEVE' && p.successeurs.length === 0) ||
                      (riskFilter === 'COUV' && p.successeurs.length > 0) ||
                      p.criticite === riskFilter;
    return matchSearch && matchDept && matchRisk;
  });

  const getMaturityBadge = (maturite) => {
    switch (maturite) {
      case 'IMMEDIAT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Prêt Immédiatement (0-6 mois)
          </span>
        );
      case 'MOYEN_TERME':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" /> Prêt à 1-2 ans
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <TrendingUp className="w-3.5 h-3.5" /> Potentiel (3 ans+)
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
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Plan de Succession & Postes Critiques
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gouvernance d'entreprise, continuité d'activité et vivier de relève des talents (Talent Pipeline)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Rapport CODIR & Synthèse
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Successeur
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Postes Clés Recensés
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalPostes}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fonctions stratégiques de l'entreprise</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Taux de Couverture
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{tauxCouvertureGlobal}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${tauxCouvertureGlobal}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Postes Sans Relève Immédiate
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{postesSansRelève}</p>
          <p className="text-xs text-rose-500 font-medium mt-1">Risque opérationnel majeur en cas de départ</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Talents Vivier de Relève
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalSuccesseurs}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Collaborateurs identifiés en préparation</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un poste, titulaire ou département..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TOUS">Tous les Départements</option>
            <option value="Réseau Agences">Réseau Agences</option>
            <option value="Direction des Ressources Humaines">Direction RH</option>
            <option value="Systèmes d'Information & Tech">Tech & SI</option>
            <option value="Direction Financière">Finance</option>
            <option value="Opérations & Logistique">Opérations & HSE</option>
          </select>

          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TOUS">Tous les Niveaux de Couverture</option>
            <option value="SANS_RELEVE">⚠️ Postes Sans Relève (0%)</option>
            <option value="COUV">✅ Postes Couverts</option>
            <option value="CRITIQUE">Criticité : Critique</option>
            <option value="ÉLEVÉ">Criticité : Élevée</option>
          </select>
        </div>
      </div>

      {/* Cartes des postes et de leurs successeurs */}
      <div className="space-y-4">
        {filteredPostes.map((poste) => {
          const isSansReleve = poste.successeurs.length === 0;

          return (
            <div 
              key={poste.id} 
              className={`bg-white dark:bg-slate-900 rounded-xl border transition shadow-sm overflow-hidden ${
                isSansReleve 
                  ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-900/40' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Entête du poste critique */}
              <div className="p-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {poste.departement}
                    </span>
                    {poste.criticite === 'CRITIQUE' ? (
                      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        Poste Hautement Critique
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Poste Stratégique
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {poste.titre}
                  </h3>
                </div>

                {/* Infos Titulaire Actuel */}
                <div className="flex flex-wrap items-center gap-6 text-sm bg-white dark:bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Titulaire Actuel</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{poste.titulaire}</span>
                    <span className="text-xs text-slate-500 ml-1.5">({poste.titulaireAnciennete})</span>
                  </div>
                  <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                    <span className="text-xs text-slate-400 block font-medium">Risque Départ</span>
                    <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                      poste.risqueDepart === 'Élevé' 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' 
                        : poste.risqueDepart === 'Moyen'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    }`}>
                      {poste.risqueDepart}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contexte & Alerte risque */}
              <div className="px-5 py-2.5 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span><strong className="text-slate-700 dark:text-slate-300">Analyse de vulnérabilité :</strong> {poste.motifRisque}</span>
              </div>

              {/* Section Successeurs Identifiés */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    Successeurs Identifiés ({poste.successeurs.length})
                  </h4>
                  <button 
                    onClick={() => {
                      setNewSuccessor(prev => ({ ...prev, posteId: poste.id }));
                      setShowAddModal(true);
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Proposer un successeur pour ce poste
                  </button>
                </div>

                {isSansReleve ? (
                  <div className="p-4 rounded-lg bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                        Aucun successeur qualifié n'a été rattaché à ce poste critique
                      </p>
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                        Action requise : lancer un sourcing de talents internes ou prévoir une clause de doublonnement externe d'ici le prochain trimestre.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {poste.successeurs.map((succ) => (
                      <div 
                        key={succ.id}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                              {succ.nom}
                              {succ.nom === "Julie Konan" && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.2 rounded font-medium">
                                  Top Talent
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{succ.posteActuel}</p>
                          </div>
                          {getMaturityBadge(succ.maturite)}
                        </div>

                        {/* Barre d'adéquation compétences */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500 dark:text-slate-400">Indice d'adéquation :</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{succ.adequation}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${
                                succ.adequation >= 90 ? 'bg-emerald-500' : succ.adequation >= 75 ? 'bg-indigo-500' : 'bg-amber-500'
                              }`} 
                              style={{ width: `${succ.adequation}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <p className="text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Plan d'action :</span> {succ.actionsDev}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Recommandé par : <span className="font-medium text-slate-600 dark:text-slate-400">{succ.recommandePar}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Ajout Successeur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Rattacher un Successeur à un Poste Clé
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSuccessor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Poste Stratégique Cible
                </label>
                <select 
                  value={newSuccessor.posteId}
                  onChange={(e) => setNewSuccessor({ ...newSuccessor, posteId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {postes.map(p => (
                    <option key={p.id} value={p.id}>{p.titre} (Titulaire: {p.titulaire})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom du Collaborateur Éligible
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Julie Konan, Kouamé N'Guessan..."
                  value={newSuccessor.nom}
                  onChange={(e) => setNewSuccessor({ ...newSuccessor, nom: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Poste Actuel du Collaborateur
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Chargé de Mission, Responsable Adjoint..."
                  value={newSuccessor.posteActuel}
                  onChange={(e) => setNewSuccessor({ ...newSuccessor, posteActuel: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Maturité / Disponibilité
                  </label>
                  <select 
                    value={newSuccessor.maturite}
                    onChange={(e) => setNewSuccessor({ ...newSuccessor, maturite: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="IMMEDIAT">Prêt Immédiatement (0-6 mois)</option>
                    <option value="MOYEN_TERME">Prêt à 1-2 ans</option>
                    <option value="LONG_TERME">Potentiel (3 ans+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Adéquation Estimée (%)
                  </label>
                  <input 
                    type="number"
                    min="40"
                    max="100"
                    value={newSuccessor.adequation}
                    onChange={(e) => setNewSuccessor({ ...newSuccessor, adequation: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Actions de Développement Recommandées
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ex: Shadowing direction, formation leadership FDFP, délégation de signature..."
                  value={newSuccessor.actionsDev}
                  onChange={(e) => setNewSuccessor({ ...newSuccessor, actionsDev: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recommandé par
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Manager N+1, DRH, Titulaire du poste..."
                  value={newSuccessor.recommandePar}
                  onChange={(e) => setNewSuccessor({ ...newSuccessor, recommandePar: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Enregistrer dans le Vivier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rapport CODIR Synthèse */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Synthèse de Continuité Opérationnelle - CODIR
                </h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p><strong>Société :</strong> Société Ivoirienne d'Investissement (SII Côte d'Ivoire)</p>
              <p><strong>Périmètre :</strong> Ensemble des Postes de Direction, d'Agence et Fonctions Clés</p>
              <p><strong>Date d'audit :</strong> {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Synthèse d'Exposition aux Risques :</h4>
              <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {totalPostes - postesSansRelève} postes sur {totalPostes} bénéficient d'un successeur identifié.
                </li>
                <li className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> Attention critique sur le poste de CTO / Architecte SI : absence totale de doublure interne prête.
                </li>
                <li className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                  <Sparkles className="w-4 h-4 shrink-0" /> Profil à fort potentiel validé : Julie Konan identifiée pour la succession de la Direction d'Agence Plateau (Adéquation 92%).
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm inline-flex items-center gap-2"
              >
                Imprimer le Rapport Officiel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
