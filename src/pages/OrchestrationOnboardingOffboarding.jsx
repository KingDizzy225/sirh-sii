import React, { useState } from 'react';
import {
  Workflow,
  CheckCircle2,
  Clock,
  Laptop,
  Shield,
  Building2,
  UserCheck,
  UserX,
  FileText,
  Key,
  AlertTriangle,
  Lock,
  Calendar,
  Send,
  Plus,
  ArrowRight,
  ShieldCheck,
  Printer
} from 'lucide-react';

export default function OrchestrationOnboardingOffboarding() {
  const [activeTab, setActiveTab] = useState('onboarding'); // 'onboarding' | 'offboarding'

  // Liste des dossiers d'Onboarding en cours d'orchestration
  const [onboardingList, setOnboardingList] = useState([
    {
      id: 'ONB-2026-08',
      collaborateur: 'Traoré Bakary',
      poste: 'Conseiller Commercial Agence',
      agence: 'Agence Yopougon Siporex',
      dateArrivee: '01/12/2026',
      slaGlobal: 'Dans les délais (J-14)',
      progression: 60,
      tasks: [
        { pole: 'RH & Contrat', desc: 'Contrat de travail signé et immatriculation CNPS transmise', statut: 'done', owner: 'Mme Koffi (RH)' },
        { pole: 'IT & Systèmes', desc: 'Création compte Active Directory & e-mail b.traore@sii-ci.com', statut: 'done', owner: 'Support IT' },
        { pole: 'IT & Matériel', desc: 'Préparation et configuration laptop sécurisé avec VPN Agence', statut: 'pending', owner: 'Support IT' },
        { pole: 'Moyens Généraux', desc: 'Édition du badge d’accès physique & gilet d’uniforme agence', statut: 'pending', owner: 'M. Bamba (MG)' },
        { pole: 'Sécurité & Agence', desc: 'Attribution du parrain d’intégration et planning semaine 1', statut: 'done', owner: 'Chef d’Agence Yopougon' }
      ]
    },
    {
      id: 'ONB-2026-09',
      collaborateur: 'Kouakou N’Guessan Ange',
      poste: 'Caissière Polyvalente',
      agence: 'Agence Cocody Deux-Plateaux',
      dateArrivee: '24/11/2026',
      slaGlobal: 'Urgent (J-7)',
      progression: 80,
      tasks: [
        { pole: 'RH & Contrat', desc: 'Contrat paraphé et certificat médical d’aptitude CSST visé', statut: 'done', owner: 'Mme Koffi (RH)' },
        { pole: 'IT & Systèmes', desc: 'Création compte guichetier & profil logiciel caisse sécurisé', statut: 'done', owner: 'Support IT' },
        { pole: 'IT & Matériel', desc: 'Attribution du lecteur biométrique & TPE de caisse', statut: 'done', owner: 'Support IT' },
        { pole: 'Moyens Généraux', desc: 'Remise badge d’accès agence et casier personnel', statut: 'done', owner: 'M. Bamba (MG)' },
        { pole: 'Sécurité & Agence', desc: 'Formation habilitation anti-blanchiment et code alarme caisse', statut: 'pending', owner: 'Audit & Sécurité' }
      ]
    }
  ]);

  // Liste des dossiers d'Offboarding (Coupure d'accès & Quitus matériel)
  const [offboardingList, setOffboardingList] = useState([
    {
      id: 'OFF-2026-04',
      collaborateur: 'Bamba Souleymane',
      poste: 'Responsable Logistique & Moyens Généraux',
      agence: 'Agence Yopougon Siporex',
      dateSortie: '30/11/2026',
      motif: 'Rupture Conventionnelle Amiable',
      statutGlobal: 'En cours de clôture',
      tasks: [
        { pole: 'IT & Sécurité', desc: 'Révocation automatique des accès Active Directory & VPN à 18h00 pile', statut: 'scheduled', datePlanifiee: '30/11/2026 18:00' },
        { pole: 'IT & Matériel', desc: 'Restitution du PC portable, token VPN et téléphone flotteur', statut: 'pending', datePlanifiee: '29/11/2026' },
        { pole: 'Moyens Généraux', desc: 'Restitution des clés du coffre agence & badge biométrique', statut: 'pending', datePlanifiee: '30/11/2026' },
        { pole: 'Finance & Trésorerie', desc: 'Rapprochement des avances sur salaire et note de frais clôturée', statut: 'done', datePlanifiee: '15/11/2026' },
        { pole: 'RH & Légal', desc: 'Signature du certificat de travail, reçu solde de tout compte et attestation CNPS', statut: 'pending', datePlanifiee: '30/11/2026' }
      ]
    }
  ]);

  const toggleTask = (onbId, taskIdx) => {
    setOnboardingList(onboardingList.map(onb => {
      if (onb.id === onbId) {
        const updatedTasks = [...onb.tasks];
        updatedTasks[taskIdx].statut = updatedTasks[taskIdx].statut === 'done' ? 'pending' : 'done';
        const doneCount = updatedTasks.filter(t => t.statut === 'done').length;
        onb.progression = Math.round((doneCount / updatedTasks.length) * 100);
        return { ...onb, tasks: updatedTasks };
      }
      return onb;
    }));
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Cross-Functional SLA Workflow • Standard ServiceNow HRSD / Personio
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Orchestration RH ➔ IT ➔ Moyens Généraux ➔ Sécurité
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Workflow className="w-7 h-7 text-[#002B7F]" />
            Orchestration d'Onboarding & Offboarding Inter-Services
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Automatisez le parcours d'intégration et de départ : provisioning des accès informatiques,
            dotation de matériel agence, checklists avec SLA stricts et coupure immédiate des droits anti-fraude.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
            SLA moyen de préparation : <strong className="text-[#002B7F]">J-3 avant arrivée</strong>
          </div>
        </div>
      </div>

      {/* Onglets Onboarding / Offboarding */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'onboarding'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Orchestration Onboarding Arrivants ({onboardingList.length})
        </button>
        <button
          onClick={() => setActiveTab('offboarding')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'offboarding'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserX className="w-4 h-4" />
          Protocole Offboarding & Révocation des Accès ({offboardingList.length})
        </button>
      </div>

      {/* Onglet 1 : Onboarding Orchestré */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6">
          {onboardingList.map((onb) => (
            <div key={onb.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#002B7F]">{onb.id}</span>
                    <h3 className="font-bold text-slate-900 text-base">{onb.collaborateur}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {onb.poste} • <span className="font-semibold text-slate-700">{onb.agence}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Date d'Arrivée :</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#002B7F]" /> {onb.dateArrivee}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400">Préparation :</span>
                    <div className="font-bold text-[#008000]">{onb.progression}% prêt</div>
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#002B7F] h-full transition-all duration-300"
                  style={{ width: `${onb.progression}%` }}
                />
              </div>

              {/* Checklist des 4 Pôles */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Checklist d'Exécution Coordonnée (RH, IT, Moyens Généraux, Sécurité) :
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {onb.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleTask(onb.id, idx)}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                        task.statut === 'done'
                          ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                          task.statut === 'done'
                            ? 'bg-[#008000] text-white'
                            : 'border border-slate-300 bg-white text-transparent'
                        }`}>
                          ✓
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 mr-2">[{task.pole}]</span>
                          <span className={task.statut === 'done' ? 'line-through text-slate-500' : ''}>
                            {task.desc}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Responsable : <strong>{task.owner}</strong></span>
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          task.statut === 'done'
                            ? 'bg-emerald-100 text-[#008000]'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {task.statut === 'done' ? 'Validé' : 'À faire'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onglet 2 : Offboarding & Quitus Sécurité */}
      {activeTab === 'offboarding' && (
        <div className="space-y-6">
          {offboardingList.map((off) => (
            <div key={off.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-600">{off.id}</span>
                    <h3 className="font-bold text-slate-900 text-base">{off.collaborateur}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {off.poste} • <span className="font-semibold text-slate-700">{off.agence}</span> • Motif : {off.motif}
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-red-600" />
                  Révocation des accès : {off.dateSortie} à 18h00 pile
                </div>
              </div>

              {/* Tâches d'Offboarding */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Protocole de Sécurisation des Données & Restitution Matériel :
                </span>

                <div className="space-y-2">
                  {off.tasks.map((task, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Key className="w-4 h-4 text-[#002B7F]" />
                        <div>
                          <span className="font-bold text-slate-900 mr-2">[{task.pole}]</span>
                          <span>{task.desc}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Échéance : {task.datePlanifiee}</span>
                        <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          task.statut === 'done'
                            ? 'bg-emerald-100 text-[#008000]'
                            : task.statut === 'scheduled'
                            ? 'bg-blue-100 text-[#002B7F]'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {task.statut === 'done' ? 'Restitué' : task.statut === 'scheduled' ? 'Automatisé' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#002B7F]" />
                  Quitus matériel & décharge signée électroniquement selon le Code du Travail CI.
                </span>
                <button
                  onClick={() => alert('Génération du Quitus de Restitution Matériel certifié conforme.')}
                  className="px-3 py-1 bg-white border border-blue-200 rounded font-semibold text-[#002B7F] hover:bg-blue-100 transition-colors"
                >
                  Imprimer Quitus Restitution
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
