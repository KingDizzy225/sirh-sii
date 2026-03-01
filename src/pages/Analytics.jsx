import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BarChart as BarIcon, PieChart as PieIcon, LineChart as LineIcon, Download, Filter, FileText, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Mock Data
const salaryByDeptData = [
    { name: 'Engineering', Moyenne: 85000, Max: 120000, Min: 60000 },
    { name: 'Sales', Moyenne: 72000, Max: 150000, Min: 45000 },
    { name: 'HR', Moyenne: 65000, Max: 90000, Min: 40000 },
    { name: 'Marketing', Moyenne: 68000, Max: 100000, Min: 45000 },
    { name: 'Finance', Moyenne: 78000, Max: 110000, Min: 55000 },
];

const genderPayGapData = [
    { name: 'Homme', Moyenne: 76000 },
    { name: 'Femme', Moyenne: 74500 },
];

const trainingVsPerformanceData = [
    { name: '0-10h', Performance: 2.8, Employés: 15 },
    { name: '10-20h', Performance: 3.4, Employés: 45 },
    { name: '20-40h', Performance: 4.1, Employés: 60 },
    { name: '40h+', Performance: 4.6, Employés: 20 },
];

const turnoverTrendData = [
    { month: 'Jan', Entrées: 5, Départs: 2 },
    { month: 'Fév', Entrées: 3, Départs: 1 },
    { month: 'Mar', Entrées: 8, Départs: 3 },
    { month: 'Avr', Entrées: 4, Départs: 4 },
    { month: 'Mai', Entrées: 6, Départs: 2 },
    { month: 'Juin', Entrées: 10, Départs: 1 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PIE_COLORS = ['#3b82f6', '#ec4899'];

export function Analytics() {
    const [activeReport, setActiveReport] = useState('Salaires & Équité');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        // Simulate PDF generation delay
        setTimeout(() => {
            setIsExporting(false);
            alert("Rapport 'PDF' généré et téléchargé avec succès.");
        }, 1500);
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 min-h-[calc(100vh-4rem)] bg-slate-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <BarIcon className="h-8 w-8 text-blue-600" />
                        Générateur de Rapports
                    </h2>
                    <p className="text-slate-500 mt-1">Créez et exportez des analyses croisées sur vos données RH.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="bg-white">
                        <Filter className="mr-2 h-4 w-4 text-slate-500" /> Filtres Avancés
                    </Button>
                    <div className="relative group">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2" onClick={handleExport} disabled={isExporting}>
                            {isExporting ? (
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                            ) : (
                                <Download size={16} />
                            )}
                            Exporter
                            <ChevronDown size={14} className="ml-1 opacity-70" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Report Selection */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
                {['Salaires & Équité', 'Performance vs Formations', 'Tendances Turnover', 'Diversité & Inclusion'].map((report) => (
                    <button
                        key={report}
                        onClick={() => setActiveReport(report)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeReport === report
                                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-700/20'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'
                            }`}
                    >
                        {report}
                    </button>
                ))}
            </div>

            {/* Report Content Areas */}
            {activeReport === 'Salaires & Équité' && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Main Bar Chart */}
                    <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle>Moyenne Salariale par Département</CardTitle>
                            <CardDescription>Comparaison des salaires de base (en FCFA / an)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salaryByDeptData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Min" stackId="a" fill="#93c5fd" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="Moyenne" stackId="a" fill="#3b82f6" />
                                    <Bar dataKey="Max" stackId="a" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Gender Pay Gap Pie */}
                    <Card className="col-span-1 shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle>Écart Salarial (Genre)</CardTitle>
                            <CardDescription>Moyenne globale de l'entreprise</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-[350px]">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={genderPayGapData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="Moyenne"
                                    >
                                        {genderPayGapData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => `${value.toLocaleString()} FCFA`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-full mt-4 space-y-2">
                                {genderPayGapData.map((item, i) => (
                                    <div key={item.name} className="flex justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                                            <span className="text-slate-600">{item.name}</span>
                                        </div>
                                        <span className="font-semibold text-slate-900">{item.Moyenne.toLocaleString()} F</span>
                                    </div>
                                ))}
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <Badge variant="outline" className="w-full justify-center bg-green-50 text-green-700 border-green-200">
                                        Écart : 1.9% (Tendance positive)
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeReport === 'Tendances Turnover' && (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle>Flux des effectifs (6 derniers mois)</CardTitle>
                            <CardDescription>Entrées vs Départs</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={turnoverTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="Entrées" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Départs" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardContent className="p-8 flex flex-col justify-center h-full">
                            <h3 className="text-2xl font-bold mb-2">Taux de Turnover Annuel</h3>
                            <div className="text-6xl font-extrabold mb-4">8.4%</div>
                            <p className="text-blue-100 text-lg mb-8">
                                Inférieur à la moyenne sectorielle de 12%. La majorité des départs concernent le premier trimestre.
                            </p>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-blue-50">Principaux motifs de départ</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm bg-white/10 p-2 rounded">
                                        <span>Meilleure opportunité salariale</span>
                                        <span className="font-bold">45%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-white/10 p-2 rounded">
                                        <span>Rapprochement familial</span>
                                        <span className="font-bold">25%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-white/10 p-2 rounded">
                                        <span>Changement de carrière</span>
                                        <span className="font-bold">15%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeReport === 'Performance vs Formations' && (
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Impact des heures de formation sur la Performance</CardTitle>
                        <CardDescription>Corrélation entre l'investissement formation et l'évaluation annuelle (sur 5.0)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trainingVsPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar yAxisId="left" dataKey="Performance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Score Performance (Moyenne)" />
                                <Bar yAxisId="right" dataKey="Employés" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Volume d'employés" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {(activeReport === 'Diversité & Inclusion') && (
                <div className="flex items-center justify-center p-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                    <div className="text-center">
                        <PieIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">Module en construction</h3>
                        <p className="mt-1">Les données de diversité nécessitent une intégration avec le module d'Onboarding.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
