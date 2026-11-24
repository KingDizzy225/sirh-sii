import React, { useState } from 'react';
import {
  FileSignature,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Building2,
  Scale,
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  Eye,
  Info,
  X,
  Printer
} from 'lucide-react';

export default function RuptureConventionnelleAmiable() {
  // Onglets principaux
  const [activeTab, setActiveTab] = useState('dossiers'); // 'dossiers' | 'simulateur' | 'guide'

  // Données de simulation interactive
  const [simSalary, setSimSalary] = useState(850000); // Salaire brut moyen de référence (FCFA)
  const [simYears, setSimYears] = useState(7); // Ancienneté en années
  const [simMonths, setSimMonths] = useState(4); // Mois supplémentaires
  const [simBonusNegocie, setSimBonusNegocie] = useState(2500000); // Indemnité supra-légale (FCFA)
  const [simPreavisNegocie, setSimPreavisNegocie] = useState('dispense_payee'); // 'dispense_payee' | 'effectue'

  // Calculs Code du Travail CI (Barème indicatif Art. 18 / CCNI)
  // - 30% du salaire moyen par an pour les 5 premières années
  // - 35% du salaire moyen par an pour les années de 6 à 10
  // - 40% du salaire moyen par an au-delà de 10 ans
  const totalAncienneteDecimal = simYears + simMonths / 12;
  const calcLegalIndemnity = () => {
    let ind = 0;
    const base = simSalary;
    const tranche1 = Math.min(totalAncienneteDecimal, 5);
    ind += tranche1 * (base * 0.30);

    if (totalAncienneteDecimal > 5) {
      const tranche2 = Math.min(totalAncienneteDecimal - 5, 5);
      ind += tranche2 * (base * 0.35);
    }
    if (totalAncienneteDecimal > 10) {
      const tranche3 = totalAncienneteDecimal - 10;
      ind += tranche3 * (base * 0.40);
    }
    return Math.round(ind);
  };

  const legalIndemnity = calcLegalIndemnity();
  const preavisAmount = simPreavisNegocie === 'dispense_payee' ? simSalary * 2 : 0; // 2 mois de préavis cadre/agent
  const congesPayesReliquat = Math.round(simSalary * 0.8); // estimation reliquat 18 jours
  const totalRuptureBrut = legalIndemnity + simBonusNegocie + preavisAmount + congesPayesReliquat;

  // Régime fiscal & social CI pour indemnités transactionnelles amiables
  // En CI: l'indemnité de licenciement / rupture légale est exonérée d'ITS et de cotisations CNPS
  // La fraction supra-légale est fiscalement allégée sous conditions d'accord transactionnel sous seing privé
  const exonerationLegale = legalIndemnity;
  const fractionImposableEstimee = Math.max(0, simBonusNegocie * 0.2); // 20% retenue forfaitaire prévisionnelle
  const totalNetEstime = totalRuptureBrut - fractionImposableEstimee;

  // Liste des dossiers de ruptures conventionnelles
  const [dossiers, setDossiers] = useState([
    {
      id: 'RC-2026-001',
      matricule: 'EMP-0142',
      nom: 'Kouassi Konan Marc',
      poste: 'Chef de Caisse Senior',
      agence: 'Agence Abidjan Plateau',
      departement: 'Opérations & Guichets',
      anciennete: '8 ans 3 mois',
      salaireRef: 720000,
      indemniteTotale: 6850000,
      dateSignature: '2026-11-05',
      dateFinRetractation: '2026-11-20',
      joursRestantsRetractation: 3,
      statut: 'retractation', // 'negociation', 'retractation', 'homologation', 'solde'
      motifDepart: 'Projet entrepreneurial agro-business',
      accordTransacSigne: true,
      homologationInspection: 'En attente - Délai légal J-15',
      preventPrudhommes: true
    },
    {
      id: 'RC-2026-002',
      matricule: 'EMP-0089',
      nom: 'Aya Touré Cissé',
      poste: 'Chargée de Clientèle Entreprises',
      agence: 'Agence Cocody Deux-Plateaux',
      departement: 'Développement Commercial',
      anciennete: '5 ans 6 mois',
      salaireRef: 950000,
      indemniteTotale: 7400000,
      dateSignature: '2026-10-18',
      dateFinRetractation: '2026-11-02',
      joursRestantsRetractation: 0,
      statut: 'homologation',
      motifDepart: 'Reconversion internationale / Expatriation',
      accordTransacSigne: true,
      homologationInspection: 'Dossier déposé Inspection Travail Cocody le 04/11',
      preventPrudhommes: true
    },
    {
      id: 'RC-2026-003',
      matricule: 'EMP-0215',
      nom: 'Yao N’Goran Bertin',
      poste: 'Technicien Support Réseau & Monétique',
      agence: 'Agence San Pedro Port',
      departement: 'Support & Systèmes',
      anciennete: '3 ans 1 mois',
      salaireRef: 480000,
      indemniteTotale: 2850000,
      dateSignature: '2026-11-12',
      dateFinRetractation: '2026-11-27',
      joursRestantsRetractation: 10,
      statut: 'retractation',
      motifDepart: 'Rapprochement familial Bouaké',
      accordTransacSigne: true,
      homologationInspection: 'Période de rétractation en cours',
      preventPrudhommes: true
    },
    {
      id: 'RC-2026-004',
      matricule: 'EMP-0034',
      nom: 'Bamba Souleymane',
      poste: 'Responsable Logistique & Approvisionnements',
      agence: 'Agence Yopougon Siporex',
      departement: 'Moyens Généraux',
      anciennete: '12 ans 9 mois',
      salaireRef: 1100000,
      indemniteTotale: 14200000,
      dateSignature: '2026-09-15',
      dateFinRetractation: '2026-09-30',
      joursRestantsRetractation: 0,
      statut: 'solde',
      motifDepart: 'Départ négocié avec création d’activité prestataire',
      accordTransacSigne: true,
      homologationInspection: 'Homologation sans réserve accordée le 12/10/2026',
      preventPrudhommes: true
    },
    {
      id: 'RC-2026-005',
      matricule: 'EMP-0311',
      nom: 'Gnagne Sarah Patricia',
      poste: 'Analyste Risques & Conformité',
      agence: 'Agence Abidjan Plateau',
      departement: 'Contrôle & Conformité',
      anciennete: '2 ans 4 mois',
      salaireRef: 820000,
      indemniteTotale: 3200000,
      dateSignature: null,
      dateFinRetractation: null,
      joursRestantsRetractation: null,
      statut: 'negociation',
      motifDepart: 'Désaccord stratégique - Option transaction amiable bilatérale',
      accordTransacSigne: false,
      homologationInspection: 'Entretiens préalables RH en cours',
      preventPrudhommes: true
    }
  ]);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Formulaire nouveau dossier
  const [newFormData, setNewFormData] = useState({
    nom: '',
    matricule: '',
    poste: '',
    agence: 'Agence Abidjan Plateau',
    anciennete: '4 ans',
    salaireRef: 750000,
    indemniteTotale: 4500000,
    motifDepart: 'Accord mutuel convenu'
  });

  const handleCreateDossier = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `RC-2026-00${dossiers.length + 1}`,
      matricule: newFormData.matricule || 'EMP-0410',
      nom: newFormData.nom,
      poste: newFormData.poste,
      agence: newFormData.agence,
      departement: 'Ressources Humaines & Exploitation',
      anciennete: newFormData.anciennete,
      salaireRef: Number(newFormData.salaireRef),
      indemniteTotale: Number(newFormData.indemniteTotale),
      dateSignature: new Date().toISOString().split('T')[0],
      dateFinRetractation: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      joursRestantsRetractation: 15,
      statut: 'retractation',
      motifDepart: newFormData.motifDepart,
      accordTransacSigne: true,
      homologationInspection: 'Délai de rétractation ouvert (15j)',
      preventPrudhommes: true
    };
    setDossiers([newEntry, ...dossiers]);
    setShowNewModal(false);
  };

  const filteredDossiers = dossiers.filter((d) => {
    const matchSearch =
      d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  // Indicateurs clés
  const totalDossiersActifs = dossiers.filter(d => d.statut !== 'solde').length;
  const totalMontantEngage = dossiers.reduce((acc, d) => acc + d.indemniteTotale, 0);
  const economiesPrudhommales = dossiers.length * 12500000; // estimation moyenne économie frais avocat & astreintes

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête officiel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Code du Travail CI & CCNI Art. 18
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Sécurisation Juridique 0 Risque Prud'homal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSignature className="w-7 h-7 text-[#002B7F]" />
            Ruptures Conventionnelles & Protocoles Transactionnels Amiables
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Gestion sécurisée des séparations amiables : simulateur d'indemnité, chronomètre de rétractation de 15 jours,
            protocole sous seing privé et suivi d'homologation auprès de l'Inspection du Travail de Côte d'Ivoire.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#002B7F] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau Protocole Amiable
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Dossiers en cours</span>
            <Clock className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalDossiersActifs} dossiers</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-amber-600">
              {dossiers.filter(d => d.statut === 'retractation').length}
            </span> en période légale de rétractation
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Engagé 2026</span>
            <DollarSign className="w-5 h-5 text-[#008000]" />
          </div>
          <div className="text-2xl font-bold text-[#008000]">
            {(totalMontantEngage / 1000000).toFixed(2)} M FCFA
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Indemnités légales + supra-légales transactionnelles
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Contentieux Prud'homal Évité</span>
            <Scale className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {(economiesPrudhommales / 1000000).toFixed(1)} M FCFA
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% accords sous seing privé validés
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Délai Rétractation Moyen</span>
            <ShieldCheck className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-[#002B7F]">15 Jours</div>
          <div className="text-xs text-slate-500 mt-1">
            Respect strict de la règle d'ordre public CI
          </div>
        </div>
      </div>

      {/* Navigation Onglets */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('dossiers')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'dossiers'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Registre des Dossiers de Rupture ({dossiers.length})
        </button>
        <button
          onClick={() => setActiveTab('simulateur')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'simulateur'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Simulateur d'Indemnité & Exonération Fiscale CI
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'guide'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          Protocole Juridique & Formalités Inspection du Travail
        </button>
      </div>

      {/* Onglet 1: Registre des Dossiers */}
      {activeTab === 'dossiers' && (
        <div className="space-y-4">
          {/* Barre de recherche et filtres */}
          <div className="bg-white p-4 rounded-b-xl border border-t-0 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule, poste, ID dossier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              >
                <option value="all">Tous les statuts</option>
                <option value="negociation">1. En négociation bilatérale</option>
                <option value="retractation">2. Délai de rétractation (15j en cours)</option>
                <option value="homologation">3. Homologation Inspection Travail</option>
                <option value="solde">4. Clôturé et Soldé</option>
              </select>
            </div>
          </div>

          {/* Table des dossiers */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Réf. Dossier & Collaborateur</th>
                    <th className="py-3 px-4">Poste & Agence</th>
                    <th className="py-3 px-4">Ancienneté</th>
                    <th className="py-3 px-4">Indemnité Négociée</th>
                    <th className="py-3 px-4">Statut & Échéance Rétractation</th>
                    <th className="py-3 px-4">Homologation Inspection</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDossiers.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{d.nom}</div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                          <span className="font-bold text-[#002B7F]">{d.id}</span> • {d.matricule}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{d.poste}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {d.agence}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium">{d.anciennete}</span>
                        <div className="text-xs text-slate-400">
                          Réf: {d.salaireRef.toLocaleString('fr-FR')} FCFA
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#008000]">
                          {d.indemniteTotale.toLocaleString('fr-FR')} FCFA
                        </div>
                        <div className="text-xs text-slate-400">Net estimé sécurisé</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {d.statut === 'retractation' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 animate-spin" /> J-{d.joursRestantsRetractation} rétractation
                            </span>
                            <div className="text-xs text-slate-500">
                              Expire le {new Date(d.dateFinRetractation).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        )}
                        {d.statut === 'homologation' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-[#002B7F] border border-blue-200">
                            <Building2 className="w-3 h-3" /> Dépôt Inspection
                          </span>
                        )}
                        {d.statut === 'solde' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-[#008000] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Soldé & Clôturé
                          </span>
                        )}
                        {d.statut === 'negociation' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <FileSignature className="w-3 h-3" /> Négociation amiable
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-600 max-w-xs">{d.homologationInspection}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedDossier(d)}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-[#002B7F] rounded-lg border border-slate-300 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Consulter Protocole
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Onglet 2: Simulateur d'Indemnité Code du Travail CI */}
      {activeTab === 'simulateur' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Paramètres de calcul */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calculator className="w-5 h-5 text-[#002B7F]" />
              Paramètres de la Transaction Amiable
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salaire Brut Moyen de Référence (12 derniers mois en FCFA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={simSalary}
                  onChange={(e) => setSimSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">FCFA</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Comprend le salaire de base et les primes régulières (hors remboursements de frais réels).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ancienneté (Années)
                </label>
                <input
                  type="number"
                  min="0"
                  max="45"
                  value={simYears}
                  onChange={(e) => setSimYears(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mois supplémentaires
                </label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={simMonths}
                  onChange={(e) => setSimMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Indemnité Transactionnelle Supra-Légale Négociée (FCFA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="50000"
                  value={simBonusNegocie}
                  onChange={(e) => setSimBonusNegocie(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">FCFA</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Bonus transactionnel d'accord amiable accordé en échange du désistement d'action.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Préavis de Séparation
              </label>
              <select
                value={simPreavisNegocie}
                onChange={(e) => setSimPreavisNegocie(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
              >
                <option value="dispense_payee">Dispense de préavis payée (2 mois indemnisés)</option>
                <option value="effectue">Préavis normalement effectué par le salarié</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-[#002B7F] flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Règle CCNI ivoirienne
              </div>
              <p>
                Barème conventionnel interprofessionnel appliqué : 30% par an (1 à 5 ans), 35% par an (6 à 10 ans), et 40% par an au-delà.
              </p>
            </div>
          </div>

          {/* Résultat détaillé du décompte */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-5 h-5 text-[#008000]" />
              Décompte Financier & Régime Fiscal DGI / CNPS
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 uppercase font-semibold">Indemnité Légale Minimale</div>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {legalIndemnity.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-1">
                  100% Exonérée CNPS & ITS
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 uppercase font-semibold">Bonus Supra-Légal Négocié</div>
                <div className="text-xl font-bold text-[#002B7F] mt-1">
                  {simBonusNegocie.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Transaction sous seing privé
                </div>
              </div>
            </div>

            {/* Tableau récapitulatif */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Composante de la Rupture</th>
                    <th className="py-2.5 px-3 text-right">Montant Brut</th>
                    <th className="py-2.5 px-3">Statut Fiscal & Social (CI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Indemnité de rupture légale / CCNI</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                      {legalIndemnity.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-2.5 px-3 text-emerald-600 font-medium">Exonération totale d'impôt et CNPS</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Indemnité supra-légale transactionnelle</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-900">
                      {simBonusNegocie.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">Exonération selon plafond fiscal DGI</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Indemnité compensatrice de préavis (2 mois)</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                      {preavisAmount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-2.5 px-3 text-amber-700">Soumis aux retenues ITS & CNPS ordinaires</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Indemnité compensatrice de congés payés</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                      {congesPayesReliquat.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-2.5 px-3 text-amber-700">Soumis aux retenues ITS & CNPS ordinaires</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-3 px-3 text-slate-900">TOTAL BRUT À VERSER PAR L'ENTREPRISE</td>
                    <td className="py-3 px-3 text-right text-[#002B7F] text-sm">
                      {totalRuptureBrut.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-3 text-slate-500">Montant total déductible fiscalement</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bannière du Net Estimé Collaborateur */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                  Net Estimé Garanti au Collaborateur
                </div>
                <div className="text-2xl font-black text-[#008000] mt-0.5">
                  {totalNetEstime.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Incluant certificat de travail, attestation CNPS de fin de contrat et reçu pour solde de tout compte.
                </div>
              </div>
              <ShieldCheck className="w-12 h-12 text-[#008000] opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Onglet 3: Guide Juridique et Chronologie Code du Travail CI */}
      {activeTab === 'guide' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#002B7F]" />
              Protocole d'Accord Amiable & Sécurisation selon le Droit Ivoirien
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Les 4 étapes obligatoires pour conférer à la rupture conventionnelle une force de chose jugée inattaquable devant le Tribunal du Travail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
              <div className="w-7 h-7 bg-[#002B7F] text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Entretiens Préalables</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Au minimum 2 entretiens bilatéraux. Le salarié peut se faire assister par un délégué du personnel de son agence. Consentement libre et éclairé.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
              <div className="w-7 h-7 bg-[#002B7F] text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Signature du Protocole</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Convention sous seing privé fixant la date de fin, les indemnités légales et supra-légales, et les clauses réciproques de désistement d'action.
              </p>
            </div>

            <div className="border border-amber-200 rounded-xl p-4 bg-amber-50 relative">
              <div className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h3 className="font-bold text-amber-900 text-sm mb-1">Délai Rétractation 15J</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Délai impératif d'ordre public de 15 jours calendaires à compter du lendemain de la signature. Notification par lettre remise contre décharge.
              </p>
            </div>

            <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50 relative">
              <div className="w-7 h-7 bg-[#008000] text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h3 className="font-bold text-emerald-900 text-sm mb-1">Homologation Inspection</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Transmission du dossier complet à l'Inspection du Travail de rattachement pour visa de conformité légale et délivrance du quitus social.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Clause de Clôture Définitive (Art. 2044 et suivants du Code Civil CI)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              « Les parties reconnaissent expressément que le présent protocole transactionnel est conclu sous le bénéfice des dispositions régissant la transaction civile.
              En contrepartie du versement de l'indemnité convenue, le salarié déclare renoncer expressément et définitivement à toute instance, action ou réclamation
              de quelque nature que ce soit à l'encontre de la société SII CI née ou à naître de l'exécution ou de la cessation de son contrat de travail. »
            </p>
          </div>
        </div>
      )}

      {/* Modal Consultation Détail du Protocole */}
      {selectedDossier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#002B7F]">{selectedDossier.id}</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Protocole Transactionnel — {selectedDossier.nom}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDossier(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium">Poste & Entité :</span>
                <p className="font-semibold text-slate-800">{selectedDossier.poste}</p>
                <p className="text-slate-500">{selectedDossier.agence}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Ancienneté / Salaire Réf :</span>
                <p className="font-semibold text-slate-800">{selectedDossier.anciennete}</p>
                <p className="text-slate-500">{selectedDossier.salaireRef.toLocaleString('fr-FR')} FCFA / mois</p>
              </div>
            </div>

            {/* Suivi des 15 jours */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Délai Légal de Rétractation (15 Jours Calendaires)</span>
                {selectedDossier.statut === 'retractation' ? (
                  <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    J-{selectedDossier.joursRestantsRetractation} restant(s)
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Délai purgé sans rétractation
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#002B7F] h-full"
                  style={{
                    width: selectedDossier.statut === 'retractation'
                      ? `${((15 - selectedDossier.joursRestantsRetractation) / 15) * 100}%`
                      : '100%'
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Signé le : {selectedDossier.dateSignature || 'N/A'}</span>
                <span>Échéance : {selectedDossier.dateFinRetractation || 'N/A'}</span>
              </div>
            </div>

            {/* Indemnité convenue */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-900 font-medium">Indemnité Globale Négociée</div>
                <div className="text-xl font-bold text-[#002B7F]">
                  {selectedDossier.indemniteTotale.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 bg-white border border-blue-200 rounded font-semibold text-[#002B7F]">
                Net d'impôt DGI visé
              </span>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
              <span className="font-semibold text-slate-800">Homologation Inspection du Travail :</span>
              <p className="mt-0.5">{selectedDossier.homologationInspection}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  alert(`Téléchargement du Protocole Sous Seing Privé Réf: ${selectedDossier.id} certifié conforme CI.`);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-300"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                Imprimer Accord Sous Seing Privé
              </button>
              <button
                onClick={() => setSelectedDossier(null)}
                className="px-4 py-2 bg-[#002B7F] text-white rounded-lg text-xs font-semibold hover:bg-blue-900"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création Nouveau Dossier */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[#002B7F]" />
                Initier une Rupture Conventionnelle
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDossier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom & Prénoms du Collaborateur</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Yao Kouadio Franck"
                  value={newFormData.nom}
                  onChange={(e) => setNewFormData({ ...newFormData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Matricule</label>
                  <input
                    type="text"
                    placeholder="EMP-0..."
                    value={newFormData.matricule}
                    onChange={(e) => setNewFormData({ ...newFormData, matricule: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Poste occupé</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Caissier Principal"
                    value={newFormData.poste}
                    onChange={(e) => setNewFormData({ ...newFormData, poste: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agence de rattachement</label>
                  <select
                    value={newFormData.agence}
                    onChange={(e) => setNewFormData({ ...newFormData, agence: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                  >
                    <option value="Agence Abidjan Plateau">Agence Abidjan Plateau</option>
                    <option value="Agence Cocody Deux-Plateaux">Agence Cocody Deux-Plateaux</option>
                    <option value="Agence Yopougon Siporex">Agence Yopougon Siporex</option>
                    <option value="Agence San Pedro Port">Agence San Pedro Port</option>
                    <option value="Agence Grand-Bassam">Agence Grand-Bassam</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ancienneté</label>
                  <input
                    type="text"
                    placeholder="ex: 6 ans 2 mois"
                    value={newFormData.anciennete}
                    onChange={(e) => setNewFormData({ ...newFormData, anciennete: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salaire Moyen Réf (FCFA)</label>
                  <input
                    type="number"
                    value={newFormData.salaireRef}
                    onChange={(e) => setNewFormData({ ...newFormData, salaireRef: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant Transactionnel Convenu</label>
                  <input
                    type="number"
                    value={newFormData.indemniteTotale}
                    onChange={(e) => setNewFormData({ ...newFormData, indemniteTotale: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motif convenu d'un commun accord</label>
                <textarea
                  rows="2"
                  value={newFormData.motifDepart}
                  onChange={(e) => setNewFormData({ ...newFormData, motifDepart: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B7F] text-white font-semibold rounded-lg text-xs hover:bg-blue-900"
                >
                  Ouvrir le Dossier & Déclencher les 15J
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
