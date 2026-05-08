import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
    TrendingUp, 
    Users, 
    DollarSign, 
    Clock, 
    Briefcase, 
    AlertTriangle, 
    ArrowUpRight, 
    ArrowDownRight,
    PieChart as PieIcon,
    BarChart3,
    Activity,
    BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

export function Analytics() {
    const [data, setData] = useState(null);
    const [predictiveData, setPredictiveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_URL}/api/analytics/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Erreur lors du chargement des statistiques');
                const json = await res.json();
                setData(json);

                // Fetch predictive data
                const predRes = await fetch(`${API_URL}/api/analytics/predictive`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (predRes.ok) {
                    const predJson = await predRes.json();
                    setPredictiveData(predJson);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [API_URL, token]);

    if (loading) return (
        <div className="flex-1 p-8 flex justify-center items-center h-[calc(100vh-4rem)]">
            <span className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></span>
        </div>
    );

    if (error) return <div className="p-8 text-red-500">Erreur: {error}</div>;

    const { stats, charts } = data;

    const StatCard = ({ title, value, icon: Icon, description, trend, trendValue, color }) => (
        <Card className="border-none shadow-sm overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-3 opacity-5 text-${color}-600`}>
                <Icon size={80} />
            </div>
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600`}>
                        <Icon size={22} />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
                        <p className="text-xs text-slate-400 mt-1">{description}</p>
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {trend === 'up' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                            {trendValue}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <TrendingUp className="text-blue-600" size={32} />
                        HR Analytics Hub
                    </h2>
                    <p className="text-slate-500 font-medium">Pilotage stratégique et insights prédictifs basés sur l'IA.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Vue d'ensemble
                    </button>
                    <button 
                        onClick={() => setActiveTab('predictive')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'predictive' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <BrainCircuit size={16} />
                        IA Prédictive
                    </button>
                </div>
            </div>

            {activeTab === 'overview' ? (
                <>
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Effectif Total" 
                            value={stats.activeEmployees} 
                            icon={Users} 
                            description="Collaborateurs actifs"
                            trend="up"
                            trendValue="+4%"
                            color="blue"
                        />
                        <StatCard 
                            title="Turnover" 
                            value={`${stats.globalTurnover}%`} 
                            icon={Activity} 
                            description="Taux de rotation annuel"
                            trend="down"
                            trendValue="-2.1%"
                            color="indigo"
                        />
                        <StatCard 
                            title="Absentéisme" 
                            value={`${stats.absenceRate}%`} 
                            icon={Clock} 
                            description="Taux ce mois-ci"
                            color="amber"
                        />
                        <StatCard 
                            title="Masse Salariale" 
                            value={`${(stats.totalNetSalary / 1000000).toFixed(1)}M`} 
                            icon={DollarSign} 
                            description="Net versé ce mois (FCFA)"
                            trend="up"
                            trendValue="+1.2%"
                            color="emerald"
                        />
                    </div>

                    {/* Main Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Masse Salariale par Département */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 size={20} className="text-blue-600" />
                                    Masse Salariale par Département
                                </CardTitle>
                                <CardDescription>Répartition du total des salaires bruts.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.salaryByDept} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            cursor={{fill: '#f8fafc'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="Total" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Turnover par Département */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity size={20} className="text-rose-600" />
                                    Taux de Rotation par Département (%)
                                </CardTitle>
                                <CardDescription>Départ de collaborateurs sur l'année.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.turnoverByDept}>
                                        <defs>
                                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="rate" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Flux Entrées/Sorties */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock size={20} className="text-emerald-600" />
                                    Flux de Recrutement (6 mois)
                                </CardTitle>
                                <CardDescription>Comparaison des embauches et des départs.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.monthlyFlux}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="top" align="right" />
                                        <Bar dataKey="Entrées" fill="#10b981" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="Départs" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Types de Contrat */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PieIcon size={20} className="text-purple-600" />
                                    Structure des Contrats
                                </CardTitle>
                                <CardDescription>Répartition par type de contrat (CDI, CDD, etc.).</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px] flex justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.contractTypes}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {charts.contractTypes.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="bottom" align="center" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </>
            ) : (
                /* Predictive Tab */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-sm border-l-4 border-l-indigo-600">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                                        <BrainCircuit size={28} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold">Analyse Prédictive de l'Engagement</CardTitle>
                                        <CardDescription>L'IA analyse les patterns d'absences, de performance et d'ancienneté pour détecter les risques.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {predictiveData.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500">
                                            Aucune donnée prédictive disponible pour le moment.
                                        </div>
                                    ) : (
                                        predictiveData.map((item, idx) => (
                                            <div key={idx} className="p-6 flex items-start gap-6 hover:bg-slate-50/50 transition-colors">
                                                <div className={`mt-1 p-2 rounded-lg ${item.riskLevel === 'Élevé' ? 'bg-rose-100 text-rose-600' : item.riskLevel === 'Moyen' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-bold text-slate-900 text-lg">{item.name}</h4>
                                                        <Badge variant={item.riskLevel === 'Élevé' ? 'destructive' : 'secondary'}>
                                                            Risque {item.riskLevel}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed">{item.reason}</p>
                                                    <div className="flex gap-4 mt-4">
                                                        <button className="text-xs font-bold text-indigo-600 hover:underline">Planifier un entretien RH</button>
                                                        <button className="text-xs font-bold text-slate-400 hover:underline">Ignorer l'alerte</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <BrainCircuit size={20} />
                                    Insights IA
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                    <p className="text-sm font-bold text-indigo-300 mb-1">Observation Clé</p>
                                    <p className="text-sm text-white/80 italic">"Une augmentation de 15% des congés maladie courts a été détectée dans le département Ventes, corrélée historiquement à 3 départs futurs."</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                    <p className="text-sm font-bold text-emerald-300 mb-1">Recommandation</p>
                                    <p className="text-sm text-white/80">"Envisagez une revue des objectifs trimestriels pour l'équipe Ventes afin de réduire la pression détectée par l'IA."</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

function Badge({ children, variant }) {
    const styles = {
        destructive: 'bg-rose-100 text-rose-700',
        secondary: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700'
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[variant] || styles.secondary}`}>{children}</span>;
}
