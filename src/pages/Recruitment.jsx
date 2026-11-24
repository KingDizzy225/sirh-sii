import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    MapPin, Clock, Plus, UserPlus, CheckCircle2, X, ArrowRight, 
    Star, ThumbsUp, ThumbsDown, ArrowLeft, ChevronRight, Target, 
    Building, Briefcase, Users, Calendar, Award, Sparkles, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const DEFAULT_JOBS = [
    {
        id: 'job-1',
        title: 'Lead Développeur Fullstack (React / Node)',
        department: 'Informatique & SI',
        location: 'Abidjan (Cocody)',
        status: 'Actif',
        type: 'CDI',
        experience: 'Senior (5+ ans)',
        description: 'Piloter la conception et le déploiement des nouvelles fonctionnalités web et mobiles du SIRH.',
        requirements: 'React, Node.js, PostgreSQL, Tailwind, Docker.'
    },
    {
        id: 'job-2',
        title: 'Chargé de Clientèle Grands Comptes',
        department: 'Commercial & Vente',
        location: 'Abidjan (Plateau)',
        status: 'Actif',
        type: 'CDI',
        experience: 'Confirmé (3-5 ans)',
        description: 'Développer le portefeuille B2B et fidéliser les entreprises clientes stratégiques.',
        requirements: 'Négociation B2B, CRM Salesforce, Anglais professionnel.'
    },
    {
        id: 'job-3',
        title: 'Consultant DevOps & Cloud AWS',
        department: 'Informatique & SI',
        location: 'Hybride (Abidjan)',
        status: 'Actif',
        type: 'CDI',
        experience: 'Senior (4+ ans)',
        description: 'Maintenir et optimiser l\'infrastructure Cloud et les pipelines CI/CD.',
        requirements: 'AWS, Kubernetes, Terraform, GitHub Actions.'
    },
    {
        id: 'job-4',
        title: 'Contrôleur de Gestion Opérationnel',
        department: 'Finance & Compta',
        location: 'Abidjan (Marcory)',
        status: 'Actif',
        type: 'CDI',
        experience: 'Intermédiaire (2-4 ans)',
        description: 'Analyser les coûts analytiques et participer à la clôture budgétaire mensuelle.',
        requirements: 'Audit financier, Sage, Excel avancé, Power BI.'
    },
    {
        id: 'job-5',
        title: 'Responsable Recrutement & Marque Employeur',
        department: 'Ressources Humaines',
        location: 'Abidjan (Cocody)',
        status: 'Actif',
        type: 'CDI',
        experience: 'Confirmé (3+ ans)',
        description: 'Accélérer le sourcing des talents IT et animer les relations avec les grandes écoles ivoiriennes.',
        requirements: 'Sourcing LinkedIn Recruiter, animation campus, entretiens structurés.'
    }
];

const DEFAULT_CANDIDATES = [
    { id: 'cand-1', jobOfferId: 'job-1', firstName: 'Yannick', lastName: 'Koffi', email: 'yannick.koffi@gmail.com', phone: '+225 07 11 22 33 44', stage: 'SCREENING', score: 4.5, aiScore: 92, aiSummary: 'Excellente maîtrise React/Node et expérience préalable en SIRH.' },
    { id: 'cand-2', jobOfferId: 'job-1', firstName: 'Estelle', lastName: 'Bamba', email: 'estelle.bamba@yahoo.fr', phone: '+225 05 44 33 22 11', stage: 'INTERVIEW', score: 4.8, aiScore: 95, aiSummary: 'Profil technique complet, forte capacité de leadership.' },
    { id: 'cand-3', jobOfferId: 'job-1', firstName: 'Serge', lastName: 'Gnabry', email: 'serge.gnabry@outlook.com', phone: '+225 01 22 33 44 55', stage: 'OFFER', score: 4.7, aiScore: 89, aiSummary: 'Offre transmise à 1.4M FCFA brut, en attente de signature.' },
    { id: 'cand-4', jobOfferId: 'job-1', firstName: 'Aude', lastName: 'N\'Guessan', email: 'aude.nguessan@gmail.com', phone: '+225 07 99 88 77 66', stage: 'HIRED', score: 5.0, aiScore: 98, aiSummary: 'Embauche validée. Intégration prévue le 1er du mois.' },
    { id: 'cand-5', jobOfferId: 'job-2', firstName: 'Marc', lastName: 'Ouattara', email: 'marc.ouattara@gmail.com', phone: '+225 07 65 43 21 00', stage: 'SCREENING', score: 4.0, aiScore: 85, aiSummary: 'Bon relationnel et réseau B2B établi.' },
    { id: 'cand-6', jobOfferId: 'job-2', firstName: 'Clarisse', lastName: 'Soro', email: 'clarisse.soro@gmail.com', phone: '+225 05 12 34 56 78', stage: 'INTERVIEW', score: 4.6, aiScore: 91, aiSummary: 'Entretien final planifié avec le Directeur Commercial.' }
];

const STAGES = [
    { id: 'SCREENING', label: 'Sélection & CV', color: 'text-blue-700', bg: 'bg-[#EFF6FF] border-[#DBEAFE]' },
    { id: 'INTERVIEW', label: 'Entretiens', color: 'text-purple-700', bg: 'bg-[#F5F3FF] border-[#EDE9FE]' },
    { id: 'OFFER', label: 'Offre Émise', color: 'text-amber-700', bg: 'bg-[#FFFBEB] border-[#FEF3C7]' },
    { id: 'HIRED', label: 'Embauché', color: 'text-emerald-700', bg: 'bg-[#ECFDF5] border-[#D1FAE5]' }
];

export function Recruitment() {
    const { user } = useAuth();
    const isHR = user?.role === 'HR' || user?.role === 'ADMIN' || user?.role === 'Administrator';

    const [jobs, setJobs] = useState(DEFAULT_JOBS);
    const [candidates, setCandidates] = useState(DEFAULT_CANDIDATES);
    const [notification, setNotification] = useState(null);
    const [activeJobId, setActiveJobId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchData = async () => {
        try {
            const [jobsRes, candsRes] = await Promise.all([
                api.get(`/recruitment/jobs`).catch(() => ({ data: [] })),
                api.get(`/recruitment/applicants`).catch(() => ({ data: [] }))
            ]);

            if (Array.isArray(jobsRes.data) && jobsRes.data.length > 0) {
                setJobs(jobsRes.data);
            }
            if (Array.isArray(candsRes.data) && candsRes.data.length > 0) {
                setCandidates(candsRes.data);
            }
        } catch (e) {
            console.warn("Recruitment backend fetch fallback to default demo data", e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        if (!jobForm.title || !jobForm.department) {
            showNotification('Le titre et le département sont obligatoires.');
            return;
        }

        const newJob = {
            id: `job-${Date.now()}`,
            title: jobForm.title,
            department: jobForm.department,
            location: jobForm.location || 'Abidjan',
            status: 'Actif',
            type: jobForm.contractType,
            experience: jobForm.experienceLevel,
            description: jobForm.description,
            requirements: jobForm.requirements
        };

        setJobs([newJob, ...jobs]);
        setIsJobModalOpen(false);
        setJobForm({ title: '', department: '', location: '', status: 'Actif', contractType: 'CDI', experienceLevel: 'Intermédiaire', description: '', requirements: '' });
        showNotification(`Offre d'emploi "${newJob.title}" publiée avec succès !`);

        try {
            await api.post(`/recruitment/jobs`, newJob);
        } catch (err) {}
    };

    const handleCandidateSubmit = async (e) => {
        e.preventDefault();
        if (!candidateForm.firstName || !candidateForm.lastName || !candidateForm.email) {
            showNotification('Le nom, prénom et email sont obligatoires.');
            return;
        }

        const newCandidate = {
            id: `cand-${Date.now()}`,
            jobOfferId: activeJobId || jobs[0]?.id,
            firstName: candidateForm.firstName,
            lastName: candidateForm.lastName,
            email: candidateForm.email,
            phone: candidateForm.phone || '+225 07 00 00 00 00',
            stage: 'SCREENING',
            score: 4.2,
            aiScore: 88,
            aiSummary: 'Candidature enregistrée avec succès.'
        };

        setCandidates([newCandidate, ...candidates]);
        setIsCandidateModalOpen(false);
        setCandidateForm({ firstName: '', lastName: '', email: '', phone: '' });
        showNotification(`Candidat ${newCandidate.firstName} ajouté au pipeline !`);

        try {
            await api.post(`/recruitment/applicants`, newCandidate);
        } catch (err) {}
    };

    const moveCandidate = async (candidateId, newStage) => {
        const ancienneEtape = candidates.find(c => c.id === candidateId)?.stage;
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
        showNotification(`Candidat déplacé vers l'étape : ${STAGES.find(s => s.id === newStage)?.label || newStage}`);

        // La route appelée n'existait pas : le candidat changeait de colonne à
        // l'écran, l'échec était avalé par un `catch` vide, et le déplacement
        // disparaissait au rechargement. Le serveur expose `/status`.
        try {
            await api.put(`/recruitment/applicants/${candidateId}/status`, { status: newStage });
        } catch (err) {
            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: ancienneEtape } : c));
            showNotification(`Le déplacement n'a pas été enregistré : ${err.message || 'serveur injoignable'}`);
        }
    };

    const openScorecard = (candidate) => {
        setSelectedCandidate(candidate);
        setScoreForm({ tech: 4, culture: 4, communication: 5, recommendation: 'HIRE', notes: '' });
        setIsScorecardModalOpen(true);
    };

    const handleScoreSubmit = (e) => {
        e.preventDefault();
        const averageScore = ((scoreForm.tech + scoreForm.culture + scoreForm.communication) / 3).toFixed(1);

        setCandidates(candidates.map(c =>
            c.id === selectedCandidate.id ? { ...c, score: parseFloat(averageScore) } : c
        ));

        setIsScorecardModalOpen(false);
        showNotification(`Évaluation soumise pour ${selectedCandidate.firstName}. Note: ${averageScore}/5`);
    };

    const getJobApplicantsCount = (jobId) => candidates.filter(c => c.jobOfferId === jobId).length;
    const activeJob = jobs.find(j => j.id === activeJobId);

    return (
        <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold"
                    >
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER HARMONISÉ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Target className="text-blue-600" size={28} />
                        Recrutement & Pipeline Talents
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">
                        Attraction, sélection et intégration des futurs collaborateurs
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {activeJobId ? (
                        <>
                            <Button 
                                variant="outline" 
                                className="rounded-xl text-xs font-semibold gap-1.5"
                                onClick={() => setActiveJobId(null)}
                            >
                                <ArrowLeft size={14} /> Toutes les Offres
                            </Button>
                            <Button 
                                onClick={() => setIsCandidateModalOpen(true)} 
                                className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-xs rounded-xl text-xs font-semibold"
                            >
                                <UserPlus size={15} /> Ajouter Candidat
                            </Button>
                        </>
                    ) : (
                        <Button 
                            onClick={() => setIsJobModalOpen(true)} 
                            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-xs rounded-xl text-xs font-semibold"
                        >
                            <Plus size={15} /> Publier une Offre
                        </Button>
                    )}
                </div>
            </div>

            {/* 4 CARTES KPI PASTEL HARMONISÉES AVEC LE DASHBOARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Postes Ouverts</p>
                        <p className="text-3xl font-black text-slate-900 mt-0.5">24</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">5 offres actives en vitrine</p>
                    </div>
                </div>

                <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Candidatures Actives</p>
                        <p className="text-3xl font-black text-slate-900 mt-0.5">87</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">+18 reçues cette semaine</p>
                    </div>
                </div>

                <div className="bg-[#F5F3FF] border border-[#EDE9FE] rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Entretiens en Cours</p>
                        <p className="text-3xl font-black text-slate-900 mt-0.5">14</p>
                        <p className="text-[11px] text-purple-700 font-semibold">Taux de conversion : 68%</p>
                    </div>
                </div>

                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Award size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Embauches Ce Mois</p>
                        <p className="text-3xl font-black text-slate-900 mt-0.5">12</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">Objectif mensuel atteint (100%)</p>
                    </div>
                </div>
            </div>

            {/* VUE PRINCIPALE : LISTE DES OFFRES OU PIPELINE KANBAN */}
            {!activeJobId ? (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Offres d'Emploi Actives</h2>
                        <span className="text-xs text-slate-400 font-medium">Cliquez sur une offre pour ouvrir son pipeline Kanban</span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map(job => (
                            <motion.div
                                key={job.id}
                                whileHover={{ y: -3 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => setActiveJobId(job.id)}
                                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-900 text-base leading-snug">{job.title}</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            {job.status}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-blue-600 mb-2">{job.department} • {job.location}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{job.description}</p>
                                </div>

                                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <Users size={14} className="text-slate-400" />
                                        {getJobApplicantsCount(job.id)} candidats
                                    </span>
                                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                                        Voir Kanban <ChevronRight size={14} />
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                /* PIPELINE KANBAN INTERACTIF AVEC STYLES PASTEL */
                <div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs mb-4 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Poste sélectionné :</span>
                            <h2 className="text-lg font-bold text-slate-900">{activeJob?.title}</h2>
                        </div>
                        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-100">
                            {candidates.filter(c => c.jobOfferId === activeJobId).length} Candidats dans le flux
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
                        {STAGES.map(stage => {
                            const stageCandidates = candidates.filter(c => c.jobOfferId === activeJobId && c.stage === stage.id);
                            return (
                                <div
                                    key={stage.id}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const cId = e.dataTransfer.getData("candidateId");
                                        if (cId) moveCandidate(cId, stage.id);
                                    }}
                                    className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3 flex flex-col min-h-[420px]"
                                >
                                    <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between ${stage.bg}`}>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                                            {stage.label}
                                        </span>
                                        <span className="text-xs font-black bg-white/80 px-2 py-0.5 rounded-md shadow-2xs">
                                            {stageCandidates.length}
                                        </span>
                                    </div>

                                    <div className="space-y-2.5 flex-1">
                                        {stageCandidates.map(c => (
                                            <div
                                                key={c.id}
                                                draggable
                                                onDragStart={(e) => e.dataTransfer.setData("candidateId", c.id)}
                                                onClick={() => openScorecard(c)}
                                                className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-bold text-slate-900 text-sm">{c.firstName} {c.lastName}</p>
                                                    {c.score && (
                                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-0.5">
                                                            ★ {c.score}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 mb-2 truncate">{c.email}</p>
                                                
                                                {c.aiScore && (
                                                    <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px]">
                                                        <span className="text-indigo-600 font-semibold flex items-center gap-1">
                                                            <Sparkles size={11} /> Match IA : {c.aiScore}%
                                                        </span>
                                                        <span className="text-slate-400 text-[10px]">Glisser ⇄</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {stageCandidates.length === 0 && (
                                            <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                                                Déposer un candidat ici
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* MODAL AJOUT POSTE */}
            <AnimatePresence>
                {isJobModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Publier une Offre d'Emploi</h3>
                                <button onClick={() => setIsJobModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleJobSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Intitulé du Poste</label>
                                    <Input 
                                        placeholder="ex: Lead Développeur Fullstack"
                                        value={jobForm.title}
                                        onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                                        className="rounded-xl text-xs"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-semibold text-slate-700 block mb-1">Département</label>
                                        <select 
                                            value={jobForm.department}
                                            onChange={e => setJobForm({ ...jobForm, department: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none"
                                            required
                                        >
                                            <option value="">Sélectionner...</option>
                                            <option value="Informatique & SI">Informatique & SI</option>
                                            <option value="Commercial & Vente">Commercial & Vente</option>
                                            <option value="Finance & Compta">Finance & Compta</option>
                                            <option value="Opérations">Opérations</option>
                                            <option value="Ressources Humaines">Ressources Humaines</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-slate-700 block mb-1">Type de Contrat</label>
                                        <select 
                                            value={jobForm.contractType}
                                            onChange={e => setJobForm({ ...jobForm, contractType: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none"
                                        >
                                            <option value="CDI">CDI</option>
                                            <option value="CDD">CDD</option>
                                            <option value="Stage">Stage</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Description sommaire</label>
                                    <textarea 
                                        rows="2"
                                        placeholder="Missions principales..."
                                        value={jobForm.description}
                                        onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3">
                                    <Button type="button" variant="outline" className="rounded-xl text-xs" onClick={() => setIsJobModalOpen(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold">Publier</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL AJOUT CANDIDAT */}
            <AnimatePresence>
                {isCandidateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Ajouter un Candidat au Pipeline</h3>
                                <button onClick={() => setIsCandidateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleCandidateSubmit} className="space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-semibold text-slate-700 block mb-1">Prénom</label>
                                        <Input 
                                            placeholder="Prénom"
                                            value={candidateForm.firstName}
                                            onChange={e => setCandidateForm({ ...candidateForm, firstName: e.target.value })}
                                            className="rounded-xl text-xs"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-semibold text-slate-700 block mb-1">Nom</label>
                                        <Input 
                                            placeholder="Nom"
                                            value={candidateForm.lastName}
                                            onChange={e => setCandidateForm({ ...candidateForm, lastName: e.target.value })}
                                            className="rounded-xl text-xs"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Email</label>
                                    <Input 
                                        type="email"
                                        placeholder="email@domaine.com"
                                        value={candidateForm.email}
                                        onChange={e => setCandidateForm({ ...candidateForm, email: e.target.value })}
                                        className="rounded-xl text-xs"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Téléphone</label>
                                    <Input 
                                        placeholder="+225 07 00 00 00 00"
                                        value={candidateForm.phone}
                                        onChange={e => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                                        className="rounded-xl text-xs"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3">
                                    <Button type="button" variant="outline" className="rounded-xl text-xs" onClick={() => setIsCandidateModalOpen(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold">Enregistrer</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL SCORECARD CANDIDAT */}
            <AnimatePresence>
                {isScorecardModalOpen && selectedCandidate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Évaluation : {selectedCandidate.firstName} {selectedCandidate.lastName}</h3>
                                    <p className="text-xs text-slate-400">{selectedCandidate.email}</p>
                                </div>
                                <button onClick={() => setIsScorecardModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleScoreSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Compétences Techniques</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button 
                                                key={s} 
                                                type="button" 
                                                onClick={() => setScoreForm({ ...scoreForm, tech: s })}
                                                className={`w-9 h-9 rounded-xl font-bold ${scoreForm.tech >= s ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'}`}
                                            >
                                                ★ {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Communication & Soft Skills</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button 
                                                key={s} 
                                                type="button" 
                                                onClick={() => setScoreForm({ ...scoreForm, communication: s })}
                                                className={`w-9 h-9 rounded-xl font-bold ${scoreForm.communication >= s ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                                            >
                                                ★ {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Décision Finale</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => setScoreForm({ ...scoreForm, recommendation: 'HIRE' })}
                                            className={`p-2.5 rounded-xl font-bold border ${scoreForm.recommendation === 'HIRE' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                                        >
                                            ✓ Recruter
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setScoreForm({ ...scoreForm, recommendation: 'REJECT' })}
                                            className={`p-2.5 rounded-xl font-bold border ${scoreForm.recommendation === 'REJECT' ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                                        >
                                            ✕ Ne pas retenir
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" className="rounded-xl text-xs" onClick={() => setIsScorecardModalOpen(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold">Valider l'Évaluation</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
