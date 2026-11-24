import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Scale, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Calendar, 
  AlertCircle,
  HelpCircle,
  Users,
  ChevronRight,
  Eye,
  PlusCircle
} from 'lucide-react';

// ÉCHELLE LÉGALE DES SANCTIONS (Art. 16 CCNI & Code du Travail CI) :
// 1. Avertissement écrit
// 2. Blâme avec inscription au dossier individuel
// 3. Mise à pied temporaire de 1 à 8 jours (privation de salaire)
// 4. Licenciement pour faute lourde (sans préavis ni indemnités)
// Règles strictes :
// - Prescription : 3 mois (90 jours) pour engager les poursuites à compter de la connaissance des faits fautifs.
// - Assistance : Convocation obligatoire avec droit d'assistance par un Délégué du Personnel élu.
// - Amnistie légale : Effacement automatique du dossier après 12 mois sans nouvelle sanction.

const MOCK_DISCIPLINARY_CASES = [
  {
    id: 'SANCT-2026-0041',
    matricule: 'MTR-2022-0142',
    name: 'Kouassi Marc-Antoine',
    poste: 'Caissier Principal',
    agence: 'Agence Centrale Plateau',
    natureFaute: 'Écart de caisse injustifié récurrent & retards répétés',
    degreFaute: 'Faute Moyenne',
    dateConstat: '2026-10-15', // Date de connaissance des faits
    dateEntretien: '2026-10-22',
    deleguePersonnelAssistance: 'Konan Yao (Délégué UGTI)',
    sanctionAppliquee: 'Mise à pied de 3 jours',
    dureeMiseAPied: 3,
    dateEffet: '2026-10-27',
    dateAmnistiePrevue: '2027-10-27', // J+12 mois
    statutProcedure: 'Sanction exécutée',
    prescriptionJoursRestants: null, // Déjà jugé
    amnistieMoisRestants: 11,
    historiquePrecedent: ['Avertissement écrit le 15/02/2026 (amnistie en cours)'],
    lettreMotivation: `Pour avoir enfreint les procédures de clôture journalière et constaté un écart de caisse non justifié de 150 000 FCFA lors de la vacation du 14 octobre 2026.`
  },
  {
    id: 'SANCT-2026-0052',
    matricule: 'MTR-2020-0078',
    name: 'Touré Adama',
    poste: 'Chargé d\'Affaires Entreprises',
    agence: 'Agence Zone Industrielle Vridi',
    natureFaute: 'Divulgation non autorisée de données confidentielles client',
    degreFaute: 'Faute Lourde',
    dateConstat: '2026-11-05',
    dateEntretien: '2026-11-18',
    deleguePersonnelAssistance: 'Mme Gnahoré Estelle (Déléguée FESACI)',
    sanctionAppliquee: 'Licenciement pour Faute Lourde',
    dureeMiseAPied: null,
    dateEffet: '2026-11-20',
    dateAmnistiePrevue: 'Non applicable',
    statutProcedure: 'Notification transmise à l\'Inspection du Travail',
    prescriptionJoursRestants: null,
    amnistieMoisRestants: null,
    historiquePrecedent: ['Aucun antécédent'],
    lettreMotivation: `Manquement délibéré à la clause de stricte confidentialité bancaire et au secret professionnel, ayant occasionné un préjudice direct de réputation auprès de l'établissement.`
  },
  {
    id: 'SANCT-2026-0063',
    matricule: 'MTR-2023-0311',
    name: 'Diallo Ousmane',
    poste: 'Guichetier Accueil',
    agence: 'Agence Yopougon Keneya',
    natureFaute: 'Insubordination caractérisée envers le Chef d\'Agence',
    degreFaute: 'Faute Simple',
    dateConstat: '2026-11-10',
    dateEntretien: '2026-11-28',
    deleguePersonnelAssistance: 'En attente désignation',
    sanctionAppliquee: 'En cours d\'instruction (Convocation envoyée)',
    dureeMiseAPied: null,
    dateEffet: 'En cours',
    dateAmnistiePrevue: 'En attente décision',
    statutProcedure: 'Convocation envoyée (J-3 entretien)',
    prescriptionJoursRestants: 76, // 90 jours - 14 jours écoulés
    amnistieMoisRestants: null,
    historiquePrecedent: ['Aucun antécédent'],
    lettreMotivation: `Refus catégorique et public de prêter main forte au guichet n°2 lors du pic d'affluence des retraités CNPS le 9 novembre 2026.`
  },
  {
    id: 'SANCT-2025-0019',
    matricule: 'MTR-2018-0023',
    name: 'Soro Aminata',
    poste: 'Responsable Crédit PME',
    agence: 'Siège Social Plateau',
    natureFaute: 'Retard dans la soumission des dossiers de provisionnement',
    degreFaute: 'Faute Légère',
    dateConstat: '2025-10-02',
    dateEntretien: '2025-10-10',
    deleguePersonnelAssistance: 'Kouamé Jean (Délégué)',
    sanctionAppliquee: 'Avertissement écrit',
    dureeMiseAPied: null,
    dateEffet: '2025-10-14',
    dateAmnistiePrevue: '2026-10-14',
    statutProcedure: 'Amnistié & Effacé du dossier',
    prescriptionJoursRestants: null,
    amnistieMoisRestants: 0,
    historiquePrecedent: [],
    lettreMotivation: `Rappel à l'ordre formel pour non-respect des échéances du comité de crédit mensuel.`
  }
];

export default function RegistreDisciplinaireSanctions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(MOCK_DISCIPLINARY_CASES[0]);
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'detail' | 'generator'
  const [generatedDoc, setGeneratedDoc] = useState(null);

  // Formulaire pour générateur de convocation ou notification légale
  const [formType, setFormType] = useState('CONVOCATION'); // 'CONVOCATION' | 'SANCTION_NOTIFICATION'

  const filteredCases = useMemo(() => {
    return MOCK_DISCIPLINARY_CASES.filter((c) => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.agence.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'EN_COURS' && c.statutProcedure.includes('En cours')) ||
        (statusFilter === 'EXECUTEE' && c.statutProcedure.includes('exécutée')) ||
        (statusFilter === 'AMNISTIEE' && c.statutProcedure.includes('Amnistié'));

      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  // Statistiques
  const stats = useMemo(() => {
    let enCours = 0;
    let executees = 0;
    let amnistiees = 0;
    let lourdes = 0;

    MOCK_DISCIPLINARY_CASES.forEach(c => {
      if (c.statutProcedure.includes('En cours')) enCours++;
      else if (c.statutProcedure.includes('exécutée')) executees++;
      else if (c.statutProcedure.includes('Amnistié')) amnistiees++;

      if (c.degreFaute === 'Faute Lourde') lourdes++;
    });

    return { total: MOCK_DISCIPLINARY_CASES.length, enCours, executees, amnistiees, lourdes };
  }, []);

  // Génération du document formel (Convocation avec droit d'assistance OU Notification de sanction)
  const handleGenerateDocument = (c, type) => {
    const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    let title = '';
    let body = '';

    if (type === 'CONVOCATION') {
      title = `LETTRE DE CONVOCATION À UN ENTRETIEN PRÉALABLE DISCIPLINAIRE`;
      body = `DIRECTION DU CAPITAL HUMAIN & DES AFFAIRES JURIDIQUES
SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Réf : DCH/JUR/DISC/${c.id}
Abidjan, le ${todayStr}

LETTRE REMISE EN MAIN PROPRE CONTRE DÉCHARGE OU LETTRE RECOMMANDÉE

À l'attention de :
Monsieur / Madame ${c.name}
Matricule : ${c.matricule}
Fonction : ${c.poste}
Affectation : ${c.agence}

OBJET : CONVOCATION À UN ENTRETIEN PRÉALABLE DISCIPLINAIRE
(Application stricte de l'Article 16 de la CCNI et du Code du Travail de Côte d'Ivoire)

Monsieur / Madame,

Nous sommes amenés à envisager à votre encontre une sanction disciplinaire, à la suite des faits suivants portés à notre connaissance le ${c.dateConstat} :
"${c.natureFaute}".

En application des garanties légales et conventionnelles prévues par la Convention Collective Interinterprofessionnelle (CCNI) de Côte d'Ivoire, nous vous prions de bien vouloir vous présenter :

Date et Heure : Le ${c.dateEntretien || 'Vendredi 28 Novembre 2026 à 10h00'}
Lieu : Salle de Réunion de la Direction du Capital Humain, Siège Social SII, Boulevard de la République, Plateau, Abidjan.

DROIT D'ASSISTANCE LÉGALE :
Nous vous informons expressément que vous avez le droit strict de vous faire assister au cours de cet entretien par un Délégué du Personnel élu de votre choix, ou par un représentant de votre organisation syndicale légalement constituée au sein de l'entreprise.

Au cours de cet entretien, nous vous exposerons les motifs de la mesure envisagée et nous recueillerons l'ensemble de vos explications et observations.

Veuillez agréer, Monsieur / Madame, l'expression de nos salutations distinguées.


Pour la Direction Générale & DCH
SII Côte d'Ivoire

---
ACCUSÉ DE RÉCEPTION MANUSCRIT DU SALARIÉ :
"Reçu en main propre le ___/___/2026 à ___h___"
Nom & Signature du salarié :`;
    } else {
      title = `NOTIFICATION OFFICIELLE DE SANCTION DISCIPLINAIRE`;
      body = `DIRECTION DU CAPITAL HUMAIN & DES AFFAIRES JURIDIQUES
SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Réf : DCH/NOTIF-SANCT/${c.id}
Abidjan, le ${todayStr}

NOTIFICATION DE DÉCISION DISCIPLINAIRE
(Sous pli recommandé ou remise en main propre contre décharge)

À l'attention de :
Monsieur / Madame ${c.name}
Matricule : ${c.matricule} - Poste : ${c.poste} - Agence : ${c.agence}

Monsieur / Madame,

Faisant suite à notre convocation en date du ${c.dateConstat} et à l'entretien préalable qui s'est tenu le ${c.dateEntretien} en présence de votre conseil (${c.deleguePersonnelAssistance}), nous vous notifions par la présente la décision prise par la Direction :

SANCTION RETENUE : ${c.sanctionAppliquee.toUpperCase()}
Date de prise d'effet : ${c.dateEffet}

MOTIVATION DE LA DÉCISION :
${c.lettreMotivation}

GARANTIE D'AMNISTIE LÉGALE (Art. 16 alinéa 5 CCNI) :
Conformément aux dispositions de l'Article 16 de la CCNI de Côte d'Ivoire, si aucune autre sanction disciplinaire n'intervient à votre encontre dans un délai de douze (12) mois consécutifs à compter de la date de prise d'effet, la présente sanction sera automatiquement effacée de votre dossier individuel et ne pourra plus être invoquée à l'appui d'une quelconque récidive.

Copie transmise pour information et respect de la légalité :
- Inspection du Travail et des Lois Sociales d'Abidjan
- Collège des Délégués du Personnel
- Dossier individuel confidentiel du collaborateur

La Direction du Capital Humain
SII Côte d'Ivoire`;
    }

    setGeneratedDoc({ title, body, caseData: c });
    setActiveTab('generator');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* En-tête officiel SII */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001d52] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Contentieux & Conformité Légale
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Art. 16 CCNI & Code du Travail CI
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Registre Disciplinaire & Échelle des Sanctions
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Gestion rigoureuse des 4 degrés de sanctions statutaires, respect de la prescription légale (3 mois), garantie de convocation avec droit d'assistance syndicale et décompte d'amnistie automatique (12 mois).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('registry')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'registry'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Registre des Procédures
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'detail'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Fiche Individuelle
            </button>
            {generatedDoc && (
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'generator'
                    ? 'bg-[#008000] text-white shadow'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Document Actif
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Enregistré</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.total} dossiers</h3>
            <p className="text-xs text-gray-500 mt-1">Exercice civil 2025-2026</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions en cours</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.enCours} procédure(s)</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Prescription active (&lt; 90j)</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sanctions Exécutées</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.executees} cas</h3>
            <p className="text-xs text-gray-500 mt-1">Amnistie 12 mois en cours</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-700 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dossiers Amnistiés</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.amnistiees} réhabilités</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Effacement dossier conforme CCNI</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Guide légal ivoirien */}
      <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
        <Scale className="w-5 h-5 text-[#008000] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#008000] font-semibold">Échelle graduée des sanctions sous la CCNI ivoirienne (Article 16) : </strong>
          L'employeur ne peut prononcer d'autre sanction que : <code className="font-semibold text-gray-900">1. Avertissement écrit</code>, <code className="font-semibold text-gray-900">2. Blâme</code>, <code className="font-semibold text-gray-900">3. Mise à pied de 1 à 8 jours maximum sans salaire</code>, et <code className="font-semibold text-gray-900">4. Licenciement pour faute lourde</code>.
          <span className="block mt-1 text-gray-600">
            <strong>Règles impératives :</strong> Délai de prescription de <strong>3 mois (90 jours)</strong> pour sanctionner après constat des faits. Convocation préalable obligatoire avec <strong>droit de se faire assister par un Délégué du Personnel</strong>. Effacement légal (amnistie) de la sanction au dossier après <strong>12 mois d'assiduité exemplaire</strong>.
          </span>
        </div>
      </div>

      {/* Vue 1 : Registre des Procédures */}
      {activeTab === 'registry' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Barre de recherche et filtres */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par collaborateur, matricule, réf..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-500 font-medium">Statut procédure:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-medium text-gray-700 focus:outline-none"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="EN_COURS">En cours d'instruction</option>
                  <option value="EXECUTEE">Sanction exécutée</option>
                  <option value="AMNISTIEE">Amnistié / Effacé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Réf & Salarié</th>
                  <th className="py-3.5 px-4">Faute Constatée</th>
                  <th className="py-3.5 px-4">Sanction Retenue</th>
                  <th className="py-3.5 px-4">Délégué Assisant</th>
                  <th className="py-3.5 px-4 text-center">Délais Légaux</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCases.map((c) => {
                  return (
                    <tr 
                      key={c.id} 
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCase(c);
                        setActiveTab('detail');
                      }}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{c.matricule} • {c.id}</div>
                        <div className="text-[11px] text-gray-400">{c.poste}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1 ${
                          c.degreFaute === 'Faute Lourde'
                            ? 'bg-red-100 text-red-800'
                            : c.degreFaute === 'Faute Moyenne'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-[#002B7F]'
                        }`}>
                          {c.degreFaute}
                        </span>
                        <p className="text-xs text-gray-700 line-clamp-2">{c.natureFaute}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800 text-xs">{c.sanctionAppliquee}</span>
                        {c.dureeMiseAPied && (
                          <div className="text-[11px] text-red-600 font-medium">
                            {c.dureeMiseAPied} jours ouvrables
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span>{c.deleguePersonnelAssistance}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {c.prescriptionJoursRestants !== null ? (
                          <div className="inline-block px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                            Prescription : {c.prescriptionJoursRestants}j
                          </div>
                        ) : c.amnistieMoisRestants !== null ? (
                          c.amnistieMoisRestants === 0 ? (
                            <span className="text-xs text-[#008000] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Amnistie acquise
                            </span>
                          ) : (
                            <div className="text-xs text-gray-600 font-medium">
                              Amnistie dans {c.amnistieMoisRestants} mois
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          c.statutProcedure.includes('Amnistié')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.statutProcedure.includes('En cours')
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-[#002B7F] border border-blue-200'
                        }`}>
                          {c.statutProcedure}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCase(c);
                              setActiveTab('detail');
                            }}
                            className="p-1.5 text-gray-500 hover:text-[#002B7F] hover:bg-gray-100 rounded-lg"
                            title="Consulter le dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleGenerateDocument(c, c.statutProcedure.includes('En cours') ? 'CONVOCATION' : 'SANCTION_NOTIFICATION')}
                            className="p-1.5 text-gray-500 hover:text-[#008000] hover:bg-gray-100 rounded-lg"
                            title="Générer acte juridique"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
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

      {/* Vue 2 : Fiche Individuelle Détaillée */}
      {activeTab === 'detail' && selectedCase && (
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

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleGenerateDocument(selectedCase, 'CONVOCATION')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-[#002B7F]" />
                Convocation avec Délégué
              </button>
              <button
                onClick={() => handleGenerateDocument(selectedCase, 'SANCTION_NOTIFICATION')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-[#008000]" />
                Notification de Sanction
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne gauche : Synthèse des faits */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Description et Qualification des Faits
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Motif principal notifié :</p>
                  <p className="text-sm text-gray-800 font-medium">{selectedCase.natureFaute}</p>
                </div>
                <div className="text-xs text-gray-600 space-y-2">
                  <p><strong>Motivation détaillée : </strong> {selectedCase.lettreMotivation}</p>
                </div>
              </div>

              {/* Calendrier contradictoire */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#002B7F]" />
                  Chronologie de la Procédure Contradictoire
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#002B7F] mt-1.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">Connaissance des faits par l'employeur</p>
                      <p className="text-xs text-gray-500">{selectedCase.dateConstat} (Début du délai de prescription de 3 mois)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">Entretien préalable avec assistance</p>
                      <p className="text-xs text-gray-500">{selectedCase.dateEntretien} • Conseil : {selectedCase.deleguePersonnelAssistance}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#008000] mt-1.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">Prise d'effet de la décision</p>
                      <p className="text-xs text-gray-500">{selectedCase.dateEffet} ({selectedCase.sanctionAppliquee})</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400 mt-1.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">Date d'amnistie légale au dossier individuel</p>
                      <p className="text-xs text-gray-500">{selectedCase.dateAmnistiePrevue} (Effacement après 12 mois sans récidive)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite : Statut et garanties légales */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Sécurisation Juridique</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Prescription 3 mois :</span>
                    <span className="font-bold text-gray-900">
                      {selectedCase.prescriptionJoursRestants !== null ? `${selectedCase.prescriptionJoursRestants} jours restants` : 'Respecté'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Assistance Délégué :</span>
                    <span className="font-bold text-[#008000]">Conforme CCNI</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Transmission Inspection :</span>
                    <span className="font-bold text-gray-900">Effectuée</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Statut Amnistie :</span>
                    <span className={`font-bold ${selectedCase.amnistieMoisRestants === 0 ? 'text-[#008000]' : 'text-gray-700'}`}>
                      {selectedCase.amnistieMoisRestants === 0 ? 'Dossier purgé' : `${selectedCase.amnistieMoisRestants || '—'} mois`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Antécédents Disciplinaires</h4>
                {selectedCase.historiquePrecedent.length > 0 ? (
                  <ul className="text-xs text-gray-700 space-y-1.5 list-disc pl-4">
                    {selectedCase.historiquePrecedent.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#008000] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Aucun antécédent disciplinaire actif
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Modèle et Actes Juridiques Générés */}
      {activeTab === 'generator' && generatedDoc && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                {generatedDoc.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer l'Acte
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([generatedDoc.body], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Acte_Disciplinaire_${generatedDoc.caseData.matricule}.txt`;
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
            {generatedDoc.body}
          </div>
        </div>
      )}
    </div>
  );
}
