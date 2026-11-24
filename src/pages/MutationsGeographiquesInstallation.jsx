import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Truck, 
  Home, 
  FileText, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  DollarSign, 
  Users,
  Info
} from 'lucide-react';

// GESTION DES MUTATIONS GÉOGRAPHIQUES & PACKAGE D'INSTALLATION PROVINCE (CCNI Art. 31)
// Encadre les affectations géographiques (ex: Abidjan -> Bouaké, San Pedro, Korhogo, Man) :
// - Frais de voyage du travailleur et de sa famille + transport mobilier
// - Hébergement temporaire d'installation (15 à 30 jours)
// - Prime d'installation & Allocation mensuelle de logement de fonction

const MOCK_RELOCATIONS = [
  {
    id: 'MUT-2026-011',
    matricule: 'MTR-2020-0064',
    name: 'Kouyaté Moussa',
    poste: 'Chef d\'Agence Régionale',
    categorieCcni: '10ème Catégorie (Cadre)',
    villeOrigine: 'Abidjan Plateau',
    villeDestination: 'Bouaké Centre',
    distanceKm: 345,
    situationFamiliale: 'Marié, 3 enfants à charge',
    datePrisePoste: '2026-12-01',
    fraisDemenagement: 450000,
    forfaitHotelJours: 21,
    coutHotelJournalier: 35000,
    primeInstallation: 300000,
    allocationLogementMensuelle: 150000,
    statut: 'VALIDEE'
  },
  {
    id: 'MUT-2026-014',
    matricule: 'MTR-2022-0178',
    name: 'Gbagbo Éric-Olivier',
    poste: 'Superviseur Technique Fibre',
    categorieCcni: '8ème Catégorie (Maîtrise)',
    villeOrigine: 'Abidjan Yopougon',
    villeDestination: 'Korhogo Nord',
    distanceKm: 635,
    situationFamiliale: 'Marié, 1 enfant à charge',
    datePrisePoste: '2027-01-04',
    fraisDemenagement: 550000,
    forfaitHotelJours: 15,
    coutHotelJournalier: 28000,
    primeInstallation: 250000,
    allocationLogementMensuelle: 100000,
    statut: 'EN_PREPARATION'
  },
  {
    id: 'MUT-2026-008',
    matricule: 'MTR-2019-0092',
    name: 'Aka Adjoua Estelle',
    poste: 'Responsable Clientèle PME',
    categorieCcni: '9ème Catégorie (Cadre)',
    villeOrigine: 'Yamoussoukro',
    villeDestination: 'San Pedro Port',
    distanceKm: 390,
    situationFamiliale: 'Célibataire',
    datePrisePoste: '2026-11-15',
    fraisDemenagement: 300000,
    forfaitHotelJours: 15,
    coutHotelJournalier: 32000,
    primeInstallation: 200000,
    allocationLogementMensuelle: 120000,
    statut: 'INSTALLEE'
  }
];

export default function MutationsGeographiquesInstallation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMut, setSelectedMut] = useState(MOCK_RELOCATIONS[0]);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'order'

  const getPackageTotal = (m) => {
    return m.fraisDemenagement + m.forfaitHotelJours * m.coutHotelJournalier + m.primeInstallation;
  };

  const filteredRelocations = useMemo(() => {
    return MOCK_RELOCATIONS.filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.villeDestination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.villeOrigine.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalBudget = useMemo(
    () => MOCK_RELOCATIONS.reduce((acc, m) => acc + getPackageTotal(m), 0),
    []
  );

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Mobilité Géographique & Réseau
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Article 31 CCNI Côte d'Ivoire
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Mutations Géographiques & Package d'Installation Province
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Pilotez les affectations inter-villes (Abidjan ➔ Bouaké, San Pedro, Korhogo, Yamoussoukro) : déménagement, hôtel temporaire, prime d'installation et logement de fonction.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'list' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Dossiers de Mutation
            </button>
            <button
              onClick={() => setActiveTab('order')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'order' ? 'bg-[#008000] text-white shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Ordre de Mutation Officiel
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mutations Actives</p>
            <h3 className="text-2xl font-bold text-[#002B7F] mt-1">{MOCK_RELOCATIONS.length} dossiers</h3>
            <p className="text-xs text-gray-500 mt-1">Déploiement agences régions</p>
          </div>
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-lg">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Installation Engagé</p>
            <h3 className="text-2xl font-bold text-[#008000] mt-1 font-mono">
              {totalBudget.toLocaleString('fr-FR')} F
            </h3>
            <p className="text-xs text-gray-500 mt-1">Déménagement + Hôtel + Prime</p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#008000] rounded-lg">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Logements de Fonction</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">370 000 F / mois</h3>
            <p className="text-xs text-gray-500 mt-1">Allocations logement cumulées</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-800 rounded-lg">
            <Home className="w-6 h-6 text-[#002B7F]" />
          </div>
        </div>
      </div>

      {/* Vue 1 : Liste des Mutations */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher salarié, ville d'origine ou destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Collaborateur & Famille</th>
                  <th className="py-3.5 px-4">Trajet de Mutation</th>
                  <th className="py-3.5 px-4 text-right">Package Installation</th>
                  <th className="py-3.5 px-4 text-right">Alloc. Logement</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRelocations.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedMut(m);
                      setActiveTab('order');
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.poste} • {m.situationFamiliale}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <span>{m.villeOrigine}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#008000]" />
                        <span className="text-[#002B7F]">{m.villeDestination}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">{m.distanceKm} km • Prise de poste : {m.datePrisePoste}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#002B7F] text-xs">
                      {getPackageTotal(m).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#008000] text-xs">
                      {m.allocationLogementMensuelle.toLocaleString('fr-FR')} F/m
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        m.statut === 'INSTALLEE'
                          ? 'bg-emerald-50 text-[#008000] border border-emerald-200'
                          : m.statut === 'VALIDEE'
                          ? 'bg-blue-50 text-[#002B7F] border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {m.statut === 'INSTALLEE' ? 'Installé(e)' : m.statut === 'VALIDEE' ? 'Validée' : 'En préparation'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedMut(m);
                          setActiveTab('order');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
                      >
                        Ordre Mutation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : Ordre de Mutation Officiel */}
      {activeTab === 'order' && selectedMut && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              Ordre Officiel de Mutation & Prise en Charge Logistique ({selectedMut.id})
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
                  const content = document.getElementById('print-mutation').innerText;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Ordre_Mutation_${selectedMut.matricule}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div id="print-mutation" className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Direction du Capital Humain — Mobilité Géographique
Réf : ${selectedMut.id} | Abidjan, le ${todayStr}

ORDRE OFFICIEL DE MUTATION GÉOGRAPHIQUE
(Conformément à l'Article 31 de la CCNI de Côte d'Ivoire)

Collaborateur : ${selectedMut.name} (${selectedMut.matricule})
Fonction & Catégorie : ${selectedMut.poste} — ${selectedMut.categorieCcni}
Situation familiale : ${selectedMut.situationFamiliale}

AFFECTATION :
- Résidence actuelle : ${selectedMut.villeOrigine}
- Nouvelle résidence d'affectation : ${selectedMut.villeDestination} (${selectedMut.distanceKm} km)
- Date de prise de service effective : ${selectedMut.datePrisePoste}

PACKAGE FINANCIER & LOGISTIQUE ACCORDÉ :
1. Frais de déménagement & transport du mobilier : ${selectedMut.fraisDemenagement.toLocaleString('fr-FR')} FCFA
2. Prise en charge hôtel temporaire (${selectedMut.forfaitHotelJours} jours x ${selectedMut.coutHotelJournalier.toLocaleString('fr-FR')} F) : ${(selectedMut.forfaitHotelJours * selectedMut.coutHotelJournalier).toLocaleString('fr-FR')} FCFA
3. Prime forfaitaire d'installation : ${selectedMut.primeInstallation.toLocaleString('fr-FR')} FCFA
--------------------------------------------------------------------------------
TOTAL PACKAGE INSTALLATION DÉCAISSABLE : ${getPackageTotal(selectedMut).toLocaleString('fr-FR')} FCFA
4. Allocation mensuelle de logement de fonction : ${selectedMut.allocationLogementMensuelle.toLocaleString('fr-FR')} FCFA / mois

Pour la Direction Générale & DCH                        Accusé de réception du Salarié
(Cachet & Signature)                                    ("Lu et accepté" + Signature)`}
          </div>
        </div>
      )}
    </div>
  );
}
