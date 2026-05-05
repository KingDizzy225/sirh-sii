import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { BookOpen, Video, Award, Clock, PlayCircle, Users, CheckCircle2, Plus, X, Edit, Trash2, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api.js';

export function Learning() {
    const { user } = useAuth();
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR' || user?.role === 'Administrator';

    const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'progress', 'builder', 'player'
    const [courses, setCourses] = useState([]);
    const [employeeProgress, setEmployeeProgress] = useState([]);
    const [notification, setNotification] = useState(null);

    const [activeCourse, setActiveCourse] = useState(null);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchLearningData = async () => {
        try {
            const data = await api.get('/trainings');
            const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-rose-600', 'bg-amber-600'];
            
            const mappedCourses = data.map((c, i) => {
                const isUserEnrolled = c.participations?.some(p => p.employeeId === (user?.employeeId || user?.id));
                const userParticipation = c.participations?.find(p => p.employeeId === (user?.employeeId || user?.id));

                return {
                    ...c,
                    coverBg: colors[i % colors.length],
                    category: 'Catalogue Interne',
                    totalModules: c.modules?.length || 0,
                    timeEst: `${c.durationHours} heures`,
                    activeLearners: c.participations ? c.participations.length : 0,
                    isUserEnrolled,
                    userParticipation
                };
            });
            setCourses(mappedCourses);
            
            let globalProgress = [];
            mappedCourses.forEach(course => {
                if (course.participations) {
                    course.participations.forEach(p => {
                        const completedModulesCount = p.moduleProgresses?.length || 0;
                        globalProgress.push({
                            employeeId: p.employeeId,
                            name: `${p.employee.firstName} ${p.employee.lastName}`,
                            role: p.employee.department,
                            courseId: course.id,
                            modulesCompleted: completedModulesCount,
                            totalModules: course.totalModules || 1,
                            status: p.completionStatus
                        });
                    });
                }
            });
            setEmployeeProgress(globalProgress);
        } catch (err) {
            console.error("Erreur Fetch Learning Data:", err);
        }
    };

    useEffect(() => {
        fetchLearningData();
    }, []);

    // Modals
    const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
    const [courseForm, setCourseForm] = useState({ title: '', description: '', trainerName: '', date: '', durationHours: '' });

    const handleAddCourseSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trainings', {
                title: courseForm.title,
                description: courseForm.description,
                trainerName: courseForm.trainerName,
                date: courseForm.date,
                durationHours: courseForm.durationHours,
                participantIds: []
            });
            setIsAddCourseModalOpen(false);
            setCourseForm({ title: '', description: '', trainerName: '', date: '', durationHours: '' });
            showNotification('Nouveau cours publié !');
            fetchLearningData();
        } catch (err) {
            showNotification('Erreur réseau lors de la création');
        }
    };

    const handleRegister = async (courseId) => {
        try {
            await api.post('/trainings/enroll', { sessionId: courseId });
            showNotification('Inscription réussie !');
            fetchLearningData();
        } catch (err) {
            showNotification('Erreur réseau ou déjà inscrit.');
        }
    };

    // Course Builder Logic
    const [moduleForm, setModuleForm] = useState({ title: '', content: '', mediaUrl: '' });
    const handleAddModule = async () => {
        if (!moduleForm.title) return;
        try {
            await api.post(`/trainings/${activeCourse.id}/modules`, {
                ...moduleForm,
                orderSequence: activeCourse.modules?.length || 0
            });
            showNotification('Module ajouté !');
            setModuleForm({ title: '', content: '', mediaUrl: '' });
            fetchLearningData();
            // refresh activeCourse
            const updated = await api.get('/trainings');
            setActiveCourse(updated.find(c => c.id === activeCourse.id));
        } catch (err) {
            showNotification('Erreur lors de l\'ajout du module.');
        }
    };

    const handleDeleteModule = async (moduleId) => {
        try {
            await api.delete(`/trainings/modules/${moduleId}`);
            showNotification('Module supprimé.');
            fetchLearningData();
            const updated = await api.get('/trainings');
            setActiveCourse(updated.find(c => c.id === activeCourse.id));
        } catch (err) {
            showNotification('Erreur lors de la suppression.');
        }
    };

    // Player Logic
    const handleMarkProgress = async () => {
        const currentModule = activeCourse.modules[activeModuleIndex];
        try {
            await api.post('/trainings/progress', {
                sessionId: activeCourse.id,
                moduleId: currentModule.id
            });
            showNotification('Module validé !');
            fetchLearningData();
            const updated = await api.get('/trainings');
            const updatedCourse = updated.find(c => c.id === activeCourse.id);
            setActiveCourse(updatedCourse);
            // Move to next module if available
            if (activeModuleIndex < updatedCourse.modules.length - 1) {
                setActiveModuleIndex(activeModuleIndex + 1);
            }
        } catch (err) {
            showNotification('Erreur réseau.');
        }
    };

    const calculateOverallProgress = (employeeName) => {
        const enrollments = employeeProgress.filter(ep => ep.name === employeeName);
        if (enrollments.length === 0) return 0;
        let completed = 0;
        let required = 0;
        enrollments.forEach(e => {
            completed += e.modulesCompleted;
            required += e.totalModules;
        });
        if (required === 0) return 0;
        return Math.round((completed / required) * 100);
    };

    const employeeSummaries = Array.from(new Set(employeeProgress.map(ep => ep.name))).map(name => {
        const enrollments = employeeProgress.filter(ep => ep.name === name);
        return {
            name,
            role: enrollments[0].role,
            totalEnrolled: enrollments.length,
            completionPercentage: calculateOverallProgress(name)
        };
    });

    const hasCompletedModule = (course, modId) => {
        const participation = course.participations?.find(p => p.employeeId === (user?.employeeId || user?.id));
        if (!participation) return false;
        return participation.moduleProgresses?.some(mp => mp.moduleId === modId);
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

            {/* Navigation Header only visible in default modes */}
            {(activeTab === 'catalog' || activeTab === 'progress') && (
                <>
                    <div className="flex items-center justify-between space-y-2">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Catalogue de Formations</h2>
                            <p className="text-slate-500 mt-1">Découvrez les modules de formation et suivez la conformité.</p>
                        </div>
                        {isAdminOrHR && activeTab === 'catalog' && (
                            <Button
                                onClick={() => setIsAddCourseModalOpen(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2"
                            >
                                <Plus size={18} /> Nouveau Cours
                            </Button>
                        )}
                    </div>

                    <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max mb-6">
                        <button
                            onClick={() => setActiveTab('catalog')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                        >
                            <BookOpen size={16} /> Catalogue des Cours
                        </button>
                        {isAdminOrHR && (
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'progress' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                            >
                                <Award size={16} /> Suivi Administrateur
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* CATALOG VIEW */}
            {activeTab === 'catalog' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map(course => (
                            <Card key={course.id} className="h-full hover:shadow-md transition-shadow flex flex-col overflow-hidden group">
                                <div className={`h-32 ${course.coverBg} w-full flex items-center justify-center relative`}>
                                    <Video size={48} className="text-white/30" />
                                </div>
                                <CardContent className="p-5 flex-1">
                                    <Badge variant="secondary" className="mb-3">{course.category}</Badge>
                                    <h4 className="text-lg font-bold text-slate-900 leading-tight mb-2">{course.title}</h4>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-4 mb-2">
                                        <div className="flex items-center gap-1.5 shrink-0"><BookOpen size={16} /><span>{course.totalModules} Modules</span></div>
                                        <div className="flex items-center gap-1.5 shrink-0"><Clock size={16} /><span>{course.timeEst}</span></div>
                                        <div className="flex items-center gap-1.5 shrink-0"><Users size={16} /><span>{course.activeLearners} Inscrits</span></div>
                                    </div>
                                    {course.isUserEnrolled && (
                                        <p className="text-sm font-medium text-blue-600 mt-2 flex items-center gap-2">
                                            <CheckCircle2 size={16}/> Inscrit
                                        </p>
                                    )}
                                </CardContent>
                                <CardFooter className="p-5 pt-0 gap-2 flex-col">
                                    {isAdminOrHR && (
                                        <Button variant="outline" className="w-full text-slate-600" onClick={() => { setActiveCourse(course); setActiveTab('builder'); }}>
                                            <Edit size={16} className="mr-2" /> Gérer le Contenu
                                        </Button>
                                    )}
                                    {course.isUserEnrolled ? (
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setActiveCourse(course); setActiveModuleIndex(0); setActiveTab('player'); }}>
                                            <PlayCircle size={16} className="mr-2" /> Suivre le Cours
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="w-full" onClick={() => handleRegister(course.id)}>S'inscrire</Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* PROGRESS VIEW */}
            {activeTab === 'progress' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card>
                        <CardHeader>
                            <CardTitle>Suivi des Apprenants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Employé</th>
                                        <th className="px-4 py-3">Inscriptions</th>
                                        <th className="px-4 py-3">Progression Globale</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeeSummaries.map((emp, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                                            <td className="px-4 py-3 font-medium">{emp.name}</td>
                                            <td className="px-4 py-3 text-center"><Badge variant="blue">{emp.totalEnrolled}</Badge></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-slate-100 h-2 rounded-full"><div className="bg-blue-500 h-full rounded-full" style={{ width: `${emp.completionPercentage}%` }}></div></div>
                                                    <span className="text-xs font-semibold">{emp.completionPercentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* COURSE BUILDER (LMS ADMIN) */}
            {activeTab === 'builder' && activeCourse && (
                <div className="animate-in slide-in-from-right-8 duration-300">
                    <Button variant="ghost" onClick={() => setActiveTab('catalog')} className="mb-4">
                        <ArrowLeft size={16} className="mr-2" /> Retour au catalogue
                    </Button>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle>Structure du Cours</CardTitle>
                                <CardDescription>{activeCourse.title}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {activeCourse.modules?.map((m, i) => (
                                    <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <Badge variant="blue">{i + 1}</Badge>
                                            {m.title}
                                        </div>
                                        <button onClick={() => handleDeleteModule(m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                {activeCourse.modules?.length === 0 && <p className="text-sm text-slate-500">Aucun module.</p>}
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-2">
                            <CardHeader><CardTitle>Ajouter un Module</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Titre du module</label>
                                    <Input value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} placeholder="Ex: Chapitre 1 - Introduction" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Lien externe (Youtube, PDF Drive, etc.)</label>
                                    <Input value={moduleForm.mediaUrl} onChange={e => setModuleForm({...moduleForm, mediaUrl: e.target.value})} placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Contenu texte descriptif</label>
                                    <textarea value={moduleForm.content} onChange={e => setModuleForm({...moduleForm, content: e.target.value})} placeholder="Texte d'accompagnement du module..." className="w-full flex min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
                                </div>
                                <Button onClick={handleAddModule} className="bg-indigo-600 text-white">Ajouter ce module</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* COURSE PLAYER (LMS LEANER) */}
            {activeTab === 'player' && activeCourse && (
                <div className="fixed inset-0 z-[100] bg-slate-900 text-slate-100 flex flex-col md:flex-row">
                    {/* Left Sidebar Plan */}
                    <div className="w-full md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col">
                        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                            <button onClick={() => setActiveTab('catalog')} className="text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
                            <h3 className="font-bold text-lg truncate" title={activeCourse.title}>{activeCourse.title}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-4">Contenu du cours</p>
                            {activeCourse.modules?.map((m, i) => {
                                const isCompleted = hasCompletedModule(activeCourse, m.id);
                                return (
                                    <button 
                                        key={m.id} 
                                        onClick={() => setActiveModuleIndex(i)}
                                        className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${activeModuleIndex === i ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
                                    >
                                        <div className="mt-0.5">
                                            {isCompleted ? <CheckCircle2 size={16} className="text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-600"></div>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-tight">{m.title}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Right Content Area */}
                    <div className="flex-1 flex flex-col bg-slate-900 overflow-y-auto relative p-6 md:p-12">
                        {activeCourse.modules?.length > 0 ? (
                            <div className="max-w-4xl mx-auto w-full space-y-8">
                                <h1 className="text-3xl md:text-4xl font-bold">{activeCourse.modules[activeModuleIndex].title}</h1>
                                {activeCourse.modules[activeModuleIndex].mediaUrl && (
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                                        <a href={activeCourse.modules[activeModuleIndex].mediaUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 hover:text-blue-400 transition-colors">
                                            <PlayCircle size={64} className="text-slate-700" />
                                            <span className="font-medium text-lg">Ouvrir la ressource externe</span>
                                        </a>
                                    </div>
                                )}
                                <div className="prose prose-invert max-w-none text-slate-300">
                                    <p className="whitespace-pre-wrap">{activeCourse.modules[activeModuleIndex].content}</p>
                                </div>
                                <div className="pt-8 border-t border-slate-800 flex justify-end">
                                    <Button onClick={handleMarkProgress} size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                                        <Check size={20} /> Marquer comme terminé
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="m-auto text-center text-slate-500">Aucun module dans ce cours.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Course Modal */}
            <AnimatePresence>
                {isAddCourseModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-lg">
                            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                                <div><CardTitle>Nouveau Cours</CardTitle></div>
                                <Button variant="ghost" size="icon" onClick={() => setIsAddCourseModalOpen(false)}><X size={18} /></Button>
                            </CardHeader>
                            <CardContent className="py-6">
                                <form id="new-course-form" onSubmit={handleAddCourseSubmit} className="space-y-4">
                                    <div><label className="text-sm font-medium">Titre</label><Input required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} /></div>
                                    <div><label className="text-sm font-medium">Formateur</label><Input required value={courseForm.trainerName} onChange={e => setCourseForm({...courseForm, trainerName: e.target.value})} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-sm font-medium">Date</label><Input required type="date" value={courseForm.date} onChange={e => setCourseForm({...courseForm, date: e.target.value})} /></div>
                                        <div><label className="text-sm font-medium">Heures</label><Input required type="number" step="0.5" value={courseForm.durationHours} onChange={e => setCourseForm({...courseForm, durationHours: e.target.value})} /></div>
                                    </div>
                                    <div><label className="text-sm font-medium">Description</label><textarea required className="w-full h-24 border rounded-md p-2" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} /></div>
                                </form>
                            </CardContent>
                            <CardFooter className="bg-slate-50 border-t justify-end p-4">
                                <Button type="submit" form="new-course-form" className="bg-emerald-600 text-white">Créer</Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
