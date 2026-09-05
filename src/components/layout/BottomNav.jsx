import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Clock, User, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

/**
 * Barre de navigation inférieure, affichée uniquement sur mobile.
 *
 * Sur un téléphone, atteindre une fonction courante demandait d'ouvrir le
 * menu latéral puis de chercher dans une liste de plusieurs dizaines
 * d'entrées. Les quatre actions du quotidien sont ici accessibles au pouce,
 * le menu complet restant disponible en dernier onglet.
 */
export function BottomNav({ onMenuClick }) {
    const location = useLocation();
    const { user } = useAuth();

    const isEmployee = !['ADMIN', 'Administrator', 'HR'].includes(user?.role);

    const items = [
        { label: 'Accueil', path: isEmployee ? '/my-space' : '/', icon: Home },
        { label: 'Congés', path: '/leaves', icon: Calendar },
        { label: 'Pointage', path: '/timesheet', icon: Clock },
        { label: 'Profil', path: '/my-space', icon: User }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.08)] safe-bottom"
            aria-label="Navigation principale"
        >
            <div className="flex items-stretch justify-around">
                {items.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={cn(
                            'flex flex-col items-center justify-center gap-1 flex-1 py-2.5 min-h-[56px] transition-colors',
                            isActive(item.path) ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                        )}
                    >
                        <item.icon size={20} strokeWidth={isActive(item.path) ? 2.4 : 2} />
                        <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                    </Link>
                ))}

                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center gap-1 flex-1 py-2.5 min-h-[56px] text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Ouvrir le menu complet"
                >
                    <Menu size={20} />
                    <span className="text-[10px] font-semibold leading-none">Menu</span>
                </button>
            </div>
        </nav>
    );
}
