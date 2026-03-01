import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle2, Circle, Clock, Building2, UserCircle,
    ArrowRight, Filter, Settings, Search
} from 'lucide-react';
import { Input } from '../components/ui/input';

const MOCK_ASSIGNED_TASKS = [
    { id: 'AT-001', title: 'Créer e-mail & comptes', employee: 'Michael Chang', department: 'IT', status: 'PENDING', dueDate: '2026-03-02', type: 'ONBOARDING' },
    { id: 'AT-002', title: 'Préparer ordinateur et bureau', employee: 'Michael Chang', department: 'IT', status: 'IN_PROGRESS', dueDate: '2026-03-03', type: 'ONBOARDING' },
    { id: 'AT-003', title: 'Signer contrat de travail', employee: 'Michael Chang', department: 'HR', status: 'DONE', dueDate: '2026-02-28', type: 'ONBOARDING' },
    { id: 'AT-004', title: 'Révoquer accès VPN', employee: 'Sarah Jenkins', department: 'IT', status: 'PENDING', dueDate: '2026-02-28', type: 'OFFBOARDING' },
    { id: 'AT-005', title: 'Entretien de départ', employee: 'Sarah Jenkins', department: 'HR', status: 'PENDING', dueDate: '2026-02-27', type: 'OFFBOARDING' },
    { id: 'AT-006', title: 'Délivrer badge de sécurité', employee: 'Michael Chang', department: 'Facilities', status: 'PENDING', dueDate: '2026-03-04', type: 'ONBOARDING' }
];

const COLUMNS = [
    { id: 'PENDING', label: 'À Faire', icon: Circle, color: 'text-slate-400' },
    { id: 'IN_PROGRESS', label: 'En Cours', icon: Clock, color: 'text-amber-500' },
    { id: 'DONE', label: 'Terminé', icon: CheckCircle2, color: 'text-emerald-500' }
];

export function TaskBoard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState(MOCK_ASSIGNED_TASKS);
    const [deptFilter, setDeptFilter] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');

    const moveTask = (taskId, newStatus) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    const departments = ['Tous', ...new Set(tasks.map(t => t.department))];

    const filteredTasks = tasks.filter(t => {
        const matchDept = deptFilter === 'Tous' || t.department === deptFilter;
        const matchSearch = t.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchDept && matchSearch;
    });

    const getDeptColor = (dept) => {
        const colors = {
            'IT': 'bg-blue-100 text-blue-800',
            'HR': 'bg-purple-100 text-purple-800',
            'Facilities': 'bg-amber-100 text-amber-800',
            'Manager': 'bg-emerald-100 text-emerald-800'
        };
        return colors[dept] || 'bg-slate-100 text-slate-800';
    };

    const renderColumnContent = (status) => {
        const columnTasks = filteredTasks.filter(t => t.status === status);

        return (
            <div className="space-y-4 min-h-[500px] p-2">
                {columnTasks.length === 0 ? (
                    <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        Aucune tâche dans cette étape
                    </div>
                ) : (
                    columnTasks.map(task => (
                        <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow group border-slate-200">
                            <CardContent className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className={`text-[10px] uppercase tracking-wide font-bold ${getDeptColor(task.department)}`}>
                                        {task.department}
                                    </Badge>
                                    <Badge variant="outline" className={`text-[10px] ${task.type === 'ONBOARDING' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                                        {task.type === 'ONBOARDING' ? 'INTÉGRATION' : 'DÉPART'}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{task.title}</h4>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <UserCircle size={14} /> {task.employee}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                                    <span className="text-xs font-medium text-slate-500">Échéance : {task.dueDate}</span>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        {status !== 'PENDING' && (
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveTask(task.id, status === 'DONE' ? 'IN_PROGRESS' : 'PENDING')}>
                                                <ArrowRight size={14} className="rotate-180" />
                                            </Button>
                                        )}
                                        {status !== 'DONE' && (
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveTask(task.id, status === 'PENDING' ? 'IN_PROGRESS' : 'DONE')}>
                                                <ArrowRight size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="text-blue-600 h-8 w-8" />
                        Tableau des Tâches
                    </h2>
                    <p className="text-slate-500 mt-1">Gérez les tâches d'intégration et de départ inter-départementales.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher un employé ou une tâche..."
                            className="bg-white pl-9 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center bg-white border rounded-md p-1 shadow-sm">
                        <Filter className="h-4 w-4 text-slate-400 ml-2 mr-1" />
                        <select
                            className="bg-transparent border-0 text-sm font-medium focus:ring-0 text-slate-700 cursor-pointer pr-2"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept === 'Tous' ? 'Tous les Départements' : dept}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map(col => (
                    <div key={col.id} className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <col.icon className={`h-5 w-5 ${col.color}`} />
                            <h3 className="font-semibold text-slate-800">{col.label}</h3>
                            <Badge variant="secondary" className="ml-auto bg-white border shadow-sm">
                                {filteredTasks.filter(t => t.status === col.id).length}
                            </Badge>
                        </div>
                        <div className="bg-slate-100/50 rounded-2xl p-2 border border-slate-200/60">
                            {renderColumnContent(col.id)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
