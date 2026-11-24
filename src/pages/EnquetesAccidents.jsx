import React, { useState } from 'react';
import {
  ShieldAlert, AlertTriangle, FileText, CheckCircle2, Clock,
  Calendar, Building, User, Download, Printer, Plus,
  Search, Filter, X, ChevronRight, ArrowRight, Eye,
  Activity, HelpCircle, FileCheck, Stethoscope, AlertOctagon
} from 'lucide-react';

export function EnquetesAccidents() {
  const [activeTab, setActiveTab] = useState('dossiers'); // 'dossiers', 'arbre_causes', 'kpis', 'capa'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('TOUS'); // TOUS, TRAVAIL, TRAJET, MALADIE
  const [filterCnpsStatus, setFilterCnpsStatus] = useState('TOUS');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedIncidentForDetail, setSelectedIncidentForDetail] = useState(null);
  const [selectedIncidentForArbre, setSelectedIncidentForArbre] = useState(null);
  const [selectedIncidentForPrint, setSelectedIncidentForPrint] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Données réalistes d'accidents et déclarations CNPS
  const [incidents, setIncidents] = useState([]);

  // Actions Correctives (CAPA)
  const [actionsCorrectives, setActionsCorrectives] = useState([
    {
      id: "CAPA-01",
      accidentRef: "AT-2026-004",
      action: "Installation de bandes podotactiles anti-dérapantes sur les nez de marche des escaliers de secours du siège.",
      responsable: "Services Généraux (M. Sanogo)",
      echeance: "05/10/2026",
      statut: "EN_COURS", // EN_COURS, REALISE, CLOTURE
      priorite: "HAUTE"
    },
    {
      id: "CAPA-02",
      accidentRef: "AT-2026-004",
      action: "Obligation stricte de pose de chevalets 'Sol Humide' pour tout nettoyage de sol durant les horaires de bureau.",
      responsable: "Société Prestataire Propreté",
      echeance: "25/09/2026",
      statut: "REALISE",
      priorite: "CRITIQUE"
    },
    {
      id: "CAPA-03",
      accidentRef: "AT-2026-003",
      action: "Session de sensibilisation à l'éco-conduite et au risque routier urbain sous la pluie pour tous les conducteurs d'entreprise.",
      responsable: "Responsable HSE & CSST",
      echeance: "15/10/2026",
      statut: "EN_COURS",
      priorite: "MOYENNE"
    },
    {
      id: "CAPA-04",
      accidentRef: "AT-2026-002",
      action: "Remplacement systématique de toutes les béquilles de capot de la flotte et fourniture d'une paire de gants cuir par véhicule.",
      responsable: "Gestionnaire Flotte Mobile",
      echeance: "10/09/2026",
      statut: "CLOTURE",
      priorite: "HAUTE"
    }
  ]);

  // Nouveau formulaire de déclaration
  const [newAccident, setNewAccident] = useState({
    employeNom: '',
    employeId: '',
    poste: '',
    departement: 'Infrastructure & Systèmes',
    agence: 'Siège Plateau (Tour Postel 2001)',
    typeAccident: 'TRAVAIL',
    dateAccident: '23/09/2026',
    heureAccident: '10:30',
    circonstances: '',
    siegeLesion: '',
    natureLesion: '',
    joursArretPrescrits: 3,
    temoin: '',
    medecinConstat: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtrage des dossiers
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      inc.employeNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.numeroCnps.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.circonstances.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'TOUS' || inc.typeAccident === filterType;
    const matchesStatus = filterCnpsStatus === 'TOUS' || inc.statutCnps === filterCnpsStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // KPI calculs
  const totalAccidentsAnnee = incidents.length;
  const accidentsAvecArret = incidents.filter(i => i.joursArretPrescrits > 0).length;
  const totalJoursPerdus = incidents.reduce((acc, i) => acc + i.joursArretPrescrits, 0);
  // TF = (accidentsAvecArret * 1,000,000) / Heures travaillées (estimées à 450,000 heures)
  const tauxFrequence = ((accidentsAvecArret * 1000000) / 450000).toFixed(2);
  // TG = (totalJoursPerdus * 1,000) / Heures travaillées
  const tauxGravite = ((totalJoursPerdus * 1000) / 450000).toFixed(3);
  const joursSansAccident = 1; // Dernier accident le 22/09

  // Enregistrer nouvelle déclaration
  const handleCreateDeclaration = (e) => {
    e.preventDefault();
    if (!newAccident.employeNom || !newAccident.circonstances || !newAccident.natureLesion) {
      alert("Veuillez renseigner le nom, les circonstances et la nature de la lésion.");
      return;
    }

    const nouveauDossier = {
      id: `AT-2026-00${incidents.length + 1}`,
      numeroCnps: `CNPS-DECL-2026-${Math.floor(900 + Math.random() * 90)}`,
      employeId: newAccident.employeId || 'EMP-0105',
      employeNom: newAccident.employeNom,
      poste: newAccident.poste || 'Collaborateur SII',
      departement: newAccident.departement,
      agence: newAccident.agence,
      dateAccident: newAccident.dateAccident,
      heureAccident: newAccident.heureAccident,
      typeAccident: newAccident.typeAccident,
      circonstances: newAccident.circonstances,
      siegeLesion: newAccident.siegeLesion || 'Non précisé',
      natureLesion: newAccident.natureLesion,
      joursArretPrescrits: parseInt(newAccident.joursArretPrescrits) || 0,
      temoin: newAccident.temoin || 'Aucun témoin direct',
      delaiCnpsHeuresRestantes: 48,
      statutCnps: 'EN_ATTENTE_DEPOT',
      dateDepotCnps: null,
      medecinConstat: newAccident.medecinConstat || 'Médecin agréé CNPS',
      arbreCauses: {
        faitUltime: `${newAccident.natureLesion} (${newAccident.joursArretPrescrits} jours d'arrêt)`,
        faitsDirects: [newAccident.circonstances],
        conditionsPrealables: ["Analyse préliminaire en cours par le CSST"],
        causesProfondes: ["Enquête programmée sous 7 jours légaux"],
        cinqPourquoi: [
          { p: "Fait initial : Que s'est-il passé ?", r: newAccident.circonstances },
          { p: "Quelles sont les blessures constatées ?", r: newAccident.natureLesion },
          { p: "Quelle est la cause immédiate ?", r: "Action mécanique ou de déplacement" },
          { p: "Existe-t-il une consigne de sécurité ?", r: "Vérification en cours auprès de la hiérarchie" },
          { p: "Action immédiate engagée ?", r: "Évacuation médicale et déclaration légale sous 48h" }
        ]
      }
    };

    setIncidents([nouveauDossier, ...incidents]);
    setShowNewModal(false);
    showToast(`Déclaration ${nouveauDossier.numeroCnps} générée avec succès. Délai de transmission : 48h.`);
  };

  // Marquer dépôt CNPS effectué
  const handleMarkCnpsDeposited = (id) => {
    const today = new Date().toLocaleDateString('fr-FR');
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          statutCnps: 'TRANSMIS_DECHARGE',
          dateDepotCnps: `${today} (Décharge d'accueil agence CNPS)`
        };
      }
      return inc;
    }));
    showToast("Dépôt CNPS confirmé avec accusé de réception.");
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
            <div className="p-2.5 bg-rose-600/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Déclarations d'Accidents CNPS & Enquêtes "Arbre des Causes"
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                  Délai Légal 48h
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Conformité Code de Prévoyance Sociale CI, analyse 5 Pourquoi, ratios TF/TG et plans d'actions préventifs CSST
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Déclarer un Accident (Sous 48h)</span>
          </button>
        </div>
      </div>

      {/* Ratios & KPIs Réglementaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Jours sans accident */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Jours Consécutifs Sans AT
            </span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{joursSansAccident}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">jour(s)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Dernier incident survenu le 22/09/2026
          </div>
        </div>

        {/* Taux de Fréquence (TF) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Taux de Fréquence (TF)
            </span>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{tauxFrequence}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">accidents / million d'heures</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Objectif annuel &lt; 8.00 (Moyenne secteur tech : 5.8)
          </div>
        </div>

        {/* Taux de Gravité (TG) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Taux de Gravité (TG)
            </span>
            <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{tauxGravite}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">jours perdus / 1000h</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {totalJoursPerdus} jours d'ITT prescrits au total
          </div>
        </div>

        {/* Délais CNPS < 48h */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Dépôts CNPS sous 48h
            </span>
            <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold ml-2">Dans les délais</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            1 dossier en cours d'acheminement CNPS
          </div>
        </div>

      </div>

      {/* Onglets Navigation Principale */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('dossiers')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'dossiers'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 dark:border-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Dossiers & Déclarations Légales CNPS ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('arbre_causes')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'arbre_causes'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 dark:border-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Enquêtes "Arbre des Causes" & 5 Pourquoi</span>
        </button>

        <button
          onClick={() => setActiveTab('capa')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'capa'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 dark:border-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Plan d'Actions Correctives CSST ({actionsCorrectives.length})</span>
        </button>
      </div>

      {/* ONGLET 1 : DOSSIERS CNPS */}
      {activeTab === 'dossiers' && (
        <div className="space-y-4">
          
          {/* Recherche & Filtres */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par collaborateur, référence CNPS, lésion ou circonstance..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setFilterType('TOUS')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filterType === 'TOUS' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Tous types
                </button>
                <button
                  onClick={() => setFilterType('TRAVAIL')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filterType === 'TRAVAIL' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Accident Travail
                </button>
                <button
                  onClick={() => setFilterType('TRAJET')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filterType === 'TRAJET' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Accident Trajet
                </button>
              </div>

              <select
                value={filterCnpsStatus}
                onChange={(e) => setFilterCnpsStatus(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border-none font-medium"
              >
                <option value="TOUS">Tous statuts CNPS</option>
                <option value="EN_ATTENTE_DEPOT">En attente dépôt (&lt; 48h)</option>
                <option value="TRANSMIS_DECHARGE">Transmis avec décharge</option>
                <option value="CLOTURE_INDEMNISE">Clôturé & Indemnisé</option>
              </select>
            </div>
          </div>

          {/* Tableau des Dossiers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Réf & Type</th>
                    <th className="py-3.5 px-4">Salarié Victime</th>
                    <th className="py-3.5 px-4">Date & Circonstances</th>
                    <th className="py-3.5 px-4">Lésions & Arrêt (ITT)</th>
                    <th className="py-3.5 px-4">Statut Légal CNPS</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate-400">
                        Aucun incident ou déclaration ne correspond aux critères.
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* Réf & Type */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                            {inc.id}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {inc.numeroCnps}
                          </div>
                          <div className="mt-1">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inc.typeAccident === 'TRAVAIL'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            }`}>
                              {inc.typeAccident === 'TRAVAIL' ? 'Accident du Travail' : 'Accident de Trajet'}
                            </span>
                          </div>
                        </td>

                        {/* Salarié */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {inc.employeNom}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {inc.poste}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {inc.agence}
                          </div>
                        </td>

                        {/* Circonstances */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                            Le {inc.dateAccident} à {inc.heureAccident}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                            {inc.circonstances}
                          </div>
                        </td>

                        {/* Lésions & Arrêt */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {inc.siegeLesion}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {inc.natureLesion}
                          </div>
                          <div className="mt-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              {inc.joursArretPrescrits} jours d'arrêt
                            </span>
                          </div>
                        </td>

                        {/* Statut CNPS */}
                        <td className="py-3.5 px-4">
                          {inc.statutCnps === 'EN_ATTENTE_DEPOT' && (
                            <div>
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300">
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                Reste {inc.delaiCnpsHeuresRestantes}h légales
                              </span>
                              <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                                À déposer à l'agence CNPS
                              </div>
                            </div>
                          )}

                          {inc.statutCnps === 'TRANSMIS_DECHARGE' && (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Déposé sous 48h
                              </span>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {inc.dateDepotCnps}
                              </div>
                            </div>
                          )}

                          {inc.statutCnps === 'CLOTURE_INDEMNISE' && (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                                <FileCheck className="w-3.5 h-3.5" />
                                Clôturé & Indemnisé
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Si en attente de dépôt : bouton validation décharge */}
                            {inc.statutCnps === 'EN_ATTENTE_DEPOT' && (
                              <button
                                onClick={() => handleMarkCnpsDeposited(inc.id)}
                                title="Marquer le dossier comme déposé avec décharge CNPS"
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Décharge</span>
                              </button>
                            )}

                            {/* Voir Arbre des Causes */}
                            <button
                              onClick={() => {
                                setSelectedIncidentForArbre(inc);
                                setActiveTab('arbre_causes');
                              }}
                              title="Analyser l'Arbre des Causes & 5 Pourquoi"
                              className="p-1.5 text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>

                            {/* Imprimer Déclaration Cerfa CNPS */}
                            <button
                              onClick={() => setSelectedIncidentForPrint(inc)}
                              title="Imprimer la Déclaration d'Accident CNPS officielle"
                              className="p-1.5 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ONGLET 2 : ENQUÊTES "ARBRE DES CAUSES" & 5 POURQUOI */}
      {activeTab === 'arbre_causes' && (
        <div className="space-y-6">
          
          {/* Sélection de l'accident à analyser */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                Méthode de l'Arbre des Causes (CSST & Inspection du Travail)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Remontée logique des faits depuis la blessure jusqu'aux causes organisationnelles profondes pour éviter toute récidive
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Dossier analysé :</span>
              <select
                value={selectedIncidentForArbre ? selectedIncidentForArbre.id : incidents[0].id}
                onChange={(e) => {
                  const target = incidents.find(i => i.id === e.target.value);
                  setSelectedIncidentForArbre(target);
                }}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
              >
                {incidents.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    {inc.id} - {inc.employeNom} ({inc.dateAccident})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Canvas de l'Arbre des Causes pour le dossier actif */}
          {(() => {
            const current = selectedIncidentForArbre || incidents[0];
            const arbre = current.arbreCauses;

            return (
              <div className="space-y-6">
                
                {/* 1. Carte Arbre Linéaire des Causes */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Rétro-Ingénierie de l'Incident : {current.id} ({current.employeNom})
                    </span>
                    <span className="text-xs text-slate-400">
                      Commission d'enquête CSST du {current.dateAccident}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    
                    {/* Colonne 4 : Causes Profondes / Organisation */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="text-[11px] font-extrabold uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                        4. Facteurs Organisationnels
                      </div>
                      <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {arbre.causesProfondes.map((c, i) => (
                          <div key={i} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg shadow-2xs border border-purple-200 dark:border-purple-900/50">
                            • {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Colonne 3 : Conditions Préalables */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="text-[11px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                        3. Conditions Préalables
                      </div>
                      <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {arbre.conditionsPrealables.map((c, i) => (
                          <div key={i} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg shadow-2xs border border-amber-200 dark:border-amber-900/50">
                            • {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Colonne 2 : Faits Directs */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="text-[11px] font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                        2. Faits Directs / Déclencheur
                      </div>
                      <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {arbre.faitsDirects.map((c, i) => (
                          <div key={i} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg shadow-2xs border border-blue-200 dark:border-blue-900/50">
                            • {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Colonne 1 : Fait Ultime (Blessure) */}
                    <div className="p-4 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl border-2 border-rose-400 dark:border-rose-800 space-y-2">
                      <div className="text-[11px] font-extrabold uppercase text-rose-600 dark:text-rose-400 tracking-wider flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        1. Fait Ultime (Dommage)
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-rose-200 dark:border-rose-900 font-bold text-xs text-slate-900 dark:text-white">
                        {arbre.faitUltime}
                      </div>
                      <div className="text-[11px] text-rose-700 dark:text-rose-300 mt-2 font-medium">
                        Prescription : {current.joursArretPrescrits} jours d'arrêt délivrés par {current.medecinConstat}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. Analyse des "5 Pourquoi" (Root Cause) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    Enchaînement Causal : Les "5 Pourquoi" de l'Incident
                  </h4>

                  <div className="space-y-3">
                    {arbre.cinqPourquoi.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                          P{idx + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.p}
                          </div>
                          <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                            <span>{item.r}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      )}

      {/* ONGLET 3 : PLAN D'ACTIONS CORRECTIVES CSST (CAPA) */}
      {activeTab === 'capa' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Plan d'Actions Correctives & Préventives (CAPA CSST)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mesures correctives adoptées à la suite des enquêtes d'accidents pour mise en conformité
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300">
                100% des actions critiques sécurisées
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionsCorrectives.map((capa) => (
              <div key={capa.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {capa.id} • Réf {capa.accidentRef}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    capa.priorite === 'CRITIQUE'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : capa.priorite === 'HAUTE'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    Priorité {capa.priorite}
                  </span>
                </div>

                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  {capa.action}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Pilote :</span> {capa.responsable}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Échéance :</span> {capa.echeance}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    capa.statut === 'REALISE' || capa.statut === 'CLOTURE'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {capa.statut === 'REALISE' ? 'Action Réalisée' : capa.statut === 'CLOTURE' ? 'Clôturée & Vérifiée' : 'En cours de déploiement'}
                  </span>
                  <button
                    onClick={() => showToast(`Vérification de l'action ${capa.id} enregistrée.`)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALE 1 : Déclarer un Nouvel Accident (Formulaire CNPS) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50 dark:bg-rose-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-600 text-white rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Déclaration Réglementaire d'Accident (CNPS CI)
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    Obligation de transmission à la CNPS sous 48 heures ouvrées
                  </p>
                </div>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeclaration} className="p-5 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom & Prénom du Salarié Victime *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kouassi Armand"
                    value={newAccident.employeNom}
                    onChange={(e) => setNewAccident({ ...newAccident, employeNom: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emploi / Poste Occupé
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Technicien Réseau"
                    value={newAccident.poste}
                    onChange={(e) => setNewAccident({ ...newAccident, poste: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nature de l'Accident
                  </label>
                  <select
                    value={newAccident.typeAccident}
                    onChange={(e) => setNewAccident({ ...newAccident, typeAccident: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="TRAVAIL">Accident du Travail (Lieu fixe)</option>
                    <option value="TRAJET">Accident de Trajet (Domicile-Bureau)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date de Survenance
                  </label>
                  <input
                    type="text"
                    value={newAccident.dateAccident}
                    onChange={(e) => setNewAccident({ ...newAccident, dateAccident: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Heure Précise
                  </label>
                  <input
                    type="text"
                    value={newAccident.heureAccident}
                    onChange={(e) => setNewAccident({ ...newAccident, heureAccident: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Circonstances Détaillées de l'Événement *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Décrire précisément ce que faisait le salarié, les machines ou outils impliqués, l'environnement..."
                  value={newAccident.circonstances}
                  onChange={(e) => setNewAccident({ ...newAccident, circonstances: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Siège de la Lésion (Partie du corps touchée)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Main gauche, Cheville droite, Crâne..."
                    value={newAccident.siegeLesion}
                    onChange={(e) => setNewAccident({ ...newAccident, siegeLesion: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nature des Blessures Constatées *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Entorse, Brûlure, Plaie avec suture..."
                    value={newAccident.natureLesion}
                    onChange={(e) => setNewAccident({ ...newAccident, natureLesion: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jours d'Arrêt Prescrits (Certificat Médical Initial)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newAccident.joursArretPrescrits}
                    onChange={(e) => setNewAccident({ ...newAccident, joursArretPrescrits: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Médecin / Centre Médical Ayant Constaté
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dr. Koné (Polyclinique PISAM)"
                    value={newAccident.medecinConstat}
                    onChange={(e) => setNewAccident({ ...newAccident, medecinConstat: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Émettre la Déclaration Officielle CNPS</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODALE 2 : Aperçu & Impression Déclaration Officielle CNPS */}
      {selectedIncidentForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Bordereau Légal de Déclaration d'Accident du Travail (CNPS CI)
                </h3>
              </div>
              <button onClick={() => setSelectedIncidentForPrint(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu Imprimable format CERFA CNPS */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-slate-800 dark:text-slate-200">
              
              <div className="border-2 border-slate-800 p-5 rounded-lg space-y-4 bg-white text-slate-900">
                
                {/* En-tête officiel */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                  <div>
                    <div className="font-black text-sm uppercase">RÉPUBLIQUE DE CÔTE D'IVOIRE</div>
                    <div className="text-[10px] text-slate-600">Union - Discipline - Travail</div>
                    <div className="font-bold text-xs mt-1 text-rose-800">
                      CAISSE NATIONALE DE PRÉVOYANCE SOCIALE (CNPS)
                    </div>
                    <div className="text-[10px]">Direction de la Prévention et des Risques Professionnels</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs bg-slate-100 p-1.5 rounded border border-slate-300">
                      N° DOSSIER : {selectedIncidentForPrint.numeroCnps}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Délai réglementaire : 48 Heures</div>
                  </div>
                </div>

                <div className="text-center font-black text-sm uppercase tracking-wide bg-slate-100 py-1 border border-slate-300">
                  DÉCLARATION D'ACCIDENT DU TRAVAIL OU DE TRAJET
                </div>

                {/* Section 1 : Employeur */}
                <div className="space-y-1">
                  <div className="font-bold underline text-[11px]">1. RENSEIGNEMENTS CONCERNANT L'EMPLOYEUR :</div>
                  <div>Raison Sociale : <strong>SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE (SII CÔTE D'IVOIRE)</strong></div>
                  <div>Numéro Employeur CNPS : <strong>4492019-CI</strong> • Code Activité : <strong>6201 (Services IT & Télécoms)</strong></div>
                  <div>Adresse : <strong>Abidjan Plateau, Boulevard de la République, Tour Postel 2001</strong></div>
                </div>

                {/* Section 2 : Salarié */}
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <div className="font-bold underline text-[11px]">2. RENSEIGNEMENTS SUR LA VICTIME :</div>
                  <div>Nom & Prénom(s) : <strong>{selectedIncidentForPrint.employeNom}</strong> • Matricule : <strong>{selectedIncidentForPrint.employeId}</strong></div>
                  <div>Emploi / Qualification : <strong>{selectedIncidentForPrint.poste}</strong></div>
                  <div>Département & Site : <strong>{selectedIncidentForPrint.departement} ({selectedIncidentForPrint.agence})</strong></div>
                </div>

                {/* Section 3 : Accident */}
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <div className="font-bold underline text-[11px]">3. CIRCONSTANCES & LÉSIONS DE L'ACCIDENT :</div>
                  <div>Date & Heure : <strong>Le {selectedIncidentForPrint.dateAccident} à {selectedIncidentForPrint.heureAccident}</strong></div>
                  <div>Nature : <strong>{selectedIncidentForPrint.typeAccident === 'TRAVAIL' ? 'Accident du Travail sur site' : 'Accident de Trajet'}</strong></div>
                  <div>Lieu précis : <strong>{selectedIncidentForPrint.circonstances}</strong></div>
                  <div>Siège et nature des lésions : <strong>{selectedIncidentForPrint.siegeLesion} — {selectedIncidentForPrint.natureLesion}</strong></div>
                  <div>Conséquence immédiate : <strong>Arrêt de travail prescrit de {selectedIncidentForPrint.joursArretPrescrits} jours</strong></div>
                  <div>Témoin(s) : <strong>{selectedIncidentForPrint.temoin}</strong></div>
                  <div>Médecin / Formation Sanitaire : <strong>{selectedIncidentForPrint.medecinConstat}</strong></div>
                </div>

                {/* Signatures & Cachet */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-800 text-[11px]">
                  <div>
                    <div className="font-semibold">Pour le Comité Santé & Sécurité (CSST) :</div>
                    <div className="mt-8 text-slate-400 italic">Signature du Représentant Salariés</div>
                  </div>
                  <div className="text-right">
                    <div>Fait à Abidjan, le {selectedIncidentForPrint.dateAccident}</div>
                    <div className="font-bold mt-1">Pour la Direction des Ressources Humaines :</div>
                    <div className="mt-6 font-mono text-[10px] text-blue-800 font-bold border-2 border-dashed border-blue-800 p-1 inline-block">
                      CACHET & SIGNATURE ÉLECTRONIQUE VALIDES
                    </div>
                  </div>
                </div>

              </div>

              {/* Boutons actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setSelectedIncidentForPrint(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Fermer
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Bordereau Officiel CNPS</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default EnquetesAccidents;
