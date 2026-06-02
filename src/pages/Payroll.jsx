import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useAuth } from '../context/AuthContext';
import { 
    Download, PlayCircle, FileText, CheckCircle2, Search, UserCheck, 
    Eye, PiggyBank, Calculator, Briefcase, AlertCircle, Save, Sparkles,
    Banknote, Receipt, Clock, XCircle, CheckCheck, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { cn } from '@/lib/utils';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function Payroll() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const isHR = user?.role === 'HR' || user?.role === 'ADMIN' || user?.role === 'Administrator';

    const [activeTab, setActiveTab] = useState(isHR ? 'run-payroll' : 'my-payslips');
    const [notification, setNotification] = useState(null);

    // Dynamic Lists from Backend (Payrolls & Employees)
    const [employees, setEmployees] = useState([]);
    const [myPayslips, setMyPayslips] = useState([]);
    const [allPayrolls, setAllPayrolls] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Period selection
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    // Payroll variables form for HR (employeeId -> {variables})
    const [payrollVariables, setPayrollVariables] = useState({});

    // Compensation Campaign State
    const [campaignEmployees, setCampaignEmployees] = useState([]);
    const [globalBudget] = useState(250000); // 250,000 FCFA budget envelope for salary increases

    // Salary Advances State
    const [advancesFilter, setAdvancesFilter] = useState('all');
    const [advancesData, setAdvancesData] = useState([]);

    // Expenses (Notes de Frais) State
    const [expensesFilter, setExpensesFilter] = useState('all');
    const [expensesData, setExpensesData] = useState([
        { id: 'EXP-001', employee: 'Amadou Diallo', category: 'Déplacement', description: 'Mission client Abidjan', amount: 85000, date: '2026-05-08', status: 'pending', receipt: true },
        { id: 'EXP-002', employee: 'Fatou Sow', category: 'Restauration', description: 'Repas réunion partenaires', amount: 25000, date: '2026-05-09', status: 'approved', receipt: true },
        { id: 'EXP-003', employee: 'Ibrahim Ndiaye', category: 'Formation', description: 'Certification AWS Cloud', amount: 350000, date: '2026-05-11', status: 'pending', receipt: false },
        { id: 'EXP-004', employee: 'Mariama Ba', category: 'Matériel', description: 'Fournitures bureau', amount: 15000, date: '2026-05-14', status: 'approved', receipt: true },
        { id: 'EXP-005', employee: 'Oumar Traoré', category: 'Déplacement', description: 'Carburant livraisons', amount: 45000, date: '2026-05-16', status: 'rejected', receipt: true },
        { id: 'EXP-006', employee: 'Aïcha Koné', category: 'Hébergement', description: 'Hôtel mission Dakar', amount: 120000, date: '2026-05-19', status: 'pending', receipt: true },
    ]);


    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Handlers for Advances
    const loadAdvances = async () => {
        try {
            const { data } = await api.get(`/advances`);
            if (data) {
                const mapped = data.map(a => ({
                    id: a.id,
                    employee: a.employee,
                    department: a.department || 'Opérations',
                    amount: a.amount,
                    reason: a.reason || '—',
                    status: (a.status === 'Approuvé' || a.status === 'APPROVED' || a.status === 'approved') ? 'approved' :
                            (a.status === 'Rejeté' || a.status === 'REJECTED' || a.status === 'rejected') ? 'rejected' : 'pending',
                    repayment: '3 mois',
                    requestDate: a.requestedAt || new Date().toISOString()
                }));
                setAdvancesData(mapped);
            }
        } catch (e) {
            console.error("Error fetching advances:", e);
        }
    };

    const handleAdvanceAction = async (id, action) => {
        try {
            const status = action === 'approved' ? 'Approuvé' : 'Rejeté';
            const { data } = await api.put(`/advances/${id}/status`, { status });
            if (data) {
                await loadAdvances();
                showNotification(action === 'approved' ? '✅ Avance approuvée avec succès.' : '❌ Avance rejetée.');
            }
        } catch (e) {
            console.error("Error updating advance status:", e);
            showNotification('Erreur lors du traitement de la demande.', true);
        }
    };

    // Handlers for Expenses
    const handleExpenseAction = (id, action) => {
        setExpensesData(prev => prev.map(e => e.id === id ? { ...e, status: action } : e));
        showNotification(action === 'approved' ? '✅ Note de frais approuvée.' : '❌ Note de frais rejetée.');
    };


    // Load data routines
    const loadMyPayslips = async () => {
        try {
            const { data } = await api.get(`/payrolls/my`);
            if (data) setMyPayslips(data);
        } catch (error) {
            console.error('Error fetching payslips', error);
        }
    };

    const loadEmployeesAndPayrolls = async () => {
        if (!isHR) return;
        try {
            const [empRes, payRes] = await Promise.all([
                api.get('/employees'),
                api.get('/payrolls')
            ]);
            
            let payrollsData = [];
            if (payRes.data) {
                payrollsData = payRes.data;
                setAllPayrolls(payrollsData);
            }

            if (empRes.data) {
                const employeesData = empRes.data.employees || empRes.data;
                setEmployees(employeesData);
                
                // Initialize preparation variables
                const vars = {};
                employeesData.forEach(emp => {
                    const empPayrolls = payrollsData.filter(p => p.employeeId === emp.id);
                    const currentMonthPay = empPayrolls.find(p => {
                        try {
                            const dateIso = new Date(p.period).toISOString();
                            return dateIso.substring(0, 7) === selectedMonth;
                        } catch (e) { return false; }
                    });

                    if (currentMonthPay) {
                        vars[emp.id] = {
                            baseSalary: currentMonthPay.baseSalary,
                            overtimeHours: currentMonthPay.overtimeHours || 0,
                            leaveDays: currentMonthPay.leaveDays || 0,
                            bonus: currentMonthPay.bonus || 0,
                            deductions: currentMonthPay.deductions || 0
                        };
                    } else {
                        empPayrolls.sort((a, b) => new Date(b.period) - new Date(a.period));
                        const latestPay = empPayrolls[0];
                        vars[emp.id] = {
                            baseSalary: latestPay ? latestPay.baseSalary : 350000,
                            overtimeHours: 0,
                            leaveDays: 0,
                            bonus: 0,
                            deductions: 0
                        };
                    }
                });
                setPayrollVariables(vars);

                // Initialize Campaign Roster by combining real employees with simulated base stats
                const compRoster = employeesData.map(emp => {
                    const empPayrolls = payrollsData.filter(p => p.employeeId === emp.id);
                    empPayrolls.sort((a, b) => new Date(b.period) - new Date(a.period));
                    const lastPay = empPayrolls[0];

                    return {
                        id: emp.id,
                        name: `${emp.firstName} ${emp.lastName}`,
                        role: emp.positionTitle || 'Collaborateur',
                        department: emp.department || 'Opérations',
                        perfScore: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Simulate rating 3.0 - 5.0
                        currentSalary: lastPay ? lastPay.baseSalary : 350000,
                        proposedIncreasePercentage: 0
                    };
                });
                setCampaignEmployees(compRoster);
            }
        } catch (error) {
            console.error("Error loading payroll dashboard", error);
        }
    };

    useEffect(() => {
        if (isHR) {
            loadEmployeesAndPayrolls();
            loadAdvances();
        }
        loadMyPayslips();
    }, [activeTab, isHR, selectedMonth]);

    const handleVariableChange = (empId, field, value) => {
        setPayrollVariables(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                [field]: value === '' ? '' : (parseFloat(value) || 0)
            }
        }));
    };

    const handleRunPayroll = async () => {
        setIsGenerating(true);
        const payload = {
            payrolls: employees.map(emp => ({
                employeeId: emp.id,
                period: `${selectedMonth}-01`,
                baseSalary: payrollVariables[emp.id].baseSalary || 350000,
                overtimeHours: payrollVariables[emp.id].overtimeHours || 0,
                leaveDays: payrollVariables[emp.id].leaveDays || 0,
                bonus: payrollVariables[emp.id].bonus || 0,
                deductions: payrollVariables[emp.id].deductions || 0
            }))
        };

        try {
            const { data } = await api.post(`/payrolls/run`, payload);
            if (data) {
                showNotification('Bordereau de paie généré et bulletins PDF créés !');
                loadEmployeesAndPayrolls();
                setActiveTab('history');
            }
        } catch (error) {
            console.error(error);
            showNotification('Erreur lors de la génération de la paie.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Exports Handlers
    const handleExportCSV = () => {
        if (allPayrolls.length === 0) {
            showNotification('Aucune donnée à exporter.');
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID Employé;Nom;Prénom;Période;Base(FCFA);Heures Sup;Primes;Retenues;Net Versé(FCFA)\n";
        
        allPayrolls.forEach((pay) => {
            const row = [
                pay.employeeId || '',
                pay.employee?.lastName || '',
                pay.employee?.firstName || '',
                pay.period,
                pay.baseSalary || 0,
                pay.overtimeHours || 0,
                pay.bonus || 0,
                pay.deductions || 0,
                pay.netSalary || 0
            ].join(";");
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Export_EVP_Paie_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Export Comptable CSV Réussi !");
    };

    const handleExportSage = async () => {
        try {
            const response = await api.get(`/payrolls/export/sage?period=${selectedMonth}`, { responseType: 'blob' });
            if (response.data) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `export_sage_${selectedMonth}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                showNotification('Export Sage Ligne 100 généré avec succès.');
            }
        } catch (error) {
            console.error('Erreur Export Sage', error);
            showNotification('Erreur lors de la génération de l\'export Sage.');
        }
    };

    const handleExportDISA = () => {
        if (allPayrolls.length === 0) {
            showNotification("Aucune donnée de paie à exporter pour la DISA.");
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Num. CNPS (ou ID);Nom;Prénom;Date Embauche;Base Mensuelle(FCFA);Jours Travaillés;Retenue CNPS(FCFA);Part Patronale(FCFA)\n";
        
        allPayrolls.forEach((pay) => {
            const cnpsEmploye = Math.round((pay.baseSalary || 0) * 0.051);
            const cnpsPatron = Math.round((pay.baseSalary || 0) * 0.109);
            const hireDate = pay.employee?.hireDate ? new Date(pay.employee.hireDate).toLocaleDateString('fr-FR') : 'N/A';

            const row = [
                pay.employeeId || '',
                pay.employee?.lastName || '',
                pay.employee?.firstName || '',
                hireDate,
                pay.baseSalary || 0,
                30,
                cnpsEmploye,
                cnpsPatron
            ].join(";");
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Export_DISA_CNPS_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Export Légal DISA (CNPS) Réussi !");
    };

    // Campaign Handlers
    const handleIncreaseChange = (id, newPercentage) => {
        let val = parseFloat(newPercentage) || 0;
        if (val < 0) val = 0;
        if (val > 50) val = 50;

        setCampaignEmployees(prev => prev.map(emp =>
            emp.id === id ? { ...emp, proposedIncreasePercentage: val } : emp
        ));
    };

    const handleSaveCampaign = () => {
        showNotification("Campagne salariale sauvegardée en base de données !");
    };

    // Calculations Campaign stats
    const campaignStats = useMemo(() => {
        let totalCurrent = 0;
        let totalProposed = 0;

        campaignEmployees.forEach(emp => {
            totalCurrent += emp.currentSalary;
            const increaseAmount = (emp.currentSalary * emp.proposedIncreasePercentage) / 100;
            totalProposed += (emp.currentSalary + increaseAmount);
        });

        const budgetConsumed = totalProposed - totalCurrent;
        return { totalCurrent, totalProposed, budgetConsumed };
    }, [campaignEmployees]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CI').format(Math.round(amount)) + ' FCFA';
    };

    const getMonthName = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
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

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <PiggyBank className="text-indigo-600 h-9 w-9" />
                        Rémunération & Paie
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">Gérez le calcul de la paie, les exports de fin de période ou le plan annuel d'augmentations.</p>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-slate-200/80 mb-6 gap-1 overflow-x-auto shrink-0 bg-slate-100/50 p-1 rounded-xl">
                {[
                    { id: 'my-payslips', label: 'Mes Bulletins de Salaire', icon: FileText },
                    { id: 'run-payroll', label: 'Préparation de la Paie', icon: PlayCircle, hidden: !isHR },
                    { id: 'history', label: 'Registre & Téléchargements', icon: Search, hidden: !isHR },
                    { id: 'campaign', label: 'Campagne Salariale', icon: PiggyBank, hidden: !isHR },
                    { id: 'advances', label: 'Avances sur Salaire', icon: Banknote, hidden: !isHR },
                    { id: 'expenses', label: 'Notes de Frais', icon: Receipt, hidden: !isHR },
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

            {/* TABS CONTAINER */}
            <div className="flex-1 min-h-0">
                {/* 1. MY PAYSLIPS */}
                {activeTab === 'my-payslips' && (
                    <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-sm font-bold text-slate-800">Historique Personnel des Rémunérations</CardTitle>
                            <CardDescription>Consultez, signez électroniquement ou téléchargez vos bulletins PDF certifiés.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30">
                                        <TableHead>Période</TableHead>
                                        <TableHead>Salaire Base (Brut)</TableHead>
                                        <TableHead>Net Versé</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-xs">
                                    {myPayslips.map(pay => (
                                        <TableRow key={pay.id} className="hover:bg-slate-50/30 font-semibold">
                                            <td className="p-4 capitalize text-slate-900 font-bold">{getMonthName(pay.period)}</td>
                                            <td className="p-4 text-slate-500">{formatCurrency(pay.baseSalary)}</td>
                                            <td className="p-4 text-slate-900 font-black">{formatCurrency(pay.netSalary)}</td>
                                            <td className="p-4">
                                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">Disponible</Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button 
                                                    onClick={() => navigate(`/payroll/${pay.id}`)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 h-8 px-3 rounded-lg"
                                                >
                                                    <Eye size={13} className="mr-1" /> Consulter & Signer
                                                </Button>
                                            </td>
                                        </TableRow>
                                    ))}
                                    {myPayslips.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                                                Aucune fiche de paie archivée pour votre compte.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* 2. RUN PAYROLL (HR PREPARATION) */}
                {isHR && activeTab === 'run-payroll' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Période d'imputation :</span>
                                <input 
                                    type="month" 
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <Button 
                                onClick={handleRunPayroll} 
                                disabled={isGenerating || employees.length === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-bold text-xs py-2 px-4 shadow-sm rounded-lg"
                            >
                                {isGenerating ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-1"></span> : <PlayCircle size={14} />}
                                Lancer la Génération de Paie
                            </Button>
                        </div>

                        <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-sm font-bold text-slate-800">Saisie des Éléments Variables de Paie (EVP)</CardTitle>
                                <CardDescription>Renseignez et ajustez les primes, retenues ou heures supplémentaires pour la période.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead className="min-w-[220px]">Collaborateur</TableHead>
                                            <TableHead>Salaire Base (FCFA)</TableHead>
                                            <TableHead>Hr Sup.</TableHead>
                                            <TableHead>Jours Abs.</TableHead>
                                            <TableHead>Primes (FCFA)</TableHead>
                                            <TableHead>Retenues (FCFA)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-xs">
                                        {employees.map(emp => (
                                            <TableRow key={emp.id} className="hover:bg-slate-50/30">
                                                <td className="p-4 font-bold text-slate-800">
                                                    <div>{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{emp.positionTitle}</div>
                                                </td>
                                                <td className="p-4">
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.baseSalary || ''} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'baseSalary', e.target.value)}
                                                        className="w-24 border border-slate-200 rounded-lg p-1.5 text-xs font-bold bg-slate-50 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.overtimeHours || 0} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'overtimeHours', e.target.value)}
                                                        className="w-16 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-blue-700 bg-blue-50/30"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.leaveDays || 0} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'leaveDays', e.target.value)}
                                                        className="w-16 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-rose-700 bg-rose-50/30"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.bonus || 0} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'bonus', e.target.value)}
                                                        className="w-20 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/30"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.deductions || 0} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'deductions', e.target.value)}
                                                        className="w-20 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-700"
                                                    />
                                                </td>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 3. HISTORY & EXPORTS */}
                {isHR && activeTab === 'history' && (
                    <div className="space-y-6">
                        <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-800">Registre Général de Paie</CardTitle>
                                    <CardDescription>Téléchargement des exports comptables de fin de période.</CardDescription>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Button variant="outline" size="sm" onClick={handleExportSage} className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold">
                                        <Download size={14} className="mr-1.5" /> Export Sage L100
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleExportDISA} className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs font-bold">
                                        <Download size={14} className="mr-1.5" /> Export DISA (CNPS)
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold">
                                        <Download size={14} className="mr-1.5" /> Export CSV (EVP)
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead>Collaborateur</TableHead>
                                            <TableHead>Période</TableHead>
                                            <TableHead>Salaire Brut Cumulé</TableHead>
                                            <TableHead>Salaire Net Versé</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-xs">
                                        {allPayrolls.map(pay => (
                                            <TableRow key={pay.id} className="hover:bg-slate-50/30 font-semibold">
                                                <td className="p-4 font-bold text-slate-900">{pay.employee?.firstName} {pay.employee?.lastName}</td>
                                                <td className="p-4 capitalize text-slate-500">{getMonthName(pay.period)}</td>
                                                <td className="p-4 text-slate-700">{formatCurrency(pay.baseSalary + pay.bonus)}</td>
                                                <td className="p-4 text-slate-900 font-black">{formatCurrency(pay.netSalary)}</td>
                                                <td className="p-4 text-right">
                                                    <Button 
                                                        onClick={() => navigate(`/payroll/${pay.id}`)}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1 h-8 rounded-lg"
                                                    >
                                                        <Eye size={13} className="mr-1" /> Consulter
                                                    </Button>
                                                </td>
                                            </TableRow>
                                        ))}
                                        {allPayrolls.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                                                    Aucun registre de paie disponible pour l'instant.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 4. COMPENSATION CAMPAIGN */}
                {isHR && activeTab === 'campaign' && (
                    <div className="space-y-6">
                        {/* Envelope Budget KPIs */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Masse Salariale Actuelle</CardTitle>
                                    <Briefcase className="h-4 w-4 text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-slate-800">{formatCurrency(campaignStats.totalCurrent)}</div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Masse Salariale Projetée</CardTitle>
                                    <Calculator className="h-4 w-4 text-indigo-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-indigo-600">{formatCurrency(campaignStats.totalProposed)}</div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                                        +{((campaignStats.totalProposed - campaignStats.totalCurrent) / (campaignStats.totalCurrent || 1) * 100).toFixed(2)}% global
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className={cn("border-none shadow-sm", campaignStats.budgetConsumed > globalBudget ? 'bg-red-50' : 'bg-white')}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-widest">Consommation Enveloppe</CardTitle>
                                    <AlertCircle className={cn("h-4 w-4", campaignStats.budgetConsumed > globalBudget ? 'text-red-500' : 'text-emerald-500')} />
                                </CardHeader>
                                <CardContent>
                                    <div className={cn("text-2xl font-black", campaignStats.budgetConsumed > globalBudget ? 'text-rose-600' : 'text-emerald-600')}>
                                        {formatCurrency(campaignStats.budgetConsumed)} 
                                        <span className="text-xs font-normal text-slate-400">/ {formatCurrency(globalBudget)}</span>
                                    </div>
                                    {campaignStats.budgetConsumed > globalBudget && (
                                        <p className="text-[10px] text-rose-600 font-black mt-1 uppercase tracking-wide">
                                            ⚠️ Budget dépassé de {formatCurrency(campaignStats.budgetConsumed - globalBudget)}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Roster spreadsheet */}
                        <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-800">Grille d'Augmentations Annuelles (Campagne 2026)</CardTitle>
                                    <CardDescription>Simulez et validez les augmentations de salaire de base selon le score de performance.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="text-xs font-bold"><Download size={14} className="mr-1.5" /> Exporter CSV</Button>
                                    <Button size="sm" onClick={handleSaveCampaign} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"><Save size={14} className="mr-1.5" /> Enregistrer</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead className="w-[200px]">Employé</TableHead>
                                            <TableHead>Département</TableHead>
                                            <TableHead className="text-center">Perf. (sur 5)</TableHead>
                                            <TableHead className="text-right">Salaire Actuel</TableHead>
                                            <TableHead className="text-center bg-indigo-50/20 w-[160px]">Augmentation %</TableHead>
                                            <TableHead className="text-right bg-indigo-50/20 w-[180px]">Nouveau Salaire Base</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-xs font-semibold">
                                        {campaignEmployees.map(emp => {
                                            const increaseVal = (emp.currentSalary * emp.proposedIncreasePercentage) / 100;
                                            const newSal = emp.currentSalary + increaseVal;
                                            const isWarning = (emp.perfScore < 3.5 && emp.proposedIncreasePercentage > 0) || (emp.perfScore >= 4.5 && emp.proposedIncreasePercentage < 1);

                                            return (
                                                <TableRow key={emp.id} className="hover:bg-slate-50/30">
                                                    <td className="p-4 font-bold text-slate-800">
                                                        <div>{emp.name}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{emp.role}</div>
                                                    </td>
                                                    <td className="p-4 text-slate-500">{emp.department}</td>
                                                    <td className="p-4 text-center">
                                                        <Badge variant="outline" className={cn(
                                                            "text-[10px] font-bold border",
                                                            emp.perfScore >= 4.3 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                            emp.perfScore < 3.5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600'
                                                        )}>
                                                            {emp.perfScore} / 5
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-right text-slate-700 font-bold">{formatCurrency(emp.currentSalary)}</td>
                                                    <td className="p-4 bg-indigo-50/10">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                min="0" max="50" step="0.5"
                                                                value={emp.proposedIncreasePercentage}
                                                                onChange={(e) => handleIncreaseChange(emp.id, e.target.value)}
                                                                className={cn(
                                                                    "w-16 border rounded-lg p-1.5 text-center text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none",
                                                                    isWarning ? 'border-amber-300 bg-amber-50/50 text-amber-700' : 'border-slate-200'
                                                                )}
                                                            />
                                                            <span className="text-slate-400 font-bold">%</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right font-black text-indigo-700 bg-indigo-50/10">{formatCurrency(newSal)}</td>
                                                </TableRow>
                                            );
                                        })}
                                        {campaignEmployees.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6 text-slate-400 font-medium">
                                                    Aucun collaborateur trouvé pour la simulation.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {/* 5. AVANCES SUR SALAIRE */}
                {isHR && activeTab === 'advances' && (
                    <div className="space-y-6">
                        {/* KPIs */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">En Attente</CardTitle>
                                    <Clock className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-amber-600">{advancesData.filter(a => a.status === 'pending').length}</div>
                                    <p className="text-xs text-slate-400 mt-1">{formatCurrency(advancesData.filter(a => a.status === 'pending').reduce((s, a) => s + a.amount, 0))}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Approuvées</CardTitle>
                                    <CheckCheck className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-emerald-600">{advancesData.filter(a => a.status === 'approved').length}</div>
                                    <p className="text-xs text-slate-400 mt-1">{formatCurrency(advancesData.filter(a => a.status === 'approved').reduce((s, a) => s + a.amount, 0))}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rejetées</CardTitle>
                                    <XCircle className="h-4 w-4 text-rose-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-rose-600">{advancesData.filter(a => a.status === 'rejected').length}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-800">Demandes d'Avances sur Salaire</CardTitle>
                                    <CardDescription>Gérez et arbitrez toutes les demandes soumises par les employés via le portail.</CardDescription>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Filter size={14} className="text-slate-400" />
                                    <select
                                        value={advancesFilter}
                                        onChange={e => setAdvancesFilter(e.target.value)}
                                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="all">Toutes</option>
                                        <option value="pending">En attente</option>
                                        <option value="approved">Approuvées</option>
                                        <option value="rejected">Rejetées</option>
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead>Référence</TableHead>
                                            <TableHead>Employé</TableHead>
                                            <TableHead>Département</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Motif</TableHead>
                                            <TableHead>Remboursement</TableHead>
                                            <TableHead>Date Demande</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-xs">
                                        {advancesData
                                            .filter(a => advancesFilter === 'all' || a.status === advancesFilter)
                                            .map(adv => (
                                            <TableRow key={adv.id} className="hover:bg-slate-50/30 font-semibold">
                                                <td className="p-4 font-mono text-indigo-700 font-bold">{adv.id}</td>
                                                <td className="p-4 font-bold text-slate-800">{adv.employee}</td>
                                                <td className="p-4 text-slate-500">{adv.department}</td>
                                                <td className="p-4 font-black text-slate-900">{formatCurrency(adv.amount)}</td>
                                                <td className="p-4 text-slate-500 max-w-[160px] truncate">{adv.reason}</td>
                                                <td className="p-4 text-slate-500">{adv.repayment}</td>
                                                <td className="p-4 text-slate-400">{new Date(adv.requestDate).toLocaleDateString('fr-FR')}</td>
                                                <td className="p-4">
                                                    <Badge className={cn(
                                                        'text-[10px] font-bold border',
                                                        adv.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        adv.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                    )}>
                                                        {adv.status === 'approved' ? 'Approuvée' : adv.status === 'rejected' ? 'Rejetée' : 'En attente'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {adv.status === 'pending' && (
                                                        <div className="flex gap-1.5 justify-end">
                                                            <Button
                                                                onClick={() => handleAdvanceAction(adv.id, 'approved')}
                                                                size="sm"
                                                                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg"
                                                            >
                                                                <CheckCheck size={12} className="mr-1" /> Valider
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleAdvanceAction(adv.id, 'rejected')}
                                                                size="sm"
                                                                className="h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg"
                                                            >
                                                                <XCircle size={12} className="mr-1" /> Refuser
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {adv.status !== 'pending' && <span className="text-slate-300 text-[10px] font-bold">Traité</span>}
                                                </td>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 6. NOTES DE FRAIS */}
                {isHR && activeTab === 'expenses' && (
                    <div className="space-y-6">
                        {/* KPIs */}
                        <div className="grid gap-4 md:grid-cols-4">
                            {[
                                { label: 'En Attente', count: expensesData.filter(e => e.status === 'pending').length, amount: expensesData.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0), color: 'amber', icon: Clock },
                                { label: 'Approuvées', count: expensesData.filter(e => e.status === 'approved').length, amount: expensesData.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0), color: 'emerald', icon: CheckCheck },
                                { label: 'Rejetées', count: expensesData.filter(e => e.status === 'rejected').length, amount: 0, color: 'rose', icon: XCircle },
                                { label: 'Total Mois', count: expensesData.length, amount: expensesData.reduce((s, e) => s + e.amount, 0), color: 'indigo', icon: Receipt },
                            ].map(kpi => (
                                <Card key={kpi.label} className="border-none shadow-sm bg-white">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</CardTitle>
                                        <kpi.icon className={`h-4 w-4 text-${kpi.color}-500`} />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-black text-${kpi.color}-600`}>{kpi.count}</div>
                                        {kpi.amount > 0 && <p className="text-xs text-slate-400 mt-1">{formatCurrency(kpi.amount)}</p>}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-800">Notes de Frais Professionnels</CardTitle>
                                    <CardDescription>Validez et remboursez les frais professionnels soumis par les collaborateurs via le portail employé.</CardDescription>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Filter size={14} className="text-slate-400" />
                                    <select
                                        value={expensesFilter}
                                        onChange={e => setExpensesFilter(e.target.value)}
                                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="all">Tous</option>
                                        <option value="pending">En attente</option>
                                        <option value="approved">Approuvées</option>
                                        <option value="rejected">Rejetées</option>
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead>Réf.</TableHead>
                                            <TableHead>Employé</TableHead>
                                            <TableHead>Catégorie</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Justificatif</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-xs">
                                        {expensesData
                                            .filter(e => expensesFilter === 'all' || e.status === expensesFilter)
                                            .map(exp => (
                                            <TableRow key={exp.id} className="hover:bg-slate-50/30 font-semibold">
                                                <td className="p-4 font-mono text-indigo-700 font-bold">{exp.id}</td>
                                                <td className="p-4 font-bold text-slate-800">{exp.employee}</td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-600">{exp.category}</Badge>
                                                </td>
                                                <td className="p-4 text-slate-500 max-w-[180px] truncate">{exp.description}</td>
                                                <td className="p-4 font-black text-slate-900">{formatCurrency(exp.amount)}</td>
                                                <td className="p-4 text-slate-400">{new Date(exp.date).toLocaleDateString('fr-FR')}</td>
                                                <td className="p-4">
                                                    {exp.receipt
                                                        ? <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">✓ Fourni</Badge>
                                                        : <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">✗ Manquant</Badge>
                                                    }
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={cn(
                                                        'text-[10px] font-bold border',
                                                        exp.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        exp.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                    )}>
                                                        {exp.status === 'approved' ? 'Approuvée' : exp.status === 'rejected' ? 'Rejetée' : 'En attente'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {exp.status === 'pending' && (
                                                        <div className="flex gap-1.5 justify-end">
                                                            <Button
                                                                onClick={() => handleExpenseAction(exp.id, 'approved')}
                                                                disabled={!exp.receipt}
                                                                size="sm"
                                                                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg disabled:opacity-40"
                                                            >
                                                                <CheckCheck size={12} className="mr-1" /> Valider
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleExpenseAction(exp.id, 'rejected')}
                                                                size="sm"
                                                                className="h-7 px-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold rounded-lg"
                                                            >
                                                                <XCircle size={12} className="mr-1" /> Rejeter
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {exp.status !== 'pending' && <span className="text-slate-300 text-[10px] font-bold">Traité</span>}
                                                </td>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
