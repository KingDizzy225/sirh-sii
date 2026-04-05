import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { BarChart as BarIcon, Users, TrendingDown, Banknote, FileText, RefreshCw } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatFCFA = (v) => new Intl.NumberFormat('fr-CI').format(Math.round(v || 0)) + ' F';

const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => {
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    };
    const c = colors[color] || colors.blue;
    return (
        <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${c.bg} mt-1`}>
                    <Icon className={c.text} size={22} />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value ?? '—'}</p>
                    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    );
};

export function Analytics() {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('masse-salariale');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/analytics/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setData(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (token) fetchData(); }, [token]);

    const tabs = [
        { id: 'masse-salariale', label: '💰 Masse Salariale' },
        { id: 'depenses', label: '🧾 Dépenses' },
        { id: 'contrats', label: '📋 Contrats' },
        { id: 'absences', label: '📅 Congés & Absences' },
        { id: 'paie-kpi', label: '📊 KPIs Paie' },
    ];

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 min-h-[calc(100vh-4rem)] bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <BarIcon className="h-8 w-8 text-blue-600" />
                        Tableau de Bord Analytique RH
                    </h2>
                    <p className="text-slate-500 mt-1">Données en temps réel depuis votre base de données.</p>
                </div>
                <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualiser
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <span className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard icon={Users} label="Effectif Total" value={data?.stats?.totalEmployees ?? 0} sub={`${data?.stats?.activeEmployees ?? 0} actifs`} color="blue" />
                        <StatCard icon={TrendingDown} label="Taux de Turnover" value={`${data?.stats?.globalTurnover ?? 0} %`} sub="Départs / Effectif total" color="amber" />
                        <StatCard icon={Banknote} label="Taux d'Absentéisme" value={`${data?.stats?.absenceRate ?? 0} %`} sub="Ce mois (jours demandés)" color="green" />
                        <StatCard icon={FileText} label="Bulletins Générés" value={data?.stats?.payrollCount ?? 0} sub={`Net moy. : ${formatFCFA(data?.stats?.avgNetSalary)}`} color="purple" />
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {tabs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* === Masse Salariale par Département === */}
                    {activeTab === 'masse-salariale' && (
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader>
                                <CardTitle>Masse Salariale Moyenne par Département</CardTitle>
                                <CardDescription>Salaire de base moyen basé sur les fiches de paie générées (en FCFA)</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                {(data?.charts?.salaryByDept?.length ?? 0) === 0 ? (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        Aucune fiche de paie générée pour le moment.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.charts?.salaryByDept} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                            <RechartsTooltip formatter={(v) => formatFCFA(v)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                            <Legend />
                                            <Bar dataKey="Moyenne" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Salaire Moyen" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* === Dépenses par Département === */}
                    {activeTab === 'depenses' && (
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader>
                                <CardTitle>Dépenses par Département</CardTitle>
                                <CardDescription>Total des notes de frais soumises (toutes périodes, en FCFA)</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                {(data?.charts?.expensesByDept?.length ?? 0) === 0 ? (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        Aucune note de frais enregistrée.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.charts?.expensesByDept} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                            <RechartsTooltip formatter={(v) => formatFCFA(v)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="Montant" fill="#10b981" radius={[6, 6, 0, 0]} name="Dépenses (FCFA)">
                                                {data?.charts?.expensesByDept?.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* === Répartition Contrats === */}
                    {activeTab === 'contrats' && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader>
                                    <CardTitle>Répartition des Types de Postes</CardTitle>
                                    <CardDescription>CDI / CDD / Stage publiés dans les offres d'emploi</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[380px] flex items-center justify-center">
                                    {(data?.charts?.contractTypes?.length ?? 0) === 0 ? (
                                        <p className="text-slate-400">Aucune offre d'emploi enregistrée.</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data?.charts?.contractTypes}
                                                    cx="50%" cy="50%"
                                                    innerRadius={80} outerRadius={130}
                                                    paddingAngle={4} dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {data?.charts?.contractTypes?.map((_, i) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                <CardContent className="p-8 flex flex-col justify-center h-full gap-4">
                                    <h3 className="text-xl font-bold mb-2">Résumé des Effectifs</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between bg-white/10 p-3 rounded-xl">
                                            <span>Total Employés</span>
                                            <span className="font-bold text-xl">{data?.stats?.totalEmployees}</span>
                                        </div>
                                        <div className="flex justify-between bg-white/10 p-3 rounded-xl">
                                            <span>Actifs</span>
                                            <span className="font-bold text-xl text-emerald-300">{data?.stats?.activeEmployees}</span>
                                        </div>
                                        <div className="flex justify-between bg-white/10 p-3 rounded-xl">
                                            <span>Taux de Turnover</span>
                                            <span className="font-bold text-xl text-amber-300">{data?.stats?.globalTurnover} %</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* === Congés & Absences === */}
                    {activeTab === 'absences' && (
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader>
                                <CardTitle>Flux d'Embauches & Absentéisme</CardTitle>
                                <CardDescription>Entrées vs. Départs des 6 derniers mois (données réelles de hireDate)</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                {(data?.charts?.monthlyFlux?.length ?? 0) === 0 ? (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        Aucune donnée d'embauche récente (6 derniers mois).
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data?.charts?.monthlyFlux} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="Entrées" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                                            <Line type="monotone" dataKey="Départs" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* === KPIs Paie === */}
                    {activeTab === 'paie-kpi' && (
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="col-span-3 md:col-span-1 shadow-sm border-slate-200 bg-gradient-to-br from-emerald-500 to-teal-700 text-white">
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-emerald-100 font-medium">Bulletins ce mois</p>
                                    <p className="text-5xl font-extrabold">{data?.stats?.payrollCount ?? 0}</p>
                                    <p className="text-emerald-200 text-sm">fiches générées & approuvées</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-slate-200">
                                <CardContent className="p-6 space-y-2">
                                    <p className="text-slate-500 text-sm font-medium">Salaire Net Moyen</p>
                                    <p className="text-3xl font-bold text-slate-900">{formatFCFA(data?.stats?.avgNetSalary)}</p>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Mois en cours</Badge>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-slate-200">
                                <CardContent className="p-6 space-y-2">
                                    <p className="text-slate-500 text-sm font-medium">Masse Salariale Nette Totale</p>
                                    <p className="text-3xl font-bold text-slate-900">{formatFCFA(data?.stats?.totalNetSalary)}</p>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Bulletins approuvés</Badge>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
