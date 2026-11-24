import React, { useState } from 'react';
import {
  ArrowLeftRight,
  MapPin,
  Building2,
  User,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Search,
  Filter,
  DollarSign,
  HeartHandshake,
  HelpCircle,
  X,
  Printer
} from 'lucide-react';

export default function BoursePermutationAgences() {
  const [activeTab, setActiveTab] = useState('matchings'); // 'matchings' | 'demandes'
  const [showModalDemande, setShowModalDemande] = useState(false);

  // Appariements bilatéraux intelligents détectés par l'algorithme
  const [matchings, setMatchings] = useState([
    {
      id: 'MATCH-2026-01',
      scoreCompatibilite: 96, // %
      metier: 'Technicien Support Réseau & Monétique',
      motifPrincipal: 'Rapprochement familial réciproque',
      candidatA: {
        nom: 'Yao N’Goran Bertin',
        matricule: 'EMP-0215',
        agenceActuelle: 'Agence San Pedro Port',
        agenceSouhaitee: 'Agence Yopougon Siporex',
        anciennete: '3 ans 1 mois'
      },
      candidatB: {
        nom: 'Diarra Soumaila',
        matricule: 'EMP-0051',
        agenceActuelle: 'Agence Yopougon Siporex',
        agenceSouhaitee: 'Agence San Pedro Port',
        anciennete: '3 ans 8 mois'
      },
      indemniteMobiliteCcni: 850000, // Indemnité légale de déménagement par collaborateur
      statut: 'en_validation', // 'en_validation', 'valide_drh', 'instruit'
      validationChefAgenceA: true,
      validationChefAgenceB: true,
      dateEffetProposee: '01/01/2027'
    },
    {
      id: 'MATCH-2026-02',
      scoreCompatibilite: 91,
      metier: 'Caissier / Guichetier Principal',
      motifPrincipal: 'Réduction temps de trajet transport lagunaire',
      candidatA: {
        nom: 'Coulibaly Salimata',
        matricule: 'EMP-0056',
        agenceActuelle: 'Agence Grand-Bassam',
        agenceSouhaitee: 'Agence Cocody Deux-Plateaux',
        anciennete: '4 ans 2 mois'
      },
      candidatB: {
        nom: 'Koffi Akissi Jeanne',
        matricule: 'EMP-0092',
        agenceActuelle: 'Agence Cocody Deux-Plateaux',
        agenceSouhaitee: 'Agence Grand-Bassam',
        anciennete: '4 ans 0 mois'
      },
      indemniteMobiliteCcni: 450000,
      statut: 'valide_drh',
      validationChefAgenceA: true,
      validationChefAgenceB: true,
      dateEffetProposee: '15/12/2026'
    }
  ]);

  // Toutes les demandes individuelles en attente d'un binôme complémentaire
  const [demandesEnAttente, setDemandesEnAttente] = useState([
    {
      id: 'DEM-01',
      collaborateur: 'Traoré Bakary',
      poste: 'Conseiller Commercial Boutique',
      agenceActuelle: 'Agence Yopougon Siporex',
      agenceSouhaitee: 'Agence Abidjan Plateau',
      motif: 'Rapprochement domicile Adjamé / Plateau',
      dateDepot: '02/11/2026',
      statut: 'Recherche de binôme complémentaire'
    },
    {
      id: 'DEM-02',
      collaborateur: 'Bamba Souleymane',
      poste: 'Superviseur Logistique & Stock',
      agenceActuelle: 'Agence Abidjan Plateau',
      agenceSouhaitee: 'Agence Grand-Bassam',
      motif: 'Installation familiale à Bassam Ancien Quartier',
      dateDepot: '10/11/2026',
      statut: 'Recherche de binôme complémentaire'
    }
  ]);

  // Formulaire nouvelle demande
  const [formData, setFormData] = useState({
    collaborateur: '',
    poste: 'Guichetier Réseau Polyvalent',
    agenceActuelle: 'Agence Abidjan Plateau',
    agenceSouhaitee: 'Agence San Pedro Port',
    motif: 'Rapprochement familial'
  });

  const handleCreateDemande = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `DEM-0${demandesEnAttente.length + 1}`,
      collaborateur: formData.collaborateur,
      poste: formData.poste,
      agenceActuelle: formData.agenceActuelle,
      agenceSouhaitee: formData.agenceSouhaitee,
      motif: formData.motif,
      dateDepot: 'Aujourd’hui',
      statut: 'Recherche de binôme complémentaire'
    };
    setDemandesEnAttente([newEntry, ...demandesEnAttente]);
    setShowModalDemande(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête officiel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Mobilité Géographique Paritaire & QVT
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Algorithme de Matching Réciproque Inter-Agences
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-[#002B7F]" />
            Bourse d'Échange & Permutation Régionale des Postes
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Permettez aux collaborateurs de permuter d'agence à poste équivalent (rapprochement familial, réduction des transports)
            sans rupture de service, sans coût de recrutement et avec prise en charge de la prime de mobilité CCNI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModalDemande(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#002B7F] text-white rounded-lg text-xs font-semibold hover:bg-blue-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Déposer une Demande de Permutation
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Permutations Matchées</span>
            <ArrowLeftRight className="w-5 h-5 text-[#008000]" />
          </div>
          <div className="text-2xl font-bold text-[#008000]">{matchings.length} binômes prêts</div>
          <div className="text-xs text-slate-500 mt-1">
            Compatibilité moyenne : <strong>93.5%</strong>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Économie Recrutement Externe</span>
            <DollarSign className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-[#002B7F]">7.2 M FCFA</div>
          <div className="text-xs text-slate-500 mt-1">
            0 frais d'onboarding, compétences préservées
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Demandes en Attente</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{demandesEnAttente.length} demandes</div>
          <div className="text-xs text-slate-500 mt-1">
            En recherche d'un binôme équivalent
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Impact QVT & Trajet</span>
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">-1h40 / jour</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            Gain moyen de temps de trajet constaté
          </div>
        </div>
      </div>

      {/* Navigation Onglets */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('matchings')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'matchings'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Appariements Prêts pour Validation ({matchings.length})
        </button>
        <button
          onClick={() => setActiveTab('demandes')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'demandes'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Demandes Individuelles en Recherche ({demandesEnAttente.length})
        </button>
      </div>

      {/* Onglet 1 : Appariements Détectés */}
      {activeTab === 'matchings' && (
        <div className="space-y-4">
          {matchings.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <span className="text-[11px] font-bold text-[#002B7F] uppercase tracking-wider font-mono">
                    {m.id} • Métier : {m.metier}
                  </span>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Motif : <strong className="text-slate-700">{m.motifPrincipal}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#008000] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    {m.scoreCompatibilite}% de compatibilité
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    m.statut === 'valide_drh'
                      ? 'bg-emerald-100 text-[#008000]'
                      : 'bg-blue-100 text-[#002B7F]'
                  }`}>
                    {m.statut === 'valide_drh' ? 'Validé DRH' : 'En arbitrage chefs d’agence'}
                  </span>
                </div>
              </div>

              {/* Les 2 Collaborateurs Permutants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Collaborateur A */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{m.candidatA.nom}</span>
                    <span className="font-mono text-slate-400">{m.candidatA.matricule}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Actuellement :</span>
                      <p className="font-semibold text-slate-800">{m.candidatA.agenceActuelle}</p>
                    </div>
                    <ArrowLeftRight className="w-4 h-4 text-[#002B7F]" />
                    <div className="text-right">
                      <span className="text-slate-400">Destination :</span>
                      <p className="font-semibold text-[#008000]">{m.candidatA.agenceSouhaitee}</p>
                    </div>
                  </div>
                </div>

                {/* Collaborateur B */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{m.candidatB.nom}</span>
                    <span className="font-mono text-slate-400">{m.candidatB.matricule}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Actuellement :</span>
                      <p className="font-semibold text-slate-800">{m.candidatB.agenceActuelle}</p>
                    </div>
                    <ArrowLeftRight className="w-4 h-4 text-[#002B7F]" />
                    <div className="text-right">
                      <span className="text-slate-400">Destination :</span>
                      <p className="font-semibold text-[#008000]">{m.candidatB.agenceSouhaitee}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied de Carte et Validation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 gap-2">
                <span>
                  Date d'effet proposée : <strong>{m.dateEffetProposee}</strong> • Prime de mobilité CCNI : <strong>{m.indemniteMobiliteCcni.toLocaleString('fr-FR')} FCFA</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      m.statut = 'valide_drh';
                      setMatchings([...matchings]);
                    }}
                    className="px-3 py-1.5 bg-[#008000] text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valider la Permutation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onglet 2 : Demandes en Attente */}
      {activeTab === 'demandes' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Collaborateur Demandeur</th>
                <th className="py-3 px-4">Poste Occupé</th>
                <th className="py-3 px-4">Agence Actuelle</th>
                <th className="py-3 px-4">Agence Souhaitée</th>
                <th className="py-3 px-4">Motif Déclaré</th>
                <th className="py-3 px-4">Statut de Recherche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {demandesEnAttente.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{d.collaborateur}</td>
                  <td className="py-3.5 px-4 font-medium">{d.poste}</td>
                  <td className="py-3.5 px-4">{d.agenceActuelle}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#008000]">{d.agenceSouhaitee}</td>
                  <td className="py-3.5 px-4 text-slate-600">{d.motif}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3" /> {d.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dépôt Nouvelle Demande */}
      {showModalDemande && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-[#002B7F]" />
                Déposer une Demande de Permutation
              </h3>
              <button onClick={() => setShowModalDemande(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDemande} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom & Prénoms</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Kouamé N’Guessan Gilbert"
                  value={formData.collaborateur}
                  onChange={(e) => setFormData({ ...formData, collaborateur: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Poste Occupé</label>
                <input
                  type="text"
                  required
                  value={formData.poste}
                  onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agence Actuelle</label>
                  <select
                    value={formData.agenceActuelle}
                    onChange={(e) => setFormData({ ...formData, agenceActuelle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                  >
                    <option value="Agence Abidjan Plateau">Agence Abidjan Plateau</option>
                    <option value="Agence Cocody Deux-Plateaux">Agence Cocody Deux-Plateaux</option>
                    <option value="Agence Yopougon Siporex">Agence Yopougon Siporex</option>
                    <option value="Agence San Pedro Port">Agence San Pedro Port</option>
                    <option value="Agence Grand-Bassam">Agence Grand-Bassam</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agence Souhaitée</label>
                  <select
                    value={formData.agenceSouhaitee}
                    onChange={(e) => setFormData({ ...formData, agenceSouhaitee: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                  >
                    <option value="Agence San Pedro Port">Agence San Pedro Port</option>
                    <option value="Agence Abidjan Plateau">Agence Abidjan Plateau</option>
                    <option value="Agence Cocody Deux-Plateaux">Agence Cocody Deux-Plateaux</option>
                    <option value="Agence Yopougon Siporex">Agence Yopougon Siporex</option>
                    <option value="Agence Grand-Bassam">Agence Grand-Bassam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motif du Souhait de Mutation</label>
                <textarea
                  rows="2"
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002B7F] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalDemande(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B7F] text-white font-semibold rounded-lg hover:bg-blue-900"
                >
                  Enregistrer & Chercher Binôme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
