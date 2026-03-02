import React, { useState } from 'react';
import { Search, Bell, Menu, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header({ onMenuClick }) {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!user) return null; // Safe guard if rendering before context is fully populated

    return (
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="md:hidden text-slate-500 hover:text-slate-700 p-1">
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden md:flex relative items-center">
                    <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher des employés, documents..."
                        className="h-10 w-80 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        3
                    </span>
                </button>

                <div className="relative border-l pl-4">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors text-left"
                    >
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-slate-700 leading-none">{user.name}</p>
                            <p className="text-xs text-blue-600 font-medium mt-1">{user.role}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md border-2 border-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-100 bg-white shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-3 border-b border-slate-100 mb-2">
                                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
