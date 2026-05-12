import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Target, Trash2, CheckCircle2, XCircle, AlertTriangle, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function RetentionCenter() {
    const { token } = useAuth();
    const [actions, setActions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newEmpId, setNewEmpId] = useState('');
    const [newRisk, setNewRisk] = useState('High');
    const [newAction, setNewAction] = useState('');

    const loadData = async () => {
        try {
            const [actionRes, empRes] = await Promise.all([
                fetch(`${API_URL}/api/retention`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/employees`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setActions(await actionRes.json());
            setEmployees(await empRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/api/retention`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ employeeId: newEmpId, riskLevel: newRisk, recommendedAction: newAction })
            });
            setNewEmpId('');
            setNewAction('');
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await fetch(`${API_URL}/api/retention/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Supprimer cette alerte ?")) return;
        try {
            await fetch(`${API_URL}/api/retention/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const getRiskColor = (risk) => {
        if (risk === 'High') return 'bg-red-100 text-red-800 border-red-200';
        if (risk === 'Medium') return 'bg-amber-100 text-amber-800 border-amber-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    if (loading) return <div className="p-8 text-slate-500">Chargement...</div>;

    const pendingActions = actions.filter(a => a.status === 'PENDING');
    const completedActions = actions.filter(a => a.status !== 'PENDING');

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="text-rose-600" /> Centre Anti-Turnover
                </h2>
                <p className="text-slate-500 mt-1">Prévenez les départs grâce aux recommandations de rétention.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 shadow-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Nouvelle Alerte</CardTitle>
                        <CardDescription>Créer une alerte manuelle.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Employé à Risque</label>
                                <select required className="w-full text-sm border-slate-200 rounded-md p-2 mt-1" value={newEmpId} onChange={e => setNewEmpId(e.target.value)}>
                                    <option value="">Sélectionner...</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Niveau de Risque</label>
                                <select className="w-full text-sm border-slate-200 rounded-md p-2 mt-1" value={newRisk} onChange={e => setNewRisk(e.target.value)}>
                                    <option value="Low">Faible</option>
                                    <option value="Medium">Moyen</option>
                                    <option value="High">Élevé</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Action Recommandée</label>
                                <textarea required className="w-full text-sm border-slate-200 rounded-md p-2 mt-1 min-h-[80px]" value={newAction} onChange={e => setNewAction(e.target.value)} placeholder="Ex: Proposer augmentation de 5%..."></textarea>
                            </div>
                            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white">Ajouter l'alerte</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" /> Actions Requises ({pendingActions.length})
                    </h3>
                    <div className="space-y-4">
                        {pendingActions.map(action => (
                            <Card key={action.id} className="shadow-sm border-l-4 border-l-rose-500">
                                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-800">{action.employee.firstName} {action.employee.lastName}</span>
                                            <Badge variant="outline" className={getRiskColor(action.riskLevel)}>Risque: {action.riskLevel}</Badge>
                                            <span className="text-xs text-slate-400 ml-2">{new Date(action.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mb-3">{action.employee.positionTitle} • {action.employee.department}</div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
                                            <strong>Action : </strong> {action.recommendedAction}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button size="sm" onClick={() => handleStatusUpdate(action.id, 'COMPLETED')} className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-1">
                                            <CheckCircle2 size={16} /> Fait
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(action.id, 'REJECTED')} className="text-slate-500 flex gap-1">
                                            <XCircle size={16} /> Ignorer
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(action.id)} className="text-red-500 hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {pendingActions.length === 0 && <div className="text-slate-500 text-sm py-4">Aucune action en attente.</div>}
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 pt-4 border-t border-slate-200">
                        Historique ({completedActions.length})
                    </h3>
                    <div className="space-y-3 opacity-60">
                        {completedActions.map(action => (
                            <div key={action.id} className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-bold text-slate-700">{action.employee.firstName} {action.employee.lastName}</span>
                                    <span className="mx-2 text-slate-400">|</span>
                                    <span className="text-slate-600">{action.recommendedAction}</span>
                                </div>
                                <Badge variant="outline" className={action.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>
                                    {action.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
