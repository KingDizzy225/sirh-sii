import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Clock, 
  Award, 
  TrendingUp, 
  Users, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Layers,
  Calculator,
  Info
} from 'lucide-react';

// ANALYTIQUE RECRUTEMENT & ROI (Norme ISO 30414 / SHRM) :
// 1. Cost-per-Hire (CPH) = (Coûts externes + Coûts internes) / Nb d'embauches
// 2. Time-to-Fill (TTF) = Délai moyen en jours de l'ouverture du poste à la signature de l'offre
// 3. Quality of Hire (QoH) = Score composite /100 (Réussite essai + Perf 6 mois + Rétention 12 mois)

const CHANNELS_DATA = [
  {
    id: 'CHAN-01',
    canal: 'Cooptation Interne Salariés',
    embauches: 11,
    coutTotalFcfa: 1650000, // Primes de cooptation (150k/embauche)
    timeToFillJours: 24,
    tauxReussiteEssai: 95,
    retention12Mois: 91,
    qualityOfHireScore: 93
  },
  {
    id: 'CHAN-02',
    canal: 'Partenariat Campus (INP-HB / ESATIC)',
    embauches: 8,
    coutTotalFcfa: 1200000,
    timeToFillJours: 28,
    tauxReussiteEssai: 88,
    retention12Mois: 87,
    qualityOfHireScore: 88
  },
  {
    id: 'CHAN-03',
    canal: 'Sourcing Direct LinkedIn & Portail Carrières',
    embauches: 10,
    coutTotalFcfa: 3400000,
    timeToFillJours: 36,
    tauxReussiteEssai: 85,
    retention12Mois: 82,
    qualityOfHireScore: 84
  },
  {
    id: 'CHAN-04',
    canal: 'Cabinets de Chasse & Recrutement Externes',
    embauches: 5,
    coutTotalFcfa: 9250000, // Honoraires 15-20% annuel
    timeToFillJours: 58,
    tauxReussiteEssai: 80,
    retention12Mois: 78,
    qualityOfHireScore: 79
  }
];

const DEPARTMENTS_TTF = [
  { dept: 'Opérations Réseau & Caisse', embauches: 14, ttfJours: 22, cibleJours: 25, goulot: 'Aucun (Fluide)' },
  { dept: 'Commercial & Vente B2B', embauches: 8, ttfJours: 34, cibleJours: 30, goulot: 'Disponibilité entretiens managers (+6j)' },
  { dept: 'IT, Cybersécurité & Télécoms', embauches: 7, ttfJours: 54, cibleJours: 40, goulot: 'Pénurie profils seniors & tests techniques (+14j)' },
  { dept: 'Finance, Audit & Risques', embauches: 5, ttfJours: 41, cibleJours: 35, goulot: 'Circuit validation offre DAF (+5j)' }
];

export default function AnalytiqueRecrutementRoi() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'channels' | 'simulator'
  const [cabinetHiresToShift, setCabinetHiresToShift] = useState(3);

  // KPIs globaux consolidés
  const globalStats = useMemo(() => {
    const totalEmbauches = CHANNELS_DATA.reduce((acc, c) => acc + c.embauches, 0);
    const totalCout = CHANNELS_DATA.reduce((acc, c) => acc + c.coutTotalFcfa, 0);
    const avgCph = totalEmbauches > 0 ? Math.round(totalCout / totalEmbauches) : 0;
    const avgTtf = Math.round(
      CHANNELS_DATA.reduce((acc, c) => acc + c.timeToFillJours * c.embauches, 0) / totalEmbauches
    );
    const avgQoh = Math.round(
      CHANNELS_DATA.reduce((acc, c) => acc + c.qualityOfHireScore * c.embauches, 0) / totalEmbauches
    );
    return { totalEmbauches, totalCout, avgCph, avgTtf, avgQoh };
  }, []);

  // Calcul simulateur d'économie (Bascule Cabinet 1.85M/embauche -> Cooptation 150k/embauche)
  const simulation = useMemo(() => {
    const coutUnitaireCabinet = 1850000;
    const coutUnitaireCooptation = 150000;
    const economie = cabinetHiresToShift * (coutUnitaireCabinet - coutUnitaireCooptation);
    const joursGagnes = cabinetHiresToShift * (58 - 24);
    return { economie, joursGagnes };
  }, [cabinetHiresToShift]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                People Analytics & ROI
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Norme ISO 30414 — Acquisition de Talents
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Analytique Recrutement : Cost-per-Hire, Time-to-Fill & Quality of Hire
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Mesurez scientifiquement la rentabilité de vos canaux de sourcing, identifiez les goulots d'étranglement des recrutements et optimisez votre budget d'embauche annuel.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Tableau de Bord & TTF
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'channels'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ROI par Canal (QoH)
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-[#008000] text-white shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Simulateur d'Économies
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cost-per-Hire Moyen</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1 font-mono">
              {globalStats.avgCph.toLocaleString('fr-FR')} F
            </h3>
            <p className="text-xs text-gray-500 mt-1">Sur {globalStats.totalEmbauches} embauches 2026</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Time-to-Fill Moyen</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{globalStats.avgTtf} jours</h3>
            <p className="text-xs text-gray-500 mt-1">Cible Groupe : 32 jours</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quality of Hire (QoH)</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{globalStats.avgQoh} / 100</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">Essai + Rétention 12 mois</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Sourcing Engagé</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1 font-mono">
              {(globalStats.totalCout / 1000000).toFixed(2)} M F
            </h3>
            <p className="text-xs text-gray-500 mt-1">Dont 60% en cabinets externes</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <BarChart3 className="w-6 h-6 text-[#002B7F]" />
          </div>
        </div>
      </div>

      {/* Vue 1 : Délais par Département (Time-to-Fill) & Goulots */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#002B7F]" />
              Analyse du Délai de Recrutement (Time-to-Fill) & Goulots par Département
            </h3>
            <span className="text-xs font-semibold text-[#002B7F] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              Exercice 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Département / Famille de Métiers</th>
                  <th className="py-3.5 px-4 text-center">Embauches</th>
                  <th className="py-3.5 px-4 text-center">Délai Réel (TTF)</th>
                  <th className="py-3.5 px-4 text-center">Objectif Cible</th>
                  <th className="py-3.5 px-4">Goulot d'Étranglement Identifié</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {DEPARTMENTS_TTF.map((d, idx) => {
                  const isOver = d.ttfJours > d.cibleJours;
                  return (
                    <tr key={idx} className="hover:bg-blue-50/30">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{d.dept}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-700">{d.embauches}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono font-bold px-2.5 py-0.5 rounded text-xs ${
                          isOver ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {d.ttfJours} jours
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-500">{d.cibleJours} j</td>
                      <td className="py-3.5 px-4 text-xs text-gray-700">
                        {isOver ? (
                          <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            {d.goulot}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[#008000] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#008000] flex-shrink-0" />
                            {d.goulot}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : ROI & Quality of Hire par Canal */}
      {activeTab === 'channels' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#008000]" />
              Comparatif Coût Unitaire & Qualité d'Embauche (QoH) par Canal de Sourcing
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Canal de Sourcing</th>
                  <th className="py-3.5 px-4 text-center">Recrues</th>
                  <th className="py-3.5 px-4 text-right">Coût / Embauche (CPH)</th>
                  <th className="py-3.5 px-4 text-center">Délai (TTF)</th>
                  <th className="py-3.5 px-4 text-center">Validation Essai</th>
                  <th className="py-3.5 px-4 text-center">Rétention 12m</th>
                  <th className="py-3.5 px-4 text-center">Score QoH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {CHANNELS_DATA.map((c) => {
                  const cph = Math.round(c.coutTotalFcfa / c.embauches);
                  return (
                    <tr key={c.id} className="hover:bg-blue-50/30">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{c.canal}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-800">{c.embauches}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#002B7F]">
                        {cph.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-700">{c.timeToFillJours} j</td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-700">{c.tauxReussiteEssai}%</td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-700">{c.retention12Mois}%</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          c.qualityOfHireScore >= 90
                            ? 'bg-emerald-50 text-[#008000] border border-emerald-200'
                            : c.qualityOfHireScore >= 82
                            ? 'bg-blue-50 text-[#002B7F] border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {c.qualityOfHireScore} / 100
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 3 : Simulateur d'Optimisation Budgétaire */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#002B7F]" />
              Simulateur d'Optimisation du Mix Sourcing
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Testez l'impact financier et opérationnel en basculant une partie des recrutements confiés aux <strong>cabinets externes (1 850 000 F / embauche)</strong> vers le programme de <strong>Cooptation Interne (150 000 F / embauche)</strong>.
            </p>

            <div className="pt-2">
              <label className="text-xs font-semibold text-gray-800 flex justify-between mb-2">
                <span>Nombre d'embauches basculées vers la Cooptation :</span>
                <span className="font-mono text-[#002B7F] text-sm font-bold">{cabinetHiresToShift} postes / an</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={cabinetHiresToShift}
                onChange={(e) => setCabinetHiresToShift(Number(e.target.value))}
                className="w-full accent-[#002B7F]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                <span>1 poste</span>
                <span>5 postes</span>
                <span>10 postes</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#008000]" />
                Gains Directs Estimés pour la DRH
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-xs font-semibold text-[#008000] uppercase">Économie Budgétaire</span>
                  <h4 className="text-2xl font-black text-[#008000] mt-1 font-mono">
                    {simulation.economie.toLocaleString('fr-FR')}
                  </h4>
                  <span className="text-[11px] text-gray-600">FCFA économisés / an</span>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-xs font-semibold text-[#002B7F] uppercase">Temps Gagné</span>
                  <h4 className="text-2xl font-black text-[#002B7F] mt-1 font-mono">
                    {simulation.joursGagnes} jours
                  </h4>
                  <span className="text-[11px] text-gray-600">De vacance de poste évités</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#002B7F] flex-shrink-0" />
              <span>La cooptation interne offre en plus un score Quality of Hire de <strong>93/100</strong> contre 79/100 pour les cabinets externes.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
