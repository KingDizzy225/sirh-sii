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
    Banknote, Receipt, Clock, XCircle, CheckCheck, Filter, Landmark, ShieldAlert
, Send, Copy, X} from 'lucide-react';
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

    // Prime d'ancienneté : due par la convention collective au-delà de deux
    // ans, elle était absente du calcul alors que l'application connaît toutes
    // les dates d'embauche.
    const [prime, setPrime] = useState(null);

    // Remise d'un bulletin au salarié. Les comptes salariés étant fermés, un
    // bulletin n'avait plus aucun moyen de leur parvenir : le PDF restait dans
    // l'application, alors que sa remise est une obligation.
    const [remise, setRemise] = useState(null);
    const [remiseEnCours, setRemiseEnCours] = useState(null);

    // Period selection
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    // Payroll variables form for HR (employeeId -> {variables})
    const [payrollVariables, setPayrollVariables] = useState({});
    // Écarts rendus par le serveur au lancement : salaire saisi différent de la
    // référence, ou salarié sans aucun salaire connu (non payé).
    const [ecarts, setEcarts] = useState([]);

    // Clôture du mois : un mois clôturé ne se relance plus. Relancer effaçait
    // les bulletins signés et cassait les liens transmis aux salariés.
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'Administrator';
    const [clotureMois, setClotureMois] = useState(null);
    const [avertissementsVus, setAvertissementsVus] = useState(false);
    const [clotureEnCours, setClotureEnCours] = useState(false);

    const chargerCloture = async () => {
        try {
            const { data } = await api.get(`/payrolls/cloture?period=${selectedMonth}`);
            setClotureMois(data && data.periode ? data : null);
        } catch {
            setClotureMois(null);
        }
        setAvertissementsVus(false);
    };

    const cloturerMois = async () => {
        setClotureEnCours(true);
        try {
            const { data } = await api.post('/payrolls/cloture', {
                period: selectedMonth,
                accepterAvertissements: avertissementsVus
            });
            showNotification(data?.message || 'Mois clôturé.');
        } catch (err) {
            showNotification(err.message || 'Clôture refusée.');
        } finally {
            setClotureEnCours(false);
            chargerCloture();
        }
    };

    const rouvrirMois = async () => {
        const motif = window.prompt(
            'Motif de la réouverture (conservé avec la clôture) :\n'
            + 'par exemple « Prime de juillet oubliée sur le bulletin de M. Koné ».'
        );
        if (!motif) return;
        try {
            const { data } = await api.post('/payrolls/cloture/reouvrir', { period: selectedMonth, motif });
            showNotification(data?.message || 'Mois rouvert.');
        } catch (err) {
            showNotification(err.message || 'Réouverture refusée.');
        } finally {
            chargerCloture();
        }
    };

    // Déclaration sociale du mois : montants agrégés par le serveur à partir
    // des bulletins enregistrés. Rien n'est recalculé ici — c'est justement ce
    // que faisait l'ancien export DISA, avec des taux qui avaient divergé.
    const [declaration, setDeclaration] = useState(null);
    const [declarationEnCours, setDeclarationEnCours] = useState(false);

    // Compensation Campaign State
    const [campaignEmployees, setCampaignEmployees] = useState([]);
    // Enveloppe saisie par la RH. Elle valait 250 000 FCFA en dur, un montant
    // que personne n'avait décidé.
    const [globalBudget, setGlobalBudget] = useState('');

    // Salary Advances State
    const [advancesFilter, setAdvancesFilter] = useState('all');
    const [advancesData, setAdvancesData] = useState([]);


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
                    department: a.department || '—',
                    amount: a.amount,
                    reason: a.reason || '—',
                    status: (a.status === 'Approuvé' || a.status === 'APPROVED' || a.status === 'approved') ? 'approved' :
                            (a.status === 'Rejeté' || a.status === 'REJECTED' || a.status === 'rejected') ? 'rejected' : 'pending',
                    // Aucune modalité n'est enregistrée : « 3 mois » était affiché pour toutes.
                    repayment: '—',
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
                // Un salarié sorti ne reçoit plus de bulletin : la liste servait
                // telle quelle à la paie, départs compris.
                const actifs = employeesData.filter(e => e.status !== 'TERMINATED');
                setEmployees(actifs);
                
                // Initialize preparation variables
                const vars = {};
                actifs.forEach(emp => {
                    const empPayrolls = payrollsData.filter(p => p.employeeId === emp.id);
                    const currentMonthPay = empPayrolls.find(p => {
                        try {
                            const dateIso = new Date(p.period).toISOString();
                            return dateIso.substring(0, 7) === selectedMonth;
                        } catch (e) { return false; }
                    });

                    if (currentMonthPay) {
                        vars[emp.id] = {
                            // Vide : le serveur retient le salaire en vigueur à la
                            // période. Recopier l'ancien montant le ferait passer
                            // pour une saisie, et masquerait une augmentation.
                            baseSalary: '',
                            overtimeHours: currentMonthPay.overtimeHours || 0,
                            leaveDays: currentMonthPay.leaveDays || 0,
                            bonus: currentMonthPay.bonus || 0,
                            deductions: currentMonthPay.deductions || 0
                        };
                    } else {
                        vars[emp.id] = {
                            // Aucun montant par défaut. Il valait 350 000 FCFA pour tout
                            // salarié sans bulletin antérieur, et le serveur retenait ce
                            // montant transmis de préférence au salaire du dossier.
                            baseSalary: '',
                            overtimeHours: 0,
                            leaveDays: 0,
                            bonus: 0,
                            deductions: 0
                        };
                    }
                });
                setPayrollVariables(vars);

                // Simulation d'augmentations : le salaire est celui du dossier. La
                // note de performance était tirée au hasard à chaque ouverture et
                // colorait des salariés réels comme sous-performants.
                setCampaignEmployees(actifs.map(emp => ({
                    id: emp.id,
                    name: `${emp.firstName} ${emp.lastName}`,
                    role: emp.positionTitle || '',
                    department: emp.department || '—',
                    currentSalary: emp.baseSalary ?? null,
                    proposedIncreasePercentage: 0
                })));
            }
        } catch (error) {
            console.error("Error loading payroll dashboard", error);
        }
    };

    const chargerDeclaration = async () => {
        setDeclarationEnCours(true);
        try {
            const reponse = await api.get(`/payrolls/declaration?period=${selectedMonth}`);
            setDeclaration(reponse.data || null);
        } catch (error) {
            console.error('Erreur chargement déclaration', error);
            setDeclaration(null);
        } finally {
            setDeclarationEnCours(false);
        }
    };

    useEffect(() => {
        if (isHR) {
            loadEmployeesAndPayrolls();
            loadAdvances();
            chargerCloture();
            if (activeTab === 'declaration') chargerDeclaration();
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
                // null : le serveur applique la rémunération de référence. Un montant
                // saisi la remplace pour ce bulletin, et l'écart est signalé.
                baseSalary: payrollVariables[emp.id]?.baseSalary === '' || payrollVariables[emp.id]?.baseSalary == null
                    ? null
                    : payrollVariables[emp.id].baseSalary,
                overtimeHours: payrollVariables[emp.id].overtimeHours || 0,
                leaveDays: payrollVariables[emp.id].leaveDays || 0,
                bonus: payrollVariables[emp.id].bonus || 0,
                deductions: payrollVariables[emp.id].deductions || 0
            }))
        };

        try {
            const { data } = await api.post(`/payrolls/run`, payload);
            if (data) {
                // Les écarts restent affichés sur l'écran de préparation : le serveur
                // les calculait, personne ne les voyait.
                const signales = Array.isArray(data.ecarts) ? data.ecarts : [];
                setEcarts(signales);
                showNotification(`${data.count} bulletin(s) produit(s)`
                    + (data.remplaces ? `, ${data.remplaces} remplacé(s) et conservé(s)` : '')
                    + (signales.length ? ` — ${signales.length} écart(s) à vérifier` : ''));
                loadEmployeesAndPayrolls();
                chargerCloture();
                if (signales.length === 0) setActiveTab('history');
            }
        } catch (error) {
            console.error(error);
            showNotification(error.message || 'Erreur lors de la génération de la paie.');
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
        csvContent += "ID Employé;Nom;Prénom;Période;Base(FCFA);Heures Sup(h);Montant H.Sup(FCFA);Primes;Absences(FCFA);Brut(FCFA);CNPS Salarié;CMU;ITS;Retenues diverses;Net Versé(FCFA);Charge Patronale(FCFA);Coût Employeur(FCFA)\n";

        allPayrolls.forEach((pay) => {
            const brut = pay.grossSalary ?? 0;
            const patronal = pay.employerContributions ?? 0;
            const row = [
                pay.employeeId || '',
                pay.employee?.lastName || '',
                pay.employee?.firstName || '',
                pay.period,
                Math.round(pay.baseSalary || 0),
                pay.overtimeHours || 0,
                Math.round(pay.overtimeAmount ?? 0),
                Math.round(pay.bonus || 0),
                Math.round(pay.leaveDeduction ?? 0),
                Math.round(brut),
                Math.round(pay.cnpsEmployee ?? 0),
                Math.round(pay.cmu ?? 0),
                Math.round(pay.its ?? 0),
                Math.round(pay.deductions || 0),
                Math.round(pay.netSalary || 0),
                Math.round(patronal),
                Math.round(brut + patronal)
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
        
        // Les montants déclarés sont ceux du bulletin enregistré, pas un
        // recalcul local : cet export appliquait 5,1 % et 10,9 % au salaire de
        // base quand le serveur retenait 6,3 % sur le brut, si bien que la
        // déclaration ne correspondait à aucun bulletin remis.
        const incompletes = allPayrolls.filter(p => p.grossSalary == null).length;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Num. CNPS (ou ID);Nom;Prénom;Date Embauche;Brut Mensuel(FCFA);Retenue CNPS(FCFA);Part Patronale(FCFA);Assiette ITS(FCFA);ITS(FCFA)\n";

        allPayrolls.forEach((pay) => {
            const hireDate = pay.employee?.hireDate ? new Date(pay.employee.hireDate).toLocaleDateString('fr-FR') : 'N/A';

            const row = [
                pay.employeeId || '',
                pay.employee?.lastName || '',
                pay.employee?.firstName || '',
                hireDate,
                Math.round(pay.grossSalary ?? pay.baseSalary ?? 0),
                Math.round(pay.cnpsEmployee ?? 0),
                Math.round(pay.employerContributions ?? 0),
                Math.round(pay.taxableIncome ?? 0),
                Math.round(pay.its ?? 0)
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
        // Une déclaration incomplète est pire qu'une déclaration absente : elle
        // part chez l'organisme sans que personne ne sache qu'il y manque des
        // lignes. Les fiches antérieures au détail des cotisations sortent avec
        // des montants à zéro, il faut le dire.
        showNotification(incompletes > 0
            ? `Export DISA généré — ${incompletes} fiche(s) sans détail des cotisations, à relancer avant dépôt.`
            : "Export Légal DISA (CNPS) Réussi !");
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


    // Calculations Campaign stats
    const campaignStats = useMemo(() => {
        let totalCurrent = 0;
        let totalProposed = 0;
        let sansSalaire = 0;

        campaignEmployees.forEach(emp => {
            // Un salaire inconnu ne compte pas pour zéro : il sortirait la
            // masse salariale de la réalité sans que rien ne l'indique.
            if (emp.currentSalary == null) { sansSalaire++; return; }
            totalCurrent += emp.currentSalary;
            totalProposed += emp.currentSalary * (1 + emp.proposedIncreasePercentage / 100);
        });

        return { totalCurrent, totalProposed, budgetConsumed: totalProposed - totalCurrent, sansSalaire };
    }, [campaignEmployees]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CI').format(Math.round(amount)) + ' FCFA';
    };

    const getMonthName = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    };

    useEffect(() => {
        if (!isHR) return;
        api.get('/payrolls/prime-anciennete')
            .then((res) => { if (res?.data) setPrime(res.data); })
            .catch(() => { /* la carte ne s'affiche pas, le reste de la page tient */ });
    }, [isHR]);

    /** Produit un lien de retrait et l'affiche pour transmission. */
    const remettreBulletin = async (pay) => {
        setRemiseEnCours(pay.id);
        try {
            const res = await api.post('/remises', { sourceType: 'BULLETIN', sourceId: pay.id });
            setRemise(res?.data || null);
        } catch (err) {
            // Le refus porte sa raison : date de naissance absente, PDF manquant.
            // « Erreur » ne dirait pas quoi corriger.
            setRemise({ erreur: err.message || 'Le lien n\'a pas pu être produit.' });
        } finally {
            setRemiseEnCours(null);
        }
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
                    { id: 'declaration', label: 'Déclarations Sociales', icon: Landmark, hidden: !isHR },
                    { id: 'campaign', label: "Simulation d'augmentations", icon: PiggyBank, hidden: !isHR },
                    { id: 'advances', label: 'Avances sur Salaire', icon: Banknote, hidden: !isHR },
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
                                        <TableHead>Salaire Brut</TableHead>
                                        <TableHead>Net Versé</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-xs">
                                    {myPayslips.map(pay => (
                                        <TableRow key={pay.id} className="hover:bg-slate-50/30 font-semibold">
                                            <td className="p-4 capitalize text-slate-900 font-bold">{getMonthName(pay.period)}</td>
                                            <td className="p-4 text-slate-500">{formatCurrency(pay.grossSalary ?? pay.baseSalary)}</td>
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
                        {/* Prime d'ancienneté.

                            La paie inscrit les bulletins directement comme approuvés :
                            activer la prime d'office changerait dès la prochaine
                            exécution ce que touchent les salariés. On montre donc ce
                            qu'elle ajouterait, pour décider sur un montant connu. */}
                        {prime && prime.beneficiaires > 0 && (
                            <div className={`rounded-xl border p-4 ${
                                prime.active
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-amber-50 border-amber-200'
                            }`}>
                                <div className="flex flex-wrap items-baseline justify-between gap-3">
                                    <p className={`text-sm font-bold ${prime.active ? 'text-emerald-900' : 'text-amber-900'}`}>
                                        Prime d'ancienneté — {prime.beneficiaires} bénéficiaire(s),
                                        {' '}{prime.totalMensuel.toLocaleString('fr-FR')} F par mois
                                    </p>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                        prime.active
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                            : 'bg-amber-100 text-amber-800 border-amber-300'
                                    }`}>
                                        {prime.active ? 'appliquée' : 'non appliquée'}
                                    </span>
                                </div>
                                <p className={`text-xs mt-1.5 ${prime.active ? 'text-emerald-800' : 'text-amber-800'}`}>
                                    {prime.bareme.libelle}. Coût employeur, charges comprises :
                                    {' '}{prime.coutEmployeurMensuel.toLocaleString('fr-FR')} F par mois.
                                </p>
                                <p className={`text-xs mt-1 ${prime.active ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {prime.message}
                                </p>
                                {(prime.lacunes.sansDateEmbauche > 0 || prime.lacunes.sansSalaireDeReference > 0) && (
                                    <p className="text-xs mt-1 text-slate-600">
                                        Non calculable pour {prime.lacunes.sansDateEmbauche} dossier(s) sans date
                                        d'embauche et {prime.lacunes.sansSalaireDeReference} sans salaire de référence.
                                    </p>
                                )}
                            </div>
                        )}

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
                                disabled={isGenerating || employees.length === 0 || Boolean(clotureMois?.cloturee)}
                                title={clotureMois?.cloturee ? 'Mois clôturé : la paie ne se relance plus sans réouverture' : undefined}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-bold text-xs py-2 px-4 shadow-sm rounded-lg"
                            >
                                {isGenerating ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-1"></span> : <PlayCircle size={14} />}
                                Lancer la Génération de Paie
                            </Button>
                        </div>

                        {clotureMois?.cloturee && (
                            <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-slate-800">
                                    <span className="font-bold">Paie de {clotureMois.periode} clôturée</span> le{' '}
                                    {new Date(clotureMois.derniere.clotureLe).toLocaleDateString('fr-FR')} par {clotureMois.derniere.cloturePar}
                                    {' '}— {clotureMois.derniere.effectif} bulletin(s). Elle ne se relance plus.
                                </p>
                                {isAdmin ? (
                                    <Button size="sm" variant="outline" onClick={rouvrirMois} className="text-xs font-bold">
                                        Rouvrir pour rectifier…
                                    </Button>
                                ) : (
                                    <span className="text-xs text-slate-500">Une rectification passe par un administrateur.</span>
                                )}
                            </div>
                        )}

                        {clotureMois && !clotureMois.cloturee && clotureMois.controles?.effectif > 0 && (
                            <div className="rounded-xl border border-indigo-200 bg-white p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm font-bold text-slate-800">
                                        {clotureMois.controles.effectif} bulletin(s) sur {clotureMois.periode} — mois ouvert
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={cloturerMois}
                                        disabled={clotureEnCours
                                            || clotureMois.controles.bloquantes.length > 0
                                            || (clotureMois.controles.avertissements.length > 0 && !avertissementsVus)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                                    >
                                        {clotureEnCours ? 'Clôture…' : 'Clôturer le mois'}
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Une fois clôturé, le mois ne se relance plus : les bulletins remis et signés sont figés.
                                    Relancer un mois ouvert conserve les bulletins remplacés.
                                </p>
                                {clotureMois.controles.bloquantes.map((b, i) => (
                                    <p key={`b${i}`} className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-2">{b}</p>
                                ))}
                                {clotureMois.controles.avertissements.map((a, i) => (
                                    <p key={`a${i}`} className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2">{a}</p>
                                ))}
                                {clotureMois.controles.avertissements.length > 0 && clotureMois.controles.bloquantes.length === 0 && (
                                    <label className="flex items-center gap-2 text-xs text-slate-700">
                                        <input type="checkbox" checked={avertissementsVus} onChange={(e) => setAvertissementsVus(e.target.checked)} />
                                        J'ai vérifié ces points et je clôture en connaissance de cause.
                                    </label>
                                )}
                            </div>
                        )}

                        {ecarts.length > 0 && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-bold text-rose-900 flex items-center gap-2">
                                        <ShieldAlert size={16} /> {ecarts.length} écart(s) relevé(s) au dernier lancement
                                    </p>
                                    <button onClick={() => setEcarts([])} aria-label="Masquer les écarts" className="text-rose-400 hover:text-rose-700">
                                        <X size={16} />
                                    </button>
                                </div>
                                <ul className="space-y-1">
                                    {ecarts.map((e, i) => (
                                        <li key={i} className="text-xs text-rose-800">
                                            <span className="font-bold">{e.nom}</span> — {e.motif}
                                            {e.reference != null && e.transmis != null && (
                                                <> Dossier : {formatCurrency(e.reference)}, saisi : {formatCurrency(e.transmis)}.</>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

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
                                                        value={payrollVariables[emp.id]?.baseSalary ?? ''}
                                                        onChange={(e) => handleVariableChange(emp.id, 'baseSalary', e.target.value)}
                                                        placeholder={emp.baseSalary != null ? `Dossier : ${Math.round(emp.baseSalary).toLocaleString('fr-FR')}` : 'Aucun salaire au dossier'}
                                                        title="Laisser vide pour appliquer le salaire en vigueur à la période"
                                                        className={cn("w-32 border rounded-lg p-1.5 text-xs font-bold bg-slate-50 focus:ring-1 focus:ring-indigo-500 outline-none",
                                                            emp.baseSalary == null ? "border-rose-300 placeholder:text-rose-500" : "border-slate-200")}
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
                                                <td className="p-4 text-slate-700">{formatCurrency(pay.grossSalary ?? (pay.baseSalary + pay.bonus))}</td>
                                                <td className="p-4 text-slate-900 font-black">{formatCurrency(pay.netSalary)}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button 
                                                            onClick={() => navigate(`/payroll/${pay.id}`)}
                                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1 h-8 rounded-lg"
                                                        >
                                                            <Eye size={13} className="mr-1" /> Consulter
                                                        </Button>
                                                        <Button
                                                            onClick={() => remettreBulletin(pay)}
                                                            disabled={remiseEnCours === pay.id}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1 h-8 rounded-lg"
                                                        >
                                                            <Send size={13} className="mr-1" />
                                                            {remiseEnCours === pay.id ? 'Lien…' : 'Remettre'}
                                                        </Button>
                                                    </div>
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

                {/* 4. DÉCLARATIONS SOCIALES */}
                {isHR && activeTab === 'declaration' && (
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm bg-white">
                            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-800">
                                        Déclaration sociale — {declaration?.periode || selectedMonth}
                                    </CardTitle>
                                    <CardDescription>
                                        Montants agrégés à partir des bulletins enregistrés. À vérifier avant tout dépôt auprès de la CNPS et de la DGI.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700"
                                    />
                                    <Button variant="outline" size="sm" onClick={handleExportDISA}
                                        className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs font-bold">
                                        <Download size={14} className="mr-1.5" /> Export DISA
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {declarationEnCours && (
                                    <p className="text-sm text-slate-500 py-8 text-center">Calcul en cours…</p>
                                )}

                                {!declarationEnCours && !declaration && (
                                    <p className="text-sm text-slate-500 py-8 text-center">
                                        Déclaration indisponible pour cette période.
                                    </p>
                                )}

                                {!declarationEnCours && declaration && declaration.effectifDeclare === 0 && (
                                    <p className="text-sm text-slate-500 py-8 text-center">
                                        Aucun bulletin sur {declaration.periode}. Exécutez la paie du mois avant de déclarer.
                                    </p>
                                )}

                                {!declarationEnCours && declaration && declaration.effectifDeclare > 0 && (
                                    <div className="space-y-6">
                                        {/* Ce qui empêcherait une déclaration sincère est montré avant les
                                            totaux : une fois le fichier déposé, l'erreur est chez l'organisme. */}
                                        {declaration.anomalies.length > 0 && (
                                            <div className="space-y-2">
                                                {declaration.anomalies.map((a, i) => (
                                                    <div key={i} className={cn(
                                                        "flex items-start gap-3 rounded-lg border p-3",
                                                        a.gravite === 'bloquante'
                                                            ? "border-rose-200 bg-rose-50"
                                                            : "border-amber-200 bg-amber-50"
                                                    )}>
                                                        <ShieldAlert size={16} className={cn("mt-0.5 shrink-0",
                                                            a.gravite === 'bloquante' ? "text-rose-600" : "text-amber-600")} />
                                                        <div className="text-xs">
                                                            <p className={cn("font-bold",
                                                                a.gravite === 'bloquante' ? "text-rose-800" : "text-amber-800")}>
                                                                {a.libelle}
                                                            </p>
                                                            <p className="text-slate-600 mt-0.5">{a.consequence} {a.remede}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid gap-4 md:grid-cols-3">
                                            {[
                                                { titre: 'CNPS à verser', valeur: declaration.aVerser.cnps, detail: `part salariale ${formatCurrency(declaration.totaux.cnpsSalarie)} + part patronale ${formatCurrency(declaration.totaux.cnpsPatronal)}`, couleur: 'text-indigo-700' },
                                                { titre: 'ITS à reverser', valeur: declaration.aVerser.impots, detail: `assiette ${formatCurrency(declaration.totaux.assietteITS)}`, couleur: 'text-rose-700' },
                                                { titre: 'CMU', valeur: declaration.aVerser.cmu, detail: `${declaration.effectifDeclare} salarié(s) déclaré(s)`, couleur: 'text-emerald-700' }
                                            ].map(k => (
                                                <div key={k.titre} className="rounded-xl border border-slate-200 p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{k.titre}</p>
                                                    <p className={cn("text-2xl font-black mt-1", k.couleur)}>{formatCurrency(k.valeur)}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{k.detail}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-3 text-sm">
                                            <div className="rounded-xl bg-slate-50 p-4">
                                                <p className="text-xs font-bold uppercase text-slate-500">Masse salariale brute</p>
                                                <p className="text-lg font-black text-slate-900 mt-1">{formatCurrency(declaration.totaux.brut)}</p>
                                            </div>
                                            <div className="rounded-xl bg-slate-50 p-4">
                                                <p className="text-xs font-bold uppercase text-slate-500">Net versé aux salariés</p>
                                                <p className="text-lg font-black text-slate-900 mt-1">{formatCurrency(declaration.totaux.net)}</p>
                                            </div>
                                            <div className="rounded-xl bg-slate-900 p-4">
                                                <p className="text-xs font-bold uppercase text-slate-400">Coût employeur total</p>
                                                <p className="text-lg font-black text-white mt-1">{formatCurrency(declaration.coutEmployeur)}</p>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50/30">
                                                        <TableHead>Collaborateur</TableHead>
                                                        <TableHead className="text-right">Brut</TableHead>
                                                        <TableHead className="text-right">CNPS salarié</TableHead>
                                                        <TableHead className="text-right">CNPS patronal</TableHead>
                                                        <TableHead className="text-right">ITS</TableHead>
                                                        <TableHead className="text-right">Net</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="text-xs">
                                                    {declaration.lignes.map(l => (
                                                        <TableRow key={l.employeeId} className={cn("font-semibold", !l.complet && "bg-rose-50/50")}>
                                                            <td className="p-3 font-bold text-slate-900">
                                                                {l.nom}
                                                                {!l.complet && <span className="ml-2 text-rose-600 font-normal">(sans détail)</span>}
                                                            </td>
                                                            <td className="p-3 text-right text-slate-700">{formatCurrency(l.brut ?? 0)}</td>
                                                            <td className="p-3 text-right text-slate-700">{formatCurrency(l.cnpsSalarie ?? 0)}</td>
                                                            <td className="p-3 text-right text-slate-700">{formatCurrency(l.cnpsPatronal ?? 0)}</td>
                                                            <td className="p-3 text-right text-slate-700">{formatCurrency(l.its ?? 0)}</td>
                                                            <td className="p-3 text-right text-slate-900 font-black">{formatCurrency(l.net ?? 0)}</td>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <p className="text-xs text-slate-400">
                                            Taux appliqués : CNPS part salariale {(declaration.taux.cnpsSalarie * 100).toFixed(2).replace('.', ',')} %,
                                            part patronale {(declaration.taux.cnpsPatronal * 100).toFixed(2).replace('.', ',')} %,
                                            CMU {formatCurrency(declaration.taux.cmuForfait)} par salarié.
                                            Ces taux doivent être confirmés par votre comptable.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 5. SIMULATION D'AUGMENTATIONS

                    Simulation seulement. L'écran annonçait « Campagne salariale
                    sauvegardée en base de données » sans rien enregistrer. Les
                    décisions se prennent dans « Décisions de rémunération », qui
                    les date, les motive et les applique à la paie. */}
                {isHR && activeTab === 'campaign' && (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-amber-900 max-w-2xl leading-relaxed">
                                Simulation : rien n'est enregistré sur cet écran. Une augmentation se décide,
                                avec sa date d'effet et son motif, dans « Décisions de rémunération ».
                            </p>
                            <Button size="sm" onClick={() => navigate('/remunerations')} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold">
                                Décisions de rémunération
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Masse salariale actuelle</CardTitle>
                                    <Briefcase className="h-4 w-4 text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-slate-800">{formatCurrency(campaignStats.totalCurrent)}</div>
                                    {campaignStats.sansSalaire > 0 && (
                                        <p className="text-[11px] text-rose-600 font-semibold mt-1">
                                            {campaignStats.sansSalaire} salarié(s) sans salaire au dossier, exclu(s) du total.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Masse salariale projetée</CardTitle>
                                    <Calculator className="h-4 w-4 text-indigo-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-indigo-600">{formatCurrency(campaignStats.totalProposed)}</div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                                        +{(campaignStats.budgetConsumed / (campaignStats.totalCurrent || 1) * 100).toFixed(2)} % global
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className={cn("border-none shadow-sm", globalBudget !== '' && campaignStats.budgetConsumed > Number(globalBudget) ? 'bg-red-50' : 'bg-white')}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-widest">Enveloppe</CardTitle>
                                    <AlertCircle className="h-4 w-4 text-slate-400" />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={globalBudget}
                                        onChange={(e) => setGlobalBudget(e.target.value)}
                                        placeholder="Montant mensuel décidé"
                                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Consommé : <span className="font-bold text-slate-800">{formatCurrency(campaignStats.budgetConsumed)}</span>
                                    </p>
                                    {globalBudget !== '' && campaignStats.budgetConsumed > Number(globalBudget) && (
                                        <p className="text-[10px] text-rose-600 font-black uppercase tracking-wide">
                                            Enveloppe dépassée de {formatCurrency(campaignStats.budgetConsumed - Number(globalBudget))}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-sm font-bold text-slate-800">Simulation d'augmentations</CardTitle>
                                <CardDescription>Salaire de base au dossier. Les pourcentages saisis ne sont pas conservés.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead className="w-[220px]">Employé</TableHead>
                                            <TableHead>Département</TableHead>
                                            <TableHead className="text-right">Salaire actuel</TableHead>
                                            <TableHead className="text-center bg-indigo-50/20 w-[160px]">Augmentation %</TableHead>
                                            <TableHead className="text-right bg-indigo-50/20 w-[180px]">Nouveau salaire de base</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-xs font-semibold">
                                        {campaignEmployees.map(emp => (
                                            <TableRow key={emp.id} className="hover:bg-slate-50/30">
                                                <td className="p-4 font-bold text-slate-800">
                                                    <div>{emp.name}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{emp.role}</div>
                                                </td>
                                                <td className="p-4 text-slate-500">{emp.department}</td>
                                                <td className="p-4 text-right text-slate-700 font-bold">
                                                    {emp.currentSalary == null
                                                        ? <span className="text-rose-600 font-semibold">Non renseigné</span>
                                                        : formatCurrency(emp.currentSalary)}
                                                </td>
                                                <td className="p-4 bg-indigo-50/10">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            min="0" max="50" step="0.5"
                                                            value={emp.proposedIncreasePercentage}
                                                            disabled={emp.currentSalary == null}
                                                            onChange={(e) => handleIncreaseChange(emp.id, e.target.value)}
                                                            className="w-16 border border-slate-200 rounded-lg p-1.5 text-center text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-40"
                                                        />
                                                        <span className="text-slate-400 font-bold">%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right font-black text-indigo-700 bg-indigo-50/10">
                                                    {emp.currentSalary == null
                                                        ? '—'
                                                        : formatCurrency(emp.currentSalary * (1 + emp.proposedIncreasePercentage / 100))}
                                                </td>
                                            </TableRow>
                                        ))}
                                        {campaignEmployees.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-slate-400 font-medium">
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

            </div>
        
            {/* Lien de remise produit.

                Le lien vaut autorisation de télécharger : il ne se transmet
                qu'au salarié concerné, et la fenêtre le dit. */}
            {remise && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[110]">
                    <Card className="w-full max-w-lg border-none shadow-2xl">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-lg font-black">
                                    {remise.erreur ? 'Lien non produit' : 'Lien de retrait'}
                                </CardTitle>
                                {!remise.erreur && (
                                    <CardDescription className="text-xs">
                                        {remise.titre} — {remise.salarie}
                                    </CardDescription>
                                )}
                            </div>
                            <button
                                onClick={() => setRemise(null)}
                                aria-label="Fermer"
                                className="text-slate-400 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {remise.erreur ? (
                                <p className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3">
                                    {remise.erreur}
                                </p>
                            ) : (
                                <>
                                    <div className="bg-slate-900 rounded-xl p-3">
                                        <p className="font-mono text-[11px] text-white break-all leading-relaxed">
                                            {remise.lien}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => navigator.clipboard?.writeText(remise.lien)}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                    >
                                        <Copy size={14} className="mr-2" /> Copier le lien
                                    </Button>
                                    <p className="text-xs text-slate-600 leading-relaxed">{remise.consigne}</p>
                                    <p className="text-[11px] text-slate-500">
                                        Valable jusqu'au{' '}
                                        {new Date(remise.expireLe).toLocaleDateString('fr-FR')}. Chaque
                                        ouverture et chaque téléchargement sont datés : vous pourrez
                                        vérifier que le document a bien été retiré.
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
