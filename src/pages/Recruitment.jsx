import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Clock, Plus, UserPlus, CheckCircle2, X, ArrowRight, Star, ThumbsUp, ThumbsDown, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialJobs = [
    { id: 1, title: 'Senior Frontend Engineer', department: 'Engineering', location: 'À distance', status: 'Actif', postedAt: 'il y a 5 jours', contractType: 'CDI', experienceLevel: 'Senior', description: 'Nous recherchons un Développeur Frontend Senior expérimenté...', requirements: 'React, TypeScript, 5+ années d\'expérience' },
    { id: 2, title: 'Product Marketing Manager', department: 'Marketing', location: 'Abidjan, CI', status: 'Actif', postedAt: 'il y a 12 jours', contractType: 'CDI', experienceLevel: 'Intermédiaire', description: 'Pilotez notre stratégie marketing produit...', requirements: '3+ années d\'expérience en marketing B2B' },
    { id: 3, title: 'Customer Support Lead', department: 'Support', location: 'Dakar, SN', status: 'Urgent', postedAt: 'il y a 2 jours', contractType: 'Consultant', experienceLevel: 'Lead', description: 'Dirigez notre équipe de support client en Afrique de l\'Ouest...', requirements: 'Expérience en leadership, Zendesk' },
];

const initialCandidates = [
    { id: 101, jobId: 1, firstName: 'Alex', lastName: 'Martin', email: 'alex@example.com', stage: 'SCREENING', score: null },
    { id: 102, jobId: 1, firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah@example.com', stage: 'INTERVIEW', score: null },
    { id: 103, jobId: 1, firstName: 'Michael', lastName: 'Dam', email: 'michael@example.com', stage: 'OFFER', score: 4.8 },
    { id: 104, jobId: 2, firstName: 'Emily', lastName: 'Chen', email: 'emily@example.com', stage: 'SCREENING', score: null },
];

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

            {/* ADD JOB MODAL */}
            <AnimatePresence>
                {isJobModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Créer une Nouvelle Offre d'Emploi</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsJobModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>
                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="add-job-form" onSubmit={handleJobSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Titre du Poste <span className="text-rose-500">*</span></label>
                                            <Input value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="ex. Senior Frontend Engineer" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Département <span className="text-rose-500">*</span></label>
                                            <select
                                                value={jobForm.department}
                                                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                                                className="flex h-10 w-full border-slate-200 rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                required
                                            >
                                                <option value="" disabled>Sélectionner le Département</option>
                                                <option value="Engineering">Ingénierie</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Sales">Ventes</option>
                                                <option value="HR">RH</option>
                                                <option value="Support">Support</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Operations">Opérations</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Lieu</label>
                                            <Input value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="ex. À distance, Abidjan" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Type de Contrat</label>
                                            <select
                                                value={jobForm.contractType}
                                                onChange={(e) => setJobForm({ ...jobForm, contractType: e.target.value })}
                                                className="flex h-10 w-full border-slate-200 rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <option value="CDI">CDI (Temps plein)</option>
                                                <option value="Temps partiel">Temps partiel</option>
                                                <option value="Consultant">Contrat (CDD / Freelance)</option>
                                                <option value="Stage">Stage</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Niveau d'Expérience</label>
                                            <select
                                                value={jobForm.experienceLevel}
                                                onChange={(e) => setJobForm({ ...jobForm, experienceLevel: e.target.value })}
                                                className="flex h-10 w-full border-slate-200 rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <option value="Junior">Junior</option>
                                                <option value="Intermédiaire">Intermédiaire</option>
                                                <option value="Senior">Senior</option>
                                                <option value="Lead">Lead / Manager</option>
                                                <option value="Direction">Direction / Exécutif</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Description du Poste</label>
                                        <textarea
                                            className="w-full min-h-[120px] p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Fournissez une description détaillée du rôle, des responsabilités et de l'équipe..."
                                            value={jobForm.description}
                                            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Compétences / Profil Requis</label>
                                        <textarea
                                            className="w-full min-h-[80px] p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Outils spécifiques, diplômes ou années d'expérience requis..."
                                            value={jobForm.requirements}
                                            onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Statut Initial</label>
                                        <div className="flex gap-4">
                                            {['Actif', 'Urgent', 'En pause'].map(statusOption => (
                                                <label key={statusOption} className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${jobForm.status === statusOption ? (statusOption === 'Urgent' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-blue-500 bg-blue-50 text-blue-800') : 'border-slate-200 hover:bg-slate-50'}`}>
                                                    <input type="radio" name="jobStatus" className="sr-only" value={statusOption} checked={jobForm.status === statusOption} onChange={() => setJobForm({ ...jobForm, status: statusOption })} />
                                                    <span className="text-sm font-medium">{statusOption}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button variant="outline" onClick={() => setIsJobModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="add-job-form" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Publier l'Offre</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SCORECARD MODAL */}
            <AnimatePresence>
                {isScorecardModalOpen && selectedCandidate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Grille d'Évaluation</h3>
                                    <p className="text-sm text-slate-500">Candidat : {selectedCandidate.firstName} {selectedCandidate.lastName}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsScorecardModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="scorecard-form" onSubmit={handleScoreSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">Compétences Techniques</h4>
                                                <p className="text-xs text-slate-500">Connaissances spécifiques au poste et résolution de problèmes.</p>
                                            </div>
                                            {renderScoreStars('tech', scoreForm.tech)}
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">Adéquation Culturelle</h4>
                                                <p className="text-xs text-slate-500">Alignement avec les valeurs de l'entreprise et l'équipe.</p>
                                            </div>
                                            {renderScoreStars('culture', scoreForm.culture)}
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">Communication</h4>
                                                <p className="text-xs text-slate-500">Clarté, élocution et compétences interpersonnelles.</p>
                                            </div>
                                            {renderScoreStars('communication', scoreForm.communication)}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-slate-800">Recommandation Globale</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setScoreForm({ ...scoreForm, recommendation: 'YES' })}
                                                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${scoreForm.recommendation === 'YES' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-200 text-slate-500'}`}
                                            >
                                                <ThumbsUp /> Embaucher
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setScoreForm({ ...scoreForm, recommendation: 'NO' })}
                                                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${scoreForm.recommendation === 'NO' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-rose-200 text-slate-500'}`}
                                            >
                                                <ThumbsDown /> Rejeter
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Notes d'Entretien</label>
                                        <textarea
                                            className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Donnez des exemples précis et justifiez votre note..."
                                            value={scoreForm.notes}
                                            onChange={(e) => setScoreForm({ ...scoreForm, notes: e.target.value })}
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsScorecardModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="scorecard-form" className="bg-blue-600 hover:bg-blue-700 text-white">Enregistrer l'Évaluation</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ADD CANDIDATE MODAL */}
            <AnimatePresence>
                {isCandidateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Ajouter un Candidat</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsCandidateModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>
                            <div className="px-6 py-6">
                                <form id="add-candidate-form" onSubmit={handleCandidateSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Prénom</label>
                                            <Input value={candidateForm.firstName} onChange={e => setCandidateForm({ ...candidateForm, firstName: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nom de famille</label>
                                            <Input value={candidateForm.lastName} onChange={e => setCandidateForm({ ...candidateForm, lastName: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input type="email" value={candidateForm.email} onChange={e => setCandidateForm({ ...candidateForm, email: e.target.value })} required />
                                    </div>
                                </form>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsCandidateModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="add-candidate-form" className="bg-blue-600 text-white">Ajouter le Candidat</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {activeJobId ? (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setActiveJobId(null)} className="h-8 w-8 rounded-full border bg-white shadow-sm hover:bg-slate-100">
                                <ArrowLeft size={16} />
                            </Button>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{activeJob?.title}</h2>
                                <p className="text-slate-500 text-sm">{activeJob?.department} • {activeJob?.location}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Recrutement</h2>
                            <p className="text-slate-500 mt-1">Gérez les postes ouverts et suivez le pipeline des candidats.</p>
                        </>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {activeJobId ? (
                        <Button onClick={() => setIsCandidateModalOpen(true)} className="gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                            <UserPlus size={16} /> Ajouter un Candidat
                        </Button>
                    ) : (
                        <Button onClick={() => setIsJobModalOpen(true)} className="gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus size={16} /> Nouvelle Offre d'Emploi
                        </Button>
                    )}
                </div>
            </div>

            {/* DYNAMIC CONTENT */}
            {!activeJobId ? (
                // VIEW 1: JOB LISTINGS
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {jobs.map(job => (
                        <Card key={job.id} onClick={() => setActiveJobId(job.id)} className="cursor-pointer hover:shadow-md transition-all group hover:border-blue-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm text-slate-500 font-medium">{job.department}</p>
                                            <span className="text-slate-300">•</span>
                                            <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 bg-slate-50">{job.type}</Badge>
                                            <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 bg-slate-50">{job.experience}</Badge>
                                        </div>
                                    </div>
                                    <Badge variant={job.status === 'Actif' ? 'success' : job.status === 'Urgent' ? 'destructive' : 'secondary'}>
                                        {job.status}
                                    </Badge>
                                </div>

                                <div className="flex justify-between text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</div>
                                    <div className="flex items-center gap-1.5"><Clock size={14} /> {new Date(job.createdAt).toLocaleDateString('fr-FR')}</div>
                                </div>

                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span className="text-slate-700">Pipeline de {getJobApplicantsCount(job.id)} Candidats</span>
                                    <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                // VIEW 2: KANBAN PIPELINE
                <div className="flex gap-4 overflow-x-auto pb-4 pt-4 hide-scrollbar">
                    {STAGES.map(stage => {
                        const stageCandidates = candidates.filter(c => c.jobOfferId === activeJobId && (c.stage === stage.id || c.status === stage.id));
                        return (
                            <div key={stage.id} className="min-w-[300px] max-w-[320px] flex-shrink-0 flex flex-col h-auto">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-3 h-3 rounded-full ${stage.bg} border-2 ${stage.color.replace('text', 'border')}`} />
                                    <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">{stage.label}</h3>
                                    <Badge variant="secondary" className="ml-auto bg-slate-200/50 text-slate-600">{stageCandidates.length}</Badge>
                                </div>

                                <div className="bg-slate-100/50 rounded-xl p-2 min-h-[500px] border border-slate-200">
                                    {stageCandidates.map(candidate => (
                                        <Card key={candidate.id} className="mb-2 shadow-sm relative overflow-visible group">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900">{candidate.firstName} {candidate.lastName}</h4>
                                                        <p className="text-xs text-slate-500 mt-0.5">{candidate.email}</p>
                                                    </div>
                                                </div>

                                                {/* Score Display or Eval Button */}
                                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                    {stage.id === 'INTERVIEW' ? (
                                                        <Button size="sm" variant="outline" onClick={() => openScorecard(candidate)} className="h-7 text-xs border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100">
                                                            <Star size={12} className="mr-1" /> {candidate.score ? `Note: ${candidate.score}/5` : 'Évaluer'}
                                                        </Button>
                                                    ) : (
                                                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                            {candidate.score ? <><Star size={12} className="text-amber-400 fill-amber-400" /> {candidate.score}/5</> : 'Pas de note'}
                                                        </div>
                                                    )}

                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        {STAGES.findIndex(s => s.id === stage.id) > 0 && (
                                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveCandidate(candidate.id, STAGES[STAGES.findIndex(s => s.id === stage.id) - 1].id)}>
                                                                <ArrowLeft size={14} className="text-slate-400" />
                                                            </Button>
                                                        )}
                                                        {STAGES.findIndex(s => s.id === stage.id) < STAGES.length - 1 && (
                                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveCandidate(candidate.id, STAGES[STAGES.findIndex(s => s.id === stage.id) + 1].id)}>
                                                                <ArrowRight size={14} className="text-slate-400" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
