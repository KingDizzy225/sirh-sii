import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Check, X, Calendar as CalendarIcon, CheckCircle2, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';

const initialLeaveRequests = [
    { id: 'LR-1021', employee: 'Amanda Smith', type: 'Congé Annuel', duration: '12 Oct - 15 Oct (4 Jours)', status: 'En attente', appliedOn: '01 Oct 2026' },
    { id: 'LR-1022', employee: 'John Doe', type: 'Congé Maladie', duration: '05 Oct (1 Jour)', status: 'Approuvé', appliedOn: '04 Oct 2026' },
    { id: 'LR-1023', employee: 'Sarah Jenkins', type: 'Congé Maternité', duration: '01 Nov - 31 Jan (90 Jours)', status: 'Approuvé', appliedOn: '15 Sep 2026' },
    { id: 'LR-1024', employee: 'Michael Dam', type: 'Congé Sans Solde', duration: '20 Oct - 22 Oct (3 Jours)', status: 'Rejeté', appliedOn: '03 Oct 2026' },
];

export function Leaves() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employeesList, setEmployeesList] = useState([]);
    const [notification, setNotification] = useState(null);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [leaveForm, setLeaveForm] = useState({
        employeeId: '',
        type: 'Congé Annuel',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchLeaves = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/leaves`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                // Formatting for display
                const mapped = data.map(leave => {
                    const sDate = new Date(leave.startDate);
                    const eDate = new Date(leave.endDate);
                    const diffDays = Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) + 1;
                    const shortMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

                    return {
                        id: leave.id,
                        employee: leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'Employé Inconnu',
                        type: leave.type,
                        duration: `${sDate.getDate()} ${shortMonths[sDate.getMonth()]} - ${eDate.getDate()} ${shortMonths[eDate.getMonth()]} (${diffDays} Jours)`,
                        status: leave.status === 'APPROVED' ? 'Approuvé' : leave.status === 'REJECTED' ? 'Rejeté' : 'En attente',
                        appliedOn: new Date(leave.createdAt).toLocaleDateString('fr-FR')
                    };
                });
                setLeaveRequests(mapped);
            }
        } catch (error) {
            console.error('Failed to fetch real leaves', error);
            setLeaveRequests(initialLeaveRequests); // Fallback mock
        }
    };

    const fetchEmployees = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setEmployeesList(data);
        } catch (error) {
            console.error('Failed to fetch employees for leave form');
        }
    };

    useEffect(() => {
        Promise.all([fetchLeaves(), fetchEmployees()]).finally(() => setIsLoading(false));
    }, []);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('sirh_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await fetch(`${API_URL}/api/leaves/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'APPROVED' })
            });
            setLeaveRequests(prev => prev.map(req =>
                req.id === id ? { ...req, status: 'Approuvé' } : req
            ));
            showNotification(`Demande approuvée avec succès sur la Base de Données.`);
        } catch (e) { showNotification("Erreur lors de l'approbation."); }
    };

    const handleReject = async (id) => {
        try {
            const token = localStorage.getItem('sirh_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await fetch(`${API_URL}/api/leaves/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'REJECTED' })
            });
            setLeaveRequests(prev => prev.map(req =>
                req.id === id ? { ...req, status: 'Rejeté' } : req
            ));
            showNotification(`Demande rejetée avec succès sur la Base de Données.`);
        } catch (e) { showNotification("Erreur lors du rejet."); }
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!leaveForm.employeeId || !leaveForm.startDate || !leaveForm.endDate) {
            showNotification('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/leaves`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    employeeId: leaveForm.employeeId,
                    type: leaveForm.type,
                    startDate: leaveForm.startDate,
                    endDate: leaveForm.endDate,
                    reason: leaveForm.reason
                })
            });

            if (res.ok) {
                await fetchLeaves(); // Refresh true data
                setIsLeaveModalOpen(false);
                setLeaveForm({ employeeId: '', type: 'Congé Annuel', startDate: '', endDate: '', reason: '' });
                showNotification('Demande de congé enregistrée dans PostgreSQL avec succès.');
            } else {
                showNotification("Erreur API lors de la création.");
            }
        } catch (error) {
            console.error(error);
            showNotification("Erreur serveur.");
        }
    };

    const pendingCount = leaveRequests.filter(req => req.status === 'En attente').length;

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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Employé</label>
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
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Congés & Présences</h2>
                    <p className="text-slate-500 mt-1">Examinez les demandes de congés et suivez les présences de l'entreprise.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" className="gap-2 text-slate-700 bg-white" onClick={() => showNotification("Chargement de l'intégration calendrier...")}>
                        <CalendarIcon size={16} /> Calendrier
                    </Button>
                    <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700" onClick={() => setIsLeaveModalOpen(true)}>
                        <Plus size={16} /> Demander un Congé
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6 mt-6">
                <Card>
                    <CardHeader className="pb-2 text-sm font-medium text-slate-500">Demandes en attente</CardHeader>
                    <CardContent className="text-3xl font-bold text-amber-600">{pendingCount}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 text-sm font-medium text-slate-500">Approuvées ce mois-ci</CardHeader>
                    <CardContent className="text-3xl font-bold text-slate-900">45</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 text-sm font-medium text-slate-500">Total Jours Disponibles</CardHeader>
                    <CardContent className="text-3xl font-bold text-slate-900">1,240</CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Demandes de Congé Récentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employé</TableHead>
                                <TableHead>Type de Congé</TableHead>
                                <TableHead>Durée</TableHead>
                                <TableHead>Date de demande</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium text-slate-900">{req.employee}</TableCell>
                                    <TableCell className="text-slate-600">{req.type}</TableCell>
                                    <TableCell className="text-slate-600">{req.duration}</TableCell>
                                    <TableCell className="text-slate-500">{req.appliedOn}</TableCell>
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
                                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full inline-block">Traité</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
