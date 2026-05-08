import React from 'react';
import { cn } from '@/lib/utils';
import { Home, Users, User, Network, Calendar, DollarSign, Settings, LogOut, FileText, Bell, Target, BookOpen, Heart, Shield, CheckSquare, Award, Clock, Receipt, HeartPulse, Laptop, BarChart, PiggyBank, GraduationCap, Grid, Megaphone, Banknote, Stethoscope, Trophy, PowerOff, Building, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getAllNavItems = () => [
    // HOME
    { name: 'Vue d\'ensemble', path: '/', icon: Home, domain: 'Home', permission: 'dashboard:view' },
    { name: 'Générateur Workflows', path: '/workflows', icon: Settings, domain: 'Home', permission: 'workflows:view' },
    { name: 'Tableau Tâches', path: '/task-board', icon: CheckSquare, domain: 'Home', permission: 'dashboard:view' },
    { name: 'Annonces', path: '/announcements', icon: Megaphone, domain: 'Home', permission: 'myself:view' },

    // MYSELF
    { name: 'Mon Profil', path: '/my-space', icon: User, domain: 'Myself', permission: 'myself:view' },
    { name: 'Mes Absences (Congés)', path: '/leaves', icon: Calendar, domain: 'Myself', permission: 'myself:view' },
    { name: 'Absences & Retards', path: '/absences', icon: AlertTriangle, domain: 'Myself', permission: 'myself:view' },
    { name: 'Mes Dépenses', path: '/expenses', icon: Receipt, domain: 'Myself', permission: 'myself:view' },
    { name: 'Avance sur Salaire', path: '/advances', icon: Banknote, domain: 'Myself', permission: 'myself:view' },
    { name: 'Mes Fiches de Paie', path: '/payroll', icon: FileText, domain: 'Myself', permission: 'myself:view' },
    { name: 'Kudos & Gamification', path: '/kudos', icon: Heart, domain: 'Myself', permission: 'myself:view' },
    { name: 'Assistance Sociale', path: '/social-support', icon: Heart, domain: 'Myself', permission: 'myself:view' },
    { name: 'Mes Avantages', path: '/benefits', icon: HeartPulse, domain: 'Myself', permission: 'myself:view' },
    
    // MY TEAM
    { name: 'Évaluation Équipe', path: '/performance', icon: Users, domain: 'My Team', permission: 'manager:view' }, 
    { name: 'Matériel Équipe', path: '/assets', icon: Laptop, domain: 'My Team', permission: 'manager:view' },
    { name: 'Plannings Équipe', path: '/shifts', icon: Calendar, domain: 'My Team', permission: 'manager:view' },

    // PEOPLE
    { name: 'Répertoire Employés', path: '/employees', icon: Users, domain: 'People', permission: 'employees:view' },
    { name: 'Organigramme', path: '/org-chart', icon: Network, domain: 'People', permission: 'employees:view' },
    { name: 'Recrutement', path: '/recruitment', icon: Target, domain: 'People', permission: 'recruitment:view' },
    { name: 'Sourcing IA', path: '/ai-sourcing', icon: BrainCircuit, domain: 'People', permission: 'recruitment:view' },
    { name: 'Intégration (Onboarding)', path: '/onboarding', icon: GraduationCap, domain: 'People', permission: 'onboarding:view' },
    { name: 'Départs (Offboarding)', path: '/offboarding', icon: PowerOff, domain: 'People', permission: 'employees:edit' },
    { name: 'Flex-Workforce', path: '/subcontractors', icon: Building, domain: 'People', permission: 'employees:edit' },
    { name: 'Qualité de vie (QVT)', path: '/engagement', icon: HeartPulse, domain: 'People', permission: 'employees:edit' },
    { name: 'Santé & Sécurité', path: '/hse', icon: Shield, domain: 'People', permission: 'employees:edit' },
    { name: 'Médecine du Travail', path: '/medical', icon: Stethoscope, domain: 'People', permission: 'employees:edit' },

    // PROCESS
    { name: 'Pointages (GTA)', path: '/timesheet', icon: Clock, domain: 'Process', permission: 'dashboard:view' },
    { name: 'Absences & Retards', path: '/absences', icon: AlertTriangle, domain: 'Process', permission: 'dashboard:view' },
    { name: 'Traitement Paie', path: '/payroll', icon: DollarSign, domain: 'Process', permission: 'payroll:view' },
    { name: 'Rémunération', path: '/compensation', icon: PiggyBank, domain: 'Process', permission: 'payroll:view' },
    { name: 'Suivi Formations', path: '/learning', icon: BookOpen, domain: 'Process', permission: 'learning:view' },
    { name: 'Catalogue Sessions', path: '/trainings', icon: GraduationCap, domain: 'Process', permission: 'learning:view' },
    { name: 'Compétences', path: '/skills', icon: Award, domain: 'Process', permission: 'skills:view' },
    { name: 'GPEC++', path: '/gpec', icon: Target, domain: 'Process', permission: 'skills:view' },
    { name: 'Gestion Talents (9-Box)', path: '/talent-management', icon: Target, domain: 'People', permission: 'skills:view' },
    { name: 'Documents GED', path: '/documents', icon: FileText, domain: 'Process', permission: 'documents:view_company' },
    
    // REPORTS
    { name: 'Analytique & Coûts', path: '/analytics', icon: BarChart, domain: 'Reports', permission: 'dashboard:view' },
    { name: 'Simulateur Masse Salariale', path: '/payroll-simulation', icon: Calculator, domain: 'Reports', permission: 'payroll:view' },
    { name: 'Diversité & Inclusion', path: '/dei-dashboard', icon: HeartPulse, domain: 'Reports', permission: 'dashboard:view' },
    { name: 'Signalements', path: '/ethics', icon: ShieldAlert, domain: 'Reports', permission: 'dashboard:view' },
    { name: 'Dossiers Support', path: '/social-worker-dashboard', icon: FileText, domain: 'Reports', permission: 'support_tickets:manage' },
];


export function Sidebar({ className, setIsMobileMenuOpen, currentDomain = 'Home' }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const userRole = user ? user.role : 'EMPLOYEE';

    const allItems = getAllNavItems();

    const navItems = allItems.filter(item => {
        if (item.domain !== currentDomain) return false;

        // Simplified RBAC logic for UI representation
        if (userRole === 'EMPLOYEE') {
            return item.domain === 'Myself' || item.domain === 'Home';
        } else if (userRole === 'MANAGER') {
            if (item.permission === 'payroll:view' || item.permission === 'settings:view') return false;
            return true;
        } else {
            // HR / ADMIN
            if (item.permission === 'settings:view' && userRole !== 'ADMIN') return false;
            if (item.permission === 'payroll:view' && userRole !== 'ADMIN' && userRole !== 'HR') return false;
            return true;
        }
    });

    return (
        <div className={cn('flex h-full w-64 flex-col border-r bg-white shadow-[2px_0_8px_-3px_rgba(0,0,0,0.1)] transition-all', className)}>
            <div className="flex h-16 items-center border-b border-slate-100 px-6 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2 text-slate-800">
                    <Grid size={18} className="text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                        {currentDomain}
                    </h2>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto custom-scrollbar">
                {navItems.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-4 italic">
                        Aucun module disponible.
                    </div>
                ) : null}

                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                            className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all group mb-1',
                                isActive
                                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-primary shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                            )}
                        >
                            <item.icon
                                className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600')}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-100 p-4 bg-slate-50/50 shrink-0">
                {userRole === 'ADMIN' && (
                    <Link
                        to="/settings"
                        onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-md mb-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        <Settings className="h-5 w-5 text-slate-400" />
                        Paramètres
                    </Link>
                )}
                
                <button 
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                    <LogOut className="h-5 w-5 text-slate-400 hover:text-red-500" />
                    Déconnexion
                </button>
            </div>
            
            {/* Minimalist scrollbar style applied inline for this component context */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}} />
        </div>
    );
}
