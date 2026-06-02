import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { cn } from '@/lib/utils';

import { 
    Clock, Plus, Check, Save, Trash2, ChevronLeft, ChevronRight, Moon, 
    AlertTriangle, User, Users, X, Send, Inbox, MessageSquare, Calendar, 
    CreditCard, FileText, QrCode, Download, Eye, CheckCircle2, Upload, Filter, Search,
    Sparkles, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const PROJECTS = [
    { id: 'PRJ-001', name: 'Refonte Site Web', code: 'WEB-REC' },
    { id: 'PRJ-002', name: 'Développement API Mobile', code: 'DEV-API' },
    { id: 'PRJ-003', name: 'Maintenance Serveurs', code: 'OPS-MTN' },
    { id: 'PRJ-004', name: 'Formation Continue', code: 'HR-LRN' },
];

const WEEK_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const getWeekDates = (startDate) => {
    let dates = [];
    for (let i = 0; i < 7; i++) {
        let date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
    }
    return dates;
};

export function Timesheet() {
    const { token, user } = useAuth();
    const userRole = user?.role || 'EMPLOYEE';
    const isRH = userRole === 'HR' || userRole === 'ADMIN' || userRole === 'Administrator';
    const isManager = userRole === 'MANAGER' || userRole === 'Manager';
    const isRHOrManager = isRH || isManager;

    const [activeTab, setActiveTab] = useState('timesheet');
    const [notification, setNotification] = useState(null);

    // Tab 1: Timesheet States
    const [currentDate, setCurrentDate] = useState(() => {
        let d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    });
    const [weekDates, setWeekDates] = useState([]);
    const [timesheetRows, setTimesheetRows] = useState([
        { id: '1', projectId: 'PRJ-001', isNightShift: false, mon: 8, tue: 8, wed: 4, thu: 0, fri: 0, sat: 0, sun: 0 },
        { id: '2', projectId: 'PRJ-002', isNightShift: false, mon: 0, tue: 0, wed: 4, thu: 8, fri: 7, sat: 0, sun: 0 }
    ]);
    const [timesheetStatus, setTimesheetStatus] = useState('DRAFT'); // DRAFT, SUBMITTED, APPROVED
    const [timesheetTotals, setTimesheetTotals] = useState({ standard: 0, overtime: 0, night: 0, weekend: 0, grandTotal: 0 });
    const STANDARD_WEEKLY_HOURS = 35;

    // Team pending approvals (Timesheet)
    const [pendingTimesheets, setPendingTimesheets] = useState([
        { id: '1', employee: 'Alice Dupont', period: '26 Mai - 01 Juin', totalHours: 35, status: 'En attente' },
        { id: '2', employee: 'Bob Martin', period: '26 Mai - 01 Juin', totalHours: 40, status: 'En attente' }
    ]);

    // Tab 2: Absences & Retards States
    const [absences, setAbsences] = useState([]);
    const [myAbsences, setMyAbsences] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [absenceUploadingId, setAbsenceUploadingId] = useState(null);
    const [filterMonth, setFilterMonth] = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [absenceForm, setAbsenceForm] = useState({
        employeeId: '', type: 'Retard', date: '', durationMinutes: '', justification: ''
    });

    // Tab 3: Request Center States
    const [tickets, setTickets] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [advances, setAdvances] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [requestCenterTab, setRequestCenterTab] = useState('tickets');

    // Tab 4: QR Pointage States
    const [qrCodes, setQrCodes] = useState({});
    const [qrSearch, setQrSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const showNotif = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    // Load Data based on roles and tabs
    const fetchEmployeesList = async () => {
        try {
            const { data } = await api.get('/employees');
            if (data) setEmployees(data.employees || data);
        } catch (e) { console.error(e); }
    };

    const fetchAbsences = async () => {
        if (!isRHOrManager) return;
        try {
            const params = new URLSearchParams();
            if (filterMonth) {
                const [year, month] = filterMonth.split('-');
                params.append('year', year);
                params.append('month', month);
            }
            if (filterEmployee) params.append('employeeId', filterEmployee);

            const { data } = await api.get(`/absences?${params}`);
            if (data) setAbsences(data);
        } catch (e) { console.error(e); }
    };

    const fetchMyAbsences = async () => {
        try {
            const { data } = await api.get(`/absences/my`);
            if (data) setMyAbsences(data);
        } catch (e) { console.error(e); }
    };

    const fetchRequestCenterData = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token || localStorage.getItem('sirh_token')}` };
            
            // Support Tickets (Support module)
            const resTickets = await fetch(`${API_URL}/api/support/tickets`, { headers });
            if (resTickets.ok) setTickets(await resTickets.json());

            // Pending leaves
            const resLeaves = await fetch(`${API_URL}/api/leaves`, { headers });
            if (resLeaves.ok) {
                const allLeaves = await resLeaves.json();
                setLeaves(allLeaves.filter(l => l.status === 'PENDING' || l.status === 'PENDING_HR' || l.status === 'EN_ATTENTE'));
            }

            // Pending financial advances
            const resAdvances = await fetch(`${API_URL}/api/advances`, { headers });
            if (resAdvances.ok) setAdvances((await resAdvances.json()).filter(a => a.status === 'PENDING'));

            // Pending expense claims
            const resExpenses = await fetch(`${API_URL}/api/expenses`, { headers });
            if (resExpenses.ok) setExpenses((await resExpenses.json()).filter(e => e.status === 'PENDING'));
        } catch (err) {
            console.error("Fetch request center error:", err);
        }
    };

    // Load initial context
    useEffect(() => {
        setWeekDates(getWeekDates(currentDate));
    }, [currentDate]);

    useEffect(() => {
        if (token) {
            fetchMyAbsences();
            if (isRHOrManager) {
                fetchEmployeesList();
                fetchAbsences();
                fetchRequestCenterData();
            }
        }
    }, [token, activeTab, filterMonth, filterEmployee]);

    // Interval fetcher for Request Center
    useEffect(() => {
        if (!token || !isRHOrManager) return;
        const interval = setInterval(fetchRequestCenterData, 15000);
        return () => clearInterval(interval);
    }, [token, isRHOrManager]);

    // Calculate weekly totals (Timesheet)
    const calculateTimesheetTotals = (currentRows) => {
        let standard = 0;
        let overtime = 0;
        let night = 0;
        let weekend = 0;
        let grandTotal = 0;

        currentRows.forEach(row => {
            const rowTotal = row.mon + row.tue + row.wed + row.thu + row.fri + row.sat + row.sun;
            grandTotal += rowTotal;

            if (row.isNightShift) {
                night += rowTotal;
            }

            weekend += (row.sat + row.sun);
        });

        overtime = grandTotal > STANDARD_WEEKLY_HOURS ? (grandTotal - STANDARD_WEEKLY_HOURS) : 0;
        standard = grandTotal > STANDARD_WEEKLY_HOURS ? STANDARD_WEEKLY_HOURS : grandTotal;

        setTimesheetTotals({ standard, overtime, night, weekend, grandTotal });
    };

    useEffect(() => {
        calculateTimesheetTotals(timesheetRows);
    }, [timesheetRows]);

    // Timesheet action handlers
    const changeWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
        setTimesheetStatus('DRAFT');
    };

    const addTimesheetRow = () => {
        setTimesheetRows([...timesheetRows, {
            id: Date.now().toString(),
            projectId: '',
            isNightShift: false,
            mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0
        }]);
    };

    const removeTimesheetRow = (id) => {
        setTimesheetRows(timesheetRows.filter(r => r.id !== id));
    };

    const updateTimesheetRow = (id, field, value) => {
        if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(field)) {
            let val = parseFloat(value) || 0;
            if (val > 24) val = 24;
            if (val < 0) val = 0;
            setTimesheetRows(timesheetRows.map(r => r.id === id ? { ...r, [field]: val } : r));
        } else {
            setTimesheetRows(timesheetRows.map(r => r.id === id ? { ...r, [field]: value } : r));
        }
    };

    const handleTimesheetSubmit = () => {
        if (timesheetRows.some(r => !r.projectId)) {
            alert("Veuillez sélectionner un projet pour toutes les lignes avant de soumettre.");
            return;
        }
        setTimesheetStatus('SUBMITTED');
        showNotif("Feuille de temps transmise pour approbation.");
    };

    const handleApproveTimesheet = (id) => {
        setPendingTimesheets(prev => prev.filter(t => t.id !== id));
        showNotif("Feuille de temps validée !");
    };

    const handleRejectTimesheet = (id) => {
        setPendingTimesheets(prev => prev.filter(t => t.id !== id));
        showNotif("Feuille de temps rejetée.");
    };

    // Absences action handlers
    const handleCreateAbsence = async (e) => {
        e.preventDefault();
        try {
            const body = {
                ...absenceForm,
                durationMinutes: absenceForm.durationMinutes ? parseInt(absenceForm.durationMinutes) : null
            };
            const { data } = await api.post(`/absences`, body);
            if (data) {
                setAbsences(prev => [data, ...prev]);
                setIsAbsenceModalOpen(false);
                setAbsenceForm({ employeeId: '', type: 'Retard', date: '', durationMinutes: '', justification: '' });
                showNotif('Incidence d\'absence enregistrée.');
                fetchAbsences();
            }
        } catch (err) { console.error(err); }
    };

    const handleAbsenceStatusChange = async (id, status) => {
        try {
            const { data } = await api.put(`/absences/${id}/status`, { status });
            if (data) {
                setAbsences(prev => prev.map(a => a.id === id ? { ...a, status } : a));
                showNotif(`Statut d'absence mis à jour : ${status}`);
            }
        } catch (err) { console.error(err); }
    };

    const handleUploadJustificatif = async (absenceId, file) => {
        if (!file) return;
        setAbsenceUploadingId(absenceId);
        try {
            const formData = new FormData();
            formData.append('justificatif', file);
            const { data } = await api.post(`/absences/${absenceId}/justificatif`, formData);
            if (data) {
                showNotif('Justificatif téléversé avec succès !');
                fetchMyAbsences();
                if (isRHOrManager) fetchAbsences();
            }
        } catch (err) { console.error(err); }
        finally { setAbsenceUploadingId(null); }
    };

    // Request Center action handlers
    const handleRequestAction = async (type, id, action) => {
        try {
            let endpoint = '';
            let status = action === 'approve' ? 'APPROVED' : 'REJECTED';
            
            if (type === 'leave') endpoint = `${API_URL}/api/leaves/${id}/status`;
            if (type === 'advance') endpoint = `${API_URL}/api/advances/${id}/status`;
            if (type === 'expense') endpoint = `${API_URL}/api/expenses/${id}/status`;

            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || localStorage.getItem('sirh_token')}` },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                fetchRequestCenterData();
                showNotif("Demande traitée avec succès.");
            }
        } catch (err) {
            console.error("Action error:", err);
        }
    };

    const handleSendSupportReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !activeTicket) return;

        try {
            const res = await fetch(`${API_URL}/api/support/tickets/${activeTicket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || localStorage.getItem('sirh_token')}` },
                body: JSON.stringify({ body: replyMessage, sender: isRHOrManager ? 'Service RH' : user.name })
            });

            if (res.ok) {
                await fetch(`${API_URL}/api/support/tickets/${activeTicket.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || localStorage.getItem('sirh_token')}` },
                    body: JSON.stringify({ status: isRHOrManager ? 'Répondu' : 'Ouvert' })
                });
                setReplyMessage('');
                fetchRequestCenterData();
                showNotif("Message envoyé au collaborateur.");
                
                // Reload active ticket messages
                const refreshTicket = await fetch(`${API_URL}/api/support/tickets`, {
                    headers: { 'Authorization': `Bearer ${token || localStorage.getItem('sirh_token')}` }
                }).then(r => r.json());
                const updated = refreshTicket.find(t => t.id === activeTicket.id);
                if (updated) setActiveTicket(updated);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // QR Codes action handlers
    const generateQR = async (employeeId) => {
        try {
            const { data } = await api.get(`/qr/generate/${employeeId}`);
            setQrCodes(prev => ({ ...prev, [employeeId]: data.qrCode }));
            showNotif("QR Code généré avec succès !");
        } catch (err) {
            console.error(err);
        }
    };

    const downloadQR = (qrDataUrl, employeeName) => {
        const link = document.createElement('a');
        link.download = `QR_Pointage_${employeeName.replace(/\s+/g, '_')}.png`;
        link.href = qrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredQREmployees = useMemo(() => {
        return employees.filter(e => 
            `${e.firstName} ${e.lastName}`.toLowerCase().includes(qrSearch.toLowerCase()) ||
            e.department?.toLowerCase().includes(qrSearch.toLowerCase())
        );
    }, [employees, qrSearch]);

    // Statistics aggregates
    const absencesStats = {
        total: absences.length,
        retards: absences.filter(a => a.type === 'Retard').length,
        nonJustifies: absences.filter(a => a.status === 'Non justifié').length,
        justifies: absences.filter(a => a.status === 'Justifié').length,
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen flex flex-col h-full relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-emerald-400 border border-emerald-500/20 px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2.5 backdrop-blur-md"
                    >
                        <CheckCircle2 size={16} className="text-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold text-white tracking-wide">{notification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Banner Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Clock className="text-indigo-600 h-9 w-9" />
                        Temps, Absences & Requêtes
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">Portail unique de pilotage du temps de travail, suivi des absences et validation des demandes.</p>
                </div>
            </div>

            {/* TAB SYSTEM */}
            <div className="flex border-b border-slate-200/80 mb-6 gap-1 overflow-x-auto shrink-0 bg-slate-100/50 p-1 rounded-xl">
                {[
                    { id: 'timesheet', label: 'Feuille de Temps', icon: Clock },
                    { id: 'absences', label: 'Absences & Retards', icon: AlertTriangle },
                    { id: 'requests', label: `Centre de Demandes (${tickets.filter(t => t.status === 'Ouvert').length + leaves.length + advances.length + expenses.length})`, icon: Inbox, hidden: !isRHOrManager },
                    { id: 'qr', label: 'Terminaux QR', icon: QrCode, hidden: !isRHOrManager }
                ].map(tab => {
                    if (tab.hidden) return null;
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold tracking-wide uppercase whitespace-nowrap transition-all",
                                isActive 
                                    ? "bg-slate-900 text-white shadow-md" 
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                            )}
                        >
                            <Icon size={18} className={isActive ? "text-indigo-400" : "text-slate-400"} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 min-h-0">
                {/* 1. TIMESHEET TAB */}
                {activeTab === 'timesheet' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex-wrap gap-4">
                            <div className="flex items-center space-x-3 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600" onClick={() => changeWeek(-1)} disabled={timesheetStatus === 'SUBMITTED' || timesheetStatus === 'APPROVED'}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-xs font-bold text-slate-700 w-44 text-center">
                                    {weekDates[0] ? `Semaine du ${weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` : 'Chargement...'}
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600" onClick={() => changeWeek(1)} disabled={timesheetStatus === 'SUBMITTED' || timesheetStatus === 'APPROVED'}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Statut:</span>
                                    <Badge variant={timesheetStatus === 'DRAFT' ? 'secondary' : timesheetStatus === 'SUBMITTED' ? 'warning' : 'success'} className="uppercase text-[10px] font-bold">
                                        {timesheetStatus === 'DRAFT' ? 'Brouillon' : timesheetStatus === 'SUBMITTED' ? 'Soumis' : 'Approuvé'}
                                    </Badge>
                                </div>
                                {timesheetStatus === 'DRAFT' && (
                                    <Button onClick={handleTimesheetSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm rounded-lg text-xs font-bold py-2">
                                        <Save size={14} /> Transmettre
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Weekly input table */}
                        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                        <tr>
                                            <th className="px-5 py-4 font-bold min-w-[240px]">Projet</th>
                                            <th className="px-2 py-4 font-bold text-center w-16">Nuit</th>
                                            {WEEK_DAYS.map((day, idx) => (
                                                <th key={day} className={cn("px-2 py-4 font-bold text-center w-20", idx >= 5 ? 'text-amber-600 bg-amber-50/20' : '')}>
                                                    <div>{day}</div>
                                                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                                                        {weekDates[idx]?.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="px-4 py-4 font-bold text-center w-24 bg-slate-50 border-l border-slate-200">Total</th>
                                            <th className="px-2 py-4 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {timesheetRows.map(row => {
                                            const rowTotal = row.mon + row.tue + row.wed + row.thu + row.fri + row.sat + row.sun;
                                            const isFrozen = timesheetStatus !== 'DRAFT';

                                            return (
                                                <tr key={row.id} className="hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <select
                                                            value={row.projectId}
                                                            onChange={(e) => updateTimesheetRow(row.id, 'projectId', e.target.value)}
                                                            className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                                                            disabled={isFrozen}
                                                        >
                                                            <option value="" disabled>-- Projet --</option>
                                                            {PROJECTS.map(p => (
                                                                <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-2 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={row.isNightShift}
                                                            onChange={(e) => updateTimesheetRow(row.id, 'isNightShift', e.target.checked)}
                                                            disabled={isFrozen}
                                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                                        />
                                                    </td>
                                                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((dayKey, idx) => (
                                                        <td key={dayKey} className={cn("px-2 py-3", idx >= 5 ? 'bg-amber-50/10' : '')}>
                                                            <input
                                                                type="number"
                                                                min="0" max="24" step="0.5"
                                                                value={row[dayKey] || ''}
                                                                onChange={(e) => updateTimesheetRow(row.id, dayKey, e.target.value)}
                                                                disabled={isFrozen}
                                                                className={cn(
                                                                    "w-full h-9 text-center rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-bold",
                                                                    row[dayKey] > 0 
                                                                        ? (row.isNightShift ? 'text-indigo-700 bg-indigo-50 border-indigo-200' : 'text-blue-700 bg-blue-50 border-blue-200') 
                                                                        : ''
                                                                )}
                                                                placeholder="0"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-3 text-center font-bold text-slate-700 bg-slate-50 border-l border-slate-200">
                                                        {rowTotal > 0 ? `${rowTotal}h` : '-'}
                                                    </td>
                                                    <td className="px-2 py-3 text-center">
                                                        <Button variant="ghost" size="icon" onClick={() => removeTimesheetRow(row.id)} disabled={timesheetRows.length === 1 || isFrozen} className="text-slate-300 hover:text-red-500 hover:bg-red-50 h-8 w-8 rounded-lg">
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    {timesheetStatus === 'DRAFT' && (
                                        <tfoot>
                                            <tr>
                                                <td colSpan="11" className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-200">
                                                    <Button variant="outline" onClick={addTimesheetRow} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8 text-[11px] font-bold gap-1.5 shadow-sm rounded-lg">
                                                        <Plus size={14} /> Ajouter une imputation
                                                    </Button>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </Card>

                        {/* Summary & KPI */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <Card className="border-slate-200 lg:col-span-3 bg-white shadow-sm">
                                <CardHeader className="py-4 pb-2">
                                    <CardTitle className="text-base font-bold text-slate-800">Seuils & Variables GTA</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Standard</div>
                                        <div className="text-xl font-black text-slate-800">{timesheetTotals.standard}h <span className="text-xs font-normal text-slate-400">/ 35h</span></div>
                                    </div>
                                    <div className={cn("p-3 rounded-xl border text-center flex flex-col justify-center", timesheetTotals.overtime > 0 ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-slate-50 border-slate-100 text-slate-800")}>
                                        <div className="text-[10px] font-bold uppercase mb-1">Heures Sup</div>
                                        <div className="text-xl font-black">{timesheetTotals.overtime}h</div>
                                    </div>
                                    <div className={cn("p-3 rounded-xl border text-center flex flex-col justify-center", timesheetTotals.night > 0 ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-slate-50 border-slate-100 text-slate-800")}>
                                        <div className="text-[10px] font-bold uppercase mb-1">Nuit</div>
                                        <div className="text-xl font-black">{timesheetTotals.night}h</div>
                                    </div>
                                    <div className={cn("p-3 rounded-xl border text-center flex flex-col justify-center", timesheetTotals.weekend > 0 ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-slate-50 border-slate-100 text-slate-800")}>
                                        <div className="text-[10px] font-bold uppercase mb-1">Weekend</div>
                                        <div className="text-xl font-black">{timesheetTotals.weekend}h</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={cn(
                                "border-0 p-6 flex flex-col items-center justify-center text-center shadow-sm rounded-2xl text-white",
                                timesheetTotals.grandTotal > 0 ? "bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-md" : "bg-slate-100 text-slate-400"
                            )}>
                                <div className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1.5">Cumul Hebdomadaire</div>
                                <div className="text-5xl font-black tracking-tight">{timesheetTotals.grandTotal}h</div>
                                {timesheetStatus === 'SUBMITTED' && (
                                    <div className="mt-4 text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                        En attente RH/Manager
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Pending Approvals (For HR/Manager) */}
                        {isRHOrManager && (
                            <Card className="border-slate-200 bg-white shadow-sm mt-6">
                                <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                                    <CardTitle className="text-base font-bold text-slate-800">Feuilles de Temps en attente de validation</CardTitle>
                                    <CardDescription>Validez les imputations horaires de l'équipe pour la période.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead>Collaborateur</TableHead>
                                                <TableHead>Période</TableHead>
                                                <TableHead>Total Heures</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-xs">
                                            {pendingTimesheets.map(t => (
                                                <TableRow key={t.id}>
                                                    <td className="p-4 font-bold text-slate-900">{t.employee}</td>
                                                    <td className="p-4 text-slate-500 font-semibold">{t.period}</td>
                                                    <td className="p-4 font-bold text-slate-800">{t.totalHours}h</td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" onClick={() => handleApproveTimesheet(t.id)} className="h-7 text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold">Approuver</Button>
                                                            <Button size="sm" onClick={() => handleRejectTimesheet(t.id)} variant="outline" className="h-7 text-[10px] border-rose-200 text-rose-700 hover:bg-rose-50 font-bold">Rejeter</Button>
                                                        </div>
                                                    </td>
                                                </TableRow>
                                            ))}
                                            {pendingTimesheets.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-6 text-slate-400 font-medium">
                                                        Toutes les feuilles de temps de l'équipe sont approuvées.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* 2. ABSENCES & RETARDS TAB */}
                {activeTab === 'absences' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Summary for HR */}
                        {isRHOrManager && (
                            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                                {[
                                    { label: 'Total Incidents', value: absencesStats.total, icon: AlertTriangle, color: 'text-slate-600', bg: 'bg-slate-100' },
                                    { label: 'Retards', value: absencesStats.retards, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
                                    { label: 'Non Justifiés', value: absencesStats.nonJustifies, icon: X, color: 'text-rose-600', bg: 'bg-rose-100' },
                                    { label: 'Justifiés', value: absencesStats.justifies, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                                ].map(stat => (
                                    <Card key={stat.label} className="border-slate-100 shadow-sm bg-white">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                                <stat.icon size={20} className={stat.color} />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                                                <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex-wrap">
                            <div className="flex gap-3">
                                {isRHOrManager && (
                                    <>
                                        <Input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-44 text-xs font-bold" />
                                        <select
                                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold bg-white"
                                            value={filterEmployee}
                                            onChange={e => setFilterEmployee(e.target.value)}
                                        >
                                            <option value="">Tous les employés</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                            ))}
                                        </select>
                                        <Button variant="outline" size="sm" onClick={fetchAbsences} className="text-xs font-bold">Filtrer</Button>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                {isRHOrManager && (
                                    <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 text-xs font-bold py-2 rounded-lg" onClick={() => setIsAbsenceModalOpen(true)}>
                                        <Plus size={14} /> Déclarer Incident
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Employees and Self Absences Lists */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Individual History (Visible to all) */}
                            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                                <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                                    <CardTitle className="text-base font-bold text-slate-800">Mon Registre Personnel d'Absences</CardTitle>
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
                                        <TableBody className="text-xs">
                                            {myAbsences.map(abs => (
                                                <TableRow key={abs.id}>
                                                    <td className="p-4 font-bold text-slate-800 flex items-center gap-1.5">
                                                        {TYPE_ICONS[abs.type] || '📋'} {abs.type}
                                                    </td>
                                                    <td className="p-4 text-slate-600 font-semibold">{new Date(abs.date).toLocaleDateString('fr-FR')}</td>
                                                    <td className="p-4 text-slate-500 font-semibold">{abs.durationMinutes ? `${abs.durationMinutes} min` : 'Journée'}</td>
                                                    <td className="p-4">
                                                        <Badge variant={STATUS_CONFIG[abs.status]?.color || 'secondary'} className="text-[10px] font-bold">
                                                            {STATUS_CONFIG[abs.status]?.icon} {abs.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {abs.justificatifPath ? (
                                                            <a href={`${API_URL}${abs.justificatifPath}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold flex items-center justify-end gap-1">
                                                                <FileText size={14} /> Voir
                                                            </a>
                                                        ) : (
                                                            abs.status === 'Non justifié' || abs.status === 'En attente de validation' ? (
                                                                <label className="cursor-pointer flex items-center justify-end gap-1 text-indigo-600 hover:text-indigo-700 font-bold">
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                                        onChange={e => handleUploadJustificatif(abs.id, e.target.files[0])}
                                                                    />
                                                                    {absenceUploadingId === abs.id ? (
                                                                        <span className="animate-spin border-2 border-indigo-600 border-t-transparent rounded-full w-4 h-4" />
                                                                    ) : (
                                                                        <><Upload size={14} /> Téléverser</>
                                                                    )}
                                                                </label>
                                                            ) : <span className="text-slate-400 font-medium">Non requis</span>
                                                        )}
                                                    </td>
                                                </TableRow>
                                            ))}
                                            {myAbsences.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                                                        <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-50" />
                                                        Zéro retard ou absence non justifiée. Assiduité irréprochable !
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Global HR vue */}
                            {isRHOrManager && (
                                <Card className="border-slate-200 bg-white shadow-sm overflow-hidden mt-2">
                                    <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                                        <CardTitle className="text-base font-bold text-slate-800">Registre Global de l'Équipe (RH)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Collaborateur</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Durée</TableHead>
                                                    <TableHead>Justificatif</TableHead>
                                                    <TableHead>Statut</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="text-xs">
                                                {absences.map(abs => (
                                                    <TableRow key={abs.id}>
                                                        <td className="p-4 font-bold text-slate-900">
                                                            {abs.employee?.firstName} {abs.employee?.lastName}
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{abs.employee?.department}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="flex items-center gap-1">
                                                                {TYPE_ICONS[abs.type] || '📋'} {abs.type}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-slate-600 font-semibold">{new Date(abs.date).toLocaleDateString('fr-FR')}</td>
                                                        <td className="p-4 text-slate-500 font-semibold">{abs.durationMinutes ? `${abs.durationMinutes} min` : '—'}</td>
                                                        <td className="p-4">
                                                            {abs.justificatifPath ? (
                                                                <a href={`${API_URL}${abs.justificatifPath}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold flex items-center gap-1">
                                                                    <FileText size={14} /> Voir
                                                                </a>
                                                            ) : <span className="text-slate-400">Non fourni</span>}
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge variant={STATUS_CONFIG[abs.status]?.color || 'secondary'} className="text-[10px] font-bold">
                                                                {STATUS_CONFIG[abs.status]?.icon} {abs.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <Button size="sm" variant="outline" className="h-7 text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold" onClick={() => handleAbsenceStatusChange(abs.id, 'Justifié')}>
                                                                    Valider
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-7 text-[10px] border-rose-200 text-rose-700 hover:bg-rose-50 font-bold" onClick={() => handleAbsenceStatusChange(abs.id, 'Contesté')}>
                                                                    Contester
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </TableRow>
                                                ))}
                                                {absences.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-6 text-slate-400 font-medium">
                                                            Aucun incident déclaré sur la période sélectionnée.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. REQUEST CENTER TAB (SUPPORT & APPROVALS) */}
                {isRHOrManager && activeTab === 'requests' && (
                    <div className="space-y-6">
                        <div className="flex bg-slate-100 p-1 rounded-lg w-max shrink-0 gap-1">
                            {[
                                { id: 'tickets', label: `Tickets Support (${tickets.filter(t => t.status === 'Ouvert').length})`, icon: MessageSquare },
                                { id: 'leaves', label: `Congés (${leaves.length})`, icon: Calendar },
                                { id: 'finance', label: `Financier (${advances.length + expenses.length})`, icon: CreditCard }
                            ].map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => setRequestCenterTab(sub.id)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap",
                                        requestCenterTab === sub.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    <sub.icon size={13} className="inline mr-1" />
                                    {sub.label}
                                </button>
                            ))}
                        </div>

                        {/* Request Sub-Tab 1: Tickets Support */}
                        {requestCenterTab === 'tickets' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Ticket list sidebar */}
                                <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                    {tickets.map(t => (
                                        <div 
                                            key={t.id}
                                            onClick={() => setActiveTicket(t)}
                                            className={cn(
                                                "p-4 rounded-xl border cursor-pointer transition-all bg-white",
                                                activeTicket?.id === t.id 
                                                    ? "border-indigo-500 shadow-sm ring-2 ring-indigo-50" 
                                                    : "border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="text-[9px] uppercase font-bold">{t.category}</Badge>
                                                <span className="text-[9px] text-slate-400 font-bold">{new Date(t.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{t.title}</h4>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-1 line-clamp-2">{t.description}</p>
                                            <div className="flex items-center gap-1.5 mt-3 text-[9px] text-indigo-600 font-bold uppercase tracking-wider">
                                                {t.status} <ArrowRight size={10} />
                                            </div>
                                        </div>
                                    ))}
                                    {tickets.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-white">
                                            Aucun ticket ouvert actuellement.
                                        </div>
                                    )}
                                </div>

                                {/* Active Support Chat */}
                                <div className="lg:col-span-2">
                                    {activeTicket ? (
                                        <Card className="h-full flex flex-col border-slate-200 shadow-sm overflow-hidden bg-white min-h-[380px]">
                                            <CardHeader className="py-4 border-b bg-white">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <CardTitle className="text-sm font-bold text-slate-800">{activeTicket.title}</CardTitle>
                                                        <CardDescription className="text-[10px] font-bold uppercase tracking-wide">Réf: {activeTicket.id.split('-')[0]}</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20 max-h-[320px]">
                                                {activeTicket.messages?.map(m => (
                                                    <div 
                                                        key={m.id} 
                                                        className={cn(
                                                            "max-w-[75%] p-3 rounded-2xl text-xs shadow-sm", 
                                                            m.sender.includes('RH') || m.sender.includes('Service')
                                                                ? "ml-auto bg-indigo-600 text-white" 
                                                                : "mr-auto bg-white border border-slate-100 text-slate-800"
                                                        )}
                                                    >
                                                        <div className="font-bold text-[9px] mb-1 opacity-70 uppercase tracking-wider">{m.sender}</div>
                                                        <div className="font-semibold">{m.body}</div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                            <div className="p-4 bg-white border-t border-slate-100 mt-auto">
                                                <form onSubmit={handleSendSupportReply} className="flex gap-2">
                                                    <Input 
                                                        value={replyMessage} 
                                                        onChange={e => setReplyMessage(e.target.value)} 
                                                        placeholder="Saisir votre réponse..." 
                                                        className="text-xs bg-slate-50 border-slate-200"
                                                    />
                                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4">
                                                        <Send size={14} />
                                                    </Button>
                                                </form>
                                            </div>
                                        </Card>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 p-16 text-center min-h-[320px]">
                                            <MessageSquare size={36} className="mb-3 opacity-25" />
                                            <p className="text-xs font-bold">Sélectionnez une demande dans la liste pour démarrer la messagerie de support.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Request Sub-Tab 2: Congés en attente */}
                        {requestCenterTab === 'leaves' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {leaves.map(l => (
                                    <Card key={l.id} className="overflow-hidden border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-indigo-500 h-1" />
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                                    {l.employee?.firstName?.[0]}{l.employee?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xs text-slate-800">{l.employee?.firstName} {l.employee?.lastName}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase">{l.type}</div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2">
                                            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 mb-4">
                                                <div className="flex justify-between font-semibold">
                                                    <span className="text-slate-400 uppercase text-[9px] font-bold">Période</span>
                                                    <span className="text-slate-700">{new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between font-semibold">
                                                    <span className="text-slate-400 uppercase text-[9px] font-bold">Durée</span>
                                                    <span className="text-indigo-600">{l.durationDays} jours</span>
                                                </div>
                                                {l.reason && (
                                                    <div className="text-[10px] text-slate-500 italic mt-2 border-t pt-1 border-slate-200">
                                                        "{l.reason}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleRequestAction('leave', l.id, 'approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-8 rounded-lg">Valider</Button>
                                                <Button onClick={() => handleRequestAction('leave', l.id, 'reject')} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold h-8 rounded-lg">Refuser</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {leaves.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-slate-400 text-xs font-bold bg-white rounded-xl border border-dashed">
                                        Aucune demande de congé en attente de validation.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Request Sub-Tab 3: Financier (Avances + Notes de Frais) */}
                        {requestCenterTab === 'finance' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Salary advances pending */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <CreditCard size={15} /> Acomptes & Avances ({advances.length})
                                    </h3>
                                    {advances.map(a => (
                                        <Card key={a.id} className="p-4 border-slate-200 bg-white shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="font-bold text-slate-800 text-xs">{a.employee?.firstName} {a.employee?.lastName}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{a.employee?.department}</div>
                                                    <div className="text-xs font-black text-indigo-600 mt-2">Montant demandé : {a.amount.toLocaleString()} FCFA</div>
                                                </div>
                                                <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold uppercase">{a.type}</Badge>
                                            </div>
                                            {a.reason && <p className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg mb-4 italic">"{a.reason}"</p>}
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleRequestAction('advance', a.id, 'approve')} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-8 rounded-lg">Valider</Button>
                                                <Button onClick={() => handleRequestAction('advance', a.id, 'reject')} size="sm" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold h-8 rounded-lg">Refuser</Button>
                                            </div>
                                        </Card>
                                    ))}
                                    {advances.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed font-bold">
                                            Aucune demande d'acompte en attente.
                                        </div>
                                    )}
                                </div>

                                {/* Expense claims pending */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <FileText size={15} /> Notes de Frais ({expenses.length})
                                    </h3>
                                    {expenses.map(e => (
                                        <Card key={e.id} className="p-4 border-slate-200 bg-white shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="font-bold text-slate-800 text-xs">{e.employee?.firstName} {e.employee?.lastName}</div>
                                                    <div className="text-xs text-slate-500 font-semibold mt-1">{e.title}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-indigo-600 text-xs">{e.amount.toLocaleString()} FCFA</div>
                                                    <Badge className="bg-teal-50 text-teal-700 border border-teal-100 text-[9px] font-bold uppercase mt-1">{e.category}</Badge>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleRequestAction('expense', e.id, 'approve')} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-8 rounded-lg">Valider</Button>
                                                <Button onClick={() => handleRequestAction('expense', e.id, 'reject')} size="sm" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold h-8 rounded-lg">Refuser</Button>
                                            </div>
                                        </Card>
                                    ))}
                                    {expenses.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed font-bold">
                                            Aucune note de frais en attente.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. QR POINTAGE GENERATOR TAB */}
                {isRHOrManager && activeTab === 'qr' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm gap-4 flex-wrap">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Bornes de Pointage & Badgeuses Virtuelles</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Générez des QR Codes individuels pour le pointage mobile ou physique.</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un collaborateur..."
                                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56 text-xs font-bold"
                                    value={qrSearch}
                                    onChange={(e) => setQrSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredQREmployees.map(emp => (
                                <Card key={emp.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white group overflow-hidden flex flex-col justify-between">
                                    <div className="h-1 bg-indigo-500" />
                                    <CardContent className="p-5 flex flex-col items-center flex-1 justify-between min-h-[220px]">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm mb-3">
                                                {emp.firstName[0]}{emp.lastName[0]}
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-xs text-center">{emp.firstName} {emp.lastName}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{emp.department}</p>
                                        </div>

                                        <div className="mt-4 w-full">
                                            {qrCodes[emp.id] ? (
                                                <div className="flex flex-col items-center">
                                                    <img src={qrCodes[emp.id]} alt={`QR Code ${emp.firstName}`} className="w-32 h-32 rounded-lg shadow-sm border border-slate-100 mb-3" />
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="w-full gap-1.5 hover:bg-indigo-50 text-[10px] font-bold h-8 rounded-lg"
                                                        onClick={() => downloadQR(qrCodes[emp.id], `${emp.firstName} ${emp.lastName}`)}
                                                    >
                                                        <Download size={13} /> Télécharger
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button 
                                                    className="w-full gap-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold h-8 rounded-lg"
                                                    onClick={() => generateQR(emp.id)}
                                                >
                                                    <QrCode size={13} /> Générer QR Code
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {!isLoading && filteredQREmployees.length === 0 && (
                            <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
                                <p className="text-slate-400 text-xs font-bold">Aucun collaborateur trouvé.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: Register Absence / Delay */}
            <AnimatePresence>
                {isAbsenceModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
                        >
                            <div className="px-6 py-4 border-b bg-gradient-to-r from-slate-900 to-indigo-950 flex justify-between items-center">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Déclarer un incident d'absence</h3>
                                <button onClick={() => setIsAbsenceModalOpen(false)} className="text-white hover:text-slate-200 bg-transparent border-0 cursor-pointer"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleCreateAbsence} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Employé *</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold bg-white outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={absenceForm.employeeId}
                                        onChange={e => setAbsenceForm(f => ({ ...f, employeeId: e.target.value }))}
                                        required
                                    >
                                        <option value="">Sélectionner un collaborateur...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Type *</label>
                                        <select
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold bg-white outline-none"
                                            value={absenceForm.type}
                                            onChange={e => setAbsenceForm(f => ({ ...f, type: e.target.value }))}
                                        >
                                            <option>Retard</option>
                                            <option>Absence non justifiée</option>
                                            <option>Absence justifiée</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Date *</label>
                                        <Input type="date" value={absenceForm.date} onChange={e => setAbsenceForm(f => ({ ...f, date: e.target.value }))} required className="text-xs bg-white border-slate-200" />
                                    </div>
                                </div>
                                {absenceForm.type === 'Retard' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Durée du retard (minutes)</label>
                                        <Input type="number" min="1" placeholder="ex: 30" value={absenceForm.durationMinutes} onChange={e => setAbsenceForm(f => ({ ...f, durationMinutes: e.target.value }))} className="text-xs bg-white border-slate-200" />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Note (Optionnel)</label>
                                    <textarea
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold min-h-[60px] resize-none bg-slate-50"
                                        placeholder="Commentaires ou notes complémentaires..."
                                        value={absenceForm.justification}
                                        onChange={e => setAbsenceForm(f => ({ ...f, justification: e.target.value }))}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAbsenceModalOpen(false)} className="text-xs font-bold">Annuler</Button>
                                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">Confirmer</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
