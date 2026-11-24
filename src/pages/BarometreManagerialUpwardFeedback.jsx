import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  MessageSquare, 
  TrendingUp, 
  Star, 
  Lock,
  Eye,
  Send,
  Info
} from 'lucide-react';

// BAROMÈTRE MANAGÉRIAL & UPWARD FEEDBACK (Évaluation des Managers par leurs Équipes)
// Règle d'anonymat stricte : Minimum 5 répondants requis pour afficher les résultats d'un manager.
// 6 dimensions évaluées sur 100 -> Indice de Leadership Managérial (MLI / 100).

const MOCK_MANAGERS_FEEDBACK = [
  {
    id: 'MGR-01',
    name: 'Koné Mariam',
    poste: 'Directrice Commerciale Réseau',
    agence: 'Siège Social Plateau',
    repondants: 14,
    effectifEquipe: 16,
    mliScore: 88,
    statut: 'EXCELLENCE', // 'EXCELLENCE' | 'EQUILIBRE' | 'VIGILANCE'
    scores: {
      clarte: 91,
      equite: 89,
      feedback: 86,
      soutien: 90,
      reconnaissance: 85,
      developpement: 87
    },
    verbatimsAnonymes: [
      'Toujours disponible pour débloquer les dossiers clients complexes.',
      'Les objectifs trimestriels sont clairs et discutés en toute transparence.'
    ],
    planCoaching: 'Ambassadrice interne du programme Académie Néo-Manager.'
  },
  {
    id: 'MGR-02',
    name: 'Koffi Armand',
    poste: 'Chef d\'Agence Principal',
    agence: 'Agence Cocody Deux-Plateaux',
    repondants: 11,
    effectifEquipe: 12,
    mliScore: 76,
    statut: 'EQUILIBRE',
    scores: {
      clarte: 80,
      equite: 78,
      feedback: 70,
      soutien: 82,
      reconnaissance: 74,
      developpement: 72
    },
    verbatimsAnonymes: [
      'Bonne ambiance d\'agence mais manque de points individuels réguliers sur nos évolutions.',
      'Très présent aux heures de pointe pour aider les guichets.'
    ],
    planCoaching: 'Atelier de 4h sur le feedback constructif et les entretiens de carrière.'
  },
  {
    id: 'MGR-03',
    name: 'Brou Jean-Claude',
    poste: 'Chef d\'Agence',
    agence: 'Agence Zone Industrielle Vridi',
    repondants: 9,
    effectifEquipe: 10,
    mliScore: 49,
    statut: 'VIGILANCE',
    scores: {
      clarte: 58,
      equite: 42,
      feedback: 40,
      soutien: 48,
      reconnaissance: 45,
      developpement: 61
    },
    verbatimsAnonymes: [
      'Communication trop directive devant les clients lors des erreurs de caisse.',
      'Sentiment d\'iniquité dans l\'attribution des plannings de samedi.'
    ],
    planCoaching: 'Intervention DRH urgente : Coaching individuel 6 séances sur le leadership bienveillant & médiation d\'équipe.'
  }
];

const DIMENSION_LABELS = [
  { key: 'clarte', label: 'Clarté des objectifs & attentes' },
  { key: 'equite', label: 'Équité de traitement & plannings' },
  { key: 'feedback', label: 'Qualité du feedback continu' },
  { key: 'soutien', label: 'Écoute & soutien en difficulté' },
  { key: 'reconnaissance', label: 'Reconnaissance des réussites' },
  { key: 'developpement', label: 'Accompagnement carrière & montée en compétence' }
];

export default function BarometreManagerialUpwardFeedback() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMgr, setSelectedMgr] = useState(MOCK_MANAGERS_FEEDBACK[0]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'detail' | 'survey'
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [surveyScores, setSurveyScores] = useState({
    clarte: 4,
    equite: 4,
    feedback: 4,
    soutien: 4,
    reconnaissance: 4,
    developpement: 4
  });
  const [surveyComment, setSurveyComment] = useState('');

  const filteredManagers = useMemo(() => {
    return MOCK_MANAGERS_FEEDBACK.filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.agence.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.poste.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const globalMli = useMemo(() => {
    const sum = MOCK_MANAGERS_FEEDBACK.reduce((acc, m) => acc + m.mliScore, 0);
    return Math.round(sum / MOCK_MANAGERS_FEEDBACK.length);
  }, []);

  const handleSubmitSurvey = (e) => {
    e.preventDefault();
    setSurveySubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Leadership & Culture Managériale
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Upward Feedback 100% Anonyme
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Baromètre Managérial & Évaluation par les Équipes
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Évaluez objectivement la qualité du management de proximité (Indice MLI / 100), prévenez le management toxique et déployez des plans de coaching ciblés.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Palmarès & Alertes MLI
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'detail' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Diagnostic Manager
            </button>
            <button
              onClick={() => {
                setSurveySubmitted(false);
                setActiveTab('survey');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'survey' ? 'bg-[#008000] text-white shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Évaluer mon Manager
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Indice MLI Groupe</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{globalMli} / 100</h3>
            <p className="text-xs text-gray-500 mt-1">Leadership Managérial</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Taux Participation</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">89.5 %</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">34 / 38 collaborateurs</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alertes Vigilance</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">1 manager</h3>
            <p className="text-xs text-red-500 mt-1 font-medium">Score MLI &lt; 60 (Coaching requis)</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Garantie Anonymat</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">Seuil &ge; 5</h3>
            <p className="text-xs text-gray-500 mt-1">Agrégation cryptée</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <Lock className="w-6 h-6 text-[#002B7F]" />
          </div>
        </div>
      </div>

      {/* Vue 1 : Tableau de bord des Managers */}
      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un manager ou une agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">Campagne S2 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Manager & Entité</th>
                  <th className="py-3.5 px-4 text-center">Répondants</th>
                  <th className="py-3.5 px-4 text-center">Indice MLI / 100</th>
                  <th className="py-3.5 px-4">Statut Leadership</th>
                  <th className="py-3.5 px-4">Action RH Recommandée</th>
                  <th className="py-3.5 px-4 text-right">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredManagers.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedMgr(m);
                      setActiveTab('detail');
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.poste} • {m.agence}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-700">
                      {m.repondants} / {m.effectifEquipe}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-base font-black font-mono ${
                        m.mliScore >= 80 ? 'text-[#008000]' : m.mliScore >= 60 ? 'text-[#002B7F]' : 'text-red-600'
                      }`}>
                        {m.mliScore}
                      </span>
                      <span className="text-[10px] text-gray-400"> /100</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        m.statut === 'EXCELLENCE'
                          ? 'bg-emerald-50 text-[#008000] border border-emerald-200'
                          : m.statut === 'VIGILANCE'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-[#002B7F] border border-blue-200'
                      }`}>
                        {m.statut === 'EXCELLENCE' ? 'Leadership Modèle' : m.statut === 'VIGILANCE' ? 'Vigilance Critique' : 'Équilibré'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 max-w-xs truncate">
                      {m.planCoaching}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedMgr(m);
                          setActiveTab('detail');
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#002B7F] hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : Diagnostic 6 Dimensions */}
      {activeTab === 'detail' && selectedMgr && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedMgr.name}</h2>
                <p className="text-xs text-gray-500">{selectedMgr.poste} • {selectedMgr.agence}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Indice MLI</span>
                <p className={`text-3xl font-black font-mono ${selectedMgr.mliScore >= 80 ? 'text-[#008000]' : selectedMgr.mliScore >= 60 ? 'text-[#002B7F]' : 'text-red-600'}`}>
                  {selectedMgr.mliScore}/100
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {DIMENSION_LABELS.map((dim) => {
                const val = selectedMgr.scores[dim.key];
                return (
                  <div key={dim.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-gray-800">{dim.label}</span>
                      <span className="font-mono font-bold text-gray-900">{val} / 100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${val >= 80 ? 'bg-[#008000]' : val >= 60 ? 'bg-[#002B7F]' : 'bg-red-600'}`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#002B7F]" />
                Verbatims Anonymes de l'Équipe
              </h4>
              <div className="space-y-2.5">
                {selectedMgr.verbatimsAnonymes.map((v, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 italic">
                    « {v} »
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Plan de Coaching & Accompagnement RH</h4>
              <p className="text-xs text-gray-800 leading-relaxed bg-blue-50/60 p-3 rounded-lg border border-blue-200">
                {selectedMgr.planCoaching}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Formulaire Anonyme Collaborateur */}
      {activeTab === 'survey' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-3xl mx-auto">
          {surveySubmitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#008000] mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Merci ! Votre évaluation anonyme a été enregistrée.</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Vos réponses sont chiffrées et ne seront restituées qu'agrégées à partir de 5 répondants afin de garantir une confidentialité absolue.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="mt-2 px-4 py-2 bg-[#002B7F] text-white text-xs font-semibold rounded-lg hover:bg-blue-900"
              >
                Retour au Baromètre
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitSurvey} className="space-y-5">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-[#002B7F]">Questionnaire Upward Feedback (100% Anonyme)</h3>
                <p className="text-xs text-gray-500 mt-0.5">Notez chaque dimension de 1 (Insuffisant) à 5 (Exemplaire).</p>
              </div>

              <div className="space-y-4">
                {DIMENSION_LABELS.map((dim) => (
                  <div key={dim.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xs font-semibold text-gray-800">{dim.label}</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSurveyScores({ ...surveyScores, [dim.key]: n })}
                          className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                            surveyScores[dim.key] === n
                              ? 'bg-[#002B7F] text-white border-[#002B7F]'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Commentaire constructif anonyme (optionnel)
                </label>
                <textarea
                  rows="3"
                  value={surveyComment}
                  onChange={(e) => setSurveyComment(e.target.value)}
                  placeholder="Points forts observés et axes d'amélioration souhaités..."
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#002B7F]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#008000] text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  Soumettre de manière Anonyme
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
