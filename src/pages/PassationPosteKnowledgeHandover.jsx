import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Layers,
  KeyRound,
  Eye,
  Info
} from 'lucide-react';

// TRANSFERT DE CONNAISSANCES & PASSATION DE POSTE (Knowledge Handover)
// Plan structuré sur 30 jours avant départ, mutation ou retraite :
// - Dossiers clients/projets actifs, accès et outils, contacts clés, procédures terrain
// - Double validation croisée (Sortant <-> Repreneur) obligatoire avant clôture offboarding

const MOCK_HANDOVERS = [
  {
    id: 'PASS-2026-019',
    sortantNom: 'Kouamé N\'Goran Jean-Baptiste',
    sortantMatricule: 'MTR-2018-0104',
    poste: 'Chef de Caisse Principal',
    agence: 'Agence Centrale Plateau',
    motif: 'Départ Retraite Anticipée',
    dateDepart: '2026-12-15',
    repreneurNom: 'Bamba Fatoumata',
    repreneurMatricule: 'MTR-2021-0089',
    joursRestants: 21,
    statut: 'EN_COURS', // 'EN_COURS' | 'VALIDE' | 'RETARD'
    items: [
      { id: 1, categorie: 'Procédures Critiques', titre: 'Protocole de clôture de coffre fort & réconciliation espèces/OM', valideSortant: true, valideRepreneur: true },
      { id: 2, categorie: 'Dossiers Actifs', titre: 'Suivi des 14 conventions entreprises (dépôts hebdomadaires Plateau)', valideSortant: true, valideRepreneur: true },
      { id: 3, categorie: 'Accès & Outils', titre: 'Transfert des clés physiques coffre secondaire & matrice habilitations ERP', valideSortant: true, valideRepreneur: false },
      { id: 4, categorie: 'Contacts Clés', titre: 'Annuaire direct transporteurs de fonds (Brink\'s / G4S) & banque centrale', valideSortant: false, valideRepreneur: false }
    ]
  },
  {
    id: 'PASS-2026-015',
    sortantNom: 'Coulibaly Brahima',
    sortantMatricule: 'MTR-2015-0077',
    poste: 'Superviseur Logistique Terrain',
    agence: 'Direction Régionale San Pedro',
    motif: 'Mutation vers Siège Abidjan',
    dateDepart: '2026-11-30',
    repreneurNom: 'Yao N\'Guessan Sylvestre',
    repreneurMatricule: 'MTR-2023-0215',
    joursRestants: 6,
    statut: 'VALIDE',
    items: [
      { id: 1, categorie: 'Procédures Critiques', titre: 'Planning maintenance préventive groupes électrogènes & clims San Pedro', valideSortant: true, valideRepreneur: true },
      { id: 2, categorie: 'Dossiers Actifs', titre: 'Inventaire complet flotte 12 motos & cartes carburant', valideSortant: true, valideRepreneur: true },
      { id: 3, categorie: 'Contacts Clés', titre: 'Fournisseurs agréés gasoil & prestataires sécurité portuaire', valideSortant: true, valideRepreneur: true }
    ]
  },
  {
    id: 'PASS-2026-022',
    sortantNom: 'Diallo Ousmane',
    sortantMatricule: 'MTR-2023-0311',
    poste: 'Ingénieur Réseau & Fibre',
    agence: 'Agence Yopougon Keneya',
    motif: 'Démission',
    dateDepart: '2026-12-02',
    repreneurNom: 'Konan Kouadio Blaise',
    repreneurMatricule: 'MTR-2021-0205',
    joursRestants: 8,
    statut: 'RETARD',
    items: [
      { id: 1, categorie: 'Documentation Technique', titre: 'Schémas d\'architecture fibres & baies de brassage zone Yopougon', valideSortant: true, valideRepreneur: false },
      { id: 2, categorie: 'Accès & Outils', titre: 'Révocation accès SSH/VPN & transfert coffre mots de passe admin', valideSortant: false, valideRepreneur: false },
      { id: 3, categorie: 'Dossiers Actifs', titre: 'Passation des 6 tickets incidents clients B2B ouverts', valideSortant: false, valideRepreneur: false }
    ]
  }
];

export default function PassationPosteKnowledgeHandover() {
  const [handovers, setHandovers] = useState(MOCK_HANDOVERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(MOCK_HANDOVERS[0].id);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'checklist' | 'pv'

  const selectedHandover = useMemo(
    () => handovers.find((h) => h.id === selectedId) || handovers[0],
    [handovers, selectedId]
  );

  const getCompletion = (h) => {
    if (!h.items.length) return 0;
    const totalChecks = h.items.length * 2;
    const doneChecks = h.items.reduce(
      (acc, item) => acc + (item.valideSortant ? 1 : 0) + (item.valideRepreneur ? 1 : 0),
      0
    );
    return Math.round((doneChecks / totalChecks) * 100);
  };

  const toggleValidation = (itemId, role) => {
    setHandovers((prev) =>
      prev.map((h) => {
        if (h.id !== selectedHandover.id) return h;
        const updatedItems = h.items.map((item) => {
          if (item.id !== itemId) return item;
          return role === 'sortant'
            ? { ...item, valideSortant: !item.valideSortant }
            : { ...item, valideRepreneur: !item.valideRepreneur };
        });
        const allDone = updatedItems.every((i) => i.valideSortant && i.valideRepreneur);
        return {
          ...h,
          items: updatedItems,
          statut: allDone ? 'VALIDE' : h.statut === 'VALIDE' ? 'EN_COURS' : h.statut
        };
      })
    );
  };

  const filteredHandovers = useMemo(() => {
    return handovers.filter((h) => {
      const matchSearch =
        h.sortantNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.repreneurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.agence.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || h.statut === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [handovers, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    let enCours = 0;
    let valides = 0;
    let retards = 0;
    handovers.forEach((h) => {
      if (h.statut === 'VALIDE') valides++;
      else if (h.statut === 'RETARD') retards++;
      else enCours++;
    });
    return { total: handovers.length, enCours, valides, retards };
  }, [handovers]);

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Continuité d'Activité & Savoir-Faire
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Knowledge Handover 30 Jours
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Transfert de Connaissances & Passation de Poste
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Sécurisez le capital immatériel lors des départs, mutations et retraites : double validation croisée Sortant ⇄ Repreneur et PV officiel de passation avant remise du Solde de Tout Compte.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'list' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Passations en Cours
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'checklist' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Checklist Croisée
            </button>
            <button
              onClick={() => setActiveTab('pv')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'pv' ? 'bg-[#008000] text-white shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              PV de Passation
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dossiers Suivis</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.total} passations</h3>
            <p className="text-xs text-gray-500 mt-1">Départs & mutations</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">En Cours</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.enCours} dossier(s)</h3>
            <p className="text-xs text-gray-500 mt-1">Transferts actifs</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alerte Retard</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.retards} critique(s)</h3>
            <p className="text-xs text-red-500 mt-1 font-medium">Départ imminent (&lt; 10j)</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Certifiées 100%</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.valides} validée(s)</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">Quitus STC autorisé</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Vue 1 : Liste des Passations */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher sortant, repreneur, poste..."
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
                <option value="ALL">Tous</option>
                <option value="EN_COURS">En cours</option>
                <option value="RETARD">En retard</option>
                <option value="VALIDE">Validée 100%</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Sortant ➔ Repreneur</th>
                  <th className="py-3.5 px-4">Poste & Motif</th>
                  <th className="py-3.5 px-4 text-center">Échéance Départ</th>
                  <th className="py-3.5 px-4 text-center">Avancement Croisé</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHandovers.map((h) => {
                  const pct = getCompletion(h);
                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedId(h.id);
                        setActiveTab('checklist');
                      }}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5 text-xs">
                          <span>{h.sortantNom}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#008000]" />
                          <span className="text-[#002B7F]">{h.repreneurNom}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">{h.id} • {h.agence}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-gray-800">{h.poste}</div>
                        <div className="text-[11px] text-gray-500">{h.motif}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs">
                        <div className="font-semibold text-gray-800">{h.dateDepart}</div>
                        <div className={`text-[10px] font-bold ${h.joursRestants <= 10 ? 'text-red-600' : 'text-gray-500'}`}>
                          J-{h.joursRestants}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-gray-900 text-xs">{pct}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${pct === 100 ? 'bg-[#008000]' : pct >= 50 ? 'bg-[#002B7F]' : 'bg-red-600'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          h.statut === 'VALIDE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : h.statut === 'RETARD'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-[#002B7F] border border-blue-200'
                        }`}>
                          {h.statut === 'VALIDE' ? 'Validée 100%' : h.statut === 'RETARD' ? 'En retard' : 'En cours'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedId(h.id);
                            setActiveTab('checklist');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
                        >
                          Ouvrir Checklist
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

      {/* Vue 2 : Checklist interactive Sortant <-> Repreneur */}
      {activeTab === 'checklist' && selectedHandover && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {selectedHandover.id} • {selectedHandover.agence}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedHandover.poste}</h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Sortant : <strong>{selectedHandover.sortantNom}</strong> ➔ Repreneur : <strong className="text-[#002B7F]">{selectedHandover.repreneurNom}</strong>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-gray-500">Complétion globale</span>
                <p className="text-2xl font-black text-[#008000] font-mono">{getCompletion(selectedHandover)}%</p>
              </div>
              <button
                onClick={() => setActiveTab('pv')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5 shadow"
              >
                <FileText className="w-4 h-4" />
                Générer PV Officiel
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">
                Points de Passation — Cliquez pour cocher la double validation croisée
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {selectedHandover.items.map((item) => (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#002B7F] border border-blue-200">
                      {item.categorie}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{item.titre}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      onClick={() => toggleValidation(item.id, 'sortant')}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                        item.valideSortant
                          ? 'bg-emerald-50 text-[#008000] border-emerald-300'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {item.valideSortant ? '✓ Transmis (Sortant)' : 'Marquer transmis'}
                    </button>
                    <button
                      onClick={() => toggleValidation(item.id, 'repreneur')}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                        item.valideRepreneur
                          ? 'bg-blue-50 text-[#002B7F] border-blue-300'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {item.valideRepreneur ? '✓ Reçu & Maîtrisé (Repreneur)' : 'Confirmer réception'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : PV Officiel de Passation */}
      {activeTab === 'pv' && selectedHandover && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              Procès-Verbal de Passation de Service & Transfert de Charges
            </h3>
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
                  const content = document.getElementById('print-pv-handover').innerText;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `PV_Passation_${selectedHandover.id}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div id="print-pv-handover" className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Direction du Capital Humain — Procès-Verbal de Passation de Service
Réf : ${selectedHandover.id} | Abidjan, le ${todayStr}

POSTE CONCERNÉ : ${selectedHandover.poste} — ${selectedHandover.agence}
Collaborateur Sortant : ${selectedHandover.sortantNom} (${selectedHandover.sortantMatricule})
Collaborateur Repreneur : ${selectedHandover.repreneurNom} (${selectedHandover.repreneurMatricule})
Date effective de départ / mutation : ${selectedHandover.dateDepart}
Taux de complétion certifié : ${getCompletion(selectedHandover)} %

INVENTAIRE DES DOSSIERS & ACCÈS TRANSFÉRÉS :
${selectedHandover.items.map((i, idx) => `${idx + 1}. [${i.categorie}] ${i.titre} — Sortant: ${i.valideSortant ? 'OK' : 'NON'} | Repreneur: ${i.valideRepreneur ? 'OK' : 'NON'}`).join('\n')}

Le présent procès-verbal atteste la transmission effective des dossiers, clés, accès informatiques et procédures nécessaires à la continuité de service sans rupture.

Signature Sortant                 Signature Repreneur                 Visa Direction RH`}
          </div>
        </div>
      )}
    </div>
  );
}
