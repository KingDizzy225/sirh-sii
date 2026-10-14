import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';

import { MOCK_190_EMPLOYEES } from '../constants/mockEmployees';

const getSmartFallbackReply = (query) => {
    const q = query.toLowerCase();
    
    // Check if querying an employee name
    const foundEmp = MOCK_190_EMPLOYEES.find(e => 
        (e.firstName && q.includes(e.firstName.toLowerCase())) || 
        (e.lastName && q.includes(e.lastName.toLowerCase()))
    );
    if (foundEmp) {
        return `Voici la fiche collaborateur de **${foundEmp.firstName} ${foundEmp.lastName}** :\n- **Poste** : ${foundEmp.position || foundEmp.role || 'Cadre'}\n- **Département** : ${foundEmp.department}\n- **Contrat** : ${foundEmp.contractType || 'CDI'}\n- **Localisation** : ${foundEmp.location || 'Siège Abidjan Plateau'}\n- **Email** : ${foundEmp.email}\n\nVous pouvez retrouver son profil complet via la palette universelle **⌘K** ou le menu Collaborateurs.`;
    }

    if (q.includes('congé') || q.includes('conges') || q.includes('absence')) {
        return "Selon le Code du Travail ivoirien (Art. 25) et la convention collective :\n- Chaque salarié acquiert **2,2 jours ouvrables de congés par mois effectif** (soit 26,4 jours ouvrables par an).\n- Le congé est obligatoire et forclos après 3 ans sans pose.\n- Vous pouvez poser une demande de congé en 1 clic via le module **Gestion des Absences & Congés**.";
    }

    if (q.includes('attestation') || q.includes('document') || q.includes('certificat')) {
        return "Vous pouvez générer instantanément vos attestations certifiées dans le **Kiosque d'Attestations RH** :\n- Attestation de Travail & Présence\n- Attestation de Domiciliation Bancaire pour prêt\n- Attestation pour Demande de Visa\n- Certificat de Non-Redevance\nTous les documents comportent un sceau officiel et un **QR Code d'authenticité** vérifiable.";
    }

    if (q.includes('masse salariale') || q.includes('budget') || q.includes('augmentation')) {
        return "Le **Simulateur de Masse Salariale & Arbitrage** (/payroll-simulation) vous permet de modéliser en temps réel :\n- L'impact d'une augmentation générale (0 à 15%)\n- La revalorisation de l'indemnité transport légale (Abidjan)\n- Les charges patronales CNPS (16,45%) et taxes FDFP\n- Le coût employeur annuel sur les 191 collaborateurs.";
    }

    if (q.includes('sentinelle') || q.includes('burnout') || q.includes('fatigue') || q.includes('astreinte')) {
        return "La **Sentinelle Anti-Burnout** (/sentinelle-burnout) analyse les signaux faibles (astreintes consécutives, congés non pris, volume d'heures) et attribue un score de pression sur 100. En cas de risque aigu, un **repos récupérateur de 48h** peut être validé immédiatement.";
    }

    if (q.includes('fdfp') || q.includes('formation')) {
        return "Le plan de formation continue est piloté dans le module **Gestion FDFP** (/fdfp-gestion). SII Côte d'Ivoire cotise à hauteur de 1,2% (0,4% taxe apprentissage + 0,6% formation continue), ouvrant droit à une prise en charge intégrale des certifications agréées.";
    }

    return "Je suis à votre disposition ! Vous pouvez me poser des questions sur la réglementation sociale ivoirienne (CNPS, congés, FDFP), rechercher un collaborateur parmi les 191 salariés, ou être guidé vers les simulateurs financiers et modules de l'application.";
};

export function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Bonjour ! Je suis votre Copilote RH intelligent de SII Côte d\'Ivoire. Que souhaitez-vous vérifier ou rechercher aujourd\'hui ?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMessage }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'bot', text: getSmartFallbackReply(userMessage) }]);
            }
        } catch (err) {
            // Intelligent instant fallback
            setMessages(prev => [...prev, { role: 'bot', text: getSmartFallbackReply(userMessage) }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const SUGGESTIONS = [
        'Règles des congés payés CI ?',
        'Qui est Julie Konan ?',
        'Simulateur Masse Salariale',
        'Sentinelle Anti-Burnout'
    ];

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 md:bottom-6 right-6 z-[200] w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Assistant RH"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <MessageSquare size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Notification dot */}
                {!isOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-44 md:bottom-24 right-6 z-[200] w-[calc(100vw-3rem)] max-w-sm md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">Assistant RH · SII</p>
                                <p className="text-blue-100 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block"></span> En ligne
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'bot' && (
                                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1">
                                            <Bot size={14} className="text-blue-600" />
                                        </div>
                                    )}
                                    <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start items-center gap-2">
                                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Bot size={14} className="text-blue-600" />
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                        <Loader2 size={16} className="text-blue-600 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Suggestions */}
                        {messages.length <= 2 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-1">
                                {SUGGESTIONS.map((s, i) => (
                                    <button key={i} onClick={() => { setInput(s); }} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Posez votre question RH..."
                                className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
