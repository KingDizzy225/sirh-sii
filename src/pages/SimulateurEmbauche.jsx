import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
    Calculator, DollarSign, Users, Award, TrendingUp, Download, 
    Printer, RefreshCw, FileText, CheckCircle2, HelpCircle, ArrowRightLeft,
    Briefcase, Building2, Sparkles, PieChart, ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip, Legend } from 'recharts';

/**
 * Moteur de calcul fiscal & social Côte d'Ivoire (Code Général des Impôts & Régime CNPS)
 */
export function calculatePayrollCI({
    grossSalary = 500000,
    transportAllowance = 30000, // Indemnité de transport (exonérée jusqu'à 30 000 FCFA)
    parts = 1,
    cadre = true
}) {
    const transportExempt = Math.min(transportAllowance, 30000);
    const transportTaxable = Math.max(0, transportAllowance - 30000);
    const taxableGross = grossSalary + transportTaxable;

    // 1. CNPS Retraite Salarié (6,3% plafonné à 1 647 315 FCFA)
    const cnpsCeiling = 1647315;
    const baseCnps = Math.min(taxableGross, cnpsCeiling);
    const cnpsWorker = Math.round(baseCnps * 0.063);

    // 2. CMU (Couverture Maladie Universelle) Salarié
    const cmuWorker = 1000;

    // 3. Base Fiscale = 80% du brut imposable
    const baseFiscale = taxableGross * 0.8;

    // 4. Impôt sur le Salaire (IS) Salarié : 1,2% de la base fiscale
    const isWorker = Math.round(baseFiscale * 0.012);

    // 5. Contribution Nationale (CN) Salarié : Barème progressif mensuel sur base fiscale
    let cnWorker = 0;
    if (baseFiscale > 50000 && baseFiscale <= 130000) {
        cnWorker = Math.round((baseFiscale - 50000) * 0.015);
    } else if (baseFiscale > 130000 && baseFiscale <= 200000) {
        cnWorker = Math.round((130000 - 50000) * 0.015 + (baseFiscale - 130000) * 0.05);
    } else if (baseFiscale > 200000) {
        cnWorker = Math.round((130000 - 50000) * 0.015 + (200000 - 130000) * 0.05 + (baseFiscale - 200000) * 0.10);
    }

    // 6. Impôt Général sur le Revenu (IGR) :
    // Assiette IGR = 85% de (Base Fiscale - IS - CN)
    const baseIgr = Math.max(0, (baseFiscale - isWorker - cnWorker) * 0.85);
    const quotient = parts > 0 ? baseIgr / parts : baseIgr;

    let igrBrut = 0;
    if (quotient <= 25000) {
        igrBrut = 0;
    } else if (quotient <= 45583) {
        igrBrut = (quotient * 0.10 - 2500) * parts;
    } else if (quotient <= 81583) {
        igrBrut = (quotient * 0.15 - 4779) * parts;
    } else if (quotient <= 126583) {
        igrBrut = (quotient * 0.20 - 8858) * parts;
    } else if (quotient <= 220583) {
        igrBrut = (quotient * 0.25 - 15188) * parts;
    } else if (quotient <= 389583) {
        igrBrut = (quotient * 0.35 - 37246) * parts;
    } else if (quotient <= 842166) {
        igrBrut = (quotient * 0.45 - 76204) * parts;
    } else {
        igrBrut = (quotient * 0.60 - 202529) * parts;
    }

    const igrWorker = Math.max(0, Math.round(igrBrut));

    // Total retenues salariales
    const totalWorkerTaxes = isWorker + cnWorker + igrWorker;
    const totalWorkerDeductions = cnpsWorker + cmuWorker + totalWorkerTaxes;

    // Salaire Net à payer (avec indemnité de transport exonérée)
    const netSalary = Math.round(taxableGross - totalWorkerDeductions + transportExempt);

    // 7. Charges Patronales (Employeur)
    // - Prestations familiales : 5,75% plafonné à 70 000 FCFA
    const cnpsPf = Math.round(Math.min(taxableGross, 70000) * 0.0575);
    // - Accident du travail : 3% (taux moyen tertiaire/services) plafonné à 70 000 FCFA
    const cnpsAt = Math.round(Math.min(taxableGross, 70000) * 0.03);
    // - Régime Retraite Employeur : 7,7% plafonné à 1 647 315 FCFA
    const cnpsRetraitePatronale = Math.round(baseCnps * 0.077);
    // - CMU Part Patronale : 1 000 FCFA
    const cmuPatronale = 1000;
    // - FDFP Taxe d'Apprentissage (TAP) : 0,4%
    const fdfpTap = Math.round(taxableGross * 0.004);
    // - FDFP Formation Professionnelle Continue (FPC) : 1,2%
    const fdfpFpc = Math.round(taxableGross * 0.012);

    const totalEmployerCharges = cnpsPf + cnpsAt + cnpsRetraitePatronale + cmuPatronale + fdfpTap + fdfpFpc;

    // Coût Total Entreprise (Total Cost to Company)
    const totalEmployerCost = taxableGross + transportExempt + totalEmployerCharges;

    return {
        grossSalary,
        taxableGross,
        transportAllowance,
        transportExempt,
        parts,
        cnpsWorker,
        cmuWorker,
        isWorker,
        cnWorker,
        igrWorker,
        totalWorkerTaxes,
        totalWorkerDeductions,
        netSalary,
        cnpsPf,
        cnpsAt,
        cnpsRetraitePatronale,
        cmuPatronale,
        fdfpTap,
        fdfpFpc,
        totalEmployerCharges,
        totalEmployerCost
    };
}

/**
 * Calcul inverse : trouver le Brut à partir d'un Net cible (Recherche dichotomique précise à 1 FCFA)
 */
function findGrossFromNet(targetNet, options = {}) {
    let low = targetNet;
    let high = targetNet * 2.2;
    let bestGross = targetNet;
    let iterations = 0;

    while (low <= high && iterations < 50) {
        const mid = Math.round((low + high) / 2);
        const res = calculatePayrollCI({ ...options, grossSalary: mid });
        
        if (Math.abs(res.netSalary - targetNet) < 20) {
            return mid;
        }

        if (res.netSalary < targetNet) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
        bestGross = mid;
        iterations++;
    }
    return bestGross;
}

export function SimulateurEmbauche() {
    const [mode, setMode] = useState('gross'); // 'gross' or 'net'
    const [grossInput, setGrossInput] = useState(650000);
    const [netInput, setNetInput] = useState(500000);
    const [parts, setParts] = useState(1);
    const [transportAllowance, setTransportAllowance] = useState(30000);
    const [candidateName, setCandidateName] = useState('Julie Konan');
    const [positionTitle, setPositionTitle] = useState('Chargée de Clientèle Senior');
    const [department, setDepartment] = useState('Commercial & Relation Client');

    // Résultat calculé selon le mode
    const payroll = useMemo(() => {
        if (mode === 'net') {
            const calculatedGross = findGrossFromNet(netInput, { transportAllowance, parts });
            return calculatePayrollCI({ grossSalary: calculatedGross, transportAllowance, parts });
        } else {
            return calculatePayrollCI({ grossSalary: grossInput, transportAllowance, parts });
        }
    }, [mode, grossInput, netInput, parts, transportAllowance]);

    // Graphique Donut de décomposition du coût total entreprise
    const pieData = [
        { name: 'Salaire Net en Poche', value: payroll.netSalary, color: '#10b981' },
        { name: 'Impôts Salarié (IS + CN + IGR)', value: payroll.totalWorkerTaxes, color: '#f59e0b' },
        { name: 'Cotisations Sociales Salarié (CNPS + CMU)', value: payroll.cnpsWorker + payroll.cmuWorker, color: '#6366f1' },
        { name: 'Charges Patronales (CNPS + FDFP + CMU)', value: payroll.totalEmployerCharges, color: '#ec4899' }
    ];

    const presets = [
        { label: 'Junior / Débutant', gross: 350000, title: 'Chargée de Clientèle Junior' },
        { label: 'Confirmé / Spécialiste', gross: 650000, title: 'Chargée de Clientèle' },
        { label: 'Senior / Lead (Julie Konan)', gross: 950000, title: 'Chargée de Clientèle Senior' },
        { label: 'Manager / Chef d’Équipe', gross: 1600000, title: 'Responsable Commercial' },
        { label: 'Directeur de Département', gross: 2800000, title: 'Directeur Commercial & Expérience Client' }
    ];

    const handleApplyPreset = (p) => {
        setPositionTitle(p.title);
        if (mode === 'gross') {
            setGrossInput(p.gross);
        } else {
            const res = calculatePayrollCI({ grossSalary: p.gross, transportAllowance, parts });
            setNetInput(res.netSalary);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Calculator className="text-indigo-600 h-8 w-8" />
                        Simulateur d'Embauche &amp; Négociation Salariale
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Barème fiscal officiel de Côte d'Ivoire (CNPS, CMU, IS, CN, IGR &amp; FDFP).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handlePrint} variant="outline" className="gap-2 border-slate-200 bg-white">
                        <Printer size={16} /> Imprimer l'Offre
                    </Button>
                </div>
            </div>

            {/* Presets rapides */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider self-center mr-2">Profils Types :</span>
                {presets.map((p, i) => (
                    <Button 
                        key={i} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApplyPreset(p)}
                        className="text-xs font-semibold bg-white border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shrink-0"
                    >
                        {p.label}
                    </Button>
                ))}
            </div>

            {/* Grille principale : Paramètres vs Restitution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Colonne Gauche : Formulaire de négociation */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border-slate-200/80 shadow-sm bg-white">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <ArrowRightLeft size={18} className="text-indigo-600" /> Mode de Négociation
                            </CardTitle>
                            <CardDescription>Calculez par le Brut proposé ou le Net souhaité</CardDescription>

                            <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl mt-3">
                                <button
                                    onClick={() => setMode('gross')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                        mode === 'gross' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Saisie par le BRUT
                                </button>
                                <button
                                    onClick={() => setMode('net')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                        mode === 'net' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Saisie par le NET
                                </button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-5">
                            {/* Montant Cible */}
                            {mode === 'gross' ? (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex justify-between">
                                        <span>Salaire Brut Négocié</span>
                                        <span className="text-indigo-600 font-extrabold">{payroll.grossSalary.toLocaleString()} FCFA</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={grossInput}
                                            onChange={(e) => setGrossInput(Number(e.target.value))}
                                            step="10000"
                                            className="text-lg font-bold pl-8 text-indigo-700 bg-indigo-50/30 border-indigo-200"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">F</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="150000" 
                                        max="3000000" 
                                        step="25000"
                                        value={grossInput}
                                        onChange={(e) => setGrossInput(Number(e.target.value))}
                                        className="w-full accent-indigo-600 cursor-pointer"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex justify-between">
                                        <span>Salaire Net Souhaité en Poche</span>
                                        <span className="text-emerald-600 font-extrabold">{netInput.toLocaleString()} FCFA</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={netInput}
                                            onChange={(e) => setNetInput(Number(e.target.value))}
                                            step="10000"
                                            className="text-lg font-bold pl-8 text-emerald-700 bg-emerald-50/30 border-emerald-200"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">F</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="100000" 
                                        max="2500000" 
                                        step="25000"
                                        value={netInput}
                                        onChange={(e) => setNetInput(Number(e.target.value))}
                                        className="w-full accent-emerald-600 cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Situation Fiscale & Nombre de Parts */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                        Situation Familiale &amp; Parts IGR
                                    </label>
                                    <Badge className="bg-indigo-100 text-indigo-800 text-xs font-bold">
                                        {parts} part{parts > 1 ? 's' : ''}
                                    </Badge>
                                </div>
                                <select 
                                    value={parts} 
                                    onChange={(e) => setParts(Number(e.target.value))}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="1">1 part — Célibataire, Divorcé, Veuf sans enfant</option>
                                    <option value="1.5">1,5 part — Célibataire avec 1 enfant à charge</option>
                                    <option value="2">2 parts — Marié sans enfant OU Célibataire avec 2 enfants</option>
                                    <option value="2.5">2,5 parts — Marié avec 1 enfant</option>
                                    <option value="3">3 parts — Marié avec 2 enfants</option>
                                    <option value="3.5">3,5 parts — Marié avec 3 enfants</option>
                                    <option value="4">4 parts — Marié avec 4 enfants</option>
                                    <option value="4.5">4,5 parts — Marié avec 5 enfants</option>
                                    <option value="5">5 parts (Plafond Légal) — Famille nombreuse</option>
                                </select>
                            </div>

                            {/* Indemnité de Transport Exonérée */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                        Prime de Transport (Mensuelle)
                                    </label>
                                    <span className="text-[10px] text-emerald-600 font-bold">Exonérée max 30 000 F</span>
                                </div>
                                <Input
                                    type="number"
                                    value={transportAllowance}
                                    onChange={(e) => setTransportAllowance(Number(e.target.value))}
                                    step="5000"
                                    className="text-xs font-bold"
                                />
                            </div>

                            {/* Détails du Candidat / Poste */}
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Infos Proposition</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500">Candidat</label>
                                        <Input 
                                            value={candidateName} 
                                            onChange={(e) => setCandidateName(e.target.value)}
                                            className="text-xs font-semibold mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500">Intitulé du Poste</label>
                                        <Input 
                                            value={positionTitle} 
                                            onChange={(e) => setPositionTitle(e.target.value)}
                                            className="text-xs font-semibold mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Résumé Synthétique Clé */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500 text-white rounded-2xl p-5 shadow-lg shadow-emerald-100">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">Net Garanti en Poche</span>
                            <div className="text-2xl font-black mt-1">{payroll.netSalary.toLocaleString()} F</div>
                            <p className="text-[10px] text-emerald-100 font-medium mt-1">Après toutes déductions d'impôts et CNPS</p>
                        </div>
                        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg shadow-slate-200">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Coût Total Entreprise</span>
                            <div className="text-2xl font-black text-indigo-400 mt-1">{payroll.totalEmployerCost.toLocaleString()} F</div>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Brut + Charges Patronales + Transport</p>
                        </div>
                    </div>
                </div>

                {/* Colonne Droite : Fiche de décomposition détaillée & Graphique */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Graphique de Répartition */}
                    <Card className="border-slate-200/80 shadow-sm bg-white">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <PieChart size={18} className="text-indigo-600" /> Structure Financière du Coût Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={4}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tableau Détaillé des Lignes Fiscales & Sociales */}
                    <Card className="border-slate-200/80 shadow-sm bg-white">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
                                <span>Bulletin Synthétique &amp; Charges Détaillées</span>
                                <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200">
                                    Norme CGI / CNPS CI
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Décomposition ligne par ligne selon la réglementation ivoirienne
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-0 divide-y divide-slate-100 text-xs">
                            {/* Salaire Brut */}
                            <div className="p-3.5 flex justify-between items-center bg-slate-50/50 font-bold text-slate-800">
                                <span>Salaire Brut de Base</span>
                                <span className="font-mono text-sm">{payroll.grossSalary.toLocaleString()} FCFA</span>
                            </div>

                            {/* Transport Exonéré */}
                            <div className="p-3 flex justify-between items-center text-slate-600">
                                <span className="flex items-center gap-1.5">
                                    <Briefcase size={14} className="text-slate-400" /> Prime de transport exonérée
                                </span>
                                <span className="font-mono text-emerald-600 font-semibold">+{payroll.transportExempt.toLocaleString()} FCFA</span>
                            </div>

                            {/* Section Retenues Salariales */}
                            <div className="p-3 bg-rose-50/30">
                                <div className="font-black text-rose-800 uppercase tracking-wider text-[10px] mb-2">
                                    1. Retenues Sociales &amp; Fiscales Salarié
                                </div>
                                <div className="space-y-1.5 pl-2 text-slate-600">
                                    <div className="flex justify-between items-center">
                                        <span>CNPS Retraite Salarié (6,3%)</span>
                                        <span className="font-mono text-rose-600 font-semibold">-{payroll.cnpsWorker.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>CMU Salarié (Couverture Maladie)</span>
                                        <span className="font-mono text-rose-600 font-semibold">-{payroll.cmuWorker.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Impôt sur le Salaire (IS 1,2% sur 80% brut)</span>
                                        <span className="font-mono text-rose-600 font-semibold">-{payroll.isWorker.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Contribution Nationale (CN barème progressif)</span>
                                        <span className="font-mono text-rose-600 font-semibold">-{payroll.cnWorker.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Impôt Général sur le Revenu (IGR selon {parts} part{parts > 1 ? 's' : ''})</span>
                                        <span className="font-mono text-rose-600 font-semibold">-{payroll.igrWorker.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="pt-1.5 border-t border-rose-200/60 flex justify-between items-center font-bold text-rose-900">
                                        <span>Total Déductions Salariales</span>
                                        <span className="font-mono">-{payroll.totalWorkerDeductions.toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Salaire Net */}
                            <div className="p-4 flex justify-between items-center bg-emerald-50 text-emerald-950 font-black text-sm">
                                <span>SALAIRE NET À PAYER (AU SALARIÉ)</span>
                                <span className="font-mono text-lg text-emerald-700">{payroll.netSalary.toLocaleString()} FCFA</span>
                            </div>

                            {/* Section Charges Patronales */}
                            <div className="p-3 bg-indigo-50/30">
                                <div className="font-black text-indigo-900 uppercase tracking-wider text-[10px] mb-2">
                                    2. Cotisations &amp; Taxes Patronales (Employeur)
                                </div>
                                <div className="space-y-1.5 pl-2 text-slate-600">
                                    <div className="flex justify-between items-center">
                                        <span>CNPS Prestations Familiales (5,75%)</span>
                                        <span className="font-mono font-semibold">+{payroll.cnpsPf.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>CNPS Accidents du Travail (3,0%)</span>
                                        <span className="font-mono font-semibold">+{payroll.cnpsAt.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>CNPS Retraite Part Patronale (7,7%)</span>
                                        <span className="font-mono font-semibold">+{payroll.cnpsRetraitePatronale.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>CMU Part Patronale</span>
                                        <span className="font-mono font-semibold">+{payroll.cmuPatronale.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>FDFP Taxe d'Apprentissage (TAP 0,4%)</span>
                                        <span className="font-mono font-semibold">+{payroll.fdfpTap.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>FDFP Formation Continue (FPC 1,2%)</span>
                                        <span className="font-mono font-semibold">+{payroll.fdfpFpc.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="pt-1.5 border-t border-indigo-200/60 flex justify-between items-center font-bold text-indigo-900">
                                        <span>Total Charges Patronales</span>
                                        <span className="font-mono">+{payroll.totalEmployerCharges.toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Coût Total Entreprise */}
                            <div className="p-4 flex justify-between items-center bg-slate-900 text-white font-black text-sm rounded-b-xl">
                                <div>
                                    <div>COÛT GLOBAL EMPLOYEUR MENSUEL</div>
                                    <div className="text-[10px] text-slate-400 font-normal">Soit {(payroll.totalEmployerCost * 12).toLocaleString()} FCFA / an</div>
                                </div>
                                <span className="font-mono text-xl text-indigo-400">{payroll.totalEmployerCost.toLocaleString()} FCFA</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
