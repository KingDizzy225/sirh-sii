import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Users, 
  ShieldAlert, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Download, 
  Clock, 
  RefreshCw,
  Info
} from 'lucide-react';

// LICENCIEMENT ÉCONOMIQUE COLLECTIF & ORDRE LÉGAL DES LICENCIEMENTS
// Cadre légal : Articles 18.9 à 18.15 du Code du Travail de Côte d'Ivoire.
// 1. Critères d'ordre légaux obligatoires (Art. 18.10) :
//    - Aptitudes professionnelles (évaluées en premier)
//    - Ancienneté dans l'entreprise
//    - Charges de famille (majoration légale d'1 an d'ancienneté par enfant à charge)
// 2. Procédure impérative : Dossier transmis aux Délégués du Personnel et à l'Inspecteur
//    du Travail au moins 15 jours ouvrables avant la réunion d'information.
// 3. Priorité de réembauchage (Art. 18.15) : Valable pendant 2 ans dans la même catégorie.

const MOCK_POOL_EMPLOYEES = [
  { id: 'E-01', matricule: 'MTR-2024-0301', name: 'Koné Seydou', poste: 'Agent Guichet', aptitudeScore: 62, ancienneteAns: 2, enfantsACharge: 0, marie: false },
  { id: 'E-02', matricule: 'MTR-2023-0244', name: 'Yao Affoué', poste: 'Agent Guichet', aptitudeScore: 74, ancienneteAns: 3, enfantsACharge: 1, marie: true },
  { id: 'E-03', matricule: 'MTR-2021-0118', name: 'Diabaté Lassina', poste: 'Agent Guichet', aptitudeScore: 78, ancienneteAns: 5, enfantsACharge: 2, marie: true },
  { id: 'E-04', matricule: 'MTR-2019-0055', name: 'N\'Guessan Koffi', poste: 'Agent Guichet', aptitudeScore: 86, ancienneteAns: 7, enfantsACharge: 3, marie: true },
  { id: 'E-05', matricule: 'MTR-2024-0318', name: 'Bamba Idrissa', poste: 'Agent Guichet', aptitudeScore: 68, ancienneteAns: 1, enfantsACharge: 0, marie: false }
];

const MOCK_REHIRE_PRIORITY = [
  { id: 'PR-01', name: 'Touré Moussa', matricule: 'MTR-2020-0082', categorie: '5ème Catégorie (Guichet)', dateLicenciement: '2025-06-30', finPriorite2Ans: '2027-06-30', statut: 'ACTIF' },
  { id: 'PR-02', name: 'Koffi Adjoua', matricule: 'MTR-2021-0149', categorie: '6ème Catégorie (SAV)', dateLicenciement: '2025-09-15', finPriorite2Ans: '2027-09-15', statut: 'ACTIF' }
];

export default function LicenciementEconomiqueOrdreLegal() {
  const [postesASupprimer, setPostesASupprimer] = useState(2);
  const [activeTab, setActiveTab] = useState('order'); // 'order' | 'calendar' | 'rehire'

  // Calcul objectif du score légal (Art. 18.10 Code du Travail CI) :
  // Aptitude (poids 60%) + Ancienneté majorée des charges de famille (1 an par enfant + 1 an si marié)
  const rankedPool = useMemo(() => {
    return MOCK_POOL_EMPLOYEES.map((e) => {
      const ancienneteMajoree = e.ancienneteAns + e.enfantsACharge + (e.marie ? 1 : 0);
      const scoreLegal = Math.round(e.aptitudeScore * 0.6 + ancienneteMajoree * 4);
      return { ...e, ancienneteMajoree, scoreLegal };
    }).sort((a, b) => a.scoreLegal - b.scoreLegal); // Score le plus faible = premier concerné
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
                Restructuration & Conformité MEPS
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Art. 18.9 à 18.15 Code du Travail CI
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Licenciement Économique & Ordre Légal des Licenciements
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Moteur objectif de pondération des critères légaux (Aptitudes, Ancienneté, Charges de famille), suivi du délai d'information de 15 jours (Inspecteur du Travail) et registre de priorité de réembauchage (2 ans).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('order')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'order' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Calcul Ordre Légal
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'calendar' ? 'bg-white text-[#002B7F] shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Procédure 15 Jours
            </button>
            <button
              onClick={() => setActiveTab('rehire')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'rehire' ? 'bg-[#008000] text-white shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Priorité Réembauche (2 ans)
            </button>
          </div>
        </div>
      </div>

      {/* Alerte d'ordre public */}
      <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#002B7F] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-[#002B7F] font-semibold">Règle impérative (Art. 18.10 Code du Travail CI) : </strong>
          L'employeur établit l'ordre des licenciements en tenant compte d'abord des <strong>aptitudes professionnelles</strong>, puis de l'<strong>ancienneté</strong> majorée d'<strong>un an pour le salarié marié et d'un an pour chaque enfant à charge</strong>. Le non-respect de cet ordre rend le licenciement abusif.
        </div>
      </div>

      {/* Vue 1 : Moteur de Calcul Ordre Légal */}
      {activeTab === 'order' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#002B7F]" />
                Simulation de Classement Objectif — Catégorie : Agent Guichet (5 salariés)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-300">
              <span className="font-semibold text-gray-700">Postes à supprimer :</span>
              <select
                value={postesASupprimer}
                onChange={(e) => setPostesASupprimer(Number(e.target.value))}
                className="font-bold text-[#002B7F] bg-transparent focus:outline-none"
              >
                <option value={1}>1 poste</option>
                <option value={2}>2 postes</option>
                <option value={3}>3 postes</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/75 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4 text-center">Rang</th>
                  <th className="py-3.5 px-4">Salarié / Matricule</th>
                  <th className="py-3.5 px-4 text-center">Aptitude (/100)</th>
                  <th className="py-3.5 px-4 text-center">Ancienneté + Famille</th>
                  <th className="py-3.5 px-4 text-center">Score Légal</th>
                  <th className="py-3.5 px-4 text-center">Statut Simulation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankedPool.map((emp, idx) => {
                  const isImpacted = idx < postesASupprimer;
                  return (
                    <tr key={emp.id} className={isImpacted ? 'bg-red-50/40' : 'hover:bg-blue-50/30'}>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-700">#{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{emp.matricule} • {emp.poste}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-800">{emp.aptitudeScore}</td>
                      <td className="py-3.5 px-4 text-center text-xs text-gray-700">
                        <span className="font-bold">{emp.ancienneteMajoree} ans majorés</span>
                        <div className="text-[10px] text-gray-500">
                          ({emp.ancienneteAns}a + {emp.enfantsACharge} enf. {emp.marie ? '+ marié' : ''})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-base font-black text-[#002B7F]">
                        {emp.scoreLegal}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isImpacted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            Désigné pour départ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#008000] border border-emerald-200">
                            Maintenu en poste
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue 2 : Procédure Légale des 15 Jours */}
      {activeTab === 'calendar' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#002B7F] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#002B7F]" />
            Chronologie Impérative de la Procédure (Articles 18.11 à 18.14)
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { step: 'Étape 1 (J-15 ouvrables)', titre: 'Transmission du dossier économique complet', desc: 'Remise obligatoire aux Délégués du Personnel et à l\'Inspecteur du Travail : causes économiques, critères d\'ordre, liste des salariés concernés et mesures de reclassement.' },
              { step: 'Étape 2 (Jour J)', titre: 'Réunion d\'information et d\'explication', desc: 'Tenue de la réunion en présence de l\'Inspecteur du Travail et des Délégués du Personnel pour examiner les propositions alternatives.' },
              { step: 'Étape 3 (J+8)', titre: 'Notification individuelle des licenciements', desc: 'Envoi des lettres motivées avec paiement des indemnités légales, préavis et inscription au registre de priorité de réembauchage.' }
            ].map((et, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="font-bold text-[#002B7F]">{et.step} — {et.titre}</div>
                <p className="text-gray-600 mt-1">{et.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue 3 : Registre de Priorité de Réembauchage (2 ans) */}
      {activeTab === 'rehire' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#008000]" />
              Registre de Priorité de Réembauchage — Validité 2 Ans (Art. 18.15 Code CI)
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {MOCK_REHIRE_PRIORITY.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                <div>
                  <span className="font-bold text-gray-900">{p.name}</span>
                  <span className="text-gray-500 font-mono ml-2">({p.matricule})</span>
                  <div className="text-gray-600 mt-0.5">{p.categorie} • Licencié éco le {p.dateLicenciement}</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-[#008000] border border-emerald-200">
                    Prioritaire jusqu'au {p.finPriorite2Ans}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
