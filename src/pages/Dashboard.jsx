import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Briefcase, GraduationCap, Clock, CheckCircle2, Activity, Scale, Timer, HeartPulse } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const turnoverByDept = [
    { name: 'Ingénierie', rate: 4.2 },
    { name: 'Ventes', rate: 12.5 },
    { name: 'Marketing', rate: 8.1 },
    { name: 'RH', rate: 3.2 },
    { name: 'Finance', rate: 5.4 },
];

const timeToHireData = [
    { month: 'Mai', days: 45 },
    { month: 'Juin', days: 42 },
    { month: 'Juil', days: 38 },
    { month: 'Août', days: 35 },
    { month: 'Sept', days: 31 },
    { month: 'Oct', days: 28 },
];

const genderPayGapData = [
    { department: 'Ingénierie', male: 95, female: 92 },
    { department: 'Ventes', male: 78, female: 75 },
    { department: 'Marketing', male: 68, female: 70 },
    { department: 'RH', male: 65, female: 65 },
    { department: 'Finance', male: 85, female: 81 },
];

const monthlyTurnover = [
    { name: 'Janv', rate: 2.1 },
    { name: 'Févr', rate: 1.8 },
    { name: 'Mars', rate: 1.5 },
    { name: 'Avr', rate: 2.5 },
    { name: 'Mai', rate: 1.2 },
    { name: 'Juin', rate: 0.8 },
    { name: 'Juil', rate: 1.1 },
];

const agePyramidData = [
    { ageGroup: '18-25', male: 12, female: 15 },
    { ageGroup: '26-35', male: 45, female: 38 },
    { ageGroup: '36-45', male: 30, female: 28 },
    { ageGroup: '46-55', male: 18, female: 14 },
    { ageGroup: '56+', male: 8, female: 5 },
];

const mobilityVsHiringData = [
    { name: 'Promotions Internes', value: 35, color: '#8b5cf6' },
    { name: 'Recrutements Externes', value: 65, color: '#3b82f6' },
];

const stats = [
    {
        title: 'Délai Moyen d\'Embauche',
        value: '28 Jours',
        change: '-3 Jours',
        icon: Timer,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
    },
    {
        title: 'Taux de Rotation Légal',
        value: '6.4%',
        change: '-0.5%',
        icon: Activity,
        color: 'text-rose-600',
        bg: 'bg-rose-100',
    },
    {
        title: 'Coût du Turnover',
        value: '85M FCFA',
        change: '+7M',
        icon: Activity,
        color: 'text-rose-600',
        bg: 'bg-rose-100',
    },
    {
        title: 'Taux d\'Absentéisme',
        value: '2.8%',
        change: '-0.2%',
        icon: Users,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
    },
    {
        title: 'Écart de Rémunération',
        value: '3.2%',
        change: '-1.1%',
        icon: Scale,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
    },
    {
        title: 'Total Employés',
        value: '180',
        change: '+12%',
        icon: Users,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
    },
];

export function Dashboard() {
    const [notification, setNotification] = useState(null);
    const [showSurvey, setShowSurvey] = useState(true);
    const [surveyScore, setSurveyScore] = useState(null);
    const [surveyComment, setSurveyComment] = useState('');

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-[calc(100vh-4rem)] relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <CheckCircle2 size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de bord</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => showNotification("Le rapport RH global a été téléchargé en PDF.")}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    >
                        Télécharger Rapport
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showSurvey && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0 }}
                        className="bg-indigo-600 rounded-xl shadow-lg border-0 overflow-hidden mb-6"
                    >
                        <div className="p-6 text-white">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Sondage Pulse : Bilan T4</h3>
                                    <p className="text-indigo-100 text-sm">Quelle est la probabilité que vous recommandiez notre entreprise comme lieu de travail ?</p>
                                </div>
                                <div className="bg-indigo-500/50 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-indigo-100 backdrop-blur-sm border border-indigo-400/30">
                                    100% ANONYME
                                </div>
                            </div>

                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-wrap gap-1.5 justify-between">
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                        <button
                                            key={score}
                                            onClick={() => setSurveyScore(score)}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${surveyScore === score
                                                ? 'bg-white text-indigo-700 shadow-xl scale-110 ring-2 ring-white ring-offset-2 ring-offset-indigo-600'
                                                : 'bg-indigo-500 hover:bg-indigo-400 text-white hover:scale-105'
                                                }`}
                                        >
                                            {score}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between text-xs font-medium text-indigo-200 mt-1 px-1">
                                    <span>0 - Très peu probable</span>
                                    <span>10 - Très probable</span>
                                </div>

                                <AnimatePresence>
                                    {surveyScore !== null && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-3 mt-4 pt-4 border-t border-indigo-500/30"
                                        >
                                            <textarea
                                                value={surveyComment}
                                                onChange={(e) => setSurveyComment(e.target.value)}
                                                placeholder="Souhaitez-vous partager pourquoi ? (Optionnel)"
                                                className="w-full bg-indigo-700/50 border border-indigo-500 rounded-lg p-3 text-sm text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                                                rows="2"
                                            />
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setShowSurvey(false)}
                                                    className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-200 hover:text-white"
                                                >
                                                    Passer
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowSurvey(false);
                                                        showNotification("Merci ! Vos commentaires ont été soumis de manière sécurisée et anonyme.");
                                                    }}
                                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg text-sm transition-colors shadow-lg"
                                                >
                                                    Soumettre Anonymement
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                                <p className="text-xs text-slate-500 mt-1">
                                    <span className={stat.change.startsWith('+') ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                                        {stat.change}
                                    </span>{' '}
                                    depuis le mois dernier
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <motion.div
                    className="col-span-1 md:col-span-2 lg:col-span-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Écart Salarial (Salaire Moyen kFCFA)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={genderPayGapData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="male" name="Salaire Moyen Hommes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="female" name="Salaire Moyen Femmes" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    className="col-span-1 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Activité Récente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {[
                                    { name: 'Michael Dam', action: 'A demandé un congé annuel', time: 'Il y a 2h', bg: 'bg-purple-100', color: 'text-purple-600' },
                                    { name: 'Système', action: 'A terminé le traitement de la paie', time: 'Il y a 5h', bg: 'bg-emerald-100', color: 'text-emerald-600' },
                                    { name: 'Sarah Jenkins', action: 'A publié une nouvelle offre d\'emploi', time: 'Hier', bg: 'bg-primary/10', color: 'text-primary' },
                                    { name: 'John Doe', action: 'A terminé son intégration', time: 'Hier', bg: 'bg-amber-100', color: 'text-amber-600' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-4 ${item.bg} ${item.color} font-bold text-sm`}>
                                            {item.name.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{item.name}</p>
                                            <p className="text-sm text-slate-500">{item.action}</p>
                                        </div>
                                        <div className="ml-auto text-xs text-slate-400">
                                            {item.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* New Row: People Analytics */}
            <h3 className="text-xl font-bold tracking-tight text-slate-800 mt-8 mb-4">Analytique RH</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Turnover by Department */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                >
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Taux de Rotation par Département (%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={turnoverByDept} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="rate" name="Rotation (%)" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Time-to-Hire Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                >
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Tendance du Délai d'Embauche (Jours)</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            <div className="h-[250px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timeToHireData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Line type="monotone" dataKey="days" name="Délai Moyen d'Embauche" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Monthly Turnover Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="md:col-span-2 lg:col-span-1"
                >
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Tendance Globale du Turnover (%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyTurnover} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="rate" name="Rotation (%)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTurnover)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Age Pyramid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    className="md:col-span-1"
                >
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Pyramide des Âges & Ancienneté</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={agePyramidData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }} stackOffset="sign">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="ageGroup" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                        {/* To make a standard age pyramid, males are negative and females are positive, but Recharts handles it via stackOffset="sign" with data mapping, so we'll just stack them side-by-side or standard stacked for visual simplicity here */}
                                        <Bar dataKey="male" name="Hommes" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="female" name="Femmes" stackId="a" fill="#ec4899" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Internal Mobility vs External Hiring */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.4 }}
                    className="md:col-span-1 lg:col-span-2"
                >
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Source d'Embauche : Interne vs Externe</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <div className="h-[250px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={mobilityVsHiringData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {mobilityVsHiringData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
}
