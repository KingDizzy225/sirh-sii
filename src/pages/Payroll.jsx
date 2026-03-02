import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DollarSign, Download, PlayCircle, CheckCircle2, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';

const initialPayrollCycles = [
    { id: 'PAY-2026-10', period: 'Octobre 2026', totalEmployees: 180, amount: '567 120 000 FCFA', status: 'En cours', date: '28 Oct 2026' },
    { id: 'PAY-2026-09', period: 'Septembre 2026', totalEmployees: 178, amount: '558 300 000 FCFA', status: 'Terminé', date: '28 Sep 2026' },
    { id: 'PAY-2026-08', period: 'Août 2026', totalEmployees: 175, amount: '547 680 000 FCFA', status: 'Terminé', date: '28 Août 2026' },
    { id: 'PAY-2026-07', period: 'Juillet 2026', totalEmployees: 170, amount: '534 060 000 FCFA', status: 'Terminé', date: '28 Juil 2026' },
];

export function Payroll() {
    const [payslips, setPayslips] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [payrollForm, setPayrollForm] = useState({ employeeId: '', period: '', baseSalary: 1500000, type: 'Regular', note: '', gtaImported: false, extraHours: 0, nightHours: 0, expensesImported: false, expensesTotal: 0 });

    const fetchPayslipsAndEmployees = async () => {
        try {
            const token = localStorage.getItem('sirh_token');
            const authConfig = { headers: { 'Authorization': `Bearer ${token}` } };

            const [payRes, empRes] = await Promise.all([
                fetch(`${API_URL}/api/payroll`, authConfig),
                fetch(`${API_URL}/api/employees`, authConfig)
            ]);
            const pays = await payRes.json();
            const emps = await empRes.json();

            if (Array.isArray(pays)) setPayslips(pays);
            if (Array.isArray(emps)) setEmployees(emps);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayslipsAndEmployees();
    }, []);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleImportGTA = () => {
        setTimeout(() => {
            setPayrollForm({ ...payrollForm, gtaImported: true, extraHours: 145, nightHours: 82 });
            showNotification('Le temps de travail GTA approuvé a été importé avec succès.');
        }, 800);
    };

    const handleImportExpenses = () => {
        setTimeout(() => {
            setPayrollForm({ ...payrollForm, expensesImported: true, expensesTotal: 813000 });
            showNotification('Notes de frais approuvées importées.');
        }, 800);
    };

    const handleRunPayrollSubmit = async (e) => {
        e.preventDefault();
        if (!payrollForm.period || !payrollForm.employeeId) {
            showNotification('Veuillez spécifier la période et un employé.');
            return;
        }

        try {
            // Création d'une fiche de paie individuelle pour déclencher l'Audit Trail en base
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/payroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    employeeId: payrollForm.employeeId,
                    periodStart: new Date(payrollForm.period + '-01'), // Ex: "2026-10-01"
                    periodEnd: new Date(payrollForm.period + '-28'),
                    baseSalary: Number(payrollForm.baseSalary),
                    bonuses: payrollForm.expensesImported ? payrollForm.expensesTotal : 0,
                    deductions: 0
                })
            });

            if (res.ok) {
                await fetchPayslipsAndEmployees();
                setIsModalOpen(false);
                setPayrollForm({ employeeId: '', period: '', baseSalary: 1500000, type: 'Régulier', note: '', gtaImported: false, extraHours: 0, nightHours: 0, expensesImported: false, expensesTotal: 0 });
                showNotification(`Fiche de paie validée sur Serveur. Trace Audit enregistrée.`);
            } else {
                showNotification(`Erreur serveur lors de la création.`);
            }
        } catch (err) {
            console.error(err);
            showNotification("Le serveur API n'est pas joignable.");
        }
    };

    const handleExport = (id) => {
        showNotification(`Fiches de paie exportées pour le cycle ${id}`);
    };

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

            {/* Run Payroll Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Lancer la Paie</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="run-payroll-form" onSubmit={handleRunPayrollSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-2 flex gap-3">
                                            <div className="text-emerald-600 mt-0.5"><DollarSign size={18} /></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-emerald-800 font-medium">Vérifier d'abord les présences (GTA)</p>
                                                <p className="text-xs text-emerald-700/80 mt-0.5 mb-3">Veuillez vous assurer que tous les superviseurs ont validé les feuilles de temps avant de lancer la paie.</p>
                                                {!payrollForm.gtaImported ? (
                                                    <Button type="button" size="sm" onClick={handleImportGTA} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                                                        Importer les Heures GTA Approuvées
                                                    </Button>
                                                ) : (
                                                    <div className="bg-white/60 rounded p-2 text-xs font-semibold text-emerald-800 flex items-center justify-between border border-emerald-200">
                                                        <span><CheckCircle2 size={12} className="inline mr-1" /> Données GTA Importées</span>
                                                        <span className="text-slate-600 font-medium">{payrollForm.extraHours}h Sup. | {payrollForm.nightHours}h Nuit</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-2 flex gap-3">
                                            <div className="text-blue-600 mt-0.5"><DollarSign size={18} /></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-blue-800 font-medium">Réconcilier les Indemnités & Frais</p>
                                                <p className="text-xs text-blue-700/80 mt-0.5 mb-3">Importez toutes les notes de frais approuvées pour qu'elles soient remboursées sur cette paie.</p>
                                                {!payrollForm.expensesImported ? (
                                                    <Button type="button" size="sm" onClick={handleImportExpenses} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                                                        Importer les Notes de Frais
                                                    </Button>
                                                ) : (
                                                    <div className="bg-white/60 rounded p-2 text-xs font-semibold text-blue-800 flex items-center justify-between border border-blue-200">
                                                        <span><CheckCircle2 size={12} className="inline mr-1" /> Frais Importés</span>
                                                        <span className="text-slate-600 font-medium">{payrollForm.expensesTotal.toLocaleString()} FCFA Total</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Employé</label>
                                            <select
                                                value={payrollForm.employeeId}
                                                onChange={(e) => setPayrollForm({ ...payrollForm, employeeId: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                                                required
                                            >
                                                <option value="" disabled>Sélectionner un employé</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.positionTitle})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Période (Mois-Année)</label>
                                            <Input
                                                type="month"
                                                value={payrollForm.period}
                                                onChange={(e) => setPayrollForm({ ...payrollForm, period: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Salaire de Base Fixe</label>
                                            <Input
                                                type="number"
                                                value={payrollForm.baseSalary}
                                                onChange={(e) => setPayrollForm({ ...payrollForm, baseSalary: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Type de Paie</label>
                                            <select
                                                value={payrollForm.type}
                                                onChange={(e) => setPayrollForm({ ...payrollForm, type: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="Régulier">Régulier</option>
                                                <option value="Hors-Cycle">Hors-Cycle</option>
                                                <option value="Prime">Prime (Bonus)</option>
                                                <option value="Correction">Correction</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Notes Internes (Optionnel)</label>
                                        <textarea
                                            value={payrollForm.note}
                                            onChange={(e) => setPayrollForm({ ...payrollForm, note: e.target.value })}
                                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Notes pour l'équipe de supervision finance..."
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="run-payroll-form" className="bg-emerald-600 hover:bg-emerald-700 text-white">Lancer le Traitement</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Traitement de Paie</h2>
                    <p className="text-slate-500 mt-1">Gérez la paie globale, les impôts, primes et cycles de rémunération.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm ring-offset-white transition-colors"
                    >
                        <PlayCircle size={18} /> Lancer la Paie
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0 shadow-md">
                    <CardHeader className="pb-2 text-sm font-medium text-blue-100 flex flex-row items-center justify-between">
                        Coût Paie Attendu (Oct 2026)
                        <DollarSign size={16} className="text-blue-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">567 120 000 FCFA</div>
                        <p className="text-blue-200 text-xs mt-1">Pour 180 employés actifs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 text-sm font-medium text-slate-500">Dépenses Paie Annuelles</CardHeader>
                    <CardContent className="text-3xl font-bold text-slate-900">
                        4.92 Milliards FCFA
                        <p className="text-emerald-600 text-xs mt-1 font-medium">+4.2% par rapport à l'année dernière</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 text-sm font-medium text-slate-500">Prochaine Date de Traitement</CardHeader>
                    <CardContent className="text-3xl font-bold text-slate-900">
                        28 Octobre
                        <p className="text-slate-400 text-xs mt-1">Il reste 4 jours</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Anciens Cycles de Paie</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employé</TableHead>
                                <TableHead>Période Générée</TableHead>
                                <TableHead>Salaire Net</TableHead>
                                <TableHead>Date Versement</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payslips.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        Aucune fiche de paie générée dans la base de données PostgreSQL .
                                    </TableCell>
                                </TableRow>
                            ) : payslips.map((slip) => (
                                <TableRow key={slip.id}>
                                    <TableCell className="font-medium text-slate-900">
                                        {slip.employee ? `${slip.employee.firstName} ${slip.employee.lastName}` : slip.employeeId}
                                    </TableCell>
                                    <TableCell className="text-slate-600">{new Date(slip.periodStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</TableCell>
                                    <TableCell className="font-semibold text-emerald-700">{slip.netSalary.toLocaleString()} FCFA</TableCell>
                                    <TableCell className="text-slate-600">{new Date(slip.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>
                                        <Badge variant={slip.status === 'PAID' ? 'success' : 'blue'}>
                                            {slip.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleExport(slip.id)}
                                            className="h-8 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Download size={14} className="mr-2" /> PDF
                                        </Button>
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
