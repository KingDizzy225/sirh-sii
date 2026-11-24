import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Clock, 
  FileText, 
  Filter, 
  Users, 
  CheckCircle2, 
  ShieldAlert, 
  Download, 
  Eye, 
  ChevronRight, 
  Search, 
  Printer, 
  Briefcase, 
  UserX,
  Stethoscope,
  Info
} from 'lucide-react';

// Seuil Bradford officiel
// B = S^2 * D (S = occurrences / spells, D = total jours d'absence)
// 0 - 49 : Risque Faible (Absentéisme normal ou occasionnel)
// 50 - 199 : Risque Modéré (Surveillance RH recommandée)
// 200 - 499 : Risque Élevé (Entretien de recadrage RH / Médecine du travail)
// 500+ : Risque Critique (Désorganisation opérationnelle sévère / Procédure disciplinaire ou médicale)

const MOCK_ABSENTEEISM_DATA = [
  {
    id: 'EMP-0142',
    name: 'Kouassi Marc-Antoine',
    matricule: 'MTR-2022-0142',
    poste: 'Caissier Principal',
    departement: 'Opérations Réseau',
    agence: 'Agence Centrale Plateau (Abidjan)',
    spells: 7, // 7 épisodes distincts
    days: 11, // 11 jours au total
    // B = 7^2 * 11 = 49 * 11 = 539 -> CRITIQUE (micro-absences répétées)
    lundiVendrediCount: 6,
    certifiedDays: 2,
    unjustifiedDays: 9,
    hasPendingNotice: true,
    lastAbsenceDate: '2026-11-20',
    history: [
      { date: '2026-11-20', duration: 1, dayName: 'Vendredi', reason: 'Absence injustifiée', status: 'Non justifié' },
      { date: '2026-11-09', duration: 1, dayName: 'Lundi', reason: 'Panne transport Abobo', status: 'Non justifié' },
      { date: '2026-10-23', duration: 2, dayName: 'Jeudi-Vendredi', reason: 'Migraine sévère', status: 'Certificat reçu tard' },
      { date: '2026-10-05', duration: 1, dayName: 'Lundi', reason: 'Urgence familiale', status: 'Non justifié' },
      { date: '2026-09-18', duration: 2, dayName: 'Vendredi-Samedi', reason: 'Fièvre sans arrêt', status: 'Non justifié' },
      { date: '2026-08-28', duration: 2, dayName: 'Vendredi-Lundi', reason: 'Paludisme simple', status: 'Arrêt certifié (48h)' },
      { date: '2026-08-10', duration: 2, dayName: 'Lundi-Mardi', reason: 'Motif non communiqué', status: 'Non justifié' },
    ]
  },
  {
    id: 'EMP-0089',
    name: 'Bamba Fatoumata',
    matricule: 'MTR-2021-0089',
    poste: 'Conseillère Clientèle Particuliers',
    departement: 'Commercial & Vente',
    agence: 'Agence Treichville Arras',
    spells: 1, // 1 seul épisode long
    days: 18, // 18 jours consécutifs
    // B = 1^2 * 18 = 18 -> TRES FAIBLE (arrêt maladie certifié lourd, peu perturbateur)
    lundiVendrediCount: 0,
    certifiedDays: 18,
    unjustifiedDays: 0,
    hasPendingNotice: false,
    lastAbsenceDate: '2026-10-15',
    history: [
      { date: '2026-09-28', duration: 18, dayName: 'Lundi au Vendredi', reason: 'Chirurgie ambulatoire & convalescence', status: 'Arrêt certifié médecin agréé' }
    ]
  },
  {
    id: 'EMP-0215',
    name: 'Yao N\'Guessan Sylvestre',
    matricule: 'MTR-2023-0215',
    poste: 'Gestionnaire de Flux & Dépôts',
    departement: 'Opérations Réseau',
    agence: 'Agence Cocody Deux-Plateaux',
    spells: 4,
    days: 8,
    // B = 4^2 * 8 = 16 * 8 = 128 -> MODÉRÉ
    lundiVendrediCount: 3,
    certifiedDays: 4,
    unjustifiedDays: 4,
    hasPendingNotice: false,
    lastAbsenceDate: '2026-11-13',
    history: [
      { date: '2026-11-13', duration: 1, dayName: 'Vendredi', reason: 'Fièvre', status: 'Non justifié' },
      { date: '2026-10-16', duration: 1, dayName: 'Vendredi', reason: 'Démarche administrative CNPS', status: 'Non justifié' },
      { date: '2026-09-07', duration: 2, dayName: 'Lundi-Mardi', reason: 'Gastroentérite', status: 'Arrêt certifié' },
      { date: '2026-08-03', duration: 4, dayName: 'Lundi au Jeudi', reason: 'Accident trajet léger', status: 'Arrêt certifié' },
    ]
  },
  {
    id: 'EMP-0034',
    name: 'Koffi Marie-Chantal',
    matricule: 'MTR-2019-0034',
    poste: 'Chef de Caisse',
    departement: 'Opérations Réseau',
    agence: 'Agence Yopougon Keneya',
    spells: 5,
    days: 14,
    // B = 5^2 * 14 = 25 * 14 = 350 -> ÉLEVÉ
    lundiVendrediCount: 4,
    certifiedDays: 8,
    unjustifiedDays: 6,
    hasPendingNotice: true,
    lastAbsenceDate: '2026-11-16',
    history: [
      { date: '2026-11-16', duration: 2, dayName: 'Lundi-Mardi', reason: 'Absence sans contact', status: 'Non justifié' },
      { date: '2026-10-30', duration: 3, dayName: 'Vendredi au Mardi', reason: 'Grippe saisonnière', status: 'Certificat tardif' },
      { date: '2026-09-11', duration: 1, dayName: 'Vendredi', reason: 'Panne véhicule', status: 'Non justifié' },
      { date: '2026-08-14', duration: 4, dayName: 'Vendredi au Mercredi', reason: 'Crise de paludisme', status: 'Arrêt certifié' },
      { date: '2026-07-20', duration: 4, dayName: 'Lundi au Jeudi', reason: 'Entorse cheville', status: 'Arrêt certifié' },
    ]
  },
  {
    id: 'EMP-0188',
    name: 'Koné Bakary',
    matricule: 'MTR-2022-0188',
    poste: 'Analyste Risque Crédit',
    departement: 'Direction des Risques',
    agence: 'Siège Social Plateau',
    spells: 2,
    days: 3,
    // B = 2^2 * 3 = 4 * 3 = 12 -> FAIBLE
    lundiVendrediCount: 1,
    certifiedDays: 3,
    unjustifiedDays: 0,
    hasPendingNotice: false,
    lastAbsenceDate: '2026-09-04',
    history: [
      { date: '2026-09-04', duration: 1, dayName: 'Vendredi', reason: 'Consultation cardiologue', status: 'Arrêt certifié' },
      { date: '2026-06-15', duration: 2, dayName: 'Lundi-Mardi', reason: 'Syndrome viral', status: 'Arrêt certifié' }
    ]
  }
];

export default function FacteurBradfordAbsenteisme() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState(MOCK_ABSENTEEISM_DATA[0]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'detail' | 'legal-notice'
  const [generatedLetter, setGeneratedLetter] = useState(null);

  // Calcul du score Bradford B = S^2 * D
  const calculateBradford = (spells, days) => {
    return Math.pow(spells, 2) * days;
  };

  const getBradfordRisk = (score) => {
    if (score >= 500) {
      return { 
        level: 'Critique', 
        badge: 'bg-red-50 text-red-700 border-red-200',
        color: '#dc2626',
        action: 'Mise en demeure 48h / Convocation entretien recadrage'
      };
    }
    if (score >= 200) {
      return { 
        level: 'Élevé', 
        badge: 'bg-amber-50 text-amber-800 border-amber-300',
        color: '#d97706',
        action: 'Entretien managérial & visite médecin du travail'
      };
    }
    if (score >= 50) {
      return { 
        level: 'Modéré', 
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        color: '#002B7F',
        action: 'Alerte superviseur d\'agence / Suivi régularité'
      };
    }
    return { 
      level: 'Faible', 
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      color: '#008000',
      action: 'Aucune action requise (situation normale)'
    };
  };

  const filteredEmployees = useMemo(() => {
    return MOCK_ABSENTEEISM_DATA.filter((emp) => {
      const matchSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.agence.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDept = deptFilter === 'ALL' || emp.departement === deptFilter;
      
      const score = calculateBradford(emp.spells, emp.days);
      const risk = getBradfordRisk(score);
      const matchRisk = riskFilter === 'ALL' || risk.level === riskFilter;

      return matchSearch && matchDept && matchRisk;
    });
  }, [searchTerm, deptFilter, riskFilter]);

  // Statistiques globales
  const stats = useMemo(() => {
    const total = MOCK_ABSENTEEISM_DATA.length;
    let criticalCount = 0;
    let highCount = 0;
    let totalUnjustifiedDays = 0;
    let mondayFridaySpells = 0;

    MOCK_ABSENTEEISM_DATA.forEach(e => {
      const b = calculateBradford(e.spells, e.days);
      if (b >= 500) criticalCount++;
      else if (b >= 200) highCount++;
      totalUnjustifiedDays += e.unjustifiedDays;
      mondayFridaySpells += e.lundiVendrediCount;
    });

    return { total, criticalCount, highCount, totalUnjustifiedDays, mondayFridaySpells };
  }, []);

  // Génération de la Mise en demeure 48h (Art. 15 Code du Travail CI & CCNI)
  const handleGenerateNotice = (emp) => {
    const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const content = `DIRECTION DU CAPITAL HUMAIN & RELATIONS SOCIALES
SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Siège Social : Boulevard de la République, Plateau, Abidjan

Réf : DCH/RS/DISC/${new Date().getFullYear()}/${emp.matricule}
Abidjan, le ${todayStr}

LETTRE DE MISE EN DEMEURE POUR ABSENCE INJUSTIFIÉE
(Sous pli recommandé avec accusé de réception ou remise en main propre contre décharge)

À l'attention de :
Monsieur / Madame ${emp.name}
Matricule : ${emp.matricule}
Fonction : ${emp.poste}
Affectation : ${emp.agence}

Monsieur / Madame,

Nous constatons avec une vive préoccupation que vous ne vous êtes pas présenté(e) à votre poste de travail depuis le ${emp.lastAbsenceDate}, sans que cette absence n'ait fait l'objet d'une autorisation préalable de votre hiérarchie, ni de la transmission d'un certificat médical régulier dans le délai statutaire de quarante-huit (48) heures prévu par la Convention Collective Interinterprofessionnelle (CCNI) de Côte d'Ivoire.

Il ressort en outre de l'audit de votre dossier d'assiduité que vous cumulez un total de ${emp.unjustifiedDays} jours d'absence non justifiés répartis sur ${emp.spells} épisodes distincts (Facteur de Bradford : ${calculateBradford(emp.spells, emp.days)} pts), désorganisant gravement la continuité de service au sein de votre entité.

Par la présente, NOUS VOUS METTONS EN DEMEURE de :
1. Justifier valablement les motifs de votre absence en nous transmettant sous 48 heures ouvrables à compter de la réception de la présente lettre un justificatif médical légal délivré par un praticien agréé ;
2. Ou, à défaut, de réintégrer immédiatement votre poste de travail dès réception.

À défaut de reprise effective ou de justification valable dans le délai prescrit de 48 heures, nous serons au regret de considérer votre situation comme un abandon de poste ou une faute disciplinaire grave, ouvrant droit à l'engagement immédiat d'une procédure de sanction conformément aux dispositions de l'Article 16 de la CCNI et du Code du Travail ivoirien.

Veuillez agréer, Monsieur / Madame, l'expression de nos salutations distinguées.


La Direction du Capital Humain
SII Côte d'Ivoire

---
Accusé de réception par le salarié :
"Je soussigné(e) ${emp.name}, reconnais avoir reçu la présente mise en demeure le ___/___/2026."
Signature et mention manuscrite :`;

    setGeneratedLetter({ emp, content, date: todayStr });
    setActiveTab('legal-notice');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header avec Palette Officielle SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Diagnostic Analytique RH
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Algorithme Bradford B = S² × D
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Facteur de Bradford & Absentéisme Réseau
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Pondération objective de la désorganisation opérationnelle : détection des micro-absences répétées (effet ponts lundi/vendredi) vs arrêts maladie de longue durée. Conforme au droit du travail ivoirien.
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
              Vue Matrice & Risques
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'detail'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Fiche Salarié & Chronologie
            </button>
            {generatedLetter && (
              <button
                onClick={() => setActiveTab('legal-notice')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'legal-notice'
                    ? 'bg-[#008000] text-white shadow'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Mise en Demeure (Générée)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Effectif Audité</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.total} collaborateurs</h3>
            <p className="text-xs text-gray-500 mt-1">Réseau d'agences & Siège</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Risque Bradford Critique</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.criticalCount} cas (Score &gt; 500)</h3>
            <p className="text-xs text-red-500 mt-1 font-medium">Désorganisation sévère</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jours Non Justifiés</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.totalUnjustifiedDays} jours</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Absences sans arrêt 48h</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Incidence Lundi / Vendredi</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.mondayFridaySpells} occurrences</h3>
            <p className="text-xs text-gray-500 mt-1">Micro-absences en bout de semaine</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Rappel Pédagogique Formule Bradford */}
      <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#002B7F] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#002B7F] font-semibold">Principe de l'Indicateur de Bradford : </strong>
          La formule <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold text-[#002B7F]">Score B = S² × D</code> pénalise lourdement la fréquence des interruptions (S = nombre d'épisodes distincts) plutôt que leur durée cumulée (D = nombre de jours).
          <span className="block mt-1 text-gray-600">
            Exemple concret : Un salarié arrêté <strong>1 seule fois pendant 14 jours</strong> pour chirurgie a un score de <code className="bg-white px-1 font-bold">1² × 14 = 14 pts</code> (faible perturbation). Un salarié cumulant <strong>7 arrêts de 2 jours</strong> totalise aussi 14 jours mais un score de <code className="bg-white px-1 font-bold text-red-600">7² × 14 = 686 pts</code> (désorganisation imprévisible et intenable pour les équipes de caisse).
          </span>
        </div>
      </div>

      {/* Vue 1 : Overview & Matrice */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Barre de filtres */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher salarié, matricule, agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-500 font-medium">Département:</span>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-transparent font-medium text-gray-700 focus:outline-none"
                >
                  <option value="ALL">Tous</option>
                  <option value="Opérations Réseau">Opérations Réseau</option>
                  <option value="Commercial & Vente">Commercial & Vente</option>
                  <option value="Direction des Risques">Direction des Risques</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
                <span className="text-gray-500 font-medium">Niveau Risque:</span>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-transparent font-medium text-gray-700 focus:outline-none"
                >
                  <option value="ALL">Tous</option>
                  <option value="Critique">Critique (B &gt; 500)</option>
                  <option value="Élevé">Élevé (B: 200-499)</option>
                  <option value="Modéré">Modéré (B: 50-199)</option>
                  <option value="Faible">Faible (B &lt; 50)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Salarié / Matricule</th>
                  <th className="py-3.5 px-4">Poste & Affectation</th>
                  <th className="py-3.5 px-4 text-center">Épisodes (S)</th>
                  <th className="py-3.5 px-4 text-center">Jours Totaux (D)</th>
                  <th className="py-3.5 px-4 text-center">Formule Bradford</th>
                  <th className="py-3.5 px-4 text-center">Score B</th>
                  <th className="py-3.5 px-4">Diagnostic & Action RH</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((emp) => {
                  const score = calculateBradford(emp.spells, emp.days);
                  const risk = getBradfordRisk(score);

                  return (
                    <tr 
                      key={emp.id} 
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setActiveTab('detail');
                      }}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{emp.matricule}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-gray-800 text-xs font-medium">{emp.poste}</div>
                        <div className="text-xs text-gray-500">{emp.agence}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                          {emp.spells}
                        </span>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {emp.lundiVendrediCount} lun/ven
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-gray-800">
                          {emp.days} j
                        </span>
                        <div className="text-[10px] text-red-500 font-medium">
                          {emp.unjustifiedDays} j non just.
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-500">
                        {emp.spells}² × {emp.days} =
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-base font-extrabold text-[#002B7F]">
                          {score}
                        </span>
                        <span className="text-[10px] block text-gray-400">pts</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${risk.badge}`}>
                          {risk.level}
                        </span>
                        <p className="text-[11px] text-gray-600 mt-1 line-clamp-1">
                          {risk.action}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setActiveTab('detail');
                            }}
                            className="p-1.5 text-gray-500 hover:text-[#002B7F] hover:bg-gray-100 rounded-lg"
                            title="Voir l'historique"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {score >= 200 && (
                            <button
                              onClick={() => handleGenerateNotice(emp)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center gap-1"
                              title="Générer mise en demeure 48h"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Mise en demeure
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : Fiche Détaillée & Chronologie des Épisodes */}
      {activeTab === 'detail' && selectedEmployee && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {selectedEmployee.matricule}
                </span>
                <span className="text-xs font-semibold text-[#002B7F] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {selectedEmployee.departement}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedEmployee.name}</h2>
              <p className="text-sm text-gray-600">{selectedEmployee.poste} • {selectedEmployee.agence}</p>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">Formule</p>
                <p className="text-sm font-mono font-semibold text-gray-700">{selectedEmployee.spells}² × {selectedEmployee.days}</p>
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div className="text-center">
                <p className="text-xs text-gray-500">Score Bradford</p>
                <p className="text-2xl font-black text-[#002B7F]">
                  {calculateBradford(selectedEmployee.spells, selectedEmployee.days)}
                </p>
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getBradfordRisk(calculateBradford(selectedEmployee.spells, selectedEmployee.days)).badge}`}>
                  Risque {getBradfordRisk(calculateBradford(selectedEmployee.spells, selectedEmployee.days)).level}
                </span>
              </div>
            </div>
          </div>

          {/* Décomposition analytique */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Jours Arrêts Certifiés</h4>
              <p className="text-xl font-bold text-[#008000] mt-1">{selectedEmployee.certifiedDays} jours</p>
              <p className="text-xs text-gray-500 mt-1">Délivrés par médecin agréé ou clinique conventionnée</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Absences Injustifiées</h4>
              <p className="text-xl font-bold text-red-600 mt-1">{selectedEmployee.unjustifiedDays} jours</p>
              <p className="text-xs text-red-500 mt-1 font-medium">Non transmises dans les 48h (CCNI Art. 15)</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Effet "Pont / Fin de Semaine"</h4>
              <p className="text-xl font-bold text-amber-600 mt-1">{selectedEmployee.lundiVendrediCount} épisodes</p>
              <p className="text-xs text-gray-500 mt-1">Absences constatées le lundi ou vendredi</p>
            </div>
          </div>

          {/* Historique chronologique des absences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#002B7F]" />
                Historique Détaillé des {selectedEmployee.history.length} Épisodes d'Absence
              </h3>
              <button
                onClick={() => handleGenerateNotice(selectedEmployee)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Générer Mise en Demeure Formelle (48h)
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {selectedEmployee.history.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#002B7F] font-bold text-xs flex items-center justify-center font-mono">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{item.date}</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {item.dayName}
                        </span>
                        <span className="text-xs font-bold text-gray-700">
                          ({item.duration} jour{item.duration > 1 ? 's' : ''})
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">Motif déclaré : {item.reason}</p>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.status.includes('certifié')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Modèle et Impression de Mise en Demeure */}
      {activeTab === 'legal-notice' && generatedLetter && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                Mise en Demeure Prévue par la CCNI & Code du Travail CI (48h)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer le Document
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([generatedLetter.content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Mise_en_demeure_${generatedLetter.emp.matricule}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-gray-50/40">
            {generatedLetter.content}
          </div>
        </div>
      )}
    </div>
  );
}
