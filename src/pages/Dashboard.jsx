import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, UserPlus, Calendar, Clock, Star, Target, CheckCircle2, 
    TrendingUp, AlertTriangle, ShieldCheck, Sparkles, Download, 
    ArrowRight, Check, X, Building2, MapPin, Activity, Coins, 
    Scale, Handshake, ShieldAlert, Award, FileText, ChevronRight,
    Zap, Landmark, ArrowUpRight, Compass, Bell, RefreshCw, Sun,
    Filter, CheckCheck, AlertOctagon, HelpCircle, ArrowDownRight, Network
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export function Dashboard() {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [notification, setNotification] = useState(null);
    const [activeTabApproval, setActiveTabApproval] = useState('TOUS');

    // Stats globales
    const [stats, setStats] = useState({
        totalEmployees: 194,
        presentsToday: 182,
        onLeave: 6,
        remoteWork: 6,
        masseSalarialeMois: 84250000,
        tauxPresence: 98.4,
        scoreConformite: 98.5
    });

    // Données pour les Sparklines des KPI Cards (Sans violet)
    const sparklineEmployees = [
        { v: 186 }, { v: 188 }, { v: 189 }, { v: 191 }, { v: 192 }, { v: 194 }
    ];
    const sparklinePayroll = [
        { v: 81.2 }, { v: 81.8 }, { v: 82.5 }, { v: 83.1 }, { v: 83.9 }, { v: 84.25 }
    ];
    const sparklinePresence = [
        { v: 96.5 }, { v: 97.0 }, { v: 97.2 }, { v: 97.8 }, { v: 98.1 }, { v: 98.4 }
    ];
    const sparklineCompliance = [
        { v: 94.0 }, { v: 95.5 }, { v: 96.2 }, { v: 97.0 }, { v: 97.9 }, { v: 98.5 }
    ];

    // Approvals unifiées
    const [approvalItems, setApprovalItems] = useState([
        {
            id: 'APP-01',
            type: 'CONGE',
            titre: 'Congé Annuel Payé (4 jours ouvrés)',
            demandeur: 'Kouamé Jean-Luc',
            role: 'Conseiller Clientèle',
            departement: 'Ventes Réseau Plateau',
            date: 'Du 20 au 24 Nov 2026',
            badge: 'Absence',
            badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
            avatar: 'KJ',
            avatarBg: 'bg-blue-600 text-white'
        },
        {
            id: 'APP-02',
            type: 'COMPLIANCE',
            titre: 'Déclaration Cadeau Fournisseur (85 000 FCFA)',
            demandeur: 'Diallo Oumar',
            role: 'Gestionnaire Flotte',
            departement: 'Logistique & Flotte Moto',
            date: 'Reçu le 14 Nov 2026',
            badge: 'Sapin II',
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
            avatar: 'DO',
            avatarBg: 'bg-amber-600 text-white'
        },
        {
            id: 'APP-03',
            type: 'SOD',
            titre: 'Révocation Habilitation Incompatible (Caisse vs Annulation OM)',
            demandeur: 'Koffi Blaise',
            role: 'Caissier Principal',
            departement: 'Agence Yopougon Bel Air',
            date: 'Alerte Audit SoD 14 Nov',
            badge: 'Anti-Fraude',
            badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
            avatar: 'KB',
            avatarBg: 'bg-rose-600 text-white'
        },
        {
            id: 'APP-04',
            type: 'CARRIERE',
            titre: 'Fin de Période d\'Essai CDI (Avis Favorable Manager)',
            demandeur: 'Amani Sylvie',
            role: 'Superviseur Télécoms',
            departement: 'Service Client & Rétention',
            date: 'Échéance le 28 Nov 2026',
            badge: 'Titularisation',
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            avatar: 'AS',
            avatarBg: 'bg-emerald-600 text-white'
        }
    ]);

    // Données Télémétrie des 4 Agences Abidjan
    const agencesStatus = [
        {
            nom: 'Agence Plateau Pyramide',
            commune: 'Plateau (Siège Commercial)',
            etp: 8,
            visiteurs: 380,
            attenteMin: 6.8,
            saturation: 94,
            status: 'OPTIMAL'
        },
        {
            nom: 'Agence Yopougon Bel Air Express',
            commune: 'Yopougon Keneya',
            etp: 12,
            visiteurs: 640,
            attenteMin: 14.2,
            saturation: 122,
            status: 'SURCHARGE'
        },
        {
            nom: 'Agence Treichville Arras',
            commune: 'Treichville Boulevard',
            etp: 8,
            visiteurs: 430,
            attenteMin: 11.5,
            saturation: 108,
            status: 'TENSION'
        },
        {
            nom: 'Boutique VIP Aéroport F.H.B.',
            commune: 'Port-Bouët Express',
            etp: 4,
            visiteurs: 120,
            attenteMin: 3.5,
            saturation: 68,
            status: 'SOUS_CHARGE'
        }
    ];

    // Évolution Masse Salariale sur 6 mois
    const payrollTrendData = [
        { mois: 'Juin', masseM: 81.2, chargesM: 14.2 },
        { mois: 'Juil', masseM: 81.8, chargesM: 14.3 },
        { mois: 'Août', masseM: 82.5, chargesM: 14.5 },
        { mois: 'Sept', masseM: 83.1, chargesM: 14.6 },
        { mois: 'Oct', masseM: 83.9, chargesM: 14.7 },
        { mois: 'Nov', masseM: 84.25, chargesM: 14.8 }
    ];

    // Répartition de l'effectif (Palette corporate sans violet)
    const distributionData = [
        { name: 'Ventes Réseau B2C & B2B', value: 78, color: '#1e3a8a' }, // Deep Navy
        { name: 'Agences & Guichets Abidjan', value: 52, color: '#0284c7' }, // Sky Blue
        { name: 'Technique, Fibre & Télécoms', value: 36, color: '#059669' }, // Emerald
        { name: 'Fonctions Siège & Support', value: 28, color: '#d97706' } // Amber
    ];

    // Échéances RH du mois
    const echeancesRh = [
        { date: '20 Nov', titre: 'Commission Paritaire & Dialogue Social', type: 'NAO', statut: 'Confirmé' },
        { date: '24 Nov', titre: 'Clôture Saisie des Variables de Paie', type: 'PAIE', statut: 'En cours' },
        { date: '26 Nov', titre: 'Émission Fichiers Virements Bancaires', type: 'DAF', statut: 'Planifié' },
        { date: '30 Nov', titre: 'Arrêté Trimestriel Provisions Retraite IDR', type: 'COMPTA', statut: 'Rappel' }
    ];

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3500);
    };

    const handleActionApproval = (id, action) => {
        setApprovalItems(prev => prev.filter(item => item.id !== id));
        showNotification(
            action === 'approve' 
                ? 'Dossier approuvé et scellé dans la piste d\'audit.' 
                : 'Dossier rejeté avec notification directe transmise.'
        );
    };

    const filteredApprovals = activeTabApproval === 'TOUS' 
        ? approvalItems 
        : approvalItems.filter(item => item.type === activeTabApproval);

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 bg-[#F8FAFC] min-h-[calc(100vh-4rem)] max-w-[1600px] mx-auto text-slate-900">
            {/* Notification Toast Flottant Élégant */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs md:text-sm font-semibold border border-slate-700/80"
                    >
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>{notification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* 1. HERO COCKPIT EXÉCUTIF - PALETTE CORPORATE BLEU NUIT / ARDOISE */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-xl border border-slate-800">
                {/* Lueur d'ambiance sobre */}
                <div className="absolute -right-20 -top-20 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute left-1/3 -bottom-20 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[90px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5">
                        {/* Puces de Statut Supérieures */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-white text-[#002B7F] shadow-xs border border-white">
                                <img src="/logo.png" alt="SII" className="h-4 w-auto object-contain" />
                                <span>SII Côte d'Ivoire</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md text-blue-200 border border-white/15 shadow-xs">
                                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                                Cockpit Exécutif · Enterprise Edition
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Réseau Télécoms 100% Opérationnel
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-white/5 text-slate-300 border border-white/10">
                                <Sun className="h-3.5 w-3.5 text-amber-400" />
                                Abidjan 29°C · Mardi 17 Nov
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-serif">
                            Bonjour, {user?.name || 'Direction Générale RH'} 👋
                        </h1>
                        <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                            Supervision stratégique des <strong>194 collaborateurs</strong>, pilotage de la masse salariale UEMOA, télémétrie des agences et conformité légale en direct.
                        </p>
                    </div>

                    {/* Capsule Télémétrie Présence Live */}
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-inner">
                        <div className="px-3 border-r border-white/15 text-left">
                            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Présents ce matin</span>
                            <div className="text-2xl font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
                                <span>{stats.presentsToday}</span>
                                <span className="text-xs text-slate-300 font-normal">/ {stats.totalEmployees}</span>
                            </div>
                        </div>
                        <div className="px-3 border-r border-white/15 text-left">
                            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Télétravail</span>
                            <div className="text-2xl font-black text-sky-400 mt-0.5">{stats.remoteWork}</div>
                        </div>
                        <div className="px-3 text-left">
                            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">En Congé</span>
                            <div className="text-2xl font-black text-amber-400 mt-0.5">{stats.onLeave}</div>
                        </div>
                    </div>
                </div>

                {/* 3 Cartes d'Insights Stratégiques Métier */}
                <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div 
                        onClick={() => navigate('/segregation-des-devoirs-sod')}
                        className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center justify-between group hover:border-red-400/40"
                    >
                        <div className="flex items-center gap-3 truncate">
                            <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                                <ShieldAlert size={16} />
                            </span>
                            <div className="truncate">
                                <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                                    <span>Audit SoD : 1 Conflit Actif</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                                </div>
                                <p className="text-[11px] text-slate-300 truncate">Habilitation caisse à révoquer à Yopougon</p>
                            </div>
                        </div>
                        <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>

                    <div 
                        onClick={() => navigate('/capacite-charge-agences')}
                        className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center justify-between group hover:border-amber-400/40"
                    >
                        <div className="flex items-center gap-3 truncate">
                            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                                <Activity size={16} />
                            </span>
                            <div className="truncate">
                                <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                                    WFM : Tension à Bel Air (122%)
                                </div>
                                <p className="text-[11px] text-slate-300 truncate">Attente moyenne : 14.2 min (+2 ETP requis)</p>
                            </div>
                        </div>
                        <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>

                    <div 
                        onClick={() => navigate('/indemnites-fin-carriere-idr')}
                        className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center justify-between group hover:border-emerald-400/40"
                    >
                        <div className="flex items-center gap-3 truncate">
                            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                <Landmark size={16} />
                            </span>
                            <div className="truncate">
                                <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                                    IAS 19 : Provision Retraite IDR
                                </div>
                                <p className="text-[11px] text-slate-300 truncate">Dotation mensuelle : 420 000 FCFA au passif</p>
                            </div>
                        </div>
                        <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* 2. BARRE D'ACTIONS DIRECTES */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
                        Actions Directes :
                    </span>
                    
                    <button
                        onClick={() => navigate('/orgchart')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-[#002B7F] text-xs font-bold flex items-center gap-1.5 transition-all border border-blue-200 cursor-pointer shadow-2xs"
                    >
                        <Network size={14} className="text-[#002B7F]" />
                        Organigramme & Agences
                    </button>

                    <button
                        onClick={() => navigate('/employees')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 hover:border-blue-200 cursor-pointer shadow-2xs"
                    >
                        <UserPlus size={14} className="text-blue-600" />
                        + Nouveau Salarié
                    </button>

                    <button
                        onClick={() => navigate('/leaves')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 hover:border-blue-200 cursor-pointer shadow-2xs"
                    >
                        <Calendar size={14} className="text-blue-600" />
                        Poser un Congé
                    </button>

                    <button
                        onClick={() => navigate('/accords-dentreprise-nao')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 hover:border-blue-200 cursor-pointer shadow-2xs"
                    >
                        <Handshake size={14} className="text-blue-600" />
                        Accords & NAO 2026
                    </button>

                    <button
                        onClick={() => navigate('/compliance-conflits-interets')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 hover:border-blue-200 cursor-pointer shadow-2xs"
                    >
                        <Scale size={14} className="text-emerald-600" />
                        Déclarer Cadeau / Intérêt
                    </button>

                    <button
                        onClick={() => navigate('/payroll-simulation')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 hover:border-blue-200 cursor-pointer shadow-2xs"
                    >
                        <Coins size={14} className="text-amber-600" />
                        Simuler Masse Salariale
                    </button>
                </div>

                <button
                    onClick={() => showNotification("Rapport de synthèse de direction exporté avec succès.")}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ml-auto"
                >
                    <Download size={14} />
                    Exporter Synthèse DAF
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* 3. 4 CARTES KPI EXÉCUTIVES AVEC SPARKLINES INTÉGRÉES */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Effectif Total */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => navigate('/employees')}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Effectif Total Actif</span>
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <Users size={18} />
                            </span>
                        </div>
                        <div className="mt-2">
                            <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalEmployees}</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    +3 ce mois
                                </span>
                                <span className="text-slate-400 font-normal">100% contrats conformes</span>
                            </div>
                        </div>
                    </div>

                    {/* Mini Sparkline Chart Bleu */}
                    <div className="h-10 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineEmployees} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="sparkEmployees" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25}/>
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} fill="url(#sparkEmployees)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 2. Masse Salariale Mensuelle */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => navigate('/payroll')}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Masse Salariale Brute</span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <Coins size={18} />
                            </span>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-black text-slate-900 tracking-tight">84,25 M FCFA</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    98.8% versé
                                </span>
                                <span className="text-slate-400 font-normal">Échéance : 26 Nov</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-10 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklinePayroll} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="sparkPayroll" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#059669" stopOpacity={0.25}/>
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke="#059669" strokeWidth={2} fill="url(#sparkPayroll)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 3. Taux de Présence & Ponctualité */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => navigate('/shifts')}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taux de Ponctualité</span>
                            <span className="p-2 rounded-xl bg-sky-50 text-sky-600">
                                <Clock size={18} />
                            </span>
                        </div>
                        <div className="mt-2">
                            <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.tauxPresence}%</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    +1.2% vs M-1
                                </span>
                                <span className="text-slate-400 font-normal">Biométrie 4 agences</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-10 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklinePresence} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="sparkPresence" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0284c7" stopOpacity={0.25}/>
                                        <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke="#0284c7" strokeWidth={2} fill="url(#sparkPresence)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 4. Score Conformité & SoD (Corporate Slate / Gold) */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => navigate('/segregation-des-devoirs-sod')}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indice Conformité</span>
                            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                                <ShieldCheck size={18} />
                            </span>
                        </div>
                        <div className="mt-2">
                            <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.scoreConformite}%</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                    Sapin II / MEPS
                                </span>
                                <span className="text-slate-400 font-normal">0 anomalie critique</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-10 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineCompliance} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="sparkCompliance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#334155" stopOpacity={0.25}/>
                                        <stop offset="100%" stopColor="#334155" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke="#334155" strokeWidth={2} fill="url(#sparkCompliance)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* 4. APPROVAL INBOX & TÉLÉMÉTRIE RÉSEAU BOUTIQUES EN DIRECT */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. APPROVAL INBOX : CENTRE D'ARBITRAGE UNIFIÉ (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                        <CheckCircle2 size={18} />
                                    </span>
                                    <h2 className="font-extrabold text-slate-900 text-base md:text-lg">
                                        Centre de Décision & Arbitrages en 1 Clic
                                    </h2>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Traitez vos validations sans naviguer dans plusieurs menus
                                </p>
                            </div>

                            {/* Filtres de la boîte d'approbation */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                                {['TOUS', 'CONGE', 'COMPLIANCE', 'SOD'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTabApproval(tab)}
                                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                            activeTabApproval === tab 
                                                ? 'bg-white text-slate-900 shadow-2xs font-extrabold' 
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {tab === 'TOUS' ? 'Tous' : tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Liste des demandes filtrées */}
                        <div className="divide-y divide-slate-100 mt-2 space-y-2">
                            {filteredApprovals.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                    <CheckCheck size={32} className="mx-auto text-emerald-500 mb-2" />
                                    <p className="font-bold text-slate-700 text-sm">Inbox Zero !</p>
                                    <p className="text-slate-500">Aucun dossier en attente pour ce filtre.</p>
                                </div>
                            ) : (
                                filteredApprovals.map((item) => (
                                    <div key={item.id} className="pt-3 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2.5 rounded-2xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-2xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${item.avatarBg}`}>
                                                {item.avatar}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-xs md:text-sm">{item.titre}</span>
                                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                                                        {item.badge}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                                                    <strong className="text-slate-800">{item.demandeur}</strong>
                                                    <span>({item.role})</span>
                                                    <span>·</span>
                                                    <span className="text-slate-600">{item.departement}</span>
                                                    <span>·</span>
                                                    <span className="text-blue-600 font-medium">{item.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                                            <button
                                                onClick={() => handleActionApproval(item.id, 'reject')}
                                                title="Rejeter la demande"
                                                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
                                            >
                                                <X size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleActionApproval(item.id, 'approve')}
                                                title="Approuver la demande"
                                                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-blue-600/20"
                                            >
                                                <Check size={14} />
                                                Valider
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Traçabilité légale scellée dans la piste d'audit</span>
                        <button 
                            onClick={() => navigate('/task-board')}
                            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                            Ouvrir le Kanban des tâches <ArrowRight size={13} />
                        </button>
                    </div>
                </div>

                {/* 2. TÉLÉMÉTRIE DES AGENCES ABIDJAN EN DIRECT (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                                    <Building2 size={18} />
                                </span>
                                <div>
                                    <h2 className="font-extrabold text-slate-900 text-base">
                                        Réseau Agences & Charge (WFM)
                                    </h2>
                                    <p className="text-xs text-slate-500">Flux d'affluence et saturation guichet en direct</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/capacite-charge-agences')}
                                className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                            >
                                Simulateur IA <ArrowUpRight size={13} />
                            </button>
                        </div>

                        {/* Liste des agences avec jauges de charge */}
                        <div className="space-y-3 mt-3.5">
                            {agencesStatus.map((agence, idx) => (
                                <div key={idx} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100/90 space-y-1.5 hover:bg-slate-100/60 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={13} className="text-blue-600" />
                                            <span className="font-bold text-xs text-slate-900">{agence.nom}</span>
                                        </div>
                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                            agence.saturation > 115 
                                                ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' 
                                                : agence.saturation >= 100 
                                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        }`}>
                                            {agence.saturation}% saturation
                                        </span>
                                    </div>

                                    {/* Jauge progressive */}
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-1.5 rounded-full ${
                                                agence.saturation > 115 ? 'bg-red-500' : agence.saturation >= 100 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${Math.min(agence.saturation, 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 font-medium">
                                        <span>Effectif : <strong className="text-slate-800">{agence.etp} conseillers</strong></span>
                                        <span>Attente : <strong className={agence.attenteMin > 10 ? 'text-red-600 font-bold' : 'text-slate-800'}>~{agence.attenteMin} min</strong></span>
                                        <span>Flux : <strong>{agence.visiteurs}/j</strong></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-center">
                        <button
                            onClick={() => navigate('/carte-agences')}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 w-full"
                        >
                            Ouvrir la cartographie interactive du réseau <ArrowRight size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* 5. ANALYTIQUE MASSE SALARIALE & AGENDA DES ÉCHÉANCES RH */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Évolution Masse Salariale sur 6 mois (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-100">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-base">
                                    Évolution Masse Salariale & Charges UEMOA
                                </h3>
                                <p className="text-xs text-slate-500">Historique semestriel consolidé en Millions FCFA</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                                    Masse Brute
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
                                    Charges Patronales
                                </span>
                            </div>
                        </div>

                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={payrollTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMasseGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                                        </linearGradient>
                                        <linearGradient id="colorChargesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[10, 95]} />
                                    <Tooltip 
                                        formatter={(value, name) => [`${value} Millions FCFA`, name === 'masseM' ? 'Masse Brute' : 'Charges Patronales']}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                                    />
                                    <Area type="monotone" dataKey="masseM" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorMasseGrad)" />
                                    <Area type="monotone" dataKey="chargesM" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorChargesGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Ratio Charges Patronales / Brut : <strong>17.5% (Conforme CNPS)</strong></span>
                        <button 
                            onClick={() => navigate('/payroll')}
                            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            Détail de la paie <ArrowRight size={13} />
                        </button>
                    </div>
                </div>

                {/* 2. AGENDA DES ÉCHÉANCES RH DU MOIS (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-base">
                                    Échéances & Jalons RH de Novembre
                                </h3>
                                <p className="text-xs text-slate-500">Calendrier légal, déclaratif et social</p>
                            </div>
                            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                <Calendar size={18} />
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 mt-2">
                            {echeancesRh.map((ech, idx) => (
                                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center justify-center text-center shrink-0 border border-slate-200">
                                            {ech.date}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-xs">{ech.titre}</p>
                                            <p className="text-[11px] text-slate-500">Pôle : <strong>{ech.type}</strong></p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {ech.statut}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-center">
                        <button
                            onClick={() => navigate('/jours-feries')}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 w-full"
                        >
                            Voir le calendrier social complet <ArrowRight size={13} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
