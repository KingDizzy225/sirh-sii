import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Baby, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Users, 
  HelpCircle,
  Eye,
  Info,
  Lock
} from 'lucide-react';

// CADRE LÉGAL : Article 23 de la Convention Collective Interprofessionnelle (CCNI)
// et Code du Travail de Côte d'Ivoire.
// 1. Congé de Maternité : 14 semaines consécutives (6 semaines prénatales + 8 semaines postnatales)
//    Prise en charge CNPS à 100%. Possibilité de prolongation médicale de 3 semaines max.
// 2. Droit d'Allaitement : 1 heure par jour ouvrable pendant 15 mois à compter de la naissance.
// 3. Protection absolue contre le licenciement : Interdiction d'ordre public de résilier
//    le contrat pendant la grossesse attestée médicalement et pendant tout le congé maternité.

const MOCK_MATERNITY_CASES = [
  {
    id: 'MAT-2026-001',
    matricule: 'MTR-2021-0089',
    name: 'Bamba Fatoumata',
    poste: 'Conseillère Clientèle Particuliers',
    departement: 'Commercial & Vente',
    agence: 'Agence Treichville Arras',
    dateDeclarationGrossesse: '2026-04-10',
    dateAccouchementPrevue: '2026-10-15',
    dateAccouchementEffective: '2026-10-12',
    dateDebutConge: '2026-09-01',
    dateFinConge: '2026-12-08', // 14 semaines
    dateFinAllaitement: '2028-01-12', // 15 mois après naissance
    creneauAllaitementChoisi: '16h30 - 17h30 (Départ anticipé 1h)',
    statut: 'EN_CONGE_MATERNITE', // 'GROSSESSE_DECLAREE' | 'EN_CONGE_MATERNITE' | 'REPRISE_ALLAITEMENT' | 'TERMINE'
    dossierCnpsTransmis: true,
    numeroCnpsPrestation: 'CNPS-PREST-88291',
    certificatMedicalMedecin: 'Dr. Brou (Clinique Sainte-Anne Abidjan)',
    remplacantTemporaire: 'Koffi Serge (Intérimaire RH)',
    protectionLicenciementActive: true
  },
  {
    id: 'MAT-2026-002',
    matricule: 'MTR-2023-0199',
    name: 'Koffi Aya Grâce',
    poste: 'Guichetière Chargée de Caisse',
    departement: 'Opérations Réseau',
    agence: 'Agence Cocody Deux-Plateaux',
    dateDeclarationGrossesse: '2026-08-20',
    dateAccouchementPrevue: '2027-02-14',
    dateAccouchementEffective: null,
    dateDebutConge: '2027-01-03', // J-6 semaines
    dateFinConge: '2027-04-11',
    dateFinAllaitement: '2028-05-14',
    creneauAllaitementChoisi: 'En attente reprise',
    statut: 'GROSSESSE_DECLAREE',
    dossierCnpsTransmis: false,
    numeroCnpsPrestation: 'En cours instruction',
    certificatMedicalMedecin: 'Dr. N\'Guessan (CHU Treichville)',
    remplacantTemporaire: 'Recherche remplaçant en cours',
    protectionLicenciementActive: true
  },
  {
    id: 'MAT-2025-008',
    matricule: 'MTR-2019-0034',
    name: 'Koffi Marie-Chantal',
    poste: 'Chef de Caisse',
    departement: 'Opérations Réseau',
    agence: 'Agence Yopougon Keneya',
    dateDeclarationGrossesse: '2025-09-01',
    dateAccouchementPrevue: '2026-03-20',
    dateAccouchementEffective: '2026-03-18',
    dateDebutConge: '2026-02-06',
    dateFinConge: '2026-05-15',
    dateFinAllaitement: '2027-06-18', // 15 mois
    creneauAllaitementChoisi: '12h00 - 13h00 (Pause déjeuner étendue)',
    statut: 'REPRISE_ALLAITEMENT',
    dossierCnpsTransmis: true,
    numeroCnpsPrestation: 'CNPS-PREST-77312',
    certificatMedicalMedecin: 'Dr. Konan (Polyclinique Farah)',
    remplacantTemporaire: 'Mission achevée',
    protectionLicenciementActive: false // Protection post-congé ordinaire
  }
];

export default function MaterniteAllaitementProtection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(MOCK_MATERNITY_CASES[0]);
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'detail' | 'attestation'

  const filteredCases = useMemo(() => {
    return MOCK_MATERNITY_CASES.filter((c) => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.agence.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || c.statut === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  // Statistiques
  const stats = useMemo(() => {
    let grossesses = 0;
    let congesEnCours = 0;
    let allaitements = 0;
    let protectionsActives = 0;

    MOCK_MATERNITY_CASES.forEach(c => {
      if (c.statut === 'GROSSESSE_DECLAREE') grossesses++;
      if (c.statut === 'EN_CONGE_MATERNITE') congesEnCours++;
      if (c.statut === 'REPRISE_ALLAITEMENT') allaitements++;
      if (c.protectionLicenciementActive) protectionsActives++;
    });

    return { total: MOCK_MATERNITY_CASES.length, grossesses, congesEnCours, allaitements, protectionsActives };
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
                Protection Sociale & RSE
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Art. 23 CCNI Côte d'Ivoire
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Registre Maternité, Allaitement & Protection Salariée
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Suivi légal des 14 semaines de congé indemnisé CNPS, décompte de l'heure quotidienne d'allaitement (15 mois) et verrouillage strict d'immunité contre le licenciement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Registre des Collaboratrices
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'detail'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Fiche Individuelle
            </button>
            <button
              onClick={() => setActiveTab('attestation')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'attestation'
                  ? 'bg-[#008000] text-white shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Attestation CNPS & Droits
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Grossesses Déclarées</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.grossesses} salariée(s)</h3>
            <p className="text-xs text-gray-500 mt-1">Certificats médicaux enregistrés</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">En Congé Maternité (14 sem)</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.congesEnCours} active(s)</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">Prise en charge CNPS 100%</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <Baby className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Heures Allaitement Actives</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.allaitements} mères</h3>
            <p className="text-xs text-gray-500 mt-1">1h/jour pendant 15 mois</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Immunité Licenciement</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.protectionsActives} protégée(s)</h3>
            <p className="text-xs text-red-600 mt-1 font-semibold">Verrouillage d'ordre public</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Rappel des 3 garanties légales fondamentales */}
      <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#008000] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#008000] font-semibold">Les 3 Garanties d'Ordre Public de l'Article 23 CCNI en Côte d'Ivoire : </strong>
          <span className="block mt-1">
            <strong>1. Congé de 14 semaines :</strong> La salariée a droit à 6 semaines avant et 8 semaines après l'accouchement. La rémunération est garantie par la CNPS.
            <br />
            <strong>2. Pause d'allaitement (1h/jour pendant 15 mois) :</strong> Pendant 15 mois à compter de la naissance, la mère a droit à des repos d'allaitement d'une heure par journée de travail, rémunérée comme temps effectif.
            <br />
            <strong>3. Interdiction absolue de licenciement :</strong> Aucun employeur ne peut résilier le contrat de travail d'une salariée lorsqu'elle est en état de grossesse médicalement constatée ou pendant la période de repos maternité. Tout licenciement notifié en méconnaissance de ce principe est nul et de nul effet.
          </span>
        </div>
      </div>

      {/* Vue 1 : Registre des Collaboratrices */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Filtres & Recherche */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par collaboratrice, matricule, agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-500 font-medium">Statut :</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-medium text-gray-700 focus:outline-none"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="GROSSESSE_DECLAREE">Grossesse déclarée</option>
                  <option value="EN_CONGE_MATERNITE">En congé maternité (14 sem)</option>
                  <option value="REPRISE_ALLAITEMENT">Reprise & Allaitement (15 mois)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Salariée / Matricule</th>
                  <th className="py-3.5 px-4">Affectation & Poste</th>
                  <th className="py-3.5 px-4">Calendrier Maternité</th>
                  <th className="py-3.5 px-4">Heure d'Allaitement (15 mois)</th>
                  <th className="py-3.5 px-4 text-center">Sécurisation Légale</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCases.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCase(c);
                      setActiveTab('detail');
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{c.matricule}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-gray-800 text-xs font-medium">{c.poste}</div>
                      <div className="text-xs text-gray-500">{c.agence}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-gray-800">
                        Congé : <strong>{c.dateDebutConge}</strong> au <strong>{c.dateFinConge}</strong>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Dossier CNPS : {c.numeroCnpsPrestation}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-gray-800 font-medium">
                        {c.creneauAllaitementChoisi}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Échéance : jusqu'au {c.dateFinAllaitement}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.protectionLicenciementActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <Lock className="w-3 h-3 text-red-600" />
                          Immunité active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600">
                          Régime standard
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.statut === 'EN_CONGE_MATERNITE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.statut === 'REPRISE_ALLAITEMENT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-[#002B7F] border border-blue-200'
                      }`}>
                        {c.statut === 'EN_CONGE_MATERNITE' ? 'En Congé 14 sem' : c.statut === 'REPRISE_ALLAITEMENT' ? 'Reprise / Allaitement' : 'Grossesse déclarée'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setActiveTab('detail');
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#002B7F] hover:bg-gray-100 rounded-lg"
                          title="Voir la fiche"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setActiveTab('attestation');
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#008000] hover:bg-gray-100 rounded-lg"
                          title="Générer attestation de prise en charge"
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

      {/* Vue 2 : Fiche Individuelle */}
      {activeTab === 'detail' && selectedCase && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {selectedCase.matricule}
                </span>
                <span className="text-xs font-semibold text-[#002B7F] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {selectedCase.departement}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedCase.name}</h2>
              <p className="text-sm text-gray-600">{selectedCase.poste} • {selectedCase.agence}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('attestation')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#008000] text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow"
              >
                <FileText className="w-4 h-4" />
                Éditer Attestation de Congé Maternité
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Détails du calendrier */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#002B7F]" />
                  Calendrier Légal des 14 Semaines (Art. 23 CCNI)
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Déclaration Médicale de Grossesse :</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{selectedCase.dateDeclarationGrossesse}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Praticien : {selectedCase.certificatMedicalMedecin}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Date d'Accouchement :</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {selectedCase.dateAccouchementEffective || `${selectedCase.dateAccouchementPrevue} (prévue)`}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                    <p className="text-blue-900 font-semibold">Début du Congé Maternité (6 sem avant) :</p>
                    <p className="text-sm font-bold text-[#002B7F] mt-1">{selectedCase.dateDebutConge}</p>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                    <p className="text-blue-900 font-semibold">Fin du Congé Maternité (8 sem après) :</p>
                    <p className="text-sm font-bold text-[#002B7F] mt-1">{selectedCase.dateFinConge}</p>
                  </div>
                </div>
              </div>

              {/* Droit d'allaitement */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Organisation du Droit d'Allaitement (1h / jour ouvré)
                </h3>
                <div className="p-4 bg-amber-50/40 rounded-lg border border-amber-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Créneau horaire convenu avec le chef d'agence :</span>
                    <span className="font-bold text-gray-900">{selectedCase.creneauAllaitementChoisi}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Durée légale de validité :</span>
                    <span className="font-bold text-[#008000]">Jusqu'au {selectedCase.dateFinAllaitement} (15 mois révolus)</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">
                    * Cette heure d'absence journalière est intégralement rémunérée et assimilée à du travail effectif.
                  </p>
                </div>
              </div>
            </div>

            {/* Sécurité juridique & Remplacement */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Statut Protection Juridique</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Immunité licenciement :</span>
                    <span className={`font-bold ${selectedCase.protectionLicenciementActive ? 'text-red-600' : 'text-gray-700'}`}>
                      {selectedCase.protectionLicenciementActive ? 'VERROUILLÉE' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dossier CNPS :</span>
                    <span className="font-bold text-[#008000]">
                      {selectedCase.dossierCnpsTransmis ? 'Transmis' : 'En attente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Réf Prestation :</span>
                    <span className="font-mono text-gray-900">{selectedCase.numeroCnpsPrestation}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Continuité d'Agence & Poste</h4>
                <p className="text-xs text-gray-600">
                  Remplacement temporaire : <strong className="text-gray-900">{selectedCase.remplacantTemporaire}</strong>
                </p>
                <p className="text-[11px] text-gray-500 mt-2">
                  Garantie statutaire : Réintégration automatique sur le même poste au même salaire dès la fin du congé.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Attestation Officielle */}
      {activeTab === 'attestation' && selectedCase && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                Attestation d'Embauche & de Suspension pour Congé Maternité (Dossier CNPS)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer l'Attestation
              </button>
              <button
                onClick={() => {
                  const content = document.getElementById('print-maternity').innerText;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Attestation_Maternite_${selectedCase.matricule}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div id="print-maternity" className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Direction du Capital Humain & des Relations Sociales
Boulevard de la République, Plateau, Abidjan

ATTESTATION OFFICIELLE D'ACCORD DE CONGÉ MATERNITÉ
(En application de l'Article 23 de la Convention Collective Interprofessionnelle de Côte d'Ivoire)

Nous soussignés, SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI), attestons par la présente que :

Madame : ${selectedCase.name}
Matricule : ${selectedCase.matricule}
Fonction : ${selectedCase.poste}
Affectation : ${selectedCase.agence}
Dossier CNPS N° : ${selectedCase.numeroCnpsPrestation}

Est autorisée à suspendre son activité professionnelle pour bénéficier de son congé légal de maternité de quatorze (14) semaines consécutives :

- Date de début du congé : ${selectedCase.dateDebutConge}
- Date prévisionnelle de reprise de service : ${selectedCase.dateFinConge}
- Date d'échéance des droits d'allaitement (15 mois) : ${selectedCase.dateFinAllaitement}
- Créneau d'allaitement accordé à la reprise : ${selectedCase.creneauAllaitementChoisi}

La présente attestation est délivrée pour valoir ce que de droit auprès de la CAISSE NATIONALE DE PRÉVOYANCE SOCIALE (CNPS) pour la liquidation des indemnités journalières de repos maternité.

Fait à Abidjan, le ${todayStr}.


Pour la Direction du Capital Humain
SII Côte d'Ivoire
(Signature & Sceau autorité RH)`}
          </div>
        </div>
      )}
    </div>
  );
}
