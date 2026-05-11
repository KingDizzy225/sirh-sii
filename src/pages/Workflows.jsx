import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { 
    Zap, Play, Settings, Clock, CheckCircle2, 
    AlertCircle, ArrowRight, Mail, Slack, 
    Calendar, CheckSquare, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';

const WORKFLOW_RECIPES = [
    {
        id: 1,
        name: 'Auto-Approbation Frais',
        description: 'Approuve automatiquement les notes de frais < 10,000 FCFA.',
        trigger: 'Nouvelle dépense',
        action: 'Approuver & Notifier',
        icon: Zap,
        color: 'text-amber-500',
        active: true,
        runs: 45
    },
    {
        id: 2,
        name: 'Alerte Fin de Période d\'Essai',
        description: 'Notifie le manager 15 jours avant la fin de la période d\'essai.',
        trigger: 'Date J-15',
        action: 'Email Manager',
        icon: Calendar,
        color: 'text-blue-500',
        active: true,
        runs: 12
    },
    {
        id: 3,
        name: 'Onboarding Automatique',
        description: 'Attribue les tâches de bienvenue dès la création d\'un compte.',
        trigger: 'Nouvel employé',
        action: 'Générer Checklist',
        icon: CheckSquare,
        color: 'text-emerald-500',
        active: false,
        runs: 0
    },
    {
        id: 4,
        name: 'Relance Signature Contrat',
        description: 'Relance quotidienne pour les documents non signés après 48h.',
        trigger: 'Document non signé',
        action: 'Rappel Multi-canal',
        icon: Mail,
        color: 'text-indigo-500',
        active: true,
        runs: 89
    }
];

export function Workflows() {
    const [workflows, setWorkflows] = useState(WORKFLOW_RECIPES);

    const toggleWorkflow = (id) => {
        setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Zap className="text-amber-500 h-8 w-8" />
                        Automation Engine (ITTT)
                    </h2>
                    <p className="text-slate-500 mt-1">Configurez des workflows intelligents pour automatiser vos processus RH répétitifs.</p>
                </div>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 font-bold px-6 py-6 rounded-2xl shadow-xl">
                    <PlusCircle size={20} /> Nouveau Workflow
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mt-8">
                <Card className="col-span-full bg-indigo-600 text-white border-none shadow-2xl overflow-hidden relative p-8">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                        <Sparkles size={200} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Intelligence Process Automation 🤖</h3>
                        <p className="text-indigo-100 text-lg leading-relaxed mb-6 font-medium">
                            L'assistant IA SII analyse vos habitudes de travail pour suggérer des optimisations de workflow. 
                            <strong> 3 nouveaux processus </strong> ont été identifiés comme automatisables ce mois-ci.
                        </p>
                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-black px-8 py-6 rounded-2xl text-sm uppercase tracking-widest shadow-lg">
                            Voir les suggestions IA
                        </Button>
                    </div>
                </Card>

                {workflows.map((wf, idx) => (
                    <motion.div
                        key={wf.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`h-full border-none shadow-lg transition-all ${wf.active ? 'bg-white opacity-100' : 'bg-slate-50 opacity-70'}`}>
                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                <div className={`p-3 rounded-2xl ${wf.active ? 'bg-slate-100' : 'bg-slate-200'} ${wf.color}`}>
                                    <wf.icon size={24} />
                                </div>
                                <Switch 
                                    checked={wf.active} 
                                    onCheckedChange={() => toggleWorkflow(wf.id)}
                                />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-black text-slate-900 text-lg leading-tight mb-2">{wf.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{wf.description}</p>
                                </div>
                                
                                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-black uppercase text-slate-400 px-2">{wf.trigger}</div>
                                    <ArrowRight size={12} className="text-slate-300" />
                                    <div className="text-[10px] font-black uppercase text-indigo-600 px-2">{wf.action}</div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Play size={10} /> {wf.runs} exécutions
                                    </div>
                                    <button className="text-indigo-600 hover:underline flex items-center gap-1">
                                        <Settings size={10} /> Configurer
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function PlusCircle({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
