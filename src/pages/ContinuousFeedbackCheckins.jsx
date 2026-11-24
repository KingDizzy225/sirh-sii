import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Target,
  CheckCircle2,
  Clock,
  User,
  Heart,
  Send,
  Plus,
  ThumbsUp,
  Award,
  Filter,
  Calendar,
  AlertCircle,
  Building2,
  ChevronRight
} from 'lucide-react';

export default function ContinuousFeedbackCheckins() {
  const [activeTab, setActiveTab] = useState('checkins'); // 'checkins' | 'kudos' | 'okrs'

  // Liste des Check-ins 1-on-1 bimensuels
  const [checkins, setCheckins] = useState([
    {
      id: 'CHK-2026-11-01',
      collaborateur: 'Kouassi Konan Marc',
      manager: 'Directeur Régional Abidjan',
      poste: 'Chef de Caisse Senior',
      agence: 'Agence Abidjan Plateau',
      date: '14/11/2026',
      statut: 'complete',
      reussites: 'Clôture mensuelle des caisses sans aucun écart; formation réussie de 2 nouveaux guichetiers stagiaires.',
      blocages: 'Lenteur intermittente de la ligne internet de secours lors des pics de fin de mois (recharge Mobile Money).',
      priorites15j: 'Déployer la nouvelle procédure de double validation des décaissements supérieurs à 5M FCFA.',
      satisfactionHumeur: 'Excellente (5/5)'
    },
    {
      id: 'CHK-2026-11-02',
      collaborateur: 'Aya Touré Cissé',
      manager: 'Directeur Commercial Entreprises',
      poste: 'Chargée de Clientèle Entreprises',
      agence: 'Agence Cocody Deux-Plateaux',
      date: '16/11/2026',
      statut: 'complete',
      reussites: 'Signature du contrat flotte B2B avec le groupe agroalimentaire SIPRA (65 lignes activées).',
      blocages: 'Délai d’approvisionnement des modems fibre 5G pro auprès de la logistique centrale.',
      priorites15j: 'Préparer la soutenance d’appel d’offres pour la Société des Transports Abidjanais (SOTRA).',
      satisfactionHumeur: 'Très bonne (4/5)'
    },
    {
      id: 'CHK-2026-11-03',
      collaborateur: 'Yao N’Goran Bertin',
      manager: 'Responsable Infrastructure IT',
      poste: 'Technicien Support Réseau & Monétique',
      agence: 'Agence San Pedro Port',
      date: '17/11/2026',
      statut: 'a_planifier',
      reussites: 'Maintenance préventive effectuée sur les 4 onduleurs de l’agence San Pedro.',
      blocages: 'En attente de pièces de rechange pour le groupe électrogène de secours.',
      priorites15j: 'Migration des postes de caisse vers la version sécurisée de l’application.',
      satisfactionHumeur: 'En attente du point'
    }
  ]);

  // Flux de Kudos & Reconnaissance entre Pairs
  const [kudosList, setKudosList] = useState([
    {
      id: 'KUD-01',
      de: 'Bamba Souleymane (Moyens Généraux)',
      pour: 'Kouassi Konan Marc (Plateau)',
      valeur: 'Solidarité & Entraide Terrain',
      message: 'Un immense merci à Marc pour avoir pris en charge le dépannage de la caisse centrale de Cocody samedi dernier pendant l’affluence !',
      date: 'Il y a 2 heures',
      likes: 12
    },
    {
      id: 'KUD-02',
      de: 'Gnagne Sarah (Conformité)',
      pour: 'Aya Touré Cissé (Cocody)',
      valeur: 'Excellence Opérationnelle',
      message: 'Félicitations à Aya pour sa rigueur exemplaire sur les dossiers de conformité KYC lors de l’audit interne. Zéro réserve !',
      date: 'Hier à 16:30',
      likes: 8
    },
    {
      id: 'KUD-03',
      de: 'Yao Bertin (San Pedro)',
      pour: 'Équipe Logistique Flotte',
      valeur: 'Réactivité & Engagement',
      message: 'Bravo pour la livraison express du kit batterie solaire à l’agence de San Pedro en moins de 24h après la coupure de secteur.',
      date: 'Le 15/11/2026',
      likes: 15
    }
  ]);

  // Modal Nouveau Kudo
  const [showKudoModal, setShowKudoModal] = useState(false);
  const [newKudo, setNewKudo] = useState({
    destinataire: '',
    valeur: 'Solidarité & Entraide Terrain',
    message: ''
  });

  const handlePostKudo = (e) => {
    e.preventDefault();
    if (!newKudo.destinataire || !newKudo.message) return;
    const entry = {
      id: `KUD-0${kudosList.length + 1}`,
      de: 'Moi (Collaborateur Connecté)',
      pour: newKudo.destinataire,
      valeur: newKudo.valeur,
      message: newKudo.message,
      date: 'À l’instant',
      likes: 1
    };
    setKudosList([entry, ...kudosList]);
    setShowKudoModal(false);
    setNewKudo({ destinataire: '', valeur: 'Solidarité & Entraide Terrain', message: '' });
  };

  // Matrice OKR (Objectifs et Résultats Clés)
  const okrsList = [
    {
      id: 'OKR-01',
      titre: 'Excellence de Service & Taux de Disponibilité Guichets Réseau',
      axe: 'Opérations & Satisfaction Client',
      proprietaire: 'Direction des Agences',
      progression: 84,
      krList: [
        { desc: 'Maintenir un temps d’attente moyen < 7 minutes aux guichets d’Abidjan', progression: 90 },
        { desc: 'Atteindre 100% de conformité de clôture de caisse quotidienne sans écart', progression: 95 },
        { desc: 'Taux de satisfaction client CSAT supérieur à 92%', progression: 78 }
      ]
    },
    {
      id: 'OKR-02',
      titre: 'Accélération Commerciale B2B & Pénétration Offres Fibre Pro',
      axe: 'Croissance du Chiffre d’Affaires',
      proprietaire: 'Pôle Commercial Entreprises',
      progression: 68,
      krList: [
        { desc: 'Signer 120 nouveaux contrats entreprises sur l’axe Abidjan - San Pedro', progression: 72 },
        { desc: 'Générer 450 millions FCFA de revenus récurrents annuels', progression: 65 },
        { desc: 'Taux de rétention des clients stratégiques > 96%', progression: 92 }
      ]
    },
    {
      id: 'OKR-03',
      titre: 'Sécurisation Sociale, Rétention & Bien-être Collaborateurs',
      axe: 'Capital Humain & Climat Social',
      proprietaire: 'Direction des Ressources Humaines',
      progression: 91,
      krList: [
        { desc: '100% des managers réalisant les check-ins 1-on-1 bimensuels', progression: 94 },
        { desc: 'Plan de formation FDFP exécuté à 100% du budget alloué', progression: 88 },
        { desc: 'Indice de risque d’attrition des talents clés maintenu sous 8%', progression: 91 }
      ]
    }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Continuous Performance Management • Standard Culture Amp / Lattice
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Check-ins Agile & Culture de la Reconnaissance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#002B7F]" />
            Feedback Continu, Check-ins 1-on-1 & OKRs Vivants
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Dépassez l'entretien annuel unique : synchronisations bimensuelles structurées manager-collaborateur,
            mur de reconnaissance entre pairs (Kudos) et pilotage dynamique des objectifs stratégiques.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKudoModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#008000] text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Heart className="w-4 h-4" />
            Envoyer un Kudo à un Pair
          </button>
        </div>
      </div>

      {/* Navigation Onglets */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('checkins')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'checkins'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Check-ins 1-on-1 Bimensuels ({checkins.length})
        </button>
        <button
          onClick={() => setActiveTab('kudos')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'kudos'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          Mur de Reconnaissance & Kudos ({kudosList.length})
        </button>
        <button
          onClick={() => setActiveTab('okrs')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'okrs'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          Cascade des Objectifs & OKRs d'Entreprise
        </button>
      </div>

      {/* Onglet 1 : Check-ins 1-on-1 */}
      {activeTab === 'checkins' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#002B7F]" />
              <span>
                <strong>Rythme Conseillé :</strong> Entretien de 20 minutes tous les 15 jours entre chaque manager et ses n-1.
                Trois thèmes invariables : <em>Succès marquants, points de blocage à lever, 3 priorités d’action</em>.
              </span>
            </div>
            <span className="font-bold text-[#002B7F] bg-white px-3 py-1 rounded-lg border border-blue-200">
              Taux de réalisation : 94%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {checkins.map((chk) => (
              <div key={chk.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-[#002B7F] flex items-center justify-center font-bold text-[#002B7F] text-sm">
                      {chk.collaborateur.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{chk.collaborateur}</h3>
                      <p className="text-xs text-slate-500">
                        {chk.poste} • <span className="font-semibold text-slate-700">{chk.agence}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">Manager : <strong>{chk.manager}</strong></span>
                    <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-[#008000] border border-emerald-200">
                      Effectué le {chk.date}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[#008000]">
                      <CheckCircle2 className="w-4 h-4 text-[#008000]" /> 1. Succès des 15 derniers jours
                    </span>
                    <p className="text-slate-600 leading-relaxed pt-1">{chk.reussites}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 text-amber-700">
                      <AlertCircle className="w-4 h-4 text-amber-600" /> 2. Blocages & Besoins de Support
                    </span>
                    <p className="text-slate-600 leading-relaxed pt-1">{chk.blocages}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[#002B7F]">
                      <Target className="w-4 h-4 text-[#002B7F]" /> 3. Priorités d'Action à 15 Jours
                    </span>
                    <p className="text-slate-600 leading-relaxed pt-1">{chk.priorites15j}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet 2 : Mur de Kudos */}
      {activeTab === 'kudos' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Flux en Direct de Reconnaissance d'Entreprise
            </span>
            <button
              onClick={() => setShowKudoModal(true)}
              className="px-3 py-1.5 bg-[#002B7F] text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Donner un Kudo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kudosList.map((k) => (
              <div key={k.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                <div className="w-2 h-full bg-[#008000] absolute left-0 top-0" />
                <div className="pl-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#002B7F] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {k.valeur}
                    </span>
                    <span className="text-slate-400 text-[11px]">{k.date}</span>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-slate-500">
                      <strong>{k.de}</strong> a félicité <strong>{k.pour}</strong> :
                    </div>
                    <p className="text-xs text-slate-700 italic mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      « {k.message} »
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                    <button
                      onClick={() => {
                        k.likes += 1;
                        setKudosList([...kudosList]);
                      }}
                      className="flex items-center gap-1.5 text-[#008000] font-semibold hover:text-emerald-700"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> {k.likes} félicitations
                    </button>
                    <span className="text-[11px] text-slate-400">Valeur SII</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet 3 : Matrice OKR Vivante */}
      {activeTab === 'okrs' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Alignement Stratégique : Objectifs Groupe ➔ Déclinaison Agences
            </span>
            <span className="text-xs font-semibold text-[#002B7F]">Exercice Annuel 2026</span>
          </div>

          <div className="space-y-4">
            {okrsList.map((okr) => (
              <div key={okr.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#008000]">
                      {okr.axe} • {okr.proprietaire}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{okr.titre}</h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-[#002B7F] font-mono">{okr.progression}%</div>
                    <span className="text-[11px] text-slate-400">Progression globale</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {okr.krList.map((kr, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span>• {kr.desc}</span>
                        <span className="font-bold font-mono text-[#008000]">{kr.progression}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#002B7F] h-full rounded-full"
                          style={{ width: `${kr.progression}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Envoyer un Kudo */}
      {showKudoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#008000]" />
                Envoyer un Kudo à un Collègue
              </h3>
              <button onClick={() => setShowKudoModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handlePostKudo} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destinataire (Nom & Agence)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Kouassi Marc (Plateau)"
                  value={newKudo.destinataire}
                  onChange={(e) => setNewKudo({ ...newKudo, destinataire: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Valeur d'Entreprise Illustrée</label>
                <select
                  value={newKudo.valeur}
                  onChange={(e) => setNewKudo({ ...newKudo, valeur: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                >
                  <option value="Solidarité & Entraide Terrain">Solidarité & Entraide Terrain</option>
                  <option value="Excellence Opérationnelle">Excellence Opérationnelle</option>
                  <option value="Intégrité & Transparence">Intégrité & Transparence</option>
                  <option value="Innovation & Agilité Réseau">Innovation & Agilité Réseau</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Votre Message de Remerciement</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Expliquez en 2 phrases pourquoi vous félicitez ce collègue..."
                  value={newKudo.message}
                  onChange={(e) => setNewKudo({ ...newKudo, message: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowKudoModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008000] text-white font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Publier sur le Mur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
