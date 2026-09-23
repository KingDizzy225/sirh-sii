import React, { useState, useEffect, useMemo } from 'react';
import { 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
    TrendingUp, Users, DollarSign, Clock, Briefcase, AlertTriangle, 
    ArrowUpRight, ArrowDownRight, PieChart as PieIcon, BarChart3, 
    Activity, BrainCircuit, Search, Sparkles, Send, Download, 
    ShieldCheck, Calendar, Award, UserCheck, CheckCircle2, ChevronRight,
    TrendingDown, FileSpreadsheet, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';
import { MOCK_190_EMPLOYEES } from '../constants/mockEmployees.js';
import jsPDF from 'jspdf';

// Palette pastel & moderne harmonisée avec le Dashboard
const PASTEL_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F43F5E', '#F59E0B', '#06B6D4'];

export function Analytics() {
    const [activeTab, setActiveTab] = useState('overview'); // overview, payroll, demographics, predictive
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [nlqResponse, setNlqResponse] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    // Calculs statistiques en temps réel basés sur les 190 collaborateurs + Julie Konan (191)
    const stats = useMemo(() => {
        const total = MOCK_190_EMPLOYEES.length + 1; // 191
        const females = MOCK_190_EMPLOYEES.filter(e => e.gender === 'Féminin').length + 1; // + Julie Konan
        const males = total - females;
        const femaleRatio = Math.round((females / total) * 100);
        const maleRatio = 100 - femaleRatio;

        // Répartition par département
        const deptMap = {};
        MOCK_190_EMPLOYEES.forEach(e => {
            const dept = e.department || 'Opérations Générales';
            deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        deptMap['Commercial & Relation Client'] = (deptMap['Commercial & Relation Client'] || 0) + 1; // Julie

        const deptData = Object.entries(deptMap).map(([name, count], i) => ({
            name: name.replace('Informatique & Systèmes d\'Information', 'Informatique & SI')
                      .replace('Commercial & Relation Client', 'Commercial & Vente')
                      .replace('Finance & Comptabilité', 'Finance & Compta')
                      .replace('Opérations & Logistique', 'Opérations')
                      .replace('Ressources Humaines', 'RH')
                      .replace('Juridique & Conformité', 'Juridique'),
            fullName: name,
            count,
            fill: PASTEL_COLORS[i % PASTEL_COLORS.length]
        })).sort((a, b) => b.count - a.count);

        // Pyramide des âges réelle calculée depuis les birthDate
        const nowYear = 2026;
        const ageGroups = {
            '-25': { ageGroup: '< 25 ans', male: 0, female: 0 },
            '25-34': { ageGroup: '25-34 ans', male: 0, female: 0 },
            '35-44': { ageGroup: '35-44 ans', male: 0, female: 0 },
            '45-54': { ageGroup: '45-54 ans', male: 0, female: 0 },
            '55+': { ageGroup: '55+ ans', male: 0, female: 0 },
        };

        // Julie Konan (1994 -> 32 ans -> 25-34)
        ageGroups['25-34'].female += 1;

        MOCK_190_EMPLOYEES.forEach(emp => {
            const birthYear = emp.birthDate ? parseInt(emp.birthDate.split('-')[0]) : 1992;
            const age = nowYear - birthYear;
            const isFem = emp.gender === 'Féminin';

            if (age < 25) {
                isFem ? ageGroups['-25'].female++ : ageGroups['-25'].male++;
            } else if (age <= 34) {
                isFem ? ageGroups['25-34'].female++ : ageGroups['25-34'].male++;
            } else if (age <= 44) {
                isFem ? ageGroups['35-44'].female++ : ageGroups['35-44'].male++;
            } else if (age <= 54) {
                isFem ? ageGroups['45-54'].female++ : ageGroups['45-54'].male++;
            } else {
                isFem ? ageGroups['55+'].female++ : ageGroups['55+'].male++;
            }
        });

        const agePyramid = Object.values(ageGroups);

        // Masse salariale mensuelle réaliste (FCFA)
        const monthlyPayroll = 148500000;
        const avgSalary = Math.round(monthlyPayroll / total);

        // Écart salarial par pôle (kFCFA)
        const genderPayGap = [
            { department: 'Informatique', male: 1150, female: 1110 },
            { department: 'Commercial', male: 840, female: 830 },
            { department: 'Finance', male: 980, female: 970 },
            { department: 'Opérations', male: 720, female: 710 },
            { department: 'RH', male: 790, female: 810 },
            { department: 'Juridique', male: 1250, female: 1220 }
        ];

        // Évolution de la masse salariale sur 6 mois
        const payrollTrend = [
            { month: 'Jan', masse: 142.0, charges: 31.2 },
            { month: 'Fév', masse: 143.5, charges: 31.5 },
            { month: 'Mar', masse: 145.0, charges: 31.9 },
            { month: 'Avr', masse: 146.2, charges: 32.1 },
            { month: 'Mai', masse: 147.5, charges: 32.4 },
            { month: 'Juin', masse: 148.5, charges: 32.6 }
        ];

        return {
            total,
            females,
            males,
            femaleRatio,
            maleRatio,
            deptData,
            agePyramid,
            monthlyPayroll,
            avgSalary,
            genderPayGap,
            payrollTrend,
            turnoverRate: 3.8,
            attendanceRate: 96.2,
            avgTenureYears: 3.4
        };
    }, []);

    // Traitement intelligent des requêtes en langage naturel (NLQ)
    const handleNLQSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);

        setTimeout(() => {
            const query = searchQuery.toLowerCase();
            let response = '';

            if (query.includes('effectif') || query.includes('combien') || query.includes('salarié') || query.includes('personne')) {
                response = `📊 **Effectif de l'entreprise** : Le SIRH dénombre actuellement **${stats.total} collaborateurs actifs** (190 collaborateurs en poste et 1 profil de démonstration). La croissance nette est de **+5%** par rapport au mois précédent.`;
            } else if (query.includes('femme') || query.includes('genre') || query.includes('parité') || query.includes('mixité') || query.includes('homme')) {
                response = `⚖️ **Parité & Mixité** : L'effectif compte **${stats.females} femmes (${stats.femaleRatio}%)** et **${stats.males} hommes (${stats.maleRatio}%)**. L'écart salarial moyen global est très faible (**-2.1%** en faveur des hommes), traduisant une excellente conformité d'équité salariale.`;
            } else if (query.includes('salaire') || query.includes('masse') || query.includes('paie') || query.includes('coût')) {
                response = `💰 **Masse Salariale** : La masse salariale brute globale pour Juin 2026 s'élève à **${(stats.monthlyPayroll / 1000000).toFixed(1)} millions FCFA** pour un salaire moyen de **${(stats.avgSalary).toLocaleString('fr-FR')} FCFA**. Le pôle Informatique & Systèmes d'Information représente la masse salariale unitaire la plus élevée.`;
            } else if (query.includes('département') || query.includes('pôle') || query.includes('équipe') || query.includes('service')) {
                response = `🏢 **Répartition des Départements** : Le premier département en termes d'effectif est **Commercial & Vente** (${stats.deptData[0]?.count} salariés), suivi de **Informatique & SI** (${stats.deptData[1]?.count} salariés) et **Opérations** (${stats.deptData[2]?.count} salariés).`;
            } else if (query.includes('turnover') || query.includes('départ') || query.includes('rétention') || query.includes('risque')) {
                response = `🔮 **Rétention & Turnover** : Le taux de turnover est remarquablement bas à **${stats.turnoverRate}%** (bien inférieur à la moyenne sectorielle de 8.5%). L'IA prédictive a toutefois identifié 3 collaborateurs à risque d'attrition modéré pour cause d'ancienneté au poste sans évolution.`;
            } else {
                response = `💡 **Synthèse Analytique** : Sur l'ensemble des **${stats.total} collaborateurs**, l'assiduité moyenne est de **${stats.attendanceRate}%**, le salaire moyen est de **${stats.avgSalary.toLocaleString('fr-FR')} FCFA** et l'indice de satisfaction interne atteint **4.2/5**.`;
            }

            setNlqResponse(response);
            setIsSearching(false);
            setSearchQuery('');
        }, 350);
    };

    // Téléchargement du Bilan Social PDF complet
    const handleDownloadBilanSocial = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(30, 41, 59);
        doc.text("BILAN SOCIAL D'ENTREPRISE - SII", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Période : Exercice 2026 | Date d'édition : ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
        doc.line(14, 32, 196, 32);

        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("1. Indicateurs d'Effectif & Démographie", 14, 42);

        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text(`• Effectif total au 30 Juin 2026 : ${stats.total} salariés`, 18, 50);
        doc.text(`• Répartition Hommes / Femmes : ${stats.males} Hommes (${stats.maleRatio}%) | ${stats.females} Femmes (${stats.femaleRatio}%)`, 18, 57);
        doc.text(`• Ancienneté moyenne globale : ${stats.avgTenureYears} ans`, 18, 64);
        doc.text(`• Taux de turnover annuel : ${stats.turnoverRate}%`, 18, 71);
        doc.text(`• Taux de présentéisme moyen : ${stats.attendanceRate}%`, 18, 78);

        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("2. Données Financières & Masse Salariale", 14, 92);

        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text(`• Masse salariale mensuelle brute : ${(stats.monthlyPayroll).toLocaleString('fr-FR')} FCFA`, 18, 100);
        doc.text(`• Salaire brut moyen : ${stats.avgSalary.toLocaleString('fr-FR')} FCFA`, 18, 107);
        doc.text(`• Cotisations CNPS et charges sociales mensuelles : ~32 600 000 FCFA`, 18, 114);

        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("3. Répartition par Pôle Opérationnel", 14, 128);

        let y = 136;
        stats.deptData.forEach(d => {
            doc.text(`• ${d.fullName} : ${d.count} collaborateurs (${Math.round((d.count / stats.total) * 100)}%)`, 18, y);
            y += 7;
        });

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Document certifié conforme - Direction des Ressources Humaines SII", 14, 280);

        doc.save(`Bilan_Social_SII_${new Date().getFullYear()}.pdf`);
        showNotification("Bilan Social PDF téléchargé avec succès !");
    };

    return (
        <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold"
                    >
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER HARMONISÉ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Activity className="text-blue-600" size={28} />
                        HR Analytics Hub
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">
                        Indicateurs Clés & Décisions Stratégiques sur l'ensemble des 190 collaborateurs
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadBilanSocial}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                        <Download size={16} className="text-blue-600" />
                        Bilan Social Légal (PDF)
                    </button>
                    <div className="hidden lg:flex items-center gap-2 bg-blue-50/80 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                        <Sparkles size={14} />
                        Données synchronisées (191 profils)
                    </div>
                </div>
            </div>

            {/* NLQ SEARCH BAR AVEC SUGGESTIONS INTELLIGENTES */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-xs">
                <form onSubmit={handleNLQSubmit} className="flex items-center gap-2">
                    <Search className="text-slate-400 ml-2" size={18} />
                    <input 
                        type="text" 
                        placeholder="Posez une question sur vos 190 collaborateurs (ex: parité hommes-femmes, masse salariale, pyramide des âges...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button 
                        type="submit" 
                        disabled={isSearching}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSearching ? <span className="animate-pulse">Analyse...</span> : <><Send size={14} /> Analyser</>}
                    </button>
                </form>

                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-50 text-[11px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Suggestions :</span>
                    {[
                        "Effectif global et départements",
                        "Parité femmes-hommes",
                        "Masse salariale mensuelle",
                        "Risques de turnover IA"
                    ].map((sug, i) => (
                        <button
                            key={i}
                            onClick={() => { setSearchQuery(sug); }}
                            className="bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100 font-medium transition-colors"
                        >
                            {sug}
                        </button>
                    ))}
                </div>

                {/* Réponse NLQ */}
                <AnimatePresence>
                    {nlqResponse && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100/80 rounded-xl text-xs text-slate-700 leading-relaxed relative"
                        >
                            <button
                                onClick={() => setNlqResponse(null)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-0.5"
                            >
                                ✕
                            </button>
                            <p className="font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                                <Sparkles size={14} className="text-blue-600" />
                                Réponse de l'Assistant Analytique RH :
                            </p>
                            <p>{nlqResponse}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 4 CARTES KPI PASTEL HARMONISÉES AVEC LE DASHBOARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Effectif Total */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
                        <Users size={20} />
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600">Effectif Total Actif</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                            <span>▲</span> +5.2% <span className="text-slate-500 font-normal">vs. N-1</span>
                        </p>
                    </div>
                </motion.div>

                {/* 2. Masse Salariale Mensuelle */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <DollarSign size={20} />
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600">Masse Salariale Brute</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">
                            {(stats.monthlyPayroll / 1000000).toFixed(1)} <span className="text-lg font-bold text-slate-700">M FCFA</span>
                        </p>
                        <p className="text-xs font-semibold text-slate-600 mt-2 flex items-center gap-1">
                            Moyenne : <span className="font-bold text-slate-900">{(stats.avgSalary).toLocaleString('fr-FR')} FCFA</span>
                        </p>
                    </div>
                </motion.div>

                {/* 3. Taux de Turnover */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-[#FFF1F2] border border-[#FFE4E6] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                        <TrendingDown size={20} />
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600">Taux de Turnover</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stats.turnoverRate}%</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                            <span>▼</span> -1.2% <span className="text-slate-500 font-normal">Stabilité forte</span>
                        </p>
                    </div>
                </motion.div>

                {/* 4. Taux de Présentéisme */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#F5F3FF] border border-[#EDE9FE] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs">
                        <Calendar size={20} />
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600">Taux de Présence</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stats.attendanceRate}%</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                            <span>▲</span> +0.8% <span className="text-slate-500 font-normal">Assiduité optimale</span>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ONGLETS DE NAVIGATION MODERNE */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
                {[
                    { id: 'overview', label: 'Vue d\'ensemble & Pôles' },
                    { id: 'demographics', label: 'Pyramide & Parité H/F' },
                    { id: 'payroll', label: 'Masse Salariale & Écarts' },
                    { id: 'predictive', label: 'Sentinelle IA & Rétention' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENU DE L'ONGLET ACTIF */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        {/* Répartition par Pôle */}
                        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                            <h3 className="font-bold text-slate-800 text-base mb-1">
                                Répartition des Effectifs par Pôle (191 collaborateurs)
                            </h3>
                            <p className="text-xs text-slate-400 mb-4">Effectifs actuels consolidés en direct</p>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.deptData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                            {stats.deptData.map((entry, index) => (
                                                <Cell key={`bar-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Parité Hommes / Femmes (Donut) */}
                        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base mb-1">
                                    Index Égalité & Parité Professionnelle
                                </h3>
                                <p className="text-xs text-slate-400 mb-2">Répartition genre sur les 191 salariés</p>
                            </div>

                            <div className="relative h-[200px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Femmes', value: stats.females, color: '#EC4899' },
                                                { name: 'Hommes', value: stats.males, color: '#3B82F6' }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={78}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            <Cell fill="#EC4899" />
                                            <Cell fill="#3B82F6" />
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Parité F/H</span>
                                    <span className="text-xl font-black text-slate-800 leading-tight">
                                        {stats.femaleRatio}% / {stats.maleRatio}%
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50 text-xs">
                                <div className="flex items-center gap-2 p-2 bg-pink-50/60 rounded-xl border border-pink-100">
                                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                                    <div>
                                        <p className="font-bold text-slate-800">{stats.females} Femmes</p>
                                        <p className="text-[10px] text-slate-500">{stats.femaleRatio}% de l'effectif</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-blue-50/60 rounded-xl border border-blue-100">
                                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                                    <div>
                                        <p className="font-bold text-slate-800">{stats.males} Hommes</p>
                                        <p className="text-[10px] text-slate-500">{stats.maleRatio}% de l'effectif</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'demographics' && (
                    <motion.div
                        key="demographics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        {/* Pyramide des Âges */}
                        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                            <h3 className="font-bold text-slate-800 text-base mb-1">
                                Pyramide des Âges Consolidée (Calcul Réel)
                            </h3>
                            <p className="text-xs text-slate-400 mb-4">Distribution par tranche d'âge et genre</p>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.agePyramid} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="ageGroup" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                        <Bar dataKey="male" name="Hommes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="female" name="Femmes" fill="#EC4899" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Ancienneté & Stabilité */}
                        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base mb-1">Ancienneté & Fidélisation</h3>
                                <p className="text-xs text-slate-400 mb-4">Durée de présence dans l'entreprise</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-slate-600">&lt; 1 an (Nouvelles recrues)</span>
                                        <span className="text-slate-900">22% (42 salariés)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '22%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-slate-600">1 à 3 ans</span>
                                        <span className="text-slate-900">45% (86 salariés)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-slate-600">3 à 5 ans</span>
                                        <span className="text-slate-900">23% (44 salariés)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '23%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-slate-600">5 ans et plus (Piliers)</span>
                                        <span className="text-slate-900">10% (19 salariés)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '10%' }} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 mt-4">
                                💡 <strong>Ancienneté moyenne :</strong> {stats.avgTenureYears} ans. Un équilibre sain entre renouvellement et capitalisation des compétences.
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'payroll' && (
                    <motion.div
                        key="payroll"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        {/* Évolution Masse Salariale */}
                        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                            <h3 className="font-bold text-slate-800 text-base mb-1">
                                Évolution de la Masse Salariale (6 Derniers Mois)
                            </h3>
                            <p className="text-xs text-slate-400 mb-4">Salaires bruts vs Cotisations sociales (M FCFA)</p>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.payrollTrend} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 160]} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                        <Area type="monotone" dataKey="masse" name="Masse Salariale Brute" stroke="#3B82F6" fill="#EFF6FF" strokeWidth={2.5} />
                                        <Area type="monotone" dataKey="charges" name="Charges Patronales" stroke="#8B5CF6" fill="#F5F3FF" strokeWidth={2.5} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Écart Salarial H/F */}
                        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                            <h3 className="font-bold text-slate-800 text-base mb-1">
                                Écart de Rémunération H/F (kFCFA / mois)
                            </h3>
                            <p className="text-xs text-slate-400 mb-4">Analyse de parité par direction métier</p>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.genderPayGap} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                        <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                                        <Bar dataKey="male" name="Hommes" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="female" name="Femmes" fill="#EC4899" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'predictive' && (
                    <motion.div
                        key="predictive"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
                            <div className="flex items-center gap-3 mb-2">
                                <BrainCircuit className="text-amber-400" size={24} />
                                <h3 className="text-lg font-bold">Sentinelle IA : Détection Précoce d'Attrition</h3>
                            </div>
                            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                                Le moteur d'intelligence artificielle analyse en continu 14 paramètres comportementaux et RH (charge de travail, ancienneté au poste, congés non pris, participations aux formations) pour alerter les RH avant la démission.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    name: 'Kouassi Armand',
                                    role: 'Directeur Commercial',
                                    dept: 'Commercial & Relation Client',
                                    risk: 'Moyen',
                                    riskColor: 'bg-amber-100 text-amber-800 border-amber-200',
                                    score: '42%',
                                    factor: 'Solde de 28j de congés non pris et sursollicitation projet depuis 4 mois.',
                                    action: 'Proposer un aménagement du temps de travail et un entretien de fidélisation.'
                                },
                                {
                                    name: 'Mamadou Traoré',
                                    role: 'Développeur Mobile Flutter',
                                    dept: 'Informatique & SI',
                                    risk: 'Faible',
                                    riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                                    score: '18%',
                                    factor: 'Excellente intégration et participation active aux guildes techniques.',
                                    action: 'Maintenir la trajectoire d\'évolution vers le rôle de Lead Développeur.'
                                },
                                {
                                    name: 'Aïssatou Diallo',
                                    role: 'Contrôleur de Gestion',
                                    dept: 'Finance & Comptabilité',
                                    risk: 'Moyen',
                                    riskColor: 'bg-amber-100 text-amber-800 border-amber-200',
                                    score: '38%',
                                    factor: 'Ancienneté de 3 ans sur le même grade sans revalorisation récente.',
                                    action: 'Étudier une revalorisation au titre de la campagne d\'augmentations Q3.'
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                                <p className="text-xs text-slate-500">{item.role}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.riskColor}`}>
                                                Risque {item.risk} ({item.score})
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                                            <strong>Cause détectée :</strong> {item.factor}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-50">
                                        <p className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                                            <Sparkles size={12} /> Recommandation IA :
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{item.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
