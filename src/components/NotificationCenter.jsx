import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Calendar, FileText, Check, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export function NotificationCenter() {
    const [alerts, setAlerts] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    const fetchAlerts = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/notifications/alerts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAlerts(data);
            }
        } catch (error) {
            console.error("Error fetching alerts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // Poll every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'CONTRACT_EXPIRY': return <FileText size={16} className="text-rose-500" />;
            case 'TRIAL_EXPIRY': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'MEDICAL_VISIT': return <Calendar size={16} className="text-blue-500" />;
            default: return <Bell size={16} className="text-slate-500" />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors group"
            >
                <Bell size={20} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                {alerts.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white animate-pulse">
                        {alerts.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <ShieldAlert size={16} className="text-indigo-600" />
                                    Alertes Critiques RH
                                </h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alerts.length} NOUVELLES</span>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {alerts.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Check size={20} className="text-emerald-500" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 italic">Aucune alerte critique en attente.</p>
                                    </div>
                                ) : (
                                    alerts.map((alert) => (
                                        <Link 
                                            key={alert.id}
                                            to={alert.link}
                                            onClick={() => setIsOpen(false)}
                                            className="block p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 p-1.5 rounded-lg bg-white shadow-sm border border-slate-100">
                                                    {getIcon(alert.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-900 truncate">{alert.title}</p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{alert.message}</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${alert.severity === 'high' ? 'bg-rose-500' : alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Priorité {alert.severity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {alerts.length > 0 && (
                                <Link 
                                    to="/analytics" 
                                    onClick={() => setIsOpen(false)}
                                    className="block p-3 text-center text-[11px] font-black text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 transition-colors uppercase tracking-widest"
                                >
                                    Voir tout le tableau de bord
                                </Link>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
