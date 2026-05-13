import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Scale, AlertTriangle, TrendingUp, TrendingDown, Info, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function PayEquityScanner() {
    const { token } = useAuth();
    const [data, setData] = useState({ departments: [], outliers: [] });
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/equity`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) {
        return <div className="flex-1 p-8 flex items-center justify-center text-slate-500">Analyse de la base de données en cours...</div>;
    }

    const safeDepartments = data?.departments || [];
    const safeOutliers = data?.outliers || [];

    const filteredDepartments = selectedDept === 'All' ? safeDepartments : safeDepartments.filter(d => d.department === selectedDept);
    
    // Prepare data for Scatter Chart
    const scatterDataM = [];
    const scatterDataF = [];
    let xIndex = 1;

    filteredDepartments.forEach(dept => {
        Object.values(dept.positions || {}).forEach(pos => {
            (pos.employees || []).forEach(emp => {
                const point = {
                    x: xIndex++, // Spread out on X
                    name: emp.name,
                    salary: emp.salary,
                    department: dept.department,
                    position: pos.title,
                    positionAvg: pos.avgSalary
                };
                if (emp.gender === 'M') scatterDataM.push(point);
                else scatterDataF.push(point);
            });
        });
    });

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-sm">
                    <p className="font-bold text-slate-800">{data.name}</p>
                    <p className="text-slate-500 text-xs">{data.position} ({data.department})</p>
                    <div className="mt-2 text-indigo-600 font-mono font-bold">{data.salary.toLocaleString()} FCFA</div>
                    <div className="text-[10px] text-slate-400">Moyenne du poste: {data.positionAvg.toLocaleString()} FCFA</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Scale className="text-emerald-600" /> Analyseur d'Équité Salariale (DEI)
                    </h2>
                    <p className="text-slate-500 mt-1">Diagnostic intelligent des écarts de rémunération et de la conformité.</p>
                </div>
                <div className="flex items-center gap-2">
                    <select 
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        <option value="All">Tous les départements</option>
                        {safeDepartments.map(d => (
                            <option key={d.department} value={d.department}>{d.department}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {/* KPI Cards */}
                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-slate-500">Écart Salarial F/H Global</p>
                            <TrendingDown className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {safeDepartments.reduce((sum, d) => sum + (d.payGap || 0), 0) / (safeDepartments.length || 1) > 0 ? '+' : ''}
                            {(safeDepartments.reduce((sum, d) => sum + (d.payGap || 0), 0) / (safeDepartments.length || 1)).toFixed(1)}%
                        </div>
                        <p className="text-xs text-slate-400 mt-1">En faveur des hommes (moyenne)</p>
                    </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-slate-500">Anomalies Détectées</p>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{safeOutliers.length}</div>
                        <p className="text-xs text-slate-400 mt-1">Écarts injustifiés &gt; 15%</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-slate-500">Salaire Moyen (Hommes)</p>
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 font-mono">
                            {Math.round(safeDepartments.reduce((sum, d) => sum + (d.avgSalaryMen || 0), 0) / (safeDepartments.length || 1)).toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">FCFA / mois</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-slate-500">Salaire Moyen (Femmes)</p>
                            <div className="h-2 w-2 rounded-full bg-pink-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 font-mono">
                            {Math.round(safeDepartments.reduce((sum, d) => sum + (d.avgSalaryWomen || 0), 0) / (safeDepartments.length || 1)).toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">FCFA / mois</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle>Nuage de Dispersion des Salaires</CardTitle>
                        <CardDescription>Visualisation de l'équité salariale par genre au sein des départements sélectionnés.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" dataKey="x" name="Employé" hide />
                                    <YAxis 
                                        type="number" 
                                        dataKey="salary" 
                                        name="Salaire" 
                                        tickFormatter={(value) => `${value / 1000}k`}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{strokeDasharray: '3 3'}} />
                                    <Legend iconType="circle" />
                                    <Scatter name="Hommes" data={scatterDataM} fill="#3b82f6" opacity={0.6} />
                                    <Scatter name="Femmes" data={scatterDataF} fill="#ec4899" opacity={0.6} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="bg-amber-50/50 border-b border-amber-100">
                        <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
                            <AlertTriangle size={18} /> Outliers & Recommandations
                        </CardTitle>
                        <CardDescription className="text-amber-700/70">Ajustements suggérés par l'IA</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto bg-slate-50/30">
                        {safeOutliers.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Aucune anomalie majeure détectée (Variance &lt; 15%).</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {safeOutliers.map((outlier, idx) => (
                                    <div key={idx} className="p-4 hover:bg-white transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-slate-800 text-sm">{outlier.name}</span>
                                            <Badge variant={outlier.variance < 0 ? "destructive" : "secondary"} className="text-[10px]">
                                                {outlier.variance > 0 ? '+' : ''}{Math.round(outlier.variance)}%
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-slate-500 mb-2">{outlier.position} • {outlier.department}</div>
                                        
                                        <div className="bg-amber-50 rounded p-2 text-xs text-amber-800 flex gap-2 items-start border border-amber-100">
                                            <Info size={14} className="shrink-0 mt-0.5 text-amber-600" />
                                            <span>{outlier.recommendation}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
