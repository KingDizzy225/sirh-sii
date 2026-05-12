import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { Target, Plus, Trash2, ShieldAlert, CheckCircle2, Clock, Calendar, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dnd Kit Imports
import { DndContext, useDraggable, useDroppable, closestCenter } from '@dnd-kit/core';

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

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        // active.id is successor.id
        // over.id is newReadiness (Ready Now, etc.)
        const successorId = active.id;
        const newReadiness = over.id;

        // Optimistic update
        const updatedPlans = plans.map(plan => ({
            ...plan,
            successors: plan.successors.map(s => 
                s.id === successorId ? { ...s, readiness: newReadiness } : s
            )
        }));
        setPlans(updatedPlans);

        try {
            await fetch(`${API_URL}/api/succession/successors/${successorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ readiness: newReadiness })
            });
            loadData();
        } catch (err) {
            console.error(err);
            loadData(); // Revert on error
        }
    };

    const getCritColor = (crit) => {
        if (crit === 'Critical') return 'bg-red-100 text-red-800 border-red-200';
        if (crit === 'High') return 'bg-amber-100 text-amber-800 border-amber-200';
        if (crit === 'Medium') return 'bg-blue-100 text-blue-800 border-blue-200';
        return 'bg-slate-100 text-slate-800 border-slate-200';
    };

    if (loading) return <div className="p-8 text-slate-500">Chargement...</div>;

    return (
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Target className="text-violet-600" /> Plan de Succession
                    </h2>
                    <p className="text-slate-500 mt-1">Anticipez les départs sur les postes critiques en créant des bancs de remplaçants.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="md:col-span-1 shadow-sm h-fit sticky top-6">
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
                                        
                                        {/* Ready Now Column */}
                                        <DroppableCategory 
                                            id="Ready Now" 
                                            title="Prêt Immédiatement" 
                                            icon={<CheckCircle2 size={16} className="text-emerald-500" />}
                                            successors={plan.successors.filter(s => s.readiness === 'Ready Now')}
                                            onRemove={handleRemoveSuccessor}
                                            renderAdd={() => (
                                                <AddSuccessorButton planId={plan.id} readiness="Ready Now" employees={employees} currentSuccessors={plan.successors} onAdd={handleAddSuccessor} />
                                            )}
                                        />

                                        {/* 1-2 Years Column */}
                                        <DroppableCategory 
                                            id="1-2 Years" 
                                            title="Prêt dans 1-2 Ans" 
                                            icon={<Clock size={16} className="text-blue-500" />}
                                            successors={plan.successors.filter(s => s.readiness === '1-2 Years')}
                                            onRemove={handleRemoveSuccessor}
                                            renderAdd={() => (
                                                <AddSuccessorButton planId={plan.id} readiness="1-2 Years" employees={employees} currentSuccessors={plan.successors} onAdd={handleAddSuccessor} />
                                            )}
                                        />

                                        {/* 3+ Years Column */}
                                        <DroppableCategory 
                                            id="3+ Years" 
                                            title="Prêt dans 3+ Ans" 
                                            icon={<Calendar size={16} className="text-amber-500" />}
                                            successors={plan.successors.filter(s => s.readiness === '3+ Years')}
                                            onRemove={handleRemoveSuccessor}
                                            renderAdd={() => (
                                                <AddSuccessorButton planId={plan.id} readiness="3+ Years" employees={employees} currentSuccessors={plan.successors} onAdd={handleAddSuccessor} />
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}

function DroppableCategory({ id, title, icon, successors, onRemove, renderAdd }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={cn("p-4 transition-colors", isOver ? "bg-violet-50/50" : "")}>
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
            </div>
            <div className="space-y-2 min-h-[50px]">
                {successors.map(s => (
                    <DraggableSuccessor key={s.id} successor={s} onRemove={onRemove} />
                ))}
                {renderAdd()}
            </div>
        </div>
    );
}

function DraggableSuccessor({ successor, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: successor.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
    } : undefined;

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={cn(
                "bg-white border border-slate-200 rounded-md p-3 flex justify-between items-center group shadow-sm",
                isDragging ? "opacity-50 border-violet-500 shadow-xl cursor-grabbing" : "cursor-default"
            )}
        >
            <div className="flex items-center gap-2">
                <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                    <GripVertical size={14} />
                </div>
                <div>
                    <div className="font-bold text-slate-800 text-sm">{successor.employee.firstName} {successor.employee.lastName}</div>
                    <div className="text-xs text-slate-500">{successor.employee.positionTitle}</div>
                </div>
            </div>
            <button onClick={() => onRemove(successor.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
            </button>
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
