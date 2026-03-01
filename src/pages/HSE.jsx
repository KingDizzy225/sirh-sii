import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { HeartPulse, Plus, Search, AlertTriangle, CheckCircle2, FileText, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data pour les visites médicales
const initialCheckups = [
    { id: 'CHK-001', employee: 'Sarah Jenkins', type: 'Embauche', doctor: 'Dr. Martin', date: '2026-03-15', status: 'Prévue', nextDue: '2028-03-15', fitness: 'En attente' },
    { id: 'CHK-002', employee: 'Michael Dam', type: 'Périodique', doctor: 'Dr. Martin', date: '2024-03-01', status: 'Effectuée', nextDue: '2026-03-01', fitness: 'Aptitude Totale' }, // < 30 jours
    { id: 'CHK-003', employee: 'John Doe', type: 'Reprise', doctor: 'Dr. Dubois', date: '2025-11-10', status: 'Effectuée', nextDue: '2026-11-10', fitness: 'Aptitude avec restrictions' },
    { id: 'CHK-004', employee: 'Lisa Ray', type: 'Périodique', doctor: 'Dr. Martin', date: '2024-02-15', status: 'Effectuée', nextDue: '2026-02-15', fitness: 'Aptitude Totale' } // Dépassement
];

// Mock Data pour les incidents (Accidents du travail)
const initialIncidents = [
    { id: 'INC-2026-001', date: '2026-01-14', location: 'Entrepôt A', type: 'Accident du travail', severity: 'Majeur', employee: 'Robert Fox', status: 'Déclaré CNPS' },
    { id: 'INC-2026-002', date: '2026-02-22', location: 'Open Space 2', type: 'Presque-accident', severity: 'Mineur', employee: 'Amanda Smith', status: 'Clos' }
];

export function HSE() {
    const [activeTab, setActiveTab] = useState('checkups');
    const [checkups, setCheckups] = useState(initialCheckups);
    const [incidents, setIncidents] = useState(initialIncidents);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Helper pour déterminer le statut d'une visite médicale
    const getCheckupStatusBadge = (nextDueDateStr, status) => {
        if (status === 'Prévue') return <Badge variant="outline" className="text-blue-600 bg-blue-50">Prévue</Badge>;

        const nextDue = new Date(nextDueDateStr);
        const today = new Date();
        const diffTime = nextDue - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return <Badge variant="destructive" className="flex gap-1 items-center"><AlertTriangle size={12} /> Dépassée</Badge>;
        if (diffDays <= 30) return <Badge variant="warning" className="flex gap-1 items-center text-amber-700 bg-amber-100"><AlertTriangle size={12} /> Échéance proche ({diffDays}j)</Badge>;

        return <Badge variant="success">À jour</Badge>;
    };

    const handleIncidentSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newIncident = {
            id: `INC-2026-00${incidents.length + 1}`,
            date: formData.get('date'),
            location: formData.get('location'),
            type: formData.get('type'),
            severity: formData.get('severity'),
            employee: formData.get('employee'),
            status: 'Enquête en cours'
        };

        setIncidents([newIncident, ...incidents]);
        setIsIncidentModalOpen(false);
        showNotification("Incident consigné dans le registre et notifié au service HSE.");
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">

            {/* Notification Toast */}
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

            {/* Modal Déclaration d'Incident */}
            <AnimatePresence>
                {isIncidentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <AlertTriangle className="text-red-500" size={20} />
                                    Déclarer un Incident HSE
                                </h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsIncidentModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>
                            <div className="p-6">
                                <form id="incident-form" onSubmit={handleIncidentSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Date de l'incident</label>
                                            <Input name="date" type="date" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Type</label>
                                            <select name="type" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950">
                                                <option value="Accident du travail">Accident du travail (AT)</option>
                                                <option value="Accident de trajet">Accident de trajet</option>
                                                <option value="Presque-accident">Presque-accident (Near-miss)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Employé Impliqué</label>
                                        <Input name="employee" placeholder="Ex: John Doe" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Lieu exact</label>
                                            <Input name="location" placeholder="Ex: Entrepôt B, Allée 3" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Gravité</label>
                                            <select name="severity" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950">
                                                <option value="Mineur">Mineur (Sans arrêt)</option>
                                                <option value="Majeur">Majeur (Avec arrêt)</option>
                                                <option value="Critique">Critique (Urgence)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Description des faits</label>
                                        <textarea name="description" className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" placeholder="Circonstances, causes immédiates..."></textarea>
                                    </div>
                                </form>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsIncidentModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="incident-form" className="bg-red-600 hover:bg-red-700 text-white">Consigner l'Incident</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <HeartPulse className="text-emerald-600" />
                        Santé & Sécurité (HSE)
                    </h2>
                    <p className="text-slate-500 mt-1">Registre des visites médicales et déclarations d'accidents (Conformité CNPS).</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" className="gap-2 text-slate-600" onClick={() => showNotification("Génération du rapport légal CNPS en cours...")}>
                        <FileText size={16} /> Rapport Légal CNPS
                    </Button>
                    <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsIncidentModalOpen(true)}>
                        <AlertTriangle size={16} /> Déclarer Incident
                    </Button>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex space-x-1 rounded-xl bg-slate-200/50 p-1 w-fit">
                <button
                    onClick={() => setActiveTab('checkups')}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'checkups' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    Visites Médicales
                </button>
                <button
                    onClick={() => setActiveTab('incidents')}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'incidents' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    Registre des Incidents
                </button>
            </div>

            {/* CONTENT TABS */}
            <Card>
                <CardHeader className="py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            {activeTab === 'checkups' ? 'Suivi des Aptitudes Médicales' : 'Registre des Accidents du Travail'}
                        </CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder={activeTab === 'checkups' ? "Rechercher un employé..." : "Rechercher un incident..."} className="pl-9 bg-slate-50" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {activeTab === 'checkups' ? (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Employé</TableHead>
                                    <TableHead>Type de visite</TableHead>
                                    <TableHead>Dernière visite</TableHead>
                                    <TableHead>Aptitude</TableHead>
                                    <TableHead>Prochaine échéance</TableHead>
                                    <TableHead>Statut Alerte</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {checkups.map((chk) => (
                                    <TableRow key={chk.id}>
                                        <TableCell className="font-medium text-slate-900">{chk.employee}</TableCell>
                                        <TableCell className="text-slate-600">{chk.type}</TableCell>
                                        <TableCell className="text-slate-600">{chk.date}</TableCell>
                                        <TableCell>
                                            <span className={`text-sm ${chk.fitness.includes('restrictions') ? 'text-amber-600 font-medium' : 'text-slate-600'}`}>
                                                {chk.fitness}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium">{chk.nextDue}</TableCell>
                                        <TableCell>
                                            {getCheckupStatusBadge(chk.nextDue, chk.status)}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => showNotification(`Planification de visite pour ${chk.employee}`)}>Planifier</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Réf</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Employé impliqué</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Lieu</TableHead>
                                    <TableHead>Gravité</TableHead>
                                    <TableHead>Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incidents.map((inc) => (
                                    <TableRow key={inc.id}>
                                        <TableCell className="font-mono text-xs text-slate-500">{inc.id}</TableCell>
                                        <TableCell className="font-medium">{inc.date}</TableCell>
                                        <TableCell className="text-slate-900">{inc.employee}</TableCell>
                                        <TableCell className="text-slate-600">{inc.type}</TableCell>
                                        <TableCell className="text-slate-600">{inc.location}</TableCell>
                                        <TableCell>
                                            <Badge variant={inc.severity === 'Majeur' || inc.severity === 'Critique' ? 'destructive' : 'warning'}>
                                                {inc.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600">{inc.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
