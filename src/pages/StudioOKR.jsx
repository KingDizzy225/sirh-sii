import React, { useState } from 'react';
import { 
  Target, TrendingUp, Sparkles, CheckCircle2, Clock, 
  AlertTriangle, Plus, Search, Filter, ArrowUpRight, 
  ChevronDown, ChevronRight, User, Building2, Eye, 
  Layers, Zap, BarChart2, X, RefreshCw
} from 'lucide-react';

export function StudioOKR() {
  const [selectedQuarter, setSelectedQuarter] = useState('Q3-2026');
  const [selectedPole, setSelectedPole] = useState('TOUS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSmartAssistant, setShowSmartAssistant] = useState(false);
  const [rawGoalInput, setRawGoalInput] = useState('');
  const [smartResult, setSmartResult] = useState(null);

  // Arborescence des OKRs
  const [okrs, setOkrs] = useState([
    {
      id: 1,
      titre: "Accélérer l'expansion commerciale sur le segment PME à Abidjan et San Pedro",
      pole: "Réseau Agences",
      sponsor: "Jean-Marc Koffi (Dir. Agence)",
      alignementStrategique: "Croissance Chiffre d'Affaires & Parts de Marché",
      progression: 81,
      keyResults: [
        {
          id: 101,
          titre: "Acquérir 25 nouveaux comptes PME à forte marge",
          responsable: "Julie Konan",
          poste: "Chargée de Clientèle Entreprises Senior",
          valeurCible: 25,
          valeurActuelle: 21,
          unite: "comptes",
          progression: 84,
          statut: "EN_AVANCE", // EN_AVANCE, SUR_LES_RAILS, EN_RETARD, ATTEINT
          echeance: "31 Octobre 2026",
          ponderation: "40%"
        },
        {
          id: 102,
          titre: "Atteindre 1,2 milliard FCFA d'encours de crédits PME sains",
          responsable: "Patrick Bamba",
          poste: "Chef d'Agence Adjoint (Marcory)",
          valeurCible: 1200,
          valeurActuelle: 950,
          unite: "M FCFA",
          progression: 79,
          statut: "SUR_LES_RAILS",
          echeance: "30 Novembre 2026",
          ponderation: "30%"
        },
        {
          id: 103,
          titre: "Ouvrir et rendre opérationnel le guichet entreprises de San Pedro Port",
          responsable: "Moussa Diabaté",
          poste: "Responsable Opérations San Pedro",
          valeurCible: 100,
          valeurActuelle: 100,
          unite: "%",
          progression: 100,
          statut: "ATTEINT",
          echeance: "15 Septembre 2026",
          ponderation: "30%"
        }
      ]
    },
    {
      id: 2,
      titre: "Automatiser et sécuriser à 100% la conformité paie, fiscale et sociale (CI)",
      pole: "Direction RH",
      sponsor: "Aïcha Ouattara (DRH)",
      alignementStrategique: "Excellence Opérationnelle & Maîtrise des Risques",
      progression: 87,
      keyResults: [
        {
          id: 201,
          titre: "Zéro risque de requalification tacite en CDI sur les périodes d'essai",
          responsable: "Aïcha Ouattara",
          poste: "DRH",
          valeurCible: 100,
          valeurActuelle: 100,
          unite: "%",
          progression: 100,
          statut: "ATTEINT",
          echeance: "30 Septembre 2026",
          ponderation: "50%"
        },
        {
          id: 202,
          titre: "Taux de recouvrement des cotisations formation FDFP supérieur à 80%",
          responsable: "Salimata Touré",
          poste: "Gestionnaire RH",
          valeurCible: 80,
          valeurActuelle: 72,
          unite: "%",
          progression: 74,
          statut: "SUR_LES_RAILS",
          echeance: "15 Décembre 2026",
          ponderation: "50%"
        }
      ]
    },
    {
      id: 3,
      titre: "Moderniser le Système d'Information RH & Déployer les Outils Digitaux",
      pole: "Tech & SI",
      sponsor: "Daniel Kouamé (CTO)",
      alignementStrategique: "Transformation Digitale & Expérience Salarié",
      progression: 92,
      keyResults: [
        {
          id: 301,
          titre: "Déployer le Kiosque d'attestations certifiées QR Code pour 100% des salariés",
          responsable: "Daniel Kouamé",
          poste: "CTO",
          valeurCible: 100,
          valeurActuelle: 100,
          unite: "%",
          progression: 100,
          statut: "ATTEINT",
          echeance: "20 Septembre 2026",
          ponderation: "50%"
        },
        {
          id: 302,
          titre: "Réduire le délai moyen de délivrance des documents RH de 48h à moins de 5 secondes",
          responsable: "Amadou Sanogo",
          poste: "Ingénieur Développeur",
          valeurCible: 5,
          valeurActuelle: 5,
          unite: "secondes",
          progression: 100,
          statut: "ATTEINT",
          echeance: "20 Septembre 2026",
          ponderation: "50%"
        }
      ]
    }
  ]);

  // Nouveau formulaire OKR
  const [newOkr, setNewOkr] = useState({
    titre: '',
    pole: 'Réseau Agences',
    sponsor: 'Jean-Marc Koffi',
    alignementStrategique: 'Croissance Commerciale',
    krTitre: '',
    krResponsable: 'Julie Konan',
    krCible: 20,
    krUnite: 'dossiers',
    krEcheance: '2026-11-30'
  });

  // Assistant IA SMART formulation
  const handleGenerateSmart = () => {
    if (!rawGoalInput.trim()) return;

    // Simulation d'une transformation IA intelligente en objectif SMART
    setSmartResult({
      formulationSMART: `Augmenter le portefeuille de clients PME de 25 nouveaux comptes actifs d'ici le 31 Décembre 2026`,
      criteres: {
        specifique: `Ciblage exclusif des PME ivoiriennes réalisant entre 100M et 1Md FCFA de CA sur le Grand Abidjan.`,
        mesurable: `Indicateur chiffré : 25 comptes ouverts avec premier flux bancaire constaté.`,
        atteignable: `Soutenu par la campagne marketing B2B et l'appui des directeurs d'agences.`,
        realiste: `Correspond à une cadence de 2 nouveaux comptes signés par semaine par chargé d'affaires.`,
        temporel: `Date limite d'évaluation : 31 Décembre 2026 à 18h00.`
      },
      bonusEstime: "Prime de surperformance de 250 000 FCFA si atteinte à 100%"
    });
  };

  const handleAddOkr = (e) => {
    e.preventDefault();
    if (!newOkr.titre || !newOkr.krTitre) return;

    const newObj = {
      id: Date.now(),
      titre: newOkr.titre,
      pole: newOkr.pole,
      sponsor: newOkr.sponsor,
      alignementStrategique: newOkr.alignementStrategique,
      progression: 0,
      keyResults: [
        {
          id: Date.now() + 1,
          titre: newOkr.krTitre,
          responsable: newOkr.krResponsable,
          poste: "Collaborateur Assigné",
          valeurCible: Number(newOkr.krCible),
          valeurActuelle: 0,
          unite: newOkr.krUnite,
          progression: 0,
          statut: "SUR_LES_RAILS",
          echeance: newOkr.krEcheance,
          ponderation: "100%"
        }
      ]
    };

    setOkrs([newObj, ...okrs]);
    setNewOkr({
      titre: '',
      pole: 'Réseau Agences',
      sponsor: 'Jean-Marc Koffi',
      alignementStrategique: 'Croissance Commerciale',
      krTitre: '',
      krResponsable: 'Julie Konan',
      krCible: 20,
      krUnite: 'dossiers',
      krEcheance: '2026-11-30'
    });
    setShowAddModal(false);
  };

  // KPI calculations
  const totalOkrs = okrs.length;
  const totalKrs = okrs.reduce((acc, o) => acc + o.keyResults.length, 0);
  const krsAtteints = okrs.reduce((acc, o) => acc + o.keyResults.filter(k => k.progression === 100).length, 0);
  const progressionMoyenne = Math.round(okrs.reduce((acc, o) => acc + o.progression, 0) / totalOkrs);

  // Filtrage
  const filteredOkrs = okrs.filter(o => {
    if (selectedPole === 'TOUS') return true;
    return o.pole === selectedPole;
  });

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'ATTEINT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Livré & Atteint
          </span>
        );
      case 'EN_AVANCE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <TrendingUp className="w-3 h-3" /> En Avance
          </span>
        );
      case 'SUR_LES_RAILS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="w-3 h-3" /> Sur les Rails
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <AlertTriangle className="w-3 h-3" /> En Retard
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
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Studio d'Objectifs SMART & Cascade OKR
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Alignement stratégique des équipes, formulation d'objectifs quantifiables et pilotage des Résultats Clés trimestriels
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSmartAssistant(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Formulateur SMART IA
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvel Objectif Stratégique (OKR)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alignement Stratégique
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">88%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">KRs rattachés à la vision CODIR</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Progression Globale ({selectedQuarter})
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{progressionMoyenne}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progressionMoyenne}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Résultats Clés Suivis
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalKrs}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Indicateurs de succès mesurables</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              KRs Déjà Atteints (100%)
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">{krsAtteints}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Objectifs d'impact validés</p>
        </div>
      </div>

      {/* Barre de filtres par pôle & trimestre */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Trimestre :</span>
          <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs">
            Q3 - 2026 (En cours)
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-xs cursor-pointer">
            Q4 - 2026
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPole}
            onChange={(e) => setSelectedPole(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TOUS">Tous les Départements & Pôles</option>
            <option value="Réseau Agences">Réseau Agences & Commercial</option>
            <option value="Direction RH">Direction des Ressources Humaines</option>
            <option value="Tech & SI">Tech, Systèmes & SI</option>
          </select>
        </div>
      </div>

      {/* Liste des Objectifs Stratégiques et Cascade des KRs */}
      <div className="space-y-4">
        {filteredOkrs.map((okr) => (
          <div
            key={okr.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            {/* Barre de titre de l'Objectif Entreprise */}
            <div className="p-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {okr.pole}
                  </span>
                  <span className="text-xs text-slate-500">
                    Sponsor : <strong>{okr.sponsor}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  {okr.titre}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Axe stratégique : {okr.alignementStrategique}
                </p>
              </div>

              {/* Jauge globale de complétion de l'Objectif */}
              <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 min-w-[200px]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-medium">Progression OKR</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{okr.progression}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${okr.progression}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Liste des Résultats Clés (KRs) rattachés */}
            <div className="p-5 space-y-3 bg-white dark:bg-slate-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Résultats Clés Quantifiables (KRs) & Porteurs
              </h4>

              <div className="space-y-2.5">
                {okr.keyResults.map((kr) => (
                  <div
                    key={kr.id}
                    className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-slate-50/50 dark:bg-slate-850/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {kr.titre}
                        </span>
                        {kr.responsable === 'Julie Konan' && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.2 rounded font-medium">
                            Profil Vitrine
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> <strong>{kr.responsable}</strong> ({kr.poste})
                        </span>
                        <span>• Échéance : {kr.echeance}</span>
                        <span>• Pondération : {kr.ponderation}</span>
                      </div>
                    </div>

                    {/* Données de progression et statut */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                          {kr.valeurActuelle} / {kr.valeurCible} {kr.unite}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                kr.progression === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${kr.progression}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                            {kr.progression}%
                          </span>
                        </div>
                      </div>

                      <div className="w-28 text-right">
                        {getStatusBadge(kr.statut)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Assistant Formulateur SMART IA */}
      {showSmartAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Assistant IA de Formulation SMART
              </h3>
              <button onClick={() => setShowSmartAssistant(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Saisissez votre intention brute d'objectif :
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Augmenter les clients PME à Abidjan..."
                    value={rawGoalInput}
                    onChange={(e) => setRawGoalInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleGenerateSmart}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Convertir SMART
                  </button>
                </div>
              </div>

              {smartResult && (
                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-3 animate-in fade-in">
                  <div>
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs uppercase tracking-wider block mb-1">
                      ✨ Formulation SMART Recommandée :
                    </span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-850 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900">
                      "{smartResult.formulationSMART}"
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 text-slate-700 dark:text-slate-300">
                    <p><strong>S (Spécifique) :</strong> {smartResult.criteres.specifique}</p>
                    <p><strong>M (Mesurable) :</strong> {smartResult.criteres.mesurable}</p>
                    <p><strong>A (Atteignable) :</strong> {smartResult.criteres.atteignable}</p>
                    <p><strong>R (Réaliste) :</strong> {smartResult.criteres.realiste}</p>
                    <p><strong>T (Temporel) :</strong> {smartResult.criteres.temporel}</p>
                  </div>

                  <div className="p-2.5 rounded bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {smartResult.bonusEstime}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSmartAssistant(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Fermer
                </button>
                {smartResult && (
                  <button
                    onClick={() => {
                      setNewOkr(prev => ({
                        ...prev,
                        krTitre: smartResult.formulationSMART
                      }));
                      setShowSmartAssistant(false);
                      setShowAddModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Insérer comme Résultat Clé
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvel OKR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Créer un Objectif & Résultat Clé (OKR)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOkr} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Objectif Stratégique (O)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Renforcer l'excellence opérationnelle des agences..."
                  value={newOkr.titre}
                  onChange={(e) => setNewOkr({ ...newOkr, titre: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Département / Pôle
                  </label>
                  <select
                    value={newOkr.pole}
                    onChange={(e) => setNewOkr({ ...newOkr, pole: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Réseau Agences">Réseau Agences</option>
                    <option value="Direction RH">Direction RH</option>
                    <option value="Tech & SI">Tech & SI</option>
                    <option value="Direction Financière">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sponsor Stratégique
                  </label>
                  <input
                    type="text"
                    value={newOkr.sponsor}
                    onChange={(e) => setNewOkr({ ...newOkr, sponsor: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg space-y-3 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                  Premier Résultat Clé Chiffré (KR 1) :
                </span>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description du Résultat Clé
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Convertir 20 nouveaux dossiers d'investissement..."
                    value={newOkr.krTitre}
                    onChange={(e) => setNewOkr({ ...newOkr, krTitre: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Responsable</label>
                    <select
                      value={newOkr.krResponsable}
                      onChange={(e) => setNewOkr({ ...newOkr, krResponsable: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 rounded"
                    >
                      <option value="Julie Konan">Julie Konan</option>
                      <option value="Jean-Marc Koffi">Jean-Marc Koffi</option>
                      <option value="Patrick Bamba">Patrick Bamba</option>
                      <option value="Aïcha Ouattara">Aïcha Ouattara</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Cible Chiffrée</label>
                    <input
                      type="number"
                      value={newOkr.krCible}
                      onChange={(e) => setNewOkr({ ...newOkr, krCible: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Unité</label>
                    <input
                      type="text"
                      value={newOkr.krUnite}
                      onChange={(e) => setNewOkr({ ...newOkr, krUnite: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Enregistrer l'OKR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
