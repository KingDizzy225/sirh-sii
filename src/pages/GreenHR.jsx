import React, { useState } from 'react';
import {
  Leaf, Car, Zap, Award, Users, TrendingDown,
  Calendar, CheckCircle2, Plus, Search, Filter,
  Building, MapPin, X, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';

export function GreenHR() {
  const [activeTab, setActiveTab] = useState('bilan'); // 'bilan', 'covoiturage', 'challenges'
  const [showAddRideModal, setShowAddRideModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Trajets de covoiturage interne proposés entre collègues
  const [covoiturages, setCovoiturages] = useState([]);

  // Challenges d'agences
  const [challenges, setChallenges] = useState([
    {
      titre: "Opération Zéro Papier & Signatures Électroniques",
      description: "Élimination des impressions de documents internes au profit de la signature électronique validée.",
      scoreAgence: "92% digitalisé",
      gain: "14 arbres sauvés ce trimestre",
      statut: "EN_COURS"
    },
    {
      titre: "Éco-Climatisation à 24°C & Extinction Nocturne",
      description: "Régulation des thermostats des climatiseurs et coupure automatisée des unités après 19h.",
      scoreAgence: "-18% de consommation CIE",
      gain: "1 450 000 FCFA d'énergie économisée",
      statut: "EN_COURS"
    },
    {
      titre: "Semaine de la Mobilité Propre & Covoiturage",
      description: "Encourager le partage des trajets domicile-travail sur le Grand Abidjan.",
      scoreAgence: "48 collaborateurs engagés",
      gain: "1,2 Tonne de CO2 évitée",
      statut: "REUSSI"
    }
  ]);

  // Nouveau trajet
  const [newRide, setNewRide] = useState({
    conducteur: 'Kouamé N\'Dri',
    itineraire: '',
    heureDepart: '07h00',
    placesDispos: 3,
    vehicule: 'Véhicule Personnel'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateRide = (e) => {
    e.preventDefault();
    if (!newRide.itineraire) {
      alert("Veuillez indiquer l'itinéraire.");
      return;
    }

    const created = {
      id: `RIDE-0${covoiturages.length + 1}`,
      conducteur: newRide.conducteur,
      poste: "Collaborateur SII",
      itineraire: newRide.itineraire,
      heureDepart: newRide.heureDepart,
      placesDispos: parseInt(newRide.placesDispos),
      placesOccupees: 0,
      passagers: [],
      co2EconomiseKg: 50,
      vehicule: newRide.vehicule
    };

    setCovoiturages([created, ...covoiturages]);
    setShowAddRideModal(false);
    showToast("Votre trajet de covoiturage interne a été publié dans l'annuaire !");
  };

  const handleJoinRide = (id) => {
    setCovoiturages(prev => prev.map(r => {
      if (r.id === id && r.placesOccupees < r.placesDispos) {
        return {
          ...r,
          placesOccupees: r.placesOccupees + 1,
          passagers: [...r.passagers, "Moi (Inscrit)"]
        };
      }
      return r;
    }));
    showToast("Votre place de covoiturage a été réservée. Le conducteur a été notifié !");
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
            <div className="p-2.5 bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Leaf className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Green HR & Bilan Carbone Collaborateurs
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  RSE & Climat
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Bilan d'émissions des trajets, bourse de covoiturage d'entreprise et challenges éco-responsables
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddRideModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Proposer un Covoiturage</span>
        </button>
      </div>

      {/* KPI Cards RSE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : CO2 Évité */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              CO₂ Évité ce Trimestre
            </span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">4,8</span>
            <span className="text-xs text-slate-400 ml-2">Tonnes de CO₂</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold">
            -22% par rapport au trimestre précédent
          </div>
        </div>

        {/* KPI 2 : Salariés en Covoiturage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Adeptes du Covoiturage
            </span>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">52</span>
            <span className="text-xs text-slate-400 ml-2">collaborateurs actifs</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Sur les axes Riviera, Yopougon & Marcory
          </div>
        </div>

        {/* KPI 3 : Économie de Papier */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Zéro Papier RH
            </span>
            <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">92%</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">Dématérialisé</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Fiches de paie et contrats 100% numériques
          </div>
        </div>

        {/* KPI 4 : Score RSE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Note RSE Globale
            </span>
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">A+</span>
            <span className="text-xs text-emerald-600 font-bold">Standard Gold</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Conforme aux normes RSE UEMOA
          </div>
        </div>

      </div>

      {/* Onglets Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('bilan')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bilan'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>Bilan Carbone RH & Énergie</span>
        </button>

        <button
          onClick={() => setActiveTab('covoiturage')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'covoiturage'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Bourse de Covoiturage Interne ({covoiturages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'challenges'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Challenges Éco-Agences ({challenges.length})</span>
        </button>
      </div>

      {/* ONGLET 1 : BILAN CARBONE */}
      {activeTab === 'bilan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Décomposition de l'empreinte */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                Décomposition des Émissions RH (Grand Abidjan)
              </h3>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Trajets Pendulaires Domicile-Travail</span>
                    <span className="text-emerald-600">54% (2.6 t CO₂)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '54%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Climatisation & Énergie des Agences</span>
                    <span className="text-blue-600">32% (1.5 t CO₂)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Déplacements Clients & Flotte</span>
                    <span className="text-amber-600">14% (0.7 t CO₂)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '14%' }}></div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
                <strong>Plan d'Atténuation Climat :</strong> L'accélération du covoiturage et la baisse de 2°C des climatiseurs permettent d'économiser 1,5 million FCFA d'énergie par trimestre.
              </div>
            </div>

            {/* Performance par site */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                Performance Carbone par Agence SII
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Siège Plateau (Tour Postel 2001)</div>
                    <div className="text-slate-400">120 collaborateurs • Climatisation centrale</div>
                  </div>
                  <span className="font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                    -19% CO₂
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Agence Cocody Ambassades</div>
                    <div className="text-slate-400">45 collaborateurs • 100% ampoules LED</div>
                  </div>
                  <span className="font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                    -26% CO₂
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Hub Zone 4 Marcory</div>
                    <div className="text-slate-400">35 techniciens • Flotte de service</div>
                  </div>
                  <span className="font-bold text-blue-600 bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                    -15% CO₂
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ONGLET 2 : COVOITURAGE INTERNE */}
      {activeTab === 'covoiturage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {covoiturages.map((ride) => (
              <div
                key={ride.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {ride.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      ride.placesOccupees >= ride.placesDispos
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {ride.placesDispos - ride.placesOccupees} place(s) libre(s)
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {ride.itineraire}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ride.heureDepart}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400">Conducteur :</span>
                      <div className="font-semibold text-slate-900 dark:text-white">{ride.conducteur} ({ride.poste})</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Véhicule :</span>
                      <div className="text-slate-700 dark:text-slate-300">{ride.vehicule}</div>
                    </div>
                    <div className="pt-1 text-emerald-600 font-bold">
                      Impact : {ride.co2EconomiseKg} kg CO₂ évités / mois
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Passagers : {ride.passagers.length > 0 ? ride.passagers.join(', ') : 'Aucun'}
                  </div>

                  {ride.placesOccupees < ride.placesDispos ? (
                    <button
                      onClick={() => handleJoinRide(ride.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                    >
                      Rejoindre
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Complet</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONGLET 3 : CHALLENGES D'AGENCES */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {challenges.map((c, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {c.titre}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {c.description}
                </p>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300">
                    Résultat : {c.scoreAgence}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">
                    Gain collectif : {c.gain}
                  </div>
                </div>

                <div className="pt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.statut === 'REUSSI'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {c.statut === 'REUSSI' ? 'Challenge Validé' : 'En Cours de Déploiement'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALE : Proposer un Covoiturage */}
      {showAddRideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Proposer un Trajet de Covoiturage
                </h3>
              </div>
              <button onClick={() => setShowAddRideModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRide} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Itinéraire (Axe de départ et destination) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Yopougon Toits Rouges ➔ Siège Plateau"
                  value={newRide.itineraire}
                  onChange={(e) => setNewRide({ ...newRide, itineraire: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Heure Habituelle de Départ
                  </label>
                  <input
                    type="text"
                    value={newRide.heureDepart}
                    onChange={(e) => setNewRide({ ...newRide, heureDepart: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre de Places Disponibles
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newRide.placesDispos}
                    onChange={(e) => setNewRide({ ...newRide, placesDispos: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Véhicule Utilisé
                </label>
                <input
                  type="text"
                  placeholder="Ex: Berline personnelle climatisée"
                  value={newRide.vehicule}
                  onChange={(e) => setNewRide({ ...newRide, vehicule: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRideModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publier le Trajet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default GreenHR;
