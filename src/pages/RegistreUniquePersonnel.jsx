import React, { useState } from 'react';
import { 
  BookCheck, ShieldCheck, Download, Printer, Search, 
  Filter, Plus, UserCheck, UserMinus, Building2, 
  FileText, Calendar, CheckCircle2, AlertCircle, X, Eye
} from 'lucide-react';

export function RegistreUniquePersonnel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOUS'); // 'TOUS', 'EN_FONCTION', 'SORTI'
  const [contractFilter, setContractFilter] = useState('TOUS'); // 'TOUS', 'CDI', 'CDD', 'STAGE'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Données du Registre Unique (chronologique)
  const [registre, setRegistre] = useState([]);

  // Formulaire d'ajout
  const [newEntry, setNewEntry] = useState({
    nom: '',
    sexe: 'M',
    dateNaissance: '',
    nationalite: 'Ivoirienne',
    emploi: '',
    categorieCCNI: 'Cadre (Catégorie C1)',
    salaireBase: 400000,
    dateEntree: new Date().toISOString().split('T')[0],
    typeContrat: 'CDI',
    numeroCNPS: ''
  });

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!newEntry.nom || !newEntry.emploi) return;

    const nextOrderNum = String(registre.length + 1).padStart(3, '0');
    const nextMatricule = `EMP-00${registre.length + 80}`;

    const newRecord = {
      numOrdre: nextOrderNum,
      matricule: nextMatricule,
      nom: newEntry.nom,
      sexe: newEntry.sexe,
      dateNaissance: newEntry.dateNaissance,
      nationalite: newEntry.nationalite,
      emploi: newEntry.emploi,
      categorieCCNI: newEntry.categorieCCNI,
      salaireBase: Number(newEntry.salaireBase),
      dateEntree: newEntry.dateEntree,
      typeContrat: newEntry.typeContrat,
      numeroCNPS: newEntry.numeroCNPS || 'En cours d\'immatriculation',
      dateSortie: '-',
      motifSortie: 'En fonction',
      statut: 'EN_FONCTION'
    };

    setRegistre([...registre, newRecord]);
    setShowAddModal(false);
  };

  // KPIs
  const totalInscrits = registre.length;
  const effectifActif = registre.filter(r => r.statut === 'EN_FONCTION').length;
  const totalSortis = registre.filter(r => r.statut === 'SORTI').length;
  const cdiActifs = registre.filter(r => r.statut === 'EN_FONCTION' && r.typeContrat === 'CDI').length;

  // Filtrage
  const filteredRegistre = registre.filter(r => {
    const matchSearch = r.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.emploi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.numOrdre.includes(searchTerm);
    const matchStatus = statusFilter === 'TOUS' || r.statut === statusFilter;
    const matchContract = contractFilter === 'TOUS' || r.typeContrat === contractFilter;
    return matchSearch && matchStatus && matchContract;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-700 text-white rounded-lg shadow-sm">
              <BookCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Registre Unique du Personnel & Entrées/Sorties
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Livre légal obligatoire (Code du Travail CI, Art. 93) • Numérotation chronologique inaltérable et paraphage officiel
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInspectionModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Visa & Contrôle Inspection
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Inscrire un Salarié au Registre
          </button>
        </div>
      </div>

      {/* Rappel Juridique Important */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-4 rounded-xl flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Obligation Légale du Code du Travail de Côte d'Ivoire (Article 93) :</p>
          <p className="mt-0.5 text-blue-800 dark:text-blue-300">
            « Tout employeur doit tenir à jour, au siège de l'établissement, un Registre Unique du Personnel côté et paraphé par l'Inspecteur du Travail et des Lois Sociales. Les inscriptions doivent être faites par ordre chronologique sans blanc, ni rature, ni surcharge. »
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Inscrits au Registre
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <BookCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalInscrits}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Numéros d'ordre séquentiels attribués</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Salariés Actuellement Présents
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{effectifActif}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Contrats actifs en cours</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Salariés Sortis Définitivement
            </span>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
              <UserMinus className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-700 dark:text-slate-300 mt-2">{totalSortis}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Démissions, fins de CDD, retraites</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Effectifs CDI Actifs
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{cdiActifs}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Stabilité contractuelle de l'entreprise</p>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° d'ordre, nom, emploi, matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="TOUS">Tous les Statuts</option>
            <option value="EN_FONCTION">✅ En fonction (Actifs)</option>
            <option value="SORTI">🚪 Sortis définitivement</option>
          </select>

          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="TOUS">Tous les Contrats</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
          </select>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer le Registre
          </button>
        </div>
      </div>

      {/* Tableau Officiel du Registre Unique */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Registre Chronologique des Travailleurs (Livre des Entrées & Sorties)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conforme au modèle réglementaire fixé par arrêté ministériel (Rép. de Côte d'Ivoire)
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-slate-700 dark:text-slate-300">
            Paraphe : IT-ABJ-PLT-2026/049
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-3 text-center">N° Ordre</th>
                <th className="px-3 py-3">Matricule</th>
                <th className="px-4 py-3">Nom & Prénoms</th>
                <th className="px-3 py-3">Nationalité</th>
                <th className="px-4 py-3">Emploi & Catégorie CCNI</th>
                <th className="px-3 py-3">Date Entrée</th>
                <th className="px-3 py-3">Contrat</th>
                <th className="px-3 py-3 text-right">Salaire Base</th>
                <th className="px-4 py-3">Sortie & Motif Légal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRegistre.map((r) => {
                const isSorti = r.statut === 'SORTI';

                return (
                  <tr 
                    key={r.numOrdre} 
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition ${
                      isSorti ? 'bg-slate-50/40 dark:bg-slate-850/40 text-slate-400' : ''
                    }`}
                  >
                    <td className="px-3 py-3 font-mono font-bold text-center text-blue-700 dark:text-blue-400">
                      {r.numOrdre}
                    </td>
                    <td className="px-3 py-3 font-mono">{r.matricule}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {r.nom}
                    </td>
                    <td className="px-3 py-3">{r.nationalite}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{r.emploi}</p>
                      <p className="text-[10px] text-slate-400">{r.categorieCCNI}</p>
                    </td>
                    <td className="px-3 py-3 font-mono">{r.dateEntree}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.typeContrat === 'CDI' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {r.typeContrat}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold">
                      {(r.salaireBase).toLocaleString('fr-FR')} F
                    </td>
                    <td className="px-4 py-3">
                      {isSorti ? (
                        <div>
                          <span className="text-rose-600 dark:text-rose-400 font-bold block text-[11px]">
                            Sorti le {r.dateSortie}
                          </span>
                          <span className="text-[10px] text-slate-400">{r.motifSortie}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> En fonction
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inscription au Registre */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-700" />
                Inscrire un Collaborateur au Registre Unique
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom Complet du Travailleur
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Kouamé N'Guessan Charles..."
                  value={newEntry.nom}
                  onChange={(e) => setNewEntry({ ...newEntry, nom: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nationalité
                  </label>
                  <input
                    type="text"
                    value={newEntry.nationalite}
                    onChange={(e) => setNewEntry({ ...newEntry, nationalite: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type de Contrat
                  </label>
                  <select
                    value={newEntry.typeContrat}
                    onChange={(e) => setNewEntry({ ...newEntry, typeContrat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="CDI">CDI (Indéterminée)</option>
                    <option value="CDD">CDD (Déterminée)</option>
                    <option value="STAGE">Stage Professionnel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emploi / Fonction
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chef d'Agence, Comptable, Développeur..."
                  value={newEntry.emploi}
                  onChange={(e) => setNewEntry({ ...newEntry, emploi: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Classification CCNI
                  </label>
                  <select
                    value={newEntry.categorieCCNI}
                    onChange={(e) => setNewEntry({ ...newEntry, categorieCCNI: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Cadre Supérieur (Catégorie C3)">Cadre Supérieur (C3)</option>
                    <option value="Cadre Moyen (Catégorie C2)">Cadre Moyen (C2)</option>
                    <option value="Cadre Junior (Catégorie C1)">Cadre Junior (C1)</option>
                    <option value="Agent de Maîtrise (Catégorie M1)">Agent de Maîtrise (M1)</option>
                    <option value="Employé Qualifié (Catégorie E3)">Employé Qualifié (E3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Salaire de Base d'Embauche
                  </label>
                  <input
                    type="number"
                    value={newEntry.salaireBase}
                    onChange={(e) => setNewEntry({ ...newEntry, salaireBase: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Inscrire Chronologiquement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visa & Contrôle Inspection */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Certificat de Conformité - Inspection du Travail
              </h3>
              <button onClick={() => setShowInspectionModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs text-slate-700 dark:text-slate-300 font-serif">
              <p><strong>Établissement :</strong> Société Ivoirienne d'Investissement (SII CI S.A.)</p>
              <p><strong>Circonscription :</strong> Inspection du Travail et des Lois Sociales du Plateau (Abidjan)</p>
              <p><strong>Statut du Registre :</strong> Côté et Paraphé sous le N° <strong>IT-ABJ-PLT-2026/049</strong></p>
              <p><strong>Nombre total de feuillets :</strong> 200 pages numérotées</p>
              <p className="pt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-sans font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Aucun manquement d'inscription constaté. Registre conforme aux exigences de l'Art. 93.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  window.print();
                  setShowInspectionModal(false);
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Exporter le Registre Officiel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
