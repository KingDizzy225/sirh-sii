import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  Filter, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Building2,
  XCircle,
  Info
} from 'lucide-react';

// DEMANDES D'OUVERTURE DE POSTE & CONTRÔLE DU BUDGET D'EFFECTIFS (Headcount & Job Requisition)
// Gouvernance avant recrutement : ETP budgétés vs ETP réels par département,
// distinction Remplacement vs Création Nette vs Hors-Budget,
// circuit d'approbation : Manager -> Contrôle de Gestion -> DRH -> Direction Générale.

const INITIAL_HEADCOUNT_BUDGET = [
  { dept: 'Opérations Réseau & Agences', budgetEtp: 145, reelEtp: 142, ouverts: 2, masseBudgetM: 780 },
  { dept: 'Commercial & Vente B2B', budgetEtp: 42, reelEtp: 41, ouverts: 1, masseBudgetM: 420 },
  { dept: 'IT, Cybersécurité & Télécoms', budgetEtp: 34, reelEtp: 34, ouverts: 1, masseBudgetM: 510 },
  { dept: 'Finance, Audit & Risques', budgetEtp: 27, reelEtp: 26, ouverts: 0, masseBudgetM: 440 }
];

const INITIAL_REQUISITIONS = [
  {
    id: 'REQ-2026-041',
    intitulePoste: 'Ingénieur Sécurité Cloud & Réseau',
    departement: 'IT, Cybersécurité & Télécoms',
    agence: 'Siège Social Plateau',
    demandeur: 'Soro Moussa (Responsable IT)',
    motif: 'CREATION_HORS_BUDGET', // 'REMPLACEMENT' | 'CREATION_BUDGETEE' | 'CREATION_HORS_BUDGET'
    contrat: 'CDI',
    budgetAnnuelFcfa: 16800000,
    dateDemande: '2026-11-18',
    etapeActuelle: 'DIRECTION_GENERALE', // 'CONTROLE_GESTION' | 'DRH' | 'DIRECTION_GENERALE' | 'APPROUVE' | 'REJETE'
    approbations: { cg: 'Validé avec réserve (Hors-budget)', drh: 'Approuvé', dg: 'En attente' },
    justification: 'Conformité audit sécurité BCEAO / ARTCI 2027 nécessitant un renfort immédiat sur le SOC.'
  },
  {
    id: 'REQ-2026-039',
    intitulePoste: 'Chef de Caisse Principal',
    departement: 'Opérations Réseau & Agences',
    agence: 'Agence Centrale Plateau',
    demandeur: 'Koffi Armand (Chef d\'Agence)',
    motif: 'REMPLACEMENT',
    contrat: 'CDI',
    budgetAnnuelFcfa: 8160000,
    dateDemande: '2026-11-12',
    etapeActuelle: 'APPROUVE',
    approbations: { cg: 'Conforme (Poste pour poste)', drh: 'Approuvé', dg: 'Approuvé' },
    justification: 'Remplacement de M. Kouamé Jean-Baptiste partant à la retraite le 15/12/2026.'
  },
  {
    id: 'REQ-2026-043',
    intitulePoste: 'Chargé d\'Affaires PME',
    departement: 'Commercial & Vente B2B',
    agence: 'Agence Bouaké Centre',
    demandeur: 'Koné Mariam (Directrice Commerciale)',
    motif: 'CREATION_BUDGETEE',
    contrat: 'CDI',
    budgetAnnuelFcfa: 10200000,
    dateDemande: '2026-11-21',
    etapeActuelle: 'DRH',
    approbations: { cg: 'Budgeté T4 2026', drh: 'En attente', dg: 'À venir' },
    justification: 'Ouverture du portefeuille PME de la nouvelle agence de Bouaké.'
  }
];

export default function OuverturePosteHeadcount() {
  const [requisitions, setRequisitions] = useState(INITIAL_REQUISITIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('requisitions'); // 'requisitions' | 'budget' | 'new'
  const [form, setForm] = useState({
    intitulePoste: '',
    departement: 'Opérations Réseau & Agences',
    agence: 'Agence Centrale Plateau',
    motif: 'REMPLACEMENT',
    budgetAnnuelFcfa: 7500000,
    justification: ''
  });

  const stats = useMemo(() => {
    const totalBudget = INITIAL_HEADCOUNT_BUDGET.reduce((a, d) => a + d.budgetEtp, 0);
    const totalReel = INITIAL_HEADCOUNT_BUDGET.reduce((a, d) => a + d.reelEtp, 0);
    const enAttente = requisitions.filter((r) => !['APPROUVE', 'REJETE'].includes(r.etapeActuelle)).length;
    const approuvees = requisitions.filter((r) => r.etapeActuelle === 'APPROUVE').length;
    return { totalBudget, totalReel, ecart: totalBudget - totalReel, enAttente, approuvees };
  }, [requisitions]);

  const filteredReqs = useMemo(() => {
    return requisitions.filter(
      (r) =>
        r.intitulePoste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.departement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requisitions, searchTerm]);

  const handleDecision = (id, decision) => {
    setRequisitions((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              etapeActuelle: decision,
              approbations: {
                ...r.approbations,
                drh: decision === 'APPROUVE' ? 'Approuvé' : r.approbations.drh,
                dg: decision === 'APPROUVE' ? 'Approuvé' : 'Rejeté'
              }
            }
          : r
      )
    );
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.intitulePoste.trim()) return;
    const newReq = {
      id: `REQ-2026-0${44 + requisitions.length}`,
      intitulePoste: form.intitulePoste,
      departement: form.departement,
      agence: form.agence,
      demandeur: 'Direction Opérationnelle',
      motif: form.motif,
      contrat: 'CDI',
      budgetAnnuelFcfa: Number(form.budgetAnnuelFcfa) || 0,
      dateDemande: new Date().toISOString().slice(0, 10),
      etapeActuelle: 'CONTROLE_GESTION',
      approbations: { cg: 'En attente', drh: 'À venir', dg: 'À venir' },
      justification: form.justification || 'Besoin opérationnel validé par la hiérarchie.'
    };
    setRequisitions([newReq, ...requisitions]);
    setForm({ intitulePoste: '', departement: 'Opérations Réseau & Agences', agence: 'Agence Centrale Plateau', motif: 'REMPLACEMENT', budgetAnnuelFcfa: 7500000, justification: '' });
    setActiveTab('requisitions');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Gouvernance Effectifs & Budget
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Headcount Plan & Job Requisition
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Ouvertures de Poste & Contrôle du Budget d'Effectifs
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Maîtrisez la masse salariale avant tout recrutement : comparaison ETP budgétés vs réels et circuit d'approbation Manager ➔ Contrôle de Gestion ➔ DRH ➔ DG.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('requisitions')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'requisitions' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Demandes ({requisitions.length})
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'budget' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Budget ETP / Département
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'new' ? 'bg-[#008000] text-white shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Nouvelle Demande
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Effectifs 2026</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.totalBudget} ETP</h3>
            <p className="text-xs text-gray-500 mt-1">Plafond voté au Conseil</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Effectif Réel Actif</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.totalReel} ETP</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">Marge disponible : +{stats.ecart} ETP</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">En Attente Visa</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.enAttente} demande(s)</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Circuit CG / DRH / DG</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Postes Autorisés</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.approuvees} ouvert(s)</h3>
            <p className="text-xs text-gray-500 mt-1">Transmis au Recrutement</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <Briefcase className="w-6 h-6 text-[#002B7F]" />
          </div>
        </div>
      </div>

      {/* Vue 1 : Liste des Demandes d'Ouverture */}
      {activeTab === 'requisitions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher poste, département, réf..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredReqs.map((r) => (
              <div key={r.id} className="p-5 hover:bg-blue-50/30 transition-colors space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{r.id}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        r.motif === 'CREATION_HORS_BUDGET'
                          ? 'bg-red-100 text-red-800'
                          : r.motif === 'CREATION_BUDGETEE'
                          ? 'bg-blue-100 text-[#002B7F]'
                          : 'bg-emerald-100 text-[#008000]'
                      }`}>
                        {r.motif === 'CREATION_HORS_BUDGET' ? 'Hors-Budget (Dérogation DG)' : r.motif === 'CREATION_BUDGETEE' ? 'Création Nette Budgétée' : 'Remplacement Poste pour Poste'}
                      </span>
                      <span className="text-xs font-mono font-semibold text-gray-700">
                        Coût annuel : {r.budgetAnnuelFcfa.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mt-1">{r.intitulePoste}</h3>
                    <p className="text-xs text-gray-600">{r.departement} • {r.agence} • Demandeur : {r.demandeur}</p>
                    <p className="text-xs text-gray-500 mt-1 italic">« {r.justification} »</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!['APPROUVE', 'REJETE'].includes(r.etapeActuelle) ? (
                      <>
                        <button
                          onClick={() => handleDecision(r.id, 'APPROUVE')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#008000] text-white hover:bg-emerald-700 flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approuver Ouverture
                        </button>
                        <button
                          onClick={() => handleDecision(r.id, 'REJETE')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Rejeter
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        r.etapeActuelle === 'APPROUVE'
                          ? 'bg-emerald-50 text-[#008000] border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {r.etapeActuelle === 'APPROUVE' ? '✓ Approuvé & Ouvert au Sourcing' : '✕ Demande Rejetée'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Circuit d'approbation */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-gray-500 block">1. Contrôle de Gestion</span>
                    <span className="font-bold text-gray-800">{r.approbations.cg}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-gray-500 block">2. Direction RH</span>
                    <span className="font-bold text-gray-800">{r.approbations.drh}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-gray-500 block">3. Direction Générale</span>
                    <span className="font-bold text-gray-800">{r.approbations.dg}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue 2 : Budget ETP par Département */}
      {activeTab === 'budget' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Contrôle Budgétaire des Effectifs (ETP Budgétés vs Réels)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Département</th>
                  <th className="py-3.5 px-4 text-center">Budget ETP</th>
                  <th className="py-3.5 px-4 text-center">Réel Actif</th>
                  <th className="py-3.5 px-4 text-center">Solde Disponible</th>
                  <th className="py-3.5 px-4 text-right">Enveloppe Masse Salariale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {INITIAL_HEADCOUNT_BUDGET.map((d, i) => {
                  const solde = d.budgetEtp - d.reelEtp;
                  return (
                    <tr key={i} className="hover:bg-blue-50/30">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{d.dept}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#002B7F]">{d.budgetEtp}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-gray-800">{d.reelEtp}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          solde === 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-[#008000] border border-emerald-200'
                        }`}>
                          {solde === 0 ? 'Plafond atteint (0)' : `+${solde} poste(s)`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-800">{d.masseBudgetM} M FCFA</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 3 : Formulaire de Nouvelle Demande */}
      {activeTab === 'new' && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-[#002B7F] border-b border-gray-200 pb-2">
            Soumettre une Demande d'Ouverture de Poste (Job Requisition)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Intitulé du poste *</label>
              <input
                type="text"
                required
                placeholder="Ex: Conseiller Clientèle Entreprises"
                value={form.intitulePoste}
                onChange={(e) => setForm({ ...form, intitulePoste: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#002B7F]"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Département</label>
              <select
                value={form.departement}
                onChange={(e) => setForm({ ...form, departement: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                {INITIAL_HEADCOUNT_BUDGET.map((d) => (
                  <option key={d.dept} value={d.dept}>{d.dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Nature budgétaire</label>
              <select
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="REMPLACEMENT">Remplacement poste pour poste</option>
                <option value="CREATION_BUDGETEE">Création nette budgétée</option>
                <option value="CREATION_HORS_BUDGET">Création hors-budget (Visa DG requis)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Coût annuel brut estimé (FCFA)</label>
              <input
                type="number"
                value={form.budgetAnnuelFcfa}
                onChange={(e) => setForm({ ...form, budgetAnnuelFcfa: e.target.value })}
                className="w-full font-mono border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-gray-700 block mb-1">Justification opérationnelle</label>
            <textarea
              rows="3"
              value={form.justification}
              onChange={(e) => setForm({ ...form, justification: e.target.value })}
              placeholder="Expliquez l'impact business et pourquoi ce poste est requis..."
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#002B7F] text-white text-xs font-bold rounded-lg hover:bg-blue-900 shadow"
            >
              Soumettre au Circuit d'Approbation
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
