import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  GraduationCap, 
  Users, 
  Briefcase, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

// GRILLE GÉNÉRALE DE CLASSIFICATION CCNI CÔTE D'IVOIRE (11 Catégories) :
// - Catégories 1 à 5 : Ouvriers et Employés (Exécution)
// - Catégories 6 à 8 : Agents de Maîtrise & Techniciens
// - Catégories 9 à 11 : Cadres, Assimilés & Ingénieurs (Direction)
// Échelons statutaires : A, B, C, D (avancement selon ancienneté ou mérite)

const MOCK_CCNI_CATEGORIES = [
  { id: 'CAT-01', libelle: '1ère Catégorie', groupe: 'Ouvriers / Employés', salaireMinimumConventionnel: 75000, description: 'Travaux simples ne nécessitant aucune qualification' },
  { id: 'CAT-02', libelle: '2ème Catégorie', groupe: 'Ouvriers / Employés', salaireMinimumConventionnel: 85000, description: 'Manœuvre spécialisé, manutention légère' },
  { id: 'CAT-03', libelle: '3ème Catégorie', groupe: 'Ouvriers / Employés', salaireMinimumConventionnel: 110000, description: 'Employé d\'accueil, standardiste, agent d\'entretien' },
  { id: 'CAT-04', libelle: '4ème Catégorie', groupe: 'Ouvriers / Employés', salaireMinimumConventionnel: 145000, description: 'Guichetier caisse, agent SAV niveau 1 (BEPC/CAP)' },
  { id: 'CAT-05', libelle: '5ème Catégorie', groupe: 'Ouvriers / Employés', salaireMinimumConventionnel: 190000, description: 'Caissier confirmé, technicien câblage (BAC/BT)' },
  { id: 'CAT-06', libelle: '6ème Catégorie', groupe: 'Maîtrise & Techniciens', salaireMinimumConventionnel: 245000, description: 'Agent de maîtrise débutant, technicien réseau (BTS/DUT)' },
  { id: 'CAT-07', libelle: '7ème Catégorie', groupe: 'Maîtrise & Techniciens', salaireMinimumConventionnel: 310000, description: 'Chef de caisse, superviseur de boutique (Licence Pro)' },
  { id: 'CAT-08', libelle: '8ème Catégorie', groupe: 'Maîtrise & Techniciens', salaireMinimumConventionnel: 395000, description: 'Adjoint chef d\'agence, technicien expert fibre' },
  { id: 'CAT-09', libelle: '9ème Catégorie', groupe: 'Cadres & Ingénieurs', salaireMinimumConventionnel: 520000, description: 'Cadre débutant, ingénieur d\'études, auditeur (Master/Ingénieur)' },
  { id: 'CAT-10', libelle: '10ème Catégorie', groupe: 'Cadres & Ingénieurs', salaireMinimumConventionnel: 750000, description: 'Chef d\'agence senior, responsable de pôle opérationnel' },
  { id: 'CAT-11', libelle: '11ème Catégorie', groupe: 'Cadres & Ingénieurs', salaireMinimumConventionnel: 1150000, description: 'Directeur de département, membre du comité de direction' }
];

const MOCK_EMPLOYEES_AUDIT = [
  {
    id: 'EMP-0142',
    name: 'Kouassi Marc-Antoine',
    matricule: 'MTR-2022-0142',
    poste: 'Caissier Principal',
    agence: 'Agence Centrale Plateau',
    diplomeReel: 'Licence en Finance & Comptabilité (BAC+3)',
    ancienneteAnnees: 4.5,
    categorieActuelle: '4ème Catégorie',
    echelonActuel: 'A',
    salaireBaseActuel: 165000,
    // Diagnostic : Diplôme BAC+3 et 4 ans d'ancienneté correspondent à la 6e ou 7e catégorie
    statutAudit: 'SOUS_CLASSE', // 'CONFORME' | 'SOUS_CLASSE' | 'AVANCEMENT_ECHELON_DU'
    categorieRecommandee: '6ème Catégorie',
    echelonRecommande: 'B',
    salaireRecommande: 260000,
    gainMensuelSalarie: 95000,
    motifConformite: 'Non-prise en compte du diplôme de Licence validé lors du recrutement.'
  },
  {
    id: 'EMP-0089',
    name: 'Bamba Fatoumata',
    matricule: 'MTR-2021-0089',
    poste: 'Conseillère Clientèle Particuliers',
    agence: 'Agence Treichville Arras',
    diplomeReel: 'BTS Gestion Commerciale (BAC+2)',
    ancienneteAnnees: 5.2,
    categorieActuelle: '5ème Catégorie',
    echelonActuel: 'A',
    salaireBaseActuel: 210000,
    statutAudit: 'AVANCEMENT_ECHELON_DU',
    categorieRecommandee: '5ème Catégorie',
    echelonRecommande: 'C',
    salaireRecommande: 245000,
    gainMensuelSalarie: 35000,
    motifConformite: 'Ancienneté d\'échelon supérieure à 4 ans justifiant le passage à l\'échelon C.'
  },
  {
    id: 'EMP-0077',
    name: 'Coulibaly Brahima',
    matricule: 'MTR-2015-0077',
    poste: 'Superviseur Logistique Terrain',
    agence: 'Direction Régionale San Pedro',
    diplomeReel: 'Ingénieur des Techniques Logistiques (BAC+4)',
    ancienneteAnnees: 11.8,
    categorieActuelle: '8ème Catégorie',
    echelonActuel: 'C',
    salaireBaseActuel: 480000,
    statutAudit: 'CONFORME',
    categorieRecommandee: '8ème Catégorie',
    echelonRecommande: 'C',
    salaireRecommande: 480000,
    gainMensuelSalarie: 0,
    motifConformite: 'Classement rigoureusement conforme à la grille et aux responsabilités effectives.'
  },
  {
    id: 'EMP-0215',
    name: 'Yao N\'Guessan Sylvestre',
    matricule: 'MTR-2023-0215',
    poste: 'Gestionnaire de Flux & Dépôts',
    agence: 'Agence Cocody Deux-Plateaux',
    diplomeReel: 'DUT Télécoms & Réseaux',
    ancienneteAnnees: 3.2,
    categorieActuelle: '4ème Catégorie',
    echelonActuel: 'B',
    salaireBaseActuel: 160000,
    statutAudit: 'SOUS_CLASSE',
    categorieRecommandee: '6ème Catégorie',
    echelonRecommande: 'A',
    salaireRecommande: 245000,
    gainMensuelSalarie: 85000,
    motifConformite: 'Poste requérant des compétences de technicien niveau DUT sous-évalué en catégorie exécution.'
  }
];

export default function ClassificationCcniEchelons() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAudit, setSelectedAudit] = useState(MOCK_EMPLOYEES_AUDIT[0]);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'grid' | 'notification'

  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES_AUDIT.filter((emp) => {
      const matchSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.agence.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || emp.statutAudit === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  // Statistiques d'audit
  const stats = useMemo(() => {
    let sousClasses = 0;
    let avancementsDus = 0;
    let conformes = 0;
    let impactBudgetMois = 0;

    MOCK_EMPLOYEES_AUDIT.forEach((e) => {
      if (e.statutAudit === 'SOUS_CLASSE') {
        sousClasses++;
        impactBudgetMois += e.gainMensuelSalarie;
      } else if (e.statutAudit === 'AVANCEMENT_ECHELON_DU') {
        avancementsDus++;
        impactBudgetMois += e.gainMensuelSalarie;
      } else {
        conformes++;
      }
    });

    return { total: MOCK_EMPLOYEES_AUDIT.length, sousClasses, avancementsDus, conformes, impactBudgetMois };
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
                Rémunération & Statut Conventionnel
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Grille des 11 Catégories CCNI
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Classification des Postes CCNI & Audit des Échelons
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Audit automatique d'adéquation entre le poste, le diplôme réel et l'échelon de paie. Détection préventive des sous-classements et simulation d'avancement d'échelon.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Audit & Conformité Postes
            </button>
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'grid'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Grille CCNI Officielle
            </button>
            <button
              onClick={() => setActiveTab('notification')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'notification'
                  ? 'bg-[#008000] text-white shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Acte de Changement de Catégorie
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Effectif Audité</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.total} collaborateurs</h3>
            <p className="text-xs text-gray-500 mt-1">Échantillon réseau & siège</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Risque Sous-Classement</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.sousClasses} salarié(s)</h3>
            <p className="text-xs text-red-500 mt-1 font-medium">Diplôme &gt; Catégorie paie</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement Échelon Dû</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.avancementsDus} collaborateur(s)</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Ancienneté d'échelon atteinte</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Régularisation</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">+{stats.impactBudgetMois.toLocaleString('fr-FR')} F/m</h3>
            <p className="text-xs text-gray-500 mt-1">Mise à niveau masse salariale</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Rappel des règles conventionnelles */}
      <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#002B7F] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#002B7F] font-semibold">Règle de Classification de la CCNI de Côte d'Ivoire : </strong>
          Le classement d'un travailleur est déterminé par les fonctions réellement exercées et par les diplômes exigés pour le poste.
          <span className="block mt-1">
            <strong>Risque prud'homal :</strong> Un collaborateur titulaire d'un BTS/DUT ou d'une Licence employé sur des tâches techniques mais payé en catégorie d'exécution (Cat. 1 à 4) est fondé à réclamer un <strong>rappel différentiel de salaire sur les 3 dernières années</strong> (prescription triennale des salaires Art. 34.3).
          </span>
        </div>
      </div>

      {/* Vue 1 : Tableau d'Audit & Détection des Écarts */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Recherche & Filtres */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher collaborateur, poste, diplôme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-500 font-medium">Diagnostic :</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-medium text-gray-700 focus:outline-none"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="SOUS_CLASSE">Sous-classement avéré</option>
                  <option value="AVANCEMENT_ECHELON_DU">Avancement d'échelon dû</option>
                  <option value="CONFORME">Classement conforme</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Salarié / Poste</th>
                  <th className="py-3.5 px-4">Diplôme & Ancienneté</th>
                  <th className="py-3.5 px-4">Classement Paie Actuel</th>
                  <th className="py-3.5 px-4">Classement Recommandé</th>
                  <th className="py-3.5 px-4 text-center">Diagnostic CCNI</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedAudit(emp);
                      setActiveTab('notification');
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{emp.matricule} • {emp.poste}</div>
                      <div className="text-[11px] text-[#002B7F] font-medium">{emp.agence}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        {emp.diplomeReel}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Ancienneté entreprise : {emp.ancienneteAnnees} ans
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-gray-900 text-xs">
                        {emp.categorieActuelle} — Éch. {emp.echelonActuel}
                      </span>
                      <div className="text-[11px] text-gray-500">
                        Base : {emp.salaireBaseActuel.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#008000] text-xs">
                        {emp.categorieRecommandee} — Éch. {emp.echelonRecommande}
                      </span>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Cible : {emp.salaireRecommande.toLocaleString('fr-FR')} FCFA (+{emp.gainMensuelSalarie.toLocaleString('fr-FR')} F)
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.statutAudit === 'SOUS_CLASSE'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : emp.statutAudit === 'AVANCEMENT_ECHELON_DU'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {emp.statutAudit === 'SOUS_CLASSE' ? 'Sous-classé' : emp.statutAudit === 'AVANCEMENT_ECHELON_DU' ? 'Échelon dû' : 'Conforme'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedAudit(emp);
                          setActiveTab('notification');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
                      >
                        Générer Acte
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : Grille CCNI Complète */}
      {activeTab === 'grid' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#002B7F]" />
              Grille Officielle des 11 Catégories & Salaires Minima CCNI
            </h3>
            <span className="text-xs text-gray-500 font-medium">Barème conventionnel Côte d'Ivoire</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">Collège / Groupe</th>
                  <th className="py-3.5 px-4">Salaire Minimum Conventionnel</th>
                  <th className="py-3.5 px-4">Profils Types & Fonctions de Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {MOCK_CCNI_CATEGORIES.map((cat) => (
                  <tr key={cat.id} className="hover:bg-blue-50/30">
                    <td className="py-3.5 px-4 font-bold text-[#002B7F]">
                      {cat.libelle}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-700">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        cat.groupe.includes('Cadres')
                          ? 'bg-blue-100 text-[#002B7F]'
                          : cat.groupe.includes('Maîtrise')
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cat.groupe}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {cat.salaireMinimumConventionnel.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      {cat.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 3 : Notification de Changement de Catégorie & Reclassement */}
      {activeTab === 'notification' && selectedAudit && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                Avenant de Reclassement & Régularisation Conventionnelle (CCNI)
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
                  const content = document.getElementById('print-reclassification').innerText;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Avenant_Reclassement_${selectedAudit.matricule}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div id="print-reclassification" className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Direction du Capital Humain & des Relations Sociales
Boulevard de la République, Plateau, Abidjan — République de Côte d'Ivoire

DÉCISION INDIVIDUELLE DE RECLASSEMENT & PROMOTION STATUTAIRE
(Application de la Convention Collective Interprofessionnelle de Côte d'Ivoire)

Réf : DCH/CCNI/RECLASS/${selectedAudit.matricule}
Abidjan, le ${todayStr}

À l'attention de :
Monsieur / Madame : ${selectedAudit.name}
Matricule : ${selectedAudit.matricule}
Poste actuel : ${selectedAudit.poste}
Affectation : ${selectedAudit.agence}

Monsieur / Madame,

À la suite de l'audit de classification des postes et d'adéquation des compétences mené par la Direction du Capital Humain au regard de vos diplômes (${selectedAudit.diplomeReel}) et de vos responsabilités opérationnelles, nous avons le plaisir de vous notifier votre nouveau positionnement statutaire :

1. SITUATION ANTERIEURE :
- Catégorie conventionnelle : ${selectedAudit.categorieActuelle}
- Échelon : ${selectedAudit.echelonActuel}
- Salaire de base : ${selectedAudit.salaireBaseActuel.toLocaleString('fr-FR')} FCFA

2. NOUVELLE SITUATION (À compter du 1er du mois suivant) :
- Nouvelle catégorie conventionnelle : ${selectedAudit.categorieRecommandee}
- Nouvel échelon : ${selectedAudit.echelonRecommande}
- Nouveau salaire de base indiciaire : ${selectedAudit.salaireRecommande.toLocaleString('fr-FR')} FCFA
- Gain mensuel brut : + ${selectedAudit.gainMensuelSalarie.toLocaleString('fr-FR')} FCFA

MOTIVATION DE LA DECISION :
${selectedAudit.motifConformite}

La présente décision emporte avenant à votre contrat de travail initial, toutes les autres clauses demeurant inchangées.

Veuillez agréer, Monsieur / Madame, l'expression de nos salutations distinguées.


Pour la Direction Générale & DCH
SII Côte d'Ivoire

---
Accusé de réception manuscrit du salarié :
"Lu et approuvé le nouveau classement conventionnel, le ___/___/2026."
Signature du collaborateur :`}
          </div>
        </div>
      )}
    </div>
  );
}
