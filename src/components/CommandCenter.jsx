import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, User, FileText, Settings, Home, Target, Calendar, BarChart, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
    { id: '1', title: 'Vue d\'ensemble', path: '/', icon: Home, category: 'Navigation' },
    { id: '2', title: 'Explorateur de Carrière', path: '/career-path', icon: Rocket, category: 'Navigation' },
    { id: '3', title: 'Mon Profil', path: '/my-space', icon: User, category: 'Navigation' },
    { id: '4', title: 'Mes Absences', path: '/leaves', icon: Calendar, category: 'Navigation' },
    { id: '5', title: 'Analytique & Coûts', path: '/analytics', icon: BarChart, category: 'Navigation' },
    { id: '6', title: 'Documents GED', path: '/documents', icon: FileText, category: 'Navigation' },
    { id: '7', title: 'Paramètres', path: '/settings', icon: Settings, category: 'Système' },
];

export function CommandCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

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
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const filteredActions = ACTIONS.filter(action =>
        action.title.toLowerCase().includes(query.toLowerCase()) ||
        action.category.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredActions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
        } else if (e.key === 'Enter') {
            if (filteredActions[selectedIndex]) {
                handleSelect(filteredActions[selectedIndex].path);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden"
                    >
                        <div className="flex items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <Search className="text-slate-400 mr-4" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Que cherchez-vous ? (Navigation, Employé, Action...)"
                                className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-slate-100 placeholder-slate-400"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onKeyDown}
                            />
                            <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Esc</span>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                            {filteredActions.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredActions.map((action, index) => (
                                        <div
                                            key={action.id}
                                            onClick={() => handleSelect(action.path)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
                                                index === selectedIndex
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                    <action.icon size={18} className={index === selectedIndex ? 'text-white' : 'text-slate-500'} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{action.title}</p>
                                                    <p className={`text-[10px] ${index === selectedIndex ? 'text-blue-100' : 'text-slate-400'}`}>{action.category}</p>
                                                </div>
                                            </div>
                                            {index === selectedIndex && (
                                                <div className="flex items-center gap-1 text-[10px] font-black bg-white/20 px-2 py-1 rounded">
                                                    <Command size={10} />
                                                    ENTER
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-slate-400 text-sm italic">Aucun résultat trouvé pour "{query}"</p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                            <div className="flex gap-4">
                                <span>↑↓ Naviguer</span>
                                <span>↵ Sélectionner</span>
                            </div>
                            <div>SIRH-SII V3.0 • Command Center</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
