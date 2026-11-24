import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  Calendar,
  Layers,
  BarChart3,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Sparkles,
  Compass
} from 'lucide-react';

export default function StrategicWorkforcePlanning() {
  const [activeTab, setActiveTab] = useState('pyramide'); // 'pyramide' | 'retraites' | 'scenarios' | 'metiers_tension'

  // Données de la Pyramide des Âges (Effectif total : 248 collaborateurs)
  const ageDistribution = [
    { bracket: '60 ans et +', men: 4, women: 1, total: 5, status: 'Depart imminent' },
    { bracket: '55 - 59 ans', men: 14, women: 6, total: 20, status: 'Horizon 1-4 ans' },
    { bracket: '50 - 54 ans', men: 22, women: 11, total: 33, status: 'Horizon 5-9 ans' },
    { bracket: '45 - 49 ans', men: 28, women: 14, total: 42, status: 'Cadres confirmés' },
    { bracket: '40 - 44 ans', men: 31, women: 18, total: 49, status: 'Cœur de cible' },
    { bracket: '35 - 39 ans', men: 26, women: 16, total: 42, status: 'Progression' },
    { bracket: '30 - 34 ans', men: 19, women: 15, total: 34, status: 'Jeunes talents' },
    { bracket: '25 - 29 ans', men: 11, women: 9, total: 20, status: 'Entrants récents' },
    { bracket: '< 25 ans', men: 1, women: 2, total: 3, status: 'Stagiaires / Alternants' }
  ];

  const totalMen = ageDistribution.reduce((acc, a) => acc + a.men, 0);
  const totalWomen = ageDistribution.reduce((acc, a) => acc + a.women, 0);
  const totalEmployees = totalMen + totalWomen;
  const maxBracketCount = Math.max(...ageDistribution.map(a => Math.max(a.men, a.women)));

  // Calendrier des départs légaux à la retraite (Code du Travail CI - 60 ans)
  const [retraitesPrevisionnelles, setRetraitesPrevisionnelles] = useState([
    {
      id: 'RET-2026-01',
      nom: 'Kouamé N’Guessan Gilbert',
      matricule: 'EMP-0012',
      poste: 'Chef d’Agence Principal',
      agence: 'Agence Abidjan Plateau',
      departement: 'Réseau Agences',
      age: 60,
      dateDepart: '31/12/2026',
      anciennete: '24 ans',
      coutIndemniteIdr: 12400000,
      statutRemplacement: 'Plan de suppléance identifié',
      successeurPropose: 'Kouassi Marc (Chef Caisse Sr)'
    },
    {
      id: 'RET-2027-02',
      nom: 'Bakayoko Mamadou',
      matricule: 'EMP-0027',
      poste: 'Superviseur Logistique & Sécurité',
      agence: 'Agence San Pedro Port',
      departement: 'Moyens Généraux',
      age: 59,
      dateDepart: '15/07/2027',
      anciennete: '19 ans',
      coutIndemniteIdr: 9800000,
      statutRemplacement: 'Recrutement externe requis',
      successeurPropose: 'En recherche active'
    },
    {
      id: 'RET-2027-03',
      nom: 'Koffi Akissi Véronique',
      matricule: 'EMP-0045',
      poste: 'Contrôleur Interne & Risques',
      agence: 'Agence Abidjan Plateau',
      departement: 'Audit & Conformité',
      age: 59,
      dateDepart: '30/11/2027',
      anciennete: '17 ans',
      coutIndemniteIdr: 8900000,
      statutRemplacement: 'Mobilité interne validée',
      successeurPropose: 'Gnagne Sarah (Analyste)'
    },
    {
      id: 'RET-2028-04',
      nom: 'Diarra Soumaila',
      matricule: 'EMP-0051',
      poste: 'Responsable Technique Infrastructure',
      agence: 'Agence Yopougon Siporex',
      departement: 'IT & Support Réseau',
      age: 58,
      dateDepart: '28/02/2028',
      anciennete: '15 ans',
      coutIndemniteIdr: 7600000,
      statutRemplacement: 'Formation accélérée en cours',
      successeurPropose: 'Yao N’Goran (Tech Réseau)'
    }
  ]);

  // Scénarios d'expansion territoriale (ouvertures de nouvelles agences)
  const [selectedExpansion, setSelectedExpansion] = useState('bouake'); // 'bouake' | 'yamoussoukro' | 'korhogo'
  const expansionScenarios = {
    bouake: {
      ville: 'Bouaké Centre-Commerce',
      type: 'Agence Régionale Flagship',
      horizon: 'T3 2027',
      effectifRequis: 12,
      profils: [
        { role: 'Chef d’Agence Régionale', count: 1, mode: 'Mobilité Interne Cadre' },
        { role: 'Chargés de Clientèle Entreprises', count: 3, mode: 'Recrutement local + Mobilité' },
        { role: 'Caissiers & Guichetiers', count: 5, mode: 'Recrutement Concours Jeunes' },
        { role: 'Technicien Support & Monétique', count: 1, mode: 'Transfert filiale' },
        { role: 'Agents Sécurité & Accueil', count: 2, mode: 'Prestataire agréé' }
      ],
      budgetMasseAnnuelle: 94000000,
      budgetFormationIntegration: 14500000
    },
    yamoussoukro: {
      ville: 'Yamoussoukro Fondation',
      type: 'Boutique Réseau Express',
      horizon: 'T1 2028',
      effectifRequis: 6,
      profils: [
        { role: 'Responsable de Boutique', count: 1, mode: 'Promotion Interne Senior' },
        { role: 'Chargés de Vente & Caisses', count: 4, mode: 'Recrutement local' },
        { role: 'Technicien Déploiement', count: 1, mode: 'Partage avec Bouaké' }
      ],
      budgetMasseAnnuelle: 46000000,
      budgetFormationIntegration: 7200000
    },
    korhogo: {
      ville: 'Korhogo Grand Marché',
      type: 'Point de Vente Régional Nord',
      horizon: 'T4 2028',
      effectifRequis: 8,
      profils: [
        { role: 'Chef d’Agence Adjoint', count: 1, mode: 'Mobilité San Pedro / Bassam' },
        { role: 'Conseillers Commerciaux', count: 4, mode: 'Recrutement local dialecte Sénoufo' },
        { role: 'Caissiers Polyvalents', count: 2, mode: 'Formation FDFP Fast-Track' },
        { role: 'Agent Accueil & Orientation', count: 1, mode: 'Recrutement local' }
      ],
      budgetMasseAnnuelle: 58000000,
      budgetFormationIntegration: 9800000
    }
  };

  const currentExpansion = expansionScenarios[selectedExpansion];

  // Métiers en tension & Gaps de compétences
  const metiersTension = [
    {
      metier: 'Chefs de Caisse & Superviseurs Agence',
      criticite: 'Haute',
      ageMoyen: 49.2,
      retraites3ans: 6,
      vivierInternePret: 2,
      deficitPrevu: 4,
      recommandation: 'Lancer un programme certifiant interne « École de la Caisse SII »'
    },
    {
      metier: 'Ingénieurs Sécurité Monétique & API',
      criticite: 'Très Haute',
      ageMoyen: 34.5,
      retraites3ans: 0,
      vivierInternePret: 1,
      deficitPrevu: 3,
      recommandation: 'Politique d’attractivité salariale ciblée + Alternance INP-HB'
    },
    {
      metier: 'Contrôleurs de Conformité & Audit Agences',
      criticite: 'Moyenne',
      ageMoyen: 46.8,
      retraites3ans: 3,
      vivierInternePret: 3,
      deficitPrevu: 0,
      recommandation: 'Vivier suffisant, formaliser le tutorat inter-générationnel'
    },
    {
      metier: 'Techniciens Systèmes & Réseaux Télécoms',
      criticite: 'Haute',
      ageMoyen: 41.0,
      retraites3ans: 2,
      vivierInternePret: 1,
      deficitPrevu: 2,
      recommandation: 'FDFP Plan 2026 : Reconversion interne d’agents de caisse volontaires'
    }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Strategic Workforce Planning (SWP) • SAP SuccessFactors Standard
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Horizon Prévisionnel 2026 - 2030
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-[#002B7F]" />
            Planification Stratégique des Effectifs & Pyramide des Âges
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Anticipez les renouvellements de générations, programmez les départs à la retraite (60 ans CI),
            modélisez les ouvertures de nouvelles agences et comblez les métiers en tension.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500">Effectif Total Actif : </span>
            <strong className="text-slate-900 font-bold text-sm">{totalEmployees} collaborateurs</strong>
          </div>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Âge Moyen Entreprise</span>
            <Calendar className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">41.8 ans</div>
          <div className="text-xs text-slate-500 mt-1">
            Mixité : <strong>{totalMen} Hommes ({((totalMen/totalEmployees)*100).toFixed(0)}%)</strong> / <strong>{totalWomen} Femmes ({((totalWomen/totalEmployees)*100).toFixed(0)}%)</strong>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Départs Retraite 2026-2028</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">25 départs</div>
          <div className="text-xs text-amber-800 mt-1">
            Dont <strong>{retraitesPrevisionnelles.length} postes clés</strong> sous haute surveillance
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Besoin Ouvertures Agences</span>
            <Building2 className="w-5 h-5 text-[#008000]" />
          </div>
          <div className="text-2xl font-bold text-[#008000]">+26 postes</div>
          <div className="text-xs text-emerald-700 mt-1">
            Projets d'agences Bouaké, Yamoussoukro & Korhogo
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Taux de Remplacement Clé</span>
            <Users className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-[#002B7F]">72%</div>
          <div className="text-xs text-slate-500 mt-1">
            Successeurs internes identifiés et en formation
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('pyramide')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'pyramide'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Pyramide des Âges Interactive
        </button>
        <button
          onClick={() => setActiveTab('retraites')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'retraites'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Trajectoire Départs Retraite (60 ans CI)
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'scenarios'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Scénarios d'Expansion Réseau d'Agences
        </button>
        <button
          onClick={() => setActiveTab('metiers_tension')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'metiers_tension'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Métiers en Tension & Plans de Relève
        </button>
      </div>

      {/* Onglet 1 : Pyramide des Âges */}
      {activeTab === 'pyramide' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Structure Démographique par Tranches d'Âge & Parité Hommes/Femmes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Forme en "Toupie" typique des grandes structures bancaires et télécoms ivoiriennes avec un noyau d'experts entre 38 et 52 ans.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#002B7F]">
                <span className="w-3.5 h-3.5 rounded bg-[#002B7F]" /> Hommes ({totalMen})
              </span>
              <span className="flex items-center gap-1.5 text-[#008000]">
                <span className="w-3.5 h-3.5 rounded bg-[#008000]" /> Femmes ({totalWomen})
              </span>
            </div>
          </div>

          {/* Graphique Pyramide en barres bilatérales */}
          <div className="space-y-3">
            {ageDistribution.map((row, idx) => {
              const menWidthPct = (row.men / maxBracketCount) * 100;
              const womenWidthPct = (row.women / maxBracketCount) * 100;

              return (
                <div key={idx} className="flex items-center text-xs">
                  {/* Côté Hommes (à gauche) */}
                  <div className="flex-1 flex justify-end items-center gap-2 pr-4">
                    <span className="font-mono font-bold text-slate-700">{row.men}</span>
                    <div className="w-48 bg-slate-100 h-6 rounded-l-md overflow-hidden flex justify-end">
                      <div
                        className="bg-[#002B7F] h-full transition-all duration-300"
                        style={{ width: `${menWidthPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Tranche d'Âge au Centre */}
                  <div className="w-28 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 py-1 rounded-md text-[11px]">
                    {row.bracket}
                  </div>

                  {/* Côté Femmes (à droite) */}
                  <div className="flex-1 flex items-center gap-2 pl-4">
                    <div className="w-48 bg-slate-100 h-6 rounded-r-md overflow-hidden flex justify-start">
                      <div
                        className="bg-[#008000] h-full transition-all duration-300"
                        style={{ width: `${womenWidthPct}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-700">{row.women}</span>
                    <span className="text-[10px] text-slate-400 font-medium ml-2">{row.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <Compass className="w-4 h-4 text-[#002B7F] shrink-0 mt-0.5" />
            <p>
              <strong>Analyse Démographique RH :</strong> Les effectifs de plus de 55 ans représentent 10,1% du total (25 collaborateurs).
              Leur départ progressif d'ici 2030 libèrera plus de 180 millions de masse salariale annuelle qui sera réinvestie
              selon le modèle Noria dans l'intégration de jeunes diplômés ivoiriens.
            </p>
          </div>
        </div>
      )}

      {/* Onglet 2 : Trajectoire Départs Retraite */}
      {activeTab === 'retraites' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Planning d'Atteinte de la Limite d'Âge Légale (60 ans - Code du Travail CI)
              </h3>
              <p className="text-xs text-slate-500">
                Suivi nominatif des postes clés nécessitant un plan de passation de consignes et provisionnement de l'IDR.
              </p>
            </div>
            <span className="text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
              4 Postes Stratégiques 2026-2028
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Collaborateur Senior</th>
                <th className="py-3 px-4">Poste & Agence</th>
                <th className="py-3 px-4">Âge Actuel</th>
                <th className="py-3 px-4">Date de Clôture CNPS</th>
                <th className="py-3 px-4">Provision IDR Légale</th>
                <th className="py-3 px-4">Relève / Successeur</th>
                <th className="py-3 px-4">Statut Passation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {retraitesPrevisionnelles.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{r.nom}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{r.matricule} • {r.anciennete}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{r.poste}</div>
                    <div className="text-xs text-slate-500">{r.agence}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{r.age} ans</td>
                  <td className="py-3.5 px-4 font-semibold text-amber-700">{r.dateDepart}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#002B7F]">
                    {r.coutIndemniteIdr.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#008000]">{r.successeurPropose}</div>
                    <div className="text-[11px] text-slate-500">{r.statutRemplacement}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-[#008000] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Sous contrôle
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Onglet 3 : Scénarios d'Expansion Réseau */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          {/* Sélecteur de scénario de ville */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choisir un Territoire d'Expansion Réseau :
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedExpansion('bouake')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  selectedExpansion === 'bouake'
                    ? 'bg-[#002B7F] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                1. Bouaké Centre (2027)
              </button>
              <button
                onClick={() => setSelectedExpansion('yamoussoukro')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  selectedExpansion === 'yamoussoukro'
                    ? 'bg-[#002B7F] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                2. Yamoussoukro (2028)
              </button>
              <button
                onClick={() => setSelectedExpansion('korhogo')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  selectedExpansion === 'korhogo'
                    ? 'bg-[#002B7F] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                3. Korhogo Nord (2028)
              </button>
            </div>
          </div>

          {/* Fiche d'impact de l'ouverture */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-2">
              <div>
                <span className="text-xs font-bold text-[#008000] uppercase tracking-wide">
                  {currentExpansion.type} • Horizon {currentExpansion.horizon}
                </span>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <MapPin className="w-5 h-5 text-[#002B7F]" />
                  {currentExpansion.ville}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Masse Salariale Annuelle Prévue :</span>
                <div className="text-xl font-bold text-[#002B7F]">
                  {(currentExpansion.budgetMasseAnnuelle / 1000000).toFixed(1)} M FCFA / an
                </div>
              </div>
            </div>

            {/* Tableau des Postes Requis */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Fonction / Rôle Ouvert</th>
                    <th className="py-2.5 px-3 text-center">Effectif</th>
                    <th className="py-2.5 px-3">Mode d'Acquisition Prévu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentExpansion.profils.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{p.role}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#002B7F]">{p.count}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.mode}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2.5 px-3">TOTAL EFFECTIFS REQUIS</td>
                    <td className="py-2.5 px-3 text-center text-[#008000] text-sm">{currentExpansion.effectifRequis} collaborateurs</td>
                    <td className="py-2.5 px-3 text-slate-500">Plan d'onboarding FDFP dédié inclus</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Onglet 4 : Métiers en Tension */}
      {activeTab === 'metiers_tension' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">
              Diagnostic des Métiers en Tension & Plans de Résilience RH
            </h3>
            <p className="text-xs text-slate-500">
              Identification des déficits prévisionnels entre les départs attendus et les viviers internes certifiés.
            </p>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Métier / Fonction Clé</th>
                <th className="py-3 px-4">Niveau de Criticité</th>
                <th className="py-3 px-4">Âge Moyen</th>
                <th className="py-3 px-4 text-center">Départs Retraite à 3 ans</th>
                <th className="py-3 px-4 text-center">Vivier Interne Prêt</th>
                <th className="py-3 px-4 text-center">Déficit Anticipé</th>
                <th className="py-3 px-4">Action Stratégique Recommandée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metiersTension.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{m.metier}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      m.criticite.includes('Haute')
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {m.criticite}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{m.ageMoyen} ans</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{m.retraites3ans}</td>
                  <td className="py-3 px-4 text-center font-bold text-[#008000]">{m.vivierInternePret}</td>
                  <td className="py-3 px-4 text-center font-bold text-red-600">
                    {m.deficitPrevu > 0 ? `-${m.deficitPrevu}` : 'Équilibré'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{m.recommandation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
