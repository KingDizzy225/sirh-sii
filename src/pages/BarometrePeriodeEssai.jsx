import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Building2,
  Calendar,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Send,
  HelpCircle,
  X,
  FileCheck,
  ShieldCheck,
  ThumbsUp
} from 'lucide-react';

export default function BarometrePeriodeEssai() {
  const [activeTab, setActiveTab] = useState('dossiers'); // 'dossiers' | 'rapports_etonnement' | 'cadre_legal'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [showModalLettre, setShowModalLettre] = useState(false);
  const [typeLettre, setTypeLettre] = useState('confirmation'); // 'confirmation' | 'renouvellement'

  // Liste des dossiers en période d'essai (Code du Travail CI)
  const [dossiers, setDossiers] = useState([
    {
      id: 'ESSAI-2026-08',
      collaborateur: 'Traoré Bakary',
      matricule: 'EMP-0318',
      poste: 'Conseiller Commercial Agence',
      categorie: 'Employé (2 mois)',
      agence: 'Agence Yopougon Siporex',
      departement: 'Développement Commercial',
      dateEmbauche: '01/10/2026',
      dateFinEssaiInitiale: '30/11/2026',
      joursRestants: 6,
      statut: 'a_confirmer', // 'en_cours', 'a_confirmer', 'renouvele', 'titularise'
      rapportEtonnementSoumis: true,
      scoreEtonnement: 'Excellente intégration (4.8/5)',
      pointsFortsRapport: 'Aisance relationnelle immédiate avec la clientèle de Yopougon, maîtrise des offres fibre.',
      freinsRapport: 'Besoin d’approfondissement sur la procédure de déclaration des TPE défectueux.',
      evaluationManager: 'Très satisfaisant. Dépasse ses objectifs de prospection de 15%.',
      recommandationManager: 'Titularisation CDI immédiate recommandée sans renouvellement.'
    },
    {
      id: 'ESSAI-2026-09',
      collaborateur: 'Kouakou N’Guessan Ange',
      matricule: 'EMP-0322',
      poste: 'Caissière Réseau Polyvalente',
      categorie: 'Employé (2 mois)',
      agence: 'Agence Cocody Deux-Plateaux',
      departement: 'Opérations & Guichets',
      dateEmbauche: '15/10/2026',
      dateFinEssaiInitiale: '14/12/2026',
      joursRestants: 20,
      statut: 'en_cours',
      rapportEtonnementSoumis: true,
      scoreEtonnement: 'Bonne adaptation (4.2/5)',
      pointsFortsRapport: 'Précision sur les comptages de billets, zéro écart de caisse en fin de journée.',
      freinsRapport: 'Temps d’attente encore un peu long sur les remises de chèques compensés.',
      evaluationManager: 'Bonne rigueur. Entretien mi-parcours fixé au 02/12.',
      recommandationManager: 'En bonne voie pour confirmation définitive.'
    },
    {
      id: 'ESSAI-2026-10',
      collaborateur: 'Koffi Brou Sylvain',
      matricule: 'EMP-0325',
      poste: 'Ingénieur Cloud & Réseau Télécom',
      categorie: 'Cadre (3 mois)',
      agence: 'Agence Abidjan Plateau',
      departement: 'Support, IT & Monétique',
      dateEmbauche: '01/09/2026',
      dateFinEssaiInitiale: '30/11/2026',
      joursRestants: 6,
      statut: 'renouvele',
      rapportEtonnementSoumis: true,
      scoreEtonnement: 'Mitigé (3.4/5)',
      pointsFortsRapport: 'Excellente expertise technique sur les routeurs Cisco et la téléphonie IP.',
      freinsRapport: 'Difficultés d’intégration dans les astreintes de nuit et communication avec les agences régionales.',
      evaluationManager: 'Compétence technique validée, mais posture d’équipe à consolider.',
      recommandationManager: 'Renouvellement légal d’essai de 3 mois notifié avec lettre motivée.'
    },
    {
      id: 'ESSAI-2026-11',
      collaborateur: 'Gnamien Amenan Carine',
      matricule: 'EMP-0330',
      poste: 'Chargée des Ressources Humaines Agence',
      categorie: 'Cadre (3 mois)',
      agence: 'Agence San Pedro Port',
      departement: 'Direction, Audit & RH',
      dateEmbauche: '15/11/2026',
      dateFinEssaiInitiale: '14/02/2027',
      joursRestants: 82,
      statut: 'en_cours',
      rapportEtonnementSoumis: false,
      scoreEtonnement: 'En attente J+15 (prévu le 30/11)',
      pointsFortsRapport: '—',
      freinsRapport: '—',
      evaluationManager: 'Prise de poste en cours.',
      recommandationManager: 'Observation initiale.'
    }
  ]);

  const filteredDossiers = dossiers.filter((d) => {
    const matchSearch =
      d.collaborateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.agence.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const dossiersAlertes = dossiers.filter((d) => d.joursRestants <= 15 && d.statut !== 'titularise');

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête officiel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Code du Travail CI • CCNI Art. 13 & 14
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Sécurisation Juridique Anti-Titularisation Tacite
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-7 h-7 text-[#002B7F]" />
            Baromètre de Période d'Essai, Rapport d'Étonnement & Titularisation
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Pilotez les périodes probatoires selon le droit ivoirien : recueil du rapport d'étonnement à J+15,
            alerte avant le terme légal et génération des lettres de confirmation définitive en CDI ou de renouvellement motivé.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{dossiersAlertes.length} dossiers à arbitrer &lt; 15 jours</span>
          </div>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Essais en Cours</span>
            <User className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{dossiers.length} recrues</div>
          <div className="text-xs text-slate-500 mt-1">
            Dont <strong>2 Cadres</strong> et <strong>2 Employés</strong>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Taux de Confirmation CDI</span>
            <ShieldCheck className="w-5 h-5 text-[#008000]" />
          </div>
          <div className="text-2xl font-bold text-[#008000]">88%</div>
          <div className="text-xs text-emerald-700 mt-1">
            Titularisations réussies au 1er ou 2e terme
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rapports d'Étonnement (J+15)</span>
            <FileText className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">75% reçus</div>
          <div className="text-xs text-slate-500 mt-1">
            Note moyenne d'accueil : <strong>4.3 / 5</strong>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Délai Moyen d'Alerte RH</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">J-15</div>
          <div className="text-xs text-slate-500 mt-1">
            Notification avant l'échéance légale
          </div>
        </div>
      </div>

      {/* Navigation Onglets */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('dossiers')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'dossiers'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Registre des Périodes d'Essai ({dossiers.length})
        </button>
        <button
          onClick={() => setActiveTab('rapports_etonnement')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'rapports_etonnement'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Rapports d'Étonnement J+15
        </button>
        <button
          onClick={() => setActiveTab('cadre_legal')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'cadre_legal'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Règles d'Ordre Public Code du Travail CI
        </button>
      </div>

      {/* Onglet 1 : Registre des Dossiers */}
      {activeTab === 'dossiers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-b-xl border border-t-0 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm text-xs">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher collaborateur, poste, agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_cours">En cours normal</option>
                <option value="a_confirmer">À arbitrer urgence (&lt;15j)</option>
                <option value="renouvele">Renouvelé légalement</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4">Collaborateur</th>
                  <th className="py-3 px-4">Poste & Agence</th>
                  <th className="py-3 px-4">Durée Légale & Échéance</th>
                  <th className="py-3 px-4 text-center">Compte à Rebours</th>
                  <th className="py-3 px-4">Rapport J+15</th>
                  <th className="py-3 px-4">Avis Managérial</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDossiers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{d.collaborateur}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{d.matricule}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{d.poste}</div>
                      <div className="text-[11px] text-slate-500">{d.agence}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{d.categorie}</span>
                      <div className="text-[11px] text-slate-400">Échéance : {d.dateFinEssaiInitiale}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {d.joursRestants <= 15 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> J-{d.joursRestants}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          J-{d.joursRestants}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {d.rapportEtonnementSoumis ? (
                        <span className="inline-flex items-center gap-1 text-[#008000] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reçu ({d.scoreEtonnement.split(' ')[0]})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">En attente J+15</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium max-w-xs truncate">{d.evaluationManager}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedDossier(d);
                          setShowModalLettre(true);
                        }}
                        className="px-3 py-1.5 bg-[#002B7F] text-white rounded-lg text-xs font-semibold hover:bg-blue-900 transition-colors inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Arbitrer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onglet 2 : Rapports d'Étonnement */}
      {activeTab === 'rapports_etonnement' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#002B7F]" />
              <strong>Objectif du Rapport d'Étonnement (J+15) :</strong> Permettre à la nouvelle recrue de
              partager son regard neuf sur l'accueil, les outils et les processus d'agence avant que la routine ne s'installe.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dossiers.filter(d => d.rapportEtonnementSoumis).map((d) => (
              <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{d.collaborateur}</h3>
                    <p className="text-xs text-slate-500">{d.poste} • {d.agence}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[#008000] font-bold text-xs">
                    {d.scoreEtonnement}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-bold text-[#008000] flex items-center gap-1 mb-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> Ce qui m'a agréablement surpris :
                    </span>
                    <p className="text-slate-700 leading-relaxed">{d.pointsFortsRapport}</p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-bold text-amber-700 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Freins ou difficultés rencontrées :
                    </span>
                    <p className="text-slate-700 leading-relaxed">{d.freinsRapport}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet 3 : Cadre Légal CI */}
      {activeTab === 'cadre_legal' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 text-xs text-slate-700 leading-relaxed">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#002B7F]" />
              Réglementation de la Période d'Essai en Côte d'Ivoire (Code du Travail CI & CCNI)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-[#002B7F] uppercase tracking-wide block">
                1. Ouvriers & Employés Payés à l'Heure
              </span>
              <p className="font-semibold text-slate-900 text-sm">Durée Maximale : 8 jours à 1 mois</p>
              <p className="text-slate-600">Renouvelable une seule fois par écrit préalable.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-[#002B7F] uppercase tracking-wide block">
                2. Employés Mensuels, Caissiers & Agents
              </span>
              <p className="font-semibold text-slate-900 text-sm">Durée Maximale : 2 mois</p>
              <p className="text-slate-600">Renouvelable une seule fois pour une durée égale au maximum.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-[#002B7F] uppercase tracking-wide block">
                3. Cadres, Ingénieurs & Directeurs
              </span>
              <p className="font-semibold text-slate-900 text-sm">Durée Maximale : 3 mois</p>
              <p className="text-slate-600">Renouvelable une seule fois avec notification écrite impérative.</p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
            <span className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" /> Risque d'Ordre Public : La Titularisation Tacite
            </span>
            <p>
              Si le salarié continue à travailler le lendemain du dernier jour de la période d'essai initiale sans avoir reçu
              de notification écrite formelle de renouvellement ou de rupture, le contrat de travail est réputé conclu à durée indéterminée (CDI)
              de manière irrévocable. Aucune rupture d'essai n'est alors plus possible sans motif légal de licenciement.
            </p>
          </div>
        </div>
      )}

      {/* Modal Arbitrage et Générateur de Lettre Officielle */}
      {showModalLettre && selectedDossier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#002B7F]">{selectedDossier.id}</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Décision d'Essai — {selectedDossier.collaborateur}
                </h3>
              </div>
              <button onClick={() => setShowModalLettre(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400">Poste & Agence :</span>
                <p className="font-semibold text-slate-800">{selectedDossier.poste}</p>
                <p className="text-slate-500">{selectedDossier.agence}</p>
              </div>
              <div>
                <span className="text-slate-400">Échéance de l'Essai :</span>
                <p className="font-bold text-amber-700 font-mono text-sm">
                  {selectedDossier.dateFinEssaiInitiale} (J-{selectedDossier.joursRestants})
                </p>
                <p className="text-slate-500">Statut : {selectedDossier.categorie}</p>
              </div>
            </div>

            {/* Choix de la décision */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Décision de la Direction des Ressources Humaines :
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTypeLettre('confirmation')}
                  className={`p-3 rounded-lg border text-left text-xs font-bold transition-all ${
                    typeLettre === 'confirmation'
                      ? 'border-[#008000] bg-emerald-50 text-[#008000]'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mb-1 text-[#008000]" />
                  1. Titularisation Définitive en CDI
                </button>

                <button
                  type="button"
                  onClick={() => setTypeLettre('renouvellement')}
                  className={`p-3 rounded-lg border text-left text-xs font-bold transition-all ${
                    typeLettre === 'renouvellement'
                      ? 'border-[#002B7F] bg-blue-50 text-[#002B7F]'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <Clock className="w-4 h-4 mb-1 text-[#002B7F]" />
                  2. Renouvellement de l'Essai
                </button>
              </div>
            </div>

            {/* Aperçu de la lettre générée */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 text-slate-700 font-mono">
              <div className="font-bold text-slate-900">
                {typeLettre === 'confirmation'
                  ? 'OBJET : NOTIFICATION DE CONFIRMATION DÉFINITIVE D’ENGAGEMENT (CDI)'
                  : 'OBJET : NOTIFICATION DE RENOUVELLEMENT DE LA PÉRIODE D’ESSAI'}
              </div>
              <p className="leading-relaxed text-[11px]">
                {typeLettre === 'confirmation'
                  ? `« Nous avons le plaisir de vous informer qu'à l'issue de votre période d'essai satisfaisante, vous êtes définitivement engagé(e) au sein de la société SII Côte d'Ivoire au poste de ${selectedDossier.poste} à compter du ${selectedDossier.dateFinEssaiInitiale}. »`
                  : `« Conformément aux dispositions de l'Article 14 de la Convention Collective Interprofessionnelle, nous vous notifions par la présente le renouvellement de votre période d'essai pour une durée équivalente, avec mention des axes de perfectionnement convenus lors de l'entretien mi-parcours. »`}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Mention manuscrite "Bon pour accord" requise</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Lettre officielle générée avec succès pour ${selectedDossier.collaborateur}.`)}
                  className="px-4 py-2 bg-[#002B7F] text-white font-semibold rounded-lg text-xs hover:bg-blue-900 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Éditer & Notifier au Salarié
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
