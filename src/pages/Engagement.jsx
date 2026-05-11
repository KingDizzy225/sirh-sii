import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { HeartPulse, MessageSquare, Plus, Activity, ThumbsUp, ThumbsDown, Minus, CheckCircle2, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { RequirePermission } from '../components/auth/ProtectedRoute';

// Database Mock: Includes employee name to avoid anonymity.
// Just scores and timestamps.
const initialResponses = [
    { id: 1, score: 9, name: "Alice Durant", comment: "Excellente collaboration en équipe.", date: "21 Oct 2026" },
    { id: 2, score: 10, name: "Marc Tremblay", comment: "J'adore la nouvelle politique de télétravail !", date: "21 Oct 2026" },
    { id: 3, score: 7, name: "Sophie Martin", comment: "Bien, mais les avantages pourraient être améliorés.", date: "22 Oct 2026" },
    { id: 4, score: 5, name: "Luc Dubois", comment: "Trop de réunions.", date: "22 Oct 2026" },
    { id: 5, score: 8, name: "Julie Lefebvre", comment: "Mon manager me soutient.", date: "23 Oct 2026" },
    { id: 6, score: 9, name: "Alain Robert", comment: "", date: "23 Oct 2026" },
    { id: 7, score: 3, name: "Emma Petit", comment: "Le projet actuel est très stressant et désorganisé.", date: "24 Oct 2026" },
    { id: 8, score: 10, name: "Lucas Richard", comment: "Fier de travailler ici.", date: "24 Oct 2026" },
    { id: 9, score: 9, name: "Léa Bernard", comment: "", date: "24 Oct 2026" },
    { id: 10, score: 6, name: "Hugo Moreau", comment: "Le salaire est en dessous de la moyenne du marché.", date: "25 Oct 2026" },
    { id: 11, score: 8, name: "Chloé Simon", comment: "Globalement satisfait.", date: "25 Oct 2026" },
    { id: 12, score: 10, name: "Tom Michel", comment: "La meilleure entreprise pour laquelle j'ai travaillé !", date: "26 Oct 2026" },
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
                        <p className="text-slate-500 mt-1">Mesurez la culture d'entreprise, l'eNPS et recueillez les retours des employés.</p>
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

                    {/* AI Sentiment Analysis Section */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-xl border-none bg-slate-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Activity size={160} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Sparkles className="text-indigo-400" size={20} />
                                Intelligence Artificielle & Sentiments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                                {/* Sentiment Meter */}
                                <div className="space-y-6">
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Indice de Sentiment Global</h4>
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-5xl font-black text-white">78%</span>
                                            <span className="text-emerald-400 text-sm font-bold pb-1">+12% vs M-1</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Répartition du Ton</p>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Positif', value: 72, color: 'bg-emerald-500' },
                                                { label: 'Neutre', value: 18, color: 'bg-slate-500' },
                                                { label: 'Négatif', value: 10, color: 'bg-rose-500' },
                                            ].map(item => (
                                                <div key={item.label} className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>{item.label}</span>
                                                        <span>{item.value}%</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Themes & Keywords */}
                                <div className="space-y-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Analyse Thématique</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { theme: 'Flexibilité', sentiment: 'positive', score: 92 },
                                            { theme: 'Communication', sentiment: 'positive', score: 84 },
                                            { theme: 'Outils IT', sentiment: 'neutral', score: 65 },
                                            { theme: 'Salaire', sentiment: 'negative', score: 34 },
                                        ].map(t => (
                                            <div key={t.theme} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-[10px] font-bold text-white/70">{t.theme}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <div className={`w-2 h-2 rounded-full ${t.sentiment === 'positive' ? 'bg-emerald-500' : t.sentiment === 'neutral' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                                    <span className="text-xs font-black">{t.score}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        <p className="text-[10px] font-bold text-indigo-300 uppercase mb-2">Mot-Clé Émergent</p>
                                        <p className="text-sm font-bold">"Équilibre Pro/Perso"</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Cité dans 45% des commentaires positifs ce mois-ci.</p>
                                    </div>
                                </div>

                                {/* Action Plan */}
                                <div className="space-y-4">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Plan d'Action IA</p>
                                    <div className="space-y-3">
                                        {[
                                            'Réduire les réunions du jeudi (Focus Day)',
                                            'Clarifier la politique de bonus annuel',
                                            'Célébrer la réussite du projet Sirius',
                                        ].map((step, idx) => (
                                            <div key={idx} className="flex gap-3 items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                                                <p className="text-[11px] font-medium text-slate-300">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-black h-10 px-6 rounded-xl text-[10px] uppercase tracking-widest mt-2">
                                        Valider ces actions
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employee Verbatims */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-slate-500" /> Retours des Employés
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
                                        <h4 className="text-slate-400 text-xs font-semibold mb-3 tracking-wider uppercase">{resp.name || 'Employé'}</h4>
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
