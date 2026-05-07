import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    AlertTriangle, 
    Clock, 
    CheckCircle2, 
    X, 
    Plus, 
    Upload, 
    User,
    Calendar,
    Filter,
    FileText
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STATUS_CONFIG = {
    'Non justifié':              { color: 'destructive', icon: '🔴' },
    'En attente de validation':  { color: 'warning',     icon: '🟡' },
    'Justifié':                  { color: 'success',     icon: '🟢' },
    'Contesté':                  { color: 'secondary',   icon: '⚫' },
};

const TYPE_ICONS = {
    'Retard':                    '⏰',
    'Absence non justifiée':     '🚫',
    'Absence justifiée':         '📋',
};

export function Absences() {
    const { token, user } = useAuth();
    const isRH = user?.role === 'HR' || user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const [activeTab, setActiveTab]     = useState(isRH ? 'all' : 'my');
    const [absences, setAbsences]       = useState([]);
    const [myAbsences, setMyAbsences]   = useState([]);
    const [employees, setEmployees]     = useState([]);
    const [notification, setNotification] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [uploadingId, setUploadingId]   = useState(null);
    const [filterMonth, setFilterMonth]   = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');

    const [form, setForm] = useState({
        employeeId: '', type: 'Retard', date: '', durationMinutes: '', justification: ''
    });

    useEffect(() => {
        if (!token) return;
        if (isRH) {
            fetchAbsences();
            fetchEmployees();
        }
        fetchMyAbsences();
    }, [token]);

    const fetchAbsences = async () => {
        try {
            const params = new URLSearchParams();
            if (filterMonth) {
                const [year, month] = filterMonth.split('-');
                params.append('year', year);
                params.append('month', month);
            }
            if (filterEmployee) params.append('employeeId', filterEmployee);

            const res = await fetch(`${API_URL}/api/absences?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setAbsences(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchMyAbsences = async () => {
        try {
            const res = await fetch(`${API_URL}/api/absences/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setMyAbsences(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${API_URL}/api/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmployees(data.employees || data);
            }
        } catch (e) { console.error(e); }
    };

    const showNotif = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/absences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null
                })
            });
            if (res.ok) {
                const newAbs = await res.json();
                setAbsences(prev => [newAbs, ...prev]);
                setIsCreateOpen(false);
                setForm({ employeeId: '', type: 'Retard', date: '', durationMinutes: '', justification: '' });
                showNotif('Absence enregistrée avec succès.');
            }
        } catch (e) { console.error(e); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/api/absences/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setAbsences(prev => prev.map(a => a.id === id ? { ...a, status } : a));
                showNotif(`Statut mis à jour : ${status}`);
            }
        } catch (e) { console.error(e); }
    };

    const handleUploadJustificatif = async (absenceId, file) => {
        if (!file) return;
        setUploadingId(absenceId);
        try {
            const formData = new FormData();
            formData.append('justificatif', file);
            const res = await fetch(`${API_URL}/api/absences/${absenceId}/justificatif`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                showNotif('Justificatif envoyé avec succès !');
                fetchMyAbsences();
                if (isRH) fetchAbsences();
            }
        } catch (e) { console.error(e); }
        finally { setUploadingId(null); }
    };

    const stats = {
        total: absences.length,
        retards: absences.filter(a => a.type === 'Retard').length,
        nonJustifies: absences.filter(a => a.status === 'Non justifié').length,
        justifies: absences.filter(a => a.status === 'Justifié').length,
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-[calc(100vh-4rem)] relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <CheckCircle2 size={20} /> {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Création */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900">Enregistrer une Absence / Retard</h3>
                                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setIsCreateOpen(false)}><X size={18} /></Button>
                            </div>
                            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Employé *</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                        value={form.employeeId}
                                        onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                                        required
                                    >
                                        <option value="">Sélectionner un employé</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Type *</label>
                                        <select
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                            value={form.type}
                                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                        >
                                            <option>Retard</option>
                                            <option>Absence non justifiée</option>
                                            <option>Absence justifiée</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Date *</label>
                                        <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                                    </div>
                                </div>
                                {form.type === 'Retard' && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Durée du retard (minutes)</label>
                                        <Input type="number" min="1" placeholder="ex: 30" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Note (optionnel)</label>
                                    <textarea
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px]"
                                        placeholder="Contexte ou commentaire..."
                                        value={form.justification}
                                        onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Enregistrer</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Absences & Retards</h2>
                    <p className="text-slate-500 mt-1">Suivi des présences, retards et gestion des justificatifs.</p>
                </div>
                {isRH && (
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2" onClick={() => setIsCreateOpen(true)}>
                        <Plus size={18} /> Enregistrer
                    </Button>
                )}
            </div>

            {/* Stats RH */}
            {isRH && (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Incidents', value: stats.total, icon: AlertTriangle, color: 'text-slate-600', bg: 'bg-slate-100' },
                        { label: 'Retards', value: stats.retards, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
                        { label: 'Non Justifiés', value: stats.nonJustifies, icon: X, color: 'text-rose-600', bg: 'bg-rose-100' },
                        { label: 'Justifiés', value: stats.justifies, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    ].map(stat => (
                        <Card key={stat.label} className="border-slate-100 shadow-sm">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon size={20} className={stat.color} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max">
                {isRH && (
                    <button onClick={() => setActiveTab('all')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                        <Filter size={16} /> Vue RH (Tous)
                    </button>
                )}
                <button onClick={() => setActiveTab('my')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'my' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                    <User size={16} /> Mes Absences
                </button>
            </div>

            {/* Tab All (RH) */}
            {activeTab === 'all' && isRH && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Filtres */}
                    <div className="flex flex-wrap gap-3">
                        <Input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-48" />
                        <select
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                            value={filterEmployee}
                            onChange={e => setFilterEmployee(e.target.value)}
                        >
                            <option value="">Tous les employés</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
                        <Button variant="outline" onClick={fetchAbsences}>Filtrer</Button>
                    </div>

                    <Card className="border-slate-100 shadow-sm">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employé</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Durée</TableHead>
                                        <TableHead>Justificatif</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {absences.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                                                Aucune absence enregistrée.
                                            </TableCell>
                                        </TableRow>
                                    ) : absences.map(abs => (
                                        <TableRow key={abs.id}>
                                            <TableCell className="font-medium text-slate-900">
                                                {abs.employee?.firstName} {abs.employee?.lastName}
                                                <div className="text-xs text-slate-400">{abs.employee?.department}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1.5">
                                                    {TYPE_ICONS[abs.type] || '📋'} {abs.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {new Date(abs.date).toLocaleDateString('fr-FR')}
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                {abs.durationMinutes ? `${abs.durationMinutes} min` : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {abs.justificatifPath ? (
                                                    <a href={`${API_URL}${abs.justificatifPath}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
                                                        <FileText size={14} /> Voir
                                                    </a>
                                                ) : <span className="text-slate-400 text-sm">Non fourni</span>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={STATUS_CONFIG[abs.status]?.color || 'secondary'}>
                                                    {STATUS_CONFIG[abs.status]?.icon} {abs.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Button
                                                        size="sm" variant="outline"
                                                        className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => handleStatusChange(abs.id, 'Justifié')}
                                                    >
                                                        ✓ Valider
                                                    </Button>
                                                    <Button
                                                        size="sm" variant="outline"
                                                        className="h-7 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                                                        onClick={() => handleStatusChange(abs.id, 'Contesté')}
                                                    >
                                                        ✗ Contester
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tab My Absences */}
            {activeTab === 'my' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Mon Historique</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Durée</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Justificatif</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myAbsences.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                                <CheckCircle2 size={32} className="mx-auto text-emerald-300 mb-2" />
                                                Aucune absence enregistrée à votre nom. Bravo !
                                            </TableCell>
                                        </TableRow>
                                    ) : myAbsences.map(abs => (
                                        <TableRow key={abs.id}>
                                            <TableCell>
                                                <span className="flex items-center gap-1.5 font-medium text-slate-900">
                                                    {TYPE_ICONS[abs.type] || '📋'} {abs.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {new Date(abs.date).toLocaleDateString('fr-FR')}
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                {abs.durationMinutes ? `${abs.durationMinutes} min` : 'Journée'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={STATUS_CONFIG[abs.status]?.color || 'secondary'}>
                                                    {STATUS_CONFIG[abs.status]?.icon} {abs.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {abs.justificatifPath ? (
                                                    <a href={`${API_URL}${abs.justificatifPath}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm flex items-center justify-end gap-1">
                                                        <FileText size={14} /> Voir le fichier
                                                    </a>
                                                ) : (
                                                    abs.status === 'Non justifié' || abs.status === 'En attente de validation' ? (
                                                        <label className="cursor-pointer flex items-center justify-end gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={e => handleUploadJustificatif(abs.id, e.target.files[0])}
                                                            />
                                                            {uploadingId === abs.id ? (
                                                                <span className="animate-spin border-2 border-indigo-600 border-t-transparent rounded-full w-4 h-4" />
                                                            ) : (
                                                                <><Upload size={14} /> Joindre justificatif</>
                                                            )}
                                                        </label>
                                                    ) : <span className="text-slate-400 text-sm">Non requis</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
