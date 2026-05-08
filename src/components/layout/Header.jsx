import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, ChevronDown, LogOut, Check, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../NotificationCenter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getDomainsForRole = (role) => {
    // Default matching a very standard ADP configuration
    const domains = ['Home', 'Myself'];
    
    // In actual enterprise, the permissions verify these, but for visual:
    if (role === 'MANAGER' || role === 'HR' || role === 'ADMIN') {
        domains.push('My Team');
    }
    if (role === 'HR' || role === 'ADMIN') {
        domains.push('People', 'Process', 'Reports');
    }
    return domains;
};

export function Header({ onMenuClick, currentDomain, setCurrentDomain }) {
    const { user, logout, token } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
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
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between bg-slate-900 border-b border-slate-800 px-4 md:px-6 shadow-md text-white">
            <div className="flex items-center gap-6 h-full">
                <button onClick={onMenuClick} className="md:hidden text-slate-300 hover:text-white p-1">
                    <Menu className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-2 mr-2">
                    <img src="/logo.png" alt="Logo SII" className="h-10 w-auto object-contain bg-slate-100 px-2 py-1 rounded-md shadow-sm" />
                    <h1 className="text-xl font-bold tracking-tight hidden lg:block text-slate-100">
                        SIRH<span className="text-primary font-medium"> Pro</span>
                    </h1>
                </div>

                {/* Domains Desktop Navigation */}
                <nav className="hidden md:flex gap-1 items-center h-full">
                    {roleDomains.map(domain => (
                        <button
                            key={domain}
                            onClick={() => setCurrentDomain(domain)}
                            className={`h-16 px-4 text-sm font-medium transition-colors border-b-4 flex items-center ${
                                currentDomain === domain 
                                    ? 'border-primary text-white bg-slate-800' 
                                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:border-slate-700'
                            }`}
                        >
                            {domain}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                {/* Search */}
                <div className="hidden lg:flex relative items-center">
                    <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher des employés..."
                        className="h-9 w-64 rounded bg-slate-800 border border-slate-700 pl-10 pr-4 text-sm outline-none text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Cloche Standard */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className="absolute right-0 top-full mt-3 w-80 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50 text-slate-800">
                                <div className="px-4 py-3 border-b border-slate-100 mb-2 flex justify-between items-center">
                                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
                                            <Check size={14} /> Tout lire
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                                className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <p className={`text-sm line-clamp-2 ${!notif.isRead ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()} à {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-6 text-center text-slate-500 text-sm">
                                            Aucune notification
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-l border-slate-700 pl-2 ml-1 flex items-center gap-2">
                        <NotificationCenter />
                        <span className="hidden xl:block text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">V2.2 Live</span>
                    </div>
                </div>

                <div className="relative border-l border-slate-700 pl-3 sm:pl-4">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 hover:bg-slate-800 p-1.5 rounded-lg transition-colors text-left"
                    >
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-slate-100 leading-none">{user.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{user.role}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-slate-700 text-slate-100 flex items-center justify-center font-bold shadow-inner border border-slate-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50 text-slate-800">
                            <div className="px-4 py-3 border-b border-slate-100 mb-2">
                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} /> Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
