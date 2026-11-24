import React, { useState, useMemo } from 'react';
import { 
  FileSignature, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  UserPlus, 
  Calendar, 
  Building2, 
  ThumbsUp, 
  MessageSquare,
  Eye,
  Info
} from 'lucide-react';

// GESTION DES PROMESSES D'EMBAUCHE & NÉGOCIATION D'OFFRES (Offer Management)
// Encadre le closing entre l'entretien final et la signature du contrat de travail :
// - Validation budgétaire DRH / DAF
// - Suivi des contre-propositions salariales
// - Compte à rebours de validité de l'offre (7 jours)
// - Générateur de Promesse d'Embauche officielle

const MOCK_OFFERS = [
  {
    id: 'OFF-2026-084',
    candidatNom: 'Kouakou Ange-Désiré',
    email: 'a.kouakou@mail.ci',
    postePropose: 'Ingénieur Cybersécurité & SOC',
    departement: 'IT & Systèmes d\'Information',
    agence: 'Siège Social Plateau',
    typeContrat: 'CDI (Essai 3 mois)',
    categorieCcni: '9ème Catégorie — Échelon B',
    salaireInitialPropose: 1150000,
    contrePropositionCandidat: 1300000,
    salaireFinalValide: 1250000,
    primeTransport: 30000,
    mutuelleSante: 'Prise en charge employeur 80% (Famille incluse)',
    dateEnvoiOffre: '2026-11-20',
    dateExpirationOffre: '2026-11-27',
    joursRestantsValidite: 3,
    dateEntreePrevue: '2027-01-04',
    statut: 'NEGOCIATION', // 'VALIDATION_DAF' | 'ENVOYEE' | 'NEGOCIATION' | 'ACCEPTEE' | 'DECLINEE'
    validationDrh: 'Approuvé',
    validationDaf: 'En attente arbitrage +100k',
    noteRecruteur: 'Candidat très convoité (offre concurrente banque). Compromis trouvé à 1 250 000 FCFA brut.'
  },
  {
    id: 'OFF-2026-081',
    candidatNom: 'Traoré Aminata Bintou',
    email: 'aminata.traore@mail.ci',
    postePropose: 'Responsable d\'Agence Commerciale',
    departement: 'Opérations Réseau',
    agence: 'Agence Bouaké Centre',
    typeContrat: 'CDI (Essai 3 mois)',
    categorieCcni: '10ème Catégorie — Échelon A',
    salaireInitialPropose: 950000,
    contrePropositionCandidat: null,
    salaireFinalValide: 950000,
    primeTransport: 30000,
    mutuelleSante: 'Prise en charge employeur 80% (Famille incluse)',
    dateEnvoiOffre: '2026-11-12',
    dateExpirationOffre: '2026-11-19',
    joursRestantsValidite: 0,
    dateEntreePrevue: '2026-12-01',
    statut: 'ACCEPTEE',
    validationDrh: 'Approuvé',
    validationDaf: 'Approuvé',
    noteRecruteur: 'Promesse d\'embauche signée et retournée en 48h. Dossier transmis à l\'Onboarding.'
  },
  {
    id: 'OFF-2026-086',
    candidatNom: 'Ouattara Seydou Junior',
    email: 's.ouattara@mail.ci',
    postePropose: 'Analyste Risque Crédit PME',
    departement: 'Direction des Risques',
    agence: 'Siège Social Plateau',
    typeContrat: 'CDI (Essai 3 mois)',
    categorieCcni: '9ème Catégorie — Échelon A',
    salaireInitialPropose: 820000,
    contrePropositionCandidat: null,
    salaireFinalValide: 820000,
    primeTransport: 30000,
    mutuelleSante: 'Prise en charge employeur 80%',
    dateEnvoiOffre: '2026-11-22',
    dateExpirationOffre: '2026-11-29',
    joursRestantsValidite: 5,
    dateEntreePrevue: '2027-01-04',
    statut: 'ENVOYEE',
    validationDrh: 'Approuvé',
    validationDaf: 'Approuvé',
    noteRecruteur: 'Lettre d\'offre envoyée par courriel sécurisé. Relance prévue à J+4.'
  },
  {
    id: 'OFF-2026-079',
    candidatNom: 'Bédié Jean-Luc',
    email: 'jl.bedie@mail.ci',
    postePropose: 'Chef de Projet Déploiement Fibre',
    departement: 'Infrastructure & Réseau',
    agence: 'Direction Régionale San Pedro',
    typeContrat: 'CDI (Essai 3 mois)',
    categorieCcni: '9ème Catégorie — Échelon C',
    salaireInitialPropose: 900000,
    contrePropositionCandidat: 1200000,
    salaireFinalValide: 900000,
    primeTransport: 30000,
    mutuelleSante: 'Prise en charge employeur 80%',
    dateEnvoiOffre: '2026-11-02',
    dateExpirationOffre: '2026-11-09',
    joursRestantsValidite: 0,
    dateEntreePrevue: '2026-12-01',
    statut: 'DECLINEE',
    validationDrh: 'Approuvé',
    validationDaf: 'Refus dépassement grille',
    noteRecruteur: 'Candidat a décliné pour une expatriation sous-régionale. Candidat n°2 activé.'
  }
];

export default function PromessesEmbaucheOffres() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOffer, setSelectedOffer] = useState(MOCK_OFFERS[0]);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'detail' | 'letter'

  const filteredOffers = useMemo(() => {
    return MOCK_OFFERS.filter((o) => {
      const matchSearch =
        o.candidatNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.postePropose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.agence.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || o.statut === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    let acceptees = 0;
    let enNegociation = 0;
    let envoyees = 0;
    let declinees = 0;
    MOCK_OFFERS.forEach((o) => {
      if (o.statut === 'ACCEPTEE') acceptees++;
      else if (o.statut === 'NEGOCIATION') enNegociation++;
      else if (o.statut === 'ENVOYEE') envoyees++;
      else if (o.statut === 'DECLINEE') declinees++;
    });
    const cloturees = acceptees + declinees;
    const tauxAcceptation = cloturees > 0 ? Math.round((acceptees / cloturees) * 100) : 0;
    return { total: MOCK_OFFERS.length, acceptees, enNegociation, envoyees, tauxAcceptation };
  }, []);

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Acquisition de Talents & Closing
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Offer Management & Pré-Contractualisation
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Promesses d'Embauche & Négociation d'Offres
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Pilotez le closing de vos candidats finalistes : validation budgétaire DRH/DAF, suivi des contre-propositions salariales, délais de validité et édition de promesses d'embauche formelles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Pipeline des Offres
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'detail'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Détail & Négociation
            </button>
            <button
              onClick={() => setActiveTab('letter')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'letter'
                  ? 'bg-[#008000] text-white shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Lettre de Promesse
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Offres Actives</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.envoyees + stats.enNegociation} en attente</h3>
            <p className="text-xs text-gray-500 mt-1">Sur {stats.total} émises ce mois</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <FileSignature className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contre-Propositions</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.enNegociation} dossier(s)</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Arbitrage DRH / DAF</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Offres Acceptées</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.acceptees} signée(s)</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">Prêtes pour Onboarding</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Taux d'Acceptation</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.tauxAcceptation} %</h3>
            <p className="text-xs text-gray-500 mt-1">Ratio offres clôturées</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <UserPlus className="w-6 h-6 text-[#002B7F]" />
          </div>
        </div>
      </div>

      {/* Info juridique */}
      <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#008000] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#008000] font-semibold">Valeur Juridique de la Promesse d'Embauche : </strong>
          Dès qu'une offre précise l'emploi, la rémunération et la date d'entrée, elle vaut engagement ferme. L'indication d'une <strong>date limite d'acceptation (7 jours)</strong> protège l'entreprise en permettant de libérer le poste automatiquement en l'absence de réponse du candidat.
        </div>
      </div>

      {/* Vue 1 : Pipeline des Offres */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher candidat, poste, agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500 font-medium">Statut :</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-medium text-gray-700 focus:outline-none"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ENVOYEE">Envoyée (En attente)</option>
                <option value="NEGOCIATION">Négociation / Contre-offre</option>
                <option value="ACCEPTEE">Acceptée & Signée</option>
                <option value="DECLINEE">Déclinée</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Candidat & Réf</th>
                  <th className="py-3.5 px-4">Poste & Affectation</th>
                  <th className="py-3.5 px-4">Package Brut Proposé</th>
                  <th className="py-3.5 px-4 text-center">Validité Offre</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOffers.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedOffer(o);
                      setActiveTab('detail');
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{o.candidatNom}</div>
                      <div className="text-xs text-gray-500 font-mono">{o.id} • {o.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-gray-800">{o.postePropose}</div>
                      <div className="text-[11px] text-gray-500">{o.agence} • {o.typeContrat}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="font-bold text-[#002B7F]">
                        {o.salaireFinalValide.toLocaleString('fr-FR')} FCFA
                      </div>
                      {o.contrePropositionCandidat && (
                        <div className="text-[10px] text-amber-700 font-semibold">
                          Demande candidat : {o.contrePropositionCandidat.toLocaleString('fr-FR')} F
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs">
                      {o.statut === 'ENVOYEE' || o.statut === 'NEGOCIATION' ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold ${
                          o.joursRestantsValidite <= 3
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-[#002B7F] border border-blue-200'
                        }`}>
                          <Clock className="w-3 h-3" />
                          J-{o.joursRestantsValidite} ({o.dateExpirationOffre})
                        </span>
                      ) : (
                        <span className="text-gray-400">Clôturée</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        o.statut === 'ACCEPTEE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : o.statut === 'NEGOCIATION'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : o.statut === 'DECLINEE'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-[#002B7F] border border-blue-200'
                      }`}>
                        {o.statut === 'ACCEPTEE' ? 'Acceptée' : o.statut === 'NEGOCIATION' ? 'Négociation' : o.statut === 'DECLINEE' ? 'Déclinée' : 'Envoyée'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedOffer(o);
                            setActiveTab('detail');
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#002B7F] hover:bg-gray-100 rounded-lg"
                          title="Voir négociation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOffer(o);
                            setActiveTab('letter');
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#008000] hover:bg-gray-100 rounded-lg"
                          title="Éditer promesse d'embauche"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : Détail & Négociation Salariale */}
      {activeTab === 'detail' && selectedOffer && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {selectedOffer.id}
                </span>
                <span className="text-xs font-semibold text-[#002B7F] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {selectedOffer.categorieCcni}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedOffer.candidatNom}</h2>
              <p className="text-sm text-gray-600">{selectedOffer.postePropose} • {selectedOffer.agence}</p>
            </div>
            <button
              onClick={() => setActiveTab('letter')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#008000] text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow"
            >
              <FileSignature className="w-4 h-4" />
              Générer la Promesse d'Embauche
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#002B7F]" />
                Historique de Négociation du Package Salarial
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-500">Offre Initiale DRH</span>
                  <p className="text-lg font-bold font-mono text-gray-900 mt-1">
                    {selectedOffer.salaireInitialPropose.toLocaleString('fr-FR')} F
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-amber-800">Contre-Proposition Candidat</span>
                  <p className="text-lg font-bold font-mono text-amber-700 mt-1">
                    {selectedOffer.contrePropositionCandidat
                      ? `${selectedOffer.contrePropositionCandidat.toLocaleString('fr-FR')} F`
                      : 'Aucune'}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[#008000] font-semibold">Offre Finale Retenue</span>
                  <p className="text-lg font-bold font-mono text-[#008000] mt-1">
                    {selectedOffer.salaireFinalValide.toLocaleString('fr-FR')} F
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-gray-700">
                <strong>Notes du Talent Acquisition Manager : </strong>
                {selectedOffer.noteRecruteur}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3 text-xs">
              <h4 className="text-xs font-bold text-gray-500 uppercase">Circuit de Validation Budgétaire</h4>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Direction RH :</span>
                <span className="font-bold text-[#008000]">{selectedOffer.validationDrh}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Direction Financière (DAF) :</span>
                <span className={`font-bold ${selectedOffer.validationDaf === 'Approuvé' ? 'text-[#008000]' : 'text-amber-600'}`}>
                  {selectedOffer.validationDaf}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Prise de poste visée :</span>
                <span className="font-bold text-gray-900">{selectedOffer.dateEntreePrevue}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Couverture Santé :</span>
                <span className="font-medium text-gray-800 text-right max-w-[150px]">{selectedOffer.mutuelleSante}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Lettre de Promesse d'Embauche Officielle */}
      {activeTab === 'letter' && selectedOffer && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                Lettre Officielle de Promesse d'Embauche ({selectedOffer.id})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer
              </button>
              <button
                onClick={() => {
                  const content = document.getElementById('print-offer').innerText;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Promesse_Embauche_${selectedOffer.id}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div id="print-offer" className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Direction du Capital Humain — Acquisition de Talents
Boulevard de la République, Plateau, Abidjan

Réf : ${selectedOffer.id} | Abidjan, le ${todayStr}

OBJET : PROMESSE D'EMBAUCHE FERME

À l'attention de :
Monsieur / Madame ${selectedOffer.candidatNom}
Courriel : ${selectedOffer.email}

Monsieur / Madame,

À l'issue de nos différents entretiens, nous avons le grand plaisir de vous confirmer notre décision de vous recruter au sein de la SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI) aux conditions principales suivantes :

1. POSTE & AFFECTATION :
- Intitulé du poste : ${selectedOffer.postePropose}
- Département : ${selectedOffer.departement}
- Lieu d'affectation : ${selectedOffer.agence}

2. NATURE DU CONTRAT & CLASSIFICATION :
- Type de contrat : ${selectedOffer.typeContrat}
- Classification CCNI : ${selectedOffer.categorieCcni}
- Date d'entrée en fonction souhaitée : ${selectedOffer.dateEntreePrevue}

3. RÉMUNÉRATION & AVANTAGES :
- Rémunération mensuelle brute : ${selectedOffer.salaireFinalValide.toLocaleString('fr-FR')} FCFA
- Prime de transport légale : ${selectedOffer.primeTransport.toLocaleString('fr-FR')} FCFA / mois
- Protection sociale complémentaire : ${selectedOffer.mutuelleSante}

4. VALIDITÉ DE LA PRÉSENTE OFFRE :
La présente promesse d'embauche est valable jusqu'au ${selectedOffer.dateExpirationOffre} inclus. Passé ce délai, sans retour signé de votre part, la présente proposition deviendra automatiquement caduque.

Nous restons enthousiastes à l'idée de vous compter très prochainement parmi nos équipes.

Pour la Direction du Capital Humain                      Bon pour accord définitif du Candidat
SII Côte d'Ivoire                                        ("Lu et approuvé" + Date & Signature)`}
          </div>
        </div>
      )}
    </div>
  );
}
