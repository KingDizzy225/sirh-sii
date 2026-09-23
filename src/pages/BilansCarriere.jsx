import React, { useState } from 'react';
import {
  Compass, Calendar, Clock, CheckCircle2, AlertTriangle,
  Award, GraduationCap, TrendingUp, Search, Filter, Plus,
  FileText, Printer, Download, Eye, X, User, ChevronRight,
  ShieldCheck, AlertCircle, Building, BookOpen
} from 'lucide-react';

export function BilansCarriere() {
  const [activeTab, setActiveTab] = useState('bilans'); // 'bilans', 'echeancier', 'statistiques'
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('TOUS'); // TOUS, BILAN_2_ANS, BILAN_6_ANS
  const [statusFilter, setStatusFilter] = useState('TOUS'); // TOUS, A_JOUR, A_PROGRAMMER, RETARD
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBilanForDetail, setSelectedBilanForDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Données des bilans de carrière obligatoires
  const [bilans, setBilans] = useState([
    {
      id: "BC-2026-001",
      employeId: "EMP-0018",
      employeNom: "Julie Konan",
      poste: "Chargée de Clientèle Entreprises Senior",
      departement: "Banque d'Affaires & PME",
      agence: "Siège Plateau (Tour Postel 2001)",
      dateEmbauche: "15/01/2021",
      ancienneteAnnees: 5.7,
      typeBilan: "BILAN_6_ANS", // BILAN_2_ANS, BILAN_6_ANS
      echeanceLegale: "15/01/2027",
      dateDernierEntretien: "14/09/2026",
      statut: "A_JOUR", // A_JOUR, A_PROGRAMMER, RETARD
      managerReferent: "Jean-Marc Koffi (Directeur d'Agence)",
      criteresObligatoires: {
        formationsSuivies: 3, // Nombre de formations suivies
        progressionSalariale: true, // Progression salariale ou de catégorie CCNI
        progressionProfessionnelle: true, // Responsabilités accrues
        certificationOuVAE: true // Certification professionnelle acquise
      },
      projetsAvenir: "Évolution vers un rôle de Directrice Adjointe d'Agence ou Gestionnaire Grands Comptes.",
      formationsSouhaitees: "Certification Internationale en Analyse de Risque Crédit (FDFP)",
      syntheseRH: "Parcours exemplaire. Tous les critères légaux des 6 ans sont validés avec succès (3 formations, promotion, certification).",
      conforme6Ans: true
    },
    {
      id: "BC-2026-002",
      employeId: "EMP-0025",
      employeNom: "Armand Kouassi",
      poste: "Comptable Fournisseurs",
      departement: "Finance & Comptabilité",
      agence: "Siège Plateau (Tour Postel 2001)",
      dateEmbauche: "01/10/2024",
      ancienneteAnnees: 2.0,
      typeBilan: "BILAN_2_ANS",
      echeanceLegale: "01/10/2026",
      dateDernierEntretien: null,
      statut: "A_PROGRAMMER",
      managerReferent: "Directeur Administratif & Financier",
      criteresObligatoires: {
        formationsSuivies: 1,
        progressionSalariale: false,
        progressionProfessionnelle: false,
        certificationOuVAE: false
      },
      projetsAvenir: "Montée en compétences sur le progiciel ERP Sage et la clôture bilancielle.",
      formationsSouhaitees: "Perfectionnement Fiscalité Ivoirienne (TVA, ITS, CNPS)",
      syntheseRH: "Entretien obligatoire des 2 ans à planifier impérativement avant le 01/10/2026.",
      conforme6Ans: false
    },
    {
      id: "BC-2026-003",
      employeId: "EMP-0012",
      employeNom: "Jean-Marc Koffi",
      poste: "Directeur d'Agence Principale",
      departement: "Direction Commerciale",
      agence: "Siège Plateau (Tour Postel 2001)",
      dateEmbauche: "01/03/2017",
      ancienneteAnnees: 9.5,
      typeBilan: "BILAN_6_ANS",
      echeanceLegale: "01/03/2029 (Cycle 2)",
      dateDernierEntretien: "20/02/2023",
      statut: "A_JOUR",
      managerReferent: "Directeur Général SII CI",
      criteresObligatoires: {
        formationsSuivies: 4,
        progressionSalariale: true,
        progressionProfessionnelle: true,
        certificationOuVAE: true
      },
      projetsAvenir: "Pilotage de l'ouverture du hub régional San-Pédro et mentorat des jeunes cadres.",
      formationsSouhaitees: "Executive Management & Stratégie Financière HEC Paris / MDE Abidjan",
      syntheseRH: "Cycle précédent 100% validé. Prochaine étape : préparation de la succession managériale.",
      conforme6Ans: true
    },
    {
      id: "BC-2026-004",
      employeId: "EMP-0064",
      employeNom: "Kouamé Eric",
      poste: "Technicien Réseaux Datacenter",
      departement: "Infrastructure & Systèmes",
      agence: "Hub Zone 4 Marcory",
      dateEmbauche: "12/04/2024",
      ancienneteAnnees: 2.4,
      typeBilan: "BILAN_2_ANS",
      echeanceLegale: "12/04/2026",
      dateDernierEntretien: null,
      statut: "RETARD",
      managerReferent: "Moussa Soro (Responsable IT)",
      criteresObligatoires: {
        formationsSuivies: 0,
        progressionSalariale: false,
        progressionProfessionnelle: false,
        certificationOuVAE: false
      },
      projetsAvenir: "Intégrer les astreintes de niveau 2 et passer la certification Cisco CCNA.",
      formationsSouhaitees: "Habilitation Réseaux Fibre Optique & Haute Tension",
      syntheseRH: "Échéance dépassée de 5 mois. Entretien à régulariser en urgence absolue pour conformité légale.",
      conforme6Ans: false
    }
  ]);

  // Formulaire de conduite / programmation
  const [newBilan, setNewBilan] = useState({
    employeNom: '',
    employeId: '',
    poste: '',
    departement: 'Infrastructure & Systèmes',
    agence: 'Siège Plateau (Tour Postel 2001)',
    typeBilan: 'BILAN_2_ANS',
    dateEntretien: '23/09/2026',
    managerReferent: 'Dr. Stéphane Touré (DRH)',
    projetsAvenir: '',
    formationsSouhaitees: '',
    formationsSuiviesNb: 1,
    progressionSalariale: false,
    progressionProfessionnelle: false,
    certificationOuVAE: false,
    syntheseRH: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPIs
  const totalBilans = bilans.length;
  const bilansAJour = bilans.filter(b => b.statut === 'A_JOUR').length;
  const bilansAPlanifier = bilans.filter(b => b.statut === 'A_PROGRAMMER').length;
  const bilansEnRetard = bilans.filter(b => b.statut === 'RETARD').length;
  const tauxConformite = Math.round((bilansAJour / totalBilans) * 100);

  // Filtrage
  const filteredBilans = bilans.filter(b => {
    const matchesSearch = 
      b.employeNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.projetsAvenir.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'TOUS' || b.typeBilan === typeFilter;
    const matchesStatus = statusFilter === 'TOUS' || b.statut === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Ajouter un Bilan
  const handleSaveBilan = (e) => {
    e.preventDefault();
    if (!newBilan.employeNom || !newBilan.poste) {
      alert("Veuillez renseigner le nom et le poste de l'employé.");
      return;
    }

    const created = {
      id: `BC-2026-00${bilans.length + 1}`,
      employeId: newBilan.employeId || `EMP-00${Math.floor(100 + Math.random() * 50)}`,
      employeNom: newBilan.employeNom,
      poste: newBilan.poste,
      departement: newBilan.departement,
      agence: newBilan.agence,
      dateEmbauche: '01/01/2024',
      ancienneteAnnees: 2.0,
      typeBilan: newBilan.typeBilan,
      echeanceLegale: '31/12/2026',
      dateDernierEntretien: newBilan.dateEntretien,
      statut: 'A_JOUR',
      managerReferent: newBilan.managerReferent,
      criteresObligatoires: {
        formationsSuivies: parseInt(newBilan.formationsSuiviesNb) || 0,
        progressionSalariale: newBilan.progressionSalariale,
        progressionProfessionnelle: newBilan.progressionProfessionnelle,
        certificationOuVAE: newBilan.certificationOuVAE
      },
      projetsAvenir: newBilan.projetsAvenir || 'Évolution professionnelle continue.',
      formationsSouhaitees: newBilan.formationsSouhaitees || 'Plan de développement des compétences FDFP.',
      syntheseRH: newBilan.syntheseRH || 'Entretien professionnel mené et validé conjointement.',
      conforme6Ans: newBilan.typeBilan === 'BILAN_6_ANS'
    };

    setBilans([created, ...bilans]);
    setShowAddModal(false);
    showToast(`Bilan professionnel de ${created.employeNom} enregistré et validé.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast Alert */}
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
            <div className="p-2.5 bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Bilans de Carrière & Entretiens Professionnels Obligatoires
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800">
                  Légal 2 & 6 Ans
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Accompagnement de carrière à 2 ans et récapitulatif légal à 6 ans (formations, certifications, progressions CCNI)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Formaliser un Bilan de Carrière</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Taux de Conformité */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Conformité des Échéances
            </span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{tauxConformite}%</span>
            <span className="text-xs text-slate-400 ml-2">dossiers en règle</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {bilansAJour} bilans tenus et validés
          </div>
        </div>

        {/* KPI 2 : À Programmer sous 60 jours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              À Planifier (Sous 60 jours)
            </span>
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{bilansAPlanifier}</span>
            <span className="text-xs text-slate-400 ml-2">salarié(s)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Entretiens des 2 ans arrivant à terme
          </div>
        </div>

        {/* KPI 3 : Retards Critiques */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Échéances Dépassées
            </span>
            <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{bilansEnRetard}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold ml-2">action requise</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Risque d'abondement correctif ou contentieux
          </div>
        </div>

        {/* KPI 4 : Bilans 6 Ans Réalisés */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              États des Lieux 6 Ans
            </span>
            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</span>
            <span className="text-xs text-slate-400 ml-2">validés avec succès</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Formations + progressions CCNI certifiées
          </div>
        </div>

      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par collaborateur, poste, souhait de formation..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('TOUS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'TOUS' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tous types
            </button>
            <button
              onClick={() => setTypeFilter('BILAN_2_ANS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'BILAN_2_ANS' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Entretien 2 Ans
            </button>
            <button
              onClick={() => setTypeFilter('BILAN_6_ANS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'BILAN_6_ANS' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Bilan 6 Ans (Légal)
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border-none font-medium"
          >
            <option value="TOUS">Tous statuts</option>
            <option value="A_JOUR">À jour</option>
            <option value="A_PROGRAMMER">À planifier</option>
            <option value="RETARD">En retard</option>
          </select>
        </div>
      </div>

      {/* Tableau des Bilans */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Salarié & Embauche</th>
                <th className="py-3.5 px-4">Type de Bilan</th>
                <th className="py-3.5 px-4">Échéance Légale</th>
                <th className="py-3.5 px-4">Critères 6 Ans Validés</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredBilans.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  
                  {/* Salarié */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {b.employeNom}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {b.poste} • Ancienneté : {b.ancienneteAnnees} ans
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Embauché(e) le {b.dateEmbauche}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      b.typeBilan === 'BILAN_6_ANS'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}>
                      {b.typeBilan === 'BILAN_6_ANS' ? 'Bilan Récapitulatif 6 Ans' : 'Entretien Professionnel 2 Ans'}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Manager : {b.managerReferent.split(' (')[0]}
                    </div>
                  </td>

                  {/* Échéance */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {b.echeanceLegale}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {b.dateDernierEntretien ? `Tenu le ${b.dateDernierEntretien}` : 'Non encore réalisé'}
                    </div>
                  </td>

                  {/* Critères légaux */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${b.criteresObligatoires.formationsSuivies > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span>{b.criteresObligatoires.formationsSuivies} formation(s) suivie(s)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${b.criteresObligatoires.progressionSalariale ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span>Progression salariale / conventionnelle : {b.criteresObligatoires.progressionSalariale ? 'Oui' : 'Non'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${b.criteresObligatoires.certificationOuVAE ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span>Certification / VAE : {b.criteresObligatoires.certificationOuVAE ? 'Oui' : 'Non'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="py-3.5 px-4">
                    {b.statut === 'A_JOUR' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        À jour
                      </span>
                    )}
                    {b.statut === 'A_PROGRAMMER' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        À planifier
                      </span>
                    )}
                    {b.statut === 'RETARD' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        En retard
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedBilanForDetail(b)}
                        title="Consulter le dossier d'entretien complet"
                        className="p-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedBilanForDetail(b);
                          setTimeout(() => window.print(), 200);
                        }}
                        title="Imprimer l'attestation légale d'entretien de carrière"
                        className="p-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE 1 : Saisie / Formalisation Bilan */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Formalisation de l'Entretien Professionnel Obligatoire
                  </h3>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    Bilan légal des perspectives d'évolution & formations
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBilan} className="p-5 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom du Collaborateur *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kouamé N'Dri"
                    value={newBilan.employeNom}
                    onChange={(e) => setNewBilan({ ...newBilan, employeNom: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Poste Occupé *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ingénieur Système"
                    value={newBilan.poste}
                    onChange={(e) => setNewBilan({ ...newBilan, poste: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type d'Entretien Légal
                  </label>
                  <select
                    value={newBilan.typeBilan}
                    onChange={(e) => setNewBilan({ ...newBilan, typeBilan: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="BILAN_2_ANS">Entretien Professionnel des 2 Ans</option>
                    <option value="BILAN_6_ANS">État des Lieux Récapitulatif des 6 Ans</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date de Tenue de l'Entretien
                  </label>
                  <input
                    type="text"
                    value={newBilan.dateEntretien}
                    onChange={(e) => setNewBilan({ ...newBilan, dateEntretien: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Critères légaux obligatoires */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Éléments de Parcours Constatés (Obligations Légales) :
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBilan.progressionSalariale}
                      onChange={(e) => setNewBilan({ ...newBilan, progressionSalariale: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Progression salariale ou CCNI</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBilan.progressionProfessionnelle}
                      onChange={(e) => setNewBilan({ ...newBilan, progressionProfessionnelle: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Progression professionnelle (responsabilités)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBilan.certificationOuVAE}
                      onChange={(e) => setNewBilan({ ...newBilan, certificationOuVAE: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Obtention d'une certification / VAE</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Nb Formations :</span>
                    <input
                      type="number"
                      min="0"
                      value={newBilan.formationsSuiviesNb}
                      onChange={(e) => setNewBilan({ ...newBilan, formationsSuiviesNb: e.target.value })}
                      className="w-16 px-2 py-1 text-xs bg-white dark:bg-slate-900 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Projet Professionnel & Souhaits d'Évolution du Salarié
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Évolution vers le management d'équipe, mobilité géographique, spécialisation cloud..."
                  value={newBilan.projetsAvenir}
                  onChange={(e) => setNewBilan({ ...newBilan, projetsAvenir: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Formations & Montée en Compétences Souhaitées
                </label>
                <input
                  type="text"
                  placeholder="Ex: Certification ITIL, Leadership & Négociation commerciale..."
                  value={newBilan.formationsSouhaitees}
                  onChange={(e) => setNewBilan({ ...newBilan, formationsSouhaitees: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer le Bilan Légal</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODALE 2 : Vue détaillée & Compte-rendu imprimable */}
      {selectedBilanForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Compte-Rendu du Bilan Professionnel : {selectedBilanForDetail.employeNom}
                </h3>
              </div>
              <button onClick={() => setSelectedBilanForDetail(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400">Poste :</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedBilanForDetail.poste}</div>
                </div>
                <div>
                  <span className="text-slate-400">Date d'embauche :</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedBilanForDetail.dateEmbauche}</div>
                </div>
                <div>
                  <span className="text-slate-400">Nature du bilan :</span>
                  <div className="font-bold text-indigo-600">{selectedBilanForDetail.typeBilan === 'BILAN_6_ANS' ? 'Bilan 6 Ans Légal' : 'Entretien 2 Ans'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Manager Référent :</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedBilanForDetail.managerReferent}</div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-1">
                <span className="font-bold text-indigo-800 dark:text-indigo-300">Projet Professionnel Exprimé :</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedBilanForDetail.projetsAvenir}</p>
                <div className="pt-2 text-indigo-700 dark:text-indigo-400">
                  <strong>Formations souhaitées :</strong> {selectedBilanForDetail.formationsSouhaitees}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Avis & Conclusion des Ressources Humaines :</span>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                  {selectedBilanForDetail.syntheseRH}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <div>
                  <div className="font-semibold text-slate-500">Pour le Salarié :</div>
                  <div className="mt-6 text-slate-400 italic">Signature & mention "Lu et approuvé"</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-500">Pour la Direction RH :</div>
                  <div className="mt-6 font-mono text-[10px] text-indigo-700 font-bold border border-dashed border-indigo-600 p-1 inline-block">
                    VISA RH CERTIFIÉ
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setSelectedBilanForDetail(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Fermer
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Compte-Rendu Légal</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default BilansCarriere;
