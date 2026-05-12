import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, AlertOctagon, UserCheck, GripVertical, Radar as RadarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BOX_LABELS = {
    'High-Low': { title: 'L\'Énigme', bg: 'bg-amber-100', border: 'border-amber-300' },
    'High-Medium': { title: 'Haut Potentiel', bg: 'bg-blue-100', border: 'border-blue-300' },
    'High-High': { title: 'Futur Leader', bg: 'bg-emerald-200', border: 'border-emerald-400' },
    
    'Medium-Low': { title: 'Joueur Inconstant', bg: 'bg-orange-100', border: 'border-orange-300' },
    'Medium-Medium': { title: 'Employé Clé', bg: 'bg-green-100', border: 'border-green-300' },
    'Medium-High': { title: 'Pilier Constant', bg: 'bg-emerald-100', border: 'border-emerald-300' },
    
    'Low-Low': { title: 'Sous-performant', bg: 'bg-red-200', border: 'border-red-400' },
    'Low-Medium': { title: 'Efficace', bg: 'bg-yellow-100', border: 'border-yellow-300' },
    'Low-High': { title: 'Expert Local', bg: 'bg-green-50', border: 'border-green-200' },
};

export function TalentManagement() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('9box');
    const [talents, setTalents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTalents = async () => {
        try {
            const res = await fetch(`${API_URL}/api/talents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTalents(data);
            }
        } catch (e) {
            console.error("Erreur récupération talents:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTalents();
    }, [token]);

    const handleDrop = async (e, targetPotential, targetPerformance) => {
        e.preventDefault();
        const employeeId = e.dataTransfer.getData('employeeId');
        
        // Optimistic UI update
        setTalents(prev => prev.map(t => 
            t.id === employeeId ? { ...t, potential: targetPotential, performance: targetPerformance } : t
        ));

        // Call API to update talent profile
        const targetEmp = talents.find(t => t.id === employeeId);
        if (targetEmp) {
            fetch(`${API_URL}/api/talents/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    potential: targetPotential,
                    performance: targetPerformance,
                    flightRisk: targetEmp.flightRisk,
                    readiness: targetEmp.readiness
                })
            }).catch(e => console.error(e));
        }
    };

    const handleDragStart = (e, employeeId) => {
        e.dataTransfer.setData('employeeId', employeeId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const updateOtherFields = async (id, field, value) => {
        const targetEmp = talents.find(t => t.id === id);
        
        // Optimistic UI
        setTalents(prev => prev.map(t => 
            t.id === id ? { ...t, [field]: value } : t
        ));

        await fetch(`${API_URL}/api/talents/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                ...targetEmp,
                [field]: value
            })
        });
    };

    // Filter talents locally for specific lists
    const flightRisks = talents.filter(t => t.flightRisk === 'High' && (t.performance === 'High' || t.potential === 'High'));
    const successors = talents.filter(t => t.readiness === 'Ready now' || t.readiness === '1-2 years');

    return (
        <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Target className="text-indigo-600" /> Gestion des Talents
                    </h2>
                    <p className="text-slate-500 mt-1">Cartographie 9-Box, Risques de départ et Plans de Relève.</p>
                </div>
            </div>

            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
                {[
                    { id: '9box', label: 'Matrice 9-Box', icon: Target },
                    { id: 'succession', label: 'Plan de Succession', icon: UserCheck },
                    { id: 'retention', label: 'Risque de Départ (Rétention)', icon: AlertOctagon },
                    { id: 'skills', label: 'Cartographie Compétences', icon: RadarIcon }
                ].map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-medium transition-all ${
                            activeTab === id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
                        }`}>
                        <Icon size={18} /> {label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12 text-slate-500">Chargement des profils...</div>
            ) : (
                <div className="space-y-6">
                    {activeTab === '9box' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                            <div className="flex text-center font-bold text-slate-500 text-sm mb-2">
                                <div className="w-12 shrink-0"></div>
                                <div className="flex-1">Performance Faible</div>
                                <div className="flex-1">Performance Moyenne</div>
                                <div className="flex-1">Performance Élevée</div>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                {['High', 'Medium', 'Low'].map((pot) => (
                                    <div key={pot} className="flex min-w-max gap-4">
                                        <div className="w-12 shrink-0 flex items-center justify-center font-bold text-slate-500 text-sm -rotate-90">
                                            Potentiel {pot === 'High' ? 'Élevé' : pot === 'Medium' ? 'Moyen' : 'Faible'}
                                        </div>
                                        {['Low', 'Medium', 'High'].map((perf) => {
                                            const cellId = `${pot}-${perf}`;
                                            const boxInfo = BOX_LABELS[cellId];
                                            const cellTalents = talents.filter(t => t.potential === pot && t.performance === perf);

                                            return (
                                                <div 
                                                    key={perf}
                                                    className={`flex-1 min-w-[250px] min-h-[160px] rounded-lg border-2 ${boxInfo.border} ${boxInfo.bg} p-3 flex flex-col`}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, pot, perf)}
                                                >
                                                    <div className="text-xs font-bold text-slate-600 mb-2 border-b border-black/10 pb-1">
                                                        {boxInfo.title}
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        {cellTalents.map(emp => (
                                                            <div 
                                                                key={emp.id}
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, emp.id)}
                                                                className="bg-white/90 backdrop-blur-sm p-2 rounded shadow-sm border border-black/5 text-sm flex items-center justify-between cursor-grab active:cursor-grabbing group"
                                                            >
                                                                <div>
                                                                    <div className="font-semibold text-slate-800">{emp.name}</div>
                                                                    <div className="text-xs text-slate-500">{emp.position}</div>
                                                                </div>
                                                                <GripVertical size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'succession' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['Ready now', '1-2 years'].map(readyFilter => (
                                <Card key={readyFilter} className="shadow-sm border-slate-200">
                                    <CardContent className="p-6">
                                        <h3 className="font-bold text-lg mb-4 text-indigo-900 flex items-center gap-2">
                                            {readyFilter === 'Ready now' ? '✅ Prêts Immédiatement' : '⏳ Prêts d\'ici 1 à 2 ans'}
                                        </h3>
                                        <div className="space-y-3">
                                            {talents.filter(t => t.readiness === readyFilter).map(emp => (
                                                <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <div>
                                                        <p className="font-medium text-slate-900">{emp.name}</p>
                                                        <p className="text-xs text-slate-500">{emp.position} · {emp.department}</p>
                                                    </div>
                                                    <select 
                                                        value={emp.readiness} 
                                                        onChange={(e) => updateOtherFields(emp.id, 'readiness', e.target.value)}
                                                        className="text-xs border-slate-200 rounded px-2 py-1 text-slate-600 bg-white"
                                                    >
                                                        <option value="Ready now">Prêt</option>
                                                        <option value="1-2 years">1-2 ans</option>
                                                        <option value="3-5 years">3-5 ans</option>
                                                    </select>
                                                </div>
                                            ))}
                                            {talents.filter(t => t.readiness === readyFilter).length === 0 && (
                                                <div className="text-sm text-slate-400 p-4 text-center">Aucun employé dans cette catégorie.</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === 'retention' && (
                        <Card className="shadow-sm border-red-200">
                            <CardContent className="p-0">
                                <table className="w-full text-left bg-white rounded-lg">
                                    <thead className="bg-red-50 text-red-900 border-b border-red-100">
                                        <tr>
                                            <th className="p-4 font-medium text-sm">Employé Clé</th>
                                            <th className="p-4 font-medium text-sm">Poste</th>
                                            <th className="p-4 font-medium text-sm">Performance / Potentiel</th>
                                            <th className="p-4 font-medium text-sm">Risque de Départ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {talents.map(emp => (
                                            <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50">
                                                <td className="p-4 font-medium text-slate-900">{emp.name}</td>
                                                <td className="p-4 text-slate-600 text-sm">{emp.position}</td>
                                                <td className="p-4 text-sm">
                                                    Perf: {emp.performance} | Pot: {emp.potential}
                                                </td>
                                                <td className="p-4">
                                                    <select 
                                                        value={emp.flightRisk} 
                                                        onChange={(e) => updateOtherFields(emp.id, 'flightRisk', e.target.value)}
                                                        className={`text-sm rounded-md px-3 py-1.5 border font-medium ${
                                                            emp.flightRisk === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                                                            emp.flightRisk === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                        }`}
                                                    >
                                                        <option value="High">Élevé (Alerte)</option>
                                                        <option value="Medium">Moyen</option>
                                                        <option value="Low">Faible</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                        {talents.length === 0 && (
                                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Aucun employé enregistré.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'skills' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {talents.map(emp => {
                                // Données simulées pour la démo, idéalement venant du backend
                                const skillData = [
                                    { subject: 'Leadership', A: Math.floor(Math.random() * 60) + 40, fullMark: 100 },
                                    { subject: 'Tech', A: Math.floor(Math.random() * 60) + 40, fullMark: 100 },
                                    { subject: 'Com', A: Math.floor(Math.random() * 60) + 40, fullMark: 100 },
                                    { subject: 'Gestion Projet', A: Math.floor(Math.random() * 60) + 40, fullMark: 100 },
                                    { subject: 'Innovation', A: Math.floor(Math.random() * 60) + 40, fullMark: 100 },
                                    { subject: 'Esprit d\'équipe', A: Math.floor(Math.random() * 60) + 40, fullMark: 100 },
                                ];
                                return (
                                    <Card key={emp.id} className="shadow-sm border-indigo-100 hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 font-black flex items-center justify-center text-lg">
                                                    {emp.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{emp.name}</h3>
                                                    <p className="text-xs text-slate-500">{emp.position}</p>
                                                </div>
                                            </div>
                                            <div className="h-[250px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                                                        <PolarGrid stroke="#e2e8f0" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                        <Radar name="Compétences" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
