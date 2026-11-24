import React, { useState } from 'react';
import { 
  ShieldCheck, Users, Calendar, FileText, CheckCircle2, 
  AlertTriangle, Clock, Plus, Printer, Download, Eye, 
  Stethoscope, Building, ChevronRight, X, AlertCircle
} from 'lucide-react';

export function ComiteCSST() {
  const [activeTab, setActiveTab] = useState('REUNIONS'); // 'REUNIONS', 'BUREAU', 'ACTIONS'
  const [showPvModal, setShowPvModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Membres du bureau paritaire CSST
  const bureauMembres = [];

  // Réunions trimestrielles statutaires
  const [reunions, setReunions] = useState([
    {
      id: 1,
      trimestre: "T1 - 2026",
      date: "15 Mars 2026",
      statut: "CLOTURE",
      ordreDuJour: "Audit des installations de sécurité incendie, issues de secours et plan d'évacuation Siège Plateau",
      presence: "6/6 membres présents",
      transmisInspection: true,
      dateTransmission: "22 Mars 2026",
      pointsCles: [
        "Remplacement des 12 extincteurs à poudre périmés de l'Agence Plateau.",
        "Exercice d'évacuation générale programmé pour fin avril 2026.",
        "Aucun accident de travail avec arrêt constaté sur le trimestre."
      ]
    },
    {
      id: 2,
      trimestre: "T2 - 2026",
      date: "18 Juin 2026",
      statut: "CLOTURE",
      ordreDuJour: "Ergonomie des postes de travail, prévention des TMS et aménagement de l'éclairage open-space",
      presence: "5/6 membres présents (Dr. Konaté excusé)",
      transmisInspection: true,
      dateTransmission: "26 Juin 2026",
      pointsCles: [
        "Achat de 25 fauteuils ergonomiques homologués pour les commerciaux.",
        "Installation de filtres anti-reflets sur les écrans du pôle relation client.",
        "Sensibilisation des équipes aux pauses visuelles recommandées par la médecine du travail."
      ]
    },
    {
      id: 3,
      trimestre: "T3 - 2026",
      date: "12 Septembre 2026",
      statut: "CLOTURE",
      ordreDuJour: "Plan de prévention canicule, maintenance des climatiseurs et qualité de l'air en agence",
      presence: "6/6 membres présents",
      transmisInspection: true,
      dateTransmission: "19 Septembre 2026",
      pointsCles: [
        "Réparation complète du groupe de climatisation de l'Agence San Pedro Port.",
        "Distribution de fontaines à eau minérale réfrigérée dans tous les guichets.",
        "Bilan du baromètre QVT présenté par le Responsable HSE (Indice 78/100)."
      ]
    },
    {
      id: 4,
      trimestre: "T4 - 2026",
      date: "20 Novembre 2026",
      statut: "PLANIFIE",
      ordreDuJour: "Bilan annuel 2026 de l'hygiène et de la sécurité, recyclage secouristes SST et budget 2027",
      presence: "Convocations en cours d'envoi",
      transmisInspection: false,
      dateTransmission: "-",
      pointsCles: [
        "Recensement des salariés volontaires pour la formation Sauveteur Secouriste du Travail (SST).",
        "Présentation du rapport annuel écrit du Médecin du Travail.",
        "Validation du programme annuel de prévention 2027."
      ]
    }
  ]);

  // Actions de prévention
  const actions = [
    {
      id: 1,
      mesure: "Formation de 8 salariés au brevet de Secourisme du Travail (SST)",
      responsable: "Moussa Diabaté (HSE)",
      echeance: "15 Octobre 2026",
      statut: "EN_COURS",
      budget: "600 000 FCFA"
    },
    {
      id: 2,
      mesure: "Installation de défibrillateurs automatisés externes (DAE) au Plateau et Marcory",
      responsable: "Jean-Marc Koffi",
      echeance: "30 Novembre 2026",
      statut: "EN_COURS",
      budget: "2 200 000 FCFA"
    },
    {
      id: 3,
      mesure: "Contrôle technique périodique des installations électriques par la SICTA",
      responsable: "Moussa Diabaté (HSE)",
      echeance: "10 Août 2026",
      statut: "REALISE",
      budget: "450 000 FCFA"
    }
  ];

  const handleOpenPv = (meeting) => {
    setSelectedMeeting(meeting);
    setShowPvModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-700 text-white rounded-lg shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Comité Santé, Sécurité & Conditions de Travail (CSST)
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Instance légale paritaire obligatoire (Entreprises 50+ salariés) • Réunions trimestrielles et PV Inspection du Travail
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Conformité Légale Statutaire (Arrêté CI)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sessions Trimestrielles 2026
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">3 / 4</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Obligation légale de 4 réunions/an respectée</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bureau Paritaire
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{bureauMembres.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Membres mandatés (Direction & Délégués)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PV Transmis à l'Inspection
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">100%</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Transmissions sous 15 jours légaux</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Prochaine Réunion
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">20 Nov. 2026</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Session T4 - Bilan Annuel Sécurité</p>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('REUNIONS')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
            activeTab === 'REUNIONS'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Sessions Trimestrielles & Procès-Verbaux
        </button>

        <button
          onClick={() => setActiveTab('BUREAU')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
            activeTab === 'BUREAU'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Composition du Bureau Paritaire CSST
        </button>

        <button
          onClick={() => setActiveTab('ACTIONS')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
            activeTab === 'ACTIONS'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Plan d'Actions de Prévention des Risques
        </button>
      </div>

      {/* ONGLET 1 : REUNIONS & PVS */}
      {activeTab === 'REUNIONS' && (
        <div className="space-y-4">
          {reunions.map((r) => {
            const isCloture = r.statut === 'CLOTURE';

            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Session {r.trimestre}
                      </span>
                      <span className="text-xs text-slate-500">Date : <strong>{r.date}</strong></span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {r.ordreDuJour}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCloture ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PV Validé & Transmis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Session à venir
                      </span>
                    )}
                  </div>
                </div>

                {/* Points débattus & PV */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-400 block">
                    Délibérations & Décisions du Comité :
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
                    {r.pointsCles.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-slate-500">
                    Présence : <strong>{r.presence}</strong> • Transmission Inspection : {r.transmisInspection ? `Transmis le ${r.dateTransmission}` : 'En attente'}
                  </div>

                  <button
                    onClick={() => handleOpenPv(r)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition self-end sm:self-auto"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Consulter / Imprimer le PV Officiel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ONGLET 2 : BUREAU PARITAIRE */}
      {activeTab === 'BUREAU' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bureauMembres.map((m, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    {m.roleCSST}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                    {m.nom}
                  </h4>
                  <p className="text-xs text-slate-500">{m.poste}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  Collège : {m.college}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
                <span>Contact d'urgence : <strong>{m.contact}</strong></span>
                <span className="text-emerald-600 font-medium">Mandat Actif (2025-2027)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ONGLET 3 : PLAN D'ACTIONS PREVENTIVES */}
      {activeTab === 'ACTIONS' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Plan Annuel de Prévention des Risques Professionnels (Validé en CSST)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Traçabilité des investissements et aménagements de sécurité exigés par le comité
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {actions.map((act) => (
              <div key={act.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{act.mesure}</p>
                  <p className="text-slate-500">
                    Pilote désigné : <strong>{act.responsable}</strong> • Échéance : {act.echeance}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    Budget : {act.budget}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                    act.statut === 'REALISE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {act.statut === 'REALISE' ? '✅ Réalisé' : '⏳ En cours'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Consultation / Impression PV CSST */}
      {showPvModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Procès-Verbal Officiel de Réunion Trimestrielle CSST
                </h3>
              </div>
              <button onClick={() => setShowPvModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 font-serif text-xs space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-3 font-sans">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">SOCIÉTÉ IVOIRIENNE D'INVESTISSEMENT (SII CI)</p>
                  <p className="text-[10px] text-slate-500">Comité Santé, Sécurité & Conditions de Travail (CSST)</p>
                </div>
                <p className="text-[11px] text-slate-500">Date : {selectedMeeting.date}</p>
              </div>

              <div className="text-center font-sans py-1">
                <h4 className="font-black text-sm uppercase underline text-slate-900 dark:text-white">
                  PROCÈS-VERBAL DE RÉUNION STATUTAIRE DU {selectedMeeting.trimestre.toUpperCase()}
                </h4>
              </div>

              <div className="font-sans space-y-1">
                <p><strong>Ordre du jour :</strong> {selectedMeeting.ordreDuJour}</p>
                <p><strong>Membres présents :</strong> {selectedMeeting.presence}</p>
              </div>

              <div className="space-y-2 pt-2">
                <p className="font-sans font-bold uppercase text-[11px] text-slate-500">Délibérations & Décisions de la Séance :</p>
                <ul className="list-disc list-inside space-y-1 leading-relaxed">
                  {selectedMeeting.pointsCles.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-end pt-6 font-sans text-xs border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold">Le Secrétaire du CSST :</p>
                  <p className="text-slate-500 text-[11px]">Patrick Bamba (Délégué)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Le Président du CSST :</p>
                  <p className="text-slate-500 text-[11px]">Jean-Marc Koffi (Employeur)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Imprimer le PV Réglementaire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
