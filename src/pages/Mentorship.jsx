import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    Users, Award, Sparkles, Star, Calendar, Clock, CheckCircle2, 
    BookOpen, Search, UserCheck, Plus, MessageSquare, ArrowRight, X, Heart, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const MOCK_MENTORS = [
    { id: 'm-1', firstName: 'Ibrahim', lastName: 'Diop', department: 'Technologie', positionTitle: 'Architecte Software', skills: ['React', 'Node.js', 'Prisma', 'Architecture Microservices'], rating: 4.9, activeMentees: 2, bio: 'Passionné par l\'ingénierie moderne et le partage de connaissances.' },
    { id: 'm-2', firstName: 'Sarah', lastName: 'Jenkins', department: 'Ressources Humaines', positionTitle: 'Directrice RH & Talent', skills: ['GPEC', 'Management RH', 'Leadership', 'Négociation'], rating: 5.0, activeMentees: 3, bio: '15 ans d\'expérience dans l\'accompagnement des carrières et de la mobilité interne.' },
    { id: 'm-3', firstName: 'Marc', lastName: 'Kouassi', department: 'Cybersécurité', positionTitle: 'Expert Sécurité SI', skills: ['Sécurité Web', 'Audit ISO 27001', 'Penetration Testing'], rating: 4.8, activeMentees: 1, bio: 'Spécialiste de la protection des données sensibles et de la conformité réglementaire.' }
];

const MOCK_MENTORSHIPS = [
    {
        id: 'rel-1',
        skillName: 'Architecture Microservices',
        goals: 'Maîtriser la création d\'APIs robustes et le découplage des données.',
        status: 'ACTIVE',
        mentor: { firstName: 'Ibrahim', lastName: 'Diop', positionTitle: 'Architecte Software', department: 'Technologie' },
        mentee: { firstName: 'Jean', lastName: 'Kone', positionTitle: 'Développeur Fullstack', department: 'IT' },
        sessions: [
            { id: 's-1', topic: 'Bases des microservices & Gateway', date: '2026-08-15', durationMinutes: 60, rating: 5, notes: 'Très bonne compréhension des principes REST.' }
        ]
    }
];

export function Mentorship() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('mentors'); // 'mentors' | 'active' | 'sessions'
    const [mentors, setMentors] = useState(MOCK_MENTORS);
    const [mentorships, setMentorships] = useState(MOCK_MENTORSHIPS);
    const [searchSkill, setSearchSkill] = useState('');
    const [notification, setNotification] = useState(null);

    // Modal States
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [selectedRelation, setSelectedRelation] = useState(null);

    // Form States
    const [requestForm, setRequestForm] = useState({ skillName: '', goals: '' });
    const [sessionForm, setSessionForm] = useState({ topic: '', date: '', durationMinutes: 60, notes: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [relRes, empRes] = await Promise.all([
                api.get('/mentorship').catch(() => ({ data: null })),
                api.get('/employees').catch(() => ({ data: null }))
            ]);

            if (relRes?.data && Array.isArray(relRes.data) && relRes.data.length > 0) {
                setMentorships(relRes.data);
            }
        } catch (err) {
            console.error("Erreur mentorat:", err);
        }
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
    };

    const handleOpenRequestModal = (mentor) => {
        setSelectedMentor(mentor);
        setRequestForm({ skillName: mentor.skills[0] || '', goals: '' });
        setIsRequestModalOpen(true);
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!selectedMentor || !requestForm.skillName) return;

        try {
            const { data } = await api.post('/mentorship/request', {
                mentorId: selectedMentor.id,
                skillName: requestForm.skillName,
                goals: requestForm.goals
            }).catch(() => ({ data: null }));

            showNotification(`🌟 Demande de mentorat envoyée à ${selectedMentor.firstName} ${selectedMentor.lastName} sur "${requestForm.skillName}" !`);
            setIsRequestModalOpen(false);
            fetchData();
        } catch (err) {
            showNotification('Erreur lors de l\'envoi de la demande.');
        }
    };

    const handleUpdateStatus = async (relationId, newStatus) => {
        try {
            await api.patch(`/mentorship/${relationId}/status`, { status: newStatus }).catch(() => ({ data: null }));
            setMentorships(prev => prev.map(m => m.id === relationId ? { ...m, status: newStatus } : m));
            if (newStatus === 'COMPLETED') {
                showNotification('🎉 Cycle de mentorat validé ! La compétence GPEC a été automatiquement attribuée (+300 pts !).');
            } else {
                showNotification(`Statut de mentorat mis à jour : ${newStatus}`);
            }
            fetchData();
        } catch (err) {
            showNotification('Erreur de mise à jour.');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-700 p-8 text-white shadow-xl">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-6">
                    <Award size={340} />
                </div>
                <div className="relative z-10 max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-purple-200">
                        <Sparkles size={14} className="text-yellow-300" /> Plateforme de Mentorat P2P SII
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Transmettez vos savoirs ou boostez vos compétences
                    </h1>
                    <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                        Connectez-vous avec des experts internes, définissez des objectifs d'apprentissage et débloquez de nouvelles compétences dans votre matrice GPEC !
                    </p>
                </div>
            </div>

            {/* Notification Alert */}
            <AnimatePresence>
                {notification && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl shadow-lg flex items-center justify-between font-medium">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-yellow-300 animate-bounce" size={20} />
                            <span>{notification}</span>
                        </div>
                        <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white"><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6">
                <button onClick={() => setActiveTab('mentors')}
                    className={`pb-3 text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'mentors' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                    <Users size={16} /> Catalogue des Mentors ({mentors.length})
                </button>
                <button onClick={() => setActiveTab('active')}
                    className={`pb-3 text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'active' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                    <Award size={16} /> Mes Mentorats & GPEC ({mentorships.length})
                </button>
            </div>

            {/* TAB 1: Mentors Catalogue */}
            {activeTab === 'mentors' && (
                <div className="space-y-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <Input 
                            value={searchSkill} 
                            onChange={e => setSearchSkill(e.target.value)}
                            placeholder="Rechercher une compétence (ex: React, GPEC, ISO 27001)..." 
                            className="pl-10"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentors.filter(m => !searchSkill || m.skills.some(s => s.toLowerCase().includes(searchSkill.toLowerCase()))).map(mentor => (
                            <Card key={mentor.id} className="border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                                <CardHeader className="p-6 pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                                                {mentor.firstName[0]}{mentor.lastName[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base">{mentor.firstName} {mentor.lastName}</h3>
                                                <p className="text-xs text-slate-500">{mentor.positionTitle}</p>
                                                <Badge className="bg-slate-100 text-slate-700 text-[10px] mt-1">{mentor.department}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-1 rounded-lg text-xs font-bold border border-amber-200">
                                            <Star size={14} className="text-amber-500 fill-amber-400" />
                                            {mentor.rating}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 italic mt-3 line-clamp-2">"{mentor.bio}"</p>
                                </CardHeader>

                                <CardContent className="p-6 pt-0 space-y-4">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Compétences proposées</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {mentor.skills.map((skill, i) => (
                                                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-md border border-indigo-100">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={() => handleOpenModalForMentor ? handleOpenRequestModal(mentor) : null} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md">
                                        <UserCheck size={16} className="mr-2" /> Demander un mentorat
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: Active Mentorships */}
            {activeTab === 'active' && (
                <div className="space-y-6">
                    {mentorships.map(rel => (
                        <Card key={rel.id} className="border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-base font-bold text-slate-900">Objectif : {rel.skillName}</h4>
                                                <Badge className={`text-xs ${rel.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-100 text-indigo-700'}`}>
                                                    {rel.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{rel.goals}</p>
                                            <p className="text-xs font-semibold text-indigo-600 mt-2">
                                                Mentor : {rel.mentor?.firstName} {rel.mentor?.lastName} ({rel.mentor?.positionTitle})
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {rel.status === 'ACTIVE' && (
                                            <Button onClick={() => handleUpdateStatus(rel.id, 'COMPLETED')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                                                <CheckCircle2 size={14} className="mr-1" /> Valider le cycle & attribuer compétence
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* MODAL: Request Mentorship */}
            <AnimatePresence>
                {isRequestModalOpen && selectedMentor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
                            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">Solliciter un mentorat</h3>
                                    <p className="text-xs text-purple-200">Mentor : {selectedMentor.firstName} {selectedMentor.lastName}</p>
                                </div>
                                <button onClick={() => setIsRequestModalOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSendRequest} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Compétence ciblée *</label>
                                    <select value={requestForm.skillName} onChange={e => setRequestForm({ ...requestForm, skillName: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold">
                                        {selectedMentor.skills.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Vos objectifs d'apprentissage</label>
                                    <textarea rows={3} value={requestForm.goals} onChange={e => setRequestForm({ ...requestForm, goals: e.target.value })}
                                        placeholder="Décrivez ce que vous souhaitez accomplir..."
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsRequestModalOpen(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Envoyer la demande</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
