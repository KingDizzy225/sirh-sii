import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, Save, Clock, Trash2, ChevronLeft, ChevronRight, Moon, AlertTriangle, User, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const PROJECTS = [
    { id: 'PRJ-001', name: 'Refonte Site Web', code: 'WEB-REC' },
    { id: 'PRJ-002', name: 'Développement API Mobile', code: 'DEV-API' },
    { id: 'PRJ-003', name: 'Maintenance Serveurs', code: 'OPS-MTN' },
    { id: 'PRJ-004', name: 'Formation Continue', code: 'HR-LRN' },
];

const WEEK_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Generate current week dates
const getWeekDates = (startDate) => {
    let dates = [];
    for (let i = 0; i < 7; i++) {
        let date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
    }
    return dates;
};

// --- COMPONENT ---
export function Timesheet() {
    const { user } = useAuth();
    const userRole = user?.role || 'EMPLOYEE';
    const isManagerOrAdmin = userRole === 'MANAGER' || userRole === 'ADMIN' || userRole === 'HR';

    const [activeTab, setActiveTab] = useState('my-timesheet');
    const [notification, setNotification] = useState(null);

    const [currentDate, setCurrentDate] = useState(() => {
        let d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        return new Date(d.setDate(diff));
    });

    const [weekDates, setWeekDates] = useState([]);

    // Structure of a row: { id, projectId, isNightShift, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
    const [rows, setRows] = useState([
        { id: Date.now().toString(), projectId: 'PRJ-001', isNightShift: false, mon: 8, tue: 8, wed: 4, thu: 0, fri: 0, sat: 0, sun: 0 },
        { id: (Date.now() + 1).toString(), projectId: 'PRJ-002', isNightShift: false, mon: 0, tue: 0, wed: 4, thu: 8, fri: 7, sat: 0, sun: 0 }
    ]);

    const [status, setStatus] = useState('DRAFT'); // DRAFT, SUBMITTED, APPROVED
    const [totals, setTotals] = useState({ standard: 0, overtime: 0, night: 0, weekend: 0, grandTotal: 0 });

    const STANDARD_WEEKLY_HOURS = 35; // Règle légale

    // MOCK: Team approvals pending
    const [pendingApprovals, setPendingApprovals] = useState([
        { id: '1', employee: 'Alice Dupont', period: '12 Mars - 18 Mars', totalHours: 35, status: 'En attente' },
        { id: '2', employee: 'Bob Martin', period: '12 Mars - 18 Mars', totalHours: 40, status: 'En attente' }
    ]);

    useEffect(() => {
        setWeekDates(getWeekDates(currentDate));
    }, [currentDate]);

    useEffect(() => {
        calculateTotals(rows);
    }, [rows]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const changeWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
        setStatus('DRAFT');
    };

    const addRow = () => {
        setRows([...rows, {
            id: Date.now().toString(),
            projectId: '',
            isNightShift: false,
            mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0
        }]);
    };

    const removeRow = (id) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const updateRow = (id, field, value) => {
        if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(field)) {
            let val = parseFloat(value) || 0;
            if (val > 24) val = 24;
            if (val < 0) val = 0;
            setRows(rows.map(r => r.id === id ? { ...r, [field]: val } : r));
        } else {
            setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
        }
    };

    const calculateTotals = (currentRows) => {
        let totalWeek = 0;
        let totalNight = 0;
        let totalWeekend = 0;

        currentRows.forEach(row => {
            const rowTotal = row.mon + row.tue + row.wed + row.thu + row.fri + row.sat + row.sun;
            totalWeek += rowTotal;

            if (row.isNightShift) {
                totalNight += rowTotal;
            }

            totalWeekend += (row.sat + row.sun);
        });

        const overtime = totalWeek > STANDARD_WEEKLY_HOURS ? (totalWeek - STANDARD_WEEKLY_HOURS) : 0;
        const standard = totalWeek > STANDARD_WEEKLY_HOURS ? STANDARD_WEEKLY_HOURS : totalWeek;

        setTotals({
            standard,
            overtime,
            night: totalNight,
            weekend: totalWeekend,
            grandTotal: totalWeek
        });
    };

    const handleSubmit = () => {
        const hasEmptyProjects = rows.some(r => !r.projectId);
        if (hasEmptyProjects) {
            alert("Veuillez sélectionner un projet pour toutes les lignes avant de soumettre.");
            return;
        }

        setStatus('SUBMITTED');
        showNotification('Votre feuille de temps a été transmise pour approbation.');
    };

    const handleApproveTeamTimesheet = (id) => {
        setPendingApprovals(pendingApprovals.filter(a => a.id !== id));
        showNotification('Feuille de temps approuvée.');
    };

    const handleRejectTeamTimesheet = (id) => {
        setPendingApprovals(pendingApprovals.filter(a => a.id !== id));
        showNotification('Feuille de temps rejetée.');
    };

    const formatDateHeader = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">
            
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium cursor-pointer"
                        onClick={() => setNotification(null)}
                    >
                        <Check size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Clock className="text-blue-600 h-8 w-8" />
                        Feuilles de Temps (GTA)
                    </h2>
                    <p className="text-slate-500 mt-1">Saisie de vos heures et pointages d'équipe.</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max mb-6">
                <button
                    onClick={() => setActiveTab('my-timesheet')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'my-timesheet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <User size={16} /> Ma Saisie
                </button>
                {isManagerOrAdmin && (
                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                    >
                        <Check size={16} /> Approbations Équipe
                        {pendingApprovals.length > 0 && (
                            <span className="ml-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingApprovals.length}</span>
                        )}
                    </button>
                )}
            </div>

            {activeTab === 'my-timesheet' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center space-x-4 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600" onClick={() => changeWeek(-1)} disabled={status === 'SUBMITTED' || status === 'APPROVED'}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-sm font-semibold text-slate-700 w-48 text-center">
                                {weekDates[0] ? `Semaine du ${weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` : 'Chargement...'}
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600" onClick={() => changeWeek(1)} disabled={status === 'SUBMITTED' || status === 'APPROVED'}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="text-sm font-semibold text-slate-500">Statut:</div>
                                <Badge variant={status === 'DRAFT' ? 'secondary' : status === 'SUBMITTED' ? 'warning' : 'success'} className="uppercase">
                                    {status === 'DRAFT' ? 'Brouillon' : status === 'SUBMITTED' ? 'Soumis' : 'Approuvé'}
                                </Badge>
                            </div>
                            {status === 'DRAFT' && (
                                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm rounded-lg">
                                    <Save size={16} /> Transmettre
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* MAIN GRID */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100/50 text-slate-700 border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold min-w-[200px]">Code Projet</th>
                                        <th className="px-2 py-4 font-semibold text-center w-16" title="Travail de Nuit">Nuit</th>
                                        {WEEK_DAYS.map((day, idx) => (
                                            <th key={day} className={`px-2 py-4 font-semibold text-center w-20 ${idx >= 5 ? 'text-amber-600 bg-amber-50/50' : ''}`}>
                                                <div>{day}</div>
                                                <div className="text-xs font-normal text-slate-500 mt-0.5">{formatDateHeader(weekDates[idx])}</div>
                                            </th>
                                        ))}
                                        <th className="px-4 py-4 font-semibold text-center w-24 border-l border-slate-200 bg-slate-50">Total</th>
                                        <th className="px-2 py-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.map((row) => {
                                        const rowTotal = row.mon + row.tue + row.wed + row.thu + row.fri + row.sat + row.sun;
                                        const isFrozen = status !== 'DRAFT';

                                        return (
                                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-5 py-3">
                                                    <select
                                                        value={row.projectId}
                                                        onChange={(e) => updateRow(row.id, 'projectId', e.target.value)}
                                                        className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                                                        disabled={isFrozen}
                                                    >
                                                        <option value="" disabled>-- Projet --</option>
                                                        {PROJECTS.map(p => (
                                                            <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-2 py-3 text-center">
                                                    <label className="flex items-center justify-center cursor-pointer p-1 rounded hover:bg-slate-100">
                                                        <input
                                                            type="checkbox"
                                                            checked={row.isNightShift}
                                                            onChange={(e) => updateRow(row.id, 'isNightShift', e.target.checked)}
                                                            disabled={isFrozen}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer disabled:opacity-50"
                                                        />
                                                    </label>
                                                </td>
                                                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((dayKey, idx) => (
                                                    <td key={dayKey} className={`px-2 py-3 ${idx >= 5 ? 'bg-amber-50/20' : ''}`}>
                                                        <input
                                                            type="number"
                                                            min="0" max="24" step="0.5"
                                                            value={row[dayKey] || ''}
                                                            onChange={(e) => updateRow(row.id, dayKey, e.target.value)}
                                                            disabled={isFrozen}
                                                            className={`w-full h-10 text-center rounded-md border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-blue-500 transition-colors ${row[dayKey] > 0 ? (row.isNightShift ? 'font-bold text-indigo-700 bg-indigo-50 border-indigo-200' : 'font-bold text-blue-700 bg-blue-50 border-blue-200') : ''} disabled:bg-slate-50 disabled:text-slate-500`}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3 text-center font-bold text-slate-700 border-l border-slate-200 bg-slate-50">
                                                    {rowTotal > 0 ? <span className={row.isNightShift ? 'text-indigo-600' : ''}>{rowTotal}h</span> : '-'}
                                                </td>
                                                <td className="px-2 py-3 text-center">
                                                    <Button variant="ghost" size="icon" onClick={() => removeRow(row.id)} disabled={rows.length === 1 || isFrozen} className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                {status === 'DRAFT' && (
                                    <tfoot>
                                        <tr>
                                            <td colSpan="11" className="px-5 py-4 bg-slate-50/50 border-t border-slate-200">
                                                <Button variant="outline" onClick={addRow} className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 h-9 text-sm gap-1.5 font-medium shadow-sm">
                                                    <Plus size={16} /> Ajouter une ligne d'imputation
                                                </Button>
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </Card>

                    {/* SUMMARY PANEL */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-slate-200 md:col-span-3">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Récapitulatif & Variables de Paie</CardTitle>
                                <CardDescription>Les variables sont calculées automatiquement en fonction des seuils légaux.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                        <div className="text-sm font-medium text-slate-500 mb-1">Standard</div>
                                        <div className="text-2xl font-bold text-slate-900">{totals.standard}h <span className="text-xs font-normal text-slate-400">/ {STANDARD_WEEKLY_HOURS}h</span></div>
                                    </div>

                                    <motion.div
                                        animate={totals.overtime > 0 ? { scale: [1, 1.05, 1] } : {}}
                                        transition={{ duration: 0.5 }}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${totals.overtime > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                                    >
                                        <div className="text-sm font-medium opacity-80 mb-1 flex items-center justify-center gap-1.5">
                                            Majorées {totals.overtime > 0 && <AlertTriangle size={14} />}
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {totals.overtime}h
                                        </div>
                                    </motion.div>

                                    <div className={`p-4 rounded-xl border flex flex-col items-center text-center ${totals.night > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                                        <div className="text-sm font-medium opacity-80 mb-1 flex items-center justify-center gap-1.5">
                                            Nuit <Moon size={14} />
                                        </div>
                                        <div className="text-2xl font-bold">{totals.night}h</div>
                                    </div>

                                    <div className={`p-4 rounded-xl border flex flex-col items-center text-center ${totals.weekend > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                                        <div className="text-sm font-medium opacity-80 mb-1">Week-end</div>
                                        <div className="text-2xl font-bold">{totals.weekend}h</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={`${totals.grandTotal > 0 ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' : 'bg-slate-100 text-slate-400'} border-0 flex flex-col items-center justify-center p-6 shadow-md`}>
                            <div className="text-sm font-medium opacity-80 mb-2 uppercase tracking-wide">Total Travaillé</div>
                            <div className="text-6xl font-black tracking-tight">{totals.grandTotal}h</div>
                            {status === 'SUBMITTED' && (
                                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-inner">
                                    <Check size={14} /> En cours de validation
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* Tab: Team Approvals */}
            {isManagerOrAdmin && activeTab === 'approvals' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <Card className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white border-0 shadow-md">
                        <CardHeader className="pb-2 text-sm font-medium text-blue-100">À Valider (GTA)</CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{pendingApprovals.length}</div>
                            <p className="text-blue-200 text-xs mt-1">Feuilles de temps d'équipe en attente (Fin de Période).</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Pointages transmis par l'équipe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Collaborateur</TableHead>
                                        <TableHead>Période couverte</TableHead>
                                        <TableHead>Total Heures Mensuelles</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingApprovals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                Toutes les feuilles de temps sont à jour.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingApprovals.map((req) => (
                                            <TableRow key={req.id}>
                                                <TableCell className="font-medium text-slate-900 flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                        {req.employee.substring(0,2).toUpperCase()}
                                                    </div>
                                                    {req.employee}
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-mono text-sm">{req.period}</TableCell>
                                                <TableCell className="font-bold text-slate-900">{req.totalHours} <span className="text-slate-500 font-normal">h</span></TableCell>
                                                <TableCell>
                                                    <Badge variant={'warning'}>
                                                        {req.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleApproveTeamTimesheet(req.id)}
                                                            className="h-8 border-green-200 bg-white text-green-700 hover:bg-green-50 hover:text-green-800"
                                                        >
                                                            <Check size={14} className="mr-1" /> Valider
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRejectTeamTimesheet(req.id)}
                                                            className="h-8 border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                                                        >
                                                            <X size={14} className="mr-1" /> Rejeter
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

        </div>
    );
}
