import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { Target, Plus, Trash2, ShieldAlert, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function SuccessionPlanning() {
    const { token } = useAuth();
    const [plans, setPlans] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newPlanPos, setNewPlanPos] = useState('');
    const [newPlanDept, setNewPlanDept] = useState('');
    const [newPlanCrit, setNewPlanCrit] = useState('Medium');

    const loadData = async () => {
        setLoading(true);
        try {
            const [plansRes, empRes] = await Promise.all([
                fetch(`${API_URL}/api/succession`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/employees`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const plansData = await plansRes.json();
            const empData = await empRes.json();
            setPlans(plansData);
            setEmployees(empData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/succession`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ positionTitle: newPlanPos, department: newPlanDept, criticality: newPlanCrit })
            });
            if (res.ok) {
                setNewPlanPos('');
                setNewPlanDept('');
                loadData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeletePlan = async (id) => {
        if (!window.confirm("Supprimer ce plan de succession ?")) return;
        try {
            await fetch(`${API_URL}/api/succession/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddSuccessor = async (planId, employeeId, readiness) => {
        try {
            await fetch(`${API_URL}/api/succession/successors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ planId, employeeId, readiness })
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveSuccessor = async (id) => {
        try {
            await fetch(`${API_URL}/api/succession/successors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const getCritColor = (crit) => {
        if (crit === 'Critical') return 'bg-red-100 text-red-800 border-red-200';
        if (crit === 'High') return 'bg-amber-100 text-amber-800 border-amber-200';
        if (crit === 'Medium') return 'bg-blue-100 text-blue-800 border-blue-200';
        return 'bg-slate-100 text-slate-800 border-slate-200';
    };

    const getReadinessIcon = (readiness) => {
        if (readiness === 'Ready Now') return <CheckCircle2 size={14} className="text-emerald-500" />;
        if (readiness === '1-2 Years') return <Clock size={14} className="text-blue-500" />;
        return <Calendar size={14} className="text-amber-500" />;
    };

    if (loading) return <div className="p-8 text-slate-500">Chargement...</div>;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <Target className="text-violet-600" /> Plan de Succession
                </h2>
                <p className="text-slate-500 mt-1">Anticipez les départs sur les postes critiques en créant des bancs de remplaçants.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="md:col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Nouveau Poste Critique</CardTitle>
                        <CardDescription>Ciblez un poste à risque.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreatePlan} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Titre du Poste</label>
                                <Input required value={newPlanPos} onChange={e => setNewPlanPos(e.target.value)} placeholder="Ex: Directeur Financier" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Département</label>
                                <Input required value={newPlanDept} onChange={e => setNewPlanDept(e.target.value)} placeholder="Ex: Finance" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Criticité</label>
                                <select className="w-full text-sm border-slate-200 rounded-md p-2 mt-1" value={newPlanCrit} onChange={e => setNewPlanCrit(e.target.value)}>
                                    <option value="Low">Faible</option>
                                    <option value="Medium">Moyenne</option>
                                    <option value="High">Haute</option>
                                    <option value="Critical">Critique</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white">Créer le Plan</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-6">
                    {plans.map(plan => (
                        <Card key={plan.id} className="shadow-sm overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl text-slate-800">{plan.positionTitle}</CardTitle>
                                        <Badge variant="outline" className={getCritColor(plan.criticality)}>{plan.criticality}</Badge>
                                    </div>
                                    <CardDescription className="mt-1">{plan.department}</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)} className="text-red-500 hover:bg-red-50">
                                    <Trash2 size={16} />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 bg-slate-50/50">
                                <div className="grid md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-slate-100">
                                    {/* Ready Now */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                            <h4 className="font-bold text-slate-700 text-sm">Prêt Immédiatement</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {plan.successors.filter(s => s.readiness === 'Ready Now').map(s => (
                                                <div key={s.id} className="bg-white border border-slate-200 rounded-md p-3 flex justify-between items-center group shadow-sm">
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{s.employee.firstName} {s.employee.lastName}</div>
                                                        <div className="text-xs text-slate-500">{s.employee.positionTitle}</div>
                                                    </div>
                                                    <button onClick={() => handleRemoveSuccessor(s.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <AddSuccessorButton planId={plan.id} readiness="Ready Now" employees={employees} currentSuccessors={plan.successors} onAdd={handleAddSuccessor} />
                                        </div>
                                    </div>

                                    {/* 1-2 Years */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Clock size={16} className="text-blue-500" />
                                            <h4 className="font-bold text-slate-700 text-sm">Prêt dans 1-2 Ans</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {plan.successors.filter(s => s.readiness === '1-2 Years').map(s => (
                                                <div key={s.id} className="bg-white border border-slate-200 rounded-md p-3 flex justify-between items-center group shadow-sm">
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{s.employee.firstName} {s.employee.lastName}</div>
                                                        <div className="text-xs text-slate-500">{s.employee.positionTitle}</div>
                                                    </div>
                                                    <button onClick={() => handleRemoveSuccessor(s.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <AddSuccessorButton planId={plan.id} readiness="1-2 Years" employees={employees} currentSuccessors={plan.successors} onAdd={handleAddSuccessor} />
                                        </div>
                                    </div>

                                    {/* 3+ Years */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Calendar size={16} className="text-amber-500" />
                                            <h4 className="font-bold text-slate-700 text-sm">Prêt dans 3+ Ans</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {plan.successors.filter(s => s.readiness === '3+ Years').map(s => (
                                                <div key={s.id} className="bg-white border border-slate-200 rounded-md p-3 flex justify-between items-center group shadow-sm">
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{s.employee.firstName} {s.employee.lastName}</div>
                                                        <div className="text-xs text-slate-500">{s.employee.positionTitle}</div>
                                                    </div>
                                                    <button onClick={() => handleRemoveSuccessor(s.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <AddSuccessorButton planId={plan.id} readiness="3+ Years" employees={employees} currentSuccessors={plan.successors} onAdd={handleAddSuccessor} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {plans.length === 0 && (
                        <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-xl">
                            <Target size={40} className="mx-auto text-slate-300 mb-2" />
                            <h3 className="text-slate-700 font-bold">Aucun Plan de Succession</h3>
                            <p className="text-slate-500 text-sm">Ciblez votre premier poste critique.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function AddSuccessorButton({ planId, readiness, employees, currentSuccessors, onAdd }) {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState('');

    const currentIds = currentSuccessors.map(s => s.employeeId);
    const availableEmployees = employees.filter(e => !currentIds.includes(e.id));

    if (!isAdding) {
        return (
            <button onClick={() => setIsAdding(true)} className="w-full border-2 border-dashed border-slate-200 rounded-md p-2 text-xs font-bold text-slate-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-colors flex items-center justify-center gap-1">
                <Plus size={14} /> Ajouter un candidat
            </button>
        );
    }

    return (
        <div className="bg-slate-100 p-2 rounded-md border border-slate-200 space-y-2">
            <select 
                className="w-full text-xs p-1.5 rounded border border-slate-300"
                value={selectedEmp}
                onChange={e => setSelectedEmp(e.target.value)}
            >
                <option value="">Sélectionner...</option>
                {availableEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.positionTitle})</option>
                ))}
            </select>
            <div className="flex gap-2">
                <Button size="sm" className="flex-1 h-6 text-[10px] bg-violet-600 hover:bg-violet-700" onClick={() => {
                    if (selectedEmp) {
                        onAdd(planId, selectedEmp, readiness);
                        setIsAdding(false);
                        setSelectedEmp('');
                    }
                }}>Valider</Button>
                <Button size="sm" variant="outline" className="flex-1 h-6 text-[10px]" onClick={() => setIsAdding(false)}>Annuler</Button>
            </div>
        </div>
    );
}
