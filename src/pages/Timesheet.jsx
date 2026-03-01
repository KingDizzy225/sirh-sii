import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, Save, Clock, Trash2, ChevronLeft, ChevronRight, Moon, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

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

    useEffect(() => {
        setWeekDates(getWeekDates(currentDate));
    }, [currentDate]);

    useEffect(() => {
        calculateTotals(rows);
    }, [rows]);

    const changeWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
        // Reset or fetch existing data for the new week
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
            // Ensure valid number, max 24
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

            // Sat + Sun are weekend days
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
        // Validate
        const hasEmptyProjects = rows.some(r => !r.projectId);
        if (hasEmptyProjects) {
            alert("Veuillez sélectionner un projet pour toutes les lignes avant de soumettre.");
            return;
        }

        setStatus('SUBMITTED');
        // Dans un vrai système, on ferait un appel API POST au backend ici
    };

    const formatDateHeader = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Clock className="text-blue-600 h-8 w-8" />
                        Feuilles de Temps (GTA)
                    </h2>
                    <p className="text-slate-500 mt-1">Saisissez vos heures de la semaine par projet ou nature d'activité.</p>
                </div>

                <div className="flex items-center space-x-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)} disabled={status === 'SUBMITTED' || status === 'APPROVED'}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-semibold text-slate-700 w-48 text-center">
                        {weekDates[0] ? `Semaine du ${weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : 'Chargement...'}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => changeWeek(1)} disabled={status === 'SUBMITTED' || status === 'APPROVED'}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="font-semibold text-slate-700">Statut :</div>
                    <Badge variant={status === 'DRAFT' ? 'secondary' : status === 'SUBMITTED' ? 'warning' : 'success'} className="uppercase">
                        {status === 'DRAFT' ? 'Brouillon' : status === 'SUBMITTED' ? 'Soumis (En attente)' : 'Approuvé'}
                    </Badge>
                </div>
                {status === 'DRAFT' && (
                    <Button onClick={handleSubmit} className="bg-blue-600 text-white gap-2">
                        <Save size={16} /> Soumettre pour Approbation
                    </Button>
                )}
            </div>

            {/* MAIN GRID */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100/50 text-slate-700 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 font-semibold min-w-[200px]">Projet / Code d'imputation</th>
                                <th className="px-2 py-3 font-semibold text-center w-16" title="Travail de Nuit">Nuit</th>
                                {WEEK_DAYS.map((day, idx) => (
                                    <th key={day} className={`px-2 py-3 font-semibold text-center w-20 ${idx >= 5 ? 'text-amber-600 bg-amber-50/30' : ''}`}>
                                        <div>{day}</div>
                                        <div className="text-xs font-normal text-slate-500">{formatDateHeader(weekDates[idx])}</div>
                                    </th>
                                ))}
                                <th className="px-4 py-3 font-semibold text-center w-24 border-l border-slate-200 bg-slate-50">Total</th>
                                <th className="px-2 py-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((row) => {
                                const rowTotal = row.mon + row.tue + row.wed + row.thu + row.fri + row.sat + row.sun;
                                const isFrozen = status !== 'DRAFT';

                                return (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <select
                                                value={row.projectId}
                                                onChange={(e) => updateRow(row.id, 'projectId', e.target.value)}
                                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                                                disabled={isFrozen}
                                            >
                                                <option value="" disabled>-- Sélectionner un projet --</option>
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
                                            <td key={dayKey} className={`px-2 py-3 ${idx >= 5 ? 'bg-amber-50/10' : ''}`}>
                                                <input
                                                    type="number"
                                                    min="0" max="24" step="0.5"
                                                    value={row[dayKey] || ''}
                                                    onChange={(e) => updateRow(row.id, dayKey, e.target.value)}
                                                    disabled={isFrozen}
                                                    className={`w-full h-9 text-center rounded-md border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-blue-500 transition-colors ${row[dayKey] > 0 ? (row.isNightShift ? 'font-bold text-indigo-700 bg-indigo-50 border-indigo-200' : 'font-bold text-blue-700 bg-blue-50 border-blue-200') : ''} disabled:bg-slate-50 disabled:text-slate-500`}
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
                                    <td colSpan="11" className="px-4 py-3 bg-white">
                                        <Button variant="ghost" onClick={addRow} className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 h-8 text-sm gap-1.5 font-medium">
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
                        <CardTitle className="text-lg">Récapitulatif & Majorations</CardTitle>
                        <CardDescription>Les variables de paie sont calculées automatiquement en fin de semaine.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                            <div>
                                <div className="text-sm font-medium text-slate-500 mb-1">Total Hebdo (Standard)</div>
                                <div className="text-2xl font-bold text-slate-900">{totals.standard}h <span className="text-sm font-normal text-slate-400">/ {STANDARD_WEEKLY_HOURS}h</span></div>
                            </div>

                            <motion.div
                                animate={totals.overtime > 0 ? { scale: [1, 1.05, 1], color: ['#64748b', '#dc2626', '#b91c1c'] } : {}}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                                    Heures Supplémentaires {totals.overtime > 0 && <AlertTriangle size={14} className="text-rose-500" />}
                                </div>
                                <div className={`text-2xl font-bold ${totals.overtime > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {totals.overtime}h
                                </div>
                                {totals.overtime > 0 && <div className="text-xs font-medium text-rose-500 mt-0.5">Majoration ~25%</div>}
                            </motion.div>

                            <div>
                                <div className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                                    Travail de Nuit <Moon size={14} className="text-indigo-400" />
                                </div>
                                <div className={`text-2xl font-bold ${totals.night > 0 ? 'text-indigo-600' : 'text-slate-900'}`}>{totals.night}h</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-slate-500 mb-1">Week-end (Sam/Dim)</div>
                                <div className={`text-2xl font-bold ${totals.weekend > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{totals.weekend}h</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`${totals.grandTotal > 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'} border-0 flex flex-col items-center justify-center p-6 transition-colors`}>
                    <div className="text-sm font-medium opacity-80 mb-2 uppercase tracking-wide">Grand Total</div>
                    <div className="text-5xl font-bold">{totals.grandTotal}h</div>
                    {status === 'SUBMITTED' && (
                        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                            <Check size={14} /> Transmis à la Paie
                        </div>
                    )}
                </Card>
            </div>

        </div>
    );
}
