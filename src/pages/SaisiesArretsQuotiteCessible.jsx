import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  DollarSign, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Calendar, 
  Users, 
  PieChart, 
  Building2,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';

// BARÈME LÉGAL DE LA QUOTITÉ CESSIBLE & SAISISSABLE (Article 34 Code du Travail CI)
// Tranche 1 : Jusqu'à 50 000 FCFA -> 1/10 (10%)
// Tranche 2 : De 50 001 à 100 000 FCFA -> 1/5 (20%)
// Tranche 3 : De 100 001 à 200 000 FCFA -> 1/3 (33.33%)
// Tranche 4 : Au-delà de 200 000 FCFA -> 1/2 (50%)
// Règle d'or : La pension alimentaire a la priorité absolue d'exécution.

const MOCK_GARNISHMENT_RECORDS = [
  {
    id: 'SAIS-2026-003',
    matricule: 'MTR-2022-0142',
    name: 'Kouassi Marc-Antoine',
    poste: 'Caissier Principal',
    agence: 'Agence Centrale Plateau',
    salaireNetMensuel: 450000,
    creancier: 'Crédit Mutuel d\'Abidjan (Prêt personnel contentieux)',
    typeSaisie: 'SAISIE_ARRET_JUDICIAIRE', // 'PENSION_ALIMENTAIRE' | 'ATD_FISC' | 'SAISIE_ARRET_JUDICIAIRE' | 'CESSION_VOLONTAIRE'
    montantTotalDette: 1800000,
    montantDejaPreleve: 600000,
    dateNotificationHuissier: '2026-05-15',
    referenceActe: 'Jugement N° 412/2026 TPI Abidjan Plateau',
    mensualitePrelevee: 140000, // Dans la limite de la quotité
    statut: 'ACTIF', // 'ACTIF' | 'SOLDE' | 'SUSPENDU'
    historiquePrelevements: [
      { mois: 'Octobre 2026', montant: 140000, date: '2026-10-28', statut: 'Reversé à l\'étude d\'huissier' },
      { mois: 'Septembre 2026', montant: 140000, date: '2026-09-28', statut: 'Reversé à l\'étude d\'huissier' },
      { mois: 'Août 2026', montant: 140000, date: '2026-08-28', statut: 'Reversé à l\'étude d\'huissier' },
    ]
  },
  {
    id: 'SAIS-2026-009',
    matricule: 'MTR-2020-0078',
    name: 'Touré Adama',
    poste: 'Chargé d\'Affaires Entreprises',
    agence: 'Agence Zone Industrielle Vridi',
    salaireNetMensuel: 620000,
    creancier: 'Mme Koné Aïssata (Pension Alimentaire Enfants)',
    typeSaisie: 'PENSION_ALIMENTAIRE',
    montantTotalDette: 1200000,
    montantDejaPreleve: 800000,
    dateNotificationHuissier: '2026-01-20',
    referenceActe: 'Ordonnance de non-conciliation Juge aux affaires matrimoniales',
    mensualitePrelevee: 100000,
    statut: 'ACTIF',
    historiquePrelevements: [
      { mois: 'Octobre 2026', montant: 100000, date: '2026-10-28', statut: 'Virement direct compte tutelle' },
      { mois: 'Septembre 2026', montant: 100000, date: '2026-09-28', statut: 'Virement direct compte tutelle' }
    ]
  },
  {
    id: 'SAIS-2025-014',
    matricule: 'MTR-2018-0023',
    name: 'Soro Aminata',
    poste: 'Responsable Crédit PME',
    agence: 'Siège Social Plateau',
    salaireNetMensuel: 580000,
    creancier: 'Direction Générale des Impôts (ATD Impôt Foncier)',
    typeSaisie: 'ATD_FISC',
    montantTotalDette: 350000,
    montantDejaPreleve: 350000,
    dateNotificationHuissier: '2025-08-10',
    referenceActe: 'Avis à Tiers Détenteur DGI Réf 88921-Plateau',
    mensualitePrelevee: 175000,
    statut: 'SOLDE',
    historiquePrelevements: [
      { mois: 'Octobre 2025', montant: 175000, date: '2025-10-28', statut: 'Quittance libératoire DGI émise' },
      { mois: 'Septembre 2025', montant: 175000, date: '2025-09-28', statut: 'Paiement effectué Recette' }
    ]
  }
];

export default function SaisiesArretsQuotiteCessible() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(MOCK_GARNISHMENT_RECORDS[0]);
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'calculator' | 'schedule'

  // Calcul du barème d'ordre public de la quotité cessible sous l'Art. 34 Code du Travail CI
  const calculateQuotite = (net) => {
    let q1 = 0; // 0 à 50k (1/10)
    let q2 = 0; // 50k à 100k (1/5)
    let q3 = 0; // 100k à 200k (1/3)
    let q4 = 0; // au-delà de 200k (1/2)

    if (net > 0) {
      const part1 = Math.min(net, 50000);
      q1 = part1 * 0.10;
    }
    if (net > 50000) {
      const part2 = Math.min(net - 50000, 50000);
      q2 = part2 * 0.20;
    }
    if (net > 100000) {
      const part3 = Math.min(net - 100000, 100000);
      q3 = part3 * (1 / 3);
    }
    if (net > 200000) {
      const part4 = net - 200000;
      q4 = part4 * 0.50;
    }

    const totalSaisissableMax = Math.round(q1 + q2 + q3 + q4);
    const fractionInsaisissable = net - totalSaisissableMax;
    const tauxEffectifMax = net > 0 ? Math.round((totalSaisissableMax / net) * 100) : 0;

    return {
      totalSaisissableMax,
      fractionInsaisissable,
      tauxEffectifMax,
      tranches: [
        { label: '0 à 50 000 FCFA (1/10e)', montant: Math.round(q1) },
        { label: '50 001 à 100 000 FCFA (1/5e)', montant: Math.round(q2) },
        { label: '100 001 à 200 000 FCFA (1/3e)', montant: Math.round(q3) },
        { label: 'Au-delà de 200 000 FCFA (1/2)', montant: Math.round(q4) }
      ]
    };
  };

  // State pour le simulateur libre
  const [simNet, setSimNet] = useState(500000);
  const simResult = useMemo(() => calculateQuotite(Number(simNet) || 0), [simNet]);

  const filteredCases = useMemo(() => {
    return MOCK_GARNISHMENT_RECORDS.filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.creancier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.referenceActe.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'ALL' || c.typeSaisie === typeFilter;
      return matchSearch && matchType;
    });
  }, [searchTerm, typeFilter]);

  // Statistiques globales
  const stats = useMemo(() => {
    let totalDette = 0;
    let totalPreleveMois = 0;
    let actifs = 0;

    MOCK_GARNISHMENT_RECORDS.forEach(c => {
      totalDette += (c.montantTotalDette - c.montantDejaPreleve);
      if (c.statut === 'ACTIF') {
        totalPreleveMois += c.mensualitePrelevee;
        actifs++;
      }
    });

    return { totalDette, totalPreleveMois, actifs, totalCases: MOCK_GARNISHMENT_RECORDS.length };
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
                Paie & Droit des Obligations
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Art. 34 Code du Travail CI
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Saisies-Arrêts & Barème de Quotité Cessible
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Gestion rigoureuse des avis à tiers détenteur (ATD), pensions alimentaires prioritaires et saisies judiciaires. Application stricte du barème progressif d'ordre public pour préserver le salaire vital insaisissable.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Registre des Saisies
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Simulateur de Quotité
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-[#008000] text-white shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Échéancier & Relevé
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dossiers Notifiés</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.totalCases} actes</h3>
            <p className="text-xs text-gray-500 mt-1">Tribunaux & DGI</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Saisies Actives en Paie</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.actifs} salarié(s)</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Retenues automatiques</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Retenues Mensuelles</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.totalPreleveMois.toLocaleString('fr-FR')} FCFA</h3>
            <p className="text-xs text-gray-500 mt-1">Reversé aux huissiers / DGI</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Encours Créances Restant</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDette.toLocaleString('fr-FR')} FCFA</h3>
            <p className="text-xs text-gray-500 mt-1">Solde global à apurer</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Règle légale d'ordre public */}
      <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#002B7F] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#002B7F] font-semibold">Principe de Protection du Salaire Vital (Art. 34 Code du Travail CI) : </strong>
          L'employeur est tiers saisi légal. Il a l'obligation stricte de ne prélever les retenues judiciaires que dans la <strong>limite maximale de la quotité cessible</strong>, calculée par tranche progressive sur le salaire net.
          <span className="block mt-1">
            <strong>Exception d'ordre public :</strong> Les <em>pensions alimentaires</em> sont prélevées en priorité absolue sur l'intégralité du salaire, y compris sur la fraction insaisissable jusqu'à concurrence du montant fixé par le juge.
          </span>
        </div>
      </div>

      {/* Vue 1 : Registre des Saisies */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Filtres & Recherche */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher salarié, créancier, acte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-500 font-medium">Type d'acte :</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent font-medium text-gray-700 focus:outline-none"
                >
                  <option value="ALL">Tous les actes</option>
                  <option value="PENSION_ALIMENTAIRE">Pension Alimentaire (Priorité 1)</option>
                  <option value="ATD_FISC">ATD Fiscal Trésor Public</option>
                  <option value="SAISIE_ARRET_JUDICIAIRE">Saisie-Arrêt Judiciaire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Salarié / Salaire Net</th>
                  <th className="py-3.5 px-4">Créancier & Nature Acte</th>
                  <th className="py-3.5 px-4">Quotité Max Légale</th>
                  <th className="py-3.5 px-4">Retenue Mensuelle</th>
                  <th className="py-3.5 px-4">Reste Dû</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCases.map((c) => {
                  const quotiteInfo = calculateQuotite(c.salaireNetMensuel);
                  const resteDu = c.montantTotalDette - c.montantDejaPreleve;

                  return (
                    <tr 
                      key={c.id} 
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCase(c);
                        setActiveTab('schedule');
                      }}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{c.matricule} • Net: {c.salaireNetMensuel.toLocaleString('fr-FR')} F</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-gray-900 text-xs font-semibold">{c.creancier}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-1">{c.referenceActe}</div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.typeSaisie === 'PENSION_ALIMENTAIRE'
                            ? 'bg-amber-100 text-amber-900'
                            : c.typeSaisie === 'ATD_FISC'
                            ? 'bg-blue-100 text-[#002B7F]'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {c.typeSaisie === 'PENSION_ALIMENTAIRE' ? 'Pension Prioritaire' : c.typeSaisie === 'ATD_FISC' ? 'Avis Trésor Public' : 'Saisie Judiciaire'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="font-bold text-gray-800">
                          {quotiteInfo.totalSaisissableMax.toLocaleString('fr-FR')} FCFA
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {quotiteInfo.tauxEffectifMax}% du salaire net
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="font-bold text-red-600">
                          - {c.mensualitePrelevee.toLocaleString('fr-FR')} FCFA
                        </span>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Conforme quotité
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="font-bold text-gray-900">
                          {resteDu.toLocaleString('fr-FR')} FCFA
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Sur {c.montantTotalDette.toLocaleString('fr-FR')} FCFA
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          c.statut === 'ACTIF'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {c.statut === 'ACTIF' ? 'Prélèvement actif' : 'Dette soldée'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setActiveTab('schedule');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
                        >
                          Échéancier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : Simulateur de Quotité Cessible Interactif */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#002B7F]" />
              Calculateur de Quotité Légale Instantané
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Saisissez le salaire net mensuel imposable du collaborateur pour déterminer la part maximale saisissable selon les 4 tranches progressives de l'Article 34 du Code du Travail de Côte d'Ivoire.
            </p>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Salaire Net Mensuel du Salarié (FCFA)
              </label>
              <input
                type="number"
                step="5000"
                value={simNet}
                onChange={(e) => setSimNet(e.target.value)}
                className="w-full text-base font-mono font-bold text-[#002B7F] border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
              <h4 className="text-xs font-bold text-gray-700 uppercase">Décomposition par Tranche Légale :</h4>
              {simResult.tranches.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">{t.label}</span>
                  <span className="font-mono font-bold text-gray-900">{t.montant.toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#008000]" />
                Résultat d'Insaisissabilité Garanti
              </h3>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-xs font-semibold text-[#008000] uppercase">Fraction Insaisissable</span>
                  <h4 className="text-2xl font-black text-[#008000] mt-1 font-mono">
                    {simResult.fractionInsaisissable.toLocaleString('fr-FR')}
                  </h4>
                  <span className="text-[11px] text-gray-500">FCFA (Salaire vital préservé)</span>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <span className="text-xs font-semibold text-red-700 uppercase">Quotité Max Saisissable</span>
                  <h4 className="text-2xl font-black text-red-600 mt-1 font-mono">
                    {simResult.totalSaisissableMax.toLocaleString('fr-FR')}
                  </h4>
                  <span className="text-[11px] text-gray-500">FCFA ({simResult.tauxEffectifMax}% du net)</span>
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p>
                  <strong>Capacité d'emprunt ou de retenue : </strong> 
                  Le service Paie ne peut légalement pas opérer une retenue supérieure à <strong>{simResult.totalSaisissableMax.toLocaleString('fr-FR')} FCFA</strong> par mois, sauf s'il s'agit d'une dette de pension alimentaire ordonnée par jugement.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  window.alert(`Simulation enregistrée : Salaire ${simNet} FCFA -> Plafond retenue ${simResult.totalSaisissableMax} FCFA`);
                }}
                className="px-4 py-2 bg-[#002B7F] text-white text-xs font-semibold rounded-lg hover:bg-blue-900 shadow"
              >
                Exporter la Note de Cadrage Paie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Échéancier de Retenue & Relevé */}
      {activeTab === 'schedule' && selectedCase && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {selectedCase.id}
                </span>
                <span className="text-xs font-semibold text-[#002B7F] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {selectedCase.matricule}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedCase.name}</h2>
              <p className="text-sm text-gray-600">{selectedCase.poste} • {selectedCase.agence}</p>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
              <div>
                <p className="text-gray-500">Dette Initiale</p>
                <p className="font-bold text-gray-800 font-mono">{selectedCase.montantTotalDette.toLocaleString('fr-FR')} F</p>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <p className="text-gray-500">Amorti à ce jour</p>
                <p className="font-bold text-[#008000] font-mono">{selectedCase.montantDejaPreleve.toLocaleString('fr-FR')} F</p>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <p className="text-gray-500">Reste Dû</p>
                <p className="font-bold text-red-600 font-mono">
                  {(selectedCase.montantTotalDette - selectedCase.montantDejaPreleve).toLocaleString('fr-FR')} F
                </p>
              </div>
            </div>
          </div>

          {/* Historique des prélèvements reversés */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#002B7F]" />
                Historique des Retenues Opérées sur le Bulletin de Paie
              </h3>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer le Relevé de Compte Tiers Saisi
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {selectedCase.historiquePrelevements.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#002B7F] font-bold text-xs flex items-center justify-center font-mono">
                      #{idx + 1}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{item.mois}</span>
                      <p className="text-xs text-gray-500">Date valeur paie : {item.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-red-600">
                        - {item.montant.toLocaleString('fr-FR')} FCFA
                      </span>
                      <p className="text-[11px] text-[#008000]">{item.statut}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
