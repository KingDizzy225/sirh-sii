import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Heart,
  GraduationCap,
  Award,
  Shield,
  Building2,
  Calendar,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  PieChart,
  User,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  Zap,
  Info
} from 'lucide-react';

export default function BilanSocialIndividuelBsi() {
  // Liste des collaborateurs éligibles pour consultation BSI
  const employeesList = [
    {
      id: 'EMP-0142',
      nom: 'Kouassi Konan Marc',
      poste: 'Chef de Caisse Senior',
      agence: 'Agence Abidjan Plateau',
      departement: 'Opérations & Guichets',
      anciennete: '8 ans 3 mois',
      contrat: 'CDI Temps Plein',
      salaireBrutAnnuel: 8640000,
      salaireNetPercuAnnuel: 6850000,
      primesPerformances: 1200000,
      cotisationsPatronalesCnpsCmu: 1641600, // ~19% patronal CI (CNPS + CMU)
      mutuelleSanteEmployeur: 780000, // 80% prise en charge employeur
      budgetFormationFdfp: 850000, // 2 sessions certifiantes 2026
      avantagesNatureCarburant: 600000,
      droitsRetraiteIdrCapitalises: 4120000, // Provision IAS 19
      epargneTontineSiiAbondement: 240000
    },
    {
      id: 'EMP-0089',
      nom: 'Aya Touré Cissé',
      poste: 'Chargée de Clientèle Entreprises',
      agence: 'Agence Cocody Deux-Plateaux',
      departement: 'Développement Commercial',
      anciennete: '5 ans 6 mois',
      contrat: 'CDI Temps Plein',
      salaireBrutAnnuel: 11400000,
      salaireNetPercuAnnuel: 8950000,
      primesPerformances: 2400000,
      cotisationsPatronalesCnpsCmu: 2166000,
      mutuelleSanteEmployeur: 920000,
      budgetFormationFdfp: 1250000,
      avantagesNatureCarburant: 960000,
      droitsRetraiteIdrCapitalises: 3850000,
      epargneTontineSiiAbondement: 300000
    },
    {
      id: 'EMP-0034',
      nom: 'Bamba Souleymane',
      poste: 'Responsable Logistique & Approvisionnements',
      agence: 'Agence Yopougon Siporex',
      departement: 'Moyens Généraux',
      anciennete: '12 ans 9 mois',
      contrat: 'CDI Temps Plein',
      salaireBrutAnnuel: 13200000,
      salaireNetPercuAnnuel: 10450000,
      primesPerformances: 1800000,
      cotisationsPatronalesCnpsCmu: 2508000,
      mutuelleSanteEmployeur: 920000,
      budgetFormationFdfp: 600000,
      avantagesNatureCarburant: 1440000,
      droitsRetraiteIdrCapitalises: 7650000,
      epargneTontineSiiAbondement: 360000
    }
  ];

  const [selectedEmpId, setSelectedEmpId] = useState('EMP-0142');
  const [activeTab, setActiveTab] = useState('vue_globale'); // 'vue_globale' | 'detail_composantes' | 'projection'

  const currentEmp = employeesList.find((e) => e.id === selectedEmpId) || employeesList[0];

  // Calcul du "Total Rewards Package" annuel
  // Salaire net direct + Primes + Part patronale santé & prévoyance + Formations + Dotations + Abondement
  const remunerationDirecte = currentEmp.salaireNetPercuAnnuel + currentEmp.primesPerformances;
  const protectionSocialeEmployeur = currentEmp.cotisationsPatronalesCnpsCmu + currentEmp.mutuelleSanteEmployeur;
  const developpementPersonnel = currentEmp.budgetFormationFdfp;
  const avantagesPériphériques = currentEmp.avantagesNatureCarburant + currentEmp.epargneTontineSiiAbondement;

  const totalRewardsAnnuel =
    remunerationDirecte +
    protectionSocialeEmployeur +
    developpementPersonnel +
    avantagesPériphériques;

  // Ratio de valorisation : pour 100 FCFA de salaire net perçu, combien SII investit-elle réellement ?
  const multiplicateurInvestissement = (totalRewardsAnnuel / currentEmp.salaireNetPercuAnnuel).toFixed(2);

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête officiel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Total Rewards Statement • Standard Workday / Mercer
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Valorisation du Package Social Global 2026
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-7 h-7 text-[#002B7F]" />
            Bilan Social Individuel (BSI) Digital
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Visualisez et valorisez auprès de chaque collaborateur l'intégralité de son investissement employeur :
            salaire direct, protection sociale CNPS & mutuelle, formations FDFP, avantages périphériques et prévoyance retraite.
          </p>
        </div>

        {/* Sélecteur de collaborateur */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
            <User className="w-4 h-4 text-slate-500" />
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
            >
              {employeesList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nom} ({emp.poste})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#002B7F] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimer BSI Officiel
          </button>
        </div>
      </div>

      {/* Profil du collaborateur sélectionné */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-[#002B7F] flex items-center justify-center text-[#002B7F] font-bold text-xl">
            {currentEmp.nom.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentEmp.nom}</h2>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {currentEmp.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentEmp.poste} • <span className="font-semibold text-slate-700">{currentEmp.agence}</span> • {currentEmp.departement}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
              <span>Ancienneté : <strong>{currentEmp.anciennete}</strong></span>
              <span>•</span>
              <span>Statut : <strong>{currentEmp.contrat}</strong></span>
            </div>
          </div>
        </div>

        {/* Chiffre Clé : Total Rewards Annuel */}
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-4 text-right">
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Package Annuel Global Investi par SII
          </div>
          <div className="text-3xl font-black text-[#002B7F] mt-1">
            {totalRewardsAnnuel.toLocaleString('fr-FR')} <span className="text-lg font-bold">FCFA</span>
          </div>
          <div className="text-xs text-[#008000] font-semibold mt-1 flex items-center justify-end gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Soit {multiplicateurInvestissement}× le salaire net perçu en banque
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('vue_globale')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'vue_globale'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Répartition & Composantes du Package
        </button>
        <button
          onClick={() => setActiveTab('detail_composantes')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'detail_composantes'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Détail Chiffré & Justificatifs Légal / Fiscal
        </button>
        <button
          onClick={() => setActiveTab('projection')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'projection'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Capitalisation Retraite & Prévoyance Long Terme
        </button>
      </div>

      {/* Contenu Onglet 1 : Vue Globale */}
      {activeTab === 'vue_globale' && (
        <div className="space-y-6">
          {/* Les 4 Piliers du Package Total Rewards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pilier 1 : Rémunération Directe */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="w-2 h-full bg-[#002B7F] absolute left-0 top-0" />
              <div className="pl-2">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">1. Rémunération Directe</span>
                  <DollarSign className="w-4 h-4 text-[#002B7F]" />
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {remunerationDirecte.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Salaire net ({currentEmp.salaireNetPercuAnnuel.toLocaleString('fr-FR')}) + Primes de performance ({currentEmp.primesPerformances.toLocaleString('fr-FR')})
                </p>
                <div className="mt-3 text-[11px] font-semibold text-[#002B7F]">
                  {((remunerationDirecte / totalRewardsAnnuel) * 100).toFixed(1)}% du package global
                </div>
              </div>
            </div>

            {/* Pilier 2 : Protection Sociale & Santé */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="w-2 h-full bg-[#008000] absolute left-0 top-0" />
              <div className="pl-2">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">2. Protection Santé & Famille</span>
                  <Heart className="w-4 h-4 text-[#008000]" />
                </div>
                <div className="text-xl font-bold text-[#008000] mt-1">
                  {protectionSocialeEmployeur.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cotisations patronales CNPS/CMU + Mutuelle santé prise en charge à 80%
                </p>
                <div className="mt-3 text-[11px] font-semibold text-[#008000]">
                  {((protectionSocialeEmployeur / totalRewardsAnnuel) * 100).toFixed(1)}% du package global
                </div>
              </div>
            </div>

            {/* Pilier 3 : Formations & Développement */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="w-2 h-full bg-blue-600 absolute left-0 top-0" />
              <div className="pl-2">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">3. Développement & FDFP</span>
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-900 mt-1">
                  {developpementPersonnel.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Budget formations certifiantes agrées FDFP financé à 100% par SII
                </p>
                <div className="mt-3 text-[11px] font-semibold text-blue-800">
                  {((developpementPersonnel / totalRewardsAnnuel) * 100).toFixed(1)}% du package global
                </div>
              </div>
            </div>

            {/* Pilier 4 : Avantages & Épargne */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="w-2 h-full bg-amber-600 absolute left-0 top-0" />
              <div className="pl-2">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">4. Avantages & Épargne</span>
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-amber-900 mt-1">
                  {avantagesPériphériques.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Dotation carburant/transport + abondement Tontine Entreprise RH
                </p>
                <div className="mt-3 text-[11px] font-semibold text-amber-800">
                  {((avantagesPériphériques / totalRewardsAnnuel) * 100).toFixed(1)}% du package global
                </div>
              </div>
            </div>
          </div>

          {/* Barres de progression visuelles du Total Rewards */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              Décomposition Visuelle de l'Investissement Annuel Total
            </h3>

            <div className="w-full h-6 rounded-lg overflow-hidden flex bg-slate-100 shadow-inner">
              <div
                style={{ width: `${(remunerationDirecte / totalRewardsAnnuel) * 100}%` }}
                className="bg-[#002B7F] flex items-center justify-center text-[10px] text-white font-bold"
                title="Rémunération Directe"
              >
                Rémunération ({((remunerationDirecte / totalRewardsAnnuel) * 100).toFixed(0)}%)
              </div>
              <div
                style={{ width: `${(protectionSocialeEmployeur / totalRewardsAnnuel) * 100}%` }}
                className="bg-[#008000] flex items-center justify-center text-[10px] text-white font-bold"
                title="Protection Sociale & Mutuelle"
              >
                Santé & CNPS ({((protectionSocialeEmployeur / totalRewardsAnnuel) * 100).toFixed(0)}%)
              </div>
              <div
                style={{ width: `${(developpementPersonnel / totalRewardsAnnuel) * 100}%` }}
                className="bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold"
                title="Formation FDFP"
              >
                FDFP ({((developpementPersonnel / totalRewardsAnnuel) * 100).toFixed(0)}%)
              </div>
              <div
                style={{ width: `${(avantagesPériphériques / totalRewardsAnnuel) * 100}%` }}
                className="bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold"
                title="Avantages & Épargne"
              >
                Avantages ({((avantagesPériphériques / totalRewardsAnnuel) * 100).toFixed(0)}%)
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#002B7F]" />
                <span className="text-slate-600">Salaire Net & Primes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#008000]" />
                <span className="text-slate-600">CNPS & Mutuelle Santé (80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-600">Formation Professionnelle FDFP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600">Transport, Carburant & Tontine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Onglet 2 : Détail des Composantes */}
      {activeTab === 'detail_composantes' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">
              Relevé Exhaustif des Éléments de Rétribution & Prise en Charge Employeur (Exercice 2026)
            </h3>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Rubrique de Rémunération</th>
                <th className="py-3 px-4">Périodicité</th>
                <th className="py-3 px-4 text-right">Part Salariale Perçue</th>
                <th className="py-3 px-4 text-right">Prise en Charge Employeur (SII)</th>
                <th className="py-3 px-4">Impact Social & Fiscal CI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Salaire de Base & Sursalaire</td>
                <td className="py-3 px-4">Mensuel (12 mois)</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {currentEmp.salaireNetPercuAnnuel.toLocaleString('fr-FR')} FCFA
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">—</td>
                <td className="py-3 px-4 text-slate-500">Soumis ITS, CNPS, CMU, FDFP</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Primes de Performance Réseau</td>
                <td className="py-3 px-4">Trimestrielle</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#002B7F]">
                  {currentEmp.primesPerformances.toLocaleString('fr-FR')} FCFA
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">—</td>
                <td className="py-3 px-4 text-slate-500">Valorisation de la surperformance</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-3 px-4 font-semibold text-slate-900">Cotisations Patronales CNPS & CMU</td>
                <td className="py-3 px-4">Mensuel</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#008000]">
                  +{currentEmp.cotisationsPatronalesCnpsCmu.toLocaleString('fr-FR')} FCFA
                </td>
                <td className="py-3 px-4 text-[#008000] font-medium">Financement retraite & accidents travail</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-3 px-4 font-semibold text-slate-900">Mutuelle Santé d'Entreprise (Ascoma/Saham)</td>
                <td className="py-3 px-4">Annuel</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#008000]">
                  +{currentEmp.mutuelleSanteEmployeur.toLocaleString('fr-FR')} FCFA
                </td>
                <td className="py-3 px-4 text-[#008000] font-medium">Couverture à 80% (salarié + conjoint + 4 enfants)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Plan de Formation Professionnelle FDFP</td>
                <td className="py-3 px-4">Par session</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-blue-800">
                  +{currentEmp.budgetFormationFdfp.toLocaleString('fr-FR')} FCFA
                </td>
                <td className="py-3 px-4 text-blue-700">Développement de l'employabilité certifiée</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Dotation Carburant & Transports</td>
                <td className="py-3 px-4">Mensuel</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-amber-800">
                  +{currentEmp.avantagesNatureCarburant.toLocaleString('fr-FR')} FCFA
                </td>
                <td className="py-3 px-4 text-slate-600">Cartes carburant & facilités mobilité</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Abondement Employeur Tontine RH</td>
                <td className="py-3 px-4">Annuel</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-amber-800">
                  +{currentEmp.epargneTontineSiiAbondement.toLocaleString('fr-FR')} FCFA
                </td>
                <td className="py-3 px-4 text-slate-600">Doublement solidaire des cotisations collaborateur</td>
              </tr>
              <tr className="bg-slate-100 font-bold text-sm">
                <td className="py-3.5 px-4 text-slate-900" colSpan="3">
                  TOTAL INVESTISSEMENT EMPLOYEUR ANNUEL (BSI 2026)
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-[#002B7F] text-base">
                  {totalRewardsAnnuel.toLocaleString('fr-FR')} FCFA
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-normal text-xs">
                  Certifié Direction des Ressources Humaines
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Contenu Onglet 3 : Prévoyance Retraite & IDR */}
      {activeTab === 'projection' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#002B7F]" />
              Capitalisation des Droits à Retraite & Indemnités de Départ (IAS 19)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              En plus de la rémunération courante, SII provisionne rigoureusement pour chaque collaborateur
              ses droits légaux de fin de carrière garantis lors de son départ en retraite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <span className="text-xs uppercase font-bold text-[#002B7F]">
                Provision Indemnité de Départ Retraite (IDR) Actuelle
              </span>
              <div className="text-3xl font-black text-[#002B7F]">
                {currentEmp.droitsRetraiteIdrCapitalises.toLocaleString('fr-FR')} FCFA
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculé selon l'ancienneté ({currentEmp.anciennete}) et les dispositions de la Convention Collective
                Interprofessionnelle (CCNI) de Côte d'Ivoire.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <span className="text-xs uppercase font-bold text-[#008000]">
                Projection Capital Retraite Estimé (à 60 ans)
              </span>
              <div className="text-3xl font-black text-[#008000]">
                {Math.round(currentEmp.droitsRetraiteIdrCapitalises * 2.4).toLocaleString('fr-FR')} FCFA
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Estimation du capital brut garanti versé le jour du départ officiel à la retraite,
                cumulable avec la pension vieillesse légale CNPS.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-[#002B7F] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">
                Engagement de Transparence Sociale & Rétribution Globale
              </span>
              <p>
                Ce document BSI certifié est opposable et téléchargeable à tout moment par le collaborateur
                depuis son Guichet Collaborateur Mobile. Il matérialise l'effort financier et social de l'entreprise
                pour assurer la sécurité, la santé et l'avenir de chaque membre du personnel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
