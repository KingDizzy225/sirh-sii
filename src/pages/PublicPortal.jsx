import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, HelpCircle, ArrowRight, MessageSquare, Briefcase, 
    Banknote, Calendar, Clock, TrendingUp, AlertCircle, Send, 
    FileText, Shield, ChevronRight, X, QrCode, Download, Search,
    Receipt, Sparkles, UserCheck, Timer, AlertTriangle, MessageCircle,
    Building, RefreshCw, ThumbsUp, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function PublicPortal() {
    // Onglet actif : 'clockin', 'certificate', 'tracking', 'advance', 'expense', 'absence', 'general', 'ideas', 'chat'
    const [activeTab, setActiveTab] = useState('clockin');

    // Horloge en direct pour la borne de pointage
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Notification Toast
    const [notification, setNotification] = useState(null);
    const showNotification = (message, isError = false) => {
        setNotification({ text: message, isError });
        setTimeout(() => setNotification(null), 5000);
    };

    // Global loading & success
    const [loading, setLoading] = useState(false);
    const [trackingId, setTrackingId] = useState(null);

    // ==========================================
    // 1. POINTAGE & PRÉSENCE
    // ==========================================
    const [clockIdentifier, setClockIdentifier] = useState('');
    const [clockType, setClockType] = useState('CLOCK_IN'); // 'CLOCK_IN', 'CLOCK_OUT', 'DELAY'
    const [delayMinutes, setDelayMinutes] = useState('30');
    const [delayReason, setDelayReason] = useState('');
    const [clockSuccessInfo, setClockSuccessInfo] = useState(null);

    const handleClockIn = async (e) => {
        e.preventDefault();
        if (!clockIdentifier.trim()) {
            showNotification("Veuillez renseigner votre matricule, email ou nom.", true);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/public/clock-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: clockIdentifier,
                    type: clockType,
                    delayMinutes: clockType === 'DELAY' ? delayMinutes : undefined,
                    reason: clockType === 'DELAY' ? delayReason : undefined
                })
            });
            const data = await res.json();
            if (res.ok) {
                setClockSuccessInfo(data);
                showNotification(data.message || "Pointage validé avec succès !");
            } else {
                showNotification(data.error || "Erreur lors du pointage.", true);
            }
        } catch (err) {
            showNotification("Erreur de connexion au serveur de pointage.", true);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // 2. ATTESTATIONS RH PDF
    // ==========================================
    const [certIdentifier, setCertIdentifier] = useState('');
    const [certType, setCertType] = useState('WORK'); // 'WORK', 'SALARY', 'INTERNSHIP'
    const [certDownloading, setCertDownloading] = useState(false);

    const handleDownloadCertificate = async (e) => {
        e.preventDefault();
        if (!certIdentifier.trim()) {
            showNotification("Veuillez saisir votre email ou matricule.", true);
            return;
        }
        setCertDownloading(true);
        try {
            const res = await fetch(`${API_URL}/api/public/certificate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: certIdentifier,
                    certificateType: certType
                })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Attestation_${certType}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                showNotification("Attestation officielle téléchargée avec succès !");
            } else {
                const err = await res.json().catch(() => ({}));
                showNotification(err.error || "Impossible de générer l'attestation. Vérifiez vos identifiants.", true);
            }
        } catch (err) {
            showNotification("Erreur lors de la génération du document.", true);
        } finally {
            setCertDownloading(false);
        }
    };

    // ==========================================
    // 3. TRACKER DE DOSSIER EN DIRECT
    // ==========================================
    const [trackQuery, setTrackQuery] = useState('');
    const [trackResult, setTrackResult] = useState(null);
    const [trackLoading, setTrackLoading] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackQuery.trim()) {
            showNotification("Veuillez entrer une référence ou un email.", true);
            return;
        }
        setTrackLoading(true);
        setTrackResult(null);
        try {
            const res = await fetch(`${API_URL}/api/public/track/${encodeURIComponent(trackQuery.trim())}`);
            const data = await res.json();
            if (res.ok) {
                setTrackResult(data);
            } else {
                showNotification(data.error || "Aucun dossier trouvé.", true);
            }
        } catch (err) {
            showNotification("Erreur lors de la recherche du dossier.", true);
        } finally {
            setTrackLoading(false);
        }
    };

    // ==========================================
    // 4. NOTES DE FRAIS
    // ==========================================
    const [expenseEmail, setExpenseEmail] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('Déplacement');
    const [expenseMerchant, setExpenseMerchant] = useState('');
    const [expenseNotes, setExpenseNotes] = useState('');

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!expenseEmail.trim() || !expenseAmount) {
            showNotification("Veuillez renseigner votre email et le montant.", true);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/public/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: expenseEmail,
                    amount: parseFloat(expenseAmount),
                    category: expenseCategory,
                    merchant: expenseMerchant,
                    notes: expenseNotes
                })
            });
            const data = await res.json();
            if (res.ok) {
                setTrackingId(data.trackingId || 'EXP-OK');
                showNotification(data.message || "Note de frais transmise !");
            } else {
                showNotification(data.error || "Erreur lors du dépôt de la note de frais.", true);
            }
        } catch (err) {
            showNotification("Erreur réseau.", true);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // 5. CLIMAT & BOÎTE À IDÉES
    // ==========================================
    const [ideaFeedback, setIdeaFeedback] = useState('');
    const [ideaScore, setIdeaScore] = useState(9);
    const [ideaDepartment, setIdeaDepartment] = useState('Opérations');
    const [ideaSuccess, setIdeaSuccess] = useState(false);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!ideaFeedback.trim()) {
            showNotification("Veuillez saisir votre suggestion ou remarque.", true);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/public/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: ideaScore,
                    feedback: ideaFeedback,
                    department: ideaDepartment,
                    isIdea: true
                })
            });
            const data = await res.json();
            if (res.ok) {
                setIdeaSuccess(true);
                showNotification(data.message || "Suggestion transmise avec succès !");
            } else {
                showNotification(data.error || "Erreur.", true);
            }
        } catch (err) {
            showNotification("Erreur de transmission.", true);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // 6. CHATBOT RH FAQ PUBLIC
    // ==========================================
    const [chatMessages, setChatMessages] = useState([
        { sender: 'bot', text: "Bonjour ! Je suis l'assistant RH de SII. Posez-moi vos questions sur les congés, la paie, les attestations ou les procédures internes." }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    const handleSendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput.trim();
        setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setChatInput('');
        setChatLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/public/faq-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply || "Je n'ai pas pu obtenir de réponse. Veuillez contacter rh@sii-ci.com." }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { sender: 'bot', text: "Service d'assistance momentanément indisponible. Vous pouvez contacter les RH via une requête générale." }]);
        } finally {
            setChatLoading(false);
        }
    };

    // ==========================================
    // 7. FORMULAIRES EXISTANTS (Général, Avance, Absence)
    // ==========================================
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Information');
    const [description, setDescription] = useState('');
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [advanceReason, setAdvanceReason] = useState('');
    const [advanceRepayment, setAdvanceRepayment] = useState('3');
    const [absenceType, setAbsenceType] = useState('Congé annuel');
    const [absenceDateStart, setAbsenceDateStart] = useState('');
    const [absenceDateEnd, setAbsenceDateEnd] = useState('');
    const [absenceReason, setAbsenceReason] = useState('');

    const handleSubmitClassic = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            showNotification("Veuillez renseigner votre nom et email.", true);
            return;
        }
        setLoading(true);

        try {
            let res;
            if (activeTab === 'advance') {
                res = await fetch(`${API_URL}/api/advances/public`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        amount: parseInt(advanceAmount),
                        reason: advanceReason,
                        repaymentMonths: parseInt(advanceRepayment)
                    })
                });
            } else if (activeTab === 'absence') {
                res = await fetch(`${API_URL}/api/leaves/public`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        type: absenceType,
                        startDate: absenceDateStart,
                        endDate: absenceDateEnd,
                        reason: absenceReason
                    })
                });
            } else {
                res = await fetch(`${API_URL}/api/public/tickets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, title, category, description })
                });
            }

            if (res.ok) {
                const data = await res.json();
                setTrackingId(data.trackingId || data.id || 'OK');
                showNotification("Votre demande a été transmise avec succès aux RH.");
            } else {
                const errData = await res.json().catch(() => ({}));
                showNotification(errData.error || "Une erreur est survenue.", true);
            }
        } catch (error) {
            showNotification("Erreur de connexion au serveur.", true);
        } finally {
            setLoading(false);
        }
    };

    // Écran de succès pour trackingId
    if (trackingId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="max-w-md w-full"
                >
                    <Card className="bg-slate-900 border-slate-700 shadow-2xl rounded-3xl overflow-hidden text-white">
                        <CardHeader className="text-center bg-gradient-to-br from-emerald-600 to-teal-700 pb-10 pt-10">
                            <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mb-4 border border-white/30">
                                <CheckCircle2 size={40} />
                            </div>
                            <CardTitle className="text-2xl text-white font-['Outfit']">Demande Transmise !</CardTitle>
                            <CardDescription className="text-emerald-100 mt-2">
                                Votre requête est enregistrée dans le système RH.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 pb-8 space-y-6 text-center px-8">
                            <p className="text-sm text-slate-400">
                                Conservez cette référence pour suivre l'avancement en direct sur le guichet :
                            </p>
                            {/* La référence est affichée entière : tronquée, elle ne permet pas
                                de retrouver la demande, et le salarié recopie un identifiant
                                qui ne mène nulle part. */}
                            <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl font-mono text-base font-bold text-emerald-400 shadow-inner break-all">
                                RÉF : {trackingId}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    try {
                                        navigator.clipboard?.writeText(trackingId);
                                    } catch { /* presse-papiers indisponible : la référence reste lisible */ }
                                }}
                                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 h-11 rounded-xl"
                            >
                                Copier la référence
                            </Button>
                            <div className="flex gap-3">
                                <Button 
                                    onClick={() => {
                                        setTrackQuery(trackingId);
                                        setTrackingId(null);
                                        setActiveTab('tracking');
                                    }} 
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 h-12 rounded-xl font-bold"
                                >
                                    Suivre ce dossier
                                </Button>
                                <Button 
                                    onClick={() => { setTrackingId(null); setClockSuccessInfo(null); }} 
                                    variant="outline"
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800 h-12 rounded-xl"
                                >
                                    Nouveau
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const navTabs = [
        { id: 'clockin', label: 'Pointage Express', icon: Timer, color: 'emerald' },
        { id: 'certificate', label: 'Attestations PDF', icon: FileText, color: 'blue' },
        { id: 'tracking', label: 'Suivre Dossier', icon: Search, color: 'amber' },
        { id: 'advance', label: 'Avance Salaire', icon: Banknote, color: 'purple' },
        { id: 'expense', label: 'Notes de Frais', icon: Receipt, color: 'indigo' },
        { id: 'absence', label: 'Absence & Congé', icon: Calendar, color: 'cyan' },
        { id: 'ideas', label: 'Boîte à Idées', icon: Sparkles, color: 'pink' },
        { id: 'chat', label: 'FAQ Virtuelle', icon: MessageCircle, color: 'teal' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 text-slate-100">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                            "fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm border backdrop-blur-md",
                            notification.isError ? "bg-rose-600/90 border-rose-500 text-white" : "bg-emerald-600/90 border-emerald-500 text-white"
                        )}
                    >
                        {notification.isError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                        {notification.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Officiel */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mb-6 text-center"
            >
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
                    <Building size={28} className="mr-2 text-blue-400" />
                    <span className="font-mono text-sm tracking-wider uppercase font-bold text-white">SII Côte d'Ivoire · Espace Collaborateur</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-['Outfit']">
                    Grand Guichet Unique RH
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
                    Badgez votre présence, téléchargez vos attestations officielles et suivez vos démarches sans mot de passe.
                </p>
            </motion.div>

            {/* Navigation horizontale par onglets */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-4xl mb-8"
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 backdrop-blur-xl">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                )}
                            >
                                <Icon size={18} />
                                <span className="truncate max-w-full text-[11px]">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Contenu Principal */}
            <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-4xl"
            >
                {/* ======================================================== */}
                {/* 1. BORNE DE POINTAGE & PRÉSENCE                          */}
                {/* ======================================================== */}
                {activeTab === 'clockin' && (
                    <Card className="bg-slate-900/90 border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900 border-b border-slate-800 p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3 font-['Outfit']">
                                        <Timer className="text-emerald-400" size={28} />
                                        Borne de Pointage Présence
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 mt-1">
                                        Enregistrez votre arrivée, départ ou signalez un retard en 1 clic.
                                    </CardDescription>
                                </div>
                                <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                                    <Clock className="text-emerald-400 animate-pulse" size={20} />
                                    <div className="font-mono text-xl font-bold text-white tracking-wider">
                                        {currentTime.toLocaleTimeString('fr-FR')}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {clockSuccessInfo ? (
                                <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{clockSuccessInfo.message}</h3>
                                    {clockSuccessInfo.employee && (
                                        <p className="text-slate-300 text-sm">
                                            Collaborateur : <span className="font-bold text-emerald-400">{clockSuccessInfo.employee.name}</span> ({clockSuccessInfo.employee.department})
                                        </p>
                                    )}
                                    <Button 
                                        onClick={() => { setClockSuccessInfo(null); setClockIdentifier(''); }}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold px-6"
                                    >
                                        Nouveau Pointage
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleClockIn} className="space-y-6">
                                    {/* Choix du type de pointage */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setClockType('CLOCK_IN')}
                                            className={cn(
                                                "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all font-bold text-sm",
                                                clockType === 'CLOCK_IN'
                                                    ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                                            )}
                                        >
                                            <UserCheck size={24} />
                                            <span>Arrivée (Prise de poste)</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setClockType('CLOCK_OUT')}
                                            className={cn(
                                                "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all font-bold text-sm",
                                                clockType === 'CLOCK_OUT'
                                                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                                                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                                            )}
                                        >
                                            <Clock size={24} />
                                            <span>Départ (Fin de journée)</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setClockType('DELAY')}
                                            className={cn(
                                                "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all font-bold text-sm",
                                                clockType === 'DELAY'
                                                    ? "bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/20"
                                                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                                            )}
                                        >
                                            <AlertTriangle size={24} />
                                            <span>Signaler un Retard</span>
                                        </button>
                                    </div>

                                    {/* Saisie de l'identifiant */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">
                                            Votre Email Professionnel, Matricule ou Nom Prénom *
                                        </label>
                                        <div className="relative">
                                            <Input
                                                required
                                                type="text"
                                                value={clockIdentifier}
                                                onChange={(e) => setClockIdentifier(e.target.value)}
                                                placeholder="Ex: amadou.diallo@sii-ci.com ou Amadou Diallo"
                                                className="bg-slate-800 border-slate-700 text-white rounded-xl h-14 pl-4 pr-12 text-base focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                <QrCode size={22} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Options spécifiques en cas de retard */}
                                    {clockType === 'DELAY' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400">Durée estimée du retard</label>
                                                <select
                                                    value={delayMinutes}
                                                    onChange={(e) => setDelayMinutes(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl h-12 px-3 text-sm outline-none"
                                                >
                                                    <option value="15">15 minutes</option>
                                                    <option value="30">30 minutes</option>
                                                    <option value="45">45 minutes</option>
                                                    <option value="60">1 heure</option>
                                                    <option value="120">2 heures ou plus</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400">Motif du retard</label>
                                                <Input
                                                    value={delayReason}
                                                    onChange={(e) => setDelayReason(e.target.value)}
                                                    placeholder="Embouteillage, urgence médicale, pluie..."
                                                    className="bg-slate-800 border-slate-700 text-white rounded-xl h-12 text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className={cn(
                                            "w-full h-14 text-base font-bold rounded-2xl shadow-xl transition-all",
                                            clockType === 'CLOCK_IN' ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20" :
                                            clockType === 'CLOCK_OUT' ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20" :
                                            "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
                                        )}
                                    >
                                        {loading ? "Enregistrement..." : 
                                         clockType === 'CLOCK_IN' ? "Valider mon Arrivée" :
                                         clockType === 'CLOCK_OUT' ? "Valider mon Départ" : "Transmettre le Retard aux RH"}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ======================================================== */}
                {/* 2. ATTESTATIONS RH PDF                                   */}
                {/* ======================================================== */}
                {activeTab === 'certificate' && (
                    <Card className="bg-slate-900/90 border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border-b border-slate-800 p-6 sm:p-8">
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3 font-['Outfit']">
                                <FileText className="text-blue-400" size={28} />
                                Attestations Officielles en 1 Clic
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Téléchargez directement vos documents certifiés avec tampon numérique et référence d'authenticité.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <form onSubmit={handleDownloadCertificate} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-300">Type de document requis</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: 'WORK', title: 'Attestation de Travail', desc: 'Emploi actuel & ancienneté' },
                                            { id: 'SALARY', title: 'Attestation de Salaire', desc: 'Pour banques & crédits' },
                                            { id: 'INTERNSHIP', title: 'Certificat de Stage', desc: 'Validation de période' },
                                        ].map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => setCertType(t.id)}
                                                className={cn(
                                                    "cursor-pointer p-4 rounded-2xl border transition-all",
                                                    certType === t.id
                                                        ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                                                        : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/80"
                                                )}
                                            >
                                                <h4 className="font-bold text-sm text-white mb-1">{t.title}</h4>
                                                <p className="text-xs text-slate-400">{t.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Votre Email ou Matricule Employé *</label>
                                    <Input
                                        required
                                        type="text"
                                        value={certIdentifier}
                                        onChange={(e) => setCertIdentifier(e.target.value)}
                                        placeholder="Ex: amadou.diallo@sii-ci.com"
                                        className="bg-slate-800 border-slate-700 text-white rounded-xl h-14 pl-4 text-base focus:border-blue-500"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Le document sera immédiatement généré avec les informations de votre dossier RH officiel.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={certDownloading}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 text-base"
                                >
                                    {certDownloading ? (
                                        "Génération du PDF officiel..."
                                    ) : (
                                        <>
                                            <Download size={20} />
                                            Télécharger mon Attestation (PDF)
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* ======================================================== */}
                {/* 3. TRACKER DE DOSSIER EN DIRECT                          */}
                {/* ======================================================== */}
                {activeTab === 'tracking' && (
                    <Card className="bg-slate-900/90 border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-amber-900/40 via-slate-900 to-slate-900 border-b border-slate-800 p-6 sm:p-8">
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3 font-['Outfit']">
                                <Search className="text-amber-400" size={28} />
                                Suivi de Dossier en Direct
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Saisissez votre numéro de suivi (ex: 8A19BF2D) ou votre email pour connaître l'état de traitement.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <form onSubmit={handleTrack} className="flex gap-3">
                                <Input
                                    required
                                    type="text"
                                    value={trackQuery}
                                    onChange={(e) => setTrackQuery(e.target.value)}
                                    placeholder="Ex: RÉF ou amadou.diallo@sii-ci.com"
                                    className="bg-slate-800 border-slate-700 text-white rounded-xl h-14 px-4 text-base focus:border-amber-500 flex-1 font-mono"
                                />
                                <Button
                                    type="submit"
                                    disabled={trackLoading}
                                    className="bg-amber-600 hover:bg-amber-500 text-white px-8 h-14 rounded-xl font-bold"
                                >
                                    {trackLoading ? "Recherche..." : "Vérifier"}
                                </Button>
                            </form>

                            {/* Résultat du suivi */}
                            {trackResult && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-850 border border-slate-700 rounded-2xl p-6 space-y-5"
                                >
                                    <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                                        <div>
                                            <span className="text-xs font-mono uppercase bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">
                                                Type : {trackResult.category || trackResult.type}
                                            </span>
                                            <h3 className="text-lg font-bold text-white mt-2">{trackResult.title || 'Dossier Collaborateur'}</h3>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-bold border",
                                            trackResult.status === 'Validé' || trackResult.status === 'Résolu' || trackResult.status === 'Approved' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                            trackResult.status === 'Refusé' || trackResult.status === 'Rejected' ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
                                            "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                        )}>
                                            {trackResult.status}
                                        </div>
                                    </div>

                                    {/* Timeline visuelle */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progression du traitement</h4>
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold">
                                                1. Reçue RH
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-xl border font-bold",
                                                trackResult.status !== 'Ouvert' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500"
                                            )}>
                                                2. En Examen
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-xl border font-bold",
                                                trackResult.status === 'Validé' || trackResult.status === 'Résolu' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                                                trackResult.status === 'Refusé' ? "bg-rose-500/20 border-rose-500/30 text-rose-400" : "bg-slate-800 border-slate-700 text-slate-500"
                                            )}>
                                                3. Traitée
                                            </div>
                                        </div>
                                    </div>

                                    {trackResult.details && (
                                        <div className="text-sm text-slate-400 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                                            <p>Demandeur : <span className="text-white font-semibold">{trackResult.details.employee}</span></p>
                                            {trackResult.details.amount && <p>Montant : <span className="text-emerald-400 font-semibold">{trackResult.details.amount.toLocaleString('fr-FR')} FCFA</span></p>}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ======================================================== */}
                {/* 4. NOTES DE FRAIS                                        */}
                {/* ======================================================== */}
                {activeTab === 'expense' && (
                    <Card className="bg-slate-900/90 border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border-b border-slate-800 p-6 sm:p-8">
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3 font-['Outfit']">
                                <Receipt className="text-indigo-400" size={28} />
                                Dépôt de Notes de Frais
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Transmettez vos frais professionnels (transport, repas, mission) pour remboursement sur la prochaine paie.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <form onSubmit={handleExpenseSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Votre Email Professionnel *</label>
                                        <Input
                                            required
                                            type="email"
                                            value={expenseEmail}
                                            onChange={(e) => setExpenseEmail(e.target.value)}
                                            placeholder="nom.prenom@sii-ci.com"
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Montant en FCFA *</label>
                                        <Input
                                            required
                                            type="number"
                                            value={expenseAmount}
                                            onChange={(e) => setExpenseAmount(e.target.value)}
                                            placeholder="Ex: 25000"
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Catégorie</label>
                                        <select
                                            value={expenseCategory}
                                            onChange={(e) => setExpenseCategory(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl h-12 px-3 text-sm outline-none"
                                        >
                                            <option value="Déplacement">Déplacement / Taxi / Carburant</option>
                                            <option value="Repas">Repas d'affaires / Client</option>
                                            <option value="Hébergement">Hébergement / Hôtel</option>
                                            <option value="Équipement">Petit matériel / Fournitures</option>
                                            <option value="Autre">Autre dépense pro</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Commerçant / Fournisseur</label>
                                        <Input
                                            type="text"
                                            value={expenseMerchant}
                                            onChange={(e) => setExpenseMerchant(e.target.value)}
                                            placeholder="Ex: Yango, Restaurant Le Plateau..."
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Précisions ou Motif de la mission</label>
                                    <textarea
                                        value={expenseNotes}
                                        onChange={(e) => setExpenseNotes(e.target.value)}
                                        placeholder="Détails du déplacement, noms des participants..."
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm h-24 outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20"
                                >
                                    {loading ? "Envoi en cours..." : "Soumettre la Note de Frais"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* ======================================================== */}
                {/* 5. AVANCES SUR SALAIRE                                   */}
                {/* ======================================================== */}
                {activeTab === 'advance' && (
                    <Card className="bg-slate-900/90 border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border-b border-slate-800 p-6 sm:p-8">
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3 font-['Outfit']">
                                <Banknote className="text-purple-400" size={28} />
                                Demande d'Avance sur Salaire
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Demandez une avance exceptionnelle remboursable sur vos prochaines paies.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <form onSubmit={handleSubmitClassic} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Votre Nom & Prénom *</label>
                                        <Input
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Ex: Kouamé Konan"
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Votre Email Pro *</label>
                                        <Input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="kouame.konan@sii-ci.com"
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Montant souhaité (FCFA) *</label>
                                        <Input
                                            required
                                            type="number"
                                            value={advanceAmount}
                                            onChange={e => setAdvanceAmount(e.target.value)}
                                            placeholder="Ex: 100000"
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Échelonnement</label>
                                        <select
                                            value={advanceRepayment}
                                            onChange={e => setAdvanceRepayment(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl h-12 px-3 text-sm outline-none"
                                        >
                                            <option value="1">1 mois (Paie suivante)</option>
                                            <option value="2">2 mois</option>
                                            <option value="3">3 mois</option>
                                            <option value="4">4 mois</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Motif de la demande</label>
                                    <textarea
                                        value={advanceReason}
                                        onChange={e => setAdvanceReason(e.target.value)}
                                        placeholder="Urgence familiale, scolarité, santé..."
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm h-24 outline-none focus:border-purple-500"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-600/20"
                                >
                                    {loading ? "Transmission..." : "Envoyer la Demande d'Avance"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* ======================================================== */}
                {/* 6. DEMANDE D'ABSENCE & CONGÉ                            */}
                {/* ======================================================== */}
                {activeTab === 'absence' && (
                    <Card className="bg-slate-900/90 border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-cyan-900/40 via-slate-900 to-slate-900 border-b border-slate-800 p-6 sm:p-8">
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3 font-['Outfit']">
                                <Calendar className="text-cyan-400" size={28} />
                                Déclaration d'Absence ou Congé
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Posez vos congés payés ou signalez une absence autorisée.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <form onSubmit={handleSubmitClassic} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Votre Nom & Prénom *</label>
                                        <Input
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Ex: Sarah Touré"
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Votre Email Pro *</label>
                                        <Input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="sarah.toure@sii-ci.com"
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Type de congé</label>
                                        <select
                                            value={absenceType}
                                            onChange={e => setAbsenceType(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl h-12 px-3 text-sm outline-none"
                                        >
                                            <option value="Congé annuel">Congé annuel payé</option>
                                            <option value="Maladie">Congé maladie (avec certif.)</option>
                                            <option value="Maternité / Paternité">Maternité / Paternité</option>
                                            <option value="Événement familial">Événement familial (Mariage, Décès)</option>
                                            <option value="Sans solde">Congé sans solde</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Date de début *</label>
                                        <Input
                                            required
                                            type="date"
                                            value={absenceDateStart}
                                            onChange={e => setAbsenceDateStart(e.target.value)}
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Date de reprise *</label>
                                        <Input
                                            required
                                            type="date"
                                            value={absenceDateEnd}
                                            onChange={e => setAbsenceDateEnd(e.target.value)}
                                            className="bg-slate-800 border-slate-700 text-white rounded-xl h-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Commentaire / Justification</label>
                                    <textarea
                                        value={absenceReason}
                                        onChange={e => setAbsenceReason(e.target.value)}
                                        placeholder="Informations utiles pour votre manager et le département RH..."
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm h-24 outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-600/20"
                                >
                                    {loading ? "Envoi..." : "Transmettre ma Demande d'Absence"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* ======================================================== */}
                {/* 7. BOÎTE À IDÉES & CLIMAT SOCIAL                         */}
                {/* ======================================================== */}
                {activeTab === 'ideas' && (
                    <Card className="bg-slate-900/90 border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-pink-900/40 via-slate-900 to-slate-900 border-b border-slate-800 p-6 sm:p-8">
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3 font-['Outfit']">
                                <Sparkles className="text-pink-400" size={28} />
                                Boîte à Idées & Baromètre Climat
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Partagez anonymement vos suggestions pour améliorer le bien-être et les processus chez SII.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {ideaSuccess ? (
                                <div className="bg-pink-950/40 border border-pink-500/30 p-8 rounded-2xl text-center space-y-4">
                                    <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full mx-auto flex items-center justify-center">
                                        <Heart size={36} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Merci pour votre contribution !</h3>
                                    <p className="text-slate-300 text-sm max-w-md mx-auto">
                                        Votre suggestion a été enregistrée de façon anonyme et sera étudiée lors de la prochaine réunion RH.
                                    </p>
                                    <Button 
                                        onClick={() => { setIdeaSuccess(false); setIdeaFeedback(''); }}
                                        className="bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-semibold"
                                    >
                                        Soumettre une autre idée
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-slate-300">
                                            Recommanderiez-vous SII comme entreprise où il fait bon travailler ? (Score eNPS de 0 à 10)
                                        </label>
                                        <div className="flex gap-1.5 sm:gap-2 justify-between">
                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setIdeaScore(s)}
                                                    className={cn(
                                                        "w-8 h-10 sm:w-10 sm:h-12 rounded-xl font-bold text-xs sm:text-sm transition-all",
                                                        ideaScore === s 
                                                            ? "bg-pink-600 text-white scale-110 shadow-lg shadow-pink-600/30" 
                                                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Votre Département / Équipe</label>
                                        <select
                                            value={ideaDepartment}
                                            onChange={e => setIdeaDepartment(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl h-12 px-3 text-sm outline-none"
                                        >
                                            <option value="Opérations">Opérations & Projets</option>
                                            <option value="Tech / IT">Tech / Développement / Cloud</option>
                                            <option value="Commercial">Commercial & Avant-Vente</option>
                                            <option value="Support">Finance, RH & Support</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Votre Idée ou Suggestion d'amélioration *</label>
                                        <textarea
                                            required
                                            value={ideaFeedback}
                                            onChange={e => setIdeaFeedback(e.target.value)}
                                            placeholder="Ex: Proposer des fruits bio le matin, organiser un tournoi de foot corporatif, assouplir les jours de télétravail..."
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-4 text-sm h-32 outline-none focus:border-pink-500"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl shadow-xl shadow-pink-600/20"
                                    >
                                        {loading ? "Envoi anonyme..." : "Transmettre mon Idée aux RH"}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ======================================================== */}
                {/* 8. ASSISTANT VIRTUEL RH (FAQ CHATBOT)                    */}
                {/* ======================================================== */}
                {activeTab === 'chat' && (
                    <Card className="bg-slate-900/90 border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-teal-900/40 via-slate-900 to-slate-900 border-b border-slate-800 p-6 sm:p-8">
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3 font-['Outfit']">
                                <MessageCircle className="text-teal-400" size={28} />
                                Assistant Virtuel RH & FAQ
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Obtenez des réponses immédiates sur la convention collective, les congés, la paie et la mutuelle.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-4">
                            {/* Fenêtre de discussion */}
                            <div className="h-80 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col">
                                {chatMessages.map((m, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed",
                                            m.sender === 'user' 
                                                ? "bg-blue-600 text-white self-end ml-auto rounded-tr-sm" 
                                                : "bg-slate-800 text-slate-200 self-start mr-auto rounded-tl-sm border border-slate-700"
                                        )}
                                    >
                                        {m.text}
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="bg-slate-800 text-slate-400 self-start rounded-2xl p-3 text-xs italic flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                                        L'assistant réfléchit...
                                    </div>
                                )}
                            </div>

                            {/* Suggestions rapides */}
                            <div className="flex flex-wrap gap-2 text-xs">
                                {[
                                    "Comment sont calculés mes congés ?",
                                    "Quand tombe le virement de paie ?",
                                    "Comment déclarer un retard ?",
                                    "Quelle est la couverture mutuelle ?"
                                ].map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setChatInput(q)}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>

                            {/* Formulaire de saisie */}
                            <form onSubmit={handleSendChatMessage} className="flex gap-2">
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Posez votre question RH..."
                                    className="bg-slate-800 border-slate-700 text-white rounded-xl h-12 px-4 focus:border-teal-500"
                                />
                                <Button
                                    type="submit"
                                    disabled={chatLoading || !chatInput.trim()}
                                    className="bg-teal-600 hover:bg-teal-500 text-white px-6 h-12 rounded-xl font-bold"
                                >
                                    <Send size={18} />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </motion.div>

            {/* Footer de confidentialité et sécurité */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-10 flex items-center gap-2 text-slate-500 text-xs text-center"
            >
                <Shield size={14} />
                <p>SIRH Enterprise · Guichet Libre-Service Sécurisé · SII Côte d'Ivoire</p>
            </motion.div>
        </div>
    );
}
