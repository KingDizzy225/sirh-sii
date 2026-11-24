import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Command, X, User, FileText, Settings, Home, Target, 
    Calendar, BarChart, Rocket, Zap, HeartPulse, Sparkles, Scale, 
    PiggyBank, Award, QrCode, Leaf, ShieldAlert, FileBarChart, 
    Briefcase, Building2, Phone, Mail, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffectif, nomDe } from '../lib/effectif.js';

const MODULES_ACTIONS = [
    { id: 'act-1', title: 'Tableau de Bord Principal', path: '/', icon: Home, category: 'Navigation', shortcut: 'D' },
    { id: 'act-2', title: 'Simulateur Masse Salariale & Arbitrage Budget', path: '/payroll-simulation', icon: PiggyBank, category: 'Pilotage Financier', shortcut: 'S' },
    { id: 'act-3', title: 'Sentinelle IA Anti-Burnout & Prévention', path: '/sentinelle-burnout', icon: HeartPulse, category: 'Intelligence RH', shortcut: 'B' },
    { id: 'act-4', title: 'Automatisations & Déclencheurs RH', path: '/smart-automations', icon: Zap, category: 'Intelligence RH', shortcut: 'A' },
    { id: 'act-5', title: 'Marketplace Interne de Compétences', path: '/marketplace-talents', icon: Sparkles, category: 'Talents & Missions', shortcut: 'M' },
    { id: 'act-6', title: 'Copilote IA d\'Entretien Annuel & OKR', path: '/performance', icon: Target, category: 'Évaluation & Performance', shortcut: 'P' },
    { id: 'act-7', title: 'Sentinelle Légale & Audit CNPS', path: '/conformite', icon: Scale, category: 'Conformité & Droit CI', shortcut: 'L' },
    { id: 'act-8', title: 'Gestion FDFP & Plan de Formation', path: '/fdfp-gestion', icon: Award, category: 'Développement RH', shortcut: 'F' },
    { id: 'act-9', title: 'Matrice 9-Box & Cartographie Compétences', path: '/skills', icon: Award, category: 'Talents & GPEC', shortcut: 'K' },
    { id: 'act-10', title: 'Kiosque d\'Attestations & Documents', path: '/kiosque-attestations', icon: FileText, category: 'Administration RH', shortcut: 'T' },
    { id: 'act-11', title: 'Pointage QR Code & Emargement', path: '/qr-pointage', icon: QrCode, category: 'Temps & Activités', shortcut: 'Q' },
    { id: 'act-12', title: 'Bilan Carbone & Green HR', path: '/green-hr', icon: Leaf, category: 'RSE & Environnement', shortcut: 'G' },
    { id: 'act-13', title: 'Gestion des Absences & Congés', path: '/leaves', icon: Calendar, category: 'Administration RH', shortcut: 'C' },
    { id: 'act-14', title: 'Gestion de la Paie & Bulletins', path: '/payroll', icon: FileBarChart, category: 'Pilotage Financier', shortcut: '$' },
    { id: 'act-15', title: 'Recrutement & Sourcing IA', path: '/recruitment', icon: Briefcase, category: 'Acquisition Talents', shortcut: 'R' },
    { id: 'act-16', title: 'Paramètres du Système', path: '/settings', icon: Settings, category: 'Système', shortcut: ',' }
];

export function CommandCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // La recherche porte sur l'effectif réel : une liste embarquée proposait
    // des noms que la base ne connaissait pas, et le clic ne menait nulle part.
    const { salaries } = useEffectif();

    const employeeItems = salaries.map(emp => ({
        id: `emp-${emp.id}`,
        title: nomDe(emp),
        category: `Collaborateur • ${emp.department || 'Pôle Opérations'}`,
        path: '/employees',
        icon: User,
        isEmployee: true,
        data: emp
    }));

    const ALL_ITEMS = [...MODULES_ACTIONS, ...employeeItems];

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isOpen]);

    const filteredItems = ALL_ITEMS.filter(item => {
        const q = query.toLowerCase().trim();
        if (!q) return true;
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchDept = item.data?.department?.toLowerCase().includes(q);
        const matchRole = (item.data?.role || item.data?.position)?.toLowerCase().includes(q);
        const matchEmail = item.data?.email?.toLowerCase().includes(q);
        return matchTitle || matchCategory || matchDept || matchRole || matchEmail;
    }).slice(0, 30); // Show top 30 for performance

    const handleSelect = (item) => {
        if (!item) return;
        navigate(item.path);
        setIsOpen(false);
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            if (filteredItems[selectedIndex]) {
                handleSelect(filteredItems[selectedIndex]);
            }
        }
    };

    const selectedItem = filteredItems[selectedIndex];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
                    />

                    {/* Palette Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -16 }}
                        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]"
                    >
                        {/* Search Input Bar */}
                        <div className="flex items-center px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 gap-3 bg-white dark:bg-slate-900">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
                                <Search size={20} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Rechercher parmi les 191 collaborateurs, modules RH, simulations..."
                                className="flex-1 bg-transparent border-none outline-none text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                onKeyDown={onKeyDown}
                            />
                            <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px] font-bold text-slate-500 uppercase border border-slate-200 dark:border-slate-700">
                                    ESC
                                </span>
                            </div>
                        </div>

                        {/* Content Area: Left list + Right Preview */}
                        <div className="flex flex-1 overflow-hidden divide-x divide-slate-100 dark:divide-slate-800">
                            
                            {/* Left: Scrollable List */}
                            <div className="w-full md:w-3/5 overflow-y-auto p-3 space-y-1 max-h-[50vh]">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item, index) => {
                                        const isSelected = index === selectedIndex;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`p-2 rounded-xl shrink-0 ${
                                                        isSelected
                                                            ? 'bg-white/20 text-white'
                                                            : item.isEmployee
                                                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                        <item.icon size={17} />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-sm font-bold truncate">{item.title}</p>
                                                        <p className={`text-[11px] truncate font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                            {item.category}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {isSelected && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md">
                                                            <CornerDownLeft size={10} /> Aller
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-16 text-center text-slate-400 text-sm italic">
                                        Aucun collaborateur ou module ne correspond à « {query} »
                                    </div>
                                )}
                            </div>

                            {/* Right: Instant Context Preview Panel */}
                            <div className="hidden md:flex md:w-2/5 p-5 bg-slate-50/60 dark:bg-slate-950/40 flex-col justify-between">
                                {selectedItem ? (
                                    selectedItem.isEmployee && selectedItem.data ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg border border-indigo-200">
                                                    {selectedItem.title.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                                                        {selectedItem.title}
                                                    </h4>
                                                    <span className="text-xs text-indigo-600 font-semibold">
                                                        {selectedItem.data.position || selectedItem.data.role || 'Cadre'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                                <div className="flex items-center justify-between text-slate-500">
                                                    <span>Département :</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                                        {selectedItem.data.department || 'Banque & PME'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-slate-500">
                                                    <span>Contrat :</span>
                                                    <span className="font-bold text-emerald-600">
                                                        {selectedItem.data.contractType || 'CDI'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-slate-500">
                                                    <span>Localisation :</span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                                        {selectedItem.data.location || 'Siège Abidjan Plateau'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-slate-500">
                                                    <span>Email :</span>
                                                    <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                                                        {selectedItem.data.email || 'collaborateur@sii.ci'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                                                <span className="font-bold text-slate-700 dark:text-slate-300 block">Actions Rapides :</span>
                                                <p className="text-slate-500">• Consulter le dossier RH</p>
                                                <p className="text-slate-500">• Générer trame d'entretien IA</p>
                                                <p className="text-slate-500">• Vérifier solde de congés</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                                                    <selectedItem.icon size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                                        {selectedItem.title}
                                                    </h4>
                                                    <span className="text-xs text-indigo-600 font-semibold">
                                                        {selectedItem.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                                Accédez directement à ce module pour piloter les données en temps réel sur les 191 collaborateurs de l'entreprise.
                                            </p>

                                            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 font-medium">
                                                Appuyez sur <span className="font-extrabold underline">Entrée ↵</span> pour ouvrir immédiatement la vue.
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-xs text-slate-400 text-center my-auto">
                                        Sélectionnez un élément pour voir l'aperçu
                                    </div>
                                )}

                                <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                                    Effectif actif : <span className="font-bold text-slate-700 dark:text-slate-300">191 collaborateurs</span>
                                </div>
                            </div>

                        </div>

                        {/* Footer Bar */}
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400 font-medium">
                            <div className="flex gap-4">
                                <span><strong className="text-slate-600 dark:text-slate-300">↑↓</strong> Naviguer</span>
                                <span><strong className="text-slate-600 dark:text-slate-300">↵</strong> Ouvrir</span>
                                <span><strong className="text-slate-600 dark:text-slate-300">ESC</strong> Fermer</span>
                            </div>
                            <div className="text-[11px] font-semibold text-indigo-600">
                                Command Palette Universelle • SIRH
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default CommandCenter;
