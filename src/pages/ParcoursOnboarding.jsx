import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
    GraduationCap, CheckCircle2, Clock, Sparkles, Trophy, Award, 
    Send, MessageSquare, Heart, Shield, Laptop, BookOpen, Coffee, 
    FileText, UserCheck, Star, ArrowRight, X, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROGRAMME_30_JOURS = [
    {
        weekNumber: 1,
        title: 'Semaine 1 : Bienvenue & Prise de Repères',
        subtitle: 'Découverte de l\'environnement de travail, des collègues et remise du matériel',
        status: 'COMPLETED',
        tasks: [
            { id: 'w1-1', title: 'Accueil par la RH et petit-déjeuner d\'intégration', completed: true },
            { id: 'w1-2', title: 'Remise du badge d\'accès et du matériel informatique (MacBook, Casque)', completed: true },
            { id: 'w1-3', title: 'Rencontre et premier déjeuner avec son Parrain (Buddy)', completed: true },
            { id: 'w1-4', title: 'Configuration des accès emails, SIRH et outils métier', completed: true }
        ]
    },
    {
        weekNumber: 2,
        title: 'Semaine 2 : Outils Internes & Découverte Métier',
        subtitle: 'Immersion dans les processus SII et formation aux méthodologies',
        status: 'COMPLETED',
        tasks: [
            { id: 'w2-1', title: 'Session de formation aux processus et politiques internes', completed: true },
            { id: 'w2-2', title: 'Tour des départements et présentation aux directeurs de pôles', completed: true },
            { id: 'w2-3', title: 'Point d\'étape informel de 15 minutes avec la RH', completed: true },
            { id: 'w2-4', title: 'Création de la fiche de compétences initiale dans le SIRH', completed: true }
        ]
    },
    {
        weekNumber: 3,
        title: 'Semaine 3 : Première Mission en Binôme',
        subtitle: 'Mise en situation concrète avec accompagnement bienveillant',
        status: 'IN_PROGRESS',
        tasks: [
            { id: 'w3-1', title: 'Prise en main du premier dossier client / projet en binôme', completed: true },
            { id: 'w3-2', title: 'Participation active à la réunion hebdomadaire d\'équipe', completed: true },
            { id: 'w3-3', title: 'Première soutenance ou livrable validé par le tuteur', completed: false },
            { id: 'w3-4', title: 'Session de questions / réponses avec le Buddy', completed: false }
        ]
    },
    {
        weekNumber: 4,
        title: 'Semaine 4 : Bilan du 1er Mois & Rapport d\'Étonnement',
        subtitle: 'Restitution des observations et consolidation de la période d\'essai',
        status: 'PENDING',
        tasks: [
            { id: 'w4-1', title: 'Rédaction et remise du Rapport d\'Étonnement à la RH', completed: false },
            { id: 'w4-2', title: 'Entretien de bilan du premier mois avec le Manager (N+1)', completed: false },
            { id: 'w4-3', title: 'Fixation des objectifs pour la fin de la période d\'essai', completed: false },
            { id: 'w4-4', title: 'Célébration du 30ème jour au sein de l\'équipe', completed: false }
        ]
    }
];

export function ParcoursOnboarding() {
    const [weeks, setWeeks] = useState(PROGRAMME_30_JOURS);
    const [notification, setNotification] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Formulaire Rapport d'Étonnement
    const [positiveNotes, setPositiveNotes] = useState('');
    const [frictionNotes, setFrictionNotes] = useState('');
    const [ideasNotes, setIdeasNotes] = useState('');
    const [reportSubmitted, setReportSubmitted] = useState(false);

    const showNotice = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3500);
    };

    const toggleTask = (weekIndex, taskId) => {
        setWeeks(prev => prev.map((w, idx) => {
            if (idx === weekIndex) {
                const updatedTasks = w.tasks.map(t => 
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                );
                const allCompleted = updatedTasks.every(t => t.completed);
                return {
                    ...w,
                    tasks: updatedTasks,
                    status: allCompleted ? 'COMPLETED' : 'IN_PROGRESS'
                };
            }
            return w;
        }));
        showNotice("Progression de l'onboarding mise à jour !");
    };

    const handleSubmitReport = (e) => {
        e.preventDefault();
        setReportSubmitted(true);
        setIsReportModalOpen(false);
        showNotice("🎉 Rapport d'étonnement transmis à la Direction des Ressources Humaines !");
    };

    const totalTasks = weeks.reduce((acc, w) => acc + w.tasks.length, 0);
    const completedTasks = weeks.reduce((acc, w) => acc + w.tasks.filter(t => t.completed).length, 0);
    const progressPercent = Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2"
                    >
                        <Sparkles size={18} className="text-indigo-400" />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Trophy className="text-indigo-600 h-8 w-8" />
                        Parcours d'Onboarding Gamifié « 30 Jours d'Intégration »
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Programme d'accueil étape par étape pour guider et fidéliser chaque nouveau collaborateur.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setIsReportModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-md shadow-indigo-100"
                    >
                        <FileText size={16} /> Rédiger le Rapport d'Étonnement
                    </Button>
                </div>
            </div>

            {/* Barre de Progression Gamifiée */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
                            Passeport d'Intégration • Semaine 3 en cours
                        </span>
                        <h3 className="text-lg font-black text-slate-900 mt-0.5">
                            Collaborateur accompagné
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-indigo-600">{progressPercent}%</span>
                        <span className="text-xs text-slate-400 font-bold">({completedTasks}/{totalTasks} missions)</span>
                    </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Badges de déblocage */}
                <div className="flex flex-wrap gap-3 pt-2">
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                        <Award size={16} className="text-emerald-600" /> Badge Semaine 1 : Bienvenue
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                        <Laptop size={16} className="text-emerald-600" /> Badge Semaine 2 : Outils Maîtrisés
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700">
                        <Trophy size={16} className="text-indigo-600" /> En cours : Premier Succès Binôme
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-400">
                        <CheckCircle2 size={16} /> Badge Final : Période d'Essai Consolidée
                    </div>
                </div>
            </div>

            {/* Layout 2 colonnes : Timeline des 4 Semaines & Parrain (Buddy) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Colonne Gauche : Timeline des 4 Semaines */}
                <div className="lg:col-span-8 space-y-4">
                    {weeks.map((week, wIdx) => (
                        <Card key={wIdx} className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50/50 p-4 border-b flex flex-row items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={`text-[10px] font-black uppercase ${
                                            week.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                            week.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                            'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {week.status === 'COMPLETED' ? '✔ Validée' :
                                             week.status === 'IN_PROGRESS' ? '⚡ En cours' : 'À venir'}
                                        </Badge>
                                        <CardTitle className="text-sm font-black text-slate-800">{week.title}</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs mt-1 text-slate-500 font-medium">
                                        {week.subtitle}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 space-y-2.5">
                                {week.tasks.map((task) => (
                                    <div 
                                        key={task.id}
                                        onClick={() => toggleTask(wIdx, task.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                            task.completed 
                                                ? 'bg-emerald-50/30 border-emerald-200 text-slate-700' 
                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                                task.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                                            }`}>
                                                {task.completed && <CheckCircle2 size={14} />}
                                            </div>
                                            <span className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-400' : ''}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Colonne Droite : Carte Parrain (Buddy) & Conseils */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Carte Parrain / Buddy */}
                    <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                                Mon Parrain Référent (Buddy)
                            </span>
                            <div className="flex items-center gap-3 mt-3">
                                <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center font-black text-lg text-white">
                                    AK
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-white text-base">Armand Kouassi</h4>
                                    <p className="text-[11px] text-indigo-200">Directeur Commercial • 6 ans chez SII</p>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-4 space-y-3 text-xs">
                            <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-indigo-900 italic font-medium leading-relaxed">
                                "Je suis ton point de contact informel pour toute question pratique, culture d'entreprise ou simple café ! N'hésite jamais à me solliciter."
                            </div>
                            <div className="space-y-1.5 text-slate-600">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-400">Bureau :</span>
                                    <span className="font-semibold text-slate-800">Étage 2, Aile Ouest</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-400">Disponibilité :</span>
                                    <span className="font-semibold text-emerald-600">Pause déjeuner &amp; Vendredi</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* État du Rapport d'Étonnement */}
                    <Card className="border-slate-200/80 shadow-sm bg-white p-5 space-y-3">
                        <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider">
                            <FileText size={16} /> Rapport d'Étonnement (J+30)
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            À la fin du 1er mois, chaque collaborateur partage son regard neuf pour améliorer les pratiques de l'entreprise.
                        </p>
                        {reportSubmitted ? (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                Rapport soumis et transmis à la RH !
                            </div>
                        ) : (
                            <Button 
                                onClick={() => setIsReportModalOpen(true)}
                                variant="outline" 
                                className="w-full text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
                            >
                                Compléter mon Rapport d'Étonnement
                            </Button>
                        )}
                    </Card>
                </div>
            </div>

            {/* Modal Rapport d'Étonnement */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                <FileText size={18} className="text-indigo-600" /> Rapport d'Étonnement des 30 Jours
                            </h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">
                                    1. Ce qui m'a agréablement surpris(e) à mon arrivée :
                                </label>
                                <textarea
                                    value={positiveNotes}
                                    onChange={e => setPositiveNotes(e.target.value)}
                                    rows={2}
                                    required
                                    placeholder="L'ambiance d'équipe, la clarté des outils, la disponibilité du parrain..."
                                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">
                                    2. Ce qui m'a ralenti(e) ou freiné(e) durant les 30 premiers jours :
                                </label>
                                <textarea
                                    value={frictionNotes}
                                    onChange={e => setFrictionNotes(e.target.value)}
                                    rows={2}
                                    required
                                    placeholder="Accès informatiques tardifs, documentation manquante..."
                                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">
                                    3. Mes suggestions ou idées d'amélioration pour l'entreprise :
                                </label>
                                <textarea
                                    value={ideasNotes}
                                    onChange={e => setIdeasNotes(e.target.value)}
                                    rows={2}
                                    required
                                    placeholder="Une idée de nouveau process, de projet transverse..."
                                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 text-white font-bold">Transmettre à la Direction RH</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
