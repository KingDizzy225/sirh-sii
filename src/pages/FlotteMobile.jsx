import React, { useState } from 'react';
import { 
  PhoneCall, Smartphone, Wifi, ShieldCheck, Download, 
  Printer, Search, Filter, Plus, User, Building2, 
  CheckCircle2, AlertTriangle, AlertCircle, X, Eye
} from 'lucide-react';

export function FlotteMobile() {
  const [searchTerm, setSearchTerm] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('TOUS'); // 'TOUS', 'Orange CI', 'MTN CI', 'Moov Africa'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDechargeModal, setShowDechargeModal] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  // Inventaire des lignes de flotte
  const [flotte, setFlotte] = useState([
    {
      id: 1,
      collaborateur: "Julie Konan",
      matricule: "EMP-0018",
      poste: "Chargée de Clientèle Entreprises Senior",
      departement: "Réseau Agences",
      operateur: "Orange CI",
      numero: "+225 07 12 34 56 78",
      forfaitNom: "Flotte Pro Illimitée + 25 Go Data",
      coutMensuel: 25000,
      dataConso: 18,
      dataPlafond: 25,
      terminal: "iPhone 13 Pro 128 Go",
      imei: "354920192847102",
      dechargeSignee: true,
      dateRemise: "15 Janvier 2021"
    },
    {
      id: 2,
      collaborateur: "Jean-Marc Koffi",
      matricule: "EMP-0012",
      poste: "Directeur d'Agence Principale",
      departement: "Réseau Agences",
      operateur: "Orange CI",
      numero: "+225 07 08 20 44 12",
      forfaitNom: "Flotte Direction VIP + 50 Go Data",
      coutMensuel: 45000,
      dataConso: 32,
      dataPlafond: 50,
      terminal: "Samsung Galaxy S23 Ultra",
      imei: "359102948201948",
      dechargeSignee: true,
      dateRemise: "01 Mars 2017"
    },
    {
      id: 3,
      collaborateur: "Patrick Bamba",
      matricule: "EMP-0048",
      poste: "Chef d'Agence Adjoint (Marcory)",
      departement: "Réseau Agences",
      operateur: "MTN CI",
      numero: "+225 05 48 10 92 33",
      forfaitNom: "Flotte Pro Illimitée + 20 Go Data",
      coutMensuel: 20000,
      dataConso: 19.5, // alerte
      dataPlafond: 20,
      terminal: "Samsung Galaxy A54 5G",
      imei: "357281092847192",
      dechargeSignee: true,
      dateRemise: "10 Octobre 2023"
    },
    {
      id: 4,
      collaborateur: "Moussa Diabaté",
      matricule: "EMP-0041",
      poste: "Responsable HSE & Sécurité",
      departement: "Opérations San Pedro",
      operateur: "MTN CI",
      numero: "+225 05 77 34 20 90",
      forfaitNom: "Flotte Terrain 24/7 + 30 Go Data",
      coutMensuel: 30000,
      dataConso: 14,
      dataPlafond: 30,
      terminal: "Blackview Rugged Antichoc BV9300",
      imei: "351092837461928",
      dechargeSignee: true,
      dateRemise: "15 Juin 2020"
    },
    {
      id: 5,
      collaborateur: "Armand Kouassi",
      matricule: "EMP-0025",
      poste: "Comptable Fournisseurs",
      departement: "Direction Financière",
      operateur: "Moov Africa",
      numero: "+225 01 88 12 43 00",
      forfaitNom: "Flotte Standard Voix + 10 Go Data",
      coutMensuel: 15000,
      dataConso: 6,
      dataPlafond: 10,
      terminal: "Redmi Note 12",
      imei: "358291039482019",
      dechargeSignee: true,
      dateRemise: "10 Septembre 2022"
    }
  ]);

  // Formulaire d'affectation
  const [newLine, setNewLine] = useState({
    collaborateur: '',
    poste: '',
    departement: 'Réseau Agences',
    operateur: 'Orange CI',
    numero: '+225 07 ',
    forfaitNom: 'Flotte Pro Illimitée + 25 Go Data',
    coutMensuel: 25000,
    dataPlafond: 25,
    terminal: 'Samsung Galaxy A54',
    imei: ''
  });

  const handleAddLine = (e) => {
    e.preventDefault();
    if (!newLine.collaborateur || !newLine.numero) return;

    const record = {
      id: Date.now(),
      collaborateur: newLine.collaborateur,
      matricule: `EMP-00${Math.floor(60 + Math.random() * 30)}`,
      poste: newLine.poste || "Collaborateur",
      departement: newLine.departement,
      operateur: newLine.operateur,
      numero: newLine.numero,
      forfaitNom: newLine.forfaitNom,
      coutMensuel: Number(newLine.coutMensuel),
      dataConso: 0,
      dataPlafond: Number(newLine.dataPlafond),
      terminal: newLine.terminal,
      imei: newLine.imei || "Non renseigné",
      dechargeSignee: true,
      dateRemise: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    setFlotte([record, ...flotte]);
    setShowAddModal(false);
  };

  const handleOpenDecharge = (line) => {
    setSelectedLine(line);
    setShowDechargeModal(true);
  };

  // KPIs
  const totalLignes = flotte.length;
  const budgetMensuel = flotte.reduce((acc, f) => acc + f.coutMensuel, 0);
  const totalDataConso = flotte.reduce((acc, f) => acc + f.dataConso, 0);
  const totalDataPlafond = flotte.reduce((acc, f) => acc + f.dataPlafond, 0);
  const alertesHorsForfait = flotte.filter(f => (f.dataConso / f.dataPlafond) >= 0.9).length;

  // Filtrage
  const filteredFlotte = flotte.filter(f => {
    const matchSearch = f.collaborateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.numero.includes(searchTerm) ||
                        f.poste.toLowerCase().includes(searchTerm.toLowerCase());
    const matchOp = operatorFilter === 'TOUS' || f.operateur === operatorFilter;
    return matchSearch && matchOp;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-600 text-white rounded-lg shadow-sm">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Gestion de la Flotte Mobile, Puces SIM & Forfaits Pro
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Lignes télécoms d'entreprise (Orange CI, MTN, Moov) • Forfaits voix/data, terminaux et fiches de décharge
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Inventaire Télécom
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Affecter une Ligne Flotte
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Lignes Mobiles Actives
            </span>
            <div className="p-2 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalLignes}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Numéros de flotte attribués</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Budget Télécom Mensuel
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {(budgetMensuel).toLocaleString('fr-FR')} <span className="text-sm font-semibold">FCFA</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Abonnements flotte consolidés</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Consommation Data (Mois)
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Wifi className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {totalDataConso.toFixed(1)} <span className="text-sm text-slate-400 font-semibold">/ {totalDataPlafond} Go</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${(totalDataConso / totalDataPlafond) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alertes Proche Plafond
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{alertesHorsForfait}</p>
          <p className="text-xs text-rose-500 font-medium mt-1">Lignes consommant plus de 90% de leur quota</p>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, numéro ou terminal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="TOUS">Tous les Opérateurs</option>
            <option value="Orange CI">Orange Côte d'Ivoire</option>
            <option value="MTN CI">MTN Côte d'Ivoire</option>
            <option value="Moov Africa">Moov Africa CI</option>
          </select>
        </div>
      </div>

      {/* Liste des Lignes Mobiles */}
      <div className="space-y-3">
        {filteredFlotte.map((ligne) => {
          const ratioData = Math.round((ligne.dataConso / ligne.dataPlafond) * 100);
          const isAlerteData = ratioData >= 90;

          return (
            <div
              key={ligne.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm space-y-4 transition ${
                isAlerteData 
                  ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-900/40' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 flex items-center justify-center font-bold text-sm shrink-0">
                    {ligne.collaborateur.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{ligne.collaborateur}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                        {ligne.matricule}
                      </span>
                      {ligne.collaborateur === 'Julie Konan' && (
                        <span className="text-[10px] bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 px-1.5 py-0.2 rounded font-medium">
                          Flotte Commerciale
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {ligne.poste} • {ligne.departement}
                    </p>
                  </div>
                </div>

                {/* Opérateur & Numéro */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${
                    ligne.operateur === 'Orange CI'
                      ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200'
                      : ligne.operateur === 'MTN CI'
                      ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200'
                      : 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
                  }`}>
                    {ligne.operateur} : {ligne.numero}
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                    {(ligne.coutMensuel).toLocaleString('fr-FR')} F/mois
                  </span>
                </div>
              </div>

              {/* Détails Forfait, Data & Terminal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg space-y-1">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                    Formule & Forfait :
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{ligne.forfaitNom}</p>
                  <p className="text-[11px] text-slate-500">Appels intra-flotte gratuits illimités 24/7</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                      Conso Data Internet :
                    </span>
                    <span className={`font-bold ${isAlerteData ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      {ligne.dataConso} / {ligne.dataPlafond} Go ({ratioData}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        isAlerteData ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${ratioData}%` }}
                    />
                  </div>
                  {isAlerteData && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">⚠️ Risque de bascule hors-forfait</p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg space-y-1">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                    Smartphone Assigné :
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{ligne.terminal}</p>
                  <p className="text-[10px] text-slate-400 font-mono">IMEI : {ligne.imei}</p>
                </div>
              </div>

              {/* Actions de décharge */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Fiche de décharge signée le {ligne.dateRemise}
                </span>

                <button
                  onClick={() => handleOpenDecharge(ligne)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" /> Voir la Fiche de Décharge
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Affectation Nouvelle Ligne */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" />
                Affecter une Ligne Télécom de Flotte
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLine} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom du Collaborateur Bénéficiaire
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Kouassi Affoué, Bamba Marc..."
                  value={newLine.collaborateur}
                  onChange={(e) => setNewLine({ ...newLine, collaborateur: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Opérateur Télécom
                  </label>
                  <select
                    value={newLine.operateur}
                    onChange={(e) => setNewLine({ ...newLine, operateur: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Orange CI">Orange Côte d'Ivoire</option>
                    <option value="MTN CI">MTN Côte d'Ivoire</option>
                    <option value="Moov Africa">Moov Africa CI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="text"
                    required
                    value={newLine.numero}
                    onChange={(e) => setNewLine({ ...newLine, numero: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Modèle Smartphone Attribué
                  </label>
                  <input
                    type="text"
                    value={newLine.terminal}
                    onChange={(e) => setNewLine({ ...newLine, terminal: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enveloppe Data (Go/mois)
                  </label>
                  <input
                    type="number"
                    value={newLine.dataPlafond}
                    onChange={(e) => setNewLine({ ...newLine, dataPlafond: e.target.value })}
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
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Enregistrer & Générer Décharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fiche de Décharge Matériel & SIM */}
      {showDechargeModal && selectedLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                Fiche de Décharge & Attribution de Ligne Professionnelle
              </h3>
              <button onClick={() => setShowDechargeModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 font-serif text-xs space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-3 font-sans">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">SOCIÉTÉ IVOIRIENNE D'INVESTISSEMENT (SII CI)</p>
                  <p className="text-[10px] text-slate-500">Moyens Généraux & Direction des Ressources Humaines</p>
                </div>
                <p className="text-[11px] text-slate-500">Date de remise : {selectedLine.dateRemise}</p>
              </div>

              <div className="font-sans space-y-1">
                <p><strong>Bénéficiaire :</strong> {selectedLine.collaborateur} ({selectedLine.matricule})</p>
                <p><strong>Fonction :</strong> {selectedLine.poste} - {selectedLine.departement}</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 font-sans space-y-1 text-[11px]">
                <p><strong>Numéro attribué :</strong> {selectedLine.numero} ({selectedLine.operateur})</p>
                <p><strong>Formule :</strong> {selectedLine.forfaitNom}</p>
                <p><strong>Terminal :</strong> {selectedLine.terminal} (IMEI : {selectedLine.imei})</p>
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-[11px]">
                Le collaborateur soussigné reconnaît avoir reçu ce jour la carte SIM et le terminal décrits ci-dessus en parfait état de fonctionnement. Il s'engage à en faire un usage strictement professionnel, à préserver la confidentialité des données d'entreprise et à restituer l'ensemble du matériel sous 48 heures en cas de cessation de contrat.
              </p>

              <div className="flex justify-between items-end pt-6 font-sans text-xs border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold">Signature du Salarié :</p>
                  <p className="text-slate-400 text-[10px]">Mention "Bon pour accord et décharge"</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Pour la Direction :</p>
                  <p className="text-slate-500 text-[11px]">Le Responsable des Moyens Généraux</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Imprimer la Fiche de Décharge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
