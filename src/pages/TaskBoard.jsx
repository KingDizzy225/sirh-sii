import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle2, Circle, Clock, Building2, UserCircle,
    ArrowRight, Filter, Settings, Search, AlertTriangle, 
    Calendar, ShieldAlert, Plus, Sparkles, Check, CheckCheck
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const INITIAL_CRITICAL_ALERTS = [
    { id: 'ALT-1', type: 'TRIAL', title: 'Fin de Période d\'Essai', employee: 'Awa Koné', department: 'Commercial', daysLeft: 6, action: 'Décision requise (Validation / Rupture)' },
    { id: 'ALT-2', type: 'CDD', title: 'Échéance Contrat CDD', employee: 'Mamadou Bamba', department: 'Tech / IT', daysLeft: 18, action: 'Proposition CDI ou Fin de mission' },
    { id: 'ALT-3', type: 'MEDICAL', title: 'Visite Médicale Périodique', employee: 'Jean-Yves Kouassi', department: 'Opérations', daysLeft: 12, action: 'Convocation Médecine du travail' },
    { id: 'ALT-4', type: 'DOC', title: 'Justificatif d\'absence en attente', employee: 'Fatou Diop', department: 'Finance', daysLeft: 2, action: 'Relance justificatif arrêt maladie' },
];

const INITIAL_TASKS = [
    { id: 'AT-001', title: 'Clôturer la déclaration DISA CNPS 2026', employee: 'Équipe Paie', department: 'RH', status: 'IN_PROGRESS', dueDate: '2026-09-30', priority: 'URGENT' },
    { id: 'AT-002', title: 'Programmer 4 entretiens de recrutement (Lead Tech)', employee: 'Ibrahim Touré', department: 'Recrutement', status: 'PENDING', dueDate: '2026-09-24', priority: 'HIGH' },
    { id: 'AT-003', title: 'Préparer pack d\'onboarding 2 nouveaux consultants', employee: 'Sarah Yao', department: 'RH', status: 'DONE', dueDate: '2026-09-20', priority: 'NORMAL' },
    { id: 'AT-004', title: 'Mise à jour de la grille de classification FDFP', employee: 'Direction RH', department: 'GPEC', status: 'PENDING', dueDate: '2026-10-05', priority: 'NORMAL' },
    { id: 'AT-005', title: 'Audit des visites médicales obligatoires', employee: 'Médecine Travail', department: 'HSE', status: 'IN_PROGRESS', dueDate: '2026-09-28', priority: 'HIGH' },
    { id: 'AT-006', title: 'Validation des notes de frais de mission San Pedro', employee: 'Comptabilité RH', department: 'Finance', status: 'DONE', dueDate: '2026-09-18', priority: 'NORMAL' }
];

const COLUMNS = [
    { id: 'PENDING', label: 'À Traiter', icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50' },
    { id: 'IN_PROGRESS', label: 'En Cours', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50/40' },
    { id: 'DONE', label: 'Terminé / Conforme', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50/40' }
];

export function TaskBoard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [alerts, setAlerts] = useState(INITIAL_CRITICAL_ALERTS);
    const [deptFilter, setDeptFilter] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskDept, setNewTaskDept] = useState('RH');

    const moveTask = (taskId, newStatus) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        const newTask = {
            id: `AT-00${tasks.length + 1}`,
            title: newTaskTitle.trim(),
            employee: newTaskAssignee.trim() || 'Équipe RH',
            department: newTaskDept,
            status: 'PENDING',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'NORMAL'
        };
        setTasks([newTask, ...tasks]);
        setNewTaskTitle('');
        setNewTaskAssignee('');
        setIsAddingTask(false);
    };

    const dismissAlert = (id) => {
        setAlerts(alerts.filter(a => a.id !== id));
    };

    const departments = ['Tous', ...new Set(tasks.map(t => t.department))];

    const filteredTasks = tasks.filter(t => {
        const matchDept = deptFilter === 'Tous' || t.department === deptFilter;
        const matchSearch = t.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchDept && matchSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-blue-600 h-8 w-8" />
                        Centre de Commandes & Alertes RH
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">
                        Pilotage des échéances légales (fins d'essai, CDD, visites médicales) et coordination des tâches du département RH.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsAddingTask(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 h-11"
                    >
                        <Plus size={18} /> Nouvelle Tâche RH
                    </Button>
                </div>
            </div>

            {/* BANDEAU DES ALERTES CRITIQUES & ÉCHÉANCES LÉGALES */}
            <Card className="border border-rose-200 bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-white shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="py-3 px-6 border-b border-rose-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                        <AlertTriangle className="text-rose-600 animate-pulse" size={18} />
                        Radar des Échéances Juridiques & Légales ({alerts.length} en alerte)
                    </div>
                    <Badge variant="outline" className="border-rose-300 text-rose-700 bg-rose-100/50 text-[10px] font-bold">
                        Surveillance continue
                    </Badge>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {alerts.map(alt => (
                        <div 
                            key={alt.id}
                            className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        {alt.department}
                                    </span>
                                    <Badge className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5",
                                        alt.daysLeft <= 7 ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
                                    )}>
                                        Dans {alt.daysLeft} jours
                                    </Badge>
                                </div>
                                <h4 className="font-bold text-xs text-slate-900">{alt.title}</h4>
                                <p className="text-xs text-slate-600 font-medium">{alt.employee}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-blue-600 truncate max-w-[150px]">{alt.action}</span>
                                <button 
                                    onClick={() => dismissAlert(alt.id)}
                                    className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                                >
                                    ✓ Traiter
                                </button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* MODAL CRÉATION DE TÂCHE */}
            {isAddingTask && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 items-center">
                    <Input
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="Intitulé de la tâche RH..."
                        className="bg-slate-800 border-slate-700 text-white rounded-xl h-11 flex-1"
                    />
                    <Input
                        value={newTaskAssignee}
                        onChange={e => setNewTaskAssignee(e.target.value)}
                        placeholder="Assigné à (ex: Awa, Ibrahim)..."
                        className="bg-slate-800 border-slate-700 text-white rounded-xl h-11 sm:w-48"
                    />
                    <select
                        value={newTaskDept}
                        onChange={e => setNewTaskDept(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white rounded-xl h-11 px-3 text-sm outline-none"
                    >
                        <option value="RH">RH Général</option>
                        <option value="Paie">Paie</option>
                        <option value="Recrutement">Recrutement</option>
                        <option value="GPEC">GPEC</option>
                        <option value="HSE">HSE / Santé</option>
                    </select>
                    <div className="flex gap-2">
                        <Button onClick={handleAddTask} className="bg-emerald-600 hover:bg-emerald-500 font-bold h-11 px-4 rounded-xl">
                            Ajouter
                        </Button>
                        <Button onClick={() => setIsAddingTask(false)} variant="outline" className="border-slate-700 text-slate-300 h-11 px-3 rounded-xl">
                            Annuler
                        </Button>
                    </div>
                </div>
            )}

            {/* FILTRES & RECHERCHE */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher une tâche..."
                        className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 text-xs font-bold text-slate-700 outline-none"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept === 'Tous' ? 'Toutes les catégories' : dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KANBAN DES TÂCHES RH */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map(col => {
                    const colTasks = filteredTasks.filter(t => t.status === col.id);
                    return (
                        <div key={col.id} className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3 px-2">
                                <col.icon className={`h-5 w-5 ${col.color}`} />
                                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">{col.label}</h3>
                                <Badge variant="secondary" className="ml-auto bg-slate-200/80 text-slate-700 font-bold">
                                    {colTasks.length}
                                </Badge>
                            </div>

                            <div className="bg-slate-100/60 rounded-2xl p-3 border border-slate-200/60 min-h-[450px] space-y-3">
                                {colTasks.map(task => (
                                    <Card key={task.id} className="bg-white border-slate-200/80 shadow-xs hover:shadow-md transition-all rounded-xl overflow-hidden">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-center justify-between text-[10px] font-bold">
                                                <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50">
                                                    {task.department}
                                                </Badge>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full",
                                                    task.priority === 'URGENT' ? "bg-rose-100 text-rose-700" :
                                                    task.priority === 'HIGH' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                                                )}>
                                                    {task.priority}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-sm text-slate-900 leading-snug">{task.title}</h4>

                                            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-1.5">
                                                    <UserCircle size={14} className="text-slate-400" />
                                                    <span className="font-medium truncate max-w-[120px]">{task.employee}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] font-mono">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {task.dueDate}
                                                </div>
                                            </div>

                                            {/* Boutons de changement d'état */}
                                            <div className="flex justify-end gap-1.5 pt-1">
                                                {col.id !== 'PENDING' && (
                                                    <button 
                                                        onClick={() => moveTask(task.id, 'PENDING')}
                                                        className="text-[10px] font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded bg-slate-100"
                                                    >
                                                        ← À Traiter
                                                    </button>
                                                )}
                                                {col.id !== 'IN_PROGRESS' && (
                                                    <button 
                                                        onClick={() => moveTask(task.id, 'IN_PROGRESS')}
                                                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 px-2 py-1 rounded bg-amber-50"
                                                    >
                                                        En Cours
                                                    </button>
                                                )}
                                                {col.id !== 'DONE' && (
                                                    <button 
                                                        onClick={() => moveTask(task.id, 'DONE')}
                                                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded bg-emerald-50 flex items-center gap-1"
                                                    >
                                                        <Check size={12} /> Terminer
                                                    </button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
