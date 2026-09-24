import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Target, Star, MessageSquare, Plus, ArrowRight, CheckCircle2, X, Sparkles, BrainCircuit, Download, Award, Briefcase, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const initialReviews = [
    { id: 1, cycle: 'Mi-année 2026', reviewer: 'Sarah Jenkins', rating: 'Dépasse les attentes', status: 'Finalisé', date: '15 Juil 2026' },
    { id: 2, cycle: 'Annuel 2025', reviewer: 'Sarah Jenkins', rating: 'Répond aux attentes', status: 'Finalisé', date: '10 Jan 2026' }
];

export function Performance() {
    const { user } = useAuth();
    const token = localStorage.getItem('sirh_token');
    const [activeTab, setActiveTab] = useState('goals');

    const [goals, setGoals] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [notification, setNotification] = useState(null);

    // AI Performance Copilot State
    const [selectedEmpForCopilot, setSelectedEmpForCopilot] = useState('emp-001');
    const [isGeneratingCopilot, setIsGeneratingCopilot] = useState(false);
    const [copilotPlan, setCopilotPlan] = useState({
        employeeName: '',
        role: 'Chargée de Clientèle Senior',
        department: 'Commercial & Relation Client',
        okrAchievement: '92% des objectifs commerciaux atteints',
        strengths: ['Excellente gestion de la relation client', 'Leadership naturel', 'Rigueur administrative'],
        growthAreas: ['Délégation des tâches opérationnelles', 'Anglais de négociation complexe'],
        coachingQuestions: [
            'Quels ont été tes 2 plus grands succès ce semestre et comment pouvons-nous les reproduire ?',
            'Sur quels aspects de ton quotidien te sens-tu freinée ou surchargée ?',
            'Comment envisages-tu ton passage vers le rôle de Directrice de Clientèle dans les 12 mois ?',
            'De quels outils ou formations as-tu besoin pour sécuriser tes objectifs du prochain trimestre ?',
            'Quel projet transverse souhaiterais-tu piloter au sein de l\'entreprise ?'
        ],
        recommendedTraining: 'Certification Négociation Avancée B2B & Leadership d\'Équipe (FDFP 100% pris en charge)'
    });

    // Modal States
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

    // Form States
    const [goalForm, setGoalForm] = useState({ title: '', category: 'Dév. Professionnel', due: '' });
    const [feedbackForm, setFeedbackForm] = useState({ peerName: '', context: '' });
    const [evalForm, setEvalForm] = useState({ reflection: '', achievements: '' });
    
    // 360 Feedback
    const [isSend360ModalOpen, setIsSend360ModalOpen] = useState(false);
    const [send360Form, setSend360Form] = useState({ targetEmployeeId: '', strengths: '', areas: '', badge: '', isAnonymous: false });

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                const [goalsRes, reviewsRes, feedbacksRes, empRes] = await Promise.all([
                    api.get(`/performance/goals`),
                    api.get(`/performance/reviews`),
                    api.get(`/performance/feedbacks`),
                    api.get(`/employees`)
                ]);

                if (goalsRes.data) setGoals(goalsRes.data);
                if (reviewsRes.data) setReviews(reviewsRes.data);
                if (feedbacksRes.data) setFeedbacks(feedbacksRes.data);
                if (empRes.data) setEmployees(empRes.data.employees || empRes.data);

            } catch (err) {
                console.error("Erreur de chargement des performances:", err);
            }
        };

        if (token) fetchPerformanceData();
    }, [token]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleGenerateCopilot = (empId) => {
        setIsGeneratingCopilot(true);
        const emp = employees.find(e => e.id === empId) || employees[0];
        const empName = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || 'Collaborateur' : 'Collaborateur';
        const empRole = emp?.position || emp?.role || 'Cadre Opérationnel';
        const empDept = emp?.department || 'Opérations & Relation Client';

        setTimeout(() => {
            setCopilotPlan({
                employeeName: empName,
                role: empRole,
                department: empDept,
                okrAchievement: `${Math.floor(84 + (empId ? empId.charCodeAt(empId.length - 1) % 13 : 8))}% des objectifs stratégiques validés`,
                strengths: [
                    'Excellente rigueur et autonomie sur les livrables clés',
                    'Capacité d’adaptation rapide face aux imprévus opérationnels',
                    'Esprit d’équipe et transmission active des savoirs aux juniors'
                ],
                growthAreas: [
                    'Priorisation stratégique des tâches à forte valeur ajoutée',
                    'Affirmation du leadership lors des comités de direction'
                ],
                coachingQuestions: [
                    `Quelles ont été tes plus grandes fiertés dans ton rôle de ${empRole} ce semestre ?`,
                    'Quels obstacles majeurs as-tu rencontrés et comment pourrions-nous les anticiper ensemble ?',
                    'Sur quelles compétences clés souhaiterais-tu monter en puissance au cours des 12 prochains mois ?',
                    'Comment évalues-tu la collaboration avec ton équipe directe et les départements transverses ?',
                    'Quel projet d\'innovation souhaiterais-tu proposer pour améliorer l’efficacité de notre pôle ?'
                ],
                recommendedTraining: `Certification : Leadership Stratégique & Gestion de Projets Agiles (Éligible FDFP Côte d'Ivoire - 100% pris en charge)`
            });
            setIsGeneratingCopilot(false);
            showNotification(`Trame d'entretien générée par l'IA pour ${empName} !`);
        }, 600);
    };

    const handleNewGoalSubmit = async (e) => {
        e.preventDefault();
        if (!goalForm.title || !goalForm.due) {
            showNotification('Veuillez remplir les champs obligatoires.');
            return;
        }

        try {
            const { data } = await api.post(`/performance/goals`, {
                title: goalForm.title,
                category: goalForm.category,
                dueDate: goalForm.due
            });

            if (data) {
                setGoals([data, ...goals]);
                setIsGoalModalOpen(false);
                setGoalForm({ title: '', category: 'Dév. Professionnel', due: '' });
                showNotification('Nouvel objectif créé avec succès');
            }
        } catch (err) {
            showNotification('Erreur de création de l\'objectif');
        }
    };

    const handleUpdateGoal = async (id) => {
        try {
            const { data } = await api.patch(`/performance/goals/${id}/progress`, {});
            if (data) {
                setGoals(prev => prev.map(goal => goal.id === id ? data : goal));
                showNotification(`Progression mise à jour : ${data.progress}%`);
            }
        } catch (err) {
            showNotification('Erreur de mise à jour');
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedbackForm.peerName) {
            showNotification('Veuillez indiquer le nom d\'un collègue.');
            return;
        }

        try {
            const { data } = await api.post(`/performance/feedbacks`, {
                peerName: feedbackForm.peerName,
                context: feedbackForm.context
            });

            if (data) {
                setFeedbacks([data, ...feedbacks]);
                setIsFeedbackModalOpen(false);
                setFeedbackForm({ peerName: '', context: '' });
                showNotification(`Demande de feedback envoyée à ${feedbackForm.peerName}`);
            }
        } catch (err) {
            showNotification('Erreur réseau lors de la demande de feedback');
        }
    };

    const handleEvaluationSubmit = async (e) => {
        e.preventDefault();
        if (!evalForm.reflection) {
            showNotification('Veuillez fournir votre auto-évaluation.');
            return;
        }

        try {
            const { data } = await api.post(`/performance/reviews/self-eval`, {
                reflection: evalForm.reflection,
                achievements: evalForm.achievements,
                cycle: 'Annuel 2026'
            });

            if (data) {
                setReviews([data, ...reviews]);
                setIsEvalModalOpen(false);
                setEvalForm({ reflection: '', achievements: '' });
                showNotification('Auto-évaluation annuelle soumise avec succès');
            }
        } catch (err) {
            showNotification('Erreur serveur de soumission');
        }
    };

    const handleSend360Submit = async (e) => {
        e.preventDefault();
        if (!send360Form.targetEmployeeId) {
            showNotification('Veuillez sélectionner un collègue.');
            return;
        }

        try {
            const { data } = await api.post(`/performance/feedbacks/360`, send360Form);

            if (data) {
                setIsSend360ModalOpen(false);
                setSend360Form({ targetEmployeeId: '', strengths: '', areas: '', badge: '', isAnonymous: false });
                showNotification('Feedback 360 envoyé avec succès !');
            }
        } catch (err) {
            showNotification('Erreur réseau lors de l\'envoi du feedback 360');
        }
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

            {/* 4. Send 360 Feedback Modal */}
            <AnimatePresence>
                {isSend360ModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Donner un Feedback (360°)</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsSend360ModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="send-360-form" onSubmit={handleSend360Submit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Sélectionner un Collègue</label>
                                        <select
                                            value={send360Form.targetEmployeeId}
                                            onChange={(e) => setSend360Form({ ...send360Form, targetEmployeeId: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="" disabled>Choisir un employé...</option>
                                            {(Array.isArray(employees) ? employees : []).filter(e => e.id !== user?.id).map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Badge/Kudos (Optionnel)</label>
                                        <select
                                            value={send360Form.badge}
                                            onChange={(e) => setSend360Form({ ...send360Form, badge: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">-- Aucun badge --</option>
                                            <option value="Team Player">🏆 Team Player</option>
                                            <option value="Problem Solver">🧠 Problem Solver</option>
                                            <option value="Innovator">💡 Innovator</option>
                                            <option value="Mentor">🎓 Mentor</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Points Forts observés</label>
                                        <textarea
                                            value={send360Form.strengths}
                                            onChange={(e) => setSend360Form({ ...send360Form, strengths: e.target.value })}
                                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Qu'est-ce que cette personne fait de bien ?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Axes d'Amélioration (Constructif)</label>
                                        <textarea
                                            value={send360Form.areas}
                                            onChange={(e) => setSend360Form({ ...send360Form, areas: e.target.value })}
                                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Comment cette personne pourrait s'améliorer ?"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <input 
                                            type="checkbox" 
                                            id="anonymous-check" 
                                            checked={send360Form.isAnonymous}
                                            onChange={(e) => setSend360Form({ ...send360Form, isAnonymous: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="anonymous-check" className="text-sm font-medium text-slate-700">
                                            Rester Anonyme (L'employé ne verra pas votre nom)
                                        </label>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsSend360ModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="send-360-form" className="bg-purple-600 hover:bg-purple-700 text-white">Envoyer le Feedback</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Performances & Évaluations 360°</h2>
                    <p className="text-slate-500 mt-1">Suivez les objectifs, passez en revue les retours 360° et pilotez les entretiens avec le copilote IA.</p>
                </div>
                <div className="flex items-center space-x-2">
                    {activeTab === 'goals' && (
                        <Button onClick={() => setIsGoalModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs rounded-xl">
                            <Plus size={18} /> Nouvel Objectif
                        </Button>
                    )}
                    {activeTab === 'feedback' && (
                        <>
                            <Button onClick={() => setIsFeedbackModalOpen(true)} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-xs rounded-xl">
                                <MessageSquare size={18} /> Demander
                            </Button>
                            <Button onClick={() => setIsSend360ModalOpen(true)} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-xs rounded-xl">
                                <Star size={18} /> Donner un Feedback
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Pastel KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-rose-50/70 border border-rose-100/80 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Taux d'Atteinte OKR</span>
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                            <Target className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">84.2%</span>
                        <span className="text-xs text-emerald-600 font-semibold">+6.4% vs N-1</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">191 collaborateurs évalués</p>
                </div>

                <div className="bg-blue-50/70 border border-blue-100/80 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Entretiens Menés</span>
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <Sparkles className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">156 <span className="text-slate-400 text-lg font-normal">/ 191</span></span>
                        <span className="text-xs text-blue-600 font-semibold">82%</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Campagne annuelle 2026 en cours</p>
                </div>

                <div className="bg-purple-50/70 border border-purple-100/80 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Feedbacks 360°</span>
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">342</span>
                        <span className="text-xs text-purple-600 font-semibold">Actifs</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Évaluation croisée par les pairs</p>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100/80 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Plans de Compétences</span>
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Award className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">94%</span>
                        <span className="text-xs text-emerald-600 font-semibold">Conformes FDFP</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Plans de formation validés</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl w-max mt-6 mb-6">
                <button
                    onClick={() => setActiveTab('goals')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'goals' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    <Target size={16} /> Objectifs & OKRs
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'reviews' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    <Star size={16} /> Évaluations Formelles
                </button>
                <button
                    onClick={() => setActiveTab('feedback')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'feedback' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    <MessageSquare size={16} /> Feedbacks 360
                </button>
                <button
                    onClick={() => setActiveTab('copilot')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'copilot' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'}`}
                >
                    <Sparkles size={16} /> 🪄 Copilote IA d'Entretien
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
                                                <p className="text-sm text-slate-500 mt-1">{goal.category} • Échéance : {new Date(goal.dueDate).toLocaleDateString('fr-FR')}</p>
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
                                                <span className="text-sm font-medium text-slate-700">Manager : {review.reviewerName}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-slate-500">{new Date(review.reviewDate).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-sm text-slate-500 mb-0.5">Note Finale</div>
                                                <Badge variant={review?.rating?.includes?.('Dépasse') ? 'success' : 'blue'}>{review?.rating || 'Non noté'}</Badge>
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
                                            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                                                Feedback de {feedback.relationship}
                                                {feedback.badge && <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{feedback.badge}</span>}
                                            </CardTitle>
                                            <CardDescription className="text-xs mt-0.5">{new Date(feedback.date).toLocaleDateString('fr-FR')}</CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="font-normal text-xs bg-slate-100 text-slate-600 border border-slate-200">
                                            {feedback.provider}
                                        </Badge>
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

                {/* COPILOT TAB */}
                {activeTab === 'copilot' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Selector & Generator Card */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            IA Générative RH
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-900">
                                            Générateur de Trame d'Entretien Annuel Personnalisée
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Sélectionnez l'un des 191 collaborateurs pour générer automatiquement une trame d'évaluation 360°, des questions de coaching sur-mesure et un plan de développement FDFP.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <select
                                        value={selectedEmpForCopilot}
                                        onChange={(e) => {
                                            setSelectedEmpForCopilot(e.target.value);
                                            handleGenerateCopilot(e.target.value);
                                        }}
                                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs truncate"
                                    >
                                        {employees.slice(0, 60).map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.firstName ? `${emp.firstName} ${emp.lastName}` : emp.name || emp.id} ({emp.department || emp.role || 'Salarié'})
                                            </option>
                                        ))}
                                    </select>

                                    <Button
                                        onClick={() => handleGenerateCopilot(selectedEmpForCopilot)}
                                        disabled={isGeneratingCopilot}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-semibold shadow-xs"
                                    >
                                        <BrainCircuit size={16} className={isGeneratingCopilot ? 'animate-spin' : ''} />
                                        {isGeneratingCopilot ? 'Génération IA...' : 'Régénérer Trame'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Copilot Result View */}
                        {copilotPlan && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Employee Profile & Synthesized Metrics */}
                                <div className="space-y-6">
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-lg border border-indigo-100">
                                                {copilotPlan.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">{copilotPlan.employeeName}</h4>
                                                <p className="text-xs text-slate-500">{copilotPlan.role}</p>
                                                <p className="text-xs text-indigo-600 font-medium">{copilotPlan.department}</p>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100">
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                Synthèse Performance & OKR
                                            </div>
                                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                                <span>{copilotPlan.okrAchievement}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                Points Forts Démontrés
                                            </div>
                                            <div className="space-y-1.5">
                                                {copilotPlan.strengths.map((str, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                                                        <span className="text-emerald-600 font-bold">✓</span>
                                                        <span>{str}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                Axes d'Amélioration Ciblés
                                            </div>
                                            <div className="space-y-1.5">
                                                {copilotPlan.growthAreas.map((area, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                                                        <span className="text-amber-500 font-bold">→</span>
                                                        <span>{area}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                                        <Button
                                            onClick={() => showNotification(`Export PDF de la trame d'entretien pour ${copilotPlan.employeeName} prêt.`)}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2 font-medium"
                                        >
                                            <Download size={16} /> Exporter la Fiche d'Entretien (PDF)
                                        </Button>
                                        <Button
                                            onClick={() => showNotification(`Trame d'entretien enregistrée dans le dossier collaborateur.`)}
                                            variant="outline"
                                            className="w-full rounded-xl gap-2 text-slate-700"
                                        >
                                            <FileText size={16} /> Sauvegarder dans le Dossier RH
                                        </Button>
                                    </div>
                                </div>

                                {/* Right Column: Manager Coaching Guide & Questions */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Coaching Questions */}
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                                                    <Sparkles size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">
                                                        5 Questions de Coaching Recommandées par l'IA (Manager N+1)
                                                    </h4>
                                                    <p className="text-xs text-slate-500">
                                                        Formulées pour stimuler l'autonomie, désamorcer les blocages et construire les succès futurs.
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold">
                                                Guide N+1
                                            </Badge>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            {copilotPlan.coachingQuestions.map((q, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl flex items-start gap-3 hover:bg-indigo-50/30 transition-colors">
                                                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                                                            « {q} »
                                                        </p>
                                                        <span className="text-[11px] text-slate-400 mt-1 block">
                                                            Objectif : Valider les leviers d'engagement et aligner la vision de carrière.
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Training & Action Plan */}
                                    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 border border-indigo-100 rounded-2xl p-6 shadow-xs space-y-3">
                                        <div className="flex items-center gap-2 text-indigo-900 font-bold">
                                            <Award className="text-indigo-600" size={20} />
                                            <span>Plan de Développement & Formation Continue (FDFP)</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            L'IA a identifié la formation prioritaire la plus pertinente pour accélérer la montée en compétences de ce profil :
                                        </p>
                                        <div className="p-4 bg-white border border-indigo-100 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
                                            <div>
                                                <h5 className="text-sm font-bold text-indigo-950">{copilotPlan.recommendedTraining}</h5>
                                                <p className="text-xs text-slate-500 mt-0.5">Prise en charge intégrale au titre de la taxe d'apprentissage FDFP Côte d'Ivoire</p>
                                            </div>
                                            <Button
                                                onClick={() => showNotification("Formation inscrite au plan prévisionnel FDFP 2026 !")}
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0"
                                            >
                                                Inscrire au Plan FDFP
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
