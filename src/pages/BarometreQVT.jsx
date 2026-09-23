import React, { useState } from 'react';
import { 
  Smile, Frown, Meh, HeartPulse, ShieldAlert, Sparkles, 
  CheckCircle2, AlertTriangle, TrendingUp, Users, MessageSquare, 
  Plus, Send, X, ArrowUpRight, ShieldCheck, Flame, Coffee, Laptop
} from 'lucide-react';

export function BarometreQVT() {
  const [activeView, setActiveView] = useState('DASHBOARD'); // 'DASHBOARD', 'REGISTRE_RPS'
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showAddRPSModal, setShowAddRPSModal] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // Formulaire de mini sondage
  const [surveyAnswer, setSurveyAnswer] = useState({
    humeur: 'BIEN', // TRES_BIEN, BIEN, MOYEN, STRESSE
    chargeMentale: 3, // 1 to 5
    climatEquipe: 4, // 1 to 5
    commentaire: ''
  });

  // Registre des alertes et risques psychosociaux (RPS)
  const [rpsList, setRpsList] = useState([
    {
      id: 1,
      site: "San Pedro - Agence Portuaire",
      departement: "Logistique & Opérations",
      facteurRisque: "Surcharge de travail & heures sup répétées",
      intensite: "CRITIQUE",
      description: "Pic d'exportation de cacao générant plus de 15h sup/semaine par agent.",
      planAction: "Recrutement temporaire de 3 renforts intérimaires + repos récupérateur obligatoire.",
      responsable: "Moussa Diabaté (HSE)",
      echeance: "15 Octobre 2026",
      statut: "EN_COURS"
    },
    {
      id: 2,
      site: "Siège Social - Abidjan",
      departement: "Paie & Déclarations Sociales",
      facteurRisque: "Stress aigu lors des clôtures mensuelles",
      intensite: "MODERE",
      description: "Concentration des délais fiscaux (DISA CNPS et État 301) créant un goulot d'étranglement.",
      planAction: "Automatisation des imports bancaires et délégation de saisie aux agences.",
      responsable: "Aïcha Ouattara (DRH)",
      echeance: "30 Novembre 2026",
      statut: "EN_COURS"
    },
    {
      id: 3,
      site: "Agence Plateau - Abidjan",
      departement: "Front Office Commercial",
      facteurRisque: "Bruit ambiant & interruptions incessantes",
      intensite: "FAIBLE",
      description: "Volume sonore élevé dans l'open-space service clients.",
      planAction: "Installation de cloisons phoniques et fourniture de casques anti-bruit Jabra.",
      responsable: "Jean-Marc Koffi",
      echeance: "10 Septembre 2026",
      statut: "RESOLU"
    }
  ]);

  // Nouveau formulaire RPS
  const [newRps, setNewRps] = useState({
    site: "Agence Plateau - Abidjan",
    departement: "Ressources Humaines",
    facteurRisque: "",
    intensite: "MODERE",
    description: "",
    planAction: "",
    responsable: "",
    echeance: ""
  });

  const handleAddRPS = (e) => {
    e.preventDefault();
    if (!newRps.facteurRisque || !newRps.description) return;

    setRpsList([
      {
        id: Date.now(),
        ...newRps,
        statut: "EN_COURS"
      },
      ...rpsList
    ]);

    setNewRps({
      site: "Agence Plateau - Abidjan",
      departement: "Ressources Humaines",
      facteurRisque: "",
      intensite: "MODERE",
      description: "",
      planAction: "",
      responsable: "",
      echeance: ""
    });
    setShowAddRPSModal(false);
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    setSurveySubmitted(true);
    setTimeout(() => {
      setShowSurveyModal(false);
      setSurveySubmitted(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-600 text-white rounded-lg shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Baromètre QVT & Prévention des Risques Psychosociaux (RPS)
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Santé mentale, bien-être au travail, prévention de l'épuisement et dialogue social
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSurveyModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Smile className="w-4 h-4" />
            Répondre au Pulse Survey (Anonyme)
          </button>
          <button 
            onClick={() => setShowAddRPSModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            Signaler un Risque RPS
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Indice QVT Global
            </span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-lg">
              <Smile className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">78</p>
            <span className="text-sm text-slate-400 font-semibold">/ 100</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Climat général positif & dynamique</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Taux de Participation
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">86%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">122 salariés ont répondu ce mois-ci</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alertes RPS Ouvertes
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {rpsList.filter(r => r.statut === 'EN_COURS').length}
          </p>
          <p className="text-xs text-rose-500 font-medium mt-1">Plans d'action correctifs en cours d'exécution</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Actions Clôturées (2026)
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">14</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Aménagements et résolutions actées</p>
        </div>
      </div>

      {/* Les 4 Piliers QVT de l'Entreprise */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
          Performance par Pilier de Santé Organisationnelle
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-teal-600" /> Équilibre Vie Pro / Perso
              </span>
              <span className="text-xs font-extrabold text-teal-600">74 / 100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-2 rounded-full" style={{ width: '74%' }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Droit à la déconnexion respecté le week-end</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> Charge Mentale & Délais
              </span>
              <span className="text-xs font-extrabold text-amber-600">62 / 100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '62%' }} />
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-2">⚠️ Pression forte en période de fin de mois</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" /> Climat d'Équipe & Confiance
              </span>
              <span className="text-xs font-extrabold text-indigo-600">86 / 100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '86%' }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Solidarité et écoute managériale très bien notées</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-emerald-600" /> Conditions de Travail & Outils
              </span>
              <span className="text-xs font-extrabold text-emerald-600">88 / 100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '88%' }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Locaux climatisés et matériel informatique neuf</p>
          </div>
        </div>
      </div>

      {/* Thermomètre par Site / Agence */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Thermomètre de Climat par Agence & Pôle Métier
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">Agence Plateau (Siège)</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">84/100</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Climat serein
            </p>
          </div>

          <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">Agence Marcory</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">81/100</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Équilibre stable
            </p>
          </div>

          <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">Pôle Paie & Finance</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">68/100</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Charge élevée
            </p>
          </div>

          <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">Agence San Pedro Port</span>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">58/100</span>
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1 flex items-center gap-1 font-bold">
              <Flame className="w-3.5 h-3.5" /> Surchauffe signalée
            </p>
          </div>
        </div>
      </div>

      {/* Registre des Risques Psychosociaux & Plans d'Action */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Registre Officiel de Prévention des RPS & Plans d'Action
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Traçabilité légale, suivi des signalements et mesures préventives appliquées
            </p>
          </div>
          <button 
            onClick={() => setShowAddRPSModal(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Déclarer un Risque
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {rpsList.map((rps) => (
            <div key={rps.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    rps.intensite === 'CRITIQUE'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                      : rps.intensite === 'MODERE'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                  }`}>
                    Gravité : {rps.intensite}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rps.facteurRisque}</h4>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">{rps.site} ({rps.departement})</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${
                    rps.statut === 'EN_COURS'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  }`}>
                    {rps.statut === 'EN_COURS' ? '⏳ Mesures en cours' : '✅ Clôturé & Résolu'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                <strong>Constat :</strong> {rps.description}
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-xs space-y-1">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Plan d'Action Correctif :</strong> {rps.planAction}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-slate-500 pt-1 text-[11px]">
                  <span>Pilote : <strong>{rps.responsable}</strong></span>
                  <span>Échéance de validation : <strong>{rps.echeance}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Pulse Survey Express */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smile className="w-5 h-5 text-teal-600" />
                Pulse Survey Express (100% Anonyme)
              </h3>
              <button onClick={() => setShowSurveyModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {surveySubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Merci pour votre retour sincère !</h4>
                <p className="text-xs text-slate-500">Votre réponse a été enregistrée de manière strictement anonyme et alimente le baromètre QVT global.</p>
              </div>
            ) : (
              <form onSubmit={handleSurveySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Comment vous sentez-vous globalement au travail en ce moment ?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'TRES_BIEN', label: 'Très bien', icon: Smile, color: 'text-emerald-500' },
                      { key: 'BIEN', label: 'Bien', icon: Smile, color: 'text-teal-500' },
                      { key: 'MOYEN', label: 'Moyen', icon: Meh, color: 'text-amber-500' },
                      { key: 'STRESSE', label: 'Sous pression', icon: Frown, color: 'text-rose-500' }
                    ].map(h => (
                      <button
                        type="button"
                        key={h.key}
                        onClick={() => setSurveyAnswer({ ...surveyAnswer, humeur: h.key })}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1 transition ${
                          surveyAnswer.humeur === h.key
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <h.icon className={`w-5 h-5 ${h.color}`} />
                        <span className="text-[11px]">{h.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Niveau de charge de travail actuelle (1 = Paisible, 5 = Extrême)
                  </label>
                  <div className="flex items-center justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setSurveyAnswer({ ...surveyAnswer, chargeMentale: n })}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                          surveyAnswer.chargeMentale === n
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Un commentaire ou une suggestion pour améliorer la vie au travail ?
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Optionnel (vos propos sont anonymisés)..."
                    value={surveyAnswer.commentaire}
                    onChange={(e) => setSurveyAnswer({ ...surveyAnswer, commentaire: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setShowSurveyModal(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Envoyer ma réponse
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Déclarer un Risque RPS */}
      {showAddRPSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                Signaler un Risque Psychosocial (RPS)
              </h3>
              <button onClick={() => setShowAddRPSModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRPS} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Site / Agence concernée
                  </label>
                  <select 
                    value={newRps.site}
                    onChange={(e) => setNewRps({ ...newRps, site: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Agence Plateau - Abidjan">Agence Plateau (Siège)</option>
                    <option value="Agence Marcory - Abidjan">Agence Marcory</option>
                    <option value="San Pedro - Agence Portuaire">San Pedro Port</option>
                    <option value="Agence Bouaké">Agence Bouaké</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Niveau d'Intensité
                  </label>
                  <select 
                    value={newRps.intensite}
                    onChange={(e) => setNewRps({ ...newRps, intensite: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="MODERE">Modéré (Vigilance)</option>
                    <option value="CRITIQUE">Critique (Urgence santé/sécurité)</option>
                    <option value="FAIBLE">Faible (Confort/Ergonomie)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Facteur de Risque Identifié
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Surcharge d'appels clients, tension relationnelle, cadences..."
                  value={newRps.facteurRisque}
                  onChange={(e) => setNewRps({ ...newRps, facteurRisque: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description Détaillée du Constat
                </label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Détaillez la situation observée sur le terrain..."
                  value={newRps.description}
                  onChange={(e) => setNewRps({ ...newRps, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plan d'Action Correctif Recommandé
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ex: Réorganisation de plannings, médiation RH, renfort effectif..."
                  value={newRps.planAction}
                  onChange={(e) => setNewRps({ ...newRps, planAction: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pilote de l'Action
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: Responsable HSE / DRH..."
                    value={newRps.responsable}
                    onChange={(e) => setNewRps({ ...newRps, responsable: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Échéance de Réalisation
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: 31 Octobre 2026"
                    value={newRps.echeance}
                    onChange={(e) => setNewRps({ ...newRps, echeance: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowAddRPSModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Enregistrer l'Alerte au Registre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
