import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useAuth } from '../context/AuthContext';
import { Download, PlayCircle, FileText, CheckCircle2, Search, UserCheck, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

export function Payroll() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

    const [activeTab, setActiveTab] = useState(isHR ? 'run-payroll' : 'my-payslips');
    const [employees, setEmployees] = useState([]);
    const [myPayslips, setMyPayslips] = useState([]);
    const [allPayrolls, setAllPayrolls] = useState([]);
    const [notification, setNotification] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Period selection
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    // Payroll variables form for HR (employeeId -> {variables})
    const [payrollVariables, setPayrollVariables] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const loadMyPayslips = async () => {
        try {
            const { data } = await api.get(`/payrolls/my`);
            if (data) {
                setMyPayslips(data);
            }
        } catch (error) {
            console.error('Error fetching payslips', error);
        }
    };

    const loadEmployeesAndPayrolls = async () => {
        if (!isHR) return;
        try {
            // Fetch employees and payrolls concurrently
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
                
                // Initialize variables based on latest payroll history
                const vars = {};
                employeesData.forEach(emp => {
                    const empPayrolls = payrollsData.filter(p => p.employeeId === emp.id);
                    empPayrolls.sort((a, b) => new Date(b.period) - new Date(a.period));
                    const latestPay = empPayrolls[0];

                    vars[emp.id] = {
                        baseSalary: latestPay ? latestPay.baseSalary : 350000, // Garde le dernier salaire connu
                        overtimeHours: 0,
                        leaveDays: 0,
                        bonus: 0,
                        deductions: 0
                    };
                });
                setPayrollVariables(vars);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isHR && activeTab === 'run-payroll') {
            loadEmployeesAndPayrolls();
        } else {
            loadMyPayslips();
        }
    }, [activeTab, isHR]);

    const handleVariableChange = (empId, field, value) => {
        setPayrollVariables(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                [field]: parseFloat(value) || 0
            }
        }));
    };

    const handleRunPayroll = async () => {
        setIsGenerating(true);
        // Build payload
        const payload = {
            payrolls: employees.map(emp => ({
                employeeId: emp.id,
                period: `${selectedMonth}-01`,
                baseSalary: payrollVariables[emp.id].baseSalary,
                overtimeHours: payrollVariables[emp.id].overtimeHours,
                leaveDays: payrollVariables[emp.id].leaveDays,
                bonus: payrollVariables[emp.id].bonus,
                deductions: payrollVariables[emp.id].deductions
            }))
        };

        try {
            const { data } = await api.post(`/payrolls/run`, payload);

            if (data) {
                showNotification('Bordereau de paie généré avec succès ! PDF créés.');
                loadEmployeesAndPayrolls();
                setActiveTab('history');
            } else {
                showNotification('Erreur lors de la génération.');
            }
        } catch (error) {
            console.error(error);
            showNotification('Erreur lors de la génération.');
        } finally {
            setIsGenerating(false);
        }
    };

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
        link.setAttribute("download", `Export_EVP_Paie.csv`);
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
            // Simulation des calculs CNPS (Retenue 5.1%, Part Patronale 10.9% sur base)
            const cnpsEmploye = Math.round((pay.baseSalary || 0) * 0.051);
            const cnpsPatron = Math.round((pay.baseSalary || 0) * 0.109);
            const hireDate = pay.employee?.hireDate ? new Date(pay.employee.hireDate).toLocaleDateString('fr-FR') : 'N/A';

            const row = [
                pay.employeeId || '',
                pay.employee?.lastName || '',
                pay.employee?.firstName || '',
                hireDate,
                pay.baseSalary || 0,
                30, // Par défaut
                cnpsEmploye,
                cnpsPatron
            ].join(";");
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Export_DISA_CNPS.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Export Légal DISA (CNPS) Réussi !");
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CI').format(Math.round(amount)) + ' FCFA';
    };

    const getMonthName = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    };

    const handleDownloadPDF = async (payId) => {
        try {
            // Note: Keep native fetch for blob response since api.js expects JSON/Text
            const res = await fetch(`${API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`}/payrolls/${payId}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Erreur de téléchargement du PDF (Vérifiez si le fichier existe sur le serveur)');
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Fiche_de_paie_${payId.substring(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showNotification('Téléchargement démarré.');
        } catch (error) {
            console.error(error);
            showNotification(error.message);
        }
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

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Rémunération & Paie</h2>
                    <p className="text-slate-500 mt-1">Gérez le calcul de la paie ou accédez à vos fiches de salaire.</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max mb-6">
                <button
                    onClick={() => setActiveTab('my-payslips')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'my-payslips' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <FileText size={16} /> Mes Fiches de Paie
                </button>
                {isHR && (
                    <>
                        <button
                            onClick={() => setActiveTab('run-payroll')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'run-payroll' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                        >
                            <PlayCircle size={16} /> Traitement de Paie
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                        >
                            <Search size={16} /> Registre Global
                        </button>
                    </>
                )}
            </div>

            {/* Tab: My Payslips (Employee View) */}
            {activeTab === 'my-payslips' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Historique de Rémunération</CardTitle>
                            <CardDescription>Téléchargez vos fiches de paie sécurisées (format PDF).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Période</TableHead>
                                        <TableHead>Salaire de Base</TableHead>
                                        <TableHead>Net à Payer</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Aperçu / Télécharger</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myPayslips?.map((pay) => (
                                        <TableRow key={pay.id}>
                                            <TableCell className="font-medium text-slate-900 capitalize">{getMonthName(pay.period)}</TableCell>
                                            <TableCell className="text-slate-600">{formatCurrency(pay.baseSalary)}</TableCell>
                                            <TableCell className="font-bold text-slate-900">{formatCurrency(pay.netSalary)}</TableCell>
                                            <TableCell>
                                                <Badge variant="success">Disponible</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <button
                                                    onClick={() => navigate(`/payroll/${pay.id}`)}
                                                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer border-none"
                                                >
                                                    <Eye size={14} /> Voir & Signer
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {myPayslips.length === 0 && (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Aucune fiche de paie trouvée.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tab: Run Payroll (HR View) */}
            {isHR && activeTab === 'run-payroll' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Période de Paie :</div>
                            <input 
                                type="month" 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="border border-slate-300 rounded-md px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <Button 
                            onClick={handleRunPayroll} 
                            disabled={isGenerating || employees.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-sm"
                        >
                            {isGenerating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><PlayCircle size={16} /></motion.div> : <PlayCircle size={16} />}
                            Générer les Fiches de Paie
                        </Button>
                    </div>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserCheck className="text-blue-600" size={20} /> Collecte des Éléments Variables de Paie (EVP)
                            </CardTitle>
                            <CardDescription>Vérifiez et ajustez les variables remontées pour la période avant génération.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Collaborateur</TableHead>
                                            <TableHead>Salaire Brut (FCFA)</TableHead>
                                            <TableHead>Hr Sup.</TableHead>
                                            <TableHead>Jours Abs.</TableHead>
                                            <TableHead>Prime (FCFA)</TableHead>
                                            <TableHead>Retenue (FCFA)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employees.map(emp => (
                                            <TableRow key={emp.id} className="bg-white">
                                                <TableCell className="font-medium">
                                                    <div>{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-xs text-slate-500 font-normal">{emp.positionTitle}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.baseSalary || 2500} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'baseSalary', e.target.value)}
                                                        className="w-24 text-sm font-bold border rounded px-2 py-1 bg-slate-50"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.overtimeHours || 0} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'overtimeHours', e.target.value)}
                                                        className="w-16 text-sm border border-slate-200 rounded px-2 py-1 text-blue-700 bg-blue-50/50"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.leaveDays || 0} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'leaveDays', e.target.value)}
                                                        className="w-16 text-sm border border-slate-200 rounded px-2 py-1 text-red-700 bg-red-50/50"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.bonus || 0} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'bonus', e.target.value)}
                                                        className="w-20 text-sm border border-slate-200 rounded px-2 py-1 text-emerald-700 bg-emerald-50/50"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input 
                                                        type="number" 
                                                        value={payrollVariables[emp.id]?.deductions || 0} 
                                                        onChange={(e) => handleVariableChange(emp.id, 'deductions', e.target.value)}
                                                        className="w-20 text-sm border border-slate-200 rounded px-2 py-1 text-slate-700"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tab: History (HR View) */}
            {isHR && activeTab === 'history' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">Registre Général de Paie</CardTitle>
                                <CardDescription>Historique global des rémunérations de l'entreprise.</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={handleExportSage} className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-medium">
                                    <Download size={16} className="mr-2" /> Export Sage L100
                                </Button>
                                <Button variant="outline" onClick={handleExportDISA} className="border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 font-medium">
                                    <Download size={16} className="mr-2" /> Export DISA (CNPS)
                                </Button>
                                <Button variant="outline" onClick={handleExportCSV} className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-medium">
                                    <Download size={16} className="mr-2" /> Export Comptable (.CSV)
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employé</TableHead>
                                        <TableHead>Période</TableHead>
                                        <TableHead>Brut Cumulé</TableHead>
                                        <TableHead>Net Versé</TableHead>
                                        <TableHead className="text-right">Fiche (PDF)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allPayrolls?.map((pay) => (
                                        <TableRow key={pay.id}>
                                            <TableCell className="font-medium text-slate-900">{pay.employee?.firstName} {pay.employee?.lastName}</TableCell>
                                            <TableCell className="text-slate-600 capitalize">{getMonthName(pay.period)}</TableCell>
                                            <TableCell className="text-slate-600">{formatCurrency(pay.baseSalary + pay.bonus)}</TableCell>
                                            <TableCell className="font-bold text-slate-900">{formatCurrency(pay.netSalary)}</TableCell>
                                            <TableCell className="text-right">
                                                <button
                                                    onClick={() => navigate(`/payroll/${pay.id}`)}
                                                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300 transition-colors cursor-pointer border-none"
                                                    >
                                                    <Eye size={14} /> Consulter
                                                </button>
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
