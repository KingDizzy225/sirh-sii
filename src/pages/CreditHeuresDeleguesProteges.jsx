import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Users, 
  Scale, 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Lock,
  PlusCircle,
  Eye,
  Info
} from 'lucide-react';

// CADRE LÉGAL : Articles 61.1 à 61.18 du Code du Travail de Côte d'Ivoire & CCNI
// 1. Crédit d'heures statutaire : 15 heures ouvrées par mois accordées aux délégués titulaires.
// 2. Rémunération : Heures rémunérées comme temps de travail effectif.
// 3. Réunions officielles avec la Direction : NON imputables sur le crédit de 15h.
// 4. Salarié Protégé : Autorisation administrative préalable OBLIGATOIRE de l'Inspecteur du Travail
//    pour toute tentative de rupture de contrat (pendant le mandat + 6 mois post-mandat).

const MOCK_DELEGATES = [
  {
    id: 'DEL-01',
    matricule: 'MTR-2018-0051',
    name: 'Kouassi Yao',
    poste: 'Technicien Fibre Senior',
    departement: 'Infrastructure & Déploiement Réseau',
    agence: 'Agence Yopougon Keneya',
    mandat: 'Délégué Titulaire',
    syndicat: 'UGTI (Union Générale des Travailleurs de CI)',
    collegeElectoral: 'Collège Ouvriers & Employés',
    dateDebutMandat: '2025-04-01',
    dateFinMandat: '2027-03-31', // Mandat de 2 ans
    dateFinProtectionLegale: '2027-09-30', // +6 mois post-mandat (Art. 61.8)
    creditMensuelAlloue: 15,
    heuresUtiliseesCeMois: 11.5,
    statutProtection: 'SALARIE_PROTEGE_ACTIF',
    derniersBonsDelegation: [
      { date: '2026-11-20', duree: 3.5, motif: 'Assistance salariée entretien préalable disciplinaire', visaSuperviseur: 'Visé' },
      { date: '2026-11-12', duree: 4.0, motif: 'Visite conditions de travail Agence Abobo', visaSuperviseur: 'Visé' },
      { date: '2026-11-04', duree: 4.0, motif: 'Permanence syndicale & préparation cahier doléances', visaSuperviseur: 'Visé' },
    ]
  },
  {
    id: 'DEL-02',
    matricule: 'MTR-2019-0112',
    name: 'Gnahoré Estelle',
    poste: 'Gestionnaire de Compte Entreprises',
    departement: 'Commercial & Vente',
    agence: 'Agence Centrale Plateau',
    mandat: 'Déléguée Titulaire',
    syndicat: 'FESACI (Fédération des Syndicats Autonomes)',
    collegeElectoral: 'Collège Cadres & Agents de Maîtrise',
    dateDebutMandat: '2025-04-01',
    dateFinMandat: '2027-03-31',
    dateFinProtectionLegale: '2027-09-30',
    creditMensuelAlloue: 15,
    heuresUtiliseesCeMois: 8.0,
    statutProtection: 'SALARIE_PROTEGE_ACTIF',
    derniersBonsDelegation: [
      { date: '2026-11-18', duree: 4.0, motif: 'Audition paritaire contentieux agence Vridi', visaSuperviseur: 'Visé' },
      { date: '2026-11-06', duree: 4.0, motif: 'Réunion intersyndicale préparation NAO 2026', visaSuperviseur: 'Visé' },
    ]
  },
  {
    id: 'DEL-03',
    matricule: 'MTR-2021-0205',
    name: 'Konan Kouadio Blaise',
    poste: 'Agent d\'Exploitation Système',
    departement: 'IT & Systèmes d\'Information',
    agence: 'Siège Social Plateau',
    mandat: 'Délégué Suppléant',
    syndicat: 'DIGNITÉ (Confédération des Travailleurs)',
    collegeElectoral: 'Collège Ouvriers & Employés',
    dateDebutMandat: '2025-04-01',
    dateFinMandat: '2027-03-31',
    dateFinProtectionLegale: '2027-09-30',
    creditMensuelAlloue: 0, // Suppléant : utilise les heures du titulaire en cas d'absence
    heuresUtiliseesCeMois: 0,
    statutProtection: 'SALARIE_PROTEGE_ACTIF',
    derniersBonsDelegation: []
  },
  {
    id: 'DEL-04',
    matricule: 'MTR-2016-0018',
    name: 'Diomandé Bakary',
    poste: 'Responsable Magasin Central',
    departement: 'Logistique & Stocks',
    agence: 'Plateforme Logistique Port San Pedro',
    mandat: 'Ancien Délégué (Mandat Échu)',
    syndicat: 'UGTI',
    collegeElectoral: 'Collège Ouvriers & Employés',
    dateDebutMandat: '2023-04-01',
    dateFinMandat: '2025-03-31',
    dateFinProtectionLegale: '2025-09-30', // Protection expirée
    creditMensuelAlloue: 0,
    heuresUtiliseesCeMois: 0,
    statutProtection: 'PROTECTION_EXPIREE',
    derniersBonsDelegation: []
  }
];

export default function CreditHeuresDeleguesProteges() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelegate, setSelectedDelegate] = useState(MOCK_DELEGATES[0]);
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'detail' | 'bon-delegation'
  const [newBon, setNewBon] = useState({ date: '2026-11-25', duree: 2.0, motif: '' });
  const [bonGenere, setBonGenere] = useState(null);

  const filteredDelegates = useMemo(() => {
    return MOCK_DELEGATES.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.syndicat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.agence.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Statistiques globales
  const stats = useMemo(() => {
    let titulaires = 0;
    let suppleans = 0;
    let protegesActifs = 0;
    let totalHeuresConsommees = 0;

    MOCK_DELEGATES.forEach(d => {
      if (d.mandat.includes('Titulaire')) titulaires++;
      if (d.mandat.includes('Suppléant')) suppleans++;
      if (d.statutProtection === 'SALARIE_PROTEGE_ACTIF') protegesActifs++;
      totalHeuresConsommees += d.heuresUtiliseesCeMois;
    });

    return { total: MOCK_DELEGATES.length, titulaires, suppleans, protegesActifs, totalHeuresConsommees };
  }, []);

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleCreateBon = (e) => {
    e.preventDefault();
    if (!newBon.motif) {
      window.alert('Veuillez renseigner le motif de la mission de délégation.');
      return;
    }

    const bonText = `SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
BON DE DÉLÉGATION PRÉALABLE (Art. 61 Code du Travail CI)
--------------------------------------------------------------------------------
Délégué : ${selectedDelegate.name} (${selectedDelegate.matricule})
Mandat : ${selectedDelegate.mandat} — Collège : ${selectedDelegate.collegeElectoral}
Organisation Syndicale : ${selectedDelegate.syndicat}
Affectation : ${selectedDelegate.agence}

Date de la mission : ${newBon.date}
Durée déclarée : ${newBon.duree} heure(s)
Motif d'exercice du mandat : ${newBon.motif}

Heures déjà consommées sur le mois : ${selectedDelegate.heuresUtiliseesCeMois} h / ${selectedDelegate.creditMensuelAlloue} h
Solde restant après imputation : ${Math.max(0, selectedDelegate.creditMensuelAlloue - (selectedDelegate.heuresUtiliseesCeMois + Number(newBon.duree)))} h

Visa du Supérieur Hiérarchique / Chef d'Agence :
(Pour information préalable et aménagement du service sans opposition au mandat)
Date & Heure : ______________________
Signature :`;

    setBonGenere(bonText);
    setActiveTab('bon-delegation');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Relations Sociales & Droit Syndical
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Art. 61 Code du Travail CI
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Crédit d'Heures de Délégation & Salariés Protégés
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Suivi mensuel du forfait légal de 15h de délégation, délivrance des bons horodatés et verrouillage de protection administrative contre toute rupture de contrat sans visa de l'Inspecteur du Travail.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('registry')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'registry'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Registre des Représentants
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'detail'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Consommation & Bons
            </button>
            {bonGenere && (
              <button
                onClick={() => setActiveTab('bon-delegation')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'bon-delegation'
                    ? 'bg-[#008000] text-white shadow'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Bon de Délégation Émis
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Délégués Titulaires</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.titulaires} titulaires</h3>
            <p className="text-xs text-gray-500 mt-1">Crédit 15h/mois chacun</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Salariés Protégés Actifs</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.protegesActifs} collaborateurs</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">Visa Inspection obligatoire</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Heures Délégation Mois</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.totalHeuresConsommees} h</h3>
            <p className="text-xs text-gray-500 mt-1">Imputées sur temps payé</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Protection Post-Mandat</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">+6 mois</h3>
            <p className="text-xs text-gray-500 mt-1">Garantie légale Art. 61.8</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Règle légale d'ordre public en Côte d'Ivoire */}
      <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
        <Scale className="w-5 h-5 text-[#008000] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#008000] font-semibold">Statut d'Ordre Public de Salarié Protégé (Article 61.8 Code du Travail CI) : </strong>
          Tout licenciement envisagé d'un délégué du personnel (titulaire ou suppléant), ou d'un ancien délégué pendant les <strong>six (6) mois qui suivent l'expiration de son mandat</strong>, est obligatoirement subordonné à l'autorisation préalable de l'<strong>Inspecteur du Travail et des Lois Sociales</strong>.
          <span className="block mt-1 text-gray-600">
            Tout licenciement prononcé sans cette autorisation est <strong>nul de plein droit</strong>. L'employeur s'expose à une réintégration immédiate et au versement d'une indemnité égale à la totalité des salaires que le salarié aurait dû percevoir.
          </span>
        </div>
      </div>

      {/* Vue 1 : Registre des Délégués */}
      {activeTab === 'registry' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Recherche */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher représentant, syndicat, agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Mandats électoraux 2025-2027
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Délégué / Matricule</th>
                  <th className="py-3.5 px-4">Syndicat & Collège</th>
                  <th className="py-3.5 px-4">Affectation & Poste</th>
                  <th className="py-3.5 px-4 text-center">Consommation Mois</th>
                  <th className="py-3.5 px-4 text-center">Protection Légale</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDelegates.map((d) => {
                  const percent = d.creditMensuelAlloue > 0 ? Math.round((d.heuresUtiliseesCeMois / d.creditMensuelAlloue) * 100) : 0;

                  return (
                    <tr 
                      key={d.id} 
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedDelegate(d);
                        setActiveTab('detail');
                      }}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{d.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{d.matricule} • {d.mandat}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-gray-800">{d.syndicat}</div>
                        <div className="text-[11px] text-gray-500">{d.collegeElectoral}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-gray-800 font-medium">{d.poste}</div>
                        <div className="text-xs text-gray-500">{d.agence}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {d.creditMensuelAlloue > 0 ? (
                          <div>
                            <span className="font-mono font-bold text-gray-900">
                              {d.heuresUtiliseesCeMois}h / {d.creditMensuelAlloue}h
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${percent > 80 ? 'bg-amber-500' : 'bg-[#008000]'}`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-500">{percent}% consommé</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Suppléant (sur besoin)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {d.statutProtection === 'SALARIE_PROTEGE_ACTIF' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#008000]" />
                            Protégé jusqu'au {d.dateFinProtectionLegale}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Protection expirée
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedDelegate(d);
                            setActiveTab('detail');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
                        >
                          Gérer Bons
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : Fiche Détaillée & Émission de Bon de Délégation */}
      {activeTab === 'detail' && selectedDelegate && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {selectedDelegate.matricule}
                </span>
                <span className="text-xs font-semibold text-[#002B7F] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {selectedDelegate.syndicat}
                </span>
                <span className="text-xs font-semibold text-[#008000] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {selectedDelegate.mandat}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedDelegate.name}</h2>
              <p className="text-sm text-gray-600">{selectedDelegate.poste} • {selectedDelegate.agence}</p>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
              <div className="text-center">
                <p className="text-gray-500">Heures Consommées</p>
                <p className="text-xl font-black text-amber-600 font-mono mt-0.5">
                  {selectedDelegate.heuresUtiliseesCeMois} h
                </p>
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div className="text-center">
                <p className="text-gray-500">Forfait Mensuel</p>
                <p className="text-xl font-black text-[#002B7F] font-mono mt-0.5">
                  {selectedDelegate.creditMensuelAlloue} h
                </p>
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div className="text-center">
                <p className="text-gray-500">Solde Disponible</p>
                <p className="text-xl font-black text-[#008000] font-mono mt-0.5">
                  {Math.max(0, selectedDelegate.creditMensuelAlloue - selectedDelegate.heuresUtiliseesCeMois)} h
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Formulaire d'émission de bon de délégation */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#002B7F]" />
                Émettre un Bon de Délégation
              </h3>
              <p className="text-xs text-gray-500">
                Notification préalable au chef d'agence pour aménagement de poste avant départ en mission.
              </p>

              <form onSubmit={handleCreateBon} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Date de la mission</label>
                  <input
                    type="date"
                    value={newBon.date}
                    onChange={(e) => setNewBon({ ...newBon, date: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#002B7F]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Durée prévue (heures)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="8"
                    value={newBon.duree}
                    onChange={(e) => setNewBon({ ...newBon, duree: e.target.value })}
                    className="w-full text-xs font-mono border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#002B7F]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Motif syndical / d'exercice</label>
                  <textarea
                    rows="3"
                    placeholder="Ex: Enquête sur site, assistance salarié entretien préalable, réunion intersyndicale..."
                    value={newBon.motif}
                    onChange={(e) => setNewBon({ ...newBon, motif: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#002B7F]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#002B7F] text-white text-xs font-semibold rounded-lg hover:bg-blue-900 shadow flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Générer Bon de Délégation
                </button>
              </form>
            </div>

            {/* Historique des bons émis sur le mois */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#008000]" />
                  Bons de Délégation Imputés ce Mois ({selectedDelegate.derniersBonsDelegation.length})
                </h4>
                <span className="text-xs text-gray-500 font-mono">
                  Mois civil en cours
                </span>
              </div>

              <div className="divide-y divide-gray-200">
                {selectedDelegate.derniersBonsDelegation.length > 0 ? (
                  selectedDelegate.derniersBonsDelegation.map((bon, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-900">{bon.date}</span>
                          <span className="text-xs font-bold font-mono text-[#002B7F] bg-blue-50 px-2 py-0.5 rounded">
                            {bon.duree} heure(s)
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{bon.motif}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#008000] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {bon.visaSuperviseur}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-gray-500">
                    Aucun bon de délégation émis pour ce délégué sur le mois civil.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Modèle de Bon de Délégation Généré */}
      {activeTab === 'bon-delegation' && bonGenere && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                Bon de Délégation Officiel (Imputable aux 15 Heures Statutaires)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer le Bon
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([bonGenere], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Bon_Delegation_${selectedDelegate.matricule}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
            {bonGenere}
          </div>
        </div>
      )}
    </div>
  );
}
