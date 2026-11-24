import React, { useState, useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Users, 
  Calendar, 
  ShieldCheck, 
  BookOpen,
  Award,
  Eye,
  Info
} from 'lucide-react';

// PLAN D'AMÉLIORATION DE LA PERFORMANCE (PIP - Performance Improvement Plan)
// Standard mondial HCM & Sécurisation juridique en cas d'insuffisance professionnelle.
// Durée standard : 60 ou 90 jours avec objectifs SMART co-signés, points d'étape
// documentés (J+15, J+30, J+60, J+90) et moyens d'accompagnement (coaching/formation).

const MOCK_PIP_PLANS = [
  {
    id: 'PIP-2026-014',
    matricule: 'MTR-2023-0215',
    name: 'Yao N\'Guessan Sylvestre',
    poste: 'Gestionnaire de Flux & Dépôts',
    departement: 'Opérations Réseau',
    agence: 'Agence Cocody Deux-Plateaux',
    manager: 'Koffi Armand (Chef d\'Agence)',
    dateDebut: '2026-10-01',
    dateFinPrevue: '2026-12-30',
    dureeJours: 90,
    progressionGlobale: 68,
    statut: 'EN_COURS', // 'EN_COURS' | 'REUSSI' | 'PROLONGE' | 'ECHEC_CLOTURE'
    constatInitial: 'Taux d\'erreur supérieur à 4% sur les rapprochements journaliers de caisse et retards répétés dans la clôture comptable.',
    moyensFournis: [
      'Formation intensive de 14h sur la réconciliation caisse & ERP',
      'Binômage quotidien avec le Chef de Caisse Senior (2 semaines)',
      'Checklist de clôture simplifiée validée par le contrôle interne'
    ],
    objectifsSmart: [
      { id: 1, titre: 'Ramener le taux d\'erreur de caisse sous 0,5% par mois', poids: 40, atteint: 75, statut: 'En bonne voie' },
      { id: 2, titre: 'Respecter l\'heure de clôture journalière (17h30) à 100%', poids: 35, atteint: 80, statut: 'En bonne voie' },
      { id: 3, titre: 'Valider le quiz de procédures contrôle interne (score >= 85%)', poids: 25, atteint: 45, statut: 'À renforcer' }
    ],
    jalons: [
      { etape: 'J+15 (16/10/2026)', statut: 'Réalisé', appreciation: 'Amélioration notable sur la ponctualité de clôture. Encore 2 écarts mineurs.' },
      { etape: 'J+30 (31/10/2026)', statut: 'Réalisé', appreciation: 'Formation terminée. Rapprochements propres sur 18 jours consécutifs.' },
      { etape: 'J+60 (30/11/2026)', statut: 'À venir', appreciation: 'Évaluation intermédiaire décisive prévue avec RH et Manager.' },
      { etape: 'J+90 (30/12/2026)', statut: 'Planifié', appreciation: 'Bilan final et décision de clôture du PIP.' }
    ]
  },
  {
    id: 'PIP-2026-009',
    matricule: 'MTR-2022-0194',
    name: 'Diarrassouba Ibrahim',
    poste: 'Conseiller Commercial Entreprises',
    departement: 'Commercial & Vente',
    agence: 'Agence Centrale Plateau',
    manager: 'Koné Mariam (Directrice Commerciale)',
    dateDebut: '2026-08-01',
    dateFinPrevue: '2026-10-30',
    dureeJours: 90,
    progressionGlobale: 92,
    statut: 'REUSSI',
    constatInitial: 'Atteinte de seulement 42% des objectifs trimestriels de souscription Fibre PME sur deux trimestres consécutifs.',
    moyensFournis: [
      'Coaching terrain sur 8 rendez-vous clients avec un Senior',
      'Mise à disposition d\'un fichier qualifié de 120 prospects PME',
      'Atelier négociation B2B certifié FDFP'
    ],
    objectifsSmart: [
      { id: 1, titre: 'Signer au minimum 15 nouveaux contrats Fibre PME sur 90 jours', poids: 50, atteint: 100, statut: 'Atteint (17 signés)' },
      { id: 2, titre: 'Réaliser 100% de mise à jour du CRM chaque vendredi', poids: 25, atteint: 95, statut: 'Atteint' },
      { id: 3, titre: 'Maintenir un taux de satisfaction client >= 4,2/5', poids: 25, atteint: 85, statut: 'Atteint' }
    ],
    jalons: [
      { etape: 'J+15 (15/08/2026)', statut: 'Réalisé', appreciation: 'Pipeline reconstitué, 4 propositions envoyées.' },
      { etape: 'J+30 (01/09/2026)', statut: 'Réalisé', appreciation: '5 contrats signés. Dynamique très positive.' },
      { etape: 'J+60 (01/10/2026)', statut: 'Réalisé', appreciation: '12 contrats cumulés. Autonomie retrouvée.' },
      { etape: 'J+90 (30/10/2026)', statut: 'Réalisé', appreciation: 'Sortie officielle réussie du PIP. Félicitations RH.' }
    ]
  },
  {
    id: 'PIP-2026-011',
    matricule: 'MTR-2021-0163',
    name: 'N\'Dri Kouadio Patrick',
    poste: 'Technicien Support Niveau 2',
    departement: 'IT & Systèmes d\'Information',
    agence: 'Siège Social Plateau',
    manager: 'Soro Moussa (Responsable IT)',
    dateDebut: '2026-09-15',
    dateFinPrevue: '2026-11-15',
    dureeJours: 60,
    progressionGlobale: 34,
    statut: 'PROLONGE',
    constatInitial: 'Délai moyen de résolution des tickets critiques d\'agence (SLA) dépassant 6h contre un objectif de 2h.',
    moyensFournis: [
      'Accès laboratoire technique et documentation procédures réseau',
      'Point quotidien de 15 min (stand-up) avec le Lead Tech'
    ],
    objectifsSmart: [
      { id: 1, titre: 'Respecter le SLA critique (< 2h) sur 90% des tickets', poids: 60, atteint: 35, statut: 'Insuffisant' },
      { id: 2, titre: 'Documenter 100% des interventions dans l\'outil ITSM', poids: 40, atteint: 32, statut: 'Insuffisant' }
    ],
    jalons: [
      { etape: 'J+15 (30/09/2026)', statut: 'Réalisé', appreciation: 'Difficultés persistantes sur le diagnostic routeurs.' },
      { etape: 'J+30 (15/10/2026)', statut: 'Réalisé', appreciation: 'Alerte formelle : objectifs non atteints à mi-parcours.' },
      { etape: 'J+60 (15/11/2026)', statut: 'Réalisé', appreciation: 'Prolongation ultime de 30 jours accordée avant décision RH.' }
    ]
  }
];

export default function PlanAmeliorationPerformancePip() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPip, setSelectedPip] = useState(MOCK_PIP_PLANS[0]);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'detail' | 'letter'

  const filteredPips = useMemo(() => {
    return MOCK_PIP_PLANS.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.agence.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.statut === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    let enCours = 0;
    let reussis = 0;
    let prolonges = 0;
    MOCK_PIP_PLANS.forEach((p) => {
      if (p.statut === 'EN_COURS') enCours++;
      else if (p.statut === 'REUSSI') reussis++;
      else if (p.statut === 'PROLONGE') prolonges++;
    });
    const tauxReussite = MOCK_PIP_PLANS.length > 0 ? Math.round((reussis / MOCK_PIP_PLANS.length) * 100) : 0;
    return { total: MOCK_PIP_PLANS.length, enCours, reussis, prolonges, tauxReussite };
  }, []);

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Performance & Sécurisation RH
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Protocole PIP 60 / 90 Jours
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Plan d'Amélioration de la Performance (PIP)
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Accompagnement structuré des collaborateurs en difficulté : objectifs SMART co-signés, coaching dédié, revues documentées (J+15 à J+90) et protection juridique contre le risque de licenciement abusif.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Portefeuille PIP
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'detail'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Suivi Objectifs & Jalons
            </button>
            <button
              onClick={() => setActiveTab('letter')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'letter'
                  ? 'bg-[#008000] text-white shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Contrat PIP Officiel
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plans Actifs</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.enCours} en cours</h3>
            <p className="text-xs text-gray-500 mt-1">Sur {stats.total} dossiers suivis</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sorties Positives</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.reussis} réussi(s)</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">Performance redressée</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">En Prolongation</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.prolonges} dossier(s)</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Vigilance RH renforcée</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Conformité Juridique</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">100 %</h3>
            <p className="text-xs text-gray-500 mt-1">Moyens & jalons tracés</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-[#008000]" />
          </div>
        </div>
      </div>

      {/* Rappel Jurisprudence */}
      <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#002B7F] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#002B7F] font-semibold">Règle d'Or Jurisprudentielle : </strong>
          L'insuffisance professionnelle n'est pas une faute disciplinaire. Pour être juridiquement valable devant le Tribunal du Travail, l'employeur doit prouver qu'il a fourni au salarié des <strong>objectifs réalistes</strong>, des <strong>moyens d'accompagnement concrets</strong> (formation, coaching) et un <strong>délai raisonnable d'amélioration (60 à 90 jours)</strong>.
        </div>
      </div>

      {/* Vue 1 : Liste des PIP */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher salarié, matricule, agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500 font-medium">Statut :</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-medium text-gray-700 focus:outline-none"
              >
                <option value="ALL">Tous les plans</option>
                <option value="EN_COURS">En cours</option>
                <option value="REUSSI">Réussi (Clôturé)</option>
                <option value="PROLONGE">Prolongé (Alerte)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Collaborateur / Réf</th>
                  <th className="py-3.5 px-4">Poste & Manager</th>
                  <th className="py-3.5 px-4">Période PIP</th>
                  <th className="py-3.5 px-4 text-center">Atteinte Objectifs</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPips.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedPip(p);
                      setActiveTab('detail');
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{p.matricule} • {p.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-gray-800">{p.poste}</div>
                      <div className="text-[11px] text-gray-500">{p.agence} • Mgr: {p.manager}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      <div>{p.dateDebut} ➔ {p.dateFinPrevue}</div>
                      <div className="text-[11px] text-gray-500 font-semibold">Durée : {p.dureeJours} jours</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-gray-900">{p.progressionGlobale}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            p.progressionGlobale >= 80
                              ? 'bg-[#008000]'
                              : p.progressionGlobale >= 50
                              ? 'bg-[#002B7F]'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${p.progressionGlobale}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.statut === 'REUSSI'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.statut === 'PROLONGE'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-[#002B7F] border border-blue-200'
                      }`}>
                        {p.statut === 'REUSSI' ? 'Réussi (Sortie PIP)' : p.statut === 'PROLONGE' ? 'Prolongé (Risque)' : 'En cours'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPip(p);
                            setActiveTab('detail');
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#002B7F] hover:bg-gray-100 rounded-lg"
                          title="Voir les jalons"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPip(p);
                            setActiveTab('letter');
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#008000] hover:bg-gray-100 rounded-lg"
                          title="Éditer le contrat PIP"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : Fiche Détaillée Objectifs SMART & Jalons */}
      {activeTab === 'detail' && selectedPip && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {selectedPip.id}
                </span>
                <span className="text-xs font-semibold text-[#002B7F] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  Durée {selectedPip.dureeJours} jours
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedPip.name}</h2>
              <p className="text-sm text-gray-600">{selectedPip.poste} • {selectedPip.agence}</p>
            </div>
            <button
              onClick={() => setActiveTab('letter')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5 shadow"
            >
              <FileText className="w-4 h-4" />
              Générer le Contrat PIP Co-signé
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Objectifs SMART */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#002B7F]" />
                  Objectifs SMART Assignés & Mesure d'Atteinte
                </h3>
                <div className="space-y-3">
                  {selectedPip.objectifsSmart.map((obj) => (
                    <div key={obj.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start text-xs mb-2">
                        <span className="font-semibold text-gray-900">{obj.titre}</span>
                        <span className="font-mono font-bold text-[#002B7F]">Poids: {obj.poids}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${obj.atteint >= 75 ? 'bg-[#008000]' : obj.atteint >= 50 ? 'bg-[#002B7F]' : 'bg-red-600'}`}
                            style={{ width: `${obj.atteint}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-800">{obj.atteint}%</span>
                        <span className="text-[11px] font-semibold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                          {obj.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronologie des points d'étape */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#008000]" />
                  Points d'Étape Documentés (J+15 à J+90)
                </h3>
                <div className="space-y-3">
                  {selectedPip.jalons.map((j, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50/70 rounded-lg border border-gray-200 text-xs">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                        j.statut === 'Réalisé' ? 'bg-[#008000]' : 'bg-amber-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">{j.etape}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            j.statut === 'Réalisé' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {j.statut}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{j.appreciation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne droite : Constat & Moyens fournis */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Constat Factuel Initial</h4>
                <p className="text-xs text-gray-700 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                  {selectedPip.constatInitial}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#008000]" />
                  Moyens d'Accompagnement Fournis
                </h4>
                <ul className="space-y-2 text-xs text-gray-700">
                  {selectedPip.moyensFournis.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#008000] flex-shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Contrat PIP Officiel */}
      {activeTab === 'letter' && selectedPip && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                Protocole Officiel de Plan d'Amélioration de la Performance (PIP)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer
              </button>
              <button
                onClick={() => {
                  const content = document.getElementById('print-pip').innerText;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Protocole_PIP_${selectedPip.matricule}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div id="print-pip" className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Direction du Capital Humain — Développement des Talents
Réf : ${selectedPip.id} | Abidjan, le ${todayStr}

PROTOCOLE DE PLAN D'AMÉLIORATION DE LA PERFORMANCE (PIP)

Collaborateur : ${selectedPip.name} (${selectedPip.matricule})
Fonction : ${selectedPip.poste} — Affectation : ${selectedPip.agence}
Manager Référent : ${selectedPip.manager}
Période d'accompagnement : Du ${selectedPip.dateDebut} au ${selectedPip.dateFinPrevue} (${selectedPip.dureeJours} jours)

1. CONSTAT OBJECTIF AYANT MOTIVÉ LE PLAN :
${selectedPip.constatInitial}

2. OBJECTIFS MESURABLES (SMART) À ATTEINDRE :
${selectedPip.objectifsSmart.map((o, i) => `${i + 1}. ${o.titre} (Pondération : ${o.poids}%)`).join('\n')}

3. MOYENS DE SOUTIEN MIS À DISPOSITION PAR L'ENTREPRISE :
${selectedPip.moyensFournis.map((m) => `- ${m}`).join('\n')}

4. CALENDRIER DES POINTS D'ÉTAPE OBLIGATOIRES :
${selectedPip.jalons.map((j) => `- ${j.etape} : ${j.statut}`).join('\n')}

L'objectif de ce plan est de permettre au collaborateur de retrouver pleinement le niveau de maîtrise attendu sur son poste grâce à un accompagnement renforcé.

Fait en double exemplaire original à Abidjan, le ${todayStr}.

Pour la Direction RH & Manager                          Le Collaborateur
(Signatures)                                            ("Lu et approuvé" + Signature)`}
          </div>
        </div>
      )}
    </div>
  );
}
