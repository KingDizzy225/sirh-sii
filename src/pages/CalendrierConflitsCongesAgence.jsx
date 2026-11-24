import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ShieldAlert, 
  Building2, 
  Filter,
  Info
} from 'lucide-react';

// CALENDRIER D'ÉQUIPE & MATRICE ANTI-CONFLITS DE CONGÉS PAR AGENCE
// Visualisation consolidée des absences par jour et détection automatique des seuils
// de sous-effectif critique avant validation managériale d'un congé.

const AGENCIES_PLANNING = {
  'Agence Yopougon Keneya': {
    seuilMinPresence: 3, // Au moins 3 collaborateurs présents sur 5
    effectifTotal: 5,
    membres: [
      { name: 'Koffi Marie-Chantal', role: 'Chef de Caisse', absentsJours: [14, 15, 16, 17, 18], statut: 'APPROUVE' },
      { name: 'Diallo Ousmane', role: 'Guichetier', absentsJours: [14, 15, 16], statut: 'APPROUVE' },
      { name: 'Koné Mariam B.', role: 'Guichetière', absentsJours: [15, 16, 17], statut: 'EN_ATTENTE' },
      { name: 'Yao Sylvestre', role: 'Conseiller Clientèle', absentsJours: [21, 22, 23], statut: 'APPROUVE' },
      { name: 'Bamba Idrissa', role: 'Agent Accueil', absentsJours: [], statut: 'PRESENT' }
    ]
  },
  'Agence Centrale Plateau': {
    seuilMinPresence: 3,
    effectifTotal: 4,
    membres: [
      { name: 'Kouassi Marc-Antoine', role: 'Caissier Principal', absentsJours: [7, 8, 9, 10], statut: 'APPROUVE' },
      { name: 'Touré Aminata', role: 'Conseillère PME', absentsJours: [9, 10, 11], statut: 'EN_ATTENTE' },
      { name: 'N\'Dri Patrick', role: 'Support Agence', absentsJours: [21, 22], statut: 'APPROUVE' },
      { name: 'Soro Kouadio', role: 'Chef d\'Agence', absentsJours: [], statut: 'PRESENT' }
    ]
  }
};

const DAYS_DEC = [7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 21, 22, 23, 24];

export default function CalendrierConflitsCongesAgence() {
  const [selectedAgency, setSelectedAgency] = useState('Agence Yopougon Keneya');
  const agency = AGENCIES_PLANNING[selectedAgency];

  // Calcul des présents par jour et détection des jours en sous-effectif critique
  const dailyCoverage = useMemo(() => {
    return DAYS_DEC.map((day) => {
      const absentsCount = agency.membres.filter((m) => m.absentsJours.includes(day)).length;
      const presents = agency.effectifTotal - absentsCount;
      const isConflict = presents < agency.seuilMinPresence;
      return { day, absentsCount, presents, isConflict };
    });
  }, [agency]);

  const conflictDays = dailyCoverage.filter((d) => d.isConflict);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header officiel SII : #002B7F & #008000 */}
      <div className="bg-gradient-to-r from-[#002B7F] to-[#001f5c] text-white p-6 rounded-xl shadow-lg border-l-8 border-[#008000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#008000] text-white">
                Pilotage Temps & Continuité Agences
              </span>
              <span className="text-blue-200 text-xs font-mono">
                Matrice Anti-Conflits — Décembre 2026
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Calendrier d'Équipe & Matrice Anti-Conflits de Congés
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Visualisez en un coup d'œil les absences superposées par agence et bloquez automatiquement les demandes qui feraient passer la présence sous le seuil critique d'ouverture.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
            <Building2 className="w-4 h-4 text-emerald-300" />
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="bg-transparent text-white text-sm font-semibold focus:outline-none"
            >
              {Object.keys(AGENCIES_PLANNING).map((ag) => (
                <option key={ag} value={ag} className="text-gray-900">{ag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerte de conflit critique */}
      {conflictDays.length > 0 ? (
        <div className="bg-red-50 border border-red-300 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 leading-relaxed">
            <strong className="font-bold">ALERTE SOUS-EFFECTIF CRITIQUE ({selectedAgency}) : </strong>
            {conflictDays.length} jour(s) passent sous le seuil minimum de présence ({agency.seuilMinPresence} / {agency.effectifTotal} collaborateurs requis) :{' '}
            <strong>Décembre {conflictDays.map((d) => d.day).join(', ')}</strong>. La demande en attente crée un conflit de tenue de caisse et ne doit pas être validée sans renfort volant.
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-xs text-[#008000] font-semibold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Aucun conflit de sous-effectif détecté sur cette période pour {selectedAgency}.</span>
        </div>
      )}

      {/* Matrice Calendrier */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#002B7F]" />
            Planning Consolidé — {selectedAgency} (Seuil min : {agency.seuilMinPresence} présents)
          </h3>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#002B7F] inline-block" /> Congé Approuvé</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Demande en Attente</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-600 inline-block" /> Conflit Sous-Effectif</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100/80 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 min-w-[200px]">Collaborateur / Poste</th>
                {DAYS_DEC.map((day) => (
                  <th key={day} className="py-3 px-2 text-center font-mono">
                    {day}
                    <span className="block text-[9px] text-gray-400">Déc</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agency.membres.map((m, idx) => (
                <tr key={idx} className="hover:bg-blue-50/20">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{m.name}</div>
                    <div className="text-[11px] text-gray-500">{m.role}</div>
                  </td>
                  {DAYS_DEC.map((day) => {
                    const isAbsent = m.absentsJours.includes(day);
                    return (
                      <td key={day} className="py-2 px-1 text-center">
                        {isAbsent ? (
                          <div
                            className={`h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${
                              m.statut === 'EN_ATTENTE' ? 'bg-amber-500' : 'bg-[#002B7F]'
                            }`}
                            title={`${m.name} - ${m.statut}`}
                          >
                            {m.statut === 'EN_ATTENTE' ? '?' : 'CP'}
                          </div>
                        ) : (
                          <div className="h-7 rounded-md bg-emerald-50/60 border border-emerald-100" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Ligne de synthèse de présence quotidienne */}
              <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                <td className="py-3 px-4 text-[#002B7F]">Effectif Présent (Min {agency.seuilMinPresence})</td>
                {dailyCoverage.map((d) => (
                  <td key={d.day} className="py-2 px-1 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs font-black ${
                      d.isConflict
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-emerald-100 text-[#008000]'
                    }`}>
                      {d.presents}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
