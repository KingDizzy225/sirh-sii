import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Plus, AlertTriangle, Check, X, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const RESULT_CONFIG = {
    'Apte': { color: 'bg-emerald-100 text-emerald-700' },
    'Apte avec restrictions': { color: 'bg-amber-100 text-amber-700' },
    'Inapte temporaire': { color: 'bg-orange-100 text-orange-700' },
    'Inapte définitif': { color: 'bg-red-100 text-red-700' },
};

const ALERT_CONFIG = {
    'OK': { color: 'bg-emerald-100 text-emerald-700', label: '✅ OK' },
    'Expire bientôt': { color: 'bg-amber-100 text-amber-700', label: '⚠️ Expire bientôt' },
    'Expiré': { color: 'bg-red-100 text-red-700', label: '🔴 Expiré' },
};

export function MedicalVisits() {
    const { token } = useAuth();
    const [visits, setVisits] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [notification, setNotification] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({ employeeId: '', visitDate: '', result: 'Apte', restrictions: '', doctor: '', notes: '' });

    const fetchVisits = async () => {
        const res = await fetch(`${API_URL}/api/medical`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setVisits(await res.json());
    };
    const fetchEmployees = async () => {
        const res = await fetch(`${API_URL}/api/employees`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setEmployees(await res.json());
    };
    useEffect(() => { if (token) { fetchVisits(); fetchEmployees(); } }, [token]);

    const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/medical`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(form)
        });
        if (res.ok) { setShowForm(false); fetchVisits(); notify('Visite médicale enregistrée !'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette visite ?')) return;
        const res = await fetch(`${API_URL}/api/medical/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { fetchVisits(); notify('Visite supprimée.'); }
    };

    const alerts = visits.filter(v => v.alertLevel !== 'OK');
    const displayVisits = activeTab === 'alerts' ? alerts : visits;

    return (
        <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <AnimatePresence>
                {notification && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <Check size={18} />{notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Stethoscope className="text-teal-600" /> Médecine du Travail</h2>
                    <p className="text-slate-500 mt-1">Suivi des visites médicales obligatoires (Code du Travail CI - Art. 42.5).</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} /> Enregistrer une Visite</Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-5 flex gap-4 items-center">
                        <div className="p-3 bg-teal-50 rounded-xl"><Users className="text-teal-600" size={22} /></div>
                        <div><p className="text-sm text-slate-500">Total Visites</p><p className="text-2xl font-bold">{visits.length}</p></div>
                    </CardContent>
                </Card>
                <Card className={`shadow-sm ${alerts.length > 0 ? 'border-amber-300' : 'border-slate-200'}`}>
                    <CardContent className="p-5 flex gap-4 items-center">
                        <div className="p-3 bg-amber-50 rounded-xl"><AlertTriangle className="text-amber-600" size={22} /></div>
                        <div><p className="text-sm text-slate-500">Alertes</p><p className="text-2xl font-bold text-amber-600">{alerts.length}</p></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-5 flex gap-4 items-center">
                        <div className="p-3 bg-emerald-50 rounded-xl"><Check className="text-emerald-600" size={22} /></div>
                        <div><p className="text-sm text-slate-500">Aptes</p><p className="text-2xl font-bold text-emerald-600">{visits.filter(v => v.result === 'Apte').length}</p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[['all', 'Toutes les Visites'], ['alerts', `Alertes (${alerts.length})`]].map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === id ? (id === 'alerts' ? 'bg-red-600 text-white' : 'bg-teal-600 text-white') : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        {label}
                    </button>
                ))}
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employé</TableHead>
                                <TableHead>Département</TableHead>
                                <TableHead>Date Visite</TableHead>
                                <TableHead>Expire le</TableHead>
                                <TableHead>Résultat</TableHead>
                                <TableHead>État</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayVisits.map(v => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.employee}</TableCell>
                                    <TableCell className="text-slate-500">{v.department}</TableCell>
                                    <TableCell>{v.visitDate}</TableCell>
                                    <TableCell className={v.alertLevel === 'Expiré' ? 'text-red-600 font-semibold' : ''}>{v.expiryDate}</TableCell>
                                    <TableCell><Badge className={`text-xs ${RESULT_CONFIG[v.result]?.color || ''}`}>{v.result}</Badge></TableCell>
                                    <TableCell><Badge className={`text-xs ${ALERT_CONFIG[v.alertLevel]?.color}`}>{ALERT_CONFIG[v.alertLevel]?.label}</Badge></TableCell>
                                    <TableCell>
                                        <button onClick={() => handleDelete(v.id)} className="text-slate-300 hover:text-red-500 bg-transparent border-0 cursor-pointer"><X size={16} /></button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {displayVisits.length === 0 && (
                                <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-10">
                                    {activeTab === 'alerts' ? '✅ Aucune alerte ! Toutes les visites sont à jour.' : 'Aucune visite enregistrée.'}
                                </TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 flex justify-between">
                                <h3 className="text-lg font-bold text-white">Nouvelle Visite Médicale</h3>
                                <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Employé</label>
                                    <select required value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})}
                                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                        <option value="">Sélectionner un employé...</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.department}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1">Date de la Visite</label>
                                        <Input type="date" required value={form.visitDate} onChange={e => setForm({...form, visitDate: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1">Résultat</label>
                                        <select value={form.result} onChange={e => setForm({...form, result: e.target.value})}
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                            {Object.keys(RESULT_CONFIG).map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div><label className="text-sm font-medium text-slate-700 block mb-1">Médecin du Travail</label><Input value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})} placeholder="Dr. Konan Aimée" /></div>
                                <div><label className="text-sm font-medium text-slate-700 block mb-1">Restrictions (si applicable)</label>
                                    <textarea rows={2} value={form.restrictions} onChange={e => setForm({...form, restrictions: e.target.value})}
                                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm resize-none" placeholder="Ex: Port de charges lourdes interdit" />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Enregistrer</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
