import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Download, 
  Printer, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  User, 
  Briefcase, 
  ChevronRight, 
  Scale, 
  ShieldCheck, 
  Clock, 
  Search,
  Building,
  Info
} from 'lucide-react';

const MOCK_DEPARTING_EMPLOYEES = [
  {
    id: 'EMP-0104',
    name: 'Kouamé N\'Goran Jean-Baptiste',
    matricule: 'MTR-2018-0104',
    poste: 'Chef de Caisse Principal',
    departement: 'Opérations Réseau',
    agence: 'Agence Centrale Plateau',
    dateEmbauche: '2018-03-01',
    dateDepart: '2026-11-30',
    typeRupture: 'LICENCIEMENT_ECONOMIQUE', // ou DEMISSION, FIN_CDD, RETRAITE
    salaireBrutMoyen: 680000,
    salaireBaseDernierMois: 550000,
    joursTravaillesMois: 26, // mois complet
    joursCongesReliquat: 18.5,
    preavisMoisPaye: 3, // 3 mois statut cadre/agent de maîtrise
    preavisDispense: true,
    pretRestantDu: 120000,
    statutDossier: 'Calcul finalisé'
  },
  {
    id: 'EMP-0219',
    name: 'Yao Akissi Mireille',
    matricule: 'MTR-2022-0219',
    poste: 'Conseillère Clientèle Boutique',
    departement: 'Commercial & Vente',
    agence: 'Agence Cocody Saint-Jean',
    dateEmbauche: '2022-07-15',
    dateDepart: '2026-11-15',
    typeRupture: 'DEMISSION',
    salaireBrutMoyen: 340000,
    salaireBaseDernierMois: 290000,
    joursTravaillesMois: 13, // 1/2 mois
    joursCongesReliquat: 7,
    preavisMoisPaye: 0, // Démission sans dispense payée
    preavisDispense: false,
    pretRestantDu: 0,
    statutDossier: 'En attente signature'
  },
  {
    id: 'EMP-0077',
    name: 'Coulibaly Brahima',
    matricule: 'MTR-2015-0077',
    poste: 'Superviseur Logistique Terrain',
    departement: 'Moyens Généraux & Sécurité',
    agence: 'Direction Régionale San Pedro',
    dateEmbauche: '2015-01-10',
    dateDepart: '2026-11-30',
    typeRupture: 'RUPTURE_AMIABLE',
    salaireBrutMoyen: 750000,
    salaireBaseDernierMois: 620000,
    joursTravaillesMois: 26,
    joursCongesReliquat: 22,
    preavisMoisPaye: 2,
    preavisDispense: true,
    pretRestantDu: 45000,
    statutDossier: 'Validé par DCH'
  }
];

export default function SoldeDeToutCompte() {
  const [selectedEmp, setSelectedEmp] = useState(MOCK_DEPARTING_EMPLOYEES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'receipt' | 'certificate'

  // Paramètres modifiables en direct
  const [salaireBrut, setSalaireBrut] = useState(selectedEmp.salaireBrutMoyen);
  const [joursConges, setJoursConges] = useState(selectedEmp.joursCongesReliquat);
  const [preavisMois, setPreavisMois] = useState(selectedEmp.preavisMoisPaye);
  const [deductionPret, setDeductionPret] = useState(selectedEmp.pretRestantDu);
  const [typeRupture, setTypeRupture] = useState(selectedEmp.typeRupture);

  // Synchronisation lors du changement d'employé
  const handleSelectEmp = (emp) => {
    setSelectedEmp(emp);
    setSalaireBrut(emp.salaireBrutMoyen);
    setJoursConges(emp.joursCongesReliquat);
    setPreavisMois(emp.preavisMoisPaye);
    setDeductionPret(emp.pretRestantDu);
    setTypeRupture(emp.typeRupture);
  };

  // Calcul d'ancienneté en années et mois
  const anciennete = useMemo(() => {
    const d1 = new Date(selectedEmp.dateEmbauche);
    const d2 = new Date(selectedEmp.dateDepart);
    const diffMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return { years, months, totalYearsDecimal: (diffMonths / 12) };
  }, [selectedEmp]);

  // Formule légale indemnité de licenciement (Art. 38 CCNI Côte d'Ivoire) :
  // - 30% du salaire moyen par an pour les 5 premières années (1 à 5 ans)
  // - 35% par an de la 6e à la 10e année
  // - 40% par an pour les années au-delà de la 10e
  const indemnites = useMemo(() => {
    const brutMoyen = Number(salaireBrut) || 0;
    const congesJours = Number(joursConges) || 0;
    const preavisNb = Number(preavisMois) || 0;
    const pret = Number(deductionPret) || 0;

    // 1. Salaire prorata temporis dernier mois
    const salaireDernierMois = Math.round((selectedEmp.salaireBaseDernierMois / 26) * selectedEmp.joursTravaillesMois);

    // 2. Indemnité compensatrice de congés payés reliquats
    // Règle CI : Brut moyen des 12 derniers mois / 30 * jours de reliquat
    const indemniteConges = Math.round((brutMoyen / 30) * congesJours);

    // 3. Indemnité compensatrice de préavis
    const indemnitePreavis = Math.round(brutMoyen * preavisNb);

    // 4. Indemnité légale de licenciement / rupture amiable (Art. 38 CCNI)
    let indemniteRupture = 0;
    if (typeRupture !== 'DEMISSION') {
      const yrs = anciennete.totalYearsDecimal;
      if (yrs <= 5) {
        indemniteRupture = brutMoyen * 0.30 * yrs;
      } else if (yrs <= 10) {
        indemniteRupture = (brutMoyen * 0.30 * 5) + (brutMoyen * 0.35 * (yrs - 5));
      } else {
        indemniteRupture = (brutMoyen * 0.30 * 5) + (brutMoyen * 0.35 * 5) + (brutMoyen * 0.40 * (yrs - 10));
      }
    }
    indemniteRupture = Math.round(indemniteRupture);

    // 5. Total Brut STC
    const totalBrut = salaireDernierMois + indemniteConges + indemnitePreavis + indemniteRupture;

    // 6. Net à Payer (déduction des prêts / acomptes)
    const netAPayer = Math.max(0, totalBrut - pret);

    return {
      salaireDernierMois,
      indemniteConges,
      indemnitePreavis,
      indemniteRupture,
      totalBrut,
      deductionPret: pret,
      netAPayer
    };
  }, [salaireBrut, joursConges, preavisMois, deductionPret, typeRupture, anciennete, selectedEmp]);

  const filteredEmployees = useMemo(() => {
    return MOCK_DEPARTING_EMPLOYEES.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.agence.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* En-tête officiel SII : Bleu Marine #002B7F & Vert Émeraude #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001c56] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Rupture de Contrat & Fin de Poste
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Art. 35 & 38 CCNI Côte d'Ivoire
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Simulateur & Reçu de Solde de Tout Compte (STC)
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Calcul certifié conforme au barème légal ivoirien : prorata salaire, congés payés reliquats, préavis compensé, indemnités de licenciement et génération immédiate du reçu libératoire et certificat de travail.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Calculateur STC
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'receipt'
                  ? 'bg-[#008000] text-white shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Reçu pour Solde
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'certificate'
                  ? 'bg-white text-[#002B7F] shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Certificat de Travail
            </button>
          </div>
        </div>
      </div>

      {/* Règle légale d'ordre public en Côte d'Ivoire */}
      <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <Scale className="w-5 h-5 text-[#002B7F] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#002B7F] font-semibold">Garantie légale de l'Article 35 du Code du Travail CI : </strong>
          Le reçu pour solde de tout compte délivré au travailleur lors de la résiliation de son contrat n'a d'effet libératoire pour l'employeur qu'à l'expiration d'un <strong>délai de forclusion de deux (2) mois</strong> à compter de sa signature. Durant ce délai, le travailleur conserve le droit de le contester par lettre recommandée ou par déclaration au greffe du Tribunal du Travail.
        </div>
      </div>

      {/* Onglet 1 : Simulateur & Calculs */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : Sélection & Paramètres du Salarié */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#002B7F]" />
                Salarié Partant
              </h3>

              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher salarié..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002B7F]"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredEmployees.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => handleSelectEmp(e)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedEmp.id === e.id
                        ? 'border-[#002B7F] bg-blue-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{e.name}</div>
                    <div className="text-gray-500 font-mono text-[11px]">{e.matricule} • {e.poste}</div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-[#008000] font-medium">{e.agence}</span>
                      <span className="text-gray-600 font-bold">{e.dateDepart}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ajustement des Paramètres de Calcul */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3.5">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Paramètres du Décompte
              </h4>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Motif de Rupture</label>
                <select
                  value={typeRupture}
                  onChange={(e) => setTypeRupture(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#002B7F]"
                >
                  <option value="LICENCIEMENT_ECONOMIQUE">Licenciement Motif Économique (Indemnités dues)</option>
                  <option value="LICENCIEMENT_SIMPLE">Licenciement Motif Personnel (Indemnités dues)</option>
                  <option value="RUPTURE_AMIABLE">Rupture Amiable Négociée (Indemnités dues)</option>
                  <option value="DEMISSION">Démission Volontaire (Pas d'indemnité licenciement)</option>
                  <option value="FIN_CDD">Terme Échu CDD (Indemnité précarité 7%)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Salaire Brut Moyen (12 derniers mois - FCFA)
                </label>
                <input
                  type="number"
                  value={salaireBrut}
                  onChange={(e) => setSalaireBrut(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#002B7F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Reliquat Congés (Jours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={joursConges}
                    onChange={(e) => setJoursConges(Number(e.target.value))}
                    className="w-full text-xs font-mono border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#002B7F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Préavis Payé (Mois)
                  </label>
                  <input
                    type="number"
                    value={preavisMois}
                    onChange={(e) => setPreavisMois(Number(e.target.value))}
                    className="w-full text-xs font-mono border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#002B7F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Déduction Prêt / Avances Restant Dû (FCFA)
                </label>
                <input
                  type="number"
                  value={deductionPret}
                  onChange={(e) => setDeductionPret(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#002B7F]"
                />
              </div>
            </div>
          </div>

          {/* Colonne droite (2 tiers) : Décomposition Détaillée du STC */}
          <div className="lg:col-span-2 space-y-4">
            {/* Carte Récapitulative du Net */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Net à Payer au Collaborateur
                </span>
                <h2 className="text-3xl font-black text-[#002B7F] mt-1">
                  {indemnites.netAPayer.toLocaleString('fr-FR')} <span className="text-lg font-bold">FCFA</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ancienneté retenue : <strong>{anciennete.years} ans et {anciennete.months} mois</strong> (du {selectedEmp.dateEmbauche} au {selectedEmp.dateDepart})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('receipt')}
                  className="px-4 py-2 rounded-lg bg-[#008000] text-white hover:bg-emerald-700 font-semibold text-xs flex items-center gap-1.5 shadow"
                >
                  <FileText className="w-4 h-4" />
                  Éditer Reçu STC
                </button>
                <button
                  onClick={() => setActiveTab('certificate')}
                  className="px-4 py-2 rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 font-semibold text-xs flex items-center gap-1.5 shadow"
                >
                  <FileText className="w-4 h-4" />
                  Certificat de Travail
                </button>
              </div>
            </div>

            {/* Tableau détaillé des rubriques */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Décomposition Réglementaire des Droits Acquis
                </h3>
                <span className="text-xs font-semibold text-[#002B7F] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Conforme CCNI
                </span>
              </div>

              <div className="divide-y divide-gray-200 text-xs">
                {/* 1. Salaire dernier mois */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div>
                    <div className="font-semibold text-gray-900">
                      1. Salaire Prorata Temporis du Dernier Mois
                    </div>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      Base mensuelle : {selectedEmp.salaireBaseDernierMois.toLocaleString('fr-FR')} FCFA ({selectedEmp.joursTravaillesMois}/26 jours ouvrables)
                    </div>
                  </div>
                  <div className="font-mono font-bold text-gray-800 text-sm">
                    {indemnites.salaireDernierMois.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>

                {/* 2. Congés payés reliquats */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div>
                    <div className="font-semibold text-gray-900">
                      2. Indemnité Compensatrice de Congés Payés Reliquats
                    </div>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      {joursConges} jours acquis non consommés × indemnité journalière ({Math.round(salaireBrut / 30).toLocaleString('fr-FR')} FCFA/j)
                    </div>
                  </div>
                  <div className="font-mono font-bold text-gray-800 text-sm">
                    {indemnites.indemniteConges.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>

                {/* 3. Indemnité de préavis */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div>
                    <div className="font-semibold text-gray-900">
                      3. Indemnité Compensatrice de Préavis (Dispense légale)
                    </div>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      {preavisMois} mois × {salaireBrut.toLocaleString('fr-FR')} FCFA (Art. 34 CCNI)
                    </div>
                  </div>
                  <div className="font-mono font-bold text-gray-800 text-sm">
                    {indemnites.indemnitePreavis.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>

                {/* 4. Indemnité de licenciement / rupture */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div>
                    <div className="font-semibold text-gray-900">
                      4. Indemnité Légale de Licenciement / Rupture Amiable
                    </div>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      Barème Art. 38 CCNI (30% de 1 à 5 ans, 35% de 6 à 10 ans, 40% au-delà)
                    </div>
                  </div>
                  <div className="font-mono font-bold text-[#008000] text-sm">
                    {indemnites.indemniteRupture.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>

                {/* Total Brut */}
                <div className="p-4 bg-gray-50/75 flex items-center justify-between font-bold">
                  <div className="text-gray-800">TOTAL BRUT DU SOLDE DE TOUT COMPTE</div>
                  <div className="font-mono text-gray-900 text-base">
                    {indemnites.totalBrut.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>

                {/* Déduction prêt */}
                {indemnites.deductionPret > 0 && (
                  <div className="p-4 flex items-center justify-between text-red-600 bg-red-50/30">
                    <div>
                      <div className="font-semibold">Moins : Déduction des Prêts & Avances en Cours</div>
                      <div className="text-red-500 text-[11px]">Remboursement du solde de prêt restant dû</div>
                    </div>
                    <div className="font-mono font-bold">
                      - {indemnites.deductionPret.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                )}

                {/* Net Final */}
                <div className="p-4 bg-blue-50/50 flex items-center justify-between font-extrabold text-base">
                  <div className="text-[#002B7F]">MONTANT NET À RÉGLER PAR CHÈQUE OU VIREMENT</div>
                  <div className="font-mono text-[#002B7F] text-lg">
                    {indemnites.netAPayer.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglet 2 : Reçu pour Solde de Tout Compte Officiel */}
      {activeTab === 'receipt' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                Reçu Officiel pour Solde de Tout Compte (Art. 35 Code du Travail CI)
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
                  const content = document.getElementById('print-receipt').innerText;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Recu_STC_${selectedEmp.matricule}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002B7F] text-white hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
            </div>
          </div>

          <div id="print-receipt" className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Direction du Capital Humain & des Relations Sociales
Boulevard de la République, Plateau, Abidjan — République de Côte d'Ivoire

REÇU POUR SOLDE DE TOUT COMPTE
(Établi en double exemplaire original conformément à l'Article 35 du Code du Travail CI)

Je soussigné(e) :
Nom et Prénoms : ${selectedEmp.name}
Matricule : ${selectedEmp.matricule}
Fonction : ${selectedEmp.poste}
Affectation : ${selectedEmp.agence}
Date d'embauche : ${selectedEmp.dateEmbauche}
Date de cessation effective des fonctions : ${selectedEmp.dateDepart}
Ancienneté totale : ${anciennete.years} ans et ${anciennete.months} mois

Reconnais avoir reçu ce jour de la SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI), par virement bancaire / chèque certifié, la somme totale nette de :
>>> ${indemnites.netAPayer.toLocaleString('fr-FR')} FRANCS CFA <<<

Cette somme m'est versée pour solde de tout compte et règlement définitif de toutes indemnités et rémunérations dues au titre de l'exécution et de la résiliation de mon contrat de travail, selon la décomposition ci-après :

1. Salaire prorata temporis du dernier mois : ${indemnites.salaireDernierMois.toLocaleString('fr-FR')} FCFA
2. Indemnité compensatrice de congés payés (${joursConges} j) : ${indemnites.indemniteConges.toLocaleString('fr-FR')} FCFA
3. Indemnité compensatrice de préavis (${preavisMois} mois) : ${indemnites.indemnitePreavis.toLocaleString('fr-FR')} FCFA
4. Indemnité légale de licenciement / rupture (Art. 38 CCNI) : ${indemnites.indemniteRupture.toLocaleString('fr-FR')} FCFA
--------------------------------------------------------------------------------
TOTAL BRUT DU SOLDE : ${indemnites.totalBrut.toLocaleString('fr-FR')} FCFA
DÉDUCTION (Prêt / avances restant dû) : - ${indemnites.deductionPret.toLocaleString('fr-FR')} FCFA
--------------------------------------------------------------------------------
NET FINAL PAYÉ : ${indemnites.netAPayer.toLocaleString('fr-FR')} FCFA

MENTION LÉGALE D'ORDRE PUBLIC (Article 35 alinéa 2 du Code du Travail de Côte d'Ivoire) :
"Le présent reçu pour solde de tout compte peut être dénoncé par le travailleur dans un délai de deux (2) mois à compter de sa signature, par lettre recommandée avec accusé de réception ou par déclaration faite au greffe du Tribunal du Travail compétent."

Fait à Abidjan, en deux exemplaires originaux, le ${todayStr}.

Pour la Société SII-CI                                  Le Salarié
(Signature et cachet RH)                                (Signature précédée de la mention manuscrite
                                                         "Pour solde de tout compte et agréé pour la somme
                                                         de ${indemnites.netAPayer.toLocaleString('fr-FR')} FCFA")`}
          </div>
        </div>
      )}

      {/* Onglet 3 : Certificat de Travail Officiel */}
      {activeTab === 'certificate' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002B7F]" />
              <h3 className="text-sm font-bold text-gray-900">
                Certificat de Travail Obligatoire (Art. 36 Code du Travail CI)
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
            </div>
          </div>

          <div className="p-8 font-mono text-xs text-gray-800 whitespace-pre-line leading-relaxed bg-white">
{`RÉPUBLIQUE DE CÔTE D'IVOIRE
Union - Discipline - Travail
-------------------------------------------------------
SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI)
Siège Social : Boulevard de la République, Plateau, Abidjan

CERTIFICAT DE TRAVAIL
(Délivré en application de l'Article 36 du Code du Travail de Côte d'Ivoire)

Nous soussignés, SOCIÉTÉ IVOIRIENNE D'INGÉNIERIE & DE SERVICES (SII-CI), représentée par sa Direction du Capital Humain, certifions par la présente que :

Monsieur / Madame : ${selectedEmp.name}
Matricule : ${selectedEmp.matricule}

A été employé(e) au sein de notre établissement en qualité de :
- Poste occupé : ${selectedEmp.poste}
- Entité / Affectation : ${selectedEmp.agence}
- Période d'emploi : Du ${selectedEmp.dateEmbauche} au ${selectedEmp.dateDepart}

Monsieur / Madame ${selectedEmp.name} quitte notre société ce jour, libre de tout engagement professionnel envers notre entreprise.

En foi de quoi, le présent certificat lui est délivré pour servir et valoir ce que de droit.

Fait à Abidjan, le ${todayStr}.


Pour la Direction du Capital Humain
SII Côte d'Ivoire
(Signature & Sceau officiel)`}
          </div>
        </div>
      )}
    </div>
  );
}
