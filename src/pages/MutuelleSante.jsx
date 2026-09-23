import React, { useState } from 'react';
import { 
  HeartHandshake, Users, ShieldCheck, Heart, UserPlus, 
  Search, Filter, Download, Plus, FileText, AlertTriangle, 
  CheckCircle2, X, Baby, Stethoscope, Eye, Calendar, Sparkles, Building
} from 'lucide-react';

export function MutuelleSante() {
  const [activeTab, setActiveTab] = useState('AFFILIES'); // 'AFFILIES', 'MOUVEMENTS', 'PLAFONDS'
  const [searchTerm, setSearchTerm] = useState('');
  const [insurerFilter, setInsurerFilter] = useState('TOUS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Données des salariés affiliés
  const [affilies, setAffilies] = useState([
    {
      id: 1,
      matricule: "EMP-0012",
      nom: "Jean-Marc Koffi",
      poste: "Directeur d'Agence Plateau",
      agence: "Abidjan Plateau",
      assureur: "Ascoma CI",
      numeroPolice: "POL-ASC-88492",
      formule: "Cadre Supérieur (100%)",
      statutCMU: "Immatriculé (N° 100294821)",
      primeMensuelle: 45000,
      ayantsDroit: [
        { id: 101, nom: "Koffi Akissi Béatrice", lien: "Conjoint(e)", dateNaissance: "1984-05-12", statutPieces: "Conforme" },
        { id: 102, nom: "Koffi Marc-Aurel", lien: "Enfant", dateNaissance: "2012-08-20", statutPieces: "Conforme" },
        { id: 103, nom: "Koffi Marie-Ange", lien: "Enfant", dateNaissance: "2016-11-04", statutPieces: "Conforme" }
      ],
      consommationAnnuelle: {
        pharmacie: 65, // %
        optique: 90,   // % alerte
        dentaire: 40,  // %
        hospitalisation: 15 // %
      }
    },
    {
      id: 2,
      matricule: "EMP-0018",
      nom: "Julie Konan",
      poste: "Chargée de Clientèle Entreprises",
      agence: "Abidjan Plateau",
      assureur: "Ascoma CI",
      numeroPolice: "POL-ASC-88493",
      formule: "Agent de Maîtrise (80%)",
      statutCMU: "Immatriculé (N° 100482910)",
      primeMensuelle: 32000,
      ayantsDroit: [
        { id: 201, nom: "Konan Yannick Junior", lien: "Enfant", dateNaissance: "2019-03-15", statutPieces: "Conforme" }
      ],
      consommationAnnuelle: {
        pharmacie: 45,
        optique: 20,
        dentaire: 35,
        hospitalisation: 0
      }
    },
    {
      id: 3,
      matricule: "EMP-0025",
      nom: "Armand Kouassi",
      poste: "Comptable Fournisseurs",
      agence: "Abidjan Marcory",
      assureur: "Gras Savoye / WTW",
      numeroPolice: "POL-GS-49102",
      formule: "Agent de Maîtrise (80%)",
      statutCMU: "Immatriculé (N° 100938472)",
      primeMensuelle: 32000,
      ayantsDroit: [
        { id: 301, nom: "Kouassi Marie-Paule", lien: "Conjoint(e)", dateNaissance: "1991-09-02", statutPieces: "Conforme" },
        { id: 302, nom: "Kouassi David", lien: "Enfant", dateNaissance: "2021-01-10", statutPieces: "Extrait requis" }
      ],
      consommationAnnuelle: {
        pharmacie: 85,
        optique: 50,
        dentaire: 70,
        hospitalisation: 30
      }
    },
    {
      id: 4,
      matricule: "EMP-0034",
      nom: "Aïcha Ouattara",
      poste: "Responsable Paie & Fiscalité Sociale",
      agence: "Siège Social",
      assureur: "Ascoma CI",
      numeroPolice: "POL-ASC-88494",
      formule: "Cadre (100%)",
      statutCMU: "Immatriculé (N° 100128475)",
      primeMensuelle: 40000,
      ayantsDroit: [
        { id: 401, nom: "Ouattara Inès", lien: "Enfant", dateNaissance: "2015-06-25", statutPieces: "Conforme" },
        { id: 402, nom: "Ouattara Cheick", lien: "Enfant", dateNaissance: "2018-12-14", statutPieces: "Conforme" }
      ],
      consommationAnnuelle: {
        pharmacie: 30,
        optique: 88,
        dentaire: 25,
        hospitalisation: 0
      }
    },
    {
      id: 5,
      matricule: "EMP-0041",
      nom: "Moussa Diabaté",
      poste: "Responsable HSE",
      agence: "San Pedro Port",
      assureur: "NSIA Assurances",
      numeroPolice: "POL-NSIA-1029",
      formule: "Cadre (100%)",
      statutCMU: "En cours d'enrôlement",
      primeMensuelle: 40000,
      ayantsDroit: [
        { id: 501, nom: "Diabaté Fatoumata", lien: "Conjoint(e)", dateNaissance: "1988-02-18", statutPieces: "Conforme" }
      ],
      consommationAnnuelle: {
        pharmacie: 40,
        optique: 10,
        dentaire: 15,
        hospitalisation: 0
      }
    }
  ]);

  // Mouvements mensuels récents (incorporations & radiations)
  const [mouvements, setMouvements] = useState([
    {
      id: 1,
      date: "2026-09-15",
      type: "INCORPORATION",
      collaborateur: "Julie Konan",
      beneficiaire: "Nouveau-né (Konan Liam)",
      lien: "Enfant",
      assureur: "Ascoma CI",
      statut: "Transmis à la compagnie"
    },
    {
      id: 2,
      date: "2026-09-02",
      type: "INCORPORATION",
      collaborateur: "Moussa Diabaté",
      beneficiaire: "Diabaté Fatoumata",
      lien: "Conjoint(e)",
      assureur: "NSIA Assurances",
      statut: "Validé - Carte émise"
    },
    {
      id: 3,
      date: "2026-08-28",
      type: "RADIATION",
      collaborateur: "Kouadio Michel (Démissionnaire)",
      beneficiaire: "Salarié + 2 ayants droit",
      lien: "Famille complète",
      assureur: "Ascoma CI",
      statut: "Cartes désactivées"
    }
  ]);

  // Formulaire d'ajout d'ayant droit
  const [newAyantDroit, setNewAyantDroit] = useState({
    affilieId: 2, // Julie Konan par défaut
    nom: '',
    lien: 'Enfant',
    dateNaissance: '',
    certificatScolarite: false
  });

  const handleAddAyantDroit = (e) => {
    e.preventDefault();
    if (!newAyantDroit.nom || !newAyantDroit.dateNaissance) return;

    setAffilies(affilies.map(a => {
      if (a.id === Number(newAyantDroit.affilieId)) {
        return {
          ...a,
          ayantsDroit: [
            ...a.ayantsDroit,
            {
              id: Date.now(),
              nom: newAyantDroit.nom,
              lien: newAyantDroit.lien,
              dateNaissance: newAyantDroit.dateNaissance,
              statutPieces: "En cours de validation"
            }
          ]
        };
      }
      return a;
    }));

    // Enregistrer également dans le journal des mouvements
    const targetEmp = affilies.find(a => a.id === Number(newAyantDroit.affilieId));
    setMouvements([
      {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: "INCORPORATION",
        collaborateur: targetEmp?.nom || "Salarié",
        beneficiaire: newAyantDroit.nom,
        lien: newAyantDroit.lien,
        assureur: targetEmp?.assureur || "Ascoma CI",
        statut: "En attente transmission bordereau"
      },
      ...mouvements
    ]);

    setNewAyantDroit({
      affilieId: 2,
      nom: '',
      lien: 'Enfant',
      dateNaissance: '',
      certificatScolarite: false
    });
    setShowAddModal(false);
  };

  // Statistiques
  const totalSalariesAssures = affilies.length;
  const totalAyantsDroit = affilies.reduce((acc, a) => acc + a.ayantsDroit.length, 0);
  const totalPersonnesCouvertes = totalSalariesAssures + totalAyantsDroit;
  const totalCotisationMensuelle = affilies.reduce((acc, a) => acc + a.primeMensuelle, 0);

  // Filtrage
  const filteredAffilies = affilies.filter(a => {
    const matchSearch = a.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.poste.toLowerCase().includes(searchTerm.toLowerCase());
    const matchInsurer = insurerFilter === 'TOUS' || a.assureur === insurerFilter;
    return matchSearch && matchInsurer;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-600 text-white rounded-lg shadow-sm">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Mutuelle Santé Privée & Ayants Droit
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gestion des polices santé d'entreprise (Ascoma, Gras Savoye, NSIA), coordination CMU et suivi des consommations
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Fiche Navette Mensuelle
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Rattacher un Ayant Droit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Salariés Adhérents
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalSalariesAssures}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">100% des CDI & CDD éligibles</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ayants Droit Déclarés
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Baby className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{totalAyantsDroit}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Conjoints et enfants à charge (-21 ans)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Vies Protégées au Total
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{totalPersonnesCouvertes}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Couverture santé active</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cotisation Mensuelle Mutuelle
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {(totalCotisationMensuelle).toLocaleString('fr-FR')} <span className="text-sm font-semibold">FCFA</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Part patronale 70% / Part salariale 30%</p>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('AFFILIES')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
            activeTab === 'AFFILIES'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Fichier des Affiliés & Familles ({affilies.length})
        </button>

        <button
          onClick={() => setActiveTab('MOUVEMENTS')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
            activeTab === 'MOUVEMENTS'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Journal des Mouvements (Entrées/Sorties)
        </button>

        <button
          onClick={() => setActiveTab('PLAFONDS')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
            activeTab === 'PLAFONDS'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Suivi des Plafonds & Consommations
        </button>
      </div>

      {/* ONGLET 1 : FICHIER DES AFFILIÉS */}
      {activeTab === 'AFFILIES' && (
        <div className="space-y-4">
          {/* Filtres & Recherche */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule ou agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={insurerFilter}
                onChange={(e) => setInsurerFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="TOUS">Toutes les Compagnies d'Assurance</option>
                <option value="Ascoma CI">Ascoma CI</option>
                <option value="Gras Savoye / WTW">Gras Savoye / WTW</option>
                <option value="NSIA Assurances">NSIA Assurances</option>
              </select>
            </div>
          </div>

          {/* Liste des affiliés */}
          <div className="space-y-3">
            {filteredAffilies.map((affilie) => (
              <div 
                key={affilie.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {affilie.nom.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{affilie.nom}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {affilie.matricule}
                        </span>
                        {affilie.nom === "Julie Konan" && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.2 rounded font-medium">
                            Profil Vitrine
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {affilie.poste} • {affilie.agence}
                      </p>
                    </div>
                  </div>

                  {/* Badges contrat & CMU */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800">
                      {affilie.assureur} ({affilie.formule})
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {affilie.statutCMU}
                    </span>
                  </div>
                </div>

                {/* Section Ayants Droit rattachés */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Ayants Droit Rattachés ({affilie.ayantsDroit.length})
                    </span>
                    <button 
                      onClick={() => {
                        setNewAyantDroit(prev => ({ ...prev, affilieId: affilie.id }));
                        setShowAddModal(true);
                      }}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter un ayant droit
                    </button>
                  </div>

                  {affilie.ayantsDroit.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Aucun ayant droit enregistré pour ce collaborateur (Célibataire / Sans enfant).</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {affilie.ayantsDroit.map(ad => (
                        <div 
                          key={ad.id}
                          className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{ad.nom}</p>
                            <p className="text-slate-500 text-[11px]">{ad.lien} • Né(e) le {ad.dateNaissance}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            ad.statutPieces === 'Conforme'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {ad.statutPieces}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONGLET 2 : JOURNAL DES MOUVEMENTS (NAVETTE ASSUREUR) */}
      {activeTab === 'MOUVEMENTS' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Historique des Mouvements Mensuels (Bordereau Navette)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toutes les entrées (nouveaux embauchés, nouveau-nés, mariages) et sorties (démissions, départs) à communiquer à l'assureur
              </p>
            </div>
            <button 
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Exporter le bordereau du mois
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Collaborateur Titulaire</th>
                  <th className="px-4 py-3">Bénéficiaire & Lien</th>
                  <th className="px-4 py-3">Assureur</th>
                  <th className="px-4 py-3">Statut Traitement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mouvements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{m.date}</td>
                    <td className="px-4 py-3">
                      {m.type === 'INCORPORATION' ? (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          + Incorporation
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          - Radiation
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white text-xs">{m.collaborateur}</td>
                    <td className="px-4 py-3 text-xs">{m.beneficiaire} ({m.lien})</td>
                    <td className="px-4 py-3 text-xs font-medium">{m.assureur}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {m.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ONGLET 3 : SUIVI DES PLAFONDS & CONSOMMATIONS */}
      {activeTab === 'PLAFONDS' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <p className="font-bold">Surveillance des Sinistres & Risque de Surconsommation</p>
              <p className="mt-0.5">
                Les contrats d'assurance santé majorent la prime annuelle si le ratio Prestations / Cotisations dépasse 85%. Deux collaborateurs ont dépassé 85% de leur plafond sur le poste optique.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {affilies.map((a) => (
              <div key={a.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.nom}</h4>
                    <p className="text-xs text-slate-500">{a.assureur} • {a.formule}</p>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                    {a.numeroPolice}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Pharmacie (Plafond 600 000 FCFA) :</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{a.consommationAnnuelle.pharmacie}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-1.5 rounded-full ${a.consommationAnnuelle.pharmacie >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${a.consommationAnnuelle.pharmacie}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Optique / Lunetterie (Plafond 250 000 FCFA) :</span>
                      <span className={`font-bold ${a.consommationAnnuelle.optique >= 85 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                        {a.consommationAnnuelle.optique}% {a.consommationAnnuelle.optique >= 85 && '⚠️'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-1.5 rounded-full ${a.consommationAnnuelle.optique >= 85 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${a.consommationAnnuelle.optique}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Dentaire & Soins (Plafond 400 000 FCFA) :</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{a.consommationAnnuelle.dentaire}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${a.consommationAnnuelle.dentaire}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Ajout d'Ayant Droit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-600" />
                Rattacher un Ayant Droit (Mutuelle)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAyantDroit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Collaborateur Titulaire de l'Assurance
                </label>
                <select 
                  value={newAyantDroit.affilieId}
                  onChange={(e) => setNewAyantDroit({ ...newAyantDroit, affilieId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {affilies.map(a => (
                    <option key={a.id} value={a.id}>{a.nom} ({a.matricule} - {a.assureur})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom Complet de l'Ayant Droit
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Konan Liam, Kouassi Affoué..."
                  value={newAyantDroit.nom}
                  onChange={(e) => setNewAyantDroit({ ...newAyantDroit, nom: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lien de Parenté
                  </label>
                  <select 
                    value={newAyantDroit.lien}
                    onChange={(e) => setNewAyantDroit({ ...newAyantDroit, lien: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Enfant">Enfant (-21 ans)</option>
                    <option value="Conjoint(e)">Conjoint(e) légal(e)</option>
                    <option value="Enfant Étudiant">Enfant Étudiant (21-25 ans)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date de Naissance
                  </label>
                  <input 
                    type="date"
                    required
                    value={newAyantDroit.dateNaissance}
                    onChange={(e) => setNewAyantDroit({ ...newAyantDroit, dateNaissance: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Pièces justificatives obligatoires :</p>
                <p>• Enfant : Copie intégrale d'acte de naissance ou jugement supplétif.</p>
                <p>• Conjoint : Certificat de mariage légal (Code Civil Ivoirien).</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Enregistrer l'Affiliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Export Navette */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-rose-600" />
                Télécharger la Fiche Navette Compagnie d'Assurance
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Ce fichier récapitule toutes les incorporations et radiations du mois en cours pour mise à jour immédiate des primes et commande des cartes santé numérisées.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
              <p><strong>Période :</strong> Septembre 2026</p>
              <p><strong>Compagnie destinataire :</strong> Ascoma CI / WTW / NSIA</p>
              <p><strong>Total mouvements :</strong> {mouvements.length} opérations recensées</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => {
                  alert("Le fichier Excel bordereau_mutuelle_sante_septembre_2026.xlsx a été généré avec succès !");
                  setShowExportModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm inline-flex items-center gap-2"
              >
                Télécharger au format Excel (Bordereau Officiel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
