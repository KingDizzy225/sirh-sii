import React, { useState } from 'react';
import { 
  Clock, CheckCircle2, AlertTriangle, ShieldAlert, UserCheck, 
  FileText, Search, Filter, Printer, Download, Eye, X, 
  UserPlus, Calendar, ChevronRight, Sparkles, Building, AlertCircle
} from 'lucide-react';

export function PeriodesEssai() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('TOUS'); // 'TOUS', 'CADRE', 'EMPLOYE', 'OUVRIER'
  const [filterStatus, setFilterStatus] = useState('TOUS'); // 'TOUS', 'URGENT', 'EN_COURS', 'CONFIRME'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState(null);

  // Liste des collaborateurs en période d'essai ou récemment confirmés
  const [trials, setTrials] = useState([
    {
      id: 1,
      matricule: 'EMP-0078',
      nom: 'Sarah Touré',
      poste: 'Assistante Commerciale Agence Marcory',
      categorie: 'Employé',
      dureeLegale: '1 mois',
      renouvelable: '1 fois maximum',
      dateDebut: '2026-08-28',
      dateFinEssai: '2026-09-28',
      joursRestants: 5,
      isRenouvele: false,
      manager: 'Patrick Bamba',
      statut: 'URGENT_DECISION', // URGENT_DECISION, EN_COURS, RENOUVELE, CONFIRME, ROMPU
      appreciationManager: 'Très bon relationnel client, rigueur à consolider sur les saisies d\'opérations.',
      tauxObjectifs: 82
    },
    {
      id: 2,
      matricule: 'EMP-0075',
      nom: 'Amadou Sanogo',
      poste: 'Ingénieur Développeur Fullstack',
      categorie: 'Cadre',
      dureeLegale: '3 mois',
      renouvelable: '1 fois maximum',
      dateDebut: '2026-07-10',
      dateFinEssai: '2026-10-10',
      joursRestants: 17,
      isRenouvele: false,
      manager: 'Daniel Kouamé (CTO)',
      statut: 'EN_COURS',
      appreciationManager: 'Excellente intégration technique, maîtrise rapide de la stack React / Prisma.',
      tauxObjectifs: 90
    },
    {
      id: 3,
      matricule: 'EMP-0081',
      nom: 'Viviane Yao',
      poste: 'Chargée d\'Accueil & Standard Siège Plateau',
      categorie: 'Employé',
      dureeLegale: '1 mois',
      renouvelable: '1 fois maximum',
      dateDebut: '2026-08-01',
      dateFinEssai: '2026-10-01',
      joursRestants: 8,
      isRenouvele: true,
      manager: 'Jean-Marc Koffi',
      statut: 'RENOUVELE',
      appreciationManager: 'Ponctualité exemplaire, période d\'essai renouvelée pour confirmer l\'autonomie sur les réclamations complexes.',
      tauxObjectifs: 78
    },
    {
      id: 4,
      matricule: 'EMP-0072',
      nom: 'Stéphane Boli',
      poste: 'Superviseur Logistique & Quai',
      categorie: 'Cadre',
      dureeLegale: '3 mois',
      renouvelable: '1 fois maximum',
      dateDebut: '2026-08-15',
      dateFinEssai: '2026-11-15',
      joursRestants: 53,
      isRenouvele: false,
      manager: 'Moussa Diabaté (HSE)',
      statut: 'EN_COURS',
      appreciationManager: 'Leadership naturel sur les équipes de manutention de San Pedro.',
      tauxObjectifs: 85
    },
    {
      id: 5,
      matricule: 'EMP-0018',
      nom: 'Julie Konan',
      poste: 'Chargée de Clientèle Entreprises',
      categorie: 'Cadre',
      dureeLegale: '3 mois',
      renouvelable: '1 fois maximum',
      dateDebut: '2021-01-15',
      dateFinEssai: '2021-04-15',
      joursRestants: 0,
      isRenouvele: false,
      manager: 'Jean-Marc Koffi',
      statut: 'CONFIRME',
      appreciationManager: 'Titularisée avec les félicitations du jury. Candidate exceptionnelle.',
      tauxObjectifs: 98
    }
  ]);

  // Formulaire de décision managériale
  const [decisionData, setDecisionData] = useState({
    type: 'CONFIRMATION', // 'CONFIRMATION', 'RENOUVELLEMENT', 'RUPTURE'
    motifRenouvellement: 'Poursuite de la montée en compétences sur le portefeuille grands comptes',
    nouvelleEcheance: '2026-11-28',
    commentaire: 'Objectifs d\'intégration largement dépassés.'
  });

  const handleOpenDecision = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDecisionModal(true);
  };

  const handleApplyDecision = (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    let updatedStatut = 'CONFIRME';
    let letterTitle = '';
    let letterContent = '';

    if (decisionData.type === 'CONFIRMATION') {
      updatedStatut = 'CONFIRME';
      letterTitle = 'LETTRE DE CONFIRMATION DANS L\'EMPLOI (TITULARISATION EN CDI)';
      letterContent = `Nous avons le plaisir de vous informer que votre période d'essai au poste de ${selectedCandidate.poste}, débutée le ${selectedCandidate.dateDebut}, a donné entière satisfaction à la Direction. Par conséquent, nous vous confirmons formellement dans votre emploi en Contrat à Durée Indéterminée (CDI), aux conditions salariales et contractuelles initialement convenues.`;
    } else if (decisionData.type === 'RENOUVELLEMENT') {
      updatedStatut = 'RENOUVELE';
      letterTitle = 'AVENANT DE RENOUVELLEMENT DE PÉRIODE D\'ESSAI';
      letterContent = `Conformément à l'Article 14.1 du Code du Travail de Côte d'Ivoire et aux stipulations de votre contrat, la Direction et vous-même convenez de proroger votre période d'essai jusqu'au ${decisionData.nouvelleEcheance}. Ce renouvellement a pour objet : ${decisionData.motifRenouvellement}. L'accord express du salarié est requis par signature du présent avenant.`;
    } else {
      updatedStatut = 'ROMPU';
      letterTitle = 'NOTIFICATION DE FIN DE PÉRIODE D\'ESSAI';
      letterContent = `Nous vous informons par la présente de la décision de notre société de mettre fin à votre période d'essai au poste de ${selectedCandidate.poste}. Conformément aux dispositions légales en vigueur, votre contrat prendra fin à l'issue du délai de prévenance légal. Votre solde de tout compte et vos documents de fin de contrat seront tenus à votre disposition.`;
    }

    setTrials(trials.map(t => {
      if (t.id === selectedCandidate.id) {
        return {
          ...t,
          statut: updatedStatut,
          joursRestants: decisionData.type === 'RENOUVELLEMENT' ? 30 : 0,
          isRenouvele: decisionData.type === 'RENOUVELLEMENT' ? true : t.isRenouvele
        };
      }
      return t;
    }));

    setGeneratedLetter({
      title: letterTitle,
      candidate: selectedCandidate,
      content: letterContent,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    });

    setShowDecisionModal(false);
    setShowLetterModal(true);
  };

  // KPIs
  const totalEnCours = trials.filter(t => t.statut === 'EN_COURS' || t.statut === 'URGENT_DECISION' || t.statut === 'RENOUVELE').length;
  const alertesUrgentes = trials.filter(t => t.joursRestants > 0 && t.joursRestants <= 15).length;
  const totalConfirmes = trials.filter(t => t.statut === 'CONFIRME').length;
  const tauxConfirmation = Math.round((totalConfirmes / trials.length) * 100);

  // Filtrage
  const filteredTrials = trials.filter(t => {
    const matchSearch = t.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === 'TOUS' || t.categorie === filterCategory;
    const matchStatus = filterStatus === 'TOUS' || 
                        (filterStatus === 'URGENT' && t.joursRestants > 0 && t.joursRestants <= 15) ||
                        (filterStatus === 'EN_COURS' && (t.statut === 'EN_COURS' || t.statut === 'RENOUVELE')) ||
                        (filterStatus === 'CONFIRME' && t.statut === 'CONFIRME');
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Suivi des Périodes d'Essai & Titularisations
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Respect des délais légaux d'essai (Code du Travail CI, Art. 14.1), bilans managériaux et prévention du risque de requalification tacite
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <FileText className="w-3.5 h-3.5" /> Réglementation Légale CI Intégrée
          </span>
        </div>
      </div>

      {/* Rappel des Seuils Légaux en Côte d'Ivoire */}
      <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Barème Légal d'Essai (Art. 14.1) :</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
            <strong>Cadres :</strong> 3 mois (renouvelable 1 fois)
          </span>
          <span className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
            <strong>Employés & Maîtrise :</strong> 1 mois (renouvelable 1 fois)
          </span>
          <span className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
            <strong>Ouvriers :</strong> 8 jours (renouvelable 1 fois)
          </span>
        </div>
        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
          ⚠️ Sans décision avant terme = CDI tacite irrévocable
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Essais en Cours
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalEnCours}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recrues récentes en observation</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alertes Critiques (&lt; 15 jours)
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{alertesUrgentes}</p>
          <p className="text-xs text-rose-500 font-medium mt-1">Décision managériale requise d'urgence</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Titularisations CDI (Trimestre)
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{totalConfirmes}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Salariés confirmés définitivement</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Taux de Confirmation
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">{tauxConfirmation}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Efficacité du sourcing et onboarding</p>
        </div>
      </div>

      {/* Recherche et Filtres */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, poste ou matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="TOUS">Toutes les Catégories</option>
            <option value="Cadre">Cadres (3 mois)</option>
            <option value="Employé">Employés & Maîtrise (1 mois)</option>
            <option value="Ouvrier">Ouvriers (8 jours)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="TOUS">Tous les Statuts</option>
            <option value="URGENT">⚠️ Alertes Urgentes (&lt; 15 jours)</option>
            <option value="EN_COURS">En cours d'essai</option>
            <option value="CONFIRME">✅ Confirmés en CDI</option>
          </select>
        </div>
      </div>

      {/* Liste des Périodes d'Essai */}
      <div className="space-y-3">
        {filteredTrials.map((trial) => {
          const isUrgent = trial.joursRestants > 0 && trial.joursRestants <= 15;
          const isConfirmed = trial.statut === 'CONFIRME';

          return (
            <div
              key={trial.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border p-5 transition shadow-sm space-y-4 ${
                isUrgent
                  ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-900/40'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    isConfirmed
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : isUrgent
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {trial.nom.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{trial.nom}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                        {trial.matricule}
                      </span>
                      {trial.nom === 'Julie Konan' && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded font-medium">
                          Titularisée
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {trial.poste} • Catégorie : <strong>{trial.categorie}</strong> (Durée légale : {trial.dureeLegale})
                    </p>
                  </div>
                </div>

                {/* Badge d'échéance et compte à rebours */}
                <div className="flex flex-wrap items-center gap-3">
                  {isConfirmed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Titularisation Validée en CDI
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Fin de période d'essai :</span>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {trial.dateFinEssai}
                        </span>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse border border-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        J-{trial.joursRestants} restant{trial.joursRestants > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Évaluation & Détails */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2 p-3 bg-slate-50 dark:bg-slate-850 rounded-lg space-y-1">
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-700 dark:text-slate-200">Avis Manager ({trial.manager}) :</strong> {trial.appreciationManager}
                  </p>
                  <p className="text-slate-400 text-[11px] pt-1">
                    Statut du renouvellement : {trial.isRenouvele ? 'Prorogé 1 fois (renouvellement max atteint)' : 'Jamais renouvelé (renouvellement possible)'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500 font-medium">Atteinte des objectifs :</span>
                    <span className="font-bold text-slate-900 dark:text-white">{trial.tauxObjectifs}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        trial.tauxObjectifs >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${trial.tauxObjectifs}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bouton d'action */}
              {!isConfirmed && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleOpenDecision(trial)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 ${
                      isUrgent
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Statuer sur l'Essai (Confirmer / Renouveler / Rompre)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Décision Managériale */}
      {showDecisionModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Décision sur Période d'Essai - {selectedCandidate.nom}
              </h3>
              <button onClick={() => setShowDecisionModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyDecision} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <p><strong>Poste :</strong> {selectedCandidate.poste}</p>
                <p><strong>Catégorie légale :</strong> {selectedCandidate.categorie} ({selectedCandidate.dureeLegale})</p>
                <p><strong>Échéance actuelle :</strong> {selectedCandidate.dateFinEssai} (dans {selectedCandidate.joursRestants} jours)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Décision de la Direction & du Manager
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="decisionType"
                      value="CONFIRMATION"
                      checked={decisionData.type === 'CONFIRMATION'}
                      onChange={() => setDecisionData({ ...decisionData, type: 'CONFIRMATION' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                        ✅ Titulariser en Contrat CDI Définitif
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        L'essai est validé avec succès. Génération de la lettre officielle de confirmation.
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs ${
                    selectedCandidate.isRenouvele ? 'opacity-50 pointer-events-none' : ''
                  }`}>
                    <input
                      type="radio"
                      name="decisionType"
                      value="RENOUVELLEMENT"
                      disabled={selectedCandidate.isRenouvele}
                      checked={decisionData.type === 'RENOUVELLEMENT'}
                      onChange={() => setDecisionData({ ...decisionData, type: 'RENOUVELLEMENT' })}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <span className="font-bold text-amber-600 dark:text-amber-400 block">
                        ⏳ Renouveler la Période d'Essai (Prorogation Légale)
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {selectedCandidate.isRenouvele 
                          ? "Impossible : le renouvellement légal unique a déjà été consommé."
                          : "Prorogation d'une durée équivalente avec signature d'un avenant obligatoire."}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="decisionType"
                      value="RUPTURE"
                      checked={decisionData.type === 'RUPTURE'}
                      onChange={() => setDecisionData({ ...decisionData, type: 'RUPTURE' })}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="font-bold text-rose-600 dark:text-rose-400 block">
                        🛑 Mettre fin à la Période d'Essai (Rupture)
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Fin de contrat sans indemnité de licenciement, avec respect du préavis de prévenance.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {decisionData.type === 'RENOUVELLEMENT' && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nouvelle date d'échéance de l'essai
                    </label>
                    <input
                      type="date"
                      required
                      value={decisionData.nouvelleEcheance}
                      onChange={(e) => setDecisionData({ ...decisionData, nouvelleEcheance: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Motif du renouvellement (exigé pour l'avenant)
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={decisionData.motifRenouvellement}
                      onChange={(e) => setDecisionData({ ...decisionData, motifRenouvellement: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Valider & Générer le Courrier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Prévisualisation du Courrier Officiel */}
      {showLetterModal && generatedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Document Officiel Généré
                </h3>
              </div>
              <button onClick={() => setShowLetterModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 font-serif text-xs space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-3 font-sans">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">SOCIÉTÉ IVOIRIENNE D'INVESTISSEMENT (SII CI)</p>
                  <p className="text-[10px] text-slate-500">Direction des Ressources Humaines • Abidjan Plateau</p>
                </div>
                <p className="text-[11px] text-slate-500">Date : {generatedLetter.date}</p>
              </div>

              <div className="font-sans">
                <p><strong>Destinataire :</strong> {generatedLetter.candidate.nom} ({generatedLetter.candidate.matricule})</p>
                <p><strong>Poste :</strong> {generatedLetter.candidate.poste}</p>
              </div>

              <div className="text-center py-2 font-sans">
                <h4 className="font-black underline uppercase text-sm text-slate-900 dark:text-white">
                  {generatedLetter.title}
                </h4>
              </div>

              <p className="leading-relaxed text-slate-800 dark:text-slate-200">
                {generatedLetter.content}
              </p>

              <div className="flex justify-between items-end pt-8 font-sans text-xs">
                <div>
                  <p className="font-bold">Pour Accord le Salarié :</p>
                  <p className="text-[10px] text-slate-400">(Date et signature précédées de la mention "Lu et approuvé")</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Pour la Direction Générale :</p>
                  <p className="text-[11px] text-slate-500">Le Directeur des Ressources Humaines</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Imprimer le Document Juridique
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
