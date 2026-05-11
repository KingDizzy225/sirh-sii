import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Check, X, Calendar as CalendarIcon, CheckCircle2, Plus, List, User, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../context/AuthContext';

const locales = {
    'fr': fr,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export function Leaves() {
    const { user } = useAuth();
    const userRole = user?.role || 'EMPLOYEE';
    const isManagerOrAdmin = userRole === 'MANAGER' || userRole === 'ADMIN' || userRole === 'HR';
    const currentUserFullName = user?.name || '';

    const [activeTab, setActiveTab] = useState('my-leaves');
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employeesList, setEmployeesList] = useState([]);
    const [notification, setNotification] = useState(null);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [employeeProfile, setEmployeeProfile] = useState(null);

    const [leaveForm, setLeaveForm] = useState({
        employeeId: user?.id || '',
        type: 'Congé Annuel',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const loadLeaves = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/leaves`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                let parsedLeaves = await res.json();
                parsedLeaves = parsedLeaves.map(l => ({
                    id: l.id,
                    employee: `${l.employee?.firstName || ''} ${l.employee?.lastName || ''}`.trim() || 'Employé',
                    type: l.type,
                    duration: `${new Date(l.startDate).getDate()} ${new Date(l.startDate).toLocaleString('fr-FR', { month: 'short' })} - ${new Date(l.endDate).getDate()} ${new Date(l.endDate).toLocaleString('fr-FR', { month: 'short' })} (${l.durationDays} Jours)`,
                    durationDays: l.durationDays,
                    status: l.status === 'APPROVED' ? 'Approuvé' : l.status === 'REJECTED' ? 'Rejeté' : 'En attente',
                    appliedOn: new Date(l.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
                    rawStart: new Date(l.startDate),
                    rawEnd: new Date(l.endDate)
                }));
                setLeaveRequests(parsedLeaves);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProfile = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/employees/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmployeeProfile(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmployeesList(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLeaves();
        fetchProfile();
        if (isManagerOrAdmin) fetchEmployees();
    }, [userRole, isManagerOrAdmin]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const updateLeaveStatus = async (id, newStatus) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/leaves/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus === 'Approuvé' ? 'APPROVED' : 'REJECTED' })
            });

            if (res.ok) {
                await loadLeaves();
                showNotification(`Demande ${newStatus.toLowerCase()} avec succès.`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleApprove = (id) => updateLeaveStatus(id, 'Approuvé');
    const handleReject = (id) => updateLeaveStatus(id, 'Rejeté');

    const handleExportICS = (leave) => {
        const formatDate = (dateStr) => {
            const d = new Date(dateStr);
            return d.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15) + 'Z';
        };

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(leave.rawStart)}
DTEND:${formatDate(leave.rawEnd)}
SUMMARY:${leave.type} - SIRH
DESCRIPTION:Congé validé via SIRH-SII
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conge_${leave.type.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!leaveForm.startDate || !leaveForm.endDate) {
            showNotification('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
            showNotification('La date de fin ne peut pas être antérieure à la date de début.');
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/leaves`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    employeeId: (isManagerOrAdmin && leaveForm.employeeId) ? leaveForm.employeeId : user?.id,
                    type: leaveForm.type,
                    startDate: leaveForm.startDate,
                    endDate: leaveForm.endDate,
                    reason: leaveForm.reason
                })
            });

            if (res.ok) {
                await loadLeaves();
                setIsLeaveModalOpen(false);
                setLeaveForm({ employeeId: user?.id || '', type: 'Congé Annuel', startDate: '', endDate: '', reason: '' });
                showNotification('Demande de congé soumise avec succès.');
                setActiveTab('my-leaves');
            } else {
                showNotification('Erreur lors de la soumission de la demande.');
            }
        } catch (error) {
            console.error(error);
            showNotification('Erreur réseau. Veuillez réessayer.');
        }
    };

    const myLeaves = leaveRequests.filter(req => req.employee === currentUserFullName);
    const pendingApprovals = leaveRequests.filter(req => req.status === 'En attente' && req.employee !== currentUserFullName);
    const allLeaves = leaveRequests;

    const currentYear = new Date().getFullYear();
    const leavesTakenThisYear = myLeaves
        .filter(req => req.status === 'Approuvé' && req.rawStart.getFullYear() === currentYear)
        .reduce((sum, req) => sum + (req.durationDays || 0), 0);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <CheckCircle2 size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Request Leave Modal Overlay */}
            <AnimatePresence>
                {isLeaveModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Demander un Congé</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsLeaveModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="request-leave-form" onSubmit={handleLeaveSubmit} className="space-y-4">
                                    {isManagerOrAdmin && activeTab === 'approvals' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Soumettre pour l'Employé</label>
                                            <select
                                                value={leaveForm.employeeId}
                                                onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                                                required
                                            >
                                                <option value="" disabled>Sélectionner un employé</option>
                                                {employeesList.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.positionTitle})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Type de Congé</label>
                                        <select
                                            value={leaveForm.type}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="Congé Annuel">Congé Annuel</option>
                                            <option value="Congé Maladie">Congé Maladie</option>
                                            <option value="Congé Maternité">Congé Maternité</option>
                                            <option value="Congé Sans Solde">Congé Sans Solde</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Date de Début</label>
                                            <Input
                                                type="date"
                                                value={leaveForm.startDate}
                                                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Date de Fin</label>
                                            <Input
                                                type="date"
                                                value={leaveForm.endDate}
                                                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Motif (Optionnel)</label>
                                        <textarea
                                            value={leaveForm.reason}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Brève description du motif de congé"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsLeaveModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="request-leave-form" className="bg-blue-600 hover:bg-blue-700 text-white">Soumettre la Demande</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Congés & Absences</h2>
                    <p className="text-slate-500 mt-1">Gérez judicieusement votre temps de repos et celui de votre équipe.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-sm" onClick={() => setIsLeaveModalOpen(true)}>
                        <Plus size={16} /> Demander un Congé
                    </Button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max mb-6">
                <button
                    onClick={() => setActiveTab('my-leaves')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'my-leaves' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <User size={16} /> Mes Absences
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
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <CalendarIcon size={16} /> Calendrier
                </button>
            </div>

            {/* Tab: My Leaves */}
            {activeTab === 'my-leaves' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2 text-sm font-medium text-slate-500">Solde Congés Annuels</CardHeader>
                            <CardContent className="text-3xl font-bold text-slate-900">{employeeProfile?.annualLeaveBalance ?? '--'} <span className="text-xl text-slate-500 font-medium">Jours</span></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 text-sm font-medium text-slate-500">En cours d'examen</CardHeader>
                            <CardContent className="text-3xl font-bold text-amber-600">{myLeaves.filter(req => req.status === 'En attente').length}</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 text-sm font-medium text-slate-500">Posés cette année</CardHeader>
                            <CardContent className="text-3xl font-bold text-emerald-600">{leavesTakenThisYear} <span className="text-xl text-emerald-500 font-medium">Jours</span></CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Historique de mes demandes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type de Congé</TableHead>
                                        <TableHead>Durée</TableHead>
                                        <TableHead>Date de demande</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Agenda</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myLeaves.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium text-slate-900">{req.type}</TableCell>
                                            <TableCell className="text-slate-600">{req.duration}</TableCell>
                                            <TableCell className="text-slate-500">{req.appliedOn}</TableCell>
                                            <TableCell>
                                                <Badge variant={req.status === 'Approuvé' ? 'success' : req.status === 'En attente' ? 'warning' : 'destructive'}>
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {req.status === 'Approuvé' && (
                                                    <Button size="sm" variant="outline" className="h-7 text-xs border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100" onClick={() => handleExportICS(req)}>
                                                        <CalendarIcon size={12} className="mr-1" /> .ics
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {myLeaves.length === 0 && (
                                        <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-500">Aucune demande de congé.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tab: Approvals */}
            {isManagerOrAdmin && activeTab === 'approvals' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-0 shadow-md">
                        <CardHeader className="pb-2 text-sm font-medium text-indigo-100">Actions d'Approbation</CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{pendingApprovals.length}</div>
                            <p className="text-indigo-200 text-xs mt-1">Demandes de congés de votre équipe en attente.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Toutes les demandes de l'équipe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employé</TableHead>
                                        <TableHead>Type de Congé</TableHead>
                                        <TableHead>Durée</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allLeaves.filter(req => req.employee !== currentUserFullName).map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium text-slate-900">{req.employee}</TableCell>
                                            <TableCell className="text-slate-600">{req.type}</TableCell>
                                            <TableCell className="text-slate-600">{req.duration}</TableCell>
                                            <TableCell>
                                                <Badge variant={req.status === 'Approuvé' ? 'success' : req.status === 'En attente' ? 'warning' : 'destructive'}>
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {req.status === 'En attente' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleApprove(req.id)}
                                                            className="h-8 border-green-200 bg-white text-green-700 hover:bg-green-50 hover:text-green-800"
                                                        >
                                                            <Check size={14} className="mr-1" /> Approuver
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReject(req.id)}
                                                            className="h-8 border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                                                        >
                                                            <X size={14} className="mr-1" /> Rejeter
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full inline-block">Déjà Traité</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {allLeaves.filter(req => req.employee !== currentUserFullName).length === 0 && (
                                        <TableRow><TableCell colSpan={5} className="text-center py-6 text-slate-500">Aucune demande d'équipe.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tab: Calendar */}
            {activeTab === 'calendar' && (
                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg">Planning Global</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[600px] mt-4">
                            <Calendar
                                localizer={localizer}
                                events={allLeaves.map(req => {
                                    return {
                                        title: `${req.employee} (${req.type})`,
                                        start: req.rawStart || new Date(),
                                        end: req.rawEnd || new Date(),
                                        status: req.status,
                                        allDay: true,
                                    };
                                })}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: '100%' }}
                                messages={{
                                    next: "Suivant",
                                    previous: "Précédent",
                                    today: "Aujourd'hui",
                                    month: "Mois",
                                    week: "Semaine",
                                    day: "Jour",
                                    agenda: "Agenda"
                                }}
                                culture="fr"
                                eventPropGetter={(event) => {
                                    const backgroundColor = event.status === 'Approuvé' ? '#10b981' : event.status === 'Rejeté' ? '#ef4444' : '#f59e0b';
                                    return { style: { backgroundColor, borderRadius: '4px', border: 'transparent' } };
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
