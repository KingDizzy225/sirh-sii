import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Download, 
  Printer, 
  AlertTriangle, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Briefcase, 
  DollarSign, 
  GraduationCap, 
  Scale, 
  HeartHandshake, 
  TrendingUp,
  Layers,
  Search,
  Info
} from 'lucide-react';

// RAPPORT SOCIAL ANNUEL D'ENTREPRISE (BILAN SOCIAL MEPS)
// Obligation légale : Article 93 du Code du Travail de Côte d'Ivoire.
// Document officiel obligatoire annuel remis à l'Inspecteur du Travail et des Lois Sociales
// et au Comité des Délégués du Personnel. 
// Comprend les 8 Chapitres réglementaires d'audit social.

const MOCK_RAPPORT_SOCIAL_DATA = {
  anneeExercice: 2026,
  entreprise: "SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)",
  siegeSocial: "Boulevard de la République, Plateau, Abidjan",
  inspectionRattachement: "Inspection du Travail et des Lois Sociales d'Abidjan - Secteur Tertiaire",
  directeurRH: "Aïcha Ouattara (Directrice du Capital Humain)",
  dateCloture: "31 Décembre 2026",
  
  // Chapitre 1 : Emploi & Démographie
  effectifTotal: 248,
  effectifFemmes: 102, // 41.1%
  effectifHommes: 146, // 58.9%
  repartitionContrats: {
    cdi: 215,
    cdd: 28,
    stagiaires: 5
  },
  repartitionNationalite: {
    ivoiriens: 231, // 93.1%
    ressortissantsCedeao: 14, // 5.6%
    horsCedeaoExpatries: 3 // 1.2%
  },
  repartitionCsp: {
    cadresIngenieurs: 42,
    agentsMaitriseTechniciens: 86,
    employesOuvriers: 120
  },

  // Chapitre 2 : Mouvements de Personnel
  mouvements: {
    recrutementsAnnuels: 34,
    confirmationsCdi: 28,
    departsVolontairesDemissions: 8,
    rupturesAmiables: 4,
    licenciementsEconomiques: 2,
    licenciementsDisciplinaires: 1,
    departsRetraite: 3
  },

  // Chapitre 3 : Masse Salariale & Rémunérations
  masseSalarialeBruteAnnuelle: 2150000000, // 2,15 Milliards FCFA
  salaireMoyenMensuelBrut: 722400,
  chargesPatronalesCnpsCmu: 344000000,
  taxeFdfpAcquittee: 25800000, // 1.2% FDFP
  primeTransportLegaleCumulee: 89280000,

  // Chapitre 4 : Conditions de Travail, Hygiène & Sécurité (CSST)
  securite: {
    accidentsTravailAvecArret: 2,
    accidentsTrajet: 3,
    journeesPerduesAccidents: 19,
    reunionsCsstTenues: 4, // 1 par trimestre légal
    tauxFrequence: 4.44,
    tauxGravite: 0.042,
    dotationsEpiDistribuees: 180
  },

  // Chapitre 5 : Formation Professionnelle
  formation: {
    collaborateursFormes: 142,
    heuresFormationDispensées: 2840,
    plansFdfpHomologues: 6,
    budgetInvestiFormation: 38500000
  },

  // Chapitre 6 : Relations Professionnelles & Dialogue Social
  relationsSociales: {
    deleguesPersonnelTitulaires: 4,
    deleguesSuppleans: 4,
    reunionsMensuellesDirectionDelegues: 11, // 11 réunions tenues sur 12
    accordsNaoSignes: 1, // Accord d'entreprise 2026 signé
    conflitsCollectifsGreves: 0 // Zéro jour de grève
  },

  // Chapitre 7 : Œuvres Sociales & Protection Sociale Complémentaire
  oeuvresSociales: {
    tauxCouvertureMutuelleSante: "80% (Salariés & Ayants droit)",
    adherentsTontineRh: 188,
    avancesMicroCreditAccompagnees: 45,
    bonsFestifsDistribues: 248
  },

  // Chapitre 8 : Égalité Professionnelle & Travailleurs Handicapés
  inclusion: {
    collaborateursSituationHandicap: 4, // 1.6%
    amenagementsPosteErgonomiques: 4,
    ecartRemunerationGlobalFh: "4.8%",
    femmesParmiCadresSuperieurs: "38.1%"
  }
};

export default function RapportSocialInspectionMeps() {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'chapters' | 'official-doc'
  const [selectedChapter, setSelectedChapter] = useState(1);
  const data = MOCK_RAPPORT_SOCIAL_DATA;

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Obligation Légale Annuelle
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Art. 93 Code du Travail CI & MEPS
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Rapport Social Annuel — Inspection du Travail (MEPS)
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Compilation officielle des 8 chapitres statutaires : démographie, masse salariale brute, hygiène CSST, formation FDFP, dialogue social et conformité des 248 salariés.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'summary'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Synthèse & Ratios Clés
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'chapters'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Les 8 Chapitres Légaux
            </button>
            <button
              onClick={() => setActiveTab('official-doc')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'official-doc'
                  ? 'bg-[#008000] text-white shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Dossier Officiel d'Inspection
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Effectif Déclaré</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{data.effectifTotal} salariés</h3>
            <p className="text-xs text-gray-500 mt-1">215 CDI • 28 CDD</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Masse Salariale Brute</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">2,15 Mrd FCFA</h3>
            <p className="text-xs text-gray-500 mt-1">Exercice civil {data.anneeExercice}</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Taux d'Ivoirisation</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">93.1 %</h3>
            <p className="text-xs text-gray-500 mt-1">231 nationaux • 17 expatriés</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dialogue Social</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">0 jour de grève</h3>
            <p className="text-xs text-[#008000] mt-1 font-semibold">Accord NAO 2026 signé</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Scale className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cadre légal */}
      <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
        <Building2 className="w-5 h-5 text-[#008000] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#008000] font-semibold">Exigence Légale du Ministère de l'Emploi (MEPS - République de Côte d'Ivoire) : </strong>
          Toute entreprise de plus de cinquante (50) salariés en Côte d'Ivoire est tenue d'établir annuellement un Rapport Social Unique et de le soumettre, avant la fin du premier trimestre suivant l'exercice clos, à l'<strong>Inspection du Travail et des Lois Sociales territorialement compétente</strong>, accompagné de l'avis formel du collège des Délégués du Personnel.
        </div>
      </div>

      {/* Vue 1 : Synthèse & Ratios Clés */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bloc 1 : Emploi & Démographie */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#002B7F] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#002B7F]" />
              1. Emploi & Structure des Contrats
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Contrats à Durée Indéterminée (CDI) :</span>
                <span className="font-bold text-gray-900">{data.repartitionContrats.cdi} (86.7%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contrats à Durée Déterminée (CDD) :</span>
                <span className="font-bold text-gray-900">{data.repartitionContrats.cdd} (11.3%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Parité Femmes / Hommes :</span>
                <span className="font-bold text-[#008000]">{data.effectifFemmes} F (41.1%) / {data.effectifHommes} H</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ressortissants CEDEAO & Expatriés :</span>
                <span className="font-bold text-gray-900">{data.repartitionNationalite.ressortissantsCedeao + data.repartitionNationalite.horsCedeaoExpatries} (6.9%)</span>
              </div>
            </div>
          </div>

          {/* Bloc 2 : Mouvements & Recrutements */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#002B7F] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#008000]" />
              2. Mouvements & Dynamique Emploi
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Recrutements bruts de l'exercice :</span>
                <span className="font-bold text-[#008000]">+{data.mouvements.recrutementsAnnuels} embauches</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Titularisations en CDI :</span>
                <span className="font-bold text-gray-900">{data.mouvements.confirmationsCdi} contrats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Démissions volontaires :</span>
                <span className="font-bold text-gray-900">{data.mouvements.departsVolontairesDemissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ruptures conventionnelles amiables :</span>
                <span className="font-bold text-gray-900">{data.mouvements.rupturesAmiables}</span>
              </div>
            </div>
          </div>

          {/* Bloc 3 : Sécurité & Santé CSST */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#002B7F] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              3. Santé, Sécurité & CSST
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Accidents du travail avec arrêt :</span>
                <span className="font-bold text-gray-900">{data.securite.accidentsTravailAvecArret}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taux de Fréquence (TF officiel) :</span>
                <span className="font-mono font-bold text-amber-700">{data.securite.tauxFrequence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taux de Gravité (TG officiel) :</span>
                <span className="font-mono font-bold text-amber-700">{data.securite.tauxGravite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Réunions légales CSST tenues :</span>
                <span className="font-bold text-[#008000]">{data.securite.reunionsCsstTenues} / 4 trimestrielles</span>
              </div>
            </div>
          </div>

          {/* Bloc 4 : Rémunérations & Charges Sociales */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#002B7F] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#002B7F]" />
              4. Salaires & Cotisations Sociales
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Masse salariale brute globale :</span>
                <span className="font-bold text-gray-900">2,15 Milliards FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salaire moyen mensuel brut :</span>
                <span className="font-bold text-gray-900">{data.salaireMoyenMensuelBrut.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cotisations patronales CNPS & CMU :</span>
                <span className="font-bold text-gray-900">{data.chargesPatronalesCnpsCmu.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxe d'apprentissage FDFP (1.2%) :</span>
                <span className="font-bold text-gray-900">{data.taxeFdfpAcquittee.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          {/* Bloc 5 : Formation Professionnelle */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#002B7F] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#008000]" />
              5. Formation Continue (FDFP)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Collaborateurs formés sur l'année :</span>
                <span className="font-bold text-gray-900">{data.formation.collaborateursFormes} (57.2%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heures de formation dispensées :</span>
                <span className="font-bold text-gray-900">{data.formation.heuresFormationDispensées} heures</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plans agréés FDFP :</span>
                <span className="font-bold text-[#008000]">{data.formation.plansFdfpHomologues} homologations</span>
              </div>
            </div>
          </div>

          {/* Bloc 6 : Inclusion & Climat Social */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#002B7F] flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#002B7F]" />
              6. Inclusion & Climat Social
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Travailleurs en situation de handicap :</span>
                <span className="font-bold text-gray-900">{data.inclusion.collaborateursSituationHandicap} salariés (4 aménagements)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Écart salarial F/H à poste équivalent :</span>
                <span className="font-bold text-[#008000]">{data.inclusion.ecartRemunerationGlobalFh}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Réunions mensuelles Délégués :</span>
                <span className="font-bold text-gray-900">{data.relationsSociales.reunionsMensuellesDirectionDelegues} tenues</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue 2 : Consultation par Chapitre Statutaire */}
      {activeTab === 'chapters' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Navigation parmi les 8 Chapitres Réglementaires du Bilan Social
            </h3>
            <span className="text-xs font-mono font-bold text-[#002B7F]">Exercice civil {data.anneeExercice}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Sommaire des chapitres */}
            <div className="p-3 space-y-1 bg-gray-50/50">
              {[
                { id: 1, title: 'I. Emploi & Effectifs' },
                { id: 2, title: 'II. Mouvements & Départs' },
                { id: 3, title: 'III. Salaires & Charges' },
                { id: 4, title: 'IV. Hygiène, Sécurité CSST' },
                { id: 5, title: 'V. Formation Continue FDFP' },
                { id: 6, title: 'VI. Dialogue Social & Accords' },
                { id: 7, title: 'VII. Œuvres Sociales & Santé' },
                { id: 8, title: 'VIII. Égalité F/H & Handicap' }
              ].map((chap) => (
                <button
                  key={chap.id}
                  onClick={() => setSelectedChapter(chap.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedChapter === chap.id
                      ? 'bg-[#002B7F] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-200/60'
                  }`}
                >
                  <span>{chap.title}</span>
                </button>
              ))}
            </div>

            {/* Contenu du chapitre sélectionné */}
            <div className="md:col-span-3 p-6 space-y-4">
              {selectedChapter === 1 && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-[#002B7F]">
                    Chapitre I : Structure de l'Emploi & Répartition Démographique
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Au 31 décembre {data.anneeExercice}, l'effectif total sous contrat s'élève à <strong>{data.effectifTotal} collaborateurs</strong>, répartis en 215 CDI (86.7%), 28 CDD (11.3%) et 5 stagiaires école-entreprise. Le taux d'emploi féminin s'établit à 41.1% (102 collaboratrices).
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-gray-500">Cadres & Ingénieurs :</span>
                      <p className="font-bold text-gray-900 mt-0.5">{data.repartitionCsp.cadresIngenieurs} salariés</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Agents de Maîtrise & Tech :</span>
                      <p className="font-bold text-gray-900 mt-0.5">{data.repartitionCsp.agentsMaitriseTechniciens} salariés</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Employés & Caissiers :</span>
                      <p className="font-bold text-gray-900 mt-0.5">{data.repartitionCsp.employesOuvriers} salariés</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedChapter === 3 && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-[#002B7F]">
                    Chapitre III : Masse Salariale Brute & Prélèvements Sociaux
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    La masse salariale brute annuelle déclarée pour l'exercice {data.anneeExercice} s'élève à <strong>2 150 000 000 FCFA</strong>, donnant un salaire moyen mensuel brut de 722 400 FCFA. L'entreprise est à jour de ses cotisations sociales auprès de la Caisse Nationale de Prévoyance Sociale (CNPS) et de la Caisse Nationale d'Assurance Maladie (CMU).
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-gray-500">Total Cotisations Patronales :</span>
                      <p className="font-bold text-[#002B7F] font-mono mt-0.5">344 000 000 FCFA</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Taxe d'Apprentissage FDFP :</span>
                      <p className="font-bold text-[#008000] font-mono mt-0.5">25 800 000 FCFA (1.2%)</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedChapter === 4 && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-[#002B7F]">
                    Chapitre IV : Hygiène, Sécurité & Commission Santé CSST
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Durant l'exercice {data.anneeExercice}, 2 accidents du travail avec arrêt et 3 accidents de trajet ont été enregistrés et télédéclarés à la CNPS sous 48 heures. Le Comité de Santé et Sécurité au Travail (CSST) a tenu ses 4 réunions trimestrielles obligatoires.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-gray-500">Taux de Fréquence (TF) :</span>
                      <p className="font-bold text-amber-700 font-mono mt-0.5">{data.securite.tauxFrequence} (Conforme &lt; 10)</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Taux de Gravité (TG) :</span>
                      <p className="font-bold text-amber-700 font-mono mt-0.5">{data.securite.tauxGravite}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedChapter === 6 && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-[#002B7F]">
                    Chapitre VI : Relations Professionnelles & Climat Social
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Le dialogue social est animé par 4 délégués du personnel titulaires et 4 suppléants élus. 11 réunions mensuelles ont été tenues avec la Direction Générale et un protocole d'accord d'entreprise NAO 2026 a été signé et déposé au greffe du Tribunal du Travail. Aucun mouvement de grève n'a été enregistré.
                  </p>
                </div>
              )}

              {![1, 3, 4, 6].includes(selectedChapter) && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-[#002B7F]">
                    Données Consolidées du Chapitre {selectedChapter}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Les indicateurs de ce chapitre sont compilés et visés conformément aux directives du Ministère de l'Emploi et de la Protection Sociale (MEPS).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Document d'Inspection Officiel à Imprimer / Télécharger */}
      {activeTab === 'official-doc' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                Bilan Social d'Entreprise Officiel — Direction Générale du Travail
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer le Dossier
              </button>
              <button
                onClick={() => {
                  const content = document.getElementById('print-social-report').innerText;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Rapport_Social_Annuel_MEPS_${data.anneeExercice}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div id="print-social-report" className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`RÉPUBLIQUE DE CÔTE D'IVOIRE
Union - Discipline - Travail
MINISTÈRE DE L'EMPLOI ET DE LA PROTECTION SOCIALE (MEPS)
DIRECTION GÉNÉRALE DU TRAVAIL & DES LOIS SOCIALES

RAPPORT SOCIAL ANNUEL D'ENTREPRISE (EXERCICE ${data.anneeExercice})
(Établi en application stricte de l'Article 93 du Code du Travail de Côte d'Ivoire)

I. IDENTIFICATION DE L'ÉTABLISSEMENT :
- Raison sociale : ${data.entreprise}
- Siège Social : ${data.siegeSocial}
- Inspection de rattachement : ${data.inspectionRattachement}
- Responsable de l'établissement : ${data.directeurRH}
- Date d'arrêté des comptes sociaux : ${data.dateCloture}

II. SYNTHÈSE DES GRANDS INDICATEURS SOCIAUX LÉGAUX :
1. EFFECTIF TOTAL AU 31 DÉCEMBRE : ${data.effectifTotal} collaborateurs
   - Hommes : ${data.effectifHommes} (${Math.round((data.effectifHommes/data.effectifTotal)*100)}%)
   - Femmes : ${data.effectifFemmes} (${Math.round((data.effectifFemmes/data.effectifTotal)*100)}%)
   - Salariés nationaux ivoiriens : ${data.repartitionNationalite.ivoiriens} (93.1%)
   - Salariés ressortissants CEDEAO : ${data.repartitionNationalite.ressortissantsCedeao}
   - Salariés expatriés hors CEDEAO : ${data.repartitionNationalite.horsCedeaoExpatries}

2. STRUCTURE DES CONTRATS DE TRAVAIL :
   - Contrats à Durée Indéterminée (CDI) : ${data.repartitionContrats.cdi}
   - Contrats à Durée Déterminée (CDD) : ${data.repartitionContrats.cdd}
   - Stagiaires conventionnés école : ${data.repartitionContrats.stagiaires}

3. MASSE SALARIALE & PRESTATIONS SOCIALES :
   - Masse salariale brute globale annuelle : ${data.masseSalarialeBruteAnnuelle.toLocaleString('fr-FR')} FCFA
   - Cotisations CNPS et CMU patronales acquittées : ${data.chargesPatronalesCnpsCmu.toLocaleString('fr-FR')} FCFA
   - Taxe d'apprentissage FDFP acquittée (1.2%) : ${data.taxeFdfpAcquittee.toLocaleString('fr-FR')} FCFA

4. HYGIÈNE, SÉCURITÉ & SANTÉ AU TRAVAIL (CSST) :
   - Accidents du travail déclarés : ${data.securite.accidentsTravailAvecArret}
   - Taux de Fréquence (TF) : ${data.securite.tauxFrequence}
   - Taux de Gravité (TG) : ${data.securite.tauxGravite}
   - Réunions légales CSST tenues : ${data.securite.reunionsCsstTenues} / 4

5. RELATIONS PROFESSIONNELLES & DIALOGUE SOCIAL :
   - Nombre de Délégués du Personnel : ${data.relationsSociales.deleguesPersonnelTitulaires} titulaires / ${data.relationsSociales.deleguesSuppleans} suppléants
   - Réunions mensuelles avec la Direction : ${data.relationsSociales.reunionsMensuellesDirectionDelegues}
   - Accords d'entreprise signés : Accord NAO 2026 déposé au Tribunal du Travail

6. TRAVAILLEURS EN SITUATION DE HANDICAP :
   - Collaborateurs sous statut travailleur handicapé : ${data.inclusion.collaborateursSituationHandicap} salariés
   - Aménagements de poste ergonomiques réalisés : ${data.inclusion.amenagementsPosteErgonomiques} postes

Fait à Abidjan, le ${todayStr}.

Pour la Société SII-CI                                  Avis du Collège des Délégués du Personnel
La Direction du Capital Humain                          "Rapport social annuel certifié conforme et discuté
                                                         lors de la réunion paritaire du 18/11/2026."
(Cachet & Signature Direction)                          (Signatures des Délégués titulaires)`}
          </div>
        </div>
      )}
    </div>
  );
}
