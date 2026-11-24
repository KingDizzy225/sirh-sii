import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
    Calculator, TrendingUp, Users, PiggyBank, BarChart, 
    ArrowRight, PieChart, AlertCircle, Info, CheckCircle2,
    Download, RefreshCw, Sparkles, Scale, Sliders, DollarSign,
    Building2, ShieldCheck, FileText
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

export function PayrollSimulation() {
    const totalEmployees = 191;

    // Simulation Sliders State
    const [increasePct, setIncreasePct] = useState(4.5);
    const [transportBonus, setTransportBonus] = useState(15000); // Revalorisation transport mensuelle
    const [newHiresCount, setNewHiresCount] = useState(8); // Nouveaux recrutements nets
    const [performancePoolMillions, setPerformancePoolMillions] = useState(25); // Enveloppe primes en Millions FCFA
    const [selectedDept, setSelectedDept] = useState('TOUS');
    const [notification, setNotification] = useState(null);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3500);
    };

    // Base actual salary mass for 191 employees: ~142.85 Millions FCFA / month (approx 748 000 FCFA gross avg)
    const baseMonthlyGross = 142850000;
    const baseAnnualGross = baseMonthlyGross * 12;

    // Calculs de charges patronales selon le barème de Côte d'Ivoire :
    // - CNPS Prestations Familiales : 5.75%
    // - CNPS Accident du Travail : 2.0% (taux moyen secteur tertiaire/bancaire)
    // - CNPS Caisse Nationale de Retraite : 7.7%
    // - FDFP Taxe d'Apprentissage : 0.4%
    // - FDFP Taxe Formation Continue : 0.6%
    // Total charges patronales légales = 16.45%
    const PATRONAL_RATE = 0.1645;

    // Simulations dynamiques
    const simulatedMonthlyGross = useMemo(() => {
        // Base augmentée du pourcentage
        const grossAfterIncrease = baseMonthlyGross * (1 + increasePct / 100);
        // Ajout indemnité transport
        const totalTransportImpact = totalEmployees * transportBonus;
        // Ajout nouveaux recrutements (salaire moyen estimé à 700 000 FCFA brut)
        const hiresGross = newHiresCount * 700000;

        return Math.round(grossAfterIncrease + totalTransportImpact + hiresGross);
    }, [increasePct, transportBonus, newHiresCount]);

    const monthlyGrossDifference = simulatedMonthlyGross - baseMonthlyGross;

    const baseMonthlyPatronal = Math.round(baseMonthlyGross * PATRONAL_RATE);
    const simulatedMonthlyPatronal = Math.round(simulatedMonthlyGross * PATRONAL_RATE);
    const monthlyPatronalDifference = simulatedMonthlyPatronal - baseMonthlyPatronal;

    const simulatedAnnualGross = simulatedMonthlyGross * 12;
    const performancePoolFCFA = performancePoolMillions * 1000000;
    const totalSimulatedAnnualCost = Math.round(
        (simulatedMonthlyGross + simulatedMonthlyPatronal) * 12 + performancePoolFCFA
    );
    const currentAnnualCost = Math.round((baseMonthlyGross + baseMonthlyPatronal) * 12);
    const annualDifference = totalSimulatedAnnualCost - currentAnnualCost;
    const growthPercent = ((annualDifference / currentAnnualCost) * 100).toFixed(1);

    // Données par Pôle Métier pour le graphique comparatif
    const departmentComparisonData = [
        {
            dept: 'Opérations & Agences',
            effectif: 72,
            actuel: 52.4, // en Millions FCFA
            simule: Number((52.4 * (1 + increasePct / 100) + (72 * transportBonus + Math.round(newHiresCount * 0.4) * 700000) / 1000000).toFixed(2))
        },
        {
            dept: 'Banque d\'Affaires & Commercial',
            effectif: 54,
            actuel: 48.2,
            simule: Number((48.2 * (1 + increasePct / 100) + (54 * transportBonus + Math.round(newHiresCount * 0.3) * 700000) / 1000000).toFixed(2))
        },
        {
            dept: 'Systèmes & IT / Digital',
            effectif: 38,
            actuel: 26.8,
            simule: Number((26.8 * (1 + increasePct / 100) + (38 * transportBonus + Math.round(newHiresCount * 0.2) * 700000) / 1000000).toFixed(2))
        },
        {
            dept: 'Finance, Juridique & RH',
            effectif: 27,
            actuel: 15.45,
            simule: Number((15.45 * (1 + increasePct / 100) + (27 * transportBonus + Math.round(newHiresCount * 0.1) * 700000) / 1000000).toFixed(2))
        }
    ];

    // Projection de trésorerie sur 12 mois
    const monthlyProjectionData = [
        { mois: 'Jan', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Fév', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Mar', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Avr', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Mai', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Juin', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Juil', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Août', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Sept', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Oct', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { mois: 'Nov', actuel: 166.3, simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal) / 1000000).toFixed(1)) },
        { 
            mois: 'Déc', 
            actuel: 181.3, // inclut prime N-1
            simule: Number(((simulatedMonthlyGross + simulatedMonthlyPatronal + performancePoolFCFA) / 1000000).toFixed(1)) 
        }
    ];

    // Synthèse par CSP (Catégorie Socio-Professionnelle)
    const cspTable = [
        { csp: 'Cadres Dirigeants & Membres CODIR', effectif: 8, brutMoyen: '2 850 000 FCFA', partMasse: '16.0%' },
        { csp: 'Cadres Supérieurs & Chefs de Pôle', effectif: 42, brutMoyen: '1 250 000 FCFA', partMasse: '36.8%' },
        { csp: 'Cadres Moyens & Spécialistes Métier', effectif: 85, brutMoyen: '680 000 FCFA', partMasse: '40.5%' },
        { csp: 'Agents de Maîtrise & Opérationnels', effectif: 56, brutMoyen: '380 000 FCFA', partMasse: '6.7%' }
    ];

    const resetScenario = () => {
        setIncreasePct(4.5);
        setTransportBonus(15000);
        setNewHiresCount(8);
        setPerformancePoolMillions(25);
        showNotification("Scénario réinitialisé aux valeurs de référence.");
    };

    return (
        <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium">{notification}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Pilotage Financier RH • Modélisation What-If
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            Simulateur de Masse Salariale & Arbitrage Budgétaire
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">
                        Anticipez en temps réel l'impact financier des augmentations, indemnités et recrutements sur les 191 collaborateurs et cotisations CNPS/FDFP.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={resetScenario}
                        className="rounded-xl gap-2 text-slate-700 font-semibold text-xs border-slate-200 bg-white"
                    >
                        <RefreshCw size={14} /> Réinitialiser
                    </Button>
                    <Button
                        onClick={() => showNotification("Rapport de simulation financière CODIR exporté en PDF.")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs gap-2 font-semibold text-xs"
                    >
                        <Download size={14} /> Exporter Rapport CODIR (PDF)
                    </Button>
                </div>
            </div>

            {/* 4 Pastel KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1 : Masse Salariale Brute Actuelle */}
                <div className="bg-emerald-50/70 border border-emerald-100/80 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Masse Brute Actuelle
                        </span>
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                            <PiggyBank className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            {(baseMonthlyGross / 1000000).toFixed(2)} M
                        </span>
                        <span className="text-xs text-slate-500">FCFA / mois</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">191 collaborateurs au 23 Sept 2026</p>
                </div>

                {/* KPI 2 : Masse Salariale Brute Simulée */}
                <div className="bg-blue-50/70 border border-blue-100/80 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Masse Brute Simulée
                        </span>
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            {(simulatedMonthlyGross / 1000000).toFixed(2)} M
                        </span>
                        <span className="text-xs text-blue-600 font-bold">
                            +{((monthlyGrossDifference / baseMonthlyGross) * 100).toFixed(1)}%
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Delta : +{(monthlyGrossDifference / 1000000).toFixed(2)} M FCFA / mois
                    </p>
                </div>

                {/* KPI 3 : Charges Sociales Patronales */}
                <div className="bg-purple-50/70 border border-purple-100/80 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                            Cotisations CNPS + FDFP
                        </span>
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                            <Scale className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            {(simulatedMonthlyPatronal / 1000000).toFixed(2)} M
                        </span>
                        <span className="text-xs text-slate-500">FCFA / mois</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Taux patronal moyen : 16.45% (CI)</p>
                </div>

                {/* KPI 4 : Coût Employeur Global Annuel */}
                <div className="bg-rose-50/70 border border-rose-100/80 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                            Coût Global Employeur / An
                        </span>
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            {(totalSimulatedAnnualCost / 1000000000).toFixed(3)} Md
                        </span>
                        <span className="text-xs text-rose-600 font-bold">+{growthPercent}%</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Inclus {performancePoolMillions} M FCFA de primes
                    </p>
                </div>

            </div>

            {/* Main Interactive Sandbox Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Interactive Parametric Controls */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Sliders className="text-indigo-600" size={18} />
                            <h3 className="font-bold text-slate-900 text-base">Leviers de Simulation</h3>
                        </div>
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold text-[11px]">
                            Temps Réel
                        </Badge>
                    </div>

                    {/* Slider 1: Augmentation collective */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">Augmentation Collective Générale</span>
                            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                +{increasePct}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="15"
                            step="0.5"
                            value={increasePct}
                            onChange={(e) => setIncreasePct(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>0% (Gel salarial)</span>
                            <span>7.5%</span>
                            <span>15% (Revalorisation forte)</span>
                        </div>
                    </div>

                    {/* Slider 2: Revalorisation indemnité transport */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">Indemnité Transport Additionnelle</span>
                            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                +{transportBonus.toLocaleString()} FCFA / mois
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50000"
                            step="5000"
                            value={transportBonus}
                            onChange={(e) => setTransportBonus(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>0 FCFA</span>
                            <span>25 000 FCFA</span>
                            <span>50 000 FCFA</span>
                        </div>
                    </div>

                    {/* Slider 3: Recrutements nets prévus */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">Recrutements Nets Prévus</span>
                            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                +{newHiresCount} collaborateurs
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="25"
                            step="1"
                            value={newHiresCount}
                            onChange={(e) => setNewHiresCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>0 recrutement</span>
                            <span>12 postes</span>
                            <span>25 postes</span>
                        </div>
                    </div>

                    {/* Slider 4: Enveloppe de primes de fin d'année */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">Enveloppe Primes & Gratification</span>
                            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                {performancePoolMillions} Millions FCFA
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="60"
                            step="5"
                            value={performancePoolMillions}
                            onChange={(e) => setPerformancePoolMillions(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>0 M</span>
                            <span>30 M</span>
                            <span>60 M FCFA</span>
                        </div>
                    </div>

                    {/* Impact Summary Box */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Synthèse de l'Arbitrage
                        </span>
                        <div className="flex justify-between text-slate-600">
                            <span>Surcoût brut mensuel :</span>
                            <span className="font-bold text-slate-900">+{(monthlyGrossDifference / 1000000).toFixed(2)} M FCFA</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Surcoût patronal (CNPS/FDFP) :</span>
                            <span className="font-bold text-slate-900">+{(monthlyPatronalDifference / 1000000).toFixed(2)} M FCFA</span>
                        </div>
                        <div className="flex justify-between text-indigo-900 font-extrabold pt-2 border-t border-slate-200">
                            <span>Total Surcoût Annuel :</span>
                            <span className="text-sm">+{(annualDifference / 1000000).toFixed(2)} M FCFA</span>
                        </div>
                    </div>
                </div>

                {/* Right Area (2 columns): Dynamic Graphics & Projection */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* BarChart: Comparatif Avant vs Après par Pôle */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    Répartition de la Masse Salariale par Pôle Métier (en Millions FCFA)
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Comparatif Avant (Base 2026) vs Après Simulation
                                </p>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ReBarChart data={departmentComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(val) => [`${val} M FCFA`, '']}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                    <Bar dataKey="actuel" name="Masse Actuelle" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="simule" name="Masse Simulée" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                                </ReBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* LineChart: Projection de Trésorerie sur 12 Mois */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    Courbe de Trésorerie Prévisionnelle sur 12 Mois (Charges Incluses)
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Modélisation mensuelle intégrant le versement des primes au mois de Décembre
                                </p>
                            </div>
                        </div>

                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyProjectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSimule" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(val) => [`${val} M FCFA`, 'Coût Employeur']}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                                    />
                                    <Area type="monotone" dataKey="simule" name="Coût Simulé" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSimule)" />
                                    <Line type="monotone" dataKey="actuel" name="Budget Antérieur" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

            </div>

            {/* Table Breakdown by Socio-Professional Category */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="text-indigo-600" size={18} />
                        <h3 className="font-bold text-slate-900 text-base">
                            Structure de la Masse Salariale par Catégorie Socioprofessionnelle (CSP)
                        </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">191 collaborateurs modélisés</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                                <th className="py-2.5 px-3">Catégorie Socioprofessionnelle</th>
                                <th className="py-2.5 px-3">Effectif Actuel</th>
                                <th className="py-2.5 px-3">Salaire Brut Moyen (Base)</th>
                                <th className="py-2.5 px-3">Salaire Brut Moyen (Après Simulation)</th>
                                <th className="py-2.5 px-3">Part dans la Masse</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {cspTable.map((row, idx) => {
                                const baseVal = parseInt(row.brutMoyen.replace(/\s/g, '').replace('FCFA', ''));
                                const simVal = Math.round(baseVal * (1 + increasePct / 100) + transportBonus);
                                return (
                                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 px-3 font-bold text-slate-900">{row.csp}</td>
                                        <td className="py-3 px-3 text-slate-700">{row.effectif} collaborateurs</td>
                                        <td className="py-3 px-3 text-slate-500">{row.brutMoyen}</td>
                                        <td className="py-3 px-3 font-bold text-indigo-600">
                                            {simVal.toLocaleString('fr-FR')} FCFA
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 text-[10px]">
                                                {row.partMasse}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Strategic CODIR Takeaways Box */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 border border-indigo-100 rounded-2xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-indigo-950 font-bold">
                    <Sparkles className="text-indigo-600" size={20} />
                    <span>Recommandations d'Arbitrage pour le Conseil d'Administration</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                        <span className="font-bold text-slate-900 block">1. Ratio Masse Salariale / PNB</span>
                        <p className="text-slate-500 leading-relaxed">
                            Le ratio reste soutenable à <strong>31.2% du Produit Net Bancaire</strong>, bien en deçà du seuil d'alerte prudentiel bancaire fixé à 38%.
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                        <span className="font-bold text-slate-900 block">2. Optimisation FDFP</span>
                        <p className="text-slate-500 leading-relaxed">
                            Avec l'augmentation de la masse, le crédit d'impôt formation FDFP s'élève à <strong>17.1 M FCFA</strong>, finançant 100% des certifications prévues.
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                        <span className="font-bold text-slate-900 block">3. Revalorisation Transport</span>
                        <p className="text-slate-500 leading-relaxed">
                            L'indemnité transport de <strong>+{transportBonus.toLocaleString()} FCFA</strong> est exonérée d'impôt sur le salaire et de cotisations CNPS, maximisant le pouvoir d'achat net.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default PayrollSimulation;
