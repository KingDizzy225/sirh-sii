import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Trash2, Pin, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CATEGORY_CONFIG = {
    'Info':          { color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
    'Urgent':        { color: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
    'Événement':     { color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    'Félicitations': { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
};

export function Announcements() {
    const { token, user } = useAuth();
    const isHR = user?.role === 'Administrator' || user?.role === 'HR';
    const [announcements, setAnnouncements] = useState([]);
    const [notification, setNotification] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', body: '', category: 'Info', pinned: false });

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_URL}/api/announcements`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setAnnouncements(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { if (token) fetchAnnouncements(); }, [token]);

    const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(form)
        });
        if (res.ok) {
            setShowForm(false);
            setForm({ title: '', body: '', category: 'Info', pinned: false });
            fetchAnnouncements();
            notify('Annonce publiée !');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette annonce ?')) return;
        const res = await fetch(`${API_URL}/api/announcements/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { fetchAnnouncements(); notify('Annonce supprimée.'); }
    };

    const timeAgo = (d) => {
        const diff = Math.floor((Date.now() - new Date(d)) / 60000);
        if (diff < 60) return `Il y a ${diff} min`;
        if (diff < 1440) return `Il y a ${Math.floor(diff/60)}h`;
        return `Il y a ${Math.floor(diff/1440)}j`;
    };

    return (
        <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <AnimatePresence>
                {notification && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <Check size={18} />{notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Megaphone className="text-blue-600" /> Mur d'Annonces</h2>
                    <p className="text-slate-500 mt-1">Actualités et communications de l'entreprise.</p>
                </div>
                {isHR && (
                    <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Plus size={16} /> Nouvelle Annonce
                    </Button>
                )}
            </div>

            {/* Create Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
                                <h3 className="text-lg font-bold text-white">Nouvelle Annonce</h3>
                                <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Titre</label>
                                    <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Réunion générale vendredi" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Message</label>
                                    <textarea required rows={4} value={form.body} onChange={e => setForm({...form, body: e.target.value})}
                                        placeholder="Rédigez votre annonce ici..."
                                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1">Catégorie</label>
                                        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                            {Object.keys(CATEGORY_CONFIG).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={form.pinned} onChange={e => setForm({...form, pinned: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                                            <span className="text-sm font-medium text-slate-700">Épingler en haut</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Publier</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Announcement Feed */}
            <div className="max-w-2xl mx-auto space-y-4">
                {announcements.length === 0 && (
                    <div className="text-center py-24 text-slate-400">
                        <Megaphone size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Aucune annonce pour le moment.</p>
                    </div>
                )}
                {announcements.map((a, i) => {
                    const cat = CATEGORY_CONFIG[a.category] || CATEGORY_CONFIG['Info'];
                    return (
                        <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className={`shadow-sm border-slate-200 ${a.pinned ? 'border-l-4 border-l-blue-500' : ''}`}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {a.pinned && <span className="flex items-center gap-1 text-xs text-blue-600 font-medium"><Pin size={12} /> Épinglé</span>}
                                                <Badge className={`text-xs ${cat.color}`}>{a.category}</Badge>
                                                <span className="text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-base mb-1">{a.title}</h4>
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{a.body}</p>
                                            <p className="text-xs text-slate-400 mt-3">Publié par {a.author}</p>
                                        </div>
                                        {isHR && (
                                            <button onClick={() => handleDelete(a.id)} className="text-slate-300 hover:text-red-500 transition-colors bg-transparent border-0 cursor-pointer mt-1">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
