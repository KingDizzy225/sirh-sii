import React from 'react';
import { cn } from '@/lib/utils';
import { Home, Users, User, Network, Calendar, DollarSign, Settings, LogOut, FileText, Bell, Target, BookOpen, Heart, Shield, CheckSquare, Award, Clock, Receipt, HeartPulse, Laptop, BarChart, PiggyBank, GraduationCap, Grid, Megaphone, Banknote, Stethoscope, Trophy, PowerOff, Building, ShieldAlert, AlertTriangle, BrainCircuit, Calculator, Rocket, Zap, MessageSquare, Scale, Sparkles, Inbox } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageSwitcher } from '../LanguageSwitcher';

const getAllNavItems = (t) => [
    // ACCUEIL
    { name: t('sidebar.dashboard', 'Vue d\'ensemble'), path: '/', icon: Home, domain: 'Accueil', permission: 'dashboard:view' },
    { name: 'Tableau Tâches', path: '/task-board', icon: CheckSquare, domain: 'Accueil', permission: 'dashboard:view' },
    { name: 'Annonces', path: '/announcements', icon: Megaphone, domain: 'Accueil', permission: 'myself:view' },

    // MON ESPACE
    { name: 'Mon Profil', path: '/my-space', icon: User, domain: 'Mon Espace', permission: 'myself:view' },
    { name: t('sidebar.leaves', 'Mes Absences (Congés)'), path: '/leaves', icon: Calendar, domain: 'Mon Espace', permission: 'myself:view' },
    { name: 'Absences & Retards', path: '/absences', icon: AlertTriangle, domain: 'Mon Espace', permission: 'myself:view' },
    { name: t('sidebar.expenses', 'Mes Dépenses'), path: '/expenses', icon: Receipt, domain: 'Mon Espace', permission: 'myself:view' },
    { name: 'Avance sur Salaire', path: '/advances', icon: Banknote, domain: 'Mon Espace', permission: 'myself:view' },
    { name: t('sidebar.payroll', 'Mes Fiches de Paie'), path: '/payroll', icon: FileText, domain: 'Mon Espace', permission: 'myself:view' },
    { name: 'Kudos & Gamification', path: '/kudos', icon: Heart, domain: 'Mon Espace', permission: 'myself:view' },
    { name: 'Explorateur Carrière', path: '/career-path', icon: Rocket, domain: 'Mon Espace', permission: 'myself:view' },
    { name: 'Assistance Sociale', path: '/social-support', icon: Heart, domain: 'Mon Espace', permission: 'myself:view' },
    { name: 'Mes Avantages', path: '/benefits', icon: HeartPulse, domain: 'Mon Espace', permission: 'myself:view' },
    
    // MON ÉQUIPE
    { name: 'Évaluation Équipe', path: '/performance', icon: Users, domain: 'Mon Équipe', permission: 'manager:view' }, 
    { name: 'Matériel Équipe', path: '/assets', icon: Laptop, domain: 'Mon Équipe', permission: 'manager:view' },
    { name: 'Plannings Équipe', path: '/shifts', icon: Calendar, domain: 'Mon Équipe', permission: 'manager:view' },

    // EMPLOYÉS
    { name: t('sidebar.employees', 'Répertoire Employés'), path: '/employees', icon: Users, domain: 'Employés', permission: 'employees:view' },
    { name: 'Organigramme', path: '/org-chart', icon: Network, domain: 'Employés', permission: 'employees:view' },
    { name: 'Simulateur Orga.', path: '/org-simulation', icon: Rocket, domain: 'Employés', permission: 'employees:edit' },
    { name: t('sidebar.recruitment', 'Recrutement'), path: '/recruitment', icon: Target, domain: 'Employés', permission: 'recruitment:view' },
    { name: 'Fiches de Poste IA', path: '/job-studio', icon: Sparkles, domain: 'Employés', permission: 'recruitment:view' },
    { name: 'Sourcing IA', path: '/ai-sourcing', icon: BrainCircuit, domain: 'Employés', permission: 'recruitment:view' },
    { name: 'Intégration (Onboarding)', path: '/onboarding', icon: GraduationCap, domain: 'Employés', permission: 'onboarding:view' },
    { name: 'Départs (Offboarding)', path: '/offboarding', icon: PowerOff, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Flex-Workforce', path: '/subcontractors', icon: Building, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Qualité de vie (QVT)', path: '/engagement', icon: HeartPulse, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Santé & Sécurité', path: '/hse', icon: Shield, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Médecine du Travail', path: '/medical', icon: Stethoscope, domain: 'Employés', permission: 'employees:edit' },

    // GESTION RH -> PILOTAGE RH
    { name: 'Pointages (GTA)', path: '/timesheet', icon: Clock, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Centre de Demandes', path: '/request-center', icon: Inbox, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Gestion des Absences', path: '/absences', icon: AlertTriangle, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Traitement Paie', path: '/payroll', icon: DollarSign, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Rémunération', path: '/compensation', icon: PiggyBank, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Suivi Formations', path: '/learning', icon: BookOpen, domain: 'Pilotage RH', permission: 'learning:view' },
    { name: t('sidebar.learning', 'Catalogue Formations'), path: '/trainings', icon: GraduationCap, domain: 'Pilotage RH', permission: 'learning:view' },
    { name: 'Compétences', path: '/skills', icon: Award, domain: 'Pilotage RH', permission: 'skills:view' },
    { name: 'GPEC++', path: '/gpec', icon: Target, domain: 'Pilotage RH', permission: 'skills:view' },
    { name: 'Gestion Talents (9-Box)', path: '/talent-management', icon: Target, domain: 'Pilotage RH', permission: 'skills:view' },
    { name: 'Plan de Succession', path: '/succession-planning', icon: Target, domain: 'Pilotage RH', permission: 'skills:view' },
    { name: 'Générateur Workflows', path: '/workflows', icon: Zap, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Documents GED', path: '/documents', icon: FileText, domain: 'Pilotage RH', permission: 'documents:view_company' },
    
    // ANALYTIQUE -> INTELLIGENCE RH
    { name: t('sidebar.analytics', 'HR Analytics'), path: '/analytics', icon: BarChart, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Équité Salariale', path: '/pay-equity', icon: Scale, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Santé d\'Équipe', path: '/team-health', icon: HeartPulse, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Anti-Turnover', path: '/retention-center', icon: ShieldAlert, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Simulateur Masse Salariale', path: '/payroll-simulation', icon: Calculator, domain: 'Intelligence RH', permission: 'payroll:view' },
    { name: 'Diversité & Inclusion', path: '/dei-dashboard', icon: HeartPulse, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Signalements', path: '/ethics', icon: ShieldAlert, domain: 'Intelligence RH', permission: 'dashboard:view' },
];


export function Sidebar({ className, setIsMobileMenuOpen, currentDomain = 'Home' }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const userRole = user ? user.role : 'EMPLOYEE';
    const { t } = useTranslation();

    const allItems = getAllNavItems(t);

    const navItems = allItems.filter(item => {
        if (item.domain !== currentDomain) return false;

        // Simplified RBAC logic for UI representation
        if (userRole === 'EMPLOYEE') {
            return item.domain === 'Mon Espace' || item.domain === 'Accueil';
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
                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded ml-auto tracking-wider">V5.0</span>
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

            <div className="border-t border-slate-100 p-4 bg-slate-50/50 shrink-0 space-y-1">
                <ThemeToggle />
                <LanguageSwitcher />

                {userRole === 'ADMIN' && (
                    <>
                        <Link
                            to="/settings"
                            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            <Settings className="h-5 w-5 text-slate-400" />
                            Paramètres
                        </Link>
                        <Link
                            to="/audit-logs"
                            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            <ShieldAlert className="h-5 w-5 text-indigo-400" />
                            Piste d'Audit
                        </Link>
                    </>
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
