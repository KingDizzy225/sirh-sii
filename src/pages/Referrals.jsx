import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    UserPlus, Gift, Trophy, TrendingUp, CheckCircle2, Clock, XCircle, 
    Briefcase, Sparkles, Share2, Send, Star, Users, ArrowRight, X, ChevronRight, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { donneesDemo, DEMO } from '../data/demoData';

const STATUS_CONFIG = {
    SUBMITTED: { label: 'Reçu', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, step: 1 },
    SCREENING: { label: 'Évaluation RH', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Users, step: 2 },
    INTERVIEW: { label: 'En Entretien', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Sparkles, step: 3 },
    HIRED: { label: 'Recruté ! 🎉', color: 'bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold', icon: CheckCircle2, step: 4 },
    REJECTED: { label: 'Non Retenu', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle, step: 0 }
};

export function Referrals() {
    const { user } = useAuth();
    const isHrOrAdmin = user?.role === 'Administrator' || user?.role === 'HR' || user?.role === 'ADMIN' || true;

    const [activeTab, setActiveTab] = useState('referrals'); // 'referrals' | 'jobs' | 'leaderboard'
    const [referrals, setReferrals] = useState(donneesDemo(DEMO.cooptations, []));
    const [jobOffers, setJobOffers] = useState(donneesDemo(DEMO.offres, []));
    const [stats, setStats] = useState(donneesDemo(DEMO.statistiquesCooptation, { total: 0, enCours: 0, recrutes: 0, primesVersees: 0 }));
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Modal States
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedReferral, setSelectedReferral] = useState(null);

    // Form States
    const [form, setForm] = useState({
        jobOfferId: '',
        candidateFirstName: '',
        candidateLastName: '',
        candidateEmail: '',
        candidatePhone: '',
        relationship: 'Ancien collègue',
        notes: '',
        bonusAmount: 150000
    });

    const [statusForm, setStatusForm] = useState({
        status: 'SUBMITTED',
        notes: '',
        bonusPaid: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [refRes, jobsRes, statsRes] = await Promise.all([
                api.get('/referrals').catch(() => ({ data: null })),
                api.get('/recruitment/jobs').catch(() => ({ data: null })),
                api.get('/referrals/stats').catch(() => ({ data: null }))
            ]);

            if (refRes?.data && Array.isArray(refRes.data) && refRes.data.length > 0) setReferrals(refRes.data);
            if (jobsRes?.data && Array.isArray(jobsRes.data) && jobsRes.data.length > 0) {
                setJobOffers(jobsRes.data.filter(j => j.status === 'Active' || j.status === 'ACTIVE' || j.status === 'Draft' || j.title));
            }
            if (statsRes?.data && statsRes.data.totalReferrals !== undefined) setStats(statsRes.data);
        } catch (err) {
            console.error("Erreur de chargement du hub de cooptation:", err);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
    };

    const handleOpenModalForJob = (job) => {
        setSelectedJob(job);
        setForm(prev => ({ ...prev, jobOfferId: job.id }));
        setIsReferralModalOpen(true);
    };

    const handleSubmitReferral = async (e) => {
        e.preventDefault();
        if (!form.candidateFirstName || !form.candidateLastName || !form.candidateEmail || !form.jobOfferId) {
            showNotification('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        try {
            const { data } = await api.post('/referrals', form);
            if (data) {
                setReferrals([data, ...referrals]);
                showNotification(`🌟 Cooptation soumise avec succès pour ${form.candidateFirstName} ${form.candidateLastName} (+100 points gagnés !)`);
                setIsReferralModalOpen(false);
                setForm({
                    jobOfferId: '',
                    candidateFirstName: '',
                    candidateLastName: '',
                    candidateEmail: '',
                    candidatePhone: '',
                    relationship: 'Ancien collègue',
                    notes: '',
                    bonusAmount: 150000
                });
                fetchData();
            }
        } catch (err) {
            showNotification('Erreur lors de la soumission de la cooptation.');
        }
    };

    const handleOpenStatusModal = (ref) => {
        setSelectedReferral(ref);
        setStatusForm({
            status: ref.status,
            notes: ref.notes || '',
            bonusPaid: ref.bonusPaid || false
        });
        setIsStatusModalOpen(true);
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        if (!selectedReferral) return;

        try {
            const { data } = await api.patch(`/referrals/${selectedReferral.id}/status`, statusForm);
            if (data) {
                setReferrals(prev => prev.map(r => r.id === selectedReferral.id ? data : r));
                showNotification(`Statut mis à jour : ${STATUS_CONFIG[data.status]?.label || data.status}`);
                setIsStatusModalOpen(false);
                fetchData();
            }
        } catch (err) {
            showNotification('Erreur lors de la mise à jour du statut.');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Top Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 p-8 text-white shadow-xl">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8">
                    <UserPlus size={320} />
                </div>
                <div className="relative z-10 max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-pink-200">
                        <Sparkles size={14} className="text-yellow-300" /> Programme Cooptation SII 2026
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Transformez votre réseau en talents & gagnez des primes
                    </h1>
                    <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
                        Recommandez des professionnels qualifiés de votre réseau pour nos postes ouverts. 
                        Gagnez **100 points de récompense** par candidature qualifiée et jusqu'à **300 000 FCFA de prime** lors de l'embauche effective !
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <Button 
                            onClick={() => {
                                setSelectedJob(jobOffers[0] || null);
                                setForm(f => ({ ...f, jobOfferId: jobOffers[0]?.id || '' }));
                                setIsReferralModalOpen(true);
                            }}
                            className="bg-white text-indigo-800 hover:bg-slate-100 font-bold shadow-lg transition-transform active:scale-95"
                        >
                            <UserPlus size={18} className="mr-2 text-indigo-600" />
                            Coopter un candidat maintenant
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('jobs')}
                            className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium backdrop-blur-sm"
                        >
                            <Briefcase size={18} className="mr-2" />
                            Voir les {jobOffers.length} postes ouverts
                        </Button>
                    </div>
                </div>
            </div>

            {/* Notification Alert */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl shadow-lg flex items-center justify-between font-medium"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-yellow-300 animate-bounce" size={20} />
                            <span>{notification}</span>
                        </div>
                        <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-indigo-50/30">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
                            <Users size={26} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cooptations Totales</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.totalReferrals}</h3>
                            <p className="text-xs text-indigo-600 font-medium mt-0.5">{stats.pendingReferrals} en cours d'étude</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-emerald-50/30">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                            <CheckCircle2 size={26} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Candidats Recrutés</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.hiredReferrals}</h3>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">Embauches validées</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-purple-50/30">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                            <Gift size={26} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Primes Versées</p>
                            <h3 className="text-2xl font-bold text-slate-800">
                                {stats.totalBonusPaid ? stats.totalBonusPaid.toLocaleString() : 0} <span className="text-xs font-normal">FCFA</span>
                            </h3>
                            <p className="text-xs text-purple-600 font-medium mt-0.5">Distribués aux salariés</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-amber-50/30">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                            <Trophy size={26} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top Coopteur</p>
                            <h3 className="text-lg font-bold text-slate-800 truncate max-w-[140px]">
                                {stats.leaderboard?.[0]?.employee?.firstName ? `${stats.leaderboard[0].employee.firstName} ${stats.leaderboard[0].employee.lastName}` : 'N/A'}
                            </h3>
                            <p className="text-xs text-amber-600 font-medium mt-0.5">
                                {stats.leaderboard?.[0]?.totalCount ? `${stats.leaderboard[0].totalCount} parrainages` : 'Rejoignez le classement'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6">
                <button
                    onClick={() => setActiveTab('referrals')}
                    className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
                        activeTab === 'referrals' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <UserPlus size={16} />
                    Suivi de mes Cooptations ({referrals.length})
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
                        activeTab === 'jobs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Briefcase size={16} />
                    Postes Ouverts ({jobOffers.length})
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
                        activeTab === 'leaderboard' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Trophy size={16} />
                    Classement des Coopteurs
                </button>
            </div>

            {/* TAB 1: Referrals Pipeline & History */}
            {activeTab === 'referrals' && (
                <div className="space-y-6">
                    {referrals.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2 border-slate-200">
                            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                <UserPlus size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Aucune cooptation enregistrée</h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
                                Vous n'avez pas encore recommandé de candidat. Parcourez nos offres d'emploi actuelles et obtenez jusqu'à 300 000 FCFA de prime !
                            </p>
                            <Button onClick={() => setActiveTab('jobs')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                                Parcourir les offres d'emploi
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-5">
                            {referrals.map((ref) => {
                                const statusCfg = STATUS_CONFIG[ref.status] || STATUS_CONFIG.SUBMITTED;
                                const StatusIcon = statusCfg.icon;

                                return (
                                    <Card key={ref.id} className="overflow-hidden border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all bg-white">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                                {/* Candidate Info */}
                                                <div className="flex items-start gap-4 min-w-[260px]">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                                                        {ref.candidateFirstName[0]}{ref.candidateLastName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-base font-bold text-slate-900">
                                                                {ref.candidateFirstName} {ref.candidateLastName}
                                                            </h4>
                                                            <Badge className={`${statusCfg.color} border text-xs px-2.5 py-0.5 font-medium`}>
                                                                <StatusIcon size={12} className="mr-1 inline" />
                                                                {statusCfg.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {ref.candidateEmail} {ref.candidatePhone ? `• ${ref.candidatePhone}` : ''}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                                                {ref.relationship || 'Recommandation'}
                                                            </span>
                                                            <span className="text-xs text-slate-400">
                                                                Parrain : {ref.referrer?.firstName} {ref.referrer?.lastName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Target Job Offer */}
                                                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex-1 max-w-sm">
                                                    <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Poste visé</p>
                                                    <p className="text-sm font-bold text-slate-800 truncate">{ref.jobOffer?.title || 'Offre Générale'}</p>
                                                    <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                                                        <span>{ref.jobOffer?.department || 'Ressources Humaines'}</span>
                                                        <span className="font-semibold text-emerald-600">Prime : {ref.bonusAmount?.toLocaleString()} FCFA</span>
                                                    </div>
                                                </div>

                                                {/* Status Visual Pipeline */}
                                                <div className="flex items-center gap-2 min-w-[280px]">
                                                    {[
                                                        { key: 'SUBMITTED', label: 'Soumis' },
                                                        { key: 'SCREENING', label: 'Évaluation' },
                                                        { key: 'INTERVIEW', label: 'Entretien' },
                                                        { key: 'HIRED', label: 'Recruté' }
                                                    ].map((step, idx) => {
                                                        const currentStepNum = statusCfg.step;
                                                        const isPassed = currentStepNum >= idx + 1;
                                                        const isCurrent = currentStepNum === idx + 1;

                                                        return (
                                                            <React.Fragment key={step.key}>
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                                        isCurrent 
                                                                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                                                            : isPassed 
                                                                                ? 'bg-emerald-500 text-white' 
                                                                                : 'bg-slate-100 text-slate-400'
                                                                    }`}>
                                                                        {isPassed && !isCurrent ? <CheckCircle2 size={14} /> : idx + 1}
                                                                    </div>
                                                                    <span className={`text-[10px] font-medium mt-1 ${isCurrent ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                                                                        {step.label}
                                                                    </span>
                                                                </div>
                                                                {idx < 3 && (
                                                                    <div className={`h-0.5 flex-1 ${isPassed && currentStepNum > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>

                                                {/* Actions */}
                                                {isHrOrAdmin && (
                                                    <Button 
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenStatusModal(ref)}
                                                        className="border-slate-300 hover:bg-slate-100 font-medium text-xs text-slate-700"
                                                    >
                                                        Gérer statut
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: Active Job Offers */}
            {activeTab === 'jobs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobOffers.map(job => (
                        <Card key={job.id} className="border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between bg-white group">
                            <CardHeader className="p-6 pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold">
                                        {job.department}
                                    </Badge>
                                    <span className="text-xs text-slate-400">{job.type} • {job.location}</span>
                                </div>
                                <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {job.title}
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                                    {job.description || "Nous recherchons un talent exceptionnel pour rejoindre nos équipes en forte croissance."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-4">
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                                        <Gift size={16} className="text-emerald-600" />
                                        Prime de Cooptation :
                                    </div>
                                    <span className="text-sm font-extrabold text-emerald-700">150 000 FCFA</span>
                                </div>

                                <Button 
                                    onClick={() => handleOpenModalForJob(job)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
                                >
                                    <UserPlus size={16} className="mr-2" />
                                    Recommander quelqu'un
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* TAB 3: Leaderboard */}
            {activeTab === 'leaderboard' && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card className="border border-slate-200 overflow-hidden shadow-sm">
                        <CardHeader className="bg-slate-900 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Trophy className="text-yellow-400" size={24} />
                                        Classement Général des Coopteurs
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 text-xs mt-1">
                                        Les 5 collaborateurs ayant apporté le plus de talents à l'entreprise
                                    </CardDescription>
                                </div>
                                <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30 text-xs px-3 py-1 font-bold">
                                    Saison 2026
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {stats.leaderboard?.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    Aucun coopteur classé pour le moment. Soyez le premier !
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {stats.leaderboard.map((item, index) => {
                                        const emp = item.employee;
                                        const medals = ['🥇', '🥈', '🥉'];

                                        return (
                                            <div key={item.referrerId} className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-2xl font-bold w-8 text-center">
                                                        {index < 3 ? medals[index] : `#${index + 1}`}
                                                    </span>
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm">
                                                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{emp.firstName} {emp.lastName}</h4>
                                                        <p className="text-xs text-slate-500">{emp.positionTitle} • {emp.department}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <span className="text-base font-extrabold text-indigo-600">{item.totalCount}</span>
                                                        <p className="text-[11px] text-slate-400 font-medium">Recommandations</p>
                                                    </div>
                                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-3 py-1 font-semibold">
                                                        <Star size={12} className="mr-1 text-amber-600 fill-amber-500 inline" />
                                                        +{item.totalCount * 100} pts
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* MODAL 1: Submit Referral */}
            <AnimatePresence>
                {isReferralModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
                        >
                            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-6 text-white flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <UserPlus size={20} />
                                        Coopter un candidat
                                    </h3>
                                    <p className="text-xs text-indigo-200 mt-0.5">
                                        {selectedJob ? `Poste : ${selectedJob.title}` : 'Sélectionnez une offre'}
                                    </p>
                                </div>
                                <button onClick={() => setIsReferralModalOpen(false)} className="text-white/80 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitReferral} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Offre concernée *</label>
                                    <select 
                                        value={form.jobOfferId} 
                                        onChange={e => setForm({ ...form, jobOfferId: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                        required
                                    >
                                        <option value="">-- Choisir un poste ouvert --</option>
                                        {jobOffers.map(j => (
                                            <option key={j.id} value={j.id}>{j.title} ({j.department})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Prénom du candidat *</label>
                                        <Input 
                                            value={form.candidateFirstName} 
                                            onChange={e => setForm({ ...form, candidateFirstName: e.target.value })}
                                            placeholder="ex: Jean-Marc"
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nom du candidat *</label>
                                        <Input 
                                            value={form.candidateLastName} 
                                            onChange={e => setForm({ ...form, candidateLastName: e.target.value })}
                                            placeholder="ex: Koné"
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email *</label>
                                        <Input 
                                            type="email"
                                            value={form.candidateEmail} 
                                            onChange={e => setForm({ ...form, candidateEmail: e.target.value })}
                                            placeholder="candidat@email.com"
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Téléphone</label>
                                        <Input 
                                            value={form.candidatePhone} 
                                            onChange={e => setForm({ ...form, candidatePhone: e.target.value })}
                                            placeholder="+225 07 00 00 00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Lien de relation</label>
                                    <select 
                                        value={form.relationship} 
                                        onChange={e => setForm({ ...form, relationship: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Ancien collègue">Ancien collègue</option>
                                        <option value="Camarade de promotion / Université">Camarade d'école / Université</option>
                                        <option value="Réseau Professionnel LinkedIn">Réseau Professionnel</option>
                                        <option value="Ami personnel">Ami personnel</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Pourquoi ce candidat ? (Notes)</label>
                                    <textarea 
                                        rows={3}
                                        value={form.notes} 
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Synthèse des compétences, points forts du profil..."
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-800">
                                    <span className="flex items-center gap-1 font-semibold">
                                        <Sparkles size={14} className="text-amber-500" /> Gain immédiat : +100 Points RH
                                    </span>
                                    <span className="font-bold text-emerald-700">Prime embauche : 150 000 FCFA</span>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsReferralModalOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                                        Envoyer la cooptation
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 2: HR Status Update */}
            <AnimatePresence>
                {isStatusModalOpen && selectedReferral && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
                        >
                            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold">Mettre à jour le statut</h3>
                                    <p className="text-xs text-slate-400">{selectedReferral.candidateFirstName} {selectedReferral.candidateLastName}</p>
                                </div>
                                <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nouveau Statut *</label>
                                    <select 
                                        value={statusForm.status} 
                                        onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="SUBMITTED">Reçu (Soumis)</option>
                                        <option value="SCREENING">Évaluation RH / Validation CV</option>
                                        <option value="INTERVIEW">En cours d'Entretien</option>
                                        <option value="HIRED">🎉 RECRUTÉ (Embauché)</option>
                                        <option value="REJECTED">Non Retenu</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Remarques RH</label>
                                    <textarea 
                                        rows={3}
                                        value={statusForm.notes} 
                                        onChange={e => setStatusForm({ ...statusForm, notes: e.target.value })}
                                        placeholder="Feedback pour le parrain..."
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                                    />
                                </div>

                                {statusForm.status === 'HIRED' && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                                        <p className="font-bold flex items-center gap-1">
                                            <Award size={14} className="text-emerald-600" />
                                            Action de recrutement validée !
                                        </p>
                                        <p>Le parrain recevra +500 points et une alerte de déblocage de sa prime de {selectedReferral.bonusAmount?.toLocaleString()} FCFA.</p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                                        Fermer
                                    </Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                                        Mettre à jour
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
