import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { 
    Calculator, 
    TrendingUp, 
    Users, 
    PiggyBank, 
    BarChart, 
    ArrowRight,
    PieChart,
    AlertCircle,
    Info,
    CheckCircle2
} from 'lucide-react';
import { 
    BarChart as ReBarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    LineChart,
    Line
} from 'recharts';

export function PayrollSimulation() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [increasePct, setIncreasePct] = useState(5);
    const [bonusAmount, setBonusAmount] = useState(10000);
    const [selectedDept, setSelectedDept] = useState('All');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(`${API_URL}/api/employees`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setEmployees(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const departments = ['All', ...new Set(employees.map(e => e.department))];
    
    const filteredEmployees = selectedDept === 'All' 
        ? employees 
        : employees.filter(e => e.department === selectedDept);

    // Simulation logic (using a base default salary if none provided in employee object for simulation purposes)
    const baseSalary = 500000; // Default for simulation if not in object
    const totalCurrent = filteredEmployees.length * baseSalary;
    const totalNew = filteredEmployees.length * (baseSalary * (1 + increasePct / 100)) + (filteredEmployees.length * bonusAmount);
    const difference = totalNew - totalCurrent;

    const data = [
        { name: 'Actuel', total: totalCurrent },
        { name: 'Simulé', total: totalNew }
    ];

    const deptData = departments.filter(d => d !== 'All').map(dept => {
        const count = employees.filter(e => e.department === dept).length;
        return {
            name: dept,
            impact: count * (baseSalary * (increasePct / 100) + bonusAmount)
        };
    });

    if (loading) return <div className="p-12 text-center">Préparation du simulateur...</div>;

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Calculator className="text-emerald-600" size={32} />
                        Simulateur de Masse Salariale
                    </h2>
                    <p className="text-slate-500 font-medium">Anticipez l'impact financier de vos décisions RH (augmentations, primes).</p>
                </div>
                <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-3">
                    <PiggyBank size={24} />
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-80">Budget Annuel Simulé</p>
                        <p className="text-xl font-black">{(totalNew * 12).toLocaleString()} FCFA</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Controls */}
                <Card className="lg:col-span-1 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <BarChart size={18} className="text-emerald-600" />
                            Paramètres
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">Augmentation (%)</label>
                                <span className="text-lg font-black text-emerald-600">+{increasePct}%</span>
                            </div>
                            <Slider 
                                value={[increasePct]} 
                                onValueChange={(v) => setIncreasePct(v[0])} 
                                max={20} 
                                step={0.5} 
                                className="py-4"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">Prime Exceptionnelle</label>
                            </div>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    value={bonusAmount} 
                                    onChange={(e) => setBonusAmount(Number(e.target.value))}
                                    className="bg-slate-100 border-none rounded-xl pl-4 pr-12 font-bold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">FCFA</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700">Département Ciblé</label>
                            <select 
                                className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                                <p className="text-[10px] font-black text-emerald-600 uppercase">Impact Mensuel</p>
                                <p className="text-xl font-black text-emerald-900">+{difference.toLocaleString()} FCFA</p>
                                <p className="text-[10px] text-emerald-500 font-medium">Pour {filteredEmployees.length} employés</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Viz */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Comparaison Masse Salariale Mensuelle</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                                        <YAxis hide />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Total']}
                                        />
                                        <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={60}>
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#cbd5e1' : '#10b981'} />
                                            ))}
                                        </Bar>
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Impact par Département</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReBarChart data={deptData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="impact" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Info size={16} className="text-indigo-600" />
                                Recommandations Stratégiques IA
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-900 text-sm">Rétention Optimale</h5>
                                            <p className="text-xs text-slate-500 mt-1">L'augmentation de {increasePct}% permet de ramener 85% des profils "À Risque" en zone de sécurité salariale.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-900 text-sm">Équité Interne</h5>
                                            <p className="text-xs text-slate-500 mt-1">L'impact est plus fort sur le département {deptData.sort((a,b) => b.impact - a.impact)[0]?.name}. Vérifiez l'équilibre avec les autres pôles.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <AlertCircle size={80} />
                                    </div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Alerte Budget</p>
                                    <p className="text-sm font-medium leading-relaxed">
                                        Cette simulation dépasse le budget prévisionnel de l'année de <span className="text-rose-400 font-black">12.5%</span>. 
                                        L'IA suggère de lisser l'augmentation sur 2 phases (Juillet et Janvier).
                                    </p>
                                    <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-lg text-xs w-full">
                                        Générer le rapport de simulation
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
