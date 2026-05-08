import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    Heart, 
    Trophy, 
    Award, 
    Star, 
    Send, 
    MessageSquare, 
    Users, 
    TrendingUp, 
    Medal,
    Lightbulb,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function KudosWall() {
    const [kudos, setKudos] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        receiverId: '',
        message: '',
        category: 'Teamwork'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    const fetchData = async () => {
        try {
            const [kRes, lRes, eRes] = await Promise.all([
                fetch(`${API_URL}/api/kudos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/kudos/leaderboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/employees`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (kRes.ok) setKudos(await kRes.json());
            if (lRes.ok) setLeaderboard(await lRes.json());
            if (eRes.ok) setEmployees(await eRes.json());
        } catch (error) {
            console.error("Error fetching kudos data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSendKudo = async (e) => {
        e.preventDefault();
        if (!formData.receiverId || !formData.message) return;
        
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/kudos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setFormData({ receiverId: '', message: '', category: 'Teamwork' });
                fetchData(); // Refresh list and leaderboard
            } else {
                const err = await res.json();
                alert(err.error || "Erreur lors de l'envoi");
            }
        } catch (error) {
            console.error("Error sending kudo", error);
        } finally {
            setSending(false);
        }
    };

    const categories = [
        { id: 'Teamwork', icon: <Users size={16} />, color: 'blue', label: 'Esprit d\'équipe' },
        { id: 'Innovation', icon: <Lightbulb size={16} />, color: 'amber', label: 'Innovation' },
        { id: 'Leadership', icon: <ShieldCheck size={16} />, color: 'indigo', label: 'Leadership' },
        { id: 'Efficiency', icon: <Zap size={16} />, color: 'emerald', label: 'Efficacité' }
    ];

    if (loading) return <div className="p-12 text-center">Chargement de l'espace reconnaissance...</div>;

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Heart className="text-rose-500 fill-rose-500" size={32} />
                        Kudos & Reconnaissance
                    </h2>
                    <p className="text-slate-500 font-medium">Célébrez les succès de vos collègues et gagnez des points de récompense.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <div className="px-4 py-2 border-r border-slate-100 flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Kudos</span>
                        <span className="text-lg font-black text-slate-900">{kudos.length}</span>
                    </div>
                    <div className="px-4 py-2 flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points Distribués</span>
                        <span className="text-lg font-black text-indigo-600">{kudos.length * 50}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1: Send Kudo Form */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                            <Send size={120} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Award className="text-amber-400" size={20} />
                                Envoyer un Kudo
                            </CardTitle>
                            <CardDescription className="text-slate-400">Dites merci ou félicitez un collègue publiquement.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSendKudo} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">À qui ?</label>
                                    <select 
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.receiverId}
                                        onChange={(e) => setFormData({...formData, receiverId: e.target.value})}
                                        required
                                    >
                                        <option value="">Sélectionner un collègue...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Catégorie</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setFormData({...formData, category: cat.id})}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all border-2 ${formData.category === cat.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700'}`}
                                            >
                                                {cat.icon}
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Votre message</label>
                                    <textarea 
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                                        placeholder="Pourquoi ce collègue mérite-t-il un kudo ?"
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        required
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={sending}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 rounded-xl shadow-lg shadow-indigo-900/20"
                                >
                                    {sending ? "Envoi..." : "Envoyer le Kudo (+50 pts)"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Leaderboard Card */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Medal size={16} className="text-amber-500" />
                                Top Talents du Mois
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {leaderboard.map((item, idx) => (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{item.employee.firstName} {item.employee.lastName}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-medium">{item.employee.department}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-indigo-600">{item.total} pts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2 & 3: Kudos Wall Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-600" />
                            Activités Récentes
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {kudos.map((kudo, idx) => (
                                <motion.div
                                    key={kudo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col sm:flex-row">
                                                {/* Left Indicator bar with Category Icon */}
                                                <div className={`w-1 sm:w-2 ${kudo.category === 'Innovation' ? 'bg-amber-500' : kudo.category === 'Leadership' ? 'bg-indigo-500' : kudo.category === 'Efficiency' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                                
                                                <div className="flex-1 p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 shadow-inner">
                                                                {kudo.sender.firstName[0]}{kudo.sender.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm">
                                                                    <span className="font-black text-slate-900">{kudo.sender.firstName}</span>
                                                                    <span className="text-slate-400 mx-2 font-medium">a envoyé un Kudo à</span>
                                                                    <span className="font-black text-indigo-600">{kudo.receiver.firstName} {kudo.receiver.lastName}</span>
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Il y a {idx + 1} heures</p>
                                                            </div>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${kudo.category === 'Innovation' ? 'bg-amber-100 text-amber-700' : kudo.category === 'Leadership' ? 'bg-indigo-100 text-indigo-700' : kudo.category === 'Efficiency' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {kudo.category}
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 rounded-2xl p-5 relative">
                                                        <MessageSquare className="absolute -top-2 -left-2 text-slate-200" size={24} />
                                                        <p className="text-slate-700 text-sm leading-relaxed italic">"{kudo.message}"</p>
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                                        <div className="flex items-center gap-4">
                                                            <button className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 hover:text-rose-500 transition-colors">
                                                                <Heart size={14} /> J'aime
                                                            </button>
                                                            <button className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-colors">
                                                                <Star size={14} /> Inspirant
                                                            </button>
                                                        </div>
                                                        <div className="flex -space-x-2">
                                                            {[1,2,3].map(i => (
                                                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200" />
                                                            ))}
                                                            <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">+5</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
