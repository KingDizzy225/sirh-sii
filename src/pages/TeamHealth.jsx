import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShieldAlert, Activity, HeartPulse, TrendingDown, RefreshCw, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TeamHealth() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzingId, setAnalyzingId] = useState(null);
    const [riskScores, setRiskScores] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(`${API_URL}/api/employees`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setEmployees(data.filter(e => e.status === 'ACTIVE'));
                }
            } catch (err) {
                console.error("Failed to load employees", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, [token]);

    const handleAnalyzeRisk = async (employeeId) => {
        setAnalyzingId(employeeId);
        try {
            const res = await fetch(`${API_URL}/api/analytics/flight-risk/${employeeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const insight = await res.json();
                setRiskScores(prev => ({ ...prev, [employeeId]: insight }));
            }
        } catch (err) {
            console.error("Failed to analyze flight risk", err);
        } finally {
            setAnalyzingId(null);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Chargement des données de santé d'équipe...</div>;

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <HeartPulse className="text-rose-500" size={32} />
                        Santé d'Équipe & Rétention
                    </h2>
                    <p className="text-slate-500 font-medium">Surveillez le risque de Burnout et le Flight Risk (risque de démission) par IA.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {employees.map(emp => {
                    const insight = riskScores[emp.id];
                    const isAnalyzing = analyzingId === emp.id;

                    return (
                        <Card key={emp.id} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow relative group">
                            {insight?.riskLevel === 'Élevé' && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                            )}
                            {insight?.riskLevel === 'Moyen' && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                            )}
                            {insight?.riskLevel === 'Faible' && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            )}
                            
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-black text-slate-600 shrink-0">
                                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">{emp.firstName} {emp.lastName}</h3>
                                            <p className="text-sm text-slate-500">{emp.positionTitle} • {emp.department}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {insight ? (
                                            <div className="flex flex-col items-end text-right min-w-[250px]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flight Risk</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-black
                                                        ${insight.riskLevel === 'Élevé' ? 'bg-rose-100 text-rose-700' : 
                                                          insight.riskLevel === 'Moyen' ? 'bg-amber-100 text-amber-700' : 
                                                          'bg-emerald-100 text-emerald-700'}
                                                    `}>
                                                        {insight.riskLevel} ({insight.riskScore}%)
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 italic max-w-sm">"{insight.reason}"</p>
                                            </div>
                                        ) : (
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Non Analysé</p>
                                                <Button 
                                                    onClick={() => handleAnalyzeRisk(emp.id)}
                                                    disabled={isAnalyzing}
                                                    variant="outline"
                                                    className="bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold"
                                                >
                                                    {isAnalyzing ? (
                                                        <><RefreshCw size={16} className="mr-2 animate-spin" /> Analyse IA...</>
                                                    ) : (
                                                        <><Activity size={16} className="mr-2" /> Prédire le Risque</>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
