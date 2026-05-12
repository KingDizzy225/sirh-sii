import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, HelpCircle, ArrowRight, MessageSquare, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PublicPortal() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Information');
    const [description, setDescription] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [trackingId, setTrackingId] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, isError = false) => {
        setNotification({ text: message, isError });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/public/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    title,
                    category,
                    description
                })
            });

            if (res.ok) {
                const data = await res.json();
                setTrackingId(data.trackingId);
                showNotification("Votre demande a été envoyée avec succès au service RH.");
            } else {
                showNotification("Une erreur est survenue.", true);
            }
        } catch (error) {
            showNotification("Erreur de connexion au serveur.", true);
        } finally {
            setLoading(false);
        }
    };

    if (trackingId) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full shadow-xl border-emerald-100">
                    <CardHeader className="text-center bg-emerald-50 rounded-t-xl pb-8">
                        <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <CardTitle className="text-2xl text-emerald-900">Demande Envoyée !</CardTitle>
                        <CardDescription className="text-emerald-700/80 mt-2">
                            Le service RH a bien reçu votre requête.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6 text-center">
                        <p className="text-sm text-slate-600">
                            Veuillez conserver ce numéro de suivi. Vous pouvez l'utiliser si vous souhaitez recontacter les RH à propos de ce sujet précis.
                        </p>
                        <div className="bg-slate-100 p-4 rounded-lg font-mono text-sm font-bold text-slate-800 tracking-wider">
                            RÉF : {trackingId.split('-')[0].toUpperCase()}
                        </div>
                        <Button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-slate-800">
                            Faire une autre demande
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                            "fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 font-medium",
                            notification.isError ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                        )}
                    >
                        {notification.isError ? <HelpCircle size={20} /> : <CheckCircle2 size={20} />}
                        {notification.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-2xl mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-6">
                    <Briefcase size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Portail Collaborateur RH</h1>
                <p className="mt-3 text-lg text-slate-500 max-w-xl mx-auto">
                    Soumettez vos demandes (acomptes, attestations, informations) directement au département des Ressources Humaines.
                </p>
            </div>

            <Card className="w-full max-w-2xl shadow-xl border-slate-200 overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <MessageSquare className="text-indigo-600" /> Nouvelle Requête
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 bg-slate-50/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Votre Nom & Prénom</label>
                                <Input 
                                    required 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="Ex: Jean Dupont" 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Votre Email</label>
                                <Input 
                                    required 
                                    type="email"
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    placeholder="jean.dupont@entreprise.com" 
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Catégorie de la demande</label>
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full text-sm border-slate-200 rounded-md p-2.5 bg-white shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                            >
                                <option value="Information">Demande d'information générale</option>
                                <option value="Attestation">Demande d'attestation de travail</option>
                                <option value="Acompte">Demande d'acompte sur salaire</option>
                                <option value="Paie">Question sur la paie / mutuelle</option>
                                <option value="Plainte">Plainte / Réclamation</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Objet</label>
                            <Input 
                                required 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                placeholder="Résumez votre demande en une phrase" 
                                className="bg-white font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Description détaillée</label>
                            <textarea 
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Expliquez votre besoin. Le service RH vous répondra par email ou directement via l'outil interne." 
                                className="w-full text-sm border-slate-200 rounded-md p-3 h-40 resize-none bg-white shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-bold shadow-md">
                                {loading ? 'Envoi en cours...' : (
                                    <>Transmettre au service RH <ArrowRight size={18} className="ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            
            <div className="mt-12 text-center text-slate-400 text-sm">
                <p>SIRH Enterprise Portal - Sécurisé et Confidentiel</p>
            </div>
        </div>
    );
}
