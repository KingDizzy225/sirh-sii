import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Users, Target, BookOpen, Laptop, Mail, CheckCircle, Clock, AlertCircle, CheckCircle2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stats = [
    { title: 'Total en Intégration', value: '14', change: '+3', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Terminé ce mois-ci', value: '28', change: '+12%', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Tâches en retard', value: '5', change: '-2', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
    { title: 'Temps Moyen de Complétion', value: '11 Jours', change: '-1.5 Jours', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
];

const initialNewHires = [
    {
        id: 1, name: 'Alex Thompson', role: 'Ingénieur Logiciel', department: 'Ingénierie', startDate: 'Aujourd\'hui', progress: 20, status: 'En cours', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
        tasks: [
            { name: 'Distribution Matériel', status: 'completed', icon: Laptop },
            { name: 'Création de Compte', status: 'pending', icon: Mail },
            { name: 'Livret d\'Accueil', status: 'pending', icon: BookOpen },
        ]
    },
    {
        id: 2, name: 'Jessica Lee', role: 'UX Designer', department: 'Design', startDate: 'Il y a 3 jours', progress: 65, status: 'En cours', iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
        tasks: [
            { name: 'Distribution Matériel', status: 'completed', icon: Laptop },
            { name: 'Création de Compte', status: 'completed', icon: Mail },
            { name: 'Livret d\'Accueil', status: 'pending', icon: BookOpen },
        ]
    },
    {
        id: 3, name: 'David Chen', role: 'Analyste Financier', department: 'Finance', startDate: 'Il y a 1 semaine', progress: 100, status: 'Terminé', iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
        tasks: [
            { name: 'Distribution Matériel', status: 'completed', icon: Laptop },
            { name: 'Création de Compte', status: 'completed', icon: Mail },
            { name: 'Livret d\'Accueil', status: 'completed', icon: BookOpen },
        ]
    }
];

export function Onboarding() {
    const [newHires, setNewHires] = useState(initialNewHires);
    const [notification, setNotification] = useState(null);
    const [filter, setFilter] = useState('All');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planForm, setPlanForm] = useState({ name: '', role: '', department: 'Engineering' });

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreatePlanSubmit = (e) => {
        e.preventDefault();
        if (!planForm.name || !planForm.role) {
            showNotification('Veuillez remplir les champs nom et rôle.');
            return;
        }

        const newHire = {
            id: Date.now(),
            name: planForm.name,
            role: planForm.role,
            department: planForm.department,
            startDate: 'Non commencé',
            progress: 0,
            status: 'En cours',
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            tasks: [
                { name: 'Distribution Matériel', status: 'pending', icon: Laptop },
                { name: 'Création de Compte', status: 'pending', icon: Mail },
                { name: 'Livret d\'Accueil', status: 'pending', icon: BookOpen },
            ]
        };

        setNewHires([newHire, ...newHires]);
        setIsModalOpen(false);
        setPlanForm({ name: '', role: '', department: 'Ingénierie' });
        showNotification(`Plan d'intégration créé avec succès pour ${planForm.name}`);
    };

    const handleMarkDone = (hireId, taskIndex) => {
        setNewHires(prev => prev.map(hire => {
            if (hire.id === hireId) {
                const updatedTasks = [...hire.tasks];
                updatedTasks[taskIndex].status = 'completed';

                const completedCount = updatedTasks.filter(t => t.status === 'completed').length;
                const newProgress = Math.round((completedCount / updatedTasks.length) * 100);
                const newStatus = newProgress === 100 ? 'Terminé' : 'En cours';

                return { ...hire, tasks: updatedTasks, progress: newProgress, status: newStatus };
            }
            return hire;
        }));
        showNotification('Tâche marquée comme terminée');
    };

    const filteredHires = filter === 'All' ? newHires : newHires.filter(h => h.status !== 'Terminé');

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-[calc(100vh-4rem)] relative">

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <CheckCircle2 size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Plan Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Nouveau Plan d'Intégration</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="add-plan-form" onSubmit={handleCreatePlanSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 mb-2 flex gap-3">
                                            <div className="text-indigo-600 mt-0.5"><Users size={18} /></div>
                                            <div>
                                                <p className="text-sm text-indigo-800 font-medium">Modèle de Plan Standard</p>
                                                <p className="text-xs text-indigo-700/80 mt-0.5">Cela attribuera automatiquement les tâches standards d'intégration à la nouvelle recrue.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Nom de l'Employé</label>
                                        <Input
                                            value={planForm.name}
                                            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                                            placeholder="ex. John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Titre du Rôle</label>
                                            <Input
                                                value={planForm.role}
                                                onChange={(e) => setPlanForm({ ...planForm, role: e.target.value })}
                                                placeholder="ex. Marketing Manager"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Département</label>
                                            <select
                                                value={planForm.department}
                                                onChange={(e) => setPlanForm({ ...planForm, department: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="Ingénierie">Ingénierie</option>
                                                <option value="Design">Design</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="RH">RH</option>
                                                <option value="Commercial">Commercial</option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="add-plan-form" className="bg-blue-600 hover:bg-blue-700 text-white">Générer le Plan</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Centre d'Intégration</h2>
                    <p className="text-slate-500 mt-1">Attribuez et suivez les tâches d'intégration pour les nouvelles recrues.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
                    >
                        <Plus size={18} /> Nouveau Plan
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {stat.change && (
                                        <span className={stat.change.startsWith('-') && !stat.change.includes('Days') && stat.title !== 'Avg Time to Complete' ? 'text-rose-600 font-medium' : 'text-emerald-600 font-medium'}>
                                            {stat.change}
                                        </span>
                                    )}
                                    {' '}depuis le mois dernier
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Active Onboarding Plans */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="grid gap-6"
            >
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
                        <CardTitle>Plans Actifs des Nouvelles Recrues</CardTitle>
                        <div className="flex bg-slate-100 p-1 rounded">
                            <button
                                onClick={() => setFilter('All')}
                                className={`px-3 py-1 shadow-sm rounded text-sm font-medium ${filter === 'All' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Tous
                            </button>
                            <button
                                onClick={() => setFilter('Pending')}
                                className={`px-3 py-1 shadow-sm rounded text-sm font-medium ${filter === 'Pending' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Actions en Attente
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {filteredHires.map((hire) => (
                                <div key={hire.id} className="border border-slate-200 rounded-lg p-5 hover:border-blue-200 transition-colors bg-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hire.iconBg} ${hire.iconColor} font-bold text-lg`}>
                                                {hire.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900 leading-none">{hire.name}</h4>
                                                <p className="text-sm text-slate-500 mt-1">{hire.role} • <span className="text-slate-400">Commencé le : {hire.startDate}</span></p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={hire.status === 'Terminé' ? 'success' : 'blue'} className="mb-2">
                                                {hire.status}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <span className="font-medium">{hire.progress}%</span>
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${hire.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${hire.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {hire.tasks.map((task, idx) => (
                                            <div key={idx} className={`flex items-start gap-3 p-3 rounded-md border ${task.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'} transition-colors`}>
                                                <div className={`p-1.5 rounded-full mt-0.5 ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                                    {task.status === 'completed' ? <CheckCircle size={14} /> : <task.icon size={14} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-emerald-900' : 'text-slate-700'}`}>{task.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{task.status === 'completed' ? 'Terminé' : 'Action Requise'}</p>
                                                </div>
                                                {task.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleMarkDone(hire.id, idx)}
                                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 bg-white border border-slate-200 shadow-sm rounded"
                                                    >
                                                        Marquer Terminé
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
