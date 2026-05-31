import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    BookOpen, Video, Award, Clock, PlayCircle, Users, CheckCircle2, 
    Plus, X, Edit, Trash2, ArrowLeft, Check, Download, 
    GraduationCap, Calendar, User 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api.js';

export function Learning() {
    const { user } = useAuth();
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR' || user?.role === 'Administrator';

    const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'history', 'progress', 'builder', 'player'
    const [courses, setCourses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [employeeProgress, setEmployeeProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Player state
    const [activeCourse, setActiveCourse] = useState(null);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);

    // Interactive Dynamic QCM state
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);

    // Modals
    const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
    const [isAIGeneratorModalOpen, setIsAIGeneratorModalOpen] = useState(false);
    const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);

    // Forms
    const [courseForm, setCourseForm] = useState({ title: '', description: '', trainerName: '', date: '', durationHours: '' });
    const [sessionForm, setSessionForm] = useState({ title: '', description: '', trainerName: '', date: '', durationHours: '' });
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [aiTopic, setAiTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [moduleForm, setModuleForm] = useState({ title: '', content: '', mediaUrl: '' });

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Load courses/sessions
            const { data } = await api.get('/trainings');
            const colors = [
                'from-blue-600 to-indigo-700', 
                'from-emerald-600 to-teal-700', 
                'from-indigo-600 to-violet-700', 
                'from-rose-600 to-pink-700', 
                'from-amber-500 to-orange-600'
            ];
            
            const mappedCourses = data.map((c, i) => {
                const currentUserId = user?.employeeId || user?.id;
                const isUserEnrolled = c.participations?.some(p => p.employeeId === currentUserId);
                const userParticipation = c.participations?.find(p => p.employeeId === currentUserId);

                return {
                    ...c,
                    coverBg: colors[i % colors.length],
                    category: c.modules && c.modules.length > 0 ? 'Formation en Ligne (LMS)' : 'Formation Physique / Externe',
                    totalModules: c.modules?.length || 0,
                    timeEst: `${c.durationHours} h`,
                    activeLearners: c.participations ? c.participations.length : 0,
                    isUserEnrolled,
                    userParticipation
                };
            });
            setCourses(mappedCourses);
            
            // Build compliance/learner progress for admins
            let globalProgress = [];
            mappedCourses.forEach(course => {
                if (course.participations) {
                    course.participations.forEach(p => {
                        const completedModulesCount = p.moduleProgresses?.length || 0;
                        globalProgress.push({
                            employeeId: p.employeeId,
                            name: p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : 'Employé Inconnu',
                            role: p.employee ? p.employee.department : 'Non spécifié',
                            courseId: course.id,
                            courseTitle: course.title,
                            modulesCompleted: completedModulesCount,
                            totalModules: course.totalModules || 1,
                            status: p.completionStatus
                        });
                    });
                }
            });
            setEmployeeProgress(globalProgress);

            // Load employees list for session logs
            if (isAdminOrHR) {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const res = await fetch(`${API_URL}/api/employees`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
                });
                if (res.ok) {
                    const empData = await res.json();
                    setEmployees(empData);
                }
            }
        } catch (err) {
            console.error("Erreur de chargement des données de formation", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Course registration
    const handleRegister = async (courseId) => {
        try {
            await api.post('/trainings/enroll', { sessionId: courseId });
            showNotification('Inscription réussie ! Vous pouvez maintenant débuter le cours. 🚀');
            fetchAllData();
        } catch (err) {
            showNotification('Erreur lors de l\'inscription ou déjà inscrit.');
        }
    };

    // AI Course Generator
    const handleAIGenerate = async (e) => {
        e.preventDefault();
        if (!aiTopic) return;
        setIsGenerating(true);
        try {
            await api.post('/trainings/generate', { topic: aiTopic });
            setIsAIGeneratorModalOpen(false);
            setAiTopic('');
            showNotification('✨ Cours interactif complet et QCM de validation générés avec succès par l\'IA !');
            fetchAllData();
        } catch (err) {
            showNotification('Erreur réseau lors de la génération par l\'IA.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Manual Course Creation
    const handleAddCourseSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trainings', {
                title: courseForm.title,
                description: courseForm.description,
                trainerName: courseForm.trainerName,
                date: courseForm.date || new Date().toISOString(),
                durationHours: parseFloat(courseForm.durationHours),
                participantIds: []
            });
            setIsAddCourseModalOpen(false);
            setCourseForm({ title: '', description: '', trainerName: '', date: '', durationHours: '' });
            showNotification('Nouveau cours en ligne initialisé ! Ajoutez des chapitres dans le Studio LMS.');
            fetchAllData();
        } catch (err) {
            showNotification('Erreur réseau lors de la création du cours.');
        }
    };

    // Add Session Log (Historical/Trace)
    const handleAddSessionSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trainings', {
                title: sessionForm.title,
                description: sessionForm.description,
                trainerName: sessionForm.trainerName,
                date: sessionForm.date,
                durationHours: parseFloat(sessionForm.durationHours),
                participantIds: selectedParticipants
            });
            setIsAddSessionModalOpen(false);
            setSessionForm({ title: '', description: '', trainerName: '', date: '', durationHours: '' });
            setSelectedParticipants([]);
            showNotification('Session de formation archivée et validée pour les participants.');
            fetchAllData();
        } catch (err) {
            showNotification('Erreur lors de la sauvegarde de la session.');
        }
    };

    // CSV Export of Training Logs
    const handleExportCSV = () => {
        if (courses.length === 0) return alert('Aucune donnée à exporter.');
        const csv = Papa.unparse(courses.map(t => ({
            "Titre du Module": t.title,
            "Type": t.category,
            "Formateur / Cabinet": t.trainerName,
            "Date de Réalisation": new Date(t.date).toLocaleDateString('fr-FR'),
            "Volume Horaire (Heures)": t.durationHours,
            "Apprenants inscrits/formés": t.activeLearners
        })));
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Cahier_Formation_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Course Builder Operations
    const handleAddModule = async () => {
        if (!moduleForm.title) return;
        try {
            await api.post(`/trainings/${activeCourse.id}/modules`, {
                ...moduleForm,
                orderSequence: activeCourse.modules?.length || 0
            });
            showNotification('Module de cours ajouté !');
            setModuleForm({ title: '', content: '', mediaUrl: '' });
            
            const { data: updated } = await api.get('/trainings');
            setActiveCourse(updated.find(c => c.id === activeCourse.id));
            fetchAllData();
        } catch (err) {
            showNotification('Erreur lors de l\'ajout du module.');
        }
    };

    const handleDeleteModule = async (moduleId) => {
        try {
            await api.delete(`/trainings/modules/${moduleId}`);
            showNotification('Module de cours supprimé.');
            
            const { data: updated } = await api.get('/trainings');
            setActiveCourse(updated.find(c => c.id === activeCourse.id));
            fetchAllData();
        } catch (err) {
            showNotification('Erreur lors de la suppression.');
        }
    };

    // Mark regular module progress
    const handleMarkProgress = async () => {
        const currentModule = activeCourse.modules[activeModuleIndex];
        try {
            await api.post('/trainings/progress', {
                sessionId: activeCourse.id,
                moduleId: currentModule.id
            });
            showNotification('Module marqué comme terminé !');
            fetchAllData();
            
            const { data: updated } = await api.get('/trainings');
            const updatedCourse = updated.find(c => c.id === activeCourse.id);
            setActiveCourse(updatedCourse);

            if (activeModuleIndex < updatedCourse.modules.length - 1) {
                setActiveModuleIndex(activeModuleIndex + 1);
                setQuizAnswers({});
                setQuizResult(null);
            }
        } catch (err) {
            showNotification('Erreur réseau.');
        }
    };

    // Dynamic QCM Validation logic
    const handleValidateQuiz = async (questions) => {
        // Ensure everything is answered
        if (Object.keys(quizAnswers).length < questions.length) {
            alert('Veuillez répondre à toutes les questions avant de valider.');
            return;
        }

        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (quizAnswers[idx] === q.answer) {
                correctCount++;
            }
        });

        const scorePercentage = Math.round((correctCount / questions.length) * 100);
        const hasPassed = scorePercentage >= 80;

        setQuizResult({
            score: scorePercentage,
            passed: hasPassed,
            correctCount,
            totalCount: questions.length
        });

        if (hasPassed) {
            const currentModule = activeCourse.modules[activeModuleIndex];
            try {
                await api.post('/trainings/progress', {
                    sessionId: activeCourse.id,
                    moduleId: currentModule.id
                });
                showNotification(`🎉 QCM Validé avec succès (${scorePercentage}%)! Formation certifiée.`);
                fetchAllData();
                
                // Refresh course progress representation
                const { data: updated } = await api.get('/trainings');
                setActiveCourse(updated.find(c => c.id === activeCourse.id));
            } catch (err) {
                console.error("Erreur enregistrement validation QCM", err);
            }
        }
    };

    const hasCompletedModule = (course, modId) => {
        const participation = course.participations?.find(p => p.employeeId === (user?.employeeId || user?.id));
        if (!participation) return false;
        return participation.moduleProgresses?.some(mp => mp.moduleId === modId);
    };

    const toggleParticipant = (empId) => {
        setSelectedParticipants(prev =>
            prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
        );
    };

    return (
        <div className="flex-1 space-y-6 p-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">
            
            {/* Top Alert Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, x: '-50%' }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 font-medium border border-slate-800"
                    >
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Block */}
            {activeTab !== 'player' && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Espace Formation & LMS</h2>
                        <p className="text-slate-500 mt-1">Gérez le plan de formation d'entreprise et suivez les parcours en ligne.</p>
                    </div>
                    {isAdminOrHR && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={() => setIsAIGeneratorModalOpen(true)}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm font-semibold gap-2 rounded-xl"
                            >
                                ✨ Assistant IA Gemini
                            </Button>
                            <Button
                                onClick={() => setIsAddCourseModalOpen(true)}
                                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-semibold gap-2 rounded-xl"
                            >
                                <Plus size={18} /> Nouveau Cours
                            </Button>
                            <Button
                                onClick={() => setIsAddSessionModalOpen(true)}
                                className="bg-white border hover:bg-slate-50 text-slate-700 font-semibold gap-2 rounded-xl"
                            >
                                <GraduationCap size={18} /> Enregistrer Session
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Custom Tab Switcher */}
            {activeTab !== 'player' && (
                <div className="flex space-x-1 bg-slate-200/60 p-1 rounded-xl w-max">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <BookOpen size={16} /> Catalogue E-Learning
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Calendar size={16} /> Cahier de Formation
                    </button>
                    {isAdminOrHR && (
                        <button
                            onClick={() => setActiveTab('progress')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'progress' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <Award size={16} /> Suivi & Conformité
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {/* 1. CATALOGUE VIEW */}
                    {activeTab === 'catalog' && (
                        <div className="space-y-6 animate-in fade-in duration-250">
                            {courses.filter(c => c.modules && c.modules.length > 0).length === 0 ? (
                                <Card className="text-center py-16 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-950">Aucun cours en ligne disponible</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-1">
                                        Il n'y a pas de module E-Learning publié pour l'instant. Utilisez l'Assistant IA pour en générer un instantanément.
                                    </p>
                                </Card>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {courses.filter(c => c.modules && c.modules.length > 0).map(course => (
                                        <Card key={course.id} className="hover:shadow-lg transition-all border border-slate-100 rounded-2xl overflow-hidden flex flex-col group bg-white">
                                            <div className={`h-36 bg-gradient-to-br ${course.coverBg} w-full flex flex-col justify-between p-4 text-white relative`}>
                                                <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-0 self-start">
                                                    {course.category}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 text-xs text-white/90">
                                                    <Clock size={14} /> <span>{course.timeEst} d'apprentissage estimé</span>
                                                </div>
                                            </div>
                                            <CardContent className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2">
                                                        {course.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                                                        {course.description || "Aucune description fournie pour ce module de formation."}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center justify-between border-t pt-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><BookOpen size={14} />{course.totalModules} Chapitres</span>
                                                    <span className="flex items-center gap-1"><Users size={14} />{course.activeLearners} Apprenants</span>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-5 pt-0 gap-2 flex-col">
                                                {isAdminOrHR && (
                                                    <Button 
                                                        variant="outline" 
                                                        className="w-full rounded-xl border-slate-200 hover:bg-slate-50 font-semibold"
                                                        onClick={() => { setActiveCourse(course); setActiveTab('builder'); }}
                                                    >
                                                        <Edit size={14} className="mr-2" /> Gérer le Contenu
                                                    </Button>
                                                )}
                                                {course.isUserEnrolled ? (
                                                    <Button 
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm"
                                                        onClick={() => { 
                                                            setActiveCourse(course); 
                                                            setActiveModuleIndex(0); 
                                                            setActiveTab('player'); 
                                                            setQuizAnswers({});
                                                            setQuizResult(null);
                                                        }}
                                                    >
                                                        <PlayCircle size={15} className="mr-2" /> Accéder au Cours
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        variant="outline" 
                                                        className="w-full rounded-xl font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                                                        onClick={() => handleRegister(course.id)}
                                                    >
                                                        S'inscrire à la formation
                                                    </Button>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. CAHIER DE FORMATION (LOGS & PHYSICAL) */}
                    {activeTab === 'history' && (
                        <div className="space-y-6 animate-in fade-in duration-250">
                            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Registre Général des Activités</h3>
                                    <p className="text-sm text-slate-500">Historique complet des formations e-learning et présentielles réalisées.</p>
                                </div>
                                <Button onClick={handleExportCSV} variant="outline" className="rounded-xl border-slate-200 gap-2 font-semibold">
                                    <Download size={16} /> Exporter CSV
                                </Button>
                            </div>

                            {courses.length === 0 ? (
                                <Card className="text-center py-16 px-4 bg-white border border-slate-100 rounded-2xl">
                                    <GraduationCap size={48} className="mx-auto text-slate-300 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-950">Aucun registre disponible</h3>
                                </Card>
                            ) : (
                                <div className="grid gap-4">
                                    {courses.map(session => (
                                        <Card key={session.id} className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge className={session.modules?.length > 0 ? "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50" : "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-50"}>
                                                                {session.category}
                                                            </Badge>
                                                            <span className="text-xs text-slate-400 font-medium">Enregistré le {new Date(session.createdAt).toLocaleDateString('fr-FR')}</span>
                                                        </div>
                                                        <h4 className="text-lg font-bold text-slate-900">{session.title}</h4>
                                                        {session.description && <p className="text-sm text-slate-600 line-clamp-2 max-w-3xl">{session.description}</p>}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-3 gap-6 lg:divide-x border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
                                                        <div className="px-2">
                                                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Formateur</span>
                                                            <span className="font-semibold text-sm text-slate-800">{session.trainerName}</span>
                                                        </div>
                                                        <div className="px-4">
                                                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Volume</span>
                                                            <span className="font-semibold text-sm text-slate-800">{session.durationHours} Heures</span>
                                                        </div>
                                                        <div className="px-4">
                                                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Participants</span>
                                                            <span className="font-bold text-blue-600 text-sm">{session.activeLearners} inscrits</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Participants avatars detail */}
                                                {session.participations && session.participations.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apprenants participants :</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {session.participations.map(p => (
                                                                <div key={p.id} className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1 text-xs transition-colors">
                                                                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                                                                        {p.employee ? `${p.employee.firstName[0]}${p.employee.lastName[0]}` : '??'}
                                                                    </div>
                                                                    <span className="font-medium text-slate-700">
                                                                        {p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : 'Anonyme'}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400">• {p.completionStatus}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. SUIVI & COMPLIANCE VIEW */}
                    {activeTab === 'progress' && isAdminOrHR && (
                        <div className="space-y-6 animate-in fade-in duration-250">
                            <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b">
                                    <CardTitle className="text-lg font-bold text-slate-900">Conformité par Apprenant</CardTitle>
                                    <CardDescription>Visualisez la progression et le statut de certification de vos collaborateurs.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                                            <tr>
                                                <th className="px-6 py-4">Collaborateur</th>
                                                <th className="px-6 py-4">Département</th>
                                                <th className="px-6 py-4">Cours Suivi</th>
                                                <th className="px-6 py-4">Progression Modules</th>
                                                <th className="px-6 py-4 text-right">Statut Général</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {employeeProgress.map((ep, idx) => {
                                                const pct = ep.totalModules > 0 ? Math.round((ep.modulesCompleted / ep.totalModules) * 100) : 0;
                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-900">{ep.name}</td>
                                                        <td className="px-6 py-4 text-slate-600">{ep.role || 'Non renseigné'}</td>
                                                        <td className="px-6 py-4 text-slate-700">{ep.courseTitle}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3 min-w-[120px]">
                                                                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                                    <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                                                                </div>
                                                                <span className="text-xs font-semibold text-slate-700 shrink-0">{pct}% ({ep.modulesCompleted}/{ep.totalModules})</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Badge className={
                                                                ep.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50" :
                                                                ep.status === 'En cours' ? "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50" :
                                                                "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50"
                                                            }>
                                                                {ep.status === 'Completed' ? 'Certifié (Validé)' : ep.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {employeeProgress.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-12 text-slate-500 italic">
                                                        Aucune progression d'apprenant enregistrée.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* 4. COURSE BUILDER (LMS ADMIN) */}
                    {activeTab === 'builder' && activeCourse && isAdminOrHR && (
                        <div className="animate-in slide-in-from-right-8 duration-300 space-y-6">
                            <Button variant="ghost" onClick={() => setActiveTab('catalog')} className="rounded-xl border-slate-200 hover:bg-slate-100 text-slate-600">
                                <ArrowLeft size={16} className="mr-2" /> Retour au catalogue
                            </Button>

                            <div className="grid md:grid-cols-3 gap-6">
                                <Card className="md:col-span-1 border border-slate-100 shadow-sm rounded-xl bg-white">
                                    <CardHeader className="border-b">
                                        <CardTitle className="text-base font-bold">Structure du Cours</CardTitle>
                                        <CardDescription className="truncate">{activeCourse.title}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-2">
                                        {activeCourse.modules?.map((m, i) => (
                                            <div key={m.id} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50">
                                                <div className="font-semibold text-sm flex items-center gap-2 text-slate-800">
                                                    <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 py-0.5 px-2 font-mono">
                                                        {i + 1}
                                                    </Badge>
                                                    <span className="truncate max-w-[150px]" title={m.title}>{m.title}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteModule(m.id)} 
                                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={15}/>
                                                </button>
                                            </div>
                                        ))}
                                        {activeCourse.modules?.length === 0 && (
                                            <p className="text-sm text-slate-500 italic py-4 text-center">Aucun module créé.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-2 border border-slate-100 shadow-sm rounded-xl bg-white">
                                    <CardHeader className="border-b">
                                        <CardTitle className="text-base font-bold">Créer un nouveau chapitre</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titre du module / chapitre</label>
                                            <Input 
                                                value={moduleForm.title} 
                                                onChange={e => setModuleForm({...moduleForm, title: e.target.value})} 
                                                placeholder="Ex: Chapitre 1 - Les bases de la sécurité" 
                                                className="rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lien média ou ressource externe (Youtube, PDF Drive, etc.)</label>
                                            <Input 
                                                value={moduleForm.mediaUrl} 
                                                onChange={e => setModuleForm({...moduleForm, mediaUrl: e.target.value})} 
                                                placeholder="Ex: https://youtube.com/watch?v=..." 
                                                className="rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contenu texte pédagogique</label>
                                            <textarea 
                                                value={moduleForm.content} 
                                                onChange={e => setModuleForm({...moduleForm, content: e.target.value})} 
                                                placeholder="Rédigez le contenu textuel de la leçon ici..." 
                                                className="w-full flex min-h-[160px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
                                            />
                                        </div>
                                        <Button onClick={handleAddModule} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold w-full">
                                            Publier le Chapitre
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* 5. COURSE PLAYER (LMS LEANER) */}
                    {activeTab === 'player' && activeCourse && (
                        <div className="fixed inset-0 z-[100] bg-slate-900 text-slate-100 flex flex-col md:flex-row animate-in fade-in duration-300">
                            {/* Left Sidebar Index */}
                            <div className="w-full md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
                                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                                    <button 
                                        onClick={() => { setActiveTab('catalog'); setActiveCourse(null); }} 
                                        className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft size={16}/>
                                    </button>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-sm text-slate-200 truncate" title={activeCourse.title}>{activeCourse.title}</h3>
                                        <p className="text-[10px] text-slate-500 truncate">LMS Apprenant</p>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Plan de Formation</p>
                                    {activeCourse.modules?.map((m, i) => {
                                        const isCompleted = hasCompletedModule(activeCourse, m.id);
                                        return (
                                            <button 
                                                key={m.id} 
                                                onClick={() => { 
                                                    setActiveModuleIndex(i); 
                                                    setQuizAnswers({});
                                                    setQuizResult(null);
                                                }}
                                                className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${
                                                    activeModuleIndex === i 
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' 
                                                        : 'hover:bg-slate-900 text-slate-300'
                                                }`}
                                            >
                                                <div className="mt-0.5 shrink-0">
                                                    {isCompleted ? (
                                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                                    ) : (
                                                        <div className={`w-4 h-4 rounded-full border ${activeModuleIndex === i ? 'border-white' : 'border-slate-600'}`}></div>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Module {i + 1}</p>
                                                    <p className="text-sm font-semibold leading-tight truncate">{m.title}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Right Content Area */}
                            <div className="flex-1 flex flex-col bg-slate-900 overflow-y-auto p-6 md:p-12">
                                {activeCourse.modules?.length > 0 ? (
                                    <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in duration-200">
                                        <div className="space-y-2">
                                            <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">
                                                Module {activeModuleIndex + 1} de {activeCourse.modules.length}
                                            </span>
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                                                {activeCourse.modules[activeModuleIndex].title}
                                            </h1>
                                        </div>

                                        {/* RENDER DYNAMIC QUIZ/QCM */}
                                        {activeCourse.modules[activeModuleIndex].mediaUrl === 'quiz' ? (
                                            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6">
                                                <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                                                        QCM
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-white text-base">Test d'Évaluation Finale</h3>
                                                        <p className="text-xs text-slate-500">Obtenez au moins 80% pour valider et certifier cette formation.</p>
                                                    </div>
                                                </div>

                                                {(() => {
                                                    let quizData = [];
                                                    try {
                                                        quizData = JSON.parse(activeCourse.modules[activeModuleIndex].content);
                                                    } catch (e) {
                                                        console.error(e);
                                                    }

                                                    if (!Array.isArray(quizData) || quizData.length === 0) {
                                                        return <p className="text-sm text-slate-500 italic">Erreur lors de la lecture des questions du QCM.</p>;
                                                    }

                                                    return (
                                                        <div className="space-y-6">
                                                            {quizData.map((q, qidx) => (
                                                                <div key={qidx} className="space-y-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800/60">
                                                                    <p className="font-semibold text-sm text-slate-200">
                                                                        {qidx + 1}. {q.question}
                                                                    </p>
                                                                    <div className="grid md:grid-cols-2 gap-2.5 pl-2 mt-1">
                                                                        {q.options?.map((opt, oidx) => {
                                                                            const isSelected = quizAnswers[qidx] === opt;
                                                                            return (
                                                                                <label 
                                                                                    key={oidx} 
                                                                                    className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                                                                                        isSelected 
                                                                                            ? 'bg-blue-600/10 border-blue-500/80 text-white ring-1 ring-blue-500/30' 
                                                                                            : 'bg-slate-900 border-slate-850 hover:border-slate-700 text-slate-300'
                                                                                    }`}
                                                                                >
                                                                                    <input 
                                                                                        type="radio" 
                                                                                        name={`q-${qidx}`} 
                                                                                        value={opt} 
                                                                                        checked={isSelected}
                                                                                        onChange={() => setQuizAnswers({ ...quizAnswers, [qidx]: opt })}
                                                                                        disabled={quizResult?.passed}
                                                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700" 
                                                                                    />
                                                                                    <span>{opt}</span>
                                                                                </label>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {/* SUCCESS CARD */}
                                                            {quizResult && quizResult.passed && (
                                                                <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 p-5 rounded-xl flex items-start gap-3">
                                                                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                                                                    <div>
                                                                        <h4 className="font-extrabold text-sm text-white">Félicitations ! Vous avez validé ce cours !</h4>
                                                                        <p className="text-xs text-emerald-400/90 mt-0.5">Votre score est de {quizResult.score}% ({quizResult.correctCount} / {quizResult.totalCount} réponses correctes).</p>
                                                                        <p className="text-xs text-slate-400 mt-2">La certification de formation a été enregistrée avec succès dans votre dossier RH.</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* FAIL CARD */}
                                                            {quizResult && !quizResult.passed && (
                                                                <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-5 rounded-xl flex items-start gap-3">
                                                                    <X className="text-rose-400 shrink-0 mt-0.5" size={20} />
                                                                    <div>
                                                                        <h4 className="font-extrabold text-sm text-white font-sans">Validation échouée (Score insuffisant)</h4>
                                                                        <p className="text-xs text-rose-400/90 mt-0.5">Votre score est de {quizResult.score}% ({quizResult.correctCount} / {quizResult.totalCount}). Le seuil minimum requis est de 80%.</p>
                                                                        <button 
                                                                            onClick={() => { setQuizAnswers({}); setQuizResult(null); }}
                                                                            className="text-xs text-white underline mt-3 hover:text-slate-350 block"
                                                                        >
                                                                            Réessayer le QCM
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {!quizResult && (
                                                                <Button 
                                                                    onClick={() => handleValidateQuiz(quizData)} 
                                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold shadow-md"
                                                                >
                                                                    Soumettre mes réponses
                                                                </Button>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            /* REGULAR ARTICLE/VIDEO CONTENT */
                                            <div className="space-y-8">
                                                {activeCourse.modules[activeModuleIndex].mediaUrl && (
                                                    <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner relative group">
                                                        <a 
                                                            href={activeCourse.modules[activeModuleIndex].mediaUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="flex flex-col items-center gap-3 hover:text-blue-400 text-slate-400 transition-colors z-10"
                                                        >
                                                            <PlayCircle size={64} className="text-slate-700 group-hover:text-blue-500 transition-all scale-100 group-hover:scale-105" />
                                                            <span className="font-bold text-sm tracking-wide bg-slate-900/60 py-1.5 px-4 rounded-full border border-slate-800">
                                                                Ouvrir le support externe
                                                            </span>
                                                        </a>
                                                    </div>
                                                )}

                                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-base font-sans whitespace-pre-wrap">
                                                    {activeCourse.modules[activeModuleIndex].content || "Aucun contenu textuel rédigé pour ce chapitre."}
                                                </div>

                                                <div className="pt-8 border-t border-slate-800 flex justify-between items-center">
                                                    <span className="text-xs text-slate-500 font-medium">Lisez attentivement avant de valider le module</span>
                                                    {hasCompletedModule(activeCourse, activeCourse.modules[activeModuleIndex].id) ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3.5 py-2 rounded-xl">
                                                            <Check size={14} /> Chapitre validé
                                                        </span>
                                                    ) : (
                                                        <Button 
                                                            onClick={handleMarkProgress} 
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 rounded-xl font-bold px-6"
                                                        >
                                                            <Check size={16} /> Marquer comme terminé
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="m-auto text-center text-slate-500">Aucun module dans cette formation.</div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* A. ADD COURSE MODAL (LMS MODULE) */}
            <AnimatePresence>
                {isAddCourseModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-lg bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b py-4 px-6">
                                <div><CardTitle className="text-lg">Nouveau cours interactif (LMS)</CardTitle></div>
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsAddCourseModalOpen(false)}><X size={18} /></Button>
                            </CardHeader>
                            <CardContent className="py-6 px-6 space-y-4">
                                <form id="new-course-form" onSubmit={handleAddCourseSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titre du cours</label>
                                        <Input required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} placeholder="Ex: Cybersécurité et Phishing" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formateur référent</label>
                                        <Input required value={courseForm.trainerName} onChange={e => setCourseForm({...courseForm, trainerName: e.target.value})} placeholder="Ex: Jean Dupont (Expert)" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date de publication</label>
                                            <Input required type="date" value={courseForm.date} onChange={e => setCourseForm({...courseForm, date: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume estimé (Heures)</label>
                                            <Input required type="number" step="0.5" value={courseForm.durationHours} onChange={e => setCourseForm({...courseForm, durationHours: e.target.value})} placeholder="Ex: 3" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description générale</label>
                                        <textarea required className="w-full h-24 border border-slate-200 rounded-lg p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} placeholder="Donnez un court aperçu des compétences visées..." />
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter className="bg-slate-50 border-t justify-end p-4 gap-2">
                                <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAddCourseModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="new-course-form" className="bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Initialiser le cours</Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </AnimatePresence>

            {/* B. AI GENERATOR MODAL */}
            <AnimatePresence>
                {isAIGeneratorModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-lg border-2 border-indigo-200 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b py-4 px-6 bg-indigo-50/40">
                                <div>
                                    <CardTitle className="text-indigo-900 flex items-center gap-2">
                                        ✨ Assistant Pédagogique IA (Gemini)
                                    </CardTitle>
                                    <CardDescription>Générez un cours complet structuré avec quiz de validation.</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => !isGenerating && setIsAIGeneratorModalOpen(false)} disabled={isGenerating}><X size={18} /></Button>
                            </CardHeader>
                            <CardContent className="py-6 px-6">
                                <form id="ai-generator-form" onSubmit={handleAIGenerate} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Thème ou sujet de formation</label>
                                        <textarea 
                                            required 
                                            className="w-full min-h-[100px] border border-indigo-150 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none transition-all" 
                                            placeholder="Ex: Les bases de la communication interpersonnelle, ou l'utilisation d'outils collaboratifs." 
                                            value={aiTopic} 
                                            onChange={e => setAiTopic(e.target.value)}
                                            disabled={isGenerating}
                                        />
                                    </div>
                                    {isGenerating && (
                                        <div className="text-xs text-indigo-700 flex flex-col items-center justify-center py-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                            <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                                            L'IA Gemini rédige le programme de formation et crée le QCM interactif...
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                            <CardFooter className="bg-slate-50 border-t justify-end p-4 gap-2">
                                <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAIGeneratorModalOpen(false)} disabled={isGenerating}>Annuler</Button>
                                <Button type="submit" form="ai-generator-form" disabled={isGenerating || !aiTopic} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                                    {isGenerating ? 'Création en cours...' : 'Générer le cours complet'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </AnimatePresence>

            {/* C. ADD SESSION MODAL (HISTORICAL/PHYSICAL TRACE) */}
            <AnimatePresence>
                {isAddSessionModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-2xl bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b py-4 px-6 bg-slate-50/50">
                                <div>
                                    <CardTitle className="text-lg">Tracer une formation au Cahier</CardTitle>
                                    <CardDescription>Enregistrez une formation physique passée ou externe avec la liste des participants.</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsAddSessionModalOpen(false)}><X size={20} /></Button>
                            </CardHeader>

                            <form onSubmit={handleAddSessionSubmit} className="flex flex-col max-h-[80vh]">
                                <CardContent className="p-6 space-y-5 overflow-y-auto flex-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titre du module / Intitulé</label>
                                            <Input required value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} placeholder="Ex: Formation Incendie & Sécurité des Locaux" />
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description (Optionnel)</label>
                                            <Input value={sessionForm.description} onChange={e => setSessionForm({...sessionForm, description: e.target.value})} placeholder="Ex: Sessions de recyclage SST obligatoires." />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organisme de formation / Formateur</label>
                                            <Input required value={sessionForm.trainerName} onChange={e => setSessionForm({...sessionForm, trainerName: e.target.value})} placeholder="Ex: Secourisme CI" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date de formation</label>
                                            <Input required type="date" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume horaire (heures)</label>
                                            <Input required type="number" step="0.5" value={sessionForm.durationHours} onChange={e => setSessionForm({...sessionForm, durationHours: e.target.value})} placeholder="Ex: 7" />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sélectionner les Apprenants participants ({selectedParticipants.length})</label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                                            {employees.map(emp => (
                                                <label 
                                                    key={emp.id} 
                                                    className={`flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer transition-colors ${
                                                        selectedParticipants.includes(emp.id) 
                                                            ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500' 
                                                            : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                                                        checked={selectedParticipants.includes(emp.id)}
                                                        onChange={() => toggleParticipant(emp.id)}
                                                    />
                                                    <div className="overflow-hidden">
                                                        <div className="font-semibold text-xs text-slate-900 truncate">{emp.firstName} {emp.lastName}</div>
                                                        <div className="text-[10px] text-slate-500 truncate">{emp.positionTitle || emp.department}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t bg-slate-50 p-4 justify-end gap-2">
                                    <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAddSessionModalOpen(false)}>Annuler</Button>
                                    <Button type="submit" disabled={selectedParticipants.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                                        Enregistrer la Formation
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
