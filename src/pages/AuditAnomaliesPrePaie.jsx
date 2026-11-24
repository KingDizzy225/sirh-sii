import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  Lock, 
  FileCheck, 
  RefreshCw,
  Info
} from 'lucide-react';

// CONTRÔLE QUALITÉ & DÉTECTION D'ANOMALIES PRÉ-PAIE (Payroll Pre-Run Audit)
// Filet de sécurité avant validation du virement bancaire mensuel (Bon à Payer - BAP) :
// - Variation net > ±15% sans avenant
// - Salarié sorti encore présent dans le lot
// - Changement de RIB bancaire dans le mois (alerte fraude)
// - Absence injustifiée non déduite ou double prime

const INITIAL_ANOMALIES = [
  {
    id: 'ANO-PAIE-01',
    gravite: 'BLOQUANTE', // 'BLOQUANTE' | 'AVERTISSEMENT'
    regle: 'Changement de RIB Bancaire dans le mois',
    matricule: 'MTR-2022-0142',
    name: 'Kouassi Marc-Antoine',
    agence: 'Agence Centrale Plateau',
    detail: 'Nouveau RIB NSIA saisi le 23/11/2026. Aucun contre-appel téléphonique consigné avant virement.',
    impactFcfa: 450000,
    statut: 'OUVERTE' // 'OUVERTE' | 'LEVEE'
  },
  {
    id: 'ANO-PAIE-02',
    gravite: 'BLOQUANTE',
    regle: 'Variation Salaire Net > +15% sans Avenant',
    matricule: 'MTR-2019-0034',
    name: 'Koffi Marie-Chantal',
    agence: 'Agence Yopougon Keneya',
    detail: 'Net à payer passé de 420 000 F (Oct) à 565 000 F (Nov) (+34,5%) : double saisie détectée sur la prime de caisse.',
    impactFcfa: 145000,
    statut: 'OUVERTE'
  },
  {
    id: 'ANO-PAIE-03',
    gravite: 'BLOQUANTE',
    regle: 'Salarié Sorti Encore Présent dans le Lot',
    matricule: 'MTR-2020-0078',
    name: 'Touré Adama',
    agence: 'Agence Zone Industrielle Vridi',
    detail: 'Contrat rompu le 20/11/2026 (STC déjà liquidé) mais bulletin mensuel complet encore actif dans le lot de virement.',
    impactFcfa: 620000,
    statut: 'OUVERTE'
  },
  {
    id: 'ANO-PAIE-04',
    gravite: 'AVERTISSEMENT',
    regle: 'Absence Injustifiée Non Déduite',
    matricule: 'MTR-2023-0215',
    name: 'Yao N\'Guessan Sylvestre',
    agence: 'Agence Cocody Deux-Plateaux',
    detail: '1 journée d\'absence non justifiée le 13/11/2026 présente au pointage mais absente des variables de paie.',
    impactFcfa: 14500,
    statut: 'OUVERTE'
  }
];

export default function AuditAnomaliesPrePaie() {
  const [anomalies, setAnomalies] = useState(INITIAL_ANOMALIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [bapIssued, setBapIssued] = useState(false);

  const stats = useMemo(() => {
    const bloquantes = anomalies.filter((a) => a.gravite === 'BLOQUANTE' && a.statut === 'OUVERTE').length;
    const avertissements = anomalies.filter((a) => a.gravite === 'AVERTISSEMENT' && a.statut === 'OUVERTE').length;
    const montantRisque = anomalies
      .filter((a) => a.statut === 'OUVERTE')
      .reduce((acc, a) => acc + a.impactFcfa, 0);
    const scoreFiabilite = Math.max(0, 100 - bloquantes * 18 - avertissements * 5);
    return { bloquantes, avertissements, montantRisque, scoreFiabilite };
  }, [anomalies]);

  const filtered = useMemo(() => {
    return anomalies.filter(
      (a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.regle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [anomalies, searchTerm]);

  const toggleStatus = (id) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, statut: a.statut === 'OUVERTE' ? 'LEVEE' : 'OUVERTE' } : a))
    );
    setBapIssued(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Contrôle Interne & Anti-Fraude Paie
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Lot de Paie Novembre 2026 — 248 Bulletins
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Contrôle Qualité & Détection d'Anomalies Pré-Paie
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Audit automatisé avant émission des virements bancaires : détection des changements de RIB, variations anormales de salaire net, salariés sortis et doubles primes.
            </p>
          </div>
          <div>
            <button
              onClick={() => setBapIssued(true)}
              disabled={stats.bloquantes > 0}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow transition-all ${
                stats.bloquantes > 0
                  ? 'bg-white/20 text-white/60 cursor-not-allowed'
                  : 'bg-[#008000] text-white hover:bg-emerald-700'
              }`}
            >
              <Lock className="w-4 h-4" />
              {stats.bloquantes > 0
                ? `Bon à Payer Bloqué (${stats.bloquantes} anomalie(s))`
                : bapIssued
                ? '✓ Bon à Payer (BAP) Scellé'
                : 'Délivrer le Bon à Payer (BAP)'}
            </button>
          </div>
        </div>
      </div>

      {bapIssued && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-[#008000] font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Bon à Payer (BAP) délivré ! Toutes les anomalies bloquantes ont été levées. Le fichier de virement SEPA/UEMOA peut être transmis à la DAF.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fiabilité Lot Paie</p>
            <h3 className={`text-2xl font-bold mt-1 font-mono ${stats.scoreFiabilite >= 90 ? 'text-[#008000]' : 'text-red-600'}`}>
              {stats.scoreFiabilite} / 100
            </h3>
            <p className="text-xs text-gray-500 mt-1">Sur 248 bulletins contrôlés</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Anomalies Bloquantes</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.bloquantes} alerte(s)</h3>
            <p className="text-xs text-red-500 mt-1 font-medium">Levée requise avant BAP</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avertissements</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.avertissements} contrôle(s)</h3>
            <p className="text-xs text-gray-500 mt-1">À vérifier avant clôture</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Montant à Risque Évité</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1 font-mono">
              {stats.montantRisque.toLocaleString('fr-FR')} F
            </h3>
            <p className="text-xs text-gray-500 mt-1">Erreurs détectées avant virement</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Liste des Anomalies */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher salarié, règle d'audit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filtered.map((a) => (
            <div key={a.id} className="p-5 hover:bg-blue-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{a.id}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    a.gravite === 'BLOQUANTE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {a.gravite}
                  </span>
                  <span className="text-xs font-bold text-[#002B7F]">{a.regle}</span>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {a.name} <span className="text-xs font-mono font-normal text-gray-500">({a.matricule} • {a.agence})</span>
                </div>
                <p className="text-xs text-gray-600">{a.detail}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <span className="text-xs text-gray-500 block">Impact</span>
                  <span className="text-sm font-bold text-red-600">{a.impactFcfa.toLocaleString('fr-FR')} F</span>
                </div>
                <button
                  onClick={() => toggleStatus(a.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    a.statut === 'LEVEE'
                      ? 'bg-emerald-50 text-[#008000] border-emerald-300'
                      : 'bg-[#002B7F] text-white border-[#002B7F] hover:bg-blue-900'
                  }`}
                >
                  {a.statut === 'LEVEE' ? '✓ Corrigée & Levée' : 'Marquer Corrigée'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
