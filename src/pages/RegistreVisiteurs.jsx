import React, { useState } from 'react';
import {
  DoorOpen, Shield, Users, Clock, QrCode, Search,
  Filter, Plus, Printer, Download, CheckCircle2,
  AlertCircle, X, Eye, Phone, Building, UserCheck,
  Calendar, ArrowRightLeft, Bell, FileSpreadsheet, Lock
} from 'lucide-react';

export function RegistreVisiteurs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOUS'); // TOUS, EN_COURS, ATTENDU, CLOTURE
  const [siteFilter, setSiteFilter] = useState('TOUS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);
  const [selectedVisitorForPass, setSelectedVisitorForPass] = useState(null);
  const [notificationToast, setNotificationToast] = useState(null);

  // Registre des visiteurs (données initiales réalistes pour la Côte d'Ivoire)
  const [visiteurs, setVisiteurs] = useState([
    {
      id: "VIS-2026-001",
      badgeNumber: "BADGE-V-04",
      nom: "Amadou Diaby",
      societe: "Société Ivoirienne de Cacao (SIC CACAO)",
      telephone: "+225 07 48 92 10 33",
      pieceIdentite: "CNI CI - C0108392019",
      collaborateur: "Julie Konan",
      collaborateurPoste: "Chargée de Clientèle Entreprises Senior",
      site: "Siège Plateau (Tour Postel 2001)",
      motif: "RDV Commercial & Signature Contrat Cadre",
      heureArrivee: "08:45",
      heureSortie: null,
      statut: "EN_COURS", // EN_COURS, ATTENDU, CLOTURE
      date: "23/09/2026",
      vehiculeImmat: "9482 HY 01",
      estVip: true
    },
    {
      id: "VIS-2026-002",
      badgeNumber: "BADGE-V-12",
      nom: "Koffi N'Goran Sylvain",
      societe: "KPMG Côte d'Ivoire",
      telephone: "+225 05 64 21 88 09",
      pieceIdentite: "Passeport CI - 21AA89201",
      collaborateur: "Jean-Marc Koffi",
      collaborateurPoste: "Directeur d'Agence Principale",
      site: "Siège Plateau (Tour Postel 2001)",
      motif: "Mission d'Audit & Contrôle Légal des Comptes",
      heureArrivee: "09:15",
      heureSortie: null,
      statut: "EN_COURS",
      date: "23/09/2026",
      vehiculeImmat: "Sans véhicule",
      estVip: false
    },
    {
      id: "VIS-2026-003",
      badgeNumber: "BADGE-V-07",
      nom: "Awa Bamba",
      societe: "Cabinet Deloitte Audit & Conseil",
      telephone: "+225 07 09 33 44 55",
      pieceIdentite: "CNI CI - C0098492044",
      collaborateur: "Dr. Stéphane Touré",
      collaborateurPoste: "Directeur des Ressources Humaines",
      site: "Agence Cocody Ambassades",
      motif: "Entretien Recrutement Poste Contrôleur de Gestion Senior",
      heureArrivee: "09:30",
      heureSortie: "11:15",
      statut: "CLOTURE",
      date: "23/09/2026",
      vehiculeImmat: "Sans véhicule",
      estVip: false
    },
    {
      id: "VIS-2026-004",
      badgeNumber: "BADGE-V-15",
      nom: "Barthélémy Kouamé",
      societe: "SOGETEL Télécoms & Réseaux",
      telephone: "+225 01 02 88 99 11",
      pieceIdentite: "Permis Conduire - B09284102",
      collaborateur: "Moussa Soro",
      collaborateurPoste: "Responsable Infrastructure & IT",
      site: "Hub Zone 4 Marcory",
      motif: "Maintenance Baie Fibre Optique & Serveurs",
      heureArrivee: "10:00",
      heureSortie: null,
      statut: "EN_COURS",
      date: "23/09/2026",
      vehiculeImmat: "4421 GH 01",
      estVip: false
    },
    {
      id: "VIS-2026-005",
      badgeNumber: "BADGE-V-02",
      nom: "Mme Salimata Ouattara",
      societe: "Banque Atlantique CI",
      telephone: "+225 07 88 12 34 56",
      pieceIdentite: "CNI CI - C0149204910",
      collaborateur: "Julie Konan",
      collaborateurPoste: "Chargée de Clientèle Entreprises Senior",
      site: "Siège Plateau (Tour Postel 2001)",
      motif: "Session Partenariat Financement Flotte",
      heureArrivee: "10:30",
      heureSortie: "11:50",
      statut: "CLOTURE",
      date: "23/09/2026",
      vehiculeImmat: "3290 JR 01",
      estVip: true
    },
    {
      id: "VIS-2026-006",
      badgeNumber: "BADGE-V-19",
      nom: "Fabrice Brou",
      societe: "DHL Express Côte d'Ivoire",
      telephone: "+225 05 05 91 19 22",
      pieceIdentite: "Badge Pro DHL - DHL-CI-88",
      collaborateur: "Armand Kouassi",
      collaborateurPoste: "Comptable Fournisseurs",
      site: "Siège Plateau (Tour Postel 2001)",
      motif: "Livraison Plis Sécurisés & Factures Originales",
      heureArrivee: "11:40",
      heureSortie: null,
      statut: "EN_COURS",
      date: "23/09/2026",
      vehiculeImmat: "1109 KL 01",
      estVip: false
    },
    {
      id: "VIS-2026-007",
      badgeNumber: "BADGE-V-01",
      nom: "Dr. Charles Yao",
      societe: "Ministère de la Transition Numérique",
      telephone: "+225 07 55 44 33 22",
      pieceIdentite: "Passeport Diplomatique CI - D092841",
      collaborateur: "Jean-Marc Koffi",
      collaborateurPoste: "Directeur d'Agence Principale",
      site: "Siège Plateau (Tour Postel 2001)",
      motif: "Visite Institutionnelle & Protocole Numérique",
      heureArrivee: "14:30",
      heureSortie: null,
      statut: "ATTENDU",
      date: "23/09/2026",
      vehiculeImmat: "D-894-CI",
      estVip: true
    },
    {
      id: "VIS-2026-008",
      badgeNumber: "BADGE-V-09",
      nom: "Mariam Traoré",
      societe: "Cabinet Conseil RH & RSE Afrique",
      telephone: "+225 07 41 85 96 32",
      pieceIdentite: "CNI CI - C0192840192",
      collaborateur: "Dr. Stéphane Touré",
      collaborateurPoste: "Directeur des Ressources Humaines",
      site: "Agence Cocody Ambassades",
      motif: "Restitution Audit QVT & Bien-être au Travail",
      heureArrivee: "15:00",
      heureSortie: null,
      statut: "ATTENDU",
      date: "23/09/2026",
      vehiculeImmat: "Sans véhicule",
      estVip: false
    }
  ]);

  // Formulaire d'émargement d'un nouveau visiteur sur place
  const [newVisitor, setNewVisitor] = useState({
    nom: '',
    societe: '',
    telephone: '',
    pieceIdentiteType: 'CNI',
    pieceIdentiteNum: '',
    collaborateur: 'Julie Konan (Chargée de Clientèle Entreprises Senior)',
    site: 'Siège Plateau (Tour Postel 2001)',
    motif: 'RDV Commercial & Client',
    badgeNumber: '',
    vehiculeImmat: '',
    estVip: false,
    notifierHote: true
  });

  // Formulaire de pré-enregistrement VIP
  const [preRegVisitor, setPreRegVisitor] = useState({
    nom: '',
    societe: '',
    telephone: '',
    collaborateur: 'Jean-Marc Koffi (Directeur d\'Agence Principale)',
    site: 'Siège Plateau (Tour Postel 2001)',
    date: '23/09/2026',
    heurePrevue: '15:30',
    motif: '',
    estVip: true
  });

  // Calculs KPI
  const presentsActuellement = visiteurs.filter(v => v.statut === 'EN_COURS').length;
  const totalAujourdhui = visiteurs.filter(v => v.statut === 'EN_COURS' || v.statut === 'CLOTURE').length;
  const attendus = visiteurs.filter(v => v.statut === 'ATTENDU').length;
  const visitesCloturees = visiteurs.filter(v => v.statut === 'CLOTURE').length;

  // Filtrage
  const filteredVisiteurs = visiteurs.filter(v => {
    const matchesSearch = 
      v.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.societe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.collaborateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'TOUS' || v.statut === statusFilter;
    const matchesSite = siteFilter === 'TOUS' || v.site === siteFilter;

    return matchesSearch && matchesStatus && matchesSite;
  });

  // Émargement de sortie en 1 clic
  const handleSortie = (id) => {
    const now = new Date();
    const heureSortie = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setVisiteurs(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          statut: 'CLOTURE',
          heureSortie: heureSortie
        };
      }
      return v;
    }));

    showToast("Sortie émargée avec succès. Badge restitué et libéré.");
  };

  // Enregistrement sur place
  const handleAddVisitor = (e) => {
    e.preventDefault();
    if (!newVisitor.nom || !newVisitor.societe || !newVisitor.badgeNumber) {
      alert("Veuillez renseigner au minimum le nom, la société et le numéro de badge.");
      return;
    }

    const now = new Date();
    const heureArrivee = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const nouveau = {
      id: `VIS-2026-${String(visiteurs.length + 1).padStart(3, '0')}`,
      badgeNumber: newVisitor.badgeNumber.toUpperCase(),
      nom: newVisitor.nom,
      societe: newVisitor.societe,
      telephone: newVisitor.telephone || 'Non renseigné',
      pieceIdentite: `${newVisitor.pieceIdentiteType} - ${newVisitor.pieceIdentiteNum || 'Vérifié'}`,
      collaborateur: newVisitor.collaborateur.split(' (')[0],
      collaborateurPoste: newVisitor.collaborateur.includes('(') ? newVisitor.collaborateur.split('(')[1].replace(')', '') : 'Collaborateur SII',
      site: newVisitor.site,
      motif: newVisitor.motif,
      heureArrivee: heureArrivee,
      heureSortie: null,
      statut: 'EN_COURS',
      date: '23/09/2026',
      vehiculeImmat: newVisitor.vehiculeImmat || 'Sans véhicule',
      estVip: newVisitor.estVip
    };

    setVisiteurs([nouveau, ...visiteurs]);
    setShowAddModal(false);
    
    // Réinitialiser
    setNewVisitor({
      nom: '',
      societe: '',
      telephone: '',
      pieceIdentiteType: 'CNI',
      pieceIdentiteNum: '',
      collaborateur: 'Julie Konan (Chargée de Clientèle Entreprises Senior)',
      site: 'Siège Plateau (Tour Postel 2001)',
      motif: 'RDV Commercial & Client',
      badgeNumber: '',
      vehiculeImmat: '',
      estVip: false,
      notifierHote: true
    });

    showToast(`Visiteur ${nouveau.nom} émargé à l'accueil. Notification transmise à ${nouveau.collaborateur}.`);
  };

  // Pré-enregistrer un VIP
  const handlePreRegister = (e) => {
    e.preventDefault();
    if (!preRegVisitor.nom || !preRegVisitor.societe) {
      alert("Veuillez renseigner le nom et l'organisme du visiteur attendu.");
      return;
    }

    const attenduItem = {
      id: `VIS-2026-${String(visiteurs.length + 1).padStart(3, '0')}`,
      badgeNumber: `BADGE-V-${Math.floor(10 + Math.random() * 20)}`,
      nom: preRegVisitor.nom,
      societe: preRegVisitor.societe,
      telephone: preRegVisitor.telephone || 'Non renseigné',
      pieceIdentite: 'À présenter à l\'arrivée',
      collaborateur: preRegVisitor.collaborateur.split(' (')[0],
      collaborateurPoste: preRegVisitor.collaborateur.includes('(') ? preRegVisitor.collaborateur.split('(')[1].replace(')', '') : 'Direction SII',
      site: preRegVisitor.site,
      motif: preRegVisitor.motif || 'Rendez-vous Institutionnel / VIP',
      heureArrivee: preRegVisitor.heurePrevue,
      heureSortie: null,
      statut: 'ATTENDU',
      date: preRegVisitor.date,
      vehiculeImmat: 'Accès Parking Réservé',
      estVip: preRegVisitor.estVip
    };

    setVisiteurs([...visiteurs, attenduItem]);
    setShowPreRegisterModal(false);
    setPreRegVisitor({
      nom: '',
      societe: '',
      telephone: '',
      collaborateur: 'Jean-Marc Koffi (Directeur d\'Agence Principale)',
      site: 'Siège Plateau (Tour Postel 2001)',
      date: '23/09/2026',
      heurePrevue: '15:30',
      motif: '',
      estVip: true
    });

    showToast(`Rendez-vous VIP pour ${attenduItem.nom} pré-enregistré dans le registre d'accueil.`);
  };

  // Marquer l'arrivée d'un visiteur attendu
  const handleArriveeAttendu = (id) => {
    const now = new Date();
    const heureArrivee = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setVisiteurs(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          statut: 'EN_COURS',
          heureArrivee: heureArrivee
        };
      }
      return v;
    }));

    showToast("Arrivée confirmée. Badge d'accès activé.");
  };

  const showToast = (message) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  // Impression
  const triggerPrintPass = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast de Notification */}
      {notificationToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{notificationToast}</span>
          <button onClick={() => setNotificationToast(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <DoorOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Registre Numérique des Visiteurs & Accès
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Temps Réel
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Contrôle des flux d'accueil, remise de badges sécurisés et traçabilité HSE en agence et au siège
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setShowPreRegisterModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Pré-enregistrer un RDV VIP</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Émarger une Arrivée</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Présents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Présents dans les locaux
            </span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{presentsActuellement}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">personnes sur site</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Badges physiques actifs sur les sites
          </div>
        </div>

        {/* KPI 2 : Total du Jour */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Total Visites du Jour
            </span>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalAujourdhui}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">entrées enregistrées</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {visitesCloturees} visites clôturées aujourd'hui
          </div>
        </div>

        {/* KPI 3 : RDV Attendus */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Attendus / Pré-enregistrés
            </span>
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{attendus}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">visiteurs attendus</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Accueil express et badges pré-attribués
          </div>
        </div>

        {/* KPI 4 : Temps Moyen */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Temps Moyen de Présence
            </span>
            <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">48</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">minutes</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Conforme aux normes d'accès et sécurité
          </div>
        </div>

      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Champ de recherche */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par visiteur, entreprise, badge (ex: BADGE-V-04) ou collaborateur..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Filtres par boutons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Statut */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('TOUS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'TOUS'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tous ({visiteurs.length})
            </button>
            <button
              onClick={() => setStatusFilter('EN_COURS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'EN_COURS'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Présents ({presentsActuellement})
            </button>
            <button
              onClick={() => setStatusFilter('ATTENDU')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'ATTENDU'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Attendus ({attendus})
            </button>
            <button
              onClick={() => setStatusFilter('CLOTURE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'CLOTURE'
                  ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Sortis ({visitesCloturees})
            </button>
          </div>

          {/* Filtre Site */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="TOUS">Tous les sites & agences</option>
            <option value="Siège Plateau (Tour Postel 2001)">Siège Plateau (Tour Postel 2001)</option>
            <option value="Agence Cocody Ambassades">Agence Cocody Ambassades</option>
            <option value="Hub Zone 4 Marcory">Hub Zone 4 Marcory</option>
          </select>
        </div>

      </div>

      {/* Tableau des Visiteurs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Journal d'Émargement des Accès ({filteredVisiteurs.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Conforme Code du Travail CI & Protocole Sécurité Incendie
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Badge & Statut</th>
                <th className="py-3.5 px-4">Visiteur & Organisme</th>
                <th className="py-3.5 px-4">Collaborateur & Site</th>
                <th className="py-3.5 px-4">Motif de Visite</th>
                <th className="py-3.5 px-4">Horaires (Entrée / Sortie)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredVisiteurs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <DoorOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Aucun enregistrement ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredVisiteurs.map((visiteur) => (
                  <tr key={visiteur.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Badge & Statut */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {visiteur.badgeNumber}
                          </span>
                          {visiteur.estVip && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              VIP
                            </span>
                          )}
                        </div>
                        <div>
                          {visiteur.statut === 'EN_COURS' && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Présent dans les locaux
                            </span>
                          )}
                          {visiteur.statut === 'ATTENDU' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                              <Clock className="w-3 h-3" />
                              Attendu à {visiteur.heureArrivee}
                            </span>
                          )}
                          {visiteur.statut === 'CLOTURE' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Visite clôturée
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Visiteur & Entreprise */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {visiteur.nom}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" />
                        {visiteur.societe}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{visiteur.telephone}</span>
                        <span>•</span>
                        <span className="font-mono">{visiteur.pieceIdentite}</span>
                      </div>
                    </td>

                    {/* Collaborateur & Site */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {visiteur.collaborateur}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {visiteur.collaborateurPoste}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        {visiteur.site}
                      </div>
                    </td>

                    {/* Motif */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {visiteur.motif}
                      </div>
                      {visiteur.vehiculeImmat && visiteur.vehiculeImmat !== 'Sans véhicule' && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          Véhicule : {visiteur.vehiculeImmat}
                        </div>
                      )}
                    </td>

                    {/* Horaires */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="font-semibold">Entrée :</span> {visiteur.heureArrivee || '--:--'}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Sortie :</span> {visiteur.heureSortie || '--:--'}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Si présent : bouton d'émargement de sortie rapide */}
                        {visiteur.statut === 'EN_COURS' && (
                          <button
                            onClick={() => handleSortie(visiteur.id)}
                            title="Émarger la sortie et libérer le badge"
                            className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 rounded-lg transition-colors border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Sortie</span>
                          </button>
                        )}

                        {/* Si attendu : bouton arrivée */}
                        {visiteur.statut === 'ATTENDU' && (
                          <button
                            onClick={() => handleArriveeAttendu(visiteur.id)}
                            title="Confirmer l'arrivée du visiteur"
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                          >
                            <DoorOpen className="w-3.5 h-3.5" />
                            <span>Arrivé</span>
                          </button>
                        )}

                        {/* Voir le Pass Visiteur */}
                        <button
                          onClick={() => setSelectedVisitorForPass(visiteur)}
                          title="Générer / Imprimer le Pass Visiteur"
                          className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Notifier collaborateur */}
                        <button
                          onClick={() => showToast(`Rappel SMS/Email réémis à ${visiteur.collaborateur}.`)}
                          title="Alerter à nouveau le collaborateur visité"
                          className="p-1.5 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Bell className="w-4 h-4" />
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

      {/* MODALE 1 : Émarger un Nouveau Visiteur sur Place */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Émargement Entrée Visiteur
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Accueil sur place & attribution de badge temporaire
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVisitor} className="p-5 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom & Prénom(s) du Visiteur *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: M. Ousmane Diakité"
                    value={newVisitor.nom}
                    onChange={(e) => setNewVisitor({ ...newVisitor, nom: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Société / Institution / Organisme *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Orange CI, CIE, NSIA..."
                    value={newVisitor.societe}
                    onChange={(e) => setNewVisitor({ ...newVisitor, societe: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone Visiteur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: +225 07 00 00 00 00"
                    value={newVisitor.telephone}
                    onChange={(e) => setNewVisitor({ ...newVisitor, telephone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro de Badge Attribué *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BADGE-V-08"
                    value={newVisitor.badgeNumber}
                    onChange={(e) => setNewVisitor({ ...newVisitor, badgeNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Pièce d'identité */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type de Pièce
                  </label>
                  <select
                    value={newVisitor.pieceIdentiteType}
                    onChange={(e) => setNewVisitor({ ...newVisitor, pieceIdentiteType: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="CNI">CNI Ivoirienne</option>
                    <option value="Passeport">Passeport</option>
                    <option value="Permis">Permis de Conduire</option>
                    <option value="Carte Consulaire">Carte Consulaire</option>
                    <option value="Badge Pro">Badge Entreprise</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro de la Pièce Présentée
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: C0108392819"
                    value={newVisitor.pieceIdentiteNum}
                    onChange={(e) => setNewVisitor({ ...newVisitor, pieceIdentiteNum: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Collaborateur visité & Site */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Collaborateur / Hôte Visité *
                  </label>
                  <select
                    value={newVisitor.collaborateur}
                    onChange={(e) => setNewVisitor({ ...newVisitor, collaborateur: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Julie Konan (Chargée de Clientèle Entreprises Senior)">Julie Konan (Chargée de Clientèle Senior)</option>
                    <option value="Jean-Marc Koffi (Directeur d'Agence Principale)">Jean-Marc Koffi (Directeur d'Agence Principale)</option>
                    <option value="Dr. Stéphane Touré (Directeur des Ressources Humaines)">Dr. Stéphane Touré (Directeur des RH)</option>
                    <option value="Moussa Soro (Responsable Infrastructure & IT)">Moussa Soro (Responsable IT)</option>
                    <option value="Armand Kouassi (Comptable Fournisseurs)">Armand Kouassi (Comptable Fournisseurs)</option>
                    <option value="Fatou Camara (Responsable QVT & CSE)">Fatou Camara (Responsable QVT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Site d'Accueil
                  </label>
                  <select
                    value={newVisitor.site}
                    onChange={(e) => setNewVisitor({ ...newVisitor, site: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Siège Plateau (Tour Postel 2001)">Siège Plateau (Tour Postel 2001)</option>
                    <option value="Agence Cocody Ambassades">Agence Cocody Ambassades</option>
                    <option value="Hub Zone 4 Marcory">Hub Zone 4 Marcory</option>
                  </select>
                </div>
              </div>

              {/* Motif & Immatriculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Motif de la Visite
                  </label>
                  <select
                    value={newVisitor.motif}
                    onChange={(e) => setNewVisitor({ ...newVisitor, motif: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="RDV Commercial & Client">RDV Commercial & Client</option>
                    <option value="Entretien de Recrutement">Entretien de Recrutement</option>
                    <option value="Audit & Contrôle Légal">Audit & Contrôle Légal</option>
                    <option value="Maintenance / Intervention Technique">Maintenance / Intervention Technique</option>
                    <option value="Livraison / Coursier Express">Livraison / Coursier Express</option>
                    <option value="Visite Institutionnelle">Visite Institutionnelle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Plaque d'Immatriculation Véhicule (si parking)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 8943 JH 01"
                    value={newVisitor.vehiculeImmat}
                    onChange={(e) => setNewVisitor({ ...newVisitor, vehiculeImmat: e.target.value })}
                    className="w-full px-3 py-2 text-sm uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="pt-2 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newVisitor.notifierHote}
                    onChange={(e) => setNewVisitor({ ...newVisitor, notifierHote: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Envoyer une notification instantanée à l'hôte ("Votre visiteur est arrivé à l'accueil")
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newVisitor.estVip}
                    onChange={(e) => setNewVisitor({ ...newVisitor, estVip: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Visiteur VIP (Accueil protocolaire et badge doré)
                  </span>
                </label>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer l'Entrée & Activer Badge</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODALE 2 : Pré-enregistrement RDV VIP */}
      {showPreRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-500/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Pré-enregistrer une Visite / RDV VIP
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Facilitez l'accès rapide de vos invités de marque à l'accueil
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreRegisterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePreRegister} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom du Visiteur Attendu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Me Augustin Koffi (Avocat d'Affaires)"
                  value={preRegVisitor.nom}
                  onChange={(e) => setPreRegVisitor({ ...preRegVisitor, nom: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organisme / Fonction *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barreau de Côte d'Ivoire / Partenaire Stratégique"
                  value={preRegVisitor.societe}
                  onChange={(e) => setPreRegVisitor({ ...preRegVisitor, societe: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date Prévue
                  </label>
                  <input
                    type="text"
                    value={preRegVisitor.date}
                    onChange={(e) => setPreRegVisitor({ ...preRegVisitor, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Heure Prévue
                  </label>
                  <input
                    type="time"
                    value={preRegVisitor.heurePrevue}
                    onChange={(e) => setPreRegVisitor({ ...preRegVisitor, heurePrevue: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Collaborateur / Hôte
                </label>
                <select
                  value={preRegVisitor.collaborateur}
                  onChange={(e) => setPreRegVisitor({ ...preRegVisitor, collaborateur: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Jean-Marc Koffi (Directeur d'Agence Principale)">Jean-Marc Koffi (Directeur d'Agence Principale)</option>
                  <option value="Dr. Stéphane Touré (Directeur des Ressources Humaines)">Dr. Stéphane Touré (Directeur des RH)</option>
                  <option value="Julie Konan (Chargée de Clientèle Senior)">Julie Konan (Chargée de Clientèle Senior)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Motif du Rendez-vous
                </label>
                <input
                  type="text"
                  placeholder="Ex: Séance de travail Conseil d'Administration"
                  value={preRegVisitor.motif}
                  onChange={(e) => setPreRegVisitor({ ...preRegVisitor, motif: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPreRegisterModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Enregistrer l'Attente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE 3 : Pass Visiteur Temporaire Numérique & Imprimable */}
      {selectedVisitorForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {/* Header Modale */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Pass Visiteur Temporaire Sécurisé
                </h3>
              </div>
              <button
                onClick={() => setSelectedVisitorForPass(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps du Pass Visiteur (Stylé format badge pro) */}
            <div className="p-6">
              <div className="border-2 border-dashed border-blue-400/50 dark:border-blue-500/40 rounded-2xl p-5 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900 dark:to-slate-950 relative shadow-inner">
                
                {/* En-tête Badge */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
                      SII CÔTE D'IVOIRE
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      PASS ACCÈS TEMPORAIRE
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-black px-2 py-0.5 rounded bg-blue-600 text-white shadow-sm">
                      {selectedVisitorForPass.badgeNumber}
                    </span>
                  </div>
                </div>

                {/* QR Code de sécurité au centre */}
                <div className="my-5 flex flex-col items-center justify-center">
                  <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200">
                    {/* SVG QR Code vectoriel haute fidélité */}
                    <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      {/* Repères d'angle */}
                      <rect x="10" y="10" width="24" height="24" stroke="#0f172a" strokeWidth="4" fill="none" />
                      <rect x="16" y="16" width="12" height="12" fill="#0f172a" />
                      <rect x="66" y="10" width="24" height="24" stroke="#0f172a" strokeWidth="4" fill="none" />
                      <rect x="72" y="16" width="12" height="12" fill="#0f172a" />
                      <rect x="10" y="66" width="24" height="24" stroke="#0f172a" strokeWidth="4" fill="none" />
                      <rect x="16" y="72" width="12" height="12" fill="#0f172a" />
                      {/* Données matricielles simulées */}
                      <rect x="42" y="14" width="6" height="6" fill="#0f172a" />
                      <rect x="52" y="14" width="6" height="6" fill="#0f172a" />
                      <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
                      <rect x="48" y="34" width="6" height="6" fill="#0f172a" />
                      <rect x="14" y="44" width="6" height="6" fill="#0f172a" />
                      <rect x="24" y="48" width="6" height="6" fill="#0f172a" />
                      <rect x="36" y="44" width="8" height="8" fill="#2563eb" />
                      <rect x="54" y="44" width="6" height="6" fill="#0f172a" />
                      <rect x="66" y="44" width="6" height="6" fill="#0f172a" />
                      <rect x="76" y="48" width="8" height="6" fill="#0f172a" />
                      <rect x="44" y="60" width="6" height="8" fill="#0f172a" />
                      <rect x="56" y="64" width="6" height="6" fill="#0f172a" />
                      <rect x="44" y="76" width="6" height="6" fill="#0f172a" />
                      <rect x="54" y="76" width="6" height="6" fill="#0f172a" />
                      <rect x="74" y="68" width="10" height="6" fill="#0f172a" />
                      <rect x="66" y="80" width="8" height="8" fill="#0f172a" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-2">
                    ID: {selectedVisitorForPass.id} • VALIDE LE {selectedVisitorForPass.date}
                  </span>
                </div>

                {/* Données du Visiteur */}
                <div className="space-y-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Visiteur :</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedVisitorForPass.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Société :</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedVisitorForPass.societe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Hôte d'accueil :</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedVisitorForPass.collaborateur}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Site :</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedVisitorForPass.site}</span>
                  </div>
                </div>

                {/* Consignes de sécurité */}
                <div className="mt-4 p-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Lock className="w-3 h-3 text-blue-600" />
                    <span>Consignes de Sécurité :</span>
                  </div>
                  <div>• Ce badge doit être porté de manière visible durant toute la visite.</div>
                  <div>• Restitution obligatoire auprès de l'agent d'accueil avant départ.</div>
                </div>

              </div>

              {/* Bouton d'impression */}
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedVisitorForPass(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={triggerPrintPass}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Pass Visiteur</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default RegistreVisiteurs;
