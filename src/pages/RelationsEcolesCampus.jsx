import React, { useState } from 'react';
import {
  GraduationCap, Building, Calendar, Users, Award,
  Sparkles, Plus, Search, Filter, CheckCircle2, Clock,
  ExternalLink, FileText, ChevronRight, Star, ArrowRight,
  Download, Printer, X, Eye, Phone, Mail, MapPin, Briefcase
} from 'lucide-react';

export function RelationsEcolesCampus() {
  const [activeTab, setActiveTab] = useState('ecoles'); // 'ecoles', 'forums', 'stagiaires_pfe'
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('TOUS'); // TOUS, INGENIEUR, UNIVERSITE, COMMERCE
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedSchoolForDetail, setSelectedSchoolForDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Données réalistes des Grandes Écoles et Universités de Côte d'Ivoire
  const [ecoles, setEcoles] = useState([]);

  // Forums & Salons de recrutement étudiants
  const [forums, setForums] = useState([]);

  // Vivier des stagiaires PFE (Projets de Fin d'Études) & Conversion CDI
  const [stagiairesPfe, setStagiairesPfe] = useState([]);

  // Formulaire d'ajout école
  const [newSchool, setNewSchool] = useState({
    nom: '',
    sigle: '',
    type: 'INGENIEUR',
    ville: 'Abidjan',
    filieres: '',
    contactNom: '',
    contactEmail: '',
    contactTel: '',
    ambassadeurSII: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPIs
  const totalEcoles = ecoles.length;
  const totalAlumni = ecoles.reduce((acc, e) => acc + e.alumniChezSII, 0);
  const totalPfe = stagiairesPfe.length;
  const cdiSignesOuEmis = stagiairesPfe.filter(s => s.statutConversion === 'CDI_SIGNE' || s.statutConversion === 'PROPOSITION_CDI_EMISE').length;
  const tauxConversion = Math.round((cdiSignesOuEmis / totalPfe) * 100);

  // Filtrage des écoles
  const filteredEcoles = ecoles.filter(ecole => {
    const matchesSearch = 
      ecole.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecole.sigle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecole.ville.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'TOUS' || ecole.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleCreateSchool = (e) => {
    e.preventDefault();
    if (!newSchool.nom || !newSchool.sigle) {
      alert("Veuillez renseigner le nom et le sigle de l'école.");
      return;
    }

    const created = {
      id: `SCH-00${ecoles.length + 1}`,
      nom: newSchool.nom,
      sigle: newSchool.sigle,
      type: newSchool.type,
      ville: newSchool.ville,
      conventione: true,
      dateSignatureConvention: "23/09/2026",
      dateRenouvellement: "23/09/2029",
      filieresCibles: newSchool.filieres ? newSchool.filieres.split(',').map(s => s.trim()) : ["Informatique", "Génie Logiciel"],
      contactNom: newSchool.contactNom || "Direction des Relations Entreprises",
      contactEmail: newSchool.contactEmail || "contact@ecole.ci",
      contactTel: newSchool.contactTel || "+225 07 00 00 00 00",
      alumniChezSII: 1,
      stagiairesAccueillis: 1,
      statutConvention: "ACTIF",
      ambassadeurSII: newSchool.ambassadeurSII || "Collaborateur SII Alumnus"
    };

    setEcoles([created, ...ecoles]);
    setShowAddSchoolModal(false);
    showToast(`Partenariat conventionné avec ${created.sigle} enregistré avec succès.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Relations Écoles, Universités & Campus Management
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                  Talent Acquisition
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Conventions d'écoles d'élite, salons étudiants, vivier de stagiaires PFE et taux de conversion en CDI
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddSchoolModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Conventionner une École</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Écoles conventionnées */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Partenariats Écoles & Facs
            </span>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalEcoles}</span>
            <span className="text-xs text-slate-400 ml-2">grandes écoles partenaires</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Conventions actives (INP-HB, ESATIC, UFHB, MDE)
          </div>
        </div>

        {/* KPI 2 : Taux de conversion PFE -> CDI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Conversion Stagiaires ➔ CDI
            </span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{tauxConversion}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold ml-2">Embauchés en CDI</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {cdiSignesOuEmis} stagiaires PFE titularisés sur {totalPfe}
          </div>
        </div>

        {/* KPI 3 : Alumni chez SII */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Réseau Alumni en Poste
            </span>
            <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalAlumni}</span>
            <span className="text-xs text-slate-400 ml-2">ingénieurs & cadres</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Diplômés de nos écoles partenaires chez SII CI
          </div>
        </div>

        {/* KPI 4 : Forums & Salons */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Forums Carrières Planifiés
            </span>
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{forums.length}</span>
            <span className="text-xs text-slate-400 ml-2">événements campus</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Job fairs et conférences métiers sponsorisées
          </div>
        </div>

      </div>

      {/* Onglets Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('ecoles')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ecoles'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Écoles & Conventions Partenaires ({ecoles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('forums')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'forums'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Salons Étudiants & Job Fairs ({forums.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stagiaires_pfe')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'stagiaires_pfe'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Vivier Stagiaires PFE & Embauche CDI ({stagiairesPfe.length})</span>
        </button>
      </div>

      {/* ONGLET 1 : ÉCOLES & CONVENTIONS */}
      {activeTab === 'ecoles' && (
        <div className="space-y-4">
          
          {/* Recherche & Filtres */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une école, un sigle, une ville..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border-none font-medium"
              >
                <option value="TOUS">Toutes filières</option>
                <option value="INGENIEUR">Écoles d'Ingénieurs & IT</option>
                <option value="UNIVERSITE">Universités Publiques</option>
                <option value="COMMERCE">Business Schools & Management</option>
              </select>
            </div>
          </div>

          {/* Grille des Écoles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEcoles.map((ecole) => (
              <div
                key={ecole.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {ecole.sigle}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                        {ecole.nom}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{ecole.ville}</span>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Convention Actif
                    </span>
                  </div>

                  {/* Filières */}
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Filières clés ciblées :</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {ecole.filieresCibles.map((f, i) => (
                        <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chiffres clés */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400">Alumni chez SII :</span>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{ecole.alumniChezSII} collaborateurs</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Stagiaires accueillis :</span>
                      <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">{ecole.stagiairesAccueillis} cette année</div>
                    </div>
                  </div>
                </div>

                {/* Ambassadeur & Contact */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Ambassadeur Entreprise :</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ecole.ambassadeurSII}</span>
                  </div>

                  <button
                    onClick={() => setSelectedSchoolForDetail(ecole)}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <span>Détails convention</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ONGLET 2 : FORUMS & SALONS ÉTUDIANTS */}
      {activeTab === 'forums' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forums.map((forum) => (
              <div
                key={forum.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {forum.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      forum.statut === 'CONFIRME'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {forum.statut === 'CONFIRME' ? 'Stand Confirmé' : 'Événement Clôturé'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {forum.nom}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{forum.date}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Lieu : {forum.lieu}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-400">Format :</span>
                      <div className="font-medium text-slate-800 dark:text-slate-200">{forum.format}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Budget alloué :</span>
                      <div className="font-bold text-slate-900 dark:text-white">{forum.budgetEngage}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Objectif de recrutement :</span>
                      <div className="font-semibold text-emerald-600">{forum.cvsObjectif} CVs ciblés</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px] block">Délégation SII présente :</span>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {forum.ambassadeursMobilises.join(', ')}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONGLET 3 : VIVIER STAGIAIRES PFE & CONVERSION CDI */}
      {activeTab === 'stagiaires_pfe' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Suivi des Projets de Fin d'Études (PFE) & Embauches Directes
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300">
                Taux de conversion : {tauxConversion}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Stagiaire PFE & École</th>
                    <th className="py-3.5 px-4">Sujet de Stage & Tuteur</th>
                    <th className="py-3.5 px-4">Période</th>
                    <th className="py-3.5 px-4">Évaluation Tuteur</th>
                    <th className="py-3.5 px-4">Statut Embauche CDI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {stagiairesPfe.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {s.nom}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {s.ecole}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {s.filiere}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {s.sujetPfe}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Tuteur SII : <strong>{s.tuteurSII}</strong>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {s.periode}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-bold text-amber-500 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{s.noteEvaluation} / 5</span>
                        </div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          "{s.avisTuteur}"
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {s.statutConversion === 'CDI_SIGNE' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            CDI Signé
                          </span>
                        )}
                        {s.statutConversion === 'PROPOSITION_CDI_EMISE' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
                            <Clock className="w-3.5 h-3.5" />
                            Offre CDI Émise
                          </span>
                        )}
                        {s.statutConversion === 'EN_STAGE' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            Stage en cours
                          </span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALE 1 : Conventionner une École */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-blue-50 dark:bg-blue-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Conventionner une Grande École / Université
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Cadre de partenariat pour stages, forums et recrutement prioritaire
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddSchoolModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom Complet de l'Établissement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: École Supérieure d'Ingénieurs en Génie Électrique"
                  value={newSchool.nom}
                  onChange={(e) => setNewSchool({ ...newSchool, nom: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sigle Référent *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ESIGELEC"
                    value={newSchool.sigle}
                    onChange={(e) => setNewSchool({ ...newSchool, sigle: e.target.value })}
                    className="w-full px-3 py-2 text-sm uppercase font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type d'Établissement
                  </label>
                  <select
                    value={newSchool.type}
                    onChange={(e) => setNewSchool({ ...newSchool, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="INGENIEUR">École d'Ingénieurs & IT</option>
                    <option value="UNIVERSITE">Université Publique</option>
                    <option value="COMMERCE">Business School / Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ville / Campus
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Abidjan, Yamoussoukro..."
                    value={newSchool.ville}
                    onChange={(e) => setNewSchool({ ...newSchool, ville: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ambassadeur Entreprise (Alumnus SII)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Jean-Marc Koffi"
                    value={newSchool.ambassadeurSII}
                    onChange={(e) => setNewSchool({ ...newSchool, ambassadeurSII: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Filières Spécialisées Ciblées (séparées par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cloud Computing, DevOps, Cybersécurité..."
                  value={newSchool.filieres}
                  onChange={(e) => setNewSchool({ ...newSchool, filieres: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Responsable Relations Entreprises
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dr. Tanoh"
                    value={newSchool.contactNom}
                    onChange={(e) => setNewSchool({ ...newSchool, contactNom: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email de Contact
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: stage@inphb.ci"
                    value={newSchool.contactEmail}
                    onChange={(e) => setNewSchool({ ...newSchool, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer la Convention</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODALE 2 : Vue détaillée convention */}
      {selectedSchoolForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Convention Cadre : {selectedSchoolForDetail.sigle}
                </h3>
              </div>
              <button onClick={() => setSelectedSchoolForDetail(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {selectedSchoolForDetail.sigle} • {selectedSchoolForDetail.ville}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedSchoolForDetail.nom}
                </h3>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Validité Convention :</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">Jusqu'au {selectedSchoolForDetail.dateRenouvellement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Ambassadeur Entreprise :</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSchoolForDetail.ambassadeurSII}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Contact Référent :</span>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white">{selectedSchoolForDetail.contactNom}</div>
                  <div className="text-slate-500">{selectedSchoolForDetail.contactEmail} • {selectedSchoolForDetail.contactTel}</div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Filières conventionnées :</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSchoolForDetail.filieresCibles.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  onClick={() => setSelectedSchoolForDetail(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Fermer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default RelationsEcolesCampus;
