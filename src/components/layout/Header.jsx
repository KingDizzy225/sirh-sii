import React, { useState, useEffect } from 'react';
import { 
    Search, Bell, Menu, ChevronDown, LogOut, Check, Users, Sparkles, 
    Plus, ShieldCheck, Zap, Calendar, FileText, UserPlus, Clock, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../NotificationCenter';
import { ServerStatus } from '../ui/ServerStatus';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getDomainsForRole = () => ['Accueil', 'Employés', 'Pilotage RH', 'Intelligence RH'];

export function Header({ onMenuClick, currentDomain, setCurrentDomain }) {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (token) {
            fetch(`${API_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setNotifications(data);
                })
                .catch(err => console.error("Erreur notifs", err));
        }
    }, [token]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) { }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`${API_URL}/api/notifications/read-all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (e) { }
    };

    if (!user) return null;

    const roleDomains = getDomainsForRole(user.role);

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-4 md:px-6 shadow-xs text-slate-800 transition-all">
            {/* Gauche : Logo & Domaines */}
            <div className="flex items-center gap-5 md:gap-8 h-full">
                <button 
                    onClick={onMenuClick} 
                    className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="h-10 px-2 py-1 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center shadow-xs group-hover:shadow-sm transition-all">
                        <img src="/logo.png" alt="SII" className="h-7 w-auto object-contain" />
                    </div>
                    <div className="hidden lg:flex flex-col leading-none gap-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-base font-extrabold tracking-tight text-slate-900 font-serif">
                                SIRH<span className="text-[#002B7F] font-sans font-black">·PRO</span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                                V5.2
                            </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                            SII Côte d'Ivoire
                        </span>
                    </div>
                </div>

                {/* Domaines de Navigation en Pilules Modernes (Style Corporate) */}
                <nav className="hidden md:flex gap-1.5 items-center h-full py-3">
                    {roleDomains.map(domain => {
                        const isCurrent = currentDomain === domain;
                        return (
                            <button
                                key={domain}
                                onClick={() => setCurrentDomain(domain)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isCurrent 
                                        ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20' 
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                {domain}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Droite : Recherche globale Spotlight, Bouton Action Rapide, Notifications & Profil */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
                {/* Spotlight Search (Cmd + K) */}
                <button
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                    className="hidden sm:flex items-center gap-2.5 h-9 px-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer shadow-2xs group"
                >
                    <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="hidden xl:inline">Recherche universelle (194 salariés, modules...)</span>
                    <span className="inline xl:hidden">Rechercher...</span>
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white text-[10px] font-extrabold text-slate-600 border border-slate-200 shadow-2xs">
                        ⌘K
                    </span>
                </button>

                {/* Bouton Action Rapide (+ Nouveau) - Corporate Blue */}
                <div className="relative">
                    <button
                        onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                        className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Action</span>
                        <ChevronDown className={`h-3 w-3 text-blue-200 transition-transform ${isQuickActionOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isQuickActionOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50 text-slate-800 animate-in fade-in-50">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                                Créations rapides
                            </div>
                            <button
                                onClick={() => { setIsQuickActionOpen(false); navigate('/employees'); }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                            >
                                <UserPlus size={14} className="text-blue-600" />
                                Nouveau collaborateur
                            </button>
                            <button
                                onClick={() => { setIsQuickActionOpen(false); navigate('/leaves'); }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                            >
                                <Calendar size={14} className="text-blue-600" />
                                Poser une absence / congé
                            </button>
                            <button
                                onClick={() => { setIsQuickActionOpen(false); navigate('/compliance-conflits-interets'); }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                            >
                                <ShieldCheck size={14} className="text-emerald-600" />
                                Déclarer cadeau / intérêt
                            </button>
                            <button
                                onClick={() => { setIsQuickActionOpen(false); navigate('/payroll-simulation'); }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                            >
                                <Zap size={14} className="text-amber-600" />
                                Simuler masse salariale
                            </button>
                        </div>
                    )}
                </div>

                {/* Notifications & Télémétrie */}
                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200/60"
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white shadow-xs ring-2 ring-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl py-2 z-50 text-slate-800">
                                <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Notifications</p>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                                            <Check size={13} /> Tout marquer lu
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 text-xs">
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                                className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <p className={`line-clamp-2 ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-slate-400 text-xs">
                                            Aucune nouvelle notification
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <ServerStatus minimal />
                </div>

                {/* Profil Utilisateur & Menu Déconnexion */}
                <div className="relative border-l border-slate-200 pl-2">
                    {(() => {
                        const userName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Utilisateur');
                        const initials = userName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'RH';

                        return (
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 hover:bg-slate-100/80 p-1 rounded-xl transition-colors text-left cursor-pointer"
                            >
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                    {initials}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-xs font-bold text-slate-900 leading-none">{userName}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{user?.role || 'DRH'}</p>
                                </div>
                                <ChevronDown size={13} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                        );
                    })()}

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50 text-slate-800 animate-in fade-in-50">
                            <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                <p className="text-xs font-bold text-slate-900">{user?.name || 'Administrateur RH'}</p>
                                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                                <LogOut size={14} /> Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
