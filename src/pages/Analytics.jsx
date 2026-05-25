import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
    TrendingUp, Users, DollarSign, Clock, Briefcase, AlertTriangle, ArrowUpRight, ArrowDownRight,
    PieChart as PieIcon, BarChart3, Activity, BrainCircuit, Search, Sparkles, Send, Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';

// Refined Palette aligned with our new CSS variables
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

export function Analytics() {
    const [data, setData] = useState(null);
    const [predictiveData, setPredictiveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // NLQ State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [nlqResponse, setNlqResponse] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/dashboard');
                
                if (res.data && res.data.stats && res.data.charts) {
                    setData(res.data);
                } else {
                    // Fallback local if api.js returned the generic mock
                    setData({
                        stats: {
                            totalEmployees: 150, activeEmployees: 142, globalTurnover: 4.2, 
                            absenceRate: 2.1, payrollCount: 142, avgNetSalary: 450000, totalNetSalary: 63900000
                        },
                        charts: {
                            turnoverByDept: [{name: 'Tech', rate: 4}, {name: 'RH', rate: 2}],
                            salaryByDept: [{name: 'Tech', Moyenne: 500000, Total: 20000000}],
                            contractTypes: [{name: 'CDI', value: 120}, {name: 'CDD', value: 22}],
                            monthlyFlux: [{month: 'Jan', Entrées: 5, Départs: 2}],
                            agePyramidData: [{ageGroup: '26-35', male: -35, female: 40}],
                            genderPayGapData: [{department: 'Tech', male: 500, female: 480}],
                            seniorityData: [{name: '1-3 ans', value: 45}]
                        }
                    });
                }

                try {
                    const predRes = await api.get('/analytics/predictive');
                    if (predRes.data && Array.isArray(predRes.data)) {
                        setPredictiveData(predRes.data);
                    }
                } catch (e) {
                    console.warn("Predictive API failed:", e);
                }

            } catch (err) {
                console.error("Analytics load error:", err);
                setError(err.message || "Erreur de connexion au serveur");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const handleNLQSubmit = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setNlqResponse(null);
        
        try {
            // Option 1 : Tenter d'utiliser l'API NLP Gemini (notre Concept 2) si elle est configurée
            const res = await api.post('/chat', { message: searchQuery });
            if (res.data && res.data.response) {
                setNlqResponse(res.data.response);
            } else {
                throw new Error("Fallback to mock");
            }
        } catch (error) {
            // Option 2 : Fallback local riche si le vrai endpoint NLP n'est pas dispo
            setTimeout(() => {
                let mockResponse = "L'IA analyse vos données RH actuelles... Aucune corrélation critique n'a été détectée.";
                const lowerQuery = searchQuery.toLowerCase();
                
                if (lowerQuery.includes("départ") || lowerQuery.includes("turnover") || lowerQuery.includes("risque")) {
                    mockResponse = "📊 **Analyse Prédictive (Modèle IA)** :\n\n- **Risque Global** : Le risque de départ est modéré (+1.2% ce mois-ci).\n- **Département Critique** : L'équipe Technique affiche une probabilité de départ de 25% (cause principale identifiée : stagnation salariale).\n- **Recommandation** : Envisager une révision des primes de rétention pour les profils Tech Seniors.";
                } else if (lowerQuery.includes("équité") || lowerQuery.includes("salaire") || lowerQuery.includes("salariale")) {
                    mockResponse = "💰 **Analyse de l'Équité Salariale** :\n\n- L'écart global hommes-femmes est actuellement de **4.1%** à l'avantage des hommes.\n- Cet écart s'est réduit de 0.5% depuis le trimestre dernier.\n- **Action requise** : Une enveloppe de rattrapage de 1.2M FCFA serait nécessaire pour atteindre la parité parfaite dans le département RH.";
                } else if (lowerQuery.includes("effectif") || lowerQuery.includes("évolution")) {
                    mockResponse = "📈 **Évolution des Effectifs** :\n\n- **Tendance** : Croissance nette positive. +12 recrutements prévus d'ici la fin d'année.\n- Le délai moyen d'embauche est descendu à 18 jours (très performant).";
                }
                
                setNlqResponse(mockResponse);
            }, 1500);
        } finally {
            setTimeout(() => setIsSearching(false), 1500); // sync with fallback timeout
            setSearchQuery('');
        }
    };

    if (loading) return (
        <div className="flex-1 p-8 flex justify-center items-center h-[calc(100vh-4rem)]">
            <span className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
        </div>
    );

    if (error) return <div className="p-8 text-rose-500 font-bold bg-rose-50 rounded-xl m-8 border border-rose-200">Erreur critique: {error}</div>;

    const { stats, charts } = data;

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const StatCard = ({ title, value, icon: Icon, description, trend, trendValue, color }) => {
        const colorStyles = {
            blue: 'text-blue-600 bg-blue-100',
            indigo: 'text-indigo-600 bg-indigo-100',
            amber: 'text-amber-600 bg-amber-100',
            emerald: 'text-emerald-600 bg-emerald-100',
        };
        const bgIconColor = {
            blue: 'text-blue-500', indigo: 'text-indigo-500', amber: 'text-amber-500', emerald: 'text-emerald-500'
        };

        return (
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                <Card className="glass-panel h-full rounded-3xl border-0 overflow-hidden relative group">
                    <div className={`absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:scale-110 group-hover:rotate-12 ${bgIconColor[color]}`}>
                        <Icon size={120} />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-2xl shadow-inner ${colorStyles[color]}`}>
                                <Icon size={24} />
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                        </div>
                        <div className="flex items-end justify-between relative z-10">
                            <div>
                                <h3 className="text-4xl font-extrabold text-slate-900 font-['Outfit']">{value}</h3>
                                <p className="text-xs text-slate-400 mt-2 font-medium">{description}</p>
                            </div>
                            {trend && (
                                <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-xl shadow-sm ${trend === 'up' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                    {trend === 'up' ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                                    {trendValue}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 bg-slate-50/50 min-h-[calc(100vh-4rem)] overflow-x-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute top-[30%] left-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-8">
                
                {/* Header & Tabs */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3 font-['Outfit']">
                            <Activity className="text-primary" size={36} />
                            HR <span className="text-gradient">Analytics</span> Hub
                        </h2>
                        <p className="text-slate-500 font-medium text-lg mt-2 flex items-center gap-2">
                            <Sparkles className="text-amber-400" size={18}/> Pilotage stratégique et insights prédictifs.
                        </p>
                    </div>
                    <div className="flex bg-white/70 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/40">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100/50'}`}
                        >
                            Vue d'ensemble
                        </button>
                        <button 
                            onClick={() => setActiveTab('predictive')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'predictive' ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30' : 'text-slate-600 hover:bg-slate-100/50'}`}
                        >
                            <BrainCircuit size={18} />
                            IA Prédictive
                        </button>
                    </div>
                </motion.div>

                {/* Natural Language Querying (NLQ) Bar */}
                <motion.div variants={itemVariants}>
                    <div className="glass-panel rounded-3xl p-2 relative overflow-hidden flex flex-col md:flex-row items-center gap-2 shadow-lg group focus-within:shadow-primary/20 transition-all border border-white/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <div className="pl-4 text-primary relative z-10 hidden md:block">
                            <Sparkles size={24} />
                        </div>
                        <form onSubmit={handleNLQSubmit} className="flex-1 w-full flex items-center relative z-10 bg-white rounded-2xl shadow-sm border border-slate-100 p-1">
                            <Search className="ml-4 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Posez une question à l'IA sur vos données RH..."
                                className="w-full bg-transparent border-none focus:ring-0 text-slate-700 py-3 px-4 font-medium outline-none placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" disabled={isSearching} className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 font-bold">
                                {isSearching ? <span className="animate-pulse">Analyse...</span> : <><Send size={18} /> <span className="hidden md:inline">Demander</span></>}
                            </button>
                        </form>
                    </div>
                    {/* NLQ Suggestions */}
                    <div className="flex flex-wrap gap-2 mt-4 ml-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Suggestions AI :</span>
                        {["Prédire le risque de départ", "Analyser l'équité salariale", "Évolution des effectifs"].map((prompt, i) => (
                            <button 
                                key={i} 
                                onClick={() => setSearchQuery(prompt)}
                                className="text-xs font-bold bg-white/60 hover:bg-white text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-all hover:border-primary/30 hover:text-primary"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    {/* Affichage Réponse IA */}
                    <AnimatePresence>
                        {nlqResponse && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20, height: 0 }} 
                                animate={{ opacity: 1, y: 0, height: 'auto' }} 
                                exit={{ opacity: 0, y: -20, height: 0 }}
                                className="mt-6 glass-panel rounded-3xl overflow-hidden border border-indigo-100 shadow-xl relative"
                            >
                                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                                <div className="p-6 md:p-8 ml-2 flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                                            <BrainCircuit size={24} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-800 mb-3 font-['Outfit']">Résultat de l'analyse IA</h3>
                                        <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                            {nlqResponse.split('**').map((part, index) => 
                                                index % 2 === 1 ? <strong key={index} className="text-slate-900 font-bold">{part}</strong> : part
                                            )}
                                        </div>
                                        <div className="mt-6 flex justify-end">
                                            <button 
                                                onClick={() => setNlqResponse(null)}
                                                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
                                            >
                                                Fermer l'analyse
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' ? (
                        <motion.div 
                            key="overview"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Effectif Total" value={stats.activeEmployees} icon={Users} description="Collaborateurs actifs" trend="up" trendValue="+4%" color="blue" />
                                <StatCard title="Turnover" value={`${stats.globalTurnover}%`} icon={Activity} description="Taux de rotation annuel" trend="down" trendValue="-2.1%" color="indigo" />
                                <StatCard title="Absentéisme" value={`${stats.absenceRate}%`} icon={Clock} description="Taux ce mois-ci" color="amber" />
                                <StatCard title="Masse Salariale" value={`${(stats.totalNetSalary / 1000000).toFixed(1)}M`} icon={DollarSign} description="Net versé ce mois (FCFA)" trend="up" trendValue="+1.2%" color="emerald" />
                            </div>

                            {/* Main Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                
                                {/* Masse Salariale par Département */}
                                <motion.div variants={itemVariants}>
                                    <Card className="glass-panel border-0 rounded-3xl h-full">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold font-['Outfit'] flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-blue-100 text-blue-600"><BarChart3 size={20} /></div>
                                                Masse Salariale par Département
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={charts.salaryByDept} layout="vertical" margin={{ left: 40, right: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} />
                                                    <RechartsTooltip cursor={{fill: '#f1f5f9', opacity: 0.5}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                                                    <Bar dataKey="Total" fill="var(--primary)" radius={[0, 8, 8, 0]} barSize={24} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Turnover par Département */}
                                <motion.div variants={itemVariants}>
                                    <Card className="glass-panel border-0 rounded-3xl h-full">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold font-['Outfit'] flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-rose-100 text-rose-600"><Activity size={20} /></div>
                                                Taux de Rotation (%)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={charts.turnoverByDept} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600, fontSize: 12}} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                                    <Area type="monotone" dataKey="rate" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorRate)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Flux Entrées/Sorties */}
                                <motion.div variants={itemVariants}>
                                    <Card className="glass-panel border-0 rounded-3xl h-full">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold font-['Outfit'] flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600"><Clock size={20} /></div>
                                                Flux de Recrutement (6 mois)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={charts.monthlyFlux} margin={{ top: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                                    <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} iconType="circle" />
                                                    <Bar dataKey="Entrées" fill="#10b981" radius={[8, 8, 0, 0]} barSize={20} />
                                                    <Bar dataKey="Départs" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Types de Contrat */}
                                <motion.div variants={itemVariants}>
                                    <Card className="glass-panel border-0 rounded-3xl h-full">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold font-['Outfit'] flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-purple-100 text-purple-600"><PieIcon size={20} /></div>
                                                Structure des Contrats
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[350px] flex justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={charts.contractTypes}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={80}
                                                        outerRadius={120}
                                                        paddingAngle={4}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {charts.contractTypes.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                                
                                {/* Pyramide des Âges */}
                                <motion.div variants={itemVariants}>
                                    <Card className="glass-panel border-0 rounded-3xl h-full">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold font-['Outfit'] flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-orange-100 text-orange-600"><Users size={20} /></div>
                                                Pyramide des Âges
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={charts.agePyramidData} layout="vertical" stackOffset="sign" margin={{ left: 10, right: 10 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="ageGroup" type="category" width={60} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} />
                                                    <RechartsTooltip cursor={{fill: '#f1f5f9', opacity: 0.5}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(value) => Math.abs(value)} />
                                                    <Legend verticalAlign="top" align="right" iconType="circle" />
                                                    <Bar dataKey="male" name="Hommes" fill="#3b82f6" stackId="stack" radius={[8, 0, 0, 8]} barSize={24} />
                                                    <Bar dataKey="female" name="Femmes" fill="#ec4899" stackId="stack" radius={[0, 8, 8, 0]} barSize={24} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Répartition par Ancienneté */}
                                <motion.div variants={itemVariants}>
                                    <Card className="glass-panel border-0 rounded-3xl h-full">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold font-['Outfit'] flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-cyan-100 text-cyan-600"><Briefcase size={20} /></div>
                                                Répartition par Ancienneté
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={charts.seniorityData || []} margin={{ top: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                                    <RechartsTooltip cursor={{fill: '#f1f5f9', opacity: 0.5}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                                    <Bar dataKey="value" name="Employés" fill="#06b6d4" radius={[8, 8, 0, 0]} barSize={32}>
                                                        {charts.seniorityData?.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[(index+1) % COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Équité Salariale (Gender Pay Gap) */}
                                <motion.div variants={itemVariants} className="lg:col-span-2">
                                    <Card className="glass-panel border-0 rounded-3xl h-full shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold font-['Outfit'] flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-violet-100 text-violet-600"><DollarSign size={20} /></div>
                                                Index d'Égalité Professionnelle (Salaire Net Moyen H/F)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={charts.genderPayGapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                                    <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                                    <RechartsTooltip cursor={{fill: '#f1f5f9', opacity: 0.5}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                                    <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                                                    <Bar dataKey="male" name="Hommes (Moyenne en kFCFA)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                                                    <Bar dataKey="female" name="Femmes (Moyenne en kFCFA)" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={24} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Predictive Tab */
                        <motion.div 
                            key="predictive"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: 20 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            <div className="lg:col-span-2 space-y-6">
                                <motion.div variants={itemVariants}>
                                    <Card className="glass-panel border-0 rounded-3xl overflow-hidden shadow-xl">
                                        <div className="h-2 w-full bg-gradient-to-r from-primary to-accent" />
                                        <CardHeader className="bg-white/40 border-b border-white/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                                                        <BrainCircuit size={28} />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-2xl font-black font-['Outfit']">Predictive Risk Monitor</CardTitle>
                                                        <CardDescription className="text-slate-500 font-medium mt-1">Analyse comportementale pilotée par l'IA.</CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="success" className="animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]">En direct</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-white/50">
                                                {predictiveData.length === 0 ? (
                                                    <div className="p-16 text-center text-slate-500 font-medium flex flex-col items-center">
                                                        <Fingerprint size={48} className="text-slate-300 mb-4 opacity-50" />
                                                        Aucune anomalie détectée.
                                                    </div>
                                                ) : (
                                                    predictiveData.map((item, idx) => (
                                                        <motion.div 
                                                            key={idx} 
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="p-6 flex items-start gap-6 hover:bg-white/60 transition-all group cursor-pointer"
                                                        >
                                                            <div className={`mt-1 p-3 rounded-2xl shadow-sm ${item.riskLevel === 'Élevé' ? 'bg-rose-100 text-rose-600 shadow-rose-200' : 'bg-amber-100 text-amber-600 shadow-amber-200'}`}>
                                                                <AlertTriangle size={24} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div>
                                                                        <h4 className="font-black text-slate-900 text-xl font-['Outfit'] group-hover:text-primary transition-colors">{item.name}</h4>
                                                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{item.department || 'Tous Départements'}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className={`text-2xl font-black font-['Outfit'] ${item.riskLevel === 'Élevé' ? 'text-rose-600' : 'text-amber-500'}`}>{item.riskScore || '85'}%</p>
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Probabilité</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-slate-600 text-sm leading-relaxed font-medium">{item.reason}</p>
                                                                <div className="flex gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg">Action Requise</button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>

                            <div className="space-y-6">
                                {/* Budget Sandbox Widget */}
                                <motion.div variants={itemVariants}>
                                    <Card className="bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 text-white border-0 shadow-2xl overflow-hidden relative rounded-3xl">
                                        <div className="absolute -top-10 -right-10 p-6 opacity-10 rotate-12">
                                            <DollarSign size={180} />
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center gap-3 text-sm uppercase tracking-widest font-black">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                Simulation Budgétaire IA
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-8 relative z-10 pt-4">
                                            <div>
                                                <div className="flex justify-between text-xs mb-3">
                                                    <span className="text-slate-400 font-medium">Augmentation Salariale Globale</span>
                                                    <span className="font-black text-emerald-400 text-lg">+5%</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '50%' }}
                                                        transition={{ duration: 1.5, delay: 0.5 }}
                                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Impact Prédictif (6 mois)</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-3xl font-black text-white font-['Outfit']">-12%</p>
                                                        <p className="text-xs text-emerald-400 font-bold mt-1">Turnover</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-3xl font-black text-white font-['Outfit']">+8%</p>
                                                        <p className="text-xs text-blue-400 font-bold mt-1">Performance</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="w-full py-4 rounded-xl bg-white text-slate-900 font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-lg">
                                                Ajuster les Variables
                                            </button>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* IA Insights Feed */}
                                <motion.div variants={itemVariants}>
                                    <Card className="glass-panel border-0 rounded-3xl">
                                        <CardHeader>
                                            <CardTitle className="text-slate-900 flex items-center gap-2 text-sm uppercase tracking-widest font-black">
                                                <Sparkles size={16} className="text-primary" />
                                                Insights Stratégiques
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {[
                                                { text: "Alerte : Coût de remplacement projeté à 45M FCFA si les 3 départs prévus se confirment en Ingénierie.", color: "rose", icon: AlertTriangle },
                                                { text: "Opportunité : 12 collaborateurs ont des compétences dormantes en Python utilisables pour l'automatisation de la Paie.", color: "primary", icon: BrainCircuit },
                                            ].map((insight, idx) => (
                                                <div key={idx} className={`p-4 rounded-2xl bg-${insight.color}/10 border border-${insight.color}/20 flex gap-3`}>
                                                    <insight.icon size={18} className={`text-${insight.color} shrink-0 mt-0.5`} />
                                                    <p className={`text-sm font-medium text-${insight.color}`}>{insight.text}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function Badge({ children, variant, className = "" }) {
    const styles = {
        destructive: 'bg-rose-100 text-rose-700',
        secondary: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[variant] || styles.secondary} ${className}`}>{children}</span>;
}
