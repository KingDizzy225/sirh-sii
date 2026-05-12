import React, { useState } from 'react';
import { Bug, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // On simule l'envoi d'un ticket de support catégorie "Bug Technique"
        try {
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/support/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: 'Support Technique',
                    priority: 'High',
                    title: `[BUG] ${title}`,
                    description: `URL: ${window.location.href}\n\n${description}`
                })
            });
            
            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSubmitted(false);
                    setTitle('');
                    setDescription('');
                }, 3000);
            }
        } catch (error) {
            console.error("Failed to submit feedback", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                    >
                        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                            <h4 className="font-bold flex items-center gap-2">
                                <Bug size={18} className="text-rose-400" />
                                Signaler un problème
                            </h4>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50">
                            {submitted ? (
                                <div className="text-center py-6 text-emerald-600 font-bold">
                                    <span className="text-4xl block mb-2">🎉</span>
                                    Signalement envoyé aux développeurs !
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Titre du bug</label>
                                        <input 
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ex: Le bouton paie ne marche pas" 
                                            className="w-full text-sm border-slate-200 rounded-lg p-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Détails</label>
                                        <textarea 
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Que faisiez-vous avant le bug ?" 
                                            className="w-full text-sm border-slate-200 rounded-lg p-2 h-24 resize-none focus:ring-indigo-500"
                                        />
                                    </div>
                                    <Button disabled={loading} type="submit" className="w-full bg-slate-900 text-white h-10 font-bold gap-2">
                                        {loading ? 'Envoi...' : <><Send size={16} /> Envoyer</>}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all ${isOpen ? 'bg-slate-200 text-slate-700' : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-110'}`}
            >
                {isOpen ? <X size={24} /> : <Bug size={24} />}
            </button>
        </div>
    );
}
