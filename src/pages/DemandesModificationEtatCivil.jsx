import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  FileCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Building2, 
  CreditCard, 
  Users, 
  ArrowRight,
  Info
} from 'lucide-react';

// SELF-SERVICE MODIFICATION ÉTAT CIVIL, RIB & PARTS IGR (Employee Data Change Requests)
// Tout changement d'état civil (mariage, naissance -> parts IGR & mutuelle) ou de RIB bancaire
// passe par un contrôle Avant / Après avec pièce justificative obligatoire et alerte anti-fraude RIB.

const INITIAL_CHANGE_REQUESTS = [
  {
    id: 'MOD-2026-102',
    matricule: 'MTR-2021-0089',
    name: 'Bamba Fatoumata',
    agence: 'Agence Treichville Arras',
    type: 'NAISSANCE_ENFANT', // 'RIB_BANCAIRE' | 'NAISSANCE_ENFANT' | 'MARIAGE' | 'ADRESSE'
    dateDemande: '2026-11-21',
    valeurAvant: 'Mariée, 1 enfant — 2,5 parts IGR',
    valeurApres: 'Mariée, 2 enfants — 3,0 parts IGR (+ ayant droit Mutuelle)',
    justificatif: 'Extrait_Acte_Naissance_Bamba_2026.pdf (Vérifié)',
    impactPaie: 'Baisse retenue IGR mensuelle (-18 500 F) & ajout Mutuelle',
    alerteFraude: false,
    statut: 'EN_ATTENTE' // 'EN_ATTENTE' | 'VALIDE' | 'REJETE'
  },
  {
    id: 'MOD-2026-105',
    matricule: 'MTR-2022-0142',
    name: 'Kouassi Marc-Antoine',
    agence: 'Agence Centrale Plateau',
    type: 'RIB_BANCAIRE',
    dateDemande: '2026-11-23',
    valeurAvant: 'SGBCI Plateau — CI008 01102 001428910022 45',
    valeurApres: 'NSIA Banque Cocody — CI042 01205 009841220188 12',
    justificatif: 'RIB_NSIA_Cachete_Agence.pdf',
    impactPaie: 'Virement salaire Novembre 2026 (Contre-appel sécurité requis)',
    alerteFraude: true,
    statut: 'EN_ATTENTE'
  },
  {
    id: 'MOD-2026-098',
    matricule: 'MTR-2023-0215',
    name: 'Yao N\'Guessan Sylvestre',
    agence: 'Agence Cocody Deux-Plateaux',
    type: 'MARIAGE',
    dateDemande: '2026-11-10',
    valeurAvant: 'Célibataire — 1,0 part IGR',
    valeurApres: 'Marié — 2,0 parts IGR',
    justificatif: 'Acte_Mariage_Mairie_Cocody.pdf',
    impactPaie: 'Mise à jour quotient familial IGR appliquée',
    alerteFraude: false,
    statut: 'VALIDE'
  }
];

export default function DemandesModificationEtatCivil() {
  const [requests, setRequests] = useState(INITIAL_CHANGE_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'ALL' || r.type === filterType;
      return matchSearch && matchType;
    });
  }, [requests, searchTerm, filterType]);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.statut === 'EN_ATTENTE').length;
    const ribAlerts = requests.filter((r) => r.alerteFraude && r.statut === 'EN_ATTENTE').length;
    const validated = requests.filter((r) => r.statut === 'VALIDE').length;
    return { total: requests.length, pending, ribAlerts, validated };
  }, [requests]);

  const handleAction = (id, statut) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, statut } : r)));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Self-Service & Sécurité Paie
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Contrôle Avant / Après & Anti-Fraude RIB
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Modifications État Civil, RIB Bancaire & Parts IGR
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Validez de manière sécurisée les changements de situation familiale (impact parts IGR & mutuelle) et les changements de coordonnées bancaires avec pièce justificative obligatoire.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">En Attente Validation</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.pending} demande(s)</h3>
            <p className="text-xs text-gray-500 mt-1">À traiter avant clôture paie</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alertes Changement RIB</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.ribAlerts} contrôle(s)</h3>
            <p className="text-xs text-red-500 mt-1 font-medium">Contre-appel téléphonique requis</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mises à Jour Validées</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.validated} intégrée(s)</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">Synchronisées Paie & Mutuelle</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filtres & Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher collaborateur, matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 font-medium text-gray-700"
            >
              <option value="ALL">Tous types de demandes</option>
              <option value="RIB_BANCAIRE">Changement RIB Bancaire</option>
              <option value="NAISSANCE_ENFANT">Naissance (Parts IGR)</option>
              <option value="MARIAGE">Mariage (Parts IGR)</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filtered.map((r) => (
            <div key={r.id} className="p-5 hover:bg-blue-50/20 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{r.id}</span>
                    <span className="text-xs font-bold text-[#002B7F] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {r.type === 'RIB_BANCAIRE' ? 'Changement RIB' : r.type === 'NAISSANCE_ENFANT' ? 'Naissance / Parts IGR' : 'Mariage / Parts IGR'}
                    </span>
                    {r.alerteFraude && (
                      <span className="text-[11px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Vérification Anti-Fraude RIB Obligatoire
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mt-1">
                    {r.name} <span className="text-xs font-mono font-normal text-gray-500">({r.matricule})</span>
                  </h3>
                  <p className="text-xs text-gray-500">{r.agence} • Déposé le {r.dateDemande} • Pièce : <strong className="text-[#002B7F]">{r.justificatif}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  {r.statut === 'EN_ATTENTE' ? (
                    <>
                      <button
                        onClick={() => handleAction(r.id, 'VALIDE')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#008000] text-white hover:bg-emerald-700 flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valider & Appliquer Paie
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'REJETE')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rejeter
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      r.statut === 'VALIDE'
                        ? 'bg-emerald-50 text-[#008000] border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {r.statut === 'VALIDE' ? '✓ Validé & Appliqué' : '✕ Rejeté'}
                    </span>
                  )}
                </div>
              </div>

              {/* Comparatif Avant / Après */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Valeur Actuelle (Avant)</span>
                  <span className="font-mono font-semibold text-gray-700">{r.valeurAvant}</span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-[#008000] block">Nouvelle Valeur Demandée (Après)</span>
                  <span className="font-mono font-bold text-gray-900">{r.valeurApres}</span>
                </div>
              </div>
              <div className="text-[11px] text-[#002B7F] font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Impact paie / mutuelle : {r.impactPaie}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
