import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { BookOpen, Video, Award, Clock, PlayCircle, Users, CheckCircle2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function Learning() {
    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

    const [activeTab, setActiveTab] = useState('catalog');
    const [courses, setCourses] = useState([]);
    const [employeeProgress, setEmployeeProgress] = useState([]);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchLearningData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/trainings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    
                    const mappedCourses = data.map((c, i) => {
                        const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-rose-600', 'bg-amber-600'];
                        return {
                            ...c,
                            coverBg: colors[i % colors.length],
                            category: 'Catalogue Interne',
                            totalModules: Math.ceil(c.durationHours / 2) || 1,
                            timeEst: `${c.durationHours} heures`,
                            activeLearners: c.participations ? c.participations.length : 0
                        };
                    });
                    setCourses(mappedCourses);
                    
                    let globalProgress = [];
                    mappedCourses.forEach(course => {
                        if (course.participations) {
                            course.participations.forEach(p => {
                                globalProgress.push({
                                    employeeId: p.employeeId,
                                    name: `${p.employee.firstName} ${p.employee.lastName}`,
                                    role: p.employee.department,
                                    courseId: course.id,
                                    modulesCompleted: p.completionStatus === 'Completed' ? course.totalModules : Math.floor(course.totalModules / 2),
                                    status: p.completionStatus
                                });
                            });
                        }
                    });
                    setEmployeeProgress(globalProgress);
                }
            } catch (err) {
                console.error("Erreur Fetch Learning Data:", err);
            }
        };

        if (token) fetchLearningData();
    }, [token]);

    // Modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
    const [assignForm, setAssignForm] = useState({ name: '', courseId: '' });
    const [courseForm, setCourseForm] = useState({ title: '', description: '', trainerName: '', date: '', durationHours: '' });

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddCourseSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/trainings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: courseForm.title,
                    description: courseForm.description,
                    trainerName: courseForm.trainerName,
                    date: courseForm.date,
                    durationHours: courseForm.durationHours,
                    participantIds: []
                })
            });

            if (res.ok) {
                const newCourse = await res.json();
                
                const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-rose-600', 'bg-amber-600'];
                const formattedCourse = {
                    ...newCourse,
                    coverBg: colors[courses.length % colors.length],
                    category: 'Nouveau Catalogue',
                    totalModules: Math.ceil(newCourse.durationHours / 2) || 1,
                    timeEst: `${newCourse.durationHours} heures`,
                    activeLearners: 0
                };
                
                setCourses([formattedCourse, ...courses]);
                setIsAddCourseModalOpen(false);
                setCourseForm({ title: '', description: '', trainerName: '', date: '', durationHours: '' });
                showNotification('Nouveau cours publié avec succès au catalogue !');
            } else {
                showNotification('Erreur réseau lors de la création');
            }
        } catch (err) {
            showNotification('Serveur injoignable');
        }
    };

    const handleAssignSubmit = (e) => {
        e.preventDefault();
        if (!assignForm.name || !assignForm.courseId) {
            showNotification('Veuillez saisir le nom de l\'employé et sélectionner un cours.');
            return;
        }

        const newAssignment = {
            employeeId: `EMP-${Date.now().toString().slice(-3)}`,
            name: assignForm.name,
            role: 'Employé',
            courseId: Number(assignForm.courseId),
            modulesCompleted: 0,
            status: 'Non commencé'
        };

        setEmployeeProgress([...employeeProgress, newAssignment]);
        setIsAssignModalOpen(false);
        setAssignForm({ name: '', courseId: '' });
        showNotification(`Cours attribué avec succès à ${assignForm.name}`);
    };

    const handleRegister = async (courseId) => {
        try {
            const res = await fetch(`${API_URL}/api/trainings/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sessionId: courseId })
            });

            if (res.ok) {
                setCourses(prev => prev.map(c =>
                    c.id === courseId ? { ...c, activeLearners: c.activeLearners + 1 } : c
                ));
                showNotification('Inscription au cours réussie !');
            } else {
                const errData = await res.json();
                showNotification(errData.error || 'Erreur d\'inscription');
            }
        } catch (err) {
            showNotification('Erreur réseau');
        }
    };

    const handleResume = () => {
        showNotification('Reprise du module en cours...');
    };

    const handleViewDetails = (name) => {
        showNotification(`Ouverture du profil de formation pour ${name}`);
    };

    // Calculates overall completion percentage for a given employee across all enrolled courses
    const calculateOverallProgress = (employeeName) => {
        const enrollments = employeeProgress.filter(ep => ep.name === employeeName);
        if (enrollments.length === 0) return 0;

        let totalModulesCompleted = 0;
        let totalModulesRequired = 0;

        enrollments.forEach(enrollment => {
            const course = courses.find(c => c.id === enrollment.courseId);
            if (course) {
                totalModulesCompleted += enrollment.modulesCompleted;
                totalModulesRequired += course.totalModules;
            }
        });

        if (totalModulesRequired === 0) return 0;
        return Math.round((totalModulesCompleted / totalModulesRequired) * 100);
    };

    // Groups summary by unique employees using mock SQL query logic
    const employeeSummaries = Array.from(new Set(employeeProgress.map(ep => ep.name))).map(name => {
        const enrollments = employeeProgress.filter(ep => ep.name === name);
        return {
            name,
            role: enrollments[0].role,
            totalEnrolled: enrollments.length,
            completionPercentage: calculateOverallProgress(name)
        };
    });

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <CheckCircle2 size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals Overlay */}
            <AnimatePresence>
                {isAddCourseModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Publier une Nouvelle Formation</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsAddCourseModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="add-course-form" onSubmit={handleAddCourseSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Titre de la formation</label>
                                        <Input
                                            value={courseForm.title}
                                            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                            placeholder="ex. Management 3.0"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Description</label>
                                        <textarea
                                            value={courseForm.description}
                                            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Description du contenu de la capsule..."
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Nom du Formateur</label>
                                        <Input
                                            value={courseForm.trainerName}
                                            onChange={(e) => setCourseForm({ ...courseForm, trainerName: e.target.value })}
                                            placeholder="ex. Alice Martin"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Date Prévue</label>
                                            <Input
                                                type="date"
                                                value={courseForm.date}
                                                onChange={(e) => setCourseForm({ ...courseForm, date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Durée (Heures)</label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                value={courseForm.durationHours}
                                                onChange={(e) => setCourseForm({ ...courseForm, durationHours: e.target.value })}
                                                placeholder="ex. 2.5"
                                                required
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsAddCourseModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="add-course-form" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">Publier le Cours</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Attribuer une Formation</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsAssignModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="assign-course-form" onSubmit={handleAssignSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Nom de l'Employé</label>
                                        <Input
                                            value={assignForm.name}
                                            onChange={(e) => setAssignForm({ ...assignForm, name: e.target.value })}
                                            placeholder="ex. Michael Dam"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Cours</label>
                                        <select
                                            value={assignForm.courseId}
                                            onChange={(e) => setAssignForm({ ...assignForm, courseId: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="" disabled>Sélectionnez un cours à attribuer</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>{course.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="assign-course-form" className="bg-indigo-600 hover:bg-indigo-700 text-white">Attribuer le Cours</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Catalogue de Formations</h2>
                    <p className="text-slate-500 mt-1">Découvrez les modules de formation et suivez votre conformité.</p>
                </div>
                <div className="flex items-center space-x-2">
                    {isAdminOrHR && activeTab === 'catalog' && (
                        <Button
                            onClick={() => setIsAddCourseModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2"
                        >
                            <Plus size={18} /> Nouveau Cours
                        </Button>
                    )}
                    {activeTab === 'progress' && (
                        <Button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2"
                        >
                            <Plus size={18} /> Attribuer
                        </Button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max mb-6">
                <button
                    onClick={() => setActiveTab('catalog')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                >
                    <BookOpen size={16} /> Catalogue des Cours
                </button>
                <button
                    onClick={() => setActiveTab('progress')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'progress' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                >
                    <Award size={16} /> Suivi Administrateur
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">

                {/* CATALOG TAB (EMPLOYEE VIEW) */}
                {activeTab === 'catalog' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* Featured Course */}
                        <Card className="bg-slate-900 text-white border-0 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                            <CardContent className="p-8 relative z-10">
                                <Badge variant="blue" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 mb-4 border-0">Conformité Requise</Badge>
                                <h3 className="text-2xl font-bold mb-2">Formation Anti-Harcèlement 2026</h3>
                                <p className="text-slate-400 max-w-xl mb-6">Module de formation annuel obligatoire. Veuillez terminer les 4 leçons interactives avant la fin du T3 pour maintenir votre statut de conformité.</p>
                                <div className="flex items-center gap-4">
                                    <Button onClick={handleResume} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 border-0">
                                        <PlayCircle size={18} /> Reprendre le Cours
                                    </Button>
                                    <p className="text-sm font-medium text-slate-400 flex items-center gap-1">
                                        <Clock size={16} /> 1.5 heures restantes
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Cours Disponibles</h3>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map(course => (
                                <motion.div key={course.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                                    <Card className="h-full hover:shadow-md transition-shadow cursor-default overflow-hidden group">
                                        <div className={`h-32 ${course.coverBg} w-full flex items-center justify-center relative`}>
                                            <Video size={48} className="text-white/30" />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                        </div>
                                        <CardContent className="p-5">
                                            <Badge variant="secondary" className="mb-3">{course.category}</Badge>
                                            <h4 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h4>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-4 mb-2">
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <BookOpen size={16} />
                                                    <span>{course.totalModules} Modules</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <Clock size={16} />
                                                    <span>{course.timeEst}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <Users size={16} />
                                                    <span>{course.activeLearners} Inscrits</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-5 pt-0">
                                            <Button variant="outline" className="w-full" onClick={() => handleRegister(course.id)}>S'inscrire</Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ADMIN TRACKER TAB (HR VIEW) */}
                {activeTab === 'progress' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        <Card>
                            <CardHeader>
                                <CardTitle>Progression Globale de la Conformité</CardTitle>
                                <CardDescription>Calcul de la progression pondérée basé sur les modules inscrits vs complétés par le personnel.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3">Nom de l'Employé</th>
                                                <th className="px-4 py-3">Rôle</th>
                                                <th className="px-4 py-3 text-center">Inscriptions Actives</th>
                                                <th className="px-4 py-3 w-[250px]">Complétion Calculée</th>
                                                <th className="px-4 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employeeSummaries.map((emp, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-medium text-slate-900">{emp.name}</td>
                                                    <td className="px-4 py-3 text-slate-500">{emp.role}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge variant="blue" className="font-normal">{emp.totalEnrolled}</Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${emp.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                                    style={{ width: `${emp.completionPercentage}%` }}>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-600 w-8">{emp.completionPercentage}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(emp.name)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">Détails</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                )}

            </div>

        </div>
    );
}
