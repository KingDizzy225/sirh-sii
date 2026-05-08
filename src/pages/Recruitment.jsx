import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Clock, Plus, UserPlus, CheckCircle2, X, ArrowRight, Star, ThumbsUp, ThumbsDown, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
    { id: 'SCREENING', label: 'Sélection', color: 'text-slate-500', bg: 'bg-slate-100' },
    { id: 'INTERVIEW', label: 'Entretien', color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'OFFER', label: 'Offre Émise', color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 'HIRED', label: 'Embauché', color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 'REJECTED', label: 'Rejeté', color: 'text-rose-500', bg: 'bg-rose-100' }
];

export function Recruitment() {
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [notification, setNotification] = useState(null);
    const [activeJobId, setActiveJobId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const authConfig = { headers: { 'Authorization': `Bearer ${token}` } };

            const [jobsRes, candsRes] = await Promise.all([
                fetch(`${API_URL}/api/recruitment/jobs`, authConfig),
                fetch(`${API_URL}/api/recruitment/applicants`, authConfig)
            ]);
            const jobsData = await jobsRes.json();
            const candsData = await candsRes.json();

            if (Array.isArray(jobsData)) setJobs(jobsData);
            if (Array.isArray(candsData)) setCandidates(candsData);
        } catch (e) {
            console.error("API Recruitment non joignable");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Modal states
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
    const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    // Form states
    const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', status: 'Actif', contractType: 'CDI', experienceLevel: 'Intermédiaire', description: '', requirements: '' });
    const [candidateForm, setCandidateForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [scoreForm, setScoreForm] = useState({ tech: 0, culture: 0, communication: 0, recommendation: null, notes: '' });

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        if (!jobForm.title || !jobForm.department) {
            showNotification('Le titre et le département sont obligatoires.');
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/recruitment/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: jobForm.title,
                    department: jobForm.department,
                    location: jobForm.location || 'À distance',
                    type: jobForm.contractType,
                    experience: jobForm.experienceLevel,
                    description: jobForm.description,
                    requirements: jobForm.requirements
                })
            });

            if (res.ok) {
                await fetchData();
                setIsJobModalOpen(false);
                setJobForm({ title: '', department: '', location: '', status: 'Actif', contractType: 'CDI', experienceLevel: 'Intermédiaire', description: '', requirements: '' });
                showNotification(`Offre d'emploi publiée avec succès.`);
            }
        } catch (e) { console.error(e); }
    };

    const handleCandidateSubmit = async (e) => {
        e.preventDefault();
        if (!candidateForm.firstName || !candidateForm.lastName || !candidateForm.email) {
            showNotification('Le nom, prénom et email sont obligatoires.');
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/recruitment/applicants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    jobOfferId: activeJobId,
                    firstName: candidateForm.firstName,
                    lastName: candidateForm.lastName,
                    email: candidateForm.email,
                    phone: candidateForm.phone || ''
                })
            });

            if (res.ok) {
                await fetchData();
                setIsCandidateModalOpen(false);
                setCandidateForm({ firstName: '', lastName: '', email: '', phone: '' });
                showNotification(`${candidateForm.firstName} a été ajouté au pipeline.`);
            }
        } catch (e) { console.error(e); }
    };

    const moveCandidate = async (candidateId, newStage) => {
        const candidate = candidates.find(c => c.id === candidateId);
        // Mise à jour optimiste
        setCandidates(candidates.map(c => c.id === candidateId ? { ...c, stage: newStage, status: newStage } : c));

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            await fetch(`${API_URL}/api/recruitment/applicants/${candidateId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStage })
            });

            if (newStage === 'HIRED' && candidate.status !== 'HIRED' && candidate.stage !== 'HIRED') {
                setTimeout(() => {
                    showNotification(`Webhook Déclenché : Notification envoyée sur Slack #annonces-rh pour ${candidate.firstName} ${candidate.lastName} !`);
                }, 500);
            }
        } catch (e) {
            console.error(e);
            await fetchData(); // Rollback in case of error
        }
    };

    const openScorecard = (candidate) => {
        setSelectedCandidate(candidate);
        setScoreForm({ tech: 0, culture: 0, communication: 0, recommendation: null, notes: '' });
        setIsScorecardModalOpen(true);
    };

    const handleScoreSubmit = (e) => {
        e.preventDefault();
        if (!scoreForm.recommendation) {
            showNotification('Veuillez fournir une recommandation globale.');
            return;
        }

        const averageScore = ((scoreForm.tech + scoreForm.culture + scoreForm.communication) / 3).toFixed(1);

        setCandidates(candidates.map(c =>
            c.id === selectedCandidate.id ? { ...c, score: parseFloat(averageScore) } : c
        ));

        setIsScorecardModalOpen(false);
        showNotification(`Grille d'évaluation soumise pour ${selectedCandidate.firstName}. Note Moyenne: ${averageScore}/5`);
    };

    const handleAIMatch = async (candidateId) => {
        try {
            setNotification('Analyse IA en cours...');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/recruitment/applicants/${candidateId}/ai-match`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCandidates(candidates.map(c => 
                    c.id === candidateId ? { ...c, aiScore: data.score, aiSummary: data.summary } : c
                ));
                showNotification(`Analyse terminée ! Score IA: ${data.score}%`);
            } else {
                showNotification(`Erreur lors de l'analyse IA.`);
            }
        } catch (e) {
            console.error(e);
            showNotification(`Erreur de connexion à l'IA.`);
        }
    };

    const renderScoreStars = (field, value) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setScoreForm({ ...scoreForm, [field]: star })}
                        className={`transition-colors ${star <= value ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                    >
                        <Star className="w-8 h-8 fill-current" />
                    </button>
                ))}
            </div>
        )
    };

    const getJobApplicantsCount = (jobId) => candidates.filter(c => c.jobId === jobId).length;
    const activeJob = jobs.find(j => j.id === activeJobId);

    const { user } = useAuth();
    const isHR = user.role === 'HR' || user.role === 'ADMIN' || user.role === 'Administrator';

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">
            {/* ... (keep modals) */}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        {isHR ? <Target className="text-indigo-600" /> : <Building className="text-indigo-600" />}
                        {isHR ? "Gestion du Recrutement" : "Bourse à l'Emploi Interne"}
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {isHR ? "Gérez les postes ouverts et suivez le pipeline." : "Découvrez les opportunités de carrière au sein de SIRH-SII."}
                    </p>
                </div>
                {isHR && (
                    <div className="flex items-center space-x-2">
                        {activeJobId ? (
                            <Button onClick={() => setIsCandidateModalOpen(true)} className="gap-2 bg-blue-600 text-white">
                                <UserPlus size={16} /> Ajouter Candidat
                            </Button>
                        ) : (
                            <Button onClick={() => setIsJobModalOpen(true)} className="gap-2 bg-blue-600 text-white">
                                <Plus size={16} /> Publier une Offre
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {isHR ? (
                /* EXISTING HR VIEW */
                !activeJobId ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map(job => (
                            <Card key={job.id} onClick={() => setActiveJobId(job.id)} className="cursor-pointer hover:shadow-md transition-all group">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-bold text-slate-900">{job.title}</h4>
                                        <Badge>{job.status}</Badge>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-4">
                                        <span>{job.department}</span>
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="text-xs font-bold text-indigo-600">
                                        {getJobApplicantsCount(job.id)} Candidats dans le pipeline
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    /* KANBAN VIEW (already in the file, keeping logic) */
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {STAGES.map(stage => (
                            <div key={stage.id} className="min-w-[300px] bg-slate-100/50 p-3 rounded-xl">
                                <h3 className="text-xs font-black uppercase mb-4">{stage.label}</h3>
                                {candidates.filter(c => c.jobOfferId === activeJobId && (c.stage === stage.id || c.status === stage.id)).map(c => (
                                    <Card key={c.id} className="mb-2 p-4">
                                        <p className="font-bold">{c.firstName} {c.lastName}</p>
                                        <p className="text-xs text-slate-500">{c.email}</p>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>
                )
            ) : (
                /* EMPLOYEE VIEW (Internal Job Board) */
                <div className="grid gap-6 md:grid-cols-2">
                    {jobs.map(job => (
                        <Card key={job.id} className="border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                            <div className="h-2 bg-indigo-500" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                                        <p className="text-sm font-bold text-indigo-500 mt-1">{job.department} • {job.location}</p>
                                    </div>
                                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{job.type}</Badge>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                                    {job.description || "Aucune description détaillée fournie pour ce poste."}
                                </p>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Expérience</p>
                                            <p className="text-xs font-bold text-slate-700">{job.experience}</p>
                                        </div>
                                    </div>
                                    <Button className="bg-slate-900 hover:bg-black text-white font-black rounded-xl gap-2 shadow-lg">
                                        Postuler en Interne <ArrowRight size={16} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {jobs.length === 0 && (
                        <div className="col-span-2 text-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">Aucune opportunité interne disponible pour le moment.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
