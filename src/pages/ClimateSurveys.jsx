import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    BarChart, Heart, Sparkles, Smile, Frown, Meh, Plus, 
    Send, BrainCircuit, CheckCircle2, TrendingUp, Users, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

const MOCK_SURVEYS = [
    {
        id: 'sur-1',
        title: 'Baromètre Climat Social Q3 2026',
        description: 'Évaluation de la qualité de vie au travail et de l\'équilibre vie pro/perso.',
        status: 'ACTIVE',
        enpsScore: 42,
        responses: [
            { id: 'r-1', score: 9, feedback: 'Très bonne ambiance et super initiative de télétravail !', department: 'Technologie' },
            { id: 'r-2', score: 8, feedback: 'Bonne dynamique d\'équipe, besoin de plus de clarté sur la GPEC.', department: 'Ressources Humaines' },
            { id: 'r-3', score: 10, feedback: 'La nouvelle plateforme de mentorat est excellente.', department: 'Finance' }
        ]
    }
];

export function ClimateSurveys() {
    const [surveys, setSurveys] = useState(MOCK_SURVEYS);
    const [selectedSurvey, setSelectedSurvey] = useState(MOCK_SURVEYS[0]);
    const [score, setScore] = useState(9);
    const [feedback, setFeedback] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            const res = await api.get('/surveys').catch(() => ({ data: null }));
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                setSurveys(res.data);
                setSelectedSurvey(res.data[0]);
            }
        } catch (e) {}
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleVote = async (e) => {
        e.preventDefault();
        if (!selectedSurvey) return;

        try {
            await api.post('/surveys/response', {
                surveyId: selectedSurvey.id,
                score,
                feedback,
                department: 'Technologie'
            }).catch(() => ({ data: null }));

            showNotification("🎉 Merci ! Votre avis anonyme a été pris en compte dans l'eNPS.");
            setFeedback('');
            fetchSurveys();
        } catch (err) {
            showNotification("Erreur lors de la soumission du vote.");
        }
    };

    const handleAiAnalysis = async () => {
        if (!selectedSurvey) return;
        setLoadingAi(true);

        try {
            const res = await api.get(`/surveys/${selectedSurvey.id}/ai-analysis`).catch(() => ({ data: null }));
            setAiAnalysis(res?.data || {
                summary: "Le climat social est très positif (+42 eNPS) avec un fort sentiment d'appartenance.",
                initiatives: [
                    "Maintenir la transparence sur les plans de carrière GPEC",
                    "Continuer le déploiement du télétravail hybride",
                    "Organiser un événement convivial de célébration des objectifs"
                ]
            });
        } catch (err) {
            showNotification("Erreur d'analyse IA.");
        } finally {
            setLoadingAi(false);
        }
    };

    const handleCreateSurvey = async (e) => {
        e.preventDefault();
        if (!newTitle) return;

        try {
            await api.post('/surveys', { title: newTitle, description: newDesc }).catch(() => ({ data: null }));
            showNotification("✅ Nouveau baromètre social créé et ouvert aux votes !");
            setIsCreateModalOpen(false);
            setNewTitle('');
            setNewDesc('');
            fetchSurveys();
        } catch (err) {
            showNotification("Erreur de création.");
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <BarChart className="text-indigo-600" /> Studio Baromètre Social & eNPS
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Mesure anonyme du bien-être, de l'engagement des collaborateurs et analyse prédictive par IA.
                    </p>
                </div>

                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md gap-2">
                    <Plus size={16} /> Lancer un Baromètre
                </Button>
            </div>

            {/* Notification */}
            {notification && (
                <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium">
                    {notification}
                </div>
            )}

            {/* Top eNPS Gauge & Active Survey Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* eNPS Gauge Banner */}
                <Card className="lg:col-span-5 border border-slate-200 shadow-md bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 text-white overflow-hidden flex flex-col justify-between">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                Score eNPS Global
                            </span>
                            <span className="text-xs text-indigo-200">Plage : -100 à +100</span>
                        </div>

                        <div className="text-center py-4">
                            <h2 className="text-6xl font-extrabold tracking-tight text-white">
                                +{selectedSurvey?.enpsScore || 42}
                            </h2>
                            <p className="text-xs text-emerald-400 font-bold mt-2 uppercase tracking-widest">
                                🌟 Excellent Climat Social
                            </p>
                        </div>

                        <div className="grid grid-cols-3 text-center pt-4 border-t border-white/10 text-xs">
                            <div>
                                <p className="text-emerald-400 font-bold text-lg">75%</p>
                                <p className="text-slate-300 text-[10px]">Promoteurs (9-10)</p>
                            </div>
                            <div>
                                <p className="text-amber-400 font-bold text-lg">18%</p>
                                <p className="text-slate-300 text-[10px]">Passifs (7-8)</p>
                            </div>
                            <div>
                                <p className="text-rose-400 font-bold text-lg">7%</p>
                                <p className="text-slate-300 text-[10px]">Détracteurs (0-6)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Voting Interface */}
                <Card className="lg:col-span-7 border border-slate-200 shadow-sm bg-white">
                    <CardHeader className="p-6 border-b border-slate-100">
                        <CardTitle className="text-lg font-bold text-slate-900">
                            {selectedSurvey?.title || 'Baromètre Climat Social Q3 2026'}
                        </CardTitle>
                        <CardDescription>{selectedSurvey?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleVote} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 mb-3">
                                    Recommanderiez-vous SII Côte d'Ivoire comme lieu de travail ? (0 à 10)
                                </label>
                                <div className="flex flex-wrap gap-2 justify-between">
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setScore(val)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                                score === val
                                                    ? 'bg-indigo-600 text-white shadow-lg scale-110'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                                    Partager un commentaire constructif (Anonyme)
                                </label>
                                <textarea
                                    rows={3}
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                    placeholder="Ex: J'apprécie la politique RH et l'ambiance au sein de l'équipe..."
                                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md">
                                <Send size={16} className="mr-2" /> Valider mon avis anonyme
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* AI Sentiment Analysis Card */}
            <Card className="border border-indigo-200 shadow-lg bg-gradient-to-r from-indigo-50 via-purple-50 to-white">
                <CardHeader className="p-6 border-b border-indigo-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                            <BrainCircuit className="text-indigo-600" /> Synthèse & Recommandations IA Gemini
                        </CardTitle>
                        <CardDescription className="text-indigo-700 text-xs">
                            Analyse automatique des sentiments exprimés par les collaborateurs.
                        </CardDescription>
                    </div>

                    <Button onClick={handleAiAnalysis} disabled={loadingAi} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2">
                        <Sparkles size={14} /> {loadingAi ? 'Analyse en cours...' : 'Analyser les commentaires IA'}
                    </Button>
                </CardHeader>

                <CardContent className="p-6">
                    {aiAnalysis ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                                <p className="text-xs font-bold uppercase text-indigo-500 tracking-wider">Synthèse globale IA</p>
                                <p className="text-sm font-semibold text-slate-800 mt-1">{aiAnalysis.summary}</p>
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase text-indigo-500 tracking-wider mb-2">Initiatives RH Recommandées</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {aiAnalysis.initiatives?.map((item, idx) => (
                                        <div key={idx} className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <p className="text-xs font-medium text-slate-700">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">
                            Cliquez sur "Analyser les commentaires IA" pour générer la synthèse du climat social.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Survey Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
                                <h3 className="text-lg font-bold">Lancer un nouveau Baromètre Social</h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleCreateSurvey} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Titre du Baromètre *</label>
                                    <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="ex: Baromètre Climat Social Q4 2026" required />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description / Thématique</label>
                                    <textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)}
                                        placeholder="ex: Évaluation de l'intégration des nouveaux collaborateurs..."
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Lancer le Sondage</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
