import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Users, Target, BookOpen, Laptop, Mail, CheckCircle, Clock, AlertCircle, CheckCircle2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';

export function Onboarding() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [filter, setFilter] = useState('All');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const loadData = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error loading onboarding data:", error);
            showNotification("Erreur lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreatePlanSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployeeId) {
            showNotification('Veuillez sélectionner un employé.');
            return;
        }

        try {
            const res = await api.post(`/employees/${selectedEmployeeId}/onboarding`);
            if (res.data) {
                showNotification(res.data.message || "Plan d'intégration initialisé avec succès !");
                setIsModalOpen(false);
                setSelectedEmployeeId('');
                loadData();
            }
        } catch (err) {
            console.error(err);
            showNotification(err.message || "Erreur lors du lancement de l'onboarding.");
        }
    };

    const handleMarkDone = async (hireId, taskId) => {
        try {
            const res = await api.put(`/employees/onboarding/${taskId}`, { status: 'Completed' });
            if (res.data) {
                showNotification('Tâche d\'onboarding marquée comme terminée.');
                loadData();
            }
        } catch (err) {
            console.error(err);
            showNotification(err.message || "Erreur lors de la mise à jour de la tâche.");
        }
    };

    // Helper task icon resolver
    const getTaskIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('matériel') || n.includes('ordinateur') || n.includes('pc') || n.includes('it')) return Laptop;
        if (n.includes('accès') || n.includes('compte') || n.includes('email') || n.includes('mail')) return Mail;
        if (n.includes('livret') || n.includes('accueil') || n.includes('contrat') || n.includes('dossier') || n.includes('document')) return BookOpen;
        return Target;
    };

    // Calculate database plans
    const plans = employees
        .filter(emp => emp.onboardingTasks && emp.onboardingTasks.length > 0)
        .map(emp => {
            const tasksCount = emp.onboardingTasks.length;
            const completedCount = emp.onboardingTasks.filter(t => t.status === 'Completed').length;
            const progress = tasksCount > 0 ? Math.round((completedCount / tasksCount) * 100) : 100;
            const status = progress === 100 ? 'Terminé' : 'En cours';

            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                role: emp.positionTitle || emp.role || 'Collaborateur',
                department: emp.department || 'Ressources Humaines',
                startDate: new Date(emp.hireDate).toLocaleDateString('fr-FR'),
                progress,
                status,
                iconBg: progress === 100 ? 'bg-emerald-100' : 'bg-indigo-100',
                iconColor: progress === 100 ? 'text-emerald-600' : 'text-indigo-600',
                tasks: emp.onboardingTasks.map(t => ({
                    id: t.id,
                    name: t.taskName,
                    status: t.status === 'Completed' ? 'completed' : 'pending',
                    icon: getTaskIcon(t.taskName)
                }))
            };
        });

    // Compute stats
    const totalInOnboarding = plans.filter(p => p.status === 'En cours').length;
    const completedOnboardings = plans.filter(p => p.status === 'Terminé').length;
    
    let lateTasksCount = 0;
    employees.forEach(emp => {
        if (emp.onboardingTasks) {
            emp.onboardingTasks.forEach(t => {
                if (t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date()) {
                    lateTasksCount++;
                }
            });
        }
    });

    const stats = [
        { title: 'Total en Intégration', value: totalInOnboarding.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Terminé ce mois-ci', value: completedOnboardings.toString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { title: 'Tâches en retard', value: lateTasksCount.toString(), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
        { title: 'Temps Moyen de Complétion', value: '11 Jours', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    // Filter plans for list view
    const filteredPlans = filter === 'All' ? plans : plans.filter(p => p.status !== 'Terminé');

    // List employees eligible for a new onboarding plan (i.e. those with 0 onboarding tasks)
    const eligibleEmployees = employees.filter(emp => !emp.onboardingTasks || emp.onboardingTasks.length === 0);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Chargement du Centre d'Intégration...</div>;
    }

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
                                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex gap-3">
                                        <div className="text-indigo-600 mt-0.5"><Users size={18} /></div>
                                        <div>
                                            <p className="text-sm text-indigo-800 font-medium">Modèle de Plan Standard</p>
                                            <p className="text-xs text-indigo-700/80 mt-0.5">Cela générera automatiquement les tâches d'intégration standards (Accès informatiques, Contrat de travail, Point d'intégration) pour le collaborateur sélectionné.</p>
                                        </div>
                                    </div>

                                    {eligibleEmployees.length === 0 ? (
                                        <div className="p-4 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-md">
                                            Tous les employés ont déjà un plan d'intégration actif ou terminé.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Sélectionner un Collaborateur</label>
                                            <select
                                                value={selectedEmployeeId}
                                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                                required
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                                            >
                                                <option value="">-- Choisir un collaborateur --</option>
                                                {eligibleEmployees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.firstName} {emp.lastName} ({emp.positionTitle || emp.role || 'Poste Non Spécifié'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                                <Button 
                                    type="submit" 
                                    form="add-plan-form" 
                                    disabled={eligibleEmployees.length === 0} 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium"
                                >
                                    Générer le Plan
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Centre d'Intégration</h2>
                    <p className="text-slate-500 mt-1">Suivez en temps réel et validez les étapes d'intégration de vos recrues.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2 font-medium"
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
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 font-mono">{stat.value}</div>
                                <p className="text-xs text-slate-500 mt-1">Depuis le début de l'année</p>
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
                <Card className="h-full shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Plans Actifs des Collaborateurs</CardTitle>
                        <div className="flex bg-slate-100 p-1 rounded border border-slate-200">
                            <button
                                onClick={() => setFilter('All')}
                                className={`px-3 py-1 shadow-sm rounded text-sm font-medium transition-colors ${filter === 'All' ? 'bg-white text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Tous ({plans.length})
                            </button>
                            <button
                                onClick={() => setFilter('Pending')}
                                className={`px-3 py-1 shadow-sm rounded text-sm font-medium transition-colors ${filter === 'Pending' ? 'bg-white text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                En Cours ({plans.filter(p => p.status !== 'Terminé').length})
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {filteredPlans.map((hire) => (
                                <div key={hire.id} className="border border-slate-200 rounded-lg p-5 hover:border-indigo-200 transition-colors bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hire.iconBg} ${hire.iconColor} font-bold text-lg shadow-sm`}>
                                                {hire.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900 leading-none">{hire.name}</h4>
                                                <p className="text-sm text-slate-500 mt-1">{hire.role} • <span className="text-slate-400">Date d'embauche : {hire.startDate}</span></p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={hire.status === 'Terminé' ? 'success' : 'blue'} className="mb-2 uppercase tracking-wide text-[10px]">
                                                {hire.status}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <span className="font-bold font-mono">{hire.progress}%</span>
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                    <div
                                                        className={`h-full rounded-full ${hire.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${hire.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {hire.tasks.map((task, idx) => (
                                            <div key={task.id || idx} className={`flex items-start gap-3 p-3 rounded-md border ${task.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-slate-50 border-slate-200'} transition-colors`}>
                                                <div className={`p-1.5 rounded-full mt-0.5 ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                                    {task.status === 'completed' ? <CheckCircle size={14} /> : <task.icon size={14} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-emerald-900 line-through' : 'text-slate-700'}`}>{task.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{task.status === 'completed' ? 'Validé' : 'Action Requise'}</p>
                                                </div>
                                                {task.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleMarkDone(hire.id, task.id)}
                                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-1 bg-white border border-slate-200 shadow-sm rounded active:scale-95 transition-transform"
                                                    >
                                                        Valider
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {filteredPlans.length === 0 && (
                                <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    Aucun plan d'intégration ne correspond à ce filtre.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
