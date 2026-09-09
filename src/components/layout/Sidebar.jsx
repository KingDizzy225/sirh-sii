import React from 'react';
import { cn } from '@/lib/utils';
import { Home, Users, User, Network, Calendar, DollarSign, Settings, LogOut, FileText, Bell, Target, BookOpen, Heart, Shield, CheckSquare, Award, Clock, Receipt, HeartPulse, Laptop, BarChart, PiggyBank, GraduationCap, Grid, Megaphone, Banknote, Stethoscope, Trophy, PowerOff, Building, ShieldAlert, AlertTriangle, BrainCircuit, Calculator, Rocket, Zap, MessageSquare, Scale, Sparkles, Inbox, UserPlus, Workflow, ShieldCheck, Wallet, PenTool, UserCheck, ClipboardList, History , IdCard, Activity, CalendarDays, Landmark} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageSwitcher } from '../LanguageSwitcher';

/**
 * Entrées de navigation.
 *
 * Le menu comptait soixante et une entrées, dont trois écrans présentés sous
 * deux noms différents et cinq entrées portant le mot « absences » pour deux
 * écrans distincts. Personne ne pouvait deviner où poser un congé.
 *
 * Deux principes le tiennent désormais :
 *
 *  - **Un écran, une entrée.** Une page qui s'adapte au rôle ne se dédouble
 *    pas dans le menu ; c'est la page qui change, pas le chemin.
 *  - **Le nom dit ce que l'écran fait**, en français, sans anglicisme opaque.
 *    « Flex-Workforce » ne disait pas « prestataires », « Automatisations » ne
 *    disait pas « tâches planifiées ».
 *
 * Le domaine « Mon Espace » a disparu : les salariés ne se connectent plus à
 * l'application, ils passent par le portail public. Les écrans qui servaient
 * aussi à la RH ont rejoint les domaines RH ; les autres restent joignables
 * par leur URL mais ne sont plus proposés.
 */
const getAllNavItems = (t) => [
    // ── ACCUEIL ──
    { name: t('sidebar.dashboard', 'Vue d\'ensemble'), path: '/', icon: Home, domain: 'Accueil', permission: 'dashboard:view' },
    { name: 'Tableau de tâches', path: '/task-board', icon: CheckSquare, domain: 'Accueil', permission: 'dashboard:view' },
    { name: 'Annonces', path: '/announcements', icon: Megaphone, domain: 'Accueil', permission: 'dashboard:view' },

    // ── EMPLOYÉS : le dossier du salarié, de l'embauche au départ ──
    { name: t('sidebar.employees', 'Répertoire des salariés'), path: '/employees', icon: Users, domain: 'Employés', permission: 'employees:view' },
    { name: 'Dossiers & corbeille', path: '/conformite', icon: ShieldCheck, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Titres & habilitations', path: '/pieces', icon: IdCard, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Fiches de poste', path: '/fiches-poste', icon: ClipboardList, domain: 'Employés', permission: 'employees:edit' },
    // Rédige une fiche avec l'assistant ; « Fiches de poste » les conserve.
    { name: 'Rédiger une fiche (IA)', path: '/job-studio', icon: Sparkles, domain: 'Employés', permission: 'recruitment:view' },
    { name: 'Contrats de travail', path: '/contracts', icon: FileText, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Organigramme', path: '/org-chart', icon: Network, domain: 'Employés', permission: 'employees:view' },
    { name: 'Simulateur d\'organisation', path: '/org-simulation', icon: Rocket, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Entretiens & évaluations', path: '/performance', icon: Trophy, domain: 'Employés', permission: 'employees:edit', manager: true },
    { name: 'Procédures & sanctions', path: '/procedures', icon: Scale, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Intégration (onboarding)', path: '/onboarding', icon: GraduationCap, domain: 'Employés', permission: 'onboarding:view' },
    { name: 'Départs (offboarding)', path: '/offboarding', icon: PowerOff, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Matériel attribué', path: '/assets', icon: Laptop, domain: 'Employés', permission: 'employees:edit' },
    // « Flex-Workforce » ne disait pas de quoi il s'agissait.
    { name: 'Prestataires & sous-traitance', path: '/subcontractors', icon: Building, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Médecine du travail', path: '/medical-hub', icon: Stethoscope, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Accidents & sécurité', path: '/hse', icon: Shield, domain: 'Employés', permission: 'employees:edit' },
    { name: t('sidebar.recruitment', 'Recrutement'), path: '/recruitment', icon: Target, domain: 'Employés', permission: 'recruitment:view' },
    { name: 'Cooptation', path: '/referrals', icon: UserPlus, domain: 'Employés', permission: 'recruitment:view' },
    { name: 'Sourcing assisté (IA)', path: '/ai-sourcing', icon: BrainCircuit, domain: 'Employés', permission: 'recruitment:view' },

    // ── PILOTAGE RH : les processus qui tournent tous les mois ──
    { name: 'Congés & absences', path: '/leaves', icon: Calendar, domain: 'Pilotage RH', permission: 'dashboard:view', manager: true },
    // Absences ponctuelles, retards et demandes. Cet écran figurait deux fois,
    // sous « Absences & Retards » et sous « Temps, Absences & Demandes ».
    { name: 'Retards & demandes', path: '/timesheet', icon: AlertTriangle, domain: 'Pilotage RH', permission: 'dashboard:view', manager: true },
    { name: 'Relevé des pointages', path: '/releve-heures', icon: Clock, domain: 'Pilotage RH', permission: 'dashboard:view', manager: true },
    { name: 'Jours fériés', path: '/jours-feries', icon: CalendarDays, domain: 'Pilotage RH', permission: 'employees:edit' },
    { name: 'Plannings & rotations', path: '/shifts', icon: Calendar, domain: 'Pilotage RH', permission: 'dashboard:view', manager: true },
    { name: t('sidebar.payroll', 'Paie & bulletins'), path: '/payroll', icon: DollarSign, domain: 'Pilotage RH', permission: 'payroll:view' },
    // Décisions d'augmentation, distinctes de l'exécution de la paie.
    { name: 'Décisions de rémunération', path: '/remunerations', icon: Banknote, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Prêts au personnel', path: '/prets', icon: Landmark, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Budget & masse salariale', path: '/budget', icon: Wallet, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Délégations de validation', path: '/delegations', icon: UserCheck, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: t('sidebar.learning', 'Formation'), path: '/learning', icon: GraduationCap, domain: 'Pilotage RH', permission: 'learning:view' },
    { name: 'Compétences & GPEC', path: '/skills', icon: Award, domain: 'Pilotage RH', permission: 'skills:view' },
    // Deux outils réellement distincts, dont les anciens noms suggéraient les
    // deux moitiés d'un même : l'un liste des modèles de tâches, l'autre
    // déclenche des traitements planifiés.
    { name: 'Modèles de tâches', path: '/workflow-builder', icon: Workflow, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Traitements planifiés', path: '/workflows', icon: Zap, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Règles internes', path: '/policy-rules', icon: BookOpen, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Documents', path: '/documents', icon: FileText, domain: 'Pilotage RH', permission: 'documents:view_company' },
    { name: 'Signataires', path: '/signataires', icon: PenTool, domain: 'Pilotage RH', permission: 'documents:view_company' },
    { name: 'Guichet WhatsApp', path: '/whatsapp-bot', icon: MessageSquare, domain: 'Pilotage RH', permission: 'dashboard:view' },

    // ── INTELLIGENCE RH : ce qui se lit, jamais ce qui s'écrit ──
    { name: t('sidebar.analytics', 'Analyses RH'), path: '/analytics', icon: BarChart, domain: 'Intelligence RH', permission: 'dashboard:view', manager: true },
    { name: 'Absentéisme', path: '/absenteisme', icon: Activity, domain: 'Intelligence RH', permission: 'dashboard:view', manager: true },
    { name: 'Listes & exports', path: '/requeteur', icon: Grid, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Historique daté', path: '/historique', icon: History, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Équité salariale', path: '/pay-equity', icon: Scale, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Simulateur de masse salariale', path: '/payroll-simulation', icon: Calculator, domain: 'Intelligence RH', permission: 'payroll:view' },
    { name: 'Risque de départ', path: '/retention-center', icon: ShieldAlert, domain: 'Intelligence RH', permission: 'dashboard:view', manager: true },
    { name: 'Santé d\'équipe', path: '/team-health', icon: HeartPulse, domain: 'Intelligence RH', permission: 'dashboard:view' },
    // Absorbe l'ancien écran « Qualité de vie (QVT) », qui ne faisait que lire
    // la même liste d'enquêtes sans permettre d'en créer ni d'y répondre.
    { name: 'Baromètre social & eNPS', path: '/climate-surveys', icon: Inbox, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Diversité & inclusion', path: '/dei-dashboard', icon: Users, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Signalements', path: '/ethics', icon: ShieldAlert, domain: 'Intelligence RH', permission: 'dashboard:view' }
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
            /**
             * Le responsable ne voyait « tout sauf la paie ». Il lui était donc
             * proposé le répertoire complet, les procédures disciplinaires et
             * les départs — des écrans que le serveur lui refuse, et qui ne lui
             * auraient renvoyé qu'une erreur.
             *
             * La liste est désormais explicite, portée par `manager: true` sur
             * chaque entrée, et calquée sur ce que les routes autorisent
             * réellement. Un menu qui promet ce que l'API refuse est pire
             * qu'un menu court.
             */
            return item.manager === true;
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

                {['ADMIN', 'Administrator', 'HR'].includes(userRole) && (
                    <Link
                        to="/settings"
                        onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        <Settings className="h-5 w-5 text-slate-400" />
                        Paramètres
                    </Link>
                )}
                {['ADMIN', 'Administrator'].includes(userRole) && (
                    <Link
                        to="/audit-logs"
                        onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        <ShieldAlert className="h-5 w-5 text-indigo-400" />
                        Piste d'Audit
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
