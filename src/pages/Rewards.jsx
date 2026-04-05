import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BADGES = {
    'Platine': { color: 'from-purple-500 to-indigo-600', icon: '💎' },
    'Or':      { color: 'from-amber-400 to-orange-500',  icon: '🥇' },
    'Argent':  { color: 'from-slate-300 to-slate-400',   icon: '🥈' },
    'Bronze':  { color: 'from-orange-300 to-amber-400',  icon: '🥉' },
};

export function Rewards() {
    const { token, user } = useAuth();
    const isHR = user?.role === 'Administrator' || user?.role === 'HR';
    const [leaderboard, setLeaderboard] = useState([]);
    const [history, setHistory] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [activeTab, setActiveTab] = useState('leaderboard');
    const [showAward, setShowAward] = useState(false);
    const [form, setForm] = useState({ employeeId: '', points: '', reason: '' });
    const [notification, setNotification] = useState(null);

    const load = async () => {
        const [lb, hist] = await Promise.all([
            fetch(`${API_URL}/api/rewards/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/api/rewards/my-history`,  { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
        ]);
        setLeaderboard(lb); setHistory(hist);
    };

    useEffect(() => {
        if (!token) return;
        load();
        if (isHR) fetch(`${API_URL}/api/employees`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []).then(setEmployees);
    }, [token]);

    const notify = (m) => { setNotification(m); setTimeout(() => setNotification(null), 3000); };

    const handleAward = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/rewards/award`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...form, points: parseInt(form.points) })
        });
        if (res.ok) { setShowAward(false); load(); notify(`${form.points} pts attribués !`); }
    };

    const me = leaderboard.find(e => e.name === user?.name);
    const top3 = leaderboard.slice(0, 3);

    return (
        <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            {notification && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
                    <Check size={18} />{notification}
                </motion.div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Trophy className="text-amber-500" /> Programme de Récompenses</h2>
                    <p className="text-slate-500 mt-1">Reconnaissance et engagement des équipes.</p>
                </div>
                {isHR && <Button onClick={() => setShowAward(true)} className="bg-amber-500 hover:bg-amber-600 text-white gap-2"><Star size={16} /> Attribuer des Points</Button>}
            </div>

            {/* My score banner */}
            {me && (
                <Card className="mb-6 shadow-sm border-0 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">{BADGES[me.badge]?.icon}</div>
                        <div>
                            <p className="text-indigo-200 text-sm">Mon classement</p>
                            <p className="text-2xl font-bold">#{me.rank} — {me.name}</p>
                            <p className="text-indigo-200 text-sm">{me.total} points · Badge {me.badge}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-2 mb-6">
                {[['leaderboard','🏆 Classement'],['history','📋 Mon Historique']].map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === id ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'leaderboard' && (
                <>
                    {top3.length > 0 && (
                        <div className="flex items-end justify-center gap-4 mb-6 h-36">
                            {[top3[1], top3[0], top3[2]].filter(Boolean).map((e, i) => {
                                const h = ['h-24','h-36','h-20'][i];
                                const bg = ['bg-slate-300','bg-amber-400','bg-orange-300'][i];
                                return (
                                    <motion.div key={e.employeeId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                        className={`flex flex-col items-center justify-end ${h} w-28 ${bg} rounded-t-2xl p-3 text-center shadow-md`}>
                                        <p className="text-2xl">{BADGES[e.badge]?.icon}</p>
                                        <p className="text-xs font-bold text-white mt-1">{e.name.split(' ')[0]}</p>
                                        <p className="text-xs text-white/80">{e.total} pts</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                    <Card className="shadow-sm border-slate-200">
                        <CardContent className="p-0">
                            <table className="w-full">
                                <thead><tr className="border-b border-slate-100">
                                    {['#','Employé','Département','Badge','Points'].map(h => <th key={h} className="text-left p-4 text-xs font-medium text-slate-500">{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {leaderboard.map(e => (
                                        <tr key={e.employeeId} className={`border-b border-slate-50 hover:bg-slate-50 ${e.name === user?.name ? 'bg-indigo-50' : ''}`}>
                                            <td className="p-4 font-bold text-slate-500">#{e.rank}</td>
                                            <td className="p-4 font-medium">{e.name}</td>
                                            <td className="p-4 text-slate-500 text-sm">{e.department}</td>
                                            <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-medium text-white bg-gradient-to-r ${BADGES[e.badge]?.color}`}>{BADGES[e.badge]?.icon} {e.badge}</span></td>
                                            <td className="p-4 font-bold text-indigo-700">{e.total} pts</td>
                                        </tr>
                                    ))}
                                    {!leaderboard.length && <tr><td colSpan={5} className="p-10 text-center text-slate-400">Aucun point attribué.</td></tr>}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </>
            )}

            {activeTab === 'history' && (
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead><tr className="border-b border-slate-100">
                                {['Date','Raison','Points'].map(h => <th key={h} className="text-left p-4 text-xs font-medium text-slate-500">{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {history.map(h => (
                                    <tr key={h.id} className="border-b border-slate-50">
                                        <td className="p-4 text-slate-500 text-sm">{new Date(h.createdAt).toLocaleDateString('fr-FR')}</td>
                                        <td className="p-4 font-medium">{h.reason}</td>
                                        <td className="p-4 font-bold text-emerald-600">+{h.points} pts</td>
                                    </tr>
                                ))}
                                {!history.length && <tr><td colSpan={3} className="p-10 text-center text-slate-400">Aucun point reçu.</td></tr>}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {showAward && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-amber-500 to-orange-500 flex justify-between">
                            <h3 className="text-lg font-bold text-white">Attribuer des Points</h3>
                            <button onClick={() => setShowAward(false)} className="text-white bg-transparent border-0 cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleAward} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Employé</label>
                                <select required value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                    <option value="">Choisir...</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                </select>
                            </div>
                            <div><label className="text-sm font-medium text-slate-700 block mb-1">Points</label><Input type="number" min="1" required value={form.points} onChange={e => setForm({...form, points: e.target.value})} placeholder="Ex: 50" /></div>
                            <div><label className="text-sm font-medium text-slate-700 block mb-1">Raison</label><Input required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Ex: Projet livré en avance" /></div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setShowAward(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white"><Zap size={14} className="mr-1" />Attribuer</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
