import React, { useState } from 'react';
import {
  Zap, Play, Plus, CheckCircle2, AlertTriangle, Clock, RefreshCw,
  Bell, Mail, ShieldAlert, Award, FileText, ArrowRight, Settings,
  Check, X, Power, ChevronRight, Sliders, Calendar, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export function SmartAutomations() {
  const [toastMessage, setToastMessage] = useState(null);
  const [filterCategory, setFilterCategory] = useState('TOUS'); // TOUS, LEGAL, TALENTS, BIENETRE, ONBOARDING

  // Règles automatisées du SIRH
  const [automations, setAutomations] = useState([
    {
      id: 'AUTO-01',
      title: 'Alerte Fin de Période d\'Essai (J-15)',
      category: 'LEGAL',
      description: 'Détecte les collaborateurs dont la période d\'essai expire dans 15 jours. Notifie le Manager N+1 et génère la fiche de confirmation CDI.',
      trigger: 'Échéance Période d\'Essai = J-15',
      actions: ['Notification push Manager N+1', 'Génération Fiche d\'Évaluation RH', 'Rappel email RH'],
      active: true,
      lastRun: 'Aujourd\'hui à 08:30',
      successCount: 28,
      status: 'ACTIF'
    },
    {
      id: 'AUTO-02',
      title: 'Sentinelle CDD 24 Mois (Code du Travail CI)',
      category: 'LEGAL',
      description: 'Alerte proactive dès qu\'un contrat CDD atteint 21 mois d\'ancienneté pour anticiper la transformation en CDI ou le terme légal sans risque de requalification.',
      trigger: 'Ancienneté CDD cumulée >= 21 mois',
      actions: ['Alerte rouge Juridique RH', 'Notification Directeur de Département', 'Proposition avenant CDI'],
      active: true,
      lastRun: 'Hier à 14:15',
      successCount: 14,
      status: 'ACTIF'
    },
    {
      id: 'AUTO-03',
      title: 'Célébration Anniversaire d\'Ancienneté (3, 5, 10 ans)',
      category: 'TALENTS',
      description: 'Publie automatiquement un message de célébration sur le Mur d\'Entreprise et prépare la lettre de félicitations signée par la Direction Générale.',
      trigger: 'Date d\'embauche = Date du Jour (Modulo 12 mois)',
      actions: ['Post sur le Mur d\'Agence', 'Notification félicitations DG', 'Attribution Badge Fidélité'],
      active: true,
      lastRun: 'Ce matin à 09:00',
      successCount: 191,
      status: 'ACTIF'
    },
    {
      id: 'AUTO-04',
      title: 'Régulation Surcharge & Blocage Calendrier 48h',
      category: 'BIENETRE',
      description: 'Détecte les astreintes répétées (> 3 nuits en 14j) ou heures tardives. Propose automatiquement un repos compensateur et avertit le N+1.',
      trigger: 'Score Pression Sentinelle > 75/100',
      actions: ['Blocage Calendrier 48h', 'Alerte bienveillante Manager', 'Proposition repos récupérateur'],
      active: true,
      lastRun: 'Aujourd\'hui à 11:20',
      successCount: 12,
      status: 'ACTIF'
    },
    {
      id: 'AUTO-05',
      title: 'Visites Médicales Périodiques Obligatoires',
      category: 'LEGAL',
      description: 'Contrôle annuel des visites de médecine du travail selon l\'article 42.1. Convoque le salarié et réserve le créneau au centre médical conventionné.',
      trigger: 'Dernière visite médicale >= 11 mois',
      actions: ['Email de convocation collaborateur', 'Mise à jour Registre Santé', 'Notification Médecin du Travail'],
      active: true,
      lastRun: 'Il y a 3 jours',
      successCount: 167,
      status: 'ACTIF'
    },
    {
      id: 'AUTO-06',
      title: 'Alerte Forclusion Congés Payés (> 35 jours)',
      category: 'BIENETRE',
      description: 'Prévient l\'accumulation excessive de jours de congés avant la limite triennale. Suggère un calendrier de pose de congés personnalisé.',
      trigger: 'Solde Congés Payés > 35 jours',
      actions: ['Notification collaborateur', 'Suggestion planning congés', 'Rapport trimestriel DRH'],
      active: false,
      lastRun: 'Il y a 1 semaine',
      successCount: 45,
      status: 'PAUSE'
    }
  ]);

  // Journal d'exécution des déclencheurs
  const [logs, setLogs] = useState([
    { id: 'LOG-891', date: '23 Sept 2026 - 15:20', automation: 'Alerte Fin de Période d\'Essai', target: 'Mamadou Touré (Commercial)', status: 'SUCCÈS', detail: 'Fiche d\'évaluation envoyée au Manager N+1.' },
    { id: 'LOG-890', date: '23 Sept 2026 - 11:20', automation: 'Régulation Surcharge & Repos 48h', target: 'Moussa Soro (IT)', status: 'SUCCÈS', detail: 'Repos récupérateur 48h validé.' },
    { id: 'LOG-889', date: '23 Sept 2026 - 09:00', automation: 'Célébration Anniversaire d\'Ancienneté', target: 'Julie Konan (3 ans)', status: 'SUCCÈS', detail: 'Post publié sur le Mur d\'Entreprise & badge octroyé.' },
    { id: 'LOG-888', date: '22 Sept 2026 - 14:15', automation: 'Sentinelle CDD 24 Mois', target: 'Armand Kouassi (Finance)', status: 'SUCCÈS', detail: 'Notification alerte 21 mois transmise au DRH.' }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggle = (id) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        const nextState = !a.active;
        showToast(`Automatisation « ${a.title} » ${nextState ? 'activée' : 'mise en pause'}.`);
        return {
          ...a,
          active: nextState,
          status: nextState ? 'ACTIF' : 'PAUSE'
        };
      }
      return a;
    }));
  };

  const handleRunAllNow = () => {
    showToast("Scan global de toutes les règles automatisées exécuté avec succès (191 collaborateurs analysés).");
    const newLog = {
      id: `LOG-${Math.floor(892 + Math.random() * 50)}`,
      date: 'À l\'instant',
      automation: 'Scan Global des Règles RH',
      target: '191 Collaborateurs SII',
      status: 'SUCCÈS',
      detail: '6 règles vérifiées. 0 anomalie bloquante détectée.'
    };
    setLogs([newLog, ...logs]);
  };

  const filtered = automations.filter(a => filterCategory === 'TOUS' || a.category === filterCategory);

  const activeCount = automations.filter(a => a.active).length;
  const totalExecutions = automations.reduce((acc, curr) => acc + curr.successCount, 0);

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              No-Code RH • Smart Triggers
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Automatisations & Déclencheurs RH
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Programmez des règles intelligentes d'alerte, de célébration et de conformité légale exécutées en temps réel sur les 191 collaborateurs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRunAllNow}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs gap-2 font-semibold text-sm"
          >
            <Play size={16} /> Exécuter le Scan Maintenant
          </Button>
        </div>
      </div>

      {/* 4 Pastel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Déclencheurs Actifs */}
        <div className="bg-amber-50/70 border border-amber-100/80 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Règles Actives
            </span>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeCount}</span>
            <span className="text-xs text-slate-400 font-normal">/ {automations.length} configurées</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Moteur temps réel opérationnel</p>
        </div>

        {/* KPI 2 : Événements Traités */}
        <div className="bg-blue-50/70 border border-blue-100/80 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Actions Exécutées
            </span>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalExecutions}</span>
            <span className="text-xs text-blue-600 font-semibold">+18 ce mois</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Taux de succès de 99.8%</p>
        </div>

        {/* KPI 3 : Temps RH Économisé */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Temps Économisé
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">42h</span>
            <span className="text-xs text-emerald-600 font-semibold">par mois</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Sur les tâches répétitives</p>
        </div>

        {/* KPI 4 : Risques Évités */}
        <div className="bg-rose-50/70 border border-rose-100/80 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Risques Juridiques Évités
            </span>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">100%</span>
            <span className="text-xs text-rose-600 font-semibold">Conforme</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Zéro dépassement de délai légal</p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl w-max">
        {[
          { id: 'TOUS', label: 'Toutes les Règles' },
          { id: 'LEGAL', label: '⚖️ Conformité Légale' },
          { id: 'TALENTS', label: '🌟 Talents & Ancienneté' },
          { id: 'BIENETRE', label: '🧘 Bien-Être & QVT' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === cat.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(auto => (
          <div
            key={auto.id}
            className={`bg-white border p-6 rounded-2xl shadow-xs transition-all space-y-4 flex flex-col justify-between ${
              auto.active ? 'border-slate-200/90' : 'border-slate-200/50 opacity-70 bg-slate-50/50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${auto.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{auto.title}</h3>
                    <span className="text-[11px] text-slate-400 font-medium">ID : {auto.id} • Dernière exécution : {auto.lastRun}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(auto.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    auto.active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {auto.active ? '✓ Activé' : '○ En Pause'}
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {auto.description}
              </p>

              {/* Trigger & Actions Blueprint */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                    Quand (Déclencheur)
                  </span>
                  <span>{auto.trigger}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700 font-semibold pt-1">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold shrink-0">
                    Alors (Actions)
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-normal text-slate-600">
                    {auto.actions.map((act, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                        ✓ {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                {auto.successCount} exécutions réussies
              </span>
              <button
                onClick={() => showToast(`Test manuel de déclenchement exécuté pour « ${auto.title} ».`)}
                className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1"
              >
                Tester Déclencheur <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Logs Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Journal d'Exécution en Temps Réel</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Synchronisation continue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Date & Heure</th>
                <th className="py-2.5 px-3">Règle Exécutée</th>
                <th className="py-2.5 px-3">Cible / Collaborateur</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-500">{log.date}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{log.automation}</td>
                  <td className="py-3 px-3 text-slate-700">{log.target}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default SmartAutomations;
