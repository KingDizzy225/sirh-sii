import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
    Users, UserPlus, LogOut, Calendar, Clock, Star, Target, 
    CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, 
    ChevronDown, ChevronUp, Loader2, Sparkles, Download
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid, LabelList
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ComplianceMonitor } from '../components/dashboard/ComplianceMonitor';
import { api } from '../lib/api';
import { MOCK_190_EMPLOYEES } from '../constants/mockEmployees';

export function Dashboard() {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [predictiveInsights, setPredictiveInsights] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);
    const [surveyScore, setSurveyScore] = useState(null);
    const [surveyComment, setSurveyComment] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, chartsRes] = await Promise.all([
                    api.get('/dashboard/stats').catch(() => ({ data: {} })),
                    api.get('/analytics/dashboard').catch(() => ({ data: {} }))
                ]);
                
                const statsData = statsRes.data || {};
                const chartsData = chartsRes.data || {};

                setAnalyticsData({
                    ...statsData,
                    charts: chartsData.charts || {},
                    advancedStats: chartsData.stats || {}
                });
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchPredictive = async () => {
            try {
                const predRes = await api.get('/analytics/predictive').catch(() => ({ data: [] }));
                if (predRes.data && Array.isArray(predRes.data)) {
                    setPredictiveInsights(predRes.data);
                }
            } catch (err) {
                console.error("Failed to load predictive data", err);
            }
        };

        if (token) {
            fetchDashboardData();
            fetchPredictive();
        } else {
            setLoading(false);
        }
    }, [token]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    // Dynamic Employee Count (190 mocks + Julie Konan = 191 minimum)
    const totalEmployeesCount = Math.max(191, analyticsData?.totalEmployees || 191);

    // Distribution Data matching the mockup
    const employeeDistribution = [
        { department: 'Operations', count: 72, fill: '#3b82f6' },
        { department: 'Sales', count: 54, fill: '#10b981' },
        { department: 'Marketing', count: 38, fill: '#8b5cf6' },
        { department: 'Admin', count: 54, fill: '#f43f5e' }
    ];

    // Recruitment Status Donut Data matching the mockup
    const recruitmentStatus = [
        { name: 'Hired', value: 12, percent: 50, color: '#10b981' },
        { name: 'In Progress', value: 7, percent: 29, color: '#3b82f6' },
        { name: 'On Hold', value: 3, percent: 13, color: '#f59e0b' },
        { name: 'Closed', value: 2, percent: 8, color: '#8b5cf6' }
    ];

    // Leave Trend Line Data matching the mockup
    const leaveTrend = [
        { month: 'Jan', leaves: 12 },
        { month: 'Feb', leaves: 15 },
        { month: 'Mar', leaves: 23 },
        { month: 'Apr', leaves: 20 },
        { month: 'May', leaves: 26 },
        { month: 'Jun', leaves: 31 }
    ];

    // Recent Employees matching the mockup
    const recentEmployees = [
        { name: 'Aisha Khan', role: 'HR Executive', department: 'HR', date: '12 Jun 2025', avatar: 'AK', bg: 'bg-emerald-100 text-emerald-700' },
        { name: 'Rohan Mathew', role: 'Marketing Executive', department: 'Marketing', date: '09 Jun 2025', avatar: 'RM', bg: 'bg-blue-100 text-blue-700' },
        { name: 'Sneha Nair', role: 'Accountant', department: 'Finance', date: '05 Jun 2025', avatar: 'SN', bg: 'bg-purple-100 text-purple-700' },
        { name: 'Arjun S', role: 'Sales Executive', department: 'Sales', date: '02 Jun 2025', avatar: 'AS', bg: 'bg-amber-100 text-amber-700' }
    ];

    // Key Highlights matching the mockup
    const keyHighlights = [
        { 
            icon: Users, 
            bg: 'bg-emerald-100 text-emerald-600', 
            title: '12 new joiners this month', 
            desc: 'Team is growing!' 
        },
        { 
            icon: Calendar, 
            bg: 'bg-purple-100 text-purple-600', 
            title: 'Attendance improved by 2%', 
            desc: 'Great job, everyone!' 
        },
        { 
            icon: Star, 
            bg: 'bg-amber-100 text-amber-600', 
            title: 'Employee satisfaction at 4.2/5', 
            desc: 'Keep up the good work!' 
        },
        { 
            icon: Target, 
            bg: 'bg-blue-100 text-blue-600', 
            title: '3 open positions', 
            desc: 'Hiring is in progress' 
        }
    ];

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

            {/* HEADER MATCHING MOCKUP */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        HR Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">
                        People • Processes • Progress
                    </p>
                </div>

                {/* Right Slogan & Team illustration */}
                <div className="flex items-center gap-4 bg-white/80 border border-slate-200/70 px-4 py-2.5 rounded-2xl shadow-xs backdrop-blur-xs">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-slate-700 italic tracking-tight font-serif">
                            Better People Build a Stronger Tomorrow
                        </p>
                        <span className="text-xs text-rose-500 font-bold ml-1">♡</span>
                    </div>

                    {/* Team Avatars Illustration */}
                    <div className="flex -space-x-2 overflow-hidden">
                        <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            👩🏽‍💼
                        </div>
                        <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-[#334155] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            👨🏾‍💼
                        </div>
                        <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-[#64748B] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            👩🏻‍💻
                        </div>
                    </div>

                    <button
                        onClick={() => showNotification("Rapport de synthèse RH exporté avec succès.")}
                        title="Exporter le rapport"
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* QUICK ACTIONS & LIVE PULSE */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
                        Accès Direct :
                    </span>
                    <button
                        onClick={() => navigate('/payroll-simulation')}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        💰 Simulateur Masse Salariale
                    </button>
                    <button
                        onClick={() => navigate('/performance')}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        🪄 Copilote IA d'Entretien
                    </button>
                    <button
                        onClick={() => navigate('/smart-automations')}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        ⚡ Déclencheurs RH
                    </button>
                    <button
                        onClick={() => navigate('/sentinelle-burnout')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        🧘 Sentinelle Anti-Burnout
                    </button>
                    <button
                        onClick={() => navigate('/marketplace-talents')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        🎯 Marketplace Talents
                    </button>
                    <button
                        onClick={() => navigate('/conformite')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        ⚖️ Audit CNPS
                    </button>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium text-slate-500 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
                    <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        178 Présents
                    </span>
                    <span>9 Télétravail</span>
                    <span>4 Congés</span>
                </div>
            </div>

            {/* TOP ROW: 5 PASTEL KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Total Employees */}
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
                        <p className="text-xs font-semibold text-slate-600">Total Employees</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{totalEmployeesCount}</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                            <span>▲</span> +5% <span className="text-slate-500 font-normal">vs. last month</span>
                        </p>
                    </div>
                </motion.div>

                {/* 2. New Hires */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <UserPlus size={20} />
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600">New Hires</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">12</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                            <span>▲</span> +33% <span className="text-slate-500 font-normal">vs. last month</span>
                        </p>
                    </div>
                </motion.div>

                {/* 3. Resignations */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-[#FFF1F2] border border-[#FFE4E6] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                        <LogOut size={20} />
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600">Resignations</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">3</p>
                        <p className="text-xs font-semibold text-rose-500 mt-2 flex items-center gap-1">
                            <span>▼</span> -57% <span className="text-slate-500 font-normal">vs. last month</span>
                        </p>
                    </div>
                </motion.div>

                {/* 4. Attendance Rate */}
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
                        <p className="text-xs font-semibold text-slate-600">Attendance Rate</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">96%</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                            <span>▲</span> +2% <span className="text-slate-500 font-normal">vs. last month</span>
                        </p>
                    </div>
                </motion.div>

                {/* 5. Avg. Time to Hire */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Clock size={20} />
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600">Avg. Time to Hire</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">18 <span className="text-lg font-bold text-slate-700">days</span></p>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                            <span>▼</span> -36% <span className="text-slate-500 font-normal">vs. last month</span>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* MIDDLE ROW: 3 CHARTS (Employee Distribution, Recruitment Status, Leave Trend) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Employee Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs"
                >
                    <h3 className="font-bold text-slate-800 text-base mb-4">Employee Distribution</h3>
                    <div className="h-[230px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={employeeDistribution} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="department" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 12 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 11 }} 
                                    domain={[0, 80]}
                                    ticks={[0, 20, 40, 60, 80]}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#F8FAFC' }} 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    <LabelList dataKey="count" position="top" fill="#475569" fontSize={11} fontWeight={600} />
                                    {employeeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 2. Recruitment Status Donut */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col"
                >
                    <h3 className="font-bold text-slate-800 text-base mb-2">Recruitment Status</h3>
                    <div className="flex-1 flex items-center justify-between">
                        {/* Donut with center text */}
                        <div className="relative w-1/2 h-[200px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={recruitmentStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={72}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {recruitmentStatus.map((entry, index) => (
                                            <Cell key={`pie-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                <span className="text-[10px] text-slate-400 font-medium">Total Openings</span>
                                <span className="text-2xl font-black text-slate-800 leading-tight">24</span>
                            </div>
                        </div>

                        {/* Legend matching mockup */}
                        <div className="w-1/2 flex flex-col justify-center space-y-2.5 text-xs pl-2">
                            {recruitmentStatus.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-600 font-medium">{item.name}</span>
                                    <span className="font-bold text-slate-800 ml-auto">{item.value}</span>
                                    <span className="text-slate-400 text-[11px]">({item.percent}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* 3. Leave Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs"
                >
                    <h3 className="font-bold text-slate-800 text-base mb-4">Leave Trend</h3>
                    <div className="h-[230px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={leaveTrend} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 12 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 11 }} 
                                    domain={[0, 40]}
                                    ticks={[0, 10, 20, 30, 40]}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="leaves" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2.5} 
                                    dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} 
                                    activeDot={{ r: 6 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* BOTTOM ROW: 3 CARDS (Recent Employees, Employee Satisfaction, Key Highlights) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Recent Employees Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                    <h3 className="font-bold text-slate-800 text-base mb-4">Recent Employees</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                                    <th className="pb-3 font-medium">Name</th>
                                    <th className="pb-3 font-medium">Designation</th>
                                    <th className="pb-3 font-medium">Department</th>
                                    <th className="pb-3 font-medium">Joining Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentEmployees.map((emp, i) => (
                                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-full ${emp.bg} flex items-center justify-center font-bold text-xs shrink-0`}>
                                                {emp.avatar}
                                            </div>
                                            <span className="font-bold text-slate-800">{emp.name}</span>
                                        </td>
                                        <td className="py-3 text-slate-600">{emp.role}</td>
                                        <td className="py-3 text-slate-500">{emp.department}</td>
                                        <td className="py-3 text-slate-400 whitespace-nowrap">{emp.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* 2. Employee Satisfaction Radial Gauge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center"
                >
                    <div className="w-full text-left">
                        <h3 className="font-bold text-slate-800 text-base">Employee Satisfaction</h3>
                    </div>

                    {/* Circular Arc / Gauge */}
                    <div className="relative w-36 h-36 flex items-center justify-center my-2">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {/* Track */}
                            <circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                fill="transparent" 
                                stroke="#F1F5F9" 
                                strokeWidth="8" 
                            />
                            {/* Gauge Arc (4.2 out of 5 = 84%) */}
                            <circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                fill="transparent" 
                                stroke="#10B981" 
                                strokeWidth="8" 
                                strokeDasharray="251.2" 
                                strokeDashoffset={251.2 * (1 - 0.84)} 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-black text-slate-800 leading-none">
                                4.2<span className="text-xs font-semibold text-slate-400">/5</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium mt-1">Overall Rating</span>
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-emerald-500 my-1">
                        {[1, 2, 3, 4].map(s => (
                            <Star key={s} size={16} fill="currentColor" />
                        ))}
                        <Star size={16} className="text-slate-200" fill="#E2E8F0" />
                    </div>

                    {/* Trend Pill */}
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                        <span>▲</span> +0.3 <span className="font-normal text-slate-500">vs. last survey</span>
                    </div>
                </motion.div>

                {/* 3. Key Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                    <h3 className="font-bold text-slate-800 text-base mb-3">Key Highlights</h3>
                    <div className="space-y-3">
                        {keyHighlights.map((hl, i) => (
                            <div key={i} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className={`w-9 h-9 rounded-full ${hl.bg} flex items-center justify-center shrink-0 shadow-xs`}>
                                    <hl.icon size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{hl.title}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{hl.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* EXPANDABLE SECTION: AUDITS LÉGAUX & IA PREDICTIVE */}
            <div className="pt-2">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 px-3 rounded-lg hover:bg-slate-100"
                >
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <span>Conformité Légale & Alertes Rétention IA</span>
                    {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6 pt-4 overflow-hidden"
                        >
                            <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
                                <div className="lg:col-span-2">
                                    <ComplianceMonitor />
                                </div>
                                <div className="lg:col-span-2">
                                    {predictiveInsights && predictiveInsights.length > 0 ? (
                                        <div className="bg-indigo-950 text-white rounded-2xl shadow-md p-6 h-full border border-indigo-900">
                                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-200">
                                                <Sparkles size={20} className="text-amber-400" />
                                                IA Prédictive : Alertes Rétention
                                            </h3>
                                            <div className="space-y-3">
                                                {predictiveInsights.slice(0, 3).map((insight, idx) => (
                                                    <div key={idx} className="bg-white/10 rounded-xl p-3 border border-white/10">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-sm text-white">{insight.name}</span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${insight.riskLevel === 'Élevé' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
                                                                Risque {insight.riskLevel}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-indigo-200 mt-1 line-clamp-2">{insight.reason}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-slate-100 rounded-2xl p-6 h-full flex flex-col justify-center items-center text-center">
                                            <ShieldCheck size={36} className="text-emerald-500 mb-2" />
                                            <h4 className="font-bold text-slate-800 text-sm">Climat Social Optimal</h4>
                                            <p className="text-xs text-slate-500 mt-1 max-w-xs">Aucun risque critique de turnover détecté ce mois-ci par le modèle prédictif.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
