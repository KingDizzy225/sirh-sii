import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Plus, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const fmt = (n) => new Intl.NumberFormat('fr-CI').format(n || 0) + ' FCFA';

export function SalaryAdvances() {
    const { token, user } = useAuth();
    const isManager = user?.role === 'Administrator' || user?.role === 'HR' || user?.role === 'Manager';
    const [advances, setAdvances] = useState([]);
    const [activeTab, setActiveTab] = useState('my');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ amount: '', reason: '' });
    const [notification, setNotification] = useState(null);

    const fetchAdvances = async () => {
        try {
            const res = await fetch(`${API_URL}/api/advances`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setAdvances(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { if (token) fetchAdvances(); }, [token]);

    const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/advances`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(form)
        });
        if (res.ok) { setShowForm(false); fetchAdvances(); notify('Demande soumise !'); }
    };

    const handleStatus = async (id, status) => {
        const res = await fetch(`${API_URL}/api/advances/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        if (res.ok) { fetchAdvances(); notify(`Avance ${status.toLowerCase()}.`); }
    };

    const myAdvances = advances.filter(a => a.employee === user?.name);
    const pending = advances.filter(a => a.status === 'En attente');

    const statusColor = (s) => s === 'Approuvé' ? 'bg-emerald-100 text-emerald-700' : s === 'Rejeté' ? 'bg-red-100 text-red-700' : s === 'Déduit' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';

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
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Banknote className="text-emerald-600" /> Avances sur Salaire</h2>
                    <p className="text-slate-500 mt-1">Demandez ou approuvez des avances exceptionnelles.</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Plus size={16} /> Nouvelle Demande
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-xl"><Clock className="text-amber-600" size={22} /></div>
                        <div><p className="text-sm text-slate-500">En attente</p><p className="text-2xl font-bold text-slate-900">{pending.length}</p></div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl"><Check className="text-emerald-600" size={22} /></div>
                        <div><p className="text-sm text-slate-500">Total approuvé</p>
                            <p className="text-2xl font-bold text-slate-900">{fmt(advances.filter(a=>a.status==='Approuvé').reduce((s,a)=>s+a.amount,0))}</p></div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl"><Banknote className="text-blue-600" size={22} /></div>
                        <div><p className="text-sm text-slate-500">Total demandes</p><p className="text-2xl font-bold text-slate-900">{advances.length}</p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[['my', 'Mes Demandes'], ['all', 'Toutes les Demandes']].map(([id, label]) => (
                    isManager || id === 'my' ? (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                            {label}
                            {id === 'all' && pending.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pending.length}</span>}
                        </button>
                    ) : null
                ))}
            </div>

            {/* Table */}
            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {isManager && activeTab === 'all' && <TableHead>Employé</TableHead>}
                                <TableHead>Montant</TableHead>
                                <TableHead>Motif</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Statut</TableHead>
                                {isManager && activeTab === 'all' && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(activeTab === 'my' ? myAdvances : advances).map(a => (
                                <TableRow key={a.id}>
                                    {isManager && activeTab === 'all' && <TableCell className="font-medium">{a.employee}</TableCell>}
                                    <TableCell className="font-bold">{fmt(a.amount)}</TableCell>
                                    <TableCell className="text-slate-500">{a.reason || '—'}</TableCell>
                                    <TableCell className="text-slate-500">{a.requestedAt}</TableCell>
                                    <TableCell><Badge className={`text-xs ${statusColor(a.status)}`}>{a.status}</Badge></TableCell>
                                    {isManager && activeTab === 'all' && (
                                        <TableCell className="text-right">
                                            {a.status === 'En attente' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleStatus(a.id, 'Approuvé')} className="h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50"><Check size={14} className="mr-1" />Approuver</Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleStatus(a.id, 'Rejeté')} className="h-8 text-red-700 border-red-200 hover:bg-red-50"><X size={14} className="mr-1" />Rejeter</Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {(activeTab === 'my' ? myAdvances : advances).length === 0 && (
                                <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-10">Aucune demande.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-600 to-teal-600 flex justify-between">
                                <h3 className="text-lg font-bold text-white">Demande d'Avance</h3>
                                <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Montant demandé (FCFA)</label>
                                    <Input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="Ex: 100000" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Motif</label>
                                    <textarea rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
                                        placeholder="Expliquez brièvement la raison de votre demande..."
                                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Soumettre</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
