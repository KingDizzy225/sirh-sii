import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
    PowerOff, 
    CheckCircle2, 
    Clock, 
    UserMinus, 
    ShieldAlert, 
    Laptop, 
    Key, 
    FileCheck, 
    ArrowRight,
    Trash2,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';

export function Offboarding() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/offboarding/tasks');
            setTasks(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
        try {
            await api.put(`/offboarding/tasks/${id}`, { status: newStatus });
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('matériel') || lower.includes('ordinateur')) return <Laptop size={18} />;
        if (lower.includes('accès') || lower.includes('badge')) return <Key size={18} />;
        return <FileCheck size={18} />;
    };

    const stats = [
        { label: 'Départs en cours', value: tasks.filter(t => t.status === 'Pending').length, icon: Clock, color: 'amber' },
        { label: 'Sorties clôturées', value: tasks.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'emerald' },
        { label: 'Total sorties T4', value: '12', icon: PowerOff, color: 'indigo' }
    ];

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <PowerOff className="text-rose-600" size={32} />
                        Départs & Offboarding
                    </h2>
                    <p className="text-slate-500 font-medium">Gestion sécurisée des sorties de collaborateurs et restitution d'actifs.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un départ..." 
                            className="bg-white border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium shadow-sm focus:ring-2 focus:ring-rose-500 outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden relative group">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 text-${s.color}-600 group-hover:scale-110 transition-transform`}>
                            <s.icon size={64} />
                        </div>
                        <CardContent className="p-6">
                            <div className={`p-2 w-fit rounded-lg bg-${s.color}-50 text-${s.color}-600 mb-4`}>
                                <s.icon size={20} />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{s.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task List */}
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black">Checklist de sortie</CardTitle>
                            <CardDescription>Tâches administratives et logistiques.</CardDescription>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Tous
                            </button>
                            <button 
                                onClick={() => setFilter('pending')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${filter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                En attente
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {loading ? (
                                <div className="p-12 text-center text-slate-400">Chargement des tâches...</div>
                            ) : tasks.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 italic">Aucun processus d'offboarding en cours.</div>
                            ) : (
                                tasks.filter(t => filter === 'all' || t.status === 'Pending').map((task, idx) => (
                                    <motion.div 
                                        key={task.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <button 
                                                onClick={() => toggleStatus(task.id, task.status)}
                                                className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent group-hover:border-rose-400'}`}
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl ${task.status === 'Completed' ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-600'}`}>
                                                    {getIcon(task.taskName)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                        {task.taskName}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-1">
                                                        <span className="p-1 bg-slate-100 rounded-md text-slate-400"><UserMinus size={10} /></span>
                                                        {task.employee?.firstName} {task.employee?.lastName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Échéance</p>
                                                <p className="text-xs font-bold text-slate-600">J-2</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-600 rounded-full h-8 w-8">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Reminders Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <ShieldAlert size={20} className="text-rose-500" />
                                Rappels Sécurité
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Alerte Prioritaire</p>
                                <p className="text-sm text-slate-200 leading-relaxed">
                                    N'oubliez pas de désactiver les accès VPN et Email à l'instant même du départ physique pour garantir la sécurité des données.
                                </p>
                            </div>
                            <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 rounded-xl">
                                Procédure de sécurité
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Documentation de sortie</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {['Certificat de travail', 'Attestation Pôle Emploi', 'Solde de tout compte', 'Bilan de sortie'].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                                    <span className="text-sm font-bold text-slate-700">{doc}</span>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
