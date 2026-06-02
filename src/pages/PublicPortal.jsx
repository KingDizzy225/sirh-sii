import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, HelpCircle, ArrowRight, MessageSquare, Briefcase, 
    Banknote, Calendar, Clock, TrendingUp, AlertCircle, Send, 
    FileText, Shield, ChevronRight, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function PublicPortal() {
    // Active tab: 'general', 'advance', 'absence'
    const [activeTab, setActiveTab] = useState('general');

    // Common employee info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // General request state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Information');
    const [description, setDescription] = useState('');

    // Salary advance state
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [advanceReason, setAdvanceReason] = useState('');
    const [advanceRepayment, setAdvanceRepayment] = useState('3');

    // Absence request state
    const [absenceType, setAbsenceType] = useState('Congé annuel');
    const [absenceDateStart, setAbsenceDateStart] = useState('');
    const [absenceDateEnd, setAbsenceDateEnd] = useState('');
    const [absenceReason, setAbsenceReason] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [trackingId, setTrackingId] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, isError = false) => {
        setNotification({ text: message, isError });
        setTimeout(() => setNotification(null), 5000);
    };

    // Calculated absence duration
    const absenceDuration = useMemo(() => {
        if (!absenceDateStart || !absenceDateEnd) return null;
        const start = new Date(absenceDateStart);
        const end = new Date(absenceDateEnd);
        const diffTime = end - start;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : null;
    }, [absenceDateStart, absenceDateEnd]);

    // Calculated monthly repayment
    const monthlyRepayment = useMemo(() => {
        if (!advanceAmount || !advanceRepayment) return null;
        const amount = parseInt(advanceAmount);
        const months = parseInt(advanceRepayment);
        if (isNaN(amount) || isNaN(months) || months <= 0) return null;
        return Math.ceil(amount / months);
    }, [advanceAmount, advanceRepayment]);

    const formatAmount = (n) => new Intl.NumberFormat('fr-CI').format(n || 0) + ' FCFA';

    // Generic submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            showNotification("Veuillez renseigner votre nom et email.", true);
            return;
        }
        setLoading(true);

        let payload = { name, email };

        if (activeTab === 'general') {
            payload = {
                ...payload,
                title,
                category,
                description
            };
        } else if (activeTab === 'advance') {
            payload = {
                ...payload,
                title: `Demande d'avance sur salaire - ${formatAmount(parseInt(advanceAmount))}`,
                category: 'Acompte',
                description: `Montant demandé : ${formatAmount(parseInt(advanceAmount))}\nPlan de remboursement : ${advanceRepayment} mois\nMensualité estimée : ${formatAmount(monthlyRepayment)}\n\nMotif : ${advanceReason}`
            };
        } else if (activeTab === 'absence') {
            payload = {
                ...payload,
                title: `Demande d'absence - ${absenceType}`,
                category: 'Absence',
                description: `Type : ${absenceType}\nDate de début : ${absenceDateStart}\nDate de fin : ${absenceDateEnd}\nDurée : ${absenceDuration} jour(s)\n\nMotif : ${absenceReason}`
            };
        }

        try {
            const res = await fetch(`${API_URL}/api/public/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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

    // Success screen
    if (trackingId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                >
                    <Card className="max-w-md w-full shadow-2xl border-emerald-100 rounded-3xl overflow-hidden">
                        <CardHeader className="text-center bg-gradient-to-br from-emerald-500 to-teal-600 pb-10 pt-10">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mb-4 border border-white/30"
                            >
                                <CheckCircle2 size={40} />
                            </motion.div>
                            <CardTitle className="text-2xl text-white font-['Outfit']">Demande Envoyée !</CardTitle>
                            <CardDescription className="text-emerald-100 mt-2">
                                Le service RH a bien reçu votre requête.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 pb-8 space-y-6 text-center px-8">
                            <p className="text-sm text-slate-600">
                                Conservez ce numéro de suivi pour toute communication ultérieure avec le service RH.
                            </p>
                            <div className="bg-slate-900 p-5 rounded-2xl font-mono text-lg font-bold text-white tracking-widest shadow-lg">
                                RÉF : {trackingId.split('-')[0].toUpperCase()}
                            </div>
                            <Button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-slate-800 h-12 rounded-xl font-bold shadow-md">
                                Faire une autre demande
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'Requête Générale', icon: MessageSquare, color: 'indigo' },
        { id: 'advance', label: 'Avance sur Salaire', icon: Banknote, color: 'emerald' },
        { id: 'absence', label: 'Demande d\'Absence', icon: Calendar, color: 'blue' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                            "fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-medium",
                            notification.isError ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                        )}
                    >
                        {notification.isError ? <HelpCircle size={20} /> : <CheckCircle2 size={20} />}
                        {notification.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl mb-8 text-center"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-200 mb-6">
                    <Briefcase size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-['Outfit']">
                    Portail Self-Service
                </h1>
                <p className="mt-3 text-lg text-slate-500 max-w-xl mx-auto">
                    Soumettez vos demandes directement au département des Ressources Humaines — sans connexion requise.
                </p>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-3xl mb-6"
            >
                <div className="grid grid-cols-3 gap-3">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl font-semibold text-sm transition-all duration-300 border",
                                    isActive
                                        ? tab.color === 'indigo' 
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                                            : tab.color === 'emerald'
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                                            : "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-md"
                                )}
                            >
                                <Icon size={24} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden text-xs">{tab.id === 'general' ? 'Requête' : tab.id === 'advance' ? 'Avance' : 'Absence'}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Form Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-3xl"
            >
                <Card className="shadow-2xl border-slate-200/80 overflow-hidden rounded-3xl">
                    <CardHeader className={cn(
                        "border-b pb-6",
                        activeTab === 'general' ? "bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-indigo-100" :
                        activeTab === 'advance' ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100" :
                        "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-100"
                    )}>
                        <CardTitle className="flex items-center gap-2 text-xl font-['Outfit']">
                            {activeTab === 'general' && <><MessageSquare className="text-indigo-600" /> Nouvelle Requête</>}
                            {activeTab === 'advance' && <><Banknote className="text-emerald-600" /> Demande d'Avance sur Salaire</>}
                            {activeTab === 'absence' && <><Calendar className="text-blue-600" /> Demande d'Absence</>}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {activeTab === 'general' && "Envoyez une demande générale au service RH."}
                            {activeTab === 'advance' && "Demandez une avance exceptionnelle sur votre salaire."}
                            {activeTab === 'absence' && "Déclarez une absence avec les dates et la durée."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8 bg-white">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Common: Name & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Votre Nom & Prénom *</label>
                                    <Input 
                                        required 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        placeholder="Ex: Amadou Diallo" 
                                        className="bg-slate-50 border-slate-200 rounded-xl h-12 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Votre Email *</label>
                                    <Input 
                                        required 
                                        type="email"
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        placeholder="amadou.diallo@entreprise.com" 
                                        className="bg-slate-50 border-slate-200 rounded-xl h-12 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100" />

                            {/* ===== TAB: GENERAL REQUEST ===== */}
                            {activeTab === 'general' && (
                                <motion.div
                                    key="general"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Catégorie de la demande</label>
                                        <select 
                                            value={category} 
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-slate-50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none focus:bg-white transition-colors"
                                        >
                                            <option value="Information">Demande d'information générale</option>
                                            <option value="Attestation">Demande d'attestation de travail</option>
                                            <option value="Paie">Question sur la paie / mutuelle</option>
                                            <option value="Plainte">Plainte / Réclamation</option>
                                            <option value="Autre">Autre demande</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Objet *</label>
                                        <Input 
                                            required 
                                            value={title} 
                                            onChange={e => setTitle(e.target.value)} 
                                            placeholder="Résumez votre demande en une phrase" 
                                            className="bg-slate-50 font-medium rounded-xl h-12 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Description détaillée *</label>
                                        <textarea 
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Expliquez votre besoin. Le service RH vous répondra par email." 
                                            className="w-full text-sm border border-slate-200 rounded-xl p-4 h-36 resize-none bg-slate-50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none focus:bg-white transition-colors"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* ===== TAB: SALARY ADVANCE ===== */}
                            {activeTab === 'advance' && (
                                <motion.div
                                    key="advance"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Montant demandé (FCFA) *</label>
                                        <div className="relative">
                                            <Banknote size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="number" 
                                                min="10000"
                                                step="5000"
                                                required
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 bg-slate-50 shadow-sm transition-all text-lg font-bold focus:bg-white"
                                                placeholder="Ex: 150000"
                                                value={advanceAmount}
                                                onChange={(e) => setAdvanceAmount(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Montant minimum : 10 000 FCFA</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Plan de remboursement *</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['1', '2', '3', '4'].map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setAdvanceRepayment(m)}
                                                    className={cn(
                                                        "py-3.5 rounded-xl text-sm font-bold transition-all border",
                                                        advanceRepayment === m 
                                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200" 
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                                                    )}
                                                >
                                                    {m} mois
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {/* Monthly estimate */}
                                        {monthlyRepayment && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                    <TrendingUp size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-emerald-600 font-medium">Mensualité estimée</p>
                                                    <p className="text-lg font-bold text-emerald-800 font-['Outfit']">
                                                        {formatAmount(monthlyRepayment)} <span className="text-sm font-normal text-emerald-600">/ mois</span>
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Motif de la demande *</label>
                                        <textarea 
                                            required
                                            value={advanceReason}
                                            onChange={(e) => setAdvanceReason(e.target.value)}
                                            placeholder="Précisez le motif de votre demande d'avance (ex: urgence médicale, frais de scolarité, etc.)"
                                            className="w-full text-sm border border-slate-200 rounded-xl p-4 h-28 resize-none bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none focus:bg-white transition-colors"
                                        />
                                    </div>

                                    {/* Conditions */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-700 space-y-1">
                                            <p className="font-bold">Conditions d'avance sur salaire :</p>
                                            <ul className="list-disc pl-4 space-y-0.5">
                                                <li>L'avance ne peut excéder 50% du salaire net</li>
                                                <li>Le remboursement est déduit automatiquement sur le bulletin de paie</li>
                                                <li>Délai de traitement : 48 à 72 heures ouvrables</li>
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ===== TAB: ABSENCE REQUEST ===== */}
                            {activeTab === 'absence' && (
                                <motion.div
                                    key="absence"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Type d'absence</label>
                                        <select 
                                            value={absenceType} 
                                            onChange={(e) => setAbsenceType(e.target.value)}
                                            className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-slate-50 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none focus:bg-white transition-colors"
                                        >
                                            <option value="Congé annuel">Congé annuel</option>
                                            <option value="Congé maladie">Congé maladie</option>
                                            <option value="Congé maternité">Congé maternité</option>
                                            <option value="Congé paternité">Congé paternité</option>
                                            <option value="Congé sans solde">Congé sans solde</option>
                                            <option value="Autorisation d'absence">Autorisation d'absence</option>
                                            <option value="Absence exceptionnelle">Absence exceptionnelle (mariage, décès, etc.)</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Date de début *</label>
                                            <input 
                                                type="date" 
                                                required
                                                className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 bg-slate-50 shadow-sm transition-all focus:bg-white"
                                                value={absenceDateStart}
                                                onChange={(e) => {
                                                    const newStart = e.target.value;
                                                    setAbsenceDateStart(newStart);
                                                    if (absenceDateEnd && absenceDateEnd < newStart) {
                                                        setAbsenceDateEnd(newStart);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Date de fin *</label>
                                            <input 
                                                type="date" 
                                                required
                                                min={absenceDateStart}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 bg-slate-50 shadow-sm transition-all focus:bg-white"
                                                value={absenceDateEnd}
                                                onChange={(e) => setAbsenceDateEnd(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Duration calculator */}
                                    {absenceDuration && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                <Clock size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-blue-500 font-medium">Durée de l'absence</p>
                                                <p className="text-2xl font-bold text-blue-800 font-['Outfit']">
                                                    {absenceDuration} jour{absenceDuration > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-blue-400 font-medium">
                                                    Du {new Date(absenceDateStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-blue-400 font-medium">
                                                    Au {new Date(absenceDateEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Motif / Commentaire</label>
                                        <textarea 
                                            value={absenceReason}
                                            onChange={(e) => setAbsenceReason(e.target.value)}
                                            placeholder="Précisez le motif de votre absence si nécessaire..."
                                            className="w-full text-sm border border-slate-200 rounded-xl p-4 h-28 resize-none bg-slate-50 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none focus:bg-white transition-colors"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Submit */}
                            <div className="pt-4 border-t border-slate-100">
                                <Button 
                                    type="submit" 
                                    disabled={loading} 
                                    className={cn(
                                        "w-full h-14 text-base font-bold shadow-lg rounded-xl transition-all active:scale-[0.98]",
                                        activeTab === 'general' ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" :
                                        activeTab === 'advance' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" :
                                        "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                                    )}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                            Envoi en cours...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send size={20} />
                                            Transmettre au service RH
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Privacy footer */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex items-center gap-2 text-slate-400 text-sm"
            >
                <Shield size={16} />
                <p>SIRH Enterprise — Portail sécurisé et confidentiel</p>
            </motion.div>
        </div>
    );
}
