import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Sliders,
  Calendar,
  Layers,
  BarChart3,
  PieChart,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  RefreshCw,
  Award
} from 'lucide-react';

export default function SimulateurNoriaGvt() {
  // Paramètres initiaux de l'entreprise SII CI
  const [effectifTotal, setEffectifTotal] = useState(248); // Effectif collaborateurs
  const [masseSalarialeAnnuelle, setMasseSalarialeAnnuelle] = useState(2150000000); // 2.15 Milliards FCFA
  
  // Paramètres de simulation interactifs (sliders)
  const [tauxAugmentationGenerale, setTauxAugmentationGenerale] = useState(2.5); // % NAO
  const [tauxVieillesse, setTauxVieillesse] = useState(1.4); // % Avancement ancienneté légale (Art 42 CCNI)
  const [tauxTechnicite, setTauxTechnicite] = useState(1.8); // % Promotions et changements de coefficient
  const [tauxTurnover, setTauxTurnover] = useState(6.5); // % Remplacement / Départs à la retraite
  const [ecartSalaireNoria, setEcartSalaireNoria] = useState(24); // % Économie à l'embauche du jeune vs senior sortant

  // Scénarios prédéfinis
  const setScenario = (type) => {
    if (type === 'prudent') {
      setTauxAugmentationGenerale(1.5);
      setTauxVieillesse(1.2);
      setTauxTechnicite(1.0);
      setTauxTurnover(5.0);
      setEcartSalaireNoria(28);
    } else if (type === 'equilibre') {
      setTauxAugmentationGenerale(2.5);
      setTauxVieillesse(1.4);
      setTauxTechnicite(1.8);
      setTauxTurnover(6.5);
      setEcartSalaireNoria(24);
    } else if (type === 'croissance') {
      setTauxAugmentationGenerale(4.0);
      setTauxVieillesse(1.6);
      setTauxTechnicite(2.5);
      setTauxTurnover(8.0);
      setEcartSalaireNoria(20);
    }
  };

  // Calculs mathématiques RH GVT & Noria
  // 1. GVT Positif (Glissement, Vieillesse, Technicité)
  // G = Glissement (dérives primes / heures sup)
  // V = Vieillesse (ancienneté)
  // T = Technicité (promotions / mérites)
  const coutGvtPct = (tauxVieillesse + tauxTechnicite);
  const coutGvtFcfa = masseSalarialeAnnuelle * (coutGvtPct / 100);

  // 2. Augmentation Générale NAO
  const coutNaoFcfa = masseSalarialeAnnuelle * (tauxAugmentationGenerale / 100);

  // 3. Effet Noria (Économie de remplacement de collaborateurs expérimentés par des entrants)
  // Masse salariale concernée par le remplacement = Masse Salariale * (% turnover)
  // Économie Noria = Masse concernée * (% écart salaire)
  const nbDepartEstime = Math.round(effectifTotal * (tauxTurnover / 100));
  const masseSortants = (masseSalarialeAnnuelle / effectifTotal) * nbDepartEstime * 1.15; // sortants mieux payés (+15% moy)
  const economieNoriaFcfa = masseSortants * (ecartSalaireNoria / 100);
  const economieNoriaPct = (economieNoriaFcfa / masseSalarialeAnnuelle) * 100;

  // 4. Dérive Nette de la Masse Salariale
  const deriveNetteFcfa = coutNaoFcfa + coutGvtFcfa - economieNoriaFcfa;
  const deriveNettePct = (deriveNetteFcfa / masseSalarialeAnnuelle) * 100;
  const masseSalarialeN1 = masseSalarialeAnnuelle + deriveNetteFcfa;

  // Projection sur 3 ans
  const masseSalarialeN2 = masseSalarialeN1 * (1 + deriveNettePct / 100);
  const masseSalarialeN3 = masseSalarialeN2 * (1 + deriveNettePct / 100);

  // Découpage par CSP / Familles professionnelles
  const famillesPro = [
    {
      famille: 'Cadres Dirigeants & Directeurs de Pôle',
      effectif: 12,
      partMasse: 24, // %
      salaireMoyen: 3580000,
      turnover: 3.0,
      impactGvt: 1.2,
      effetNoriaGain: 8500000
    },
    {
      famille: 'Cadres IT, Data & Ingénierie Financière',
      effectif: 46,
      partMasse: 28,
      salaireMoyen: 1090000,
      turnover: 9.5,
      impactGvt: 3.4,
      effetNoriaGain: 14200000
    },
    {
      famille: 'Chefs d’Agence & Superviseurs Opérations',
      effectif: 38,
      partMasse: 18,
      salaireMoyen: 850000,
      turnover: 5.2,
      impactGvt: 2.1,
      effetNoriaGain: 9800000
    },
    {
      famille: 'Chargés de Clientèle & Guichetiers Réseau',
      effectif: 110,
      partMasse: 22,
      salaireMoyen: 360000,
      turnover: 7.8,
      impactGvt: 1.5,
      effetNoriaGain: 12400000
    },
    {
      famille: 'Support, Chauffeurs & Logistique Agences',
      effectif: 42,
      partMasse: 8,
      salaireMoyen: 340000,
      turnover: 4.0,
      impactGvt: 1.1,
      effetNoriaGain: 4100000
    }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête officiel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Contrôle de Gestion Sociale & Budgétisation RH
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Modèle Actuariel Glissement-Vieillesse-Technicité (GVT)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-[#002B7F]" />
            Simulateur Budgétaire RH : Effet Noria & Dérive Masse Salariale (GVT)
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Évaluez l'impact exact des augmentations générales (NAO), de l'ancienneté légale (CCNCI), des promotions
            et compensez-les par l'économie d'effet Noria lors du renouvellement des compétences.
          </p>
        </div>

        {/* Boutons scénarios rapides */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setScenario('prudent')}
            className="px-3 py-1.5 rounded-md hover:bg-white text-slate-700 transition-colors"
          >
            Scénario Modéré
          </button>
          <button
            onClick={() => setScenario('equilibre')}
            className="px-3 py-1.5 rounded-md bg-white shadow-sm text-[#002B7F] transition-colors"
          >
            Scénario Équilibré
          </button>
          <button
            onClick={() => setScenario('croissance')}
            className="px-3 py-1.5 rounded-md hover:bg-white text-slate-700 transition-colors"
          >
            Scénario Expansion
          </button>
        </div>
      </div>

      {/* Cartes KPI Synthétiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Masse Salariale 2026 (N)</span>
            <DollarSign className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(masseSalarialeAnnuelle / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M FCFA
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Pour <span className="font-semibold text-slate-800">{effectifTotal} collaborateurs</span> actifs
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Coût Brut GVT + NAO</span>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            +{((coutNaoFcfa + coutGvtFcfa) / 1000000).toFixed(1)} M FCFA
          </div>
          <div className="text-xs text-amber-700/80 mt-1">
            +{(tauxAugmentationGenerale + coutGvtPct).toFixed(2)}% d'inflation salariale brute
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Économie Effet Noria</span>
            <TrendingDown className="w-5 h-5 text-[#008000]" />
          </div>
          <div className="text-2xl font-bold text-[#008000]">
            -{(economieNoriaFcfa / 1000000).toFixed(1)} M FCFA
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            ~{nbDepartEstime} remplacements à salaire d'entrée junior
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Dérive Nette Réelle (N+1)</span>
            <BarChart3 className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className={`text-2xl font-bold ${deriveNettePct >= 0 ? 'text-[#002B7F]' : 'text-[#008000]'}`}>
            {deriveNettePct >= 0 ? '+' : ''}{deriveNettePct.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {(masseSalarialeN1 / 1000000).toFixed(1)} M FCFA projetés
          </div>
        </div>
      </div>

      {/* Simulateur Interactif : Commandes et Visualisations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Gauche : Sliders de simulation */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-[#002B7F]" />
            Leviers d'Ajustement de la Masse Salariale
          </h2>

          {/* Slider 1: NAO / Augmentation générale */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">1. Négociation Annuelle (NAO Générale)</span>
              <span className="font-bold text-[#002B7F] font-mono">{tauxAugmentationGenerale}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="7"
              step="0.1"
              value={tauxAugmentationGenerale}
              onChange={(e) => setTauxAugmentationGenerale(parseFloat(e.target.value))}
              className="w-full accent-[#002B7F] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% (Gel salarial)</span>
              <span>Coût : {(coutNaoFcfa / 1000000).toFixed(1)} M FCFA</span>
              <span>7%</span>
            </div>
          </div>

          {/* Slider 2: Effet Vieillesse (Ancienneté légale) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">2. Effet Vieillesse (Primes d'ancienneté CI)</span>
              <span className="font-bold text-blue-800 font-mono">+{tauxVieillesse}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={tauxVieillesse}
              onChange={(e) => setTauxVieillesse(parseFloat(e.target.value))}
              className="w-full accent-[#002B7F] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0.5% (Structure jeune)</span>
              <span>Coût : {((masseSalarialeAnnuelle * (tauxVieillesse / 100)) / 1000000).toFixed(1)} M FCFA</span>
              <span>3.0%</span>
            </div>
          </div>

          {/* Slider 3: Effet Technicité (Promotions & Évolutions) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">3. Effet Technicité (Mérites & Changements d'échelon)</span>
              <span className="font-bold text-blue-800 font-mono">+{tauxTechnicite}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="0.1"
              value={tauxTechnicite}
              onChange={(e) => setTauxTechnicite(parseFloat(e.target.value))}
              className="w-full accent-[#002B7F] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0%</span>
              <span>Coût : {((masseSalarialeAnnuelle * (tauxTechnicite / 100)) / 1000000).toFixed(1)} M FCFA</span>
              <span>4.0%</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Modélisation de l'Effet Noria (Remplacement Départs)
            </div>

            {/* Slider 4: Turnover / Départs */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Taux de renouvellement / départs annuels</span>
                <span className="font-bold text-[#008000] font-mono">{tauxTurnover}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={tauxTurnover}
                onChange={(e) => setTauxTurnover(parseFloat(e.target.value))}
                className="w-full accent-[#008000] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>1% (Fidélisation totale)</span>
                <span>{nbDepartEstime} départs / an</span>
                <span>15%</span>
              </div>
            </div>

            {/* Slider 5: Écart de rémunération senior sortant vs entrant */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Décote moyenne à l'embauche (Noria)</span>
                <span className="font-bold text-[#008000] font-mono">-{ecartSalaireNoria}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={ecartSalaireNoria}
                onChange={(e) => setEcartSalaireNoria(parseFloat(e.target.value))}
                className="w-full accent-[#008000] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>5% (Faible écart)</span>
                <span>Économie : -{(economieNoriaFcfa / 1000000).toFixed(1)} M FCFA</span>
                <span>45%</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-[#002B7F] shrink-0 mt-0.5" />
            <p>
              L’<strong>effet Noria positif</strong> permet d’amortir mécaniquement plus de 40% à 70% de la dérive naturelle GVT sans dégrader la grille salariale.
            </p>
          </div>
        </div>

        {/* Colonne Droite : Décomposition & Projection Budgétaire sur 3 Ans */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tableau de décomposition de la dérive */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#002B7F]" />
                Décomposition Économique Annuelle (Exercice 2026 ➔ 2027)
              </span>
              <span className="text-xs font-normal text-slate-500">Unité : FCFA</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">Masse Salariale Initiale Référence (2026)</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {masseSalarialeAnnuelle.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-lg text-amber-900 border border-amber-100">
                <span className="font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  Effet Décisionnel : Augmentation Générale NAO (+{tauxAugmentationGenerale}%)
                </span>
                <span className="font-bold font-mono">
                  +{coutNaoFcfa.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-lg text-blue-900 border border-blue-100">
                <span className="font-medium flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#002B7F]" />
                  Effet GVT : Ancienneté CCNI (+{tauxVieillesse}%) & Promotions (+{tauxTechnicite}%)
                </span>
                <span className="font-bold font-mono">
                  +{coutGvtFcfa.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg text-emerald-900 border border-emerald-100">
                <span className="font-medium flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-[#008000]" />
                  Effet Noria : Remplacement des départs retrait/turnover (-{ecartSalaireNoria}% à l'entrée)
                </span>
                <span className="font-bold font-mono text-[#008000]">
                  -{economieNoriaFcfa.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-lg">
                <span className="font-bold text-sm">Masse Salariale Projetée N+1 (2027)</span>
                <div className="text-right">
                  <span className="font-bold font-mono text-base text-emerald-400">
                    {Math.round(masseSalarialeN1).toLocaleString('fr-FR')} FCFA
                  </span>
                  <div className="text-[11px] text-slate-300">
                    Dérive nette finale : {deriveNettePct >= 0 ? '+' : ''}{deriveNettePct.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projection Pluriannuelle 2026 - 2028 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-[#002B7F]" />
              Trajectoire Budgétaire Pluriannuelle (Plan Stratégique 3 Ans)
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-xs font-semibold text-slate-500 uppercase">Exercice 2026 (N)</div>
                <div className="text-base font-bold text-slate-800 mt-1">
                  {(masseSalarialeAnnuelle / 1000000).toFixed(1)} M FCFA
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Budget certifié</div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <div className="text-xs font-semibold text-[#002B7F] uppercase">Exercice 2027 (N+1)</div>
                <div className="text-base font-bold text-[#002B7F] mt-1">
                  {(masseSalarialeN1 / 1000000).toFixed(1)} M FCFA
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  {deriveNettePct >= 0 ? '+' : ''}{deriveNettePct.toFixed(1)}% vs N
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <div className="text-xs font-semibold text-[#008000] uppercase">Exercice 2028 (N+2)</div>
                <div className="text-base font-bold text-[#008000] mt-1">
                  {(masseSalarialeN2 / 1000000).toFixed(1)} M FCFA
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  {((masseSalarialeN2 - masseSalarialeAnnuelle) / 1000000).toFixed(1)} M FCFA cumulés
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau détaillé par Famille Professionnelle */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#002B7F]" />
            <h3 className="font-bold text-slate-800 text-sm">
              Impact Noria & GVT Décliné par Famille Professionnelle & Agence
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            5 Familles Métiers d'Agence & Siège
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Famille Professionnelle</th>
                <th className="py-3 px-4">Effectif</th>
                <th className="py-3 px-4">Part Masse</th>
                <th className="py-3 px-4">Salaire Moyen Brut</th>
                <th className="py-3 px-4">Turnover Constaté</th>
                <th className="py-3 px-4">Impact GVT Métier</th>
                <th className="py-3 px-4 text-right">Gain Noria Prévisionnel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {famillesPro.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{f.famille}</td>
                  <td className="py-3 px-4 text-slate-600">{f.effectif} pers.</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700">
                      {f.partMasse}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {f.salaireMoyen.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-3 px-4 text-slate-600">{f.turnover}% / an</td>
                  <td className="py-3 px-4 font-semibold text-amber-700">+{f.impactGvt}%</td>
                  <td className="py-3 px-4 text-right font-bold text-[#008000] font-mono">
                    -{(f.effetNoriaGain / 1000000).toFixed(2)} M FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
