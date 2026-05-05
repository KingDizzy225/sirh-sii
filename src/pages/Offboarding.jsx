import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PowerOff, CheckCircle, Clock, Save } from 'lucide-react';
import { api } from '../lib/api.js';

export function Offboarding() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
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
            loadTasks();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Processus de Départs (Offboarding)</h2>
                    <p className="text-slate-500 mt-2">Gérez les restitutions de matériel et les accès informatiques.</p>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <PowerOff className="text-rose-500" size={18} /> Tâches de sortie en cours
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {tasks.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Aucune tâche d'offboarding en vue.</div>
                        ) : (
                            tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => toggleStatus(task.id, task.status)}
                                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                        <div>
                                            <p className={`font-semibold ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                {task.taskName}
                                            </p>
                                            <p className="text-sm text-slate-500">Employé sortant: {task.employee?.firstName} {task.employee?.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {task.status === 'Completed' ? 'Clôturé' : 'En attente'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
