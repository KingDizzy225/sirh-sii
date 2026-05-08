import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
    Search, 
    Sparkles, 
    Users, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    ArrowRight,
    BrainCircuit,
    Plus,
    Trash2,
    BarChart3,
    Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AiSourcing() {
    const [jobDescription, setJobDescription] = useState('');
    const [candidates, setCandidates] = useState([{ name: '', resumeText: '' }]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    const addCandidate = () => {
        setCandidates([...candidates, { name: '', resumeText: '' }]);
    };

    const removeCandidate = (index) => {
        setCandidates(candidates.filter((_, i) => i !== index));
    };

    const updateCandidate = (index, field, value) => {
        const newCandidates = [...candidates];
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    const handleAnalyze = async () => {
        if (!jobDescription || candidates.some(c => !c.name || !c.resumeText)) {
            alert("Veuillez remplir la description et tous les candidats.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/recruitment/ai-source`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jobDescription, candidates })
            });

            if (res.ok) {
                const data = await res.json();
                setResults(data.sort((a, b) => b.score - a.score));
            } else {
                alert("Erreur lors de l'analyse IA.");
            }
        } catch (error) {
            console.error("AI Sourcing Error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <BrainCircuit className="text-indigo-600" size={32} />
                        Sourcing Intelligent IA
                    </h2>
                    <p className="text-slate-500 font-medium">Analysez et scorez vos candidats instantanément grâce à l'IA générative.</p>
                </div>
                {results && (
                    <Button onClick={() => setResults(null)} variant="outline" className="border-slate-200">
                        Nouvelle analyse
                    </Button>
                )}
            </div>

            {!results ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Job Description */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm h-full">
                            <CardHeader>
                                <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-800">
                                    <FileText size={18} className="text-indigo-600" />
                                    Poste à pourvoir
                                </CardTitle>
                                <CardDescription>Copiez-collez la description du poste ou les critères clés.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <textarea 
                                    className="w-full h-[500px] bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                                    placeholder="Ex: Nous recherchons un développeur Fullstack avec 5 ans d'expérience en React et Node.js. Compétences requises: AWS, Docker, Typescript..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Candidates List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <Users size={20} className="text-indigo-600" />
                                Candidats à évaluer ({candidates.length})
                            </h3>
                            <Button onClick={addCandidate} variant="outline" size="sm" className="bg-white gap-2">
                                <Plus size={16} /> Ajouter un candidat
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {candidates.map((candidate, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Card className="border-none shadow-sm relative group">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Input 
                                                        placeholder="Nom du candidat" 
                                                        className="border-none bg-slate-50 font-bold text-slate-900 w-1/2"
                                                        value={candidate.name}
                                                        onChange={(e) => updateCandidate(idx, 'name', e.target.value)}
                                                    />
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-slate-300 hover:text-rose-500 rounded-full h-8 w-8"
                                                        onClick={() => removeCandidate(idx)}
                                                        disabled={candidates.length === 1}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                                <textarea 
                                                    className="w-full h-32 bg-slate-50 border-none rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                                    placeholder="Collez ici le contenu du CV (texte brut)..."
                                                    value={candidate.resumeText}
                                                    onChange={(e) => updateCandidate(idx, 'resumeText', e.target.value)}
                                                />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <Button 
                                onClick={handleAnalyze} 
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black h-14 rounded-2xl gap-3 shadow-xl"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Analyse par l'IA en cours...
                                    </div>
                                ) : (
                                    <>
                                        <Sparkles className="text-indigo-400" size={20} />
                                        Lancer l'Analyse Comparative
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Results Display */
                <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {results.map((res, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className={`border-none shadow-xl overflow-hidden relative h-full flex flex-col ${idx === 0 ? 'ring-4 ring-emerald-500/20' : ''}`}>
                                    {idx === 0 && (
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest z-10 flex items-center gap-1">
                                            <Trophy size={10} /> Best Match
                                        </div>
                                    )}
                                    <CardHeader className={`${idx === 0 ? 'bg-emerald-50' : 'bg-slate-50'} border-b border-white/50`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="text-xl font-black text-slate-900">{res.name}</CardTitle>
                                                <CardDescription className="font-bold text-slate-500">Score de matching</CardDescription>
                                            </div>
                                            <div className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center font-black ${res.score >= 80 ? 'bg-emerald-500 text-white' : res.score >= 50 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-200'}`}>
                                                <span className="text-2xl leading-none">{res.score}</span>
                                                <span className="text-[10px]">%</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles size={12} className="text-indigo-500" /> Résumé IA
                                            </p>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                                "{res.summary}"
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                    <CheckCircle2 size={12} /> Points Forts
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {res.strengths.map((s, i) => (
                                                        <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-100">{s}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                                    <XCircle size={12} /> Écarts / Faiblesses
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {res.weaknesses.map((w, i) => (
                                                        <span key={i} className="px-2 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-100">{w}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-auto border-t border-slate-100 flex gap-2">
                                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs h-10">
                                                Voir Profil
                                            </Button>
                                            <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 font-bold rounded-xl text-xs h-10">
                                                Contacter
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <Card className="border-none shadow-sm bg-indigo-50">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-indigo-900">Analyse de Gaps Global</h4>
                                <p className="text-sm text-indigo-700 font-medium">L'IA suggère que pour ce poste, la compétence "Architecture Cloud" est la plus rare parmi vos candidats.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
