import React from 'react';
import { cn } from '@/lib/utils';
import { Home, Users, Network, Calendar, DollarSign, Settings, LogOut, FileText, Bell, Target, BookOpen, Heart, Shield, CheckSquare, Award, Clock, Receipt, HeartPulse } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { RequirePermission } from '../auth/ProtectedRoute';

const navItems = [
    { name: 'Tableau de bord', path: '/', icon: Home, permission: 'dashboard:view' },
    { name: 'Employés', path: '/employees', icon: Users, permission: 'employees:view' },
    { name: 'Organigramme', path: '/org-chart', icon: Network, permission: 'dashboard:view' },
    { name: 'Engagement', path: '/engagement', icon: HeartPulse, permission: 'employees:edit' },
    { name: 'Onboarding', path: '/onboarding', icon: Target, permission: 'onboarding:view' },
    { name: 'Formations', path: '/learning', icon: BookOpen, permission: 'learning:view' },
    { name: 'Congés & Absences', path: '/leaves', icon: Calendar, permission: 'leaves:view' },
    { name: 'Temps (GTA)', path: '/timesheet', icon: Clock, permission: 'dashboard:view' },
    { name: 'Notes de Frais', path: '/expenses', icon: Receipt, permission: 'dashboard:view' },
    { name: 'Paie', path: '/payroll', icon: DollarSign, permission: 'payroll:view' },
    { name: 'Documents GED', path: '/documents', icon: FileText, permission: 'documents:view_company' },
    { name: 'Workflows', path: '/workflows', icon: Settings, permission: 'workflows:view' },
    { name: 'Tableau Tâches', path: '/task-board', icon: CheckSquare, permission: 'workflows:view' },
    { name: 'Matrice Compétences', path: '/skills', icon: Award, permission: 'skills:view' },
    { name: 'Recrutement', path: '/recruitment', icon: FileText, permission: 'recruitment:view' },
    { name: 'Performance', path: '/performance', icon: Calendar, permission: 'performance:view' },
    { name: 'Support Social', path: '/social-support', icon: Heart, permission: 'support:view' },
    { name: 'Dossiers Support', path: '/social-worker-dashboard', icon: Shield, permission: 'support_tickets:manage' },
    { name: 'Santé & Sécurité', path: '/hse', icon: Shield, permission: 'employees:edit' },
    { name: 'Paramètres', path: '/settings', icon: Settings, permission: 'settings:view' },
];

export function Sidebar({ className }) {
    const location = useLocation();

    return (
        <div className={cn('flex h-screen w-64 flex-col border-r bg-slate-50 shadow-sm', className)}>
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
                        <Users size={18} />
                    </div>
                    SIRH <span className="text-blue-600">Pro</span>
                </h1>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
                <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Menu Principal
                </p>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    // Specific fallback for employee self-view permissions if global view isn't available
                    const permissionCheck = item.permission;
                    const alternateCheck = item.permission.replace(':view', ':view_self');

                    return (
                        <RequirePermission key={item.name} permission={permissionCheck} fallback={
                            <RequirePermission permission={alternateCheck}>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group',
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    )}
                                >
                                    <item.icon
                                        className={cn('h-5 w-5', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')}
                                    />
                                    {item.name}
                                </Link>
                            </RequirePermission>
                        }>
                            <Link
                                to={item.path}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                )}
                            >
                                <item.icon
                                    className={cn('h-5 w-5', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')}
                                />
                                {item.name}
                            </Link>
                        </RequirePermission>
                    );
                })}
            </nav>

            <div className="border-t p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LogOut className="h-5 w-5 text-slate-400 hover:text-red-500" />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
