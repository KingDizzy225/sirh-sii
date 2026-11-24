import React, { useState, useMemo } from 'react';
import { 
  FileCheck, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Search, 
  Printer, 
  Download, 
  Users, 
  ShieldCheck, 
  Send,
  Eye,
  Info
} from 'lucide-react';

// DIFFUSION DE NOTES DE SERVICE, RÈGLEMENT INTÉRIEUR & ACCUSÉS DE LECTURE CERTIFIÉS
// Preuve opposable d'émargement numérique ("Lu et pris connaissance" horodaté)
// pour le Règlement Intérieur (Art. 15.1 Code CI) et les consignes de sécurité.

const MOCK_CIRCULARS = [
  {
    id: 'NOTE-2026-042',
    titre: 'Règlement Intérieur 2026 (Visé par l\'Inspection du Travail)',
    categorie: 'Règlement Intérieur',
    cible: 'Tous les collaborateurs (248)',
    dateDiffusion: '2026-10-01',
    dateLimiteLecture: '2026-10-31',
    totalDestinataires: 248,
    totalEmarges: 239,
    obligatoire: true,
    contenuResume: 'Mise à jour des horaires d\'ouverture d\'agence, règles d\'hygiène CSST, échelle des sanctions Art. 16 CCNI et charte de confidentialité bancaire.',
    retardataires: [
      { matricule: 'MTR-2022-0142', name: 'Kouassi Marc-Antoine', agence: 'Agence Centrale Plateau', relances: 2 },
      { matricule: 'MTR-2023-0311', name: 'Diallo Ousmane', agence: 'Agence Yopougon Keneya', relances: 1 }
    ]
  },
  {
    id: 'NOTE-2026-048',
    titre: 'Procédure Renforcée de Clôture de Caisse & Anti-Fraude SIM',
    categorie: 'Sécurité & Procédures',
    cible: 'Opérations Réseau & Boutiques (142)',
    dateDiffusion: '2026-11-10',
    dateLimiteLecture: '2026-11-25',
    totalDestinataires: 142,
    totalEmarges: 118,
    obligatoire: true,
    contenuResume: 'Double vérification biométrique obligatoire pour tout retrait espèces supérieur à 500 000 FCFA et réconciliation quotidienne des stocks cartes SIM.',
    retardataires: [
      { matricule: 'MTR-2023-0215', name: 'Yao N\'Guessan Sylvestre', agence: 'Agence Cocody Deux-Plateaux', relances: 1 },
      { matricule: 'MTR-2021-0163', name: 'N\'Dri Kouadio Patrick', agence: 'Agence Abobo Gare', relances: 0 }
    ]
  },
  {
    id: 'NOTE-2026-051',
    titre: 'Charte Informatique, Cybersécurité & Protection des Données (ARTCI)',
    categorie: 'Conformité & IT',
    cible: 'Tous les collaborateurs (248)',
    dateDiffusion: '2026-11-18',
    dateLimiteLecture: '2026-12-05',
    totalDestinataires: 248,
    totalEmarges: 164,
    obligatoire: true,
    contenuResume: 'Règles d\'usage des postes professionnels, interdiction des clés USB non chiffrées et signalement sous 2h de tout courriel de phishing.',
    retardataires: [
      { matricule: 'MTR-2020-0078', name: 'Touré Adama', agence: 'Agence Zone Industrielle Vridi', relances: 0 }
    ]
  }
];

export default function NotesServiceAccusesLecture() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState(MOCK_CIRCULARS[0]);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'tracking' | 'certificate'
  const [relanceMessage, setRelanceMessage] = useState(null);
  const [signedByMe, setSignedByMe] = useState({});

  const filteredNotes = useMemo(() => {
    return MOCK_CIRCULARS.filter(
      (n) =>
        n.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const stats = useMemo(() => {
    const totalDocs = MOCK_CIRCULARS.length;
    const totalCibles = MOCK_CIRCULARS.reduce((acc, n) => acc + n.totalDestinataires, 0);
    const totalLus = MOCK_CIRCULARS.reduce((acc, n) => acc + n.totalEmarges, 0);
    const tauxGlobal = Math.round((totalLus / totalCibles) * 100);
    const enAttente = totalCibles - totalLus;
    return { totalDocs, tauxGlobal, enAttente };
  }, []);

  const handleRelance = (note) => {
    setRelanceMessage(`Relance officielle envoyée aux ${note.totalDestinataires - note.totalEmarges} collaborateur(s) n'ayant pas encore émargé "${note.titre}".`);
    setTimeout(() => setRelanceMessage(null), 5000);
  };

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Opposabilité & Conformité Interne
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Émargement Numérique Horodaté
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Notes de Service, Règlement Intérieur & Accusés de Lecture
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Diffusez vos notes officielles, chartes et Règlement Intérieur avec preuve horodatée de lecture par chaque collaborateur et relance automatisée des retardataires.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'list' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Documents Diffusés
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'tracking' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Suivi & Relances
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'certificate' ? 'bg-[#008000] text-white shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Registre Probant
            </button>
          </div>
        </div>
      </div>

      {relanceMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-[#008000] rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{relanceMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notes Actives</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{stats.totalDocs} documents</h3>
            <p className="text-xs text-gray-500 mt-1">À émargement obligatoire</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Taux d'Émargement Global</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1">{stats.tauxGlobal} %</h3>
            <p className="text-xs text-[#008000] mt-1 font-medium">Accusés horodatés archivés</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lectures en Attente</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.enAttente} émargements</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Relance 1 clic disponible</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Bell className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Vue 1 : Liste des Notes */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher note, charte, règlement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredNotes.map((n) => {
              const pct = Math.round((n.totalEmarges / n.totalDestinataires) * 100);
              const isSigned = signedByMe[n.id];
              return (
                <div key={n.id} className="p-5 hover:bg-blue-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{n.id}</span>
                      <span className="text-[11px] font-semibold text-[#002B7F] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {n.categorie}
                      </span>
                      <span className="text-[11px] text-gray-500">Échéance : {n.dateLimiteLecture}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{n.titre}</h3>
                    <p className="text-xs text-gray-600">{n.contenuResume}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-center min-w-[110px]">
                      <div className="text-xs font-mono font-bold text-gray-900">
                        {n.totalEmarges} / {n.totalDestinataires} ({pct}%)
                      </div>
                      <div className="w-28 bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-[#008000]' : 'bg-[#002B7F]'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSignedByMe({ ...signedByMe, [n.id]: true })}
                        disabled={isSigned}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          isSigned
                            ? 'bg-emerald-50 text-[#008000] border-emerald-300'
                            : 'bg-[#008000] text-white border-[#008000] hover:bg-emerald-700'
                        }`}
                      >
                        {isSigned ? '✓ Lu & Approuvé' : 'Émarger (Lu)'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNote(n);
                          setActiveTab('tracking');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        Suivi
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vue 2 : Suivi des Retardataires & Relances */}
      {activeTab === 'tracking' && selectedNote && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-mono text-gray-500">{selectedNote.id} • Cible : {selectedNote.cible}</span>
              <h2 className="text-lg font-bold text-gray-900">{selectedNote.titre}</h2>
            </div>
            <button
              onClick={() => handleRelance(selectedNote)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              Relancer les Retardataires ({selectedNote.totalDestinataires - selectedNote.totalEmarges})
            </button>
          </div>

          <div className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase">Échantillon de Collaborateurs n'ayant pas encore émargé :</h4>
            <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
              {selectedNote.retardataires.map((r, i) => (
                <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900">{r.name}</span>
                    <span className="text-gray-500 font-mono ml-2">({r.matricule})</span>
                    <div className="text-gray-500">{r.agence}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {r.relances} relance(s) envoyée(s)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Registre Probant Exportable */}
      {activeTab === 'certificate' && selectedNote && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              Attestation Probante de Diffusion & d'Émargement ({selectedNote.id})
            </h3>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer le Registre
            </button>
          </div>

          <div className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
REGISTRE PROBANT DE DIFFUSION & ACCUSÉS DE LECTURE
Date d'extraction : ${todayStr}

Document : ${selectedNote.titre} (${selectedNote.id})
Catégorie : ${selectedNote.categorie}
Date de diffusion : ${selectedNote.dateDiffusion}
Population ciblée : ${selectedNote.cible}
Nombre d'émargements horodatés enregistrés : ${selectedNote.totalEmarges} / ${selectedNote.totalDestinataires} (${Math.round((selectedNote.totalEmarges / selectedNote.totalDestinataires) * 100)}%)

Certifié conforme par le Système d'Information des Ressources Humaines (SIRH-SII) pour valoir preuve d'opposabilité devant toute instance administrative ou prud'homale.`}
          </div>
        </div>
      )}
    </div>
  );
}
