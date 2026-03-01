import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { HeartPulse, MessageSquare, Plus, Activity, ThumbsUp, ThumbsDown, Minus, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { RequirePermission } from '../components/auth/ProtectedRoute';

// Database Mock: Notice the STRICT absence of employee_id or name.
// Just anonymous scores and timestamps.
const initialResponses = [
    { id: 1, score: 9, comment: "Excellente collaboration en équipe.", date: "21 Oct 2026" },
    { id: 2, score: 10, comment: "J'adore la nouvelle politique de télétravail !", date: "21 Oct 2026" },
    { id: 3, score: 7, comment: "Bien, mais les avantages pourraient être améliorés.", date: "22 Oct 2026" },
    { id: 4, score: 5, comment: "Trop de réunions.", date: "22 Oct 2026" },
    { id: 5, score: 8, comment: "Mon manager me soutient.", date: "23 Oct 2026" },
    { id: 6, score: 9, comment: "", date: "23 Oct 2026" },
    { id: 7, score: 3, comment: "Le projet actuel est très stressant et désorganisé.", date: "24 Oct 2026" },
    { id: 8, score: 10, comment: "Fier de travailler ici.", date: "24 Oct 2026" },
    { id: 9, score: 9, comment: "", date: "24 Oct 2026" },
    { id: 10, score: 6, comment: "Le salaire est en dessous de la moyenne du marché.", date: "25 Oct 2026" },
    { id: 11, score: 8, comment: "Globalement satisfait.", date: "25 Oct 2026" },
    { id: 12, score: 10, comment: "La meilleure entreprise pour laquelle j'ai travaillé !", date: "26 Oct 2026" },
];

const trendData = [
    { month: 'Mai', enps: 15 },
    { month: 'Juin', enps: 18 },
    { month: 'Juil', enps: 22 },
    { month: 'Août', enps: 20 },
    { month: 'Sep', enps: 35 },
    { month: 'Oct', enps: 42 }, // Current calculated below will override this visually if we wanted
];

export function Engagement() {
    const [responses] = useState(initialResponses);
    const [notification, setNotification] = useState(null);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Business Logic: Calculate eNPS
    const metrics = useMemo(() => {
        let promoters = 0;
        let passives = 0;
        let detractors = 0;

        responses.forEach(r => {
            if (r.score >= 9) promoters++;
            else if (r.score >= 7) passives++;
            else detractors++;
        });

        const total = responses.length;
        const eNPS = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

        return {
            total,
            promoters,
            passives,
            detractors,
            eNPS,
            promoterPct: total > 0 ? Math.round((promoters / total) * 100) : 0,
            passivePct: total > 0 ? Math.round((passives / total) * 100) : 0,
            detractorPct: total > 0 ? Math.round((detractors / total) * 100) : 0
        };
    }, [responses]);

    const distributionData = [
        { name: 'Détracteurs (0-6)', value: metrics.detractorPct, count: metrics.detractors, color: '#ef4444' },
        { name: 'Passifs (7-8)', value: metrics.passivePct, count: metrics.passives, color: '#f59e0b' },
        { name: 'Promoteurs (9-10)', value: metrics.promoterPct, count: metrics.promoters, color: '#10b981' }
    ];

    const getScoreColor = (score) => {
        if (score >= 9) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (score >= 7) return 'bg-amber-100 text-amber-800 border-amber-200';
        return 'bg-rose-100 text-rose-800 border-rose-200';
    };

    const geteNPSColor = (score) => {
        if (score > 30) return 'text-emerald-500';
        if (score > 0) return 'text-blue-500';
        if (score > -30) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <RequirePermission permission="employees:edit" fallbackPath="/dashboard">
            <div className="flex-1 space-y-6 p-8 pt-6 min-h-[calc(100vh-4rem)] bg-slate-50/50 relative">
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
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <HeartPulse className="h-8 w-8 text-indigo-600" />
                            Engagement des Employés
                        </h2>
                        <p className="text-slate-500 mt-1">Mesurez la culture d'entreprise, l'eNPS et recueillez des retours anonymes.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => showNotification("Création d'un nouveau sondage eNPS...")}>
                            <Plus size={16} /> Nouveau Sondage Rapide
                        </Button>
                    </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-600">eNPS Entreprise</CardTitle>
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Activity className="h-4 w-4 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-extrabold tracking-tight ${geteNPSColor(metrics.eNPS)}`}>
                                    {metrics.eNPS > 0 ? `+${metrics.eNPS}` : metrics.eNPS}
                                </span>
                                <span className="text-sm text-slate-500 font-medium">Score</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-500">
                                Plage : -100 à +100. <span className="text-indigo-600 font-medium">Excellent</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-slate-200">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-600">Promoteurs (9-10)</CardTitle>
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <ThumbsUp className="h-4 w-4 text-emerald-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{metrics.promoterPct}%</div>
                            <p className="text-xs text-slate-500 mt-1">{metrics.promoters} employés très engagés</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-slate-200">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-600">Passifs (7-8)</CardTitle>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Minus className="h-4 w-4 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{metrics.passivePct}%</div>
                            <p className="text-xs text-slate-500 mt-1">{metrics.passives} employés satisfaits mais à l'écoute</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-slate-200">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-600">Détracteurs (0-6)</CardTitle>
                            <div className="p-2 bg-rose-50 rounded-lg">
                                <ThumbsDown className="h-4 w-4 text-rose-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{metrics.detractorPct}%</div>
                            <p className="text-xs text-rose-600 font-medium mt-1">{metrics.detractors} employés à risque</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Distribution Chart */}
                    <Card className="col-span-1 shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold text-slate-800">Distribution des Scores</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={distributionData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={110} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value, name, props) => [`${value}% (${props.payload.count} votes)`, 'Distribution']}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trend Chart */}
                    <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold text-slate-800">Tendance Historique de l'eNPS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorEnps" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="enps" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorEnps)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Anonymous Verbatims */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-slate-500" /> Retours Anonymes
                            </CardTitle>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                                {responses.filter(r => r.comment !== "").length} commentaires
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {responses.filter(r => r.comment !== "").map((resp) => (
                                    <div key={resp.id} className="bg-white border text-sm border-slate-200 rounded-xl p-4 shadow-sm relative hover:shadow-md transition-shadow">
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-2.5 py-1 rounded-full font-bold text-xs border ${getScoreColor(resp.score)}`}>
                                                {resp.score}/10
                                            </span>
                                        </div>
                                        <h4 className="text-slate-400 text-xs font-semibold mb-3 tracking-wider uppercase">Anonyme</h4>
                                        <p className="text-slate-700 italic leading-relaxed">"{resp.comment}"</p>
                                        <div className="text-slate-400 text-xs mt-4 font-medium">{resp.date}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RequirePermission>
    );
}
