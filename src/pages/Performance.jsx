import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Target, Star, MessageSquare, Plus, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const initialGoals = [
    { id: 1, title: 'Lancer la campagne marketing T3', category: 'Objectif Commercial', progress: 75, status: 'En bonne voie', due: '30 Sep 2026' },
    { id: 2, title: 'Obtenir la certification AWS', category: 'Dév. Professionnel', progress: 30, status: 'À risque', due: '15 Nov 2026' },
    { id: 3, title: 'Recruter 3 Ingénieurs Seniors', category: 'Objectif Commercial', progress: 100, status: 'Terminé', due: '01 Août 2026' }
];

const initialReviews = [
    { id: 1, cycle: 'Mi-année 2026', reviewer: 'Sarah Jenkins', rating: 'Dépasse les attentes', status: 'Finalisé', date: '15 Juil 2026' },
    { id: 2, cycle: 'Annuel 2025', reviewer: 'Sarah Jenkins', rating: 'Répond aux attentes', status: 'Finalisé', date: '10 Jan 2026' }
];

const initialFeedbacks = [
    { id: 1, provider: 'Michael Dam', relationship: 'Collègue', strengths: 'Excellent collaborateur, très bonne qualité de code.', areas: 'Pourrait communiquer les blocages plus tôt.', date: 'Il y a 1 semaine' },
    { id: 2, provider: 'Anonyme', relationship: 'Subordonné direct', strengths: 'Manager d\'un grand soutien, libère la voie pour l\'équipe.', areas: 'Rien de spécifique.', date: 'Il y a 3 semaines' }
];

export function Performance() {
    const [activeTab, setActiveTab] = useState('goals');

    const [goals, setGoals] = useState(initialGoals);
    const [reviews, setReviews] = useState(initialReviews);
    const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
    const [notification, setNotification] = useState(null);

    // Modal States
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

    // Form States
    const [goalForm, setGoalForm] = useState({ title: '', category: 'Personal Development', due: '' });
    const [feedbackForm, setFeedbackForm] = useState({ peerName: '', context: '' });
    const [evalForm, setEvalForm] = useState({ reflection: '', achievements: '' });

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleNewGoalSubmit = (e) => {
        e.preventDefault();
        if (!goalForm.title || !goalForm.due) {
            showNotification('Veuillez remplir les champs obligatoires.');
            return;
        }

        const shortMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const d = new Date(goalForm.due);
        const dueStr = `${String(d.getDate()).padStart(2, '0')} ${shortMonths[d.getMonth()]} ${d.getFullYear()}`;

        const newGoal = {
            id: Date.now(),
            title: goalForm.title,
            category: goalForm.category,
            progress: 0,
            status: 'En bonne voie',
            due: dueStr
        };
        setGoals([newGoal, ...goals]);
        setIsGoalModalOpen(false);
        setGoalForm({ title: '', category: 'Dév. Professionnel', due: '' });
        showNotification('Nouvel objectif créé avec succès');
    };

    const handleUpdateGoal = (id) => {
        setGoals(prev => prev.map(goal => {
            if (goal.id === id) {
                const newProgress = Math.min(goal.progress + 25, 100);
                const newStatus = newProgress === 100 ? 'Terminé' : goal.status;
                return { ...goal, progress: newProgress, status: newStatus };
            }
            return goal;
        }));
        showNotification('Progression de l\'objectif mise à jour');
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        if (!feedbackForm.peerName) {
            showNotification('Veuillez indiquer le nom d\'un collègue.');
            return;
        }
        setIsFeedbackModalOpen(false);
        setFeedbackForm({ peerName: '', context: '' });
        showNotification(`Demande de feedback envoyée à ${feedbackForm.peerName}`);
    };

    const handleEvaluationSubmit = (e) => {
        e.preventDefault();
        if (!evalForm.reflection) {
            showNotification('Veuillez fournir votre auto-évaluation.');
            return;
        }

        const shortMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')} ${shortMonths[today.getMonth()]} ${today.getFullYear()}`;

        const newReview = {
            id: Date.now(),
            cycle: 'Annuel 2026',
            reviewer: 'En attente de revue',
            rating: 'En attente du Manager',
            status: 'Brouillon Soumis',
            date: dateStr
        };

        setReviews([newReview, ...reviews]);
        setIsEvalModalOpen(false);
        setEvalForm({ reflection: '', achievements: '' });
        showNotification('Brouillon de l\'auto-évaluation annuelle 2026 soumis avec succès');
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <CheckCircle2 size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Overlays */}

            {/* 1. New Goal Modal */}
            <AnimatePresence>
                {isGoalModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Créer un Nouvel Objectif</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsGoalModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="add-goal-form" onSubmit={handleNewGoalSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Titre de l'Objectif</label>
                                        <Input
                                            value={goalForm.title}
                                            onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                                            placeholder="ex. Maîtriser les patterns avancés React"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Catégorie</label>
                                            <select
                                                value={goalForm.category}
                                                onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="Dév. Professionnel">Dév. Professionnel</option>
                                                <option value="Objectif Commercial">Objectif Commercial</option>
                                                <option value="Leadership">Leadership</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Date Cible</label>
                                            <Input
                                                type="date"
                                                value={goalForm.due}
                                                onChange={(e) => setGoalForm({ ...goalForm, due: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsGoalModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="add-goal-form" className="bg-blue-600 hover:bg-blue-700 text-white">Créer l'Objectif</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 2. Request Feedback Modal */}
            <AnimatePresence>
                {isFeedbackModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Demander un Feedback (360)</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsFeedbackModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="request-feedback-form" onSubmit={handleFeedbackSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Sélectionner un Collègue</label>
                                        <Input
                                            value={feedbackForm.peerName}
                                            onChange={(e) => setFeedbackForm({ ...feedbackForm, peerName: e.target.value })}
                                            placeholder="ex. Jean Dupont"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Contexte (Optionnel)</label>
                                        <textarea
                                            value={feedbackForm.context}
                                            onChange={(e) => setFeedbackForm({ ...feedbackForm, context: e.target.value })}
                                            className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Sur quels points précis souhaitez-vous qu'ils se concentrent ?"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="request-feedback-form" className="bg-slate-900 hover:bg-slate-800 text-white">Envoyer la Demande</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 3. Start Evaluation Modal */}
            <AnimatePresence>
                {isEvalModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Formulaire d'Auto-évaluation</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsEvalModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="start-eval-form" onSubmit={handleEvaluationSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-2">
                                            <p className="text-sm text-amber-800 font-medium">Cycle Annuel 2026</p>
                                            <p className="text-xs text-amber-700/80 mt-1">Réfléchissez à vos réalisations et axes d'amélioration sur l'année écoulée.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Réalisations Clés</label>
                                        <textarea
                                            value={evalForm.achievements}
                                            onChange={(e) => setEvalForm({ ...evalForm, achievements: e.target.value })}
                                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Listez vos contributions les plus impactantes..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Bilan Global</label>
                                        <textarea
                                            value={evalForm.reflection}
                                            onChange={(e) => setEvalForm({ ...evalForm, reflection: e.target.value })}
                                            className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Fournissez un résumé complet de vos performances..."
                                            required
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsEvalModalOpen(false)}>Annuler le Brouillon</Button>
                                <Button type="submit" form="start-eval-form" className="bg-amber-600 hover:bg-amber-700 text-white">Soumettre le Brouillon</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Performances & Objectifs</h2>
                    <p className="text-slate-500 mt-1">Suivez les objectifs, passez en revue les retours et gérez votre évolution.</p>
                </div>
                <div className="flex items-center space-x-2">
                    {activeTab === 'goals' && (
                        <Button onClick={() => setIsGoalModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <Plus size={18} /> Nouvel Objectif
                        </Button>
                    )}
                    {activeTab === 'feedback' && (
                        <Button onClick={() => setIsFeedbackModalOpen(true)} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                            <MessageSquare size={18} /> Demander un Feedback
                        </Button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max mb-6">
                <button
                    onClick={() => setActiveTab('goals')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'goals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                >
                    <Target size={16} /> Objectifs & OKRs
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'reviews' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                >
                    <Star size={16} /> Évaluations Formelles
                </button>
                <button
                    onClick={() => setActiveTab('feedback')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'feedback' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                >
                    <MessageSquare size={16} /> Feedbacks 360
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">

                {/* GOALS TAB */}
                {activeTab === 'goals' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* Summary Metrics */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border-slate-200">
                                <CardHeader className="pb-2">
                                    <CardDescription className="font-medium text-slate-500">Progression Globale</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-slate-900">68%</div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '68%' }}></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200">
                                <CardHeader className="pb-2">
                                    <CardDescription className="font-medium text-slate-500">Objectifs Actifs</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-slate-900">{goals.filter(g => g.status !== 'Terminé').length}</div>
                                    <p className="text-xs text-slate-500 mt-1">+1 ajouté ce trimestre</p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200 bg-emerald-50/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="font-medium text-emerald-800">Terminés (Année)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-emerald-600">{goals.filter(g => g.status === 'Terminé').length}</div>
                                    <p className="text-xs text-emerald-600/70 mt-1">Dépasse les attentes</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Goals List */}
                        <div className="grid gap-4">
                            {goals.map(goal => (
                                <Card key={goal.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">{goal.title}</h4>
                                                <p className="text-sm text-slate-500 mt-1">{goal.category} • Échéance : {goal.due}</p>
                                            </div>
                                            <Badge variant={
                                                goal.status === 'Terminé' ? 'success' :
                                                    goal.status === 'À risque' ? 'destructive' :
                                                        goal.status === 'En bonne voie' ? 'blue' : 'secondary'
                                            }>
                                                {goal.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-1.5">
                                                    <span className="font-medium text-slate-700">Progression</span>
                                                    <span className="text-slate-500 font-medium">{goal.progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${goal.status === 'Terminé' ? 'bg-emerald-500' : goal.status === 'À risque' ? 'bg-rose-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${goal.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpdateGoal(goal.id)}
                                                disabled={goal.status === 'Terminé'}
                                                className="mt-5 shrink-0"
                                            >
                                                Mettre à jour
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card className="bg-amber-50 border-amber-200 shadow-none">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="text-amber-900 font-bold mb-1">L'auto-évaluation annuelle 2026 est attendue</h4>
                                    <p className="text-amber-800/80 text-sm">Veuillez soumettre votre auto-évaluation avant le 30 Nov pour lancer le cycle d'évaluation.</p>
                                </div>
                                <Button onClick={() => setIsEvalModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">Démarrer l'Évaluation</Button>
                            </CardContent>
                        </Card>

                        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Historique des Évaluations</h3>
                        <div className="grid gap-4">
                            {reviews.map(review => (
                                <Card key={review.id} className="hover:border-slate-300 transition-colors cursor-pointer group">
                                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{review.cycle}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-medium text-slate-700">Manager : {review.reviewer}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-sm text-slate-500">{review.date}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-sm text-slate-500 mb-0.5">Note Finale</div>
                                                <Badge variant={review.rating.includes('Dépasse') ? 'success' : 'blue'}>{review.rating}</Badge>
                                            </div>
                                            <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all rounded-full" onClick={() => showNotification(`Ouverture de la revue : ${review.cycle}`)}>
                                                <ArrowRight size={20} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* FEEDBACK TAB */}
                {activeTab === 'feedback' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">Feedbacks Reçus</h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {feedbacks.map(feedback => (
                                <Card key={feedback.id} className="border-slate-200">
                                    <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                                        <div>
                                            <CardTitle className="text-base text-slate-900">Feedback de {feedback.relationship}</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">{feedback.date}</CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="font-normal text-xs">{feedback.provider}</Badge>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <div>
                                            <h5 className="text-sm font-bold text-slate-700 mb-1">Points Forts</h5>
                                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">{feedback.strengths}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-slate-700 mb-1">Axes d'Amélioration</h5>
                                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">{feedback.areas}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}
