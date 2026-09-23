import React from 'react';
import { cn } from '@/lib/utils';
import { Home, Users, User, Network, Calendar, DollarSign, Settings, LogOut, FileText, Bell, Target, BookOpen, Heart, Shield, CheckSquare, Award, Clock, Receipt, HeartPulse, Laptop, BarChart, PiggyBank, GraduationCap, Grid, Megaphone, Banknote, Stethoscope, Trophy, PowerOff, Building, ShieldAlert, AlertTriangle, BrainCircuit, Calculator, Rocket, Zap, MessageSquare, Scale, Sparkles, Inbox, UserPlus, Workflow, ShieldCheck, Wallet, PenTool, UserCheck, ClipboardList, History , IdCard, Activity, CalendarDays, Landmark, Tv, MapPin, Repeat, DoorOpen, BookHeart, QrCode, CalendarRange, FileSearch, Vote, Bus, PhoneCall, Gift, FileBarChart, HeartHandshake, Smile, BookCheck, Leaf, Compass } from 'lucide-react';
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
    { name: 'Command Center & Tâches', path: '/task-board', icon: CheckSquare, domain: 'Accueil', permission: 'dashboard:view' },
    { name: 'Annonces & Communication', path: '/announcements', icon: Megaphone, domain: 'Accueil', permission: 'dashboard:view' },

    // ── EMPLOYÉS : Dossier du salarié & parcours de carrière ──
    { name: t('sidebar.employees', 'Répertoire des salariés'), path: '/employees', icon: Users, domain: 'Employés', permission: 'employees:view' },
    { name: 'Registre Unique du Personnel', path: '/registre-personnel', icon: BookCheck, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Dossiers, Pièces & Conformité', path: '/conformite', icon: ShieldCheck, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Contrats de Travail & Fiches', path: '/contracts', icon: FileText, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Badges, Accès & Visiteurs', path: '/registre-visiteurs', icon: DoorOpen, domain: 'Employés', permission: 'dashboard:view' },
    { name: 'Kiosque Attestations Express', path: '/kiosque-attestations', icon: QrCode, domain: 'Employés', permission: 'dashboard:view' },
    { name: 'Périodes d\'Essai & Titularisation', path: '/periodes-essai', icon: Clock, domain: 'Employés', permission: 'employees:edit', manager: true },
    { name: 'Organigramme Entreprise', path: '/org-chart', icon: Network, domain: 'Employés', permission: 'employees:view' },
    { name: 'Entretiens, Évaluations & OKR', path: '/performance', icon: Trophy, domain: 'Employés', permission: 'employees:edit', manager: true },
    { name: 'Bilans de Carrière (2 & 6 ans)', path: '/bilans-carriere', icon: BookOpen, domain: 'Employés', permission: 'employees:edit', manager: true },
    { name: 'Simulateur Carrière & Évolution IA', path: '/simulateur-carriere-ia', icon: Compass, domain: 'Employés', permission: 'dashboard:view', manager: true },
    { name: 'Plan de Succession & Postes Clés', path: '/plan-succession', icon: Award, domain: 'Employés', permission: 'employees:edit', manager: true },
    { name: 'Intégration (Onboarding)', path: '/onboarding', icon: Rocket, domain: 'Employés', permission: 'onboarding:view' },
    { name: 'Délégués & Doléances Salariés', path: '/doleances-delegues', icon: Vote, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Procédures & Sanctions', path: '/procedures', icon: Scale, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Astreintes & Gardes', path: '/astreintes', icon: PhoneCall, domain: 'Employés', permission: 'employees:edit', manager: true },
    { name: 'Départs & Entretiens de Sortie', path: '/offboarding', icon: PowerOff, domain: 'Employés', permission: 'employees:edit', manager: true },
    { name: 'Équipements & Flotte Mobile', path: '/assets', icon: Laptop, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Santé, Médecine & Mutuelle', path: '/mutuelle-sante', icon: HeartHandshake, domain: 'Employés', permission: 'employees:edit' },
    { name: 'Sécurité, CSST & Accidents CNPS', path: '/enquetes-accidents', icon: ShieldAlert, domain: 'Employés', permission: 'employees:edit' },
    { name: t('sidebar.recruitment', 'Recrutement & Campus'), path: '/recruitment', icon: Target, domain: 'Employés', permission: 'recruitment:view' },
    { name: 'Prestataires & Intérim', path: '/subcontractors', icon: Building, domain: 'Employés', permission: 'employees:edit' },

    // ── PILOTAGE RH : Processus mensuels & gestion opérationnelle ──
    { name: 'Congés & Absences', path: '/leaves', icon: Calendar, domain: 'Pilotage RH', permission: 'dashboard:view', manager: true },
    { name: 'Pointages & Planning Shifts', path: '/shifts', icon: CalendarRange, domain: 'Pilotage RH', permission: 'dashboard:view', manager: true },
    { name: 'Jours Fériés & Calendrier', path: '/jours-feries', icon: CalendarDays, domain: 'Pilotage RH', permission: 'employees:edit' },
    { name: 'Carte des Agences & Sites', path: '/carte-agences', icon: MapPin, domain: 'Pilotage RH', permission: 'employees:edit' },
    { name: "Passations d'Équipe", path: '/passations', icon: ClipboardList, domain: 'Pilotage RH', permission: 'employees:edit' },
    { name: t('sidebar.payroll', 'Paie & Déclarations'), path: '/payroll', icon: DollarSign, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Simulateur Brut/Net & Grille CCNI', path: '/simulateur-embauche', icon: Calculator, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Prêts, Avantages & Primes', path: '/prets', icon: Landmark, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Salaire à la Demande (Acomptes)', path: '/salaire-a-la-demande', icon: Zap, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Budget & Masse Salariale', path: '/budget', icon: Wallet, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Simulateur Masse Salariale & Arbitrage', path: '/payroll-simulation', icon: Calculator, domain: 'Pilotage RH', permission: 'payroll:view' },
    { name: 'Délégations de Signature', path: '/delegations', icon: UserCheck, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Plan de Formation & FDFP', path: '/fdfp-gestion', icon: PiggyBank, domain: 'Pilotage RH', permission: 'learning:view' },
    { name: 'Compétences, 9-Box & Talents', path: '/skills', icon: Award, domain: 'Pilotage RH', permission: 'skills:view' },
    { name: 'Marketplace Interne & Missions', path: '/marketplace-talents', icon: Sparkles, domain: 'Pilotage RH', permission: 'skills:view' },
    { name: 'Boîte à Idées & Innovation', path: '/innovation-participative', icon: Sparkles, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Documents, Règles & Politiques', path: '/documents', icon: FileText, domain: 'Pilotage RH', permission: 'documents:view_company' },
    { name: 'Processus & Workflows', path: '/workflows', icon: Zap, domain: 'Pilotage RH', permission: 'dashboard:view' },
    { name: 'Diffusion WhatsApp RH', path: '/whatsapp-bot', icon: MessageSquare, domain: 'Pilotage RH', permission: 'dashboard:view' },

    // ── INTELLIGENCE RH : Analyses, reporting et climat social ──
    { name: t('sidebar.analytics', 'Tableaux de Bord RH'), path: '/analytics', icon: BarChart, domain: 'Intelligence RH', permission: 'dashboard:view', manager: true },
    { name: 'Bilan Social Légal', path: '/bilan-social', icon: FileBarChart, domain: 'Intelligence RH', permission: 'payroll:view' },
    { name: 'Générateur de Listes & Requêtes', path: '/requeteur', icon: Grid, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Audit & Historique Daté', path: '/historique', icon: History, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Équité Salariale, Diversité & Inclusion', path: '/pay-equity', icon: Scale, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Baromètre QVT & Climat Social', path: '/barometre-qvt', icon: Smile, domain: 'Intelligence RH', permission: 'dashboard:view', manager: true },
    { name: 'Sentinelle IA Anti-Burnout', path: '/sentinelle-burnout', icon: HeartPulse, domain: 'Intelligence RH', permission: 'dashboard:view', manager: true },
    { name: 'Automatisations & Déclencheurs RH', path: '/smart-automations', icon: Zap, domain: 'Intelligence RH', permission: 'dashboard:view', manager: true },
    { name: 'Observatoire GPEC & Skill Gap', path: '/observatoire-gpec', icon: BrainCircuit, domain: 'Intelligence RH', permission: 'dashboard:view', manager: true },
    { name: 'Bilan Carbone RH & Green HR', path: '/green-hr', icon: Leaf, domain: 'Intelligence RH', permission: 'dashboard:view' },
    { name: 'Canal d\'Alerte & Éthique', path: '/ethics', icon: ShieldAlert, domain: 'Intelligence RH', permission: 'dashboard:view' }
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
                                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all group mb-1',
                                isActive
                                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                            )}
                        >
                            <item.icon
                                className={cn('h-4.5 w-4.5 transition-colors', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')}
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
