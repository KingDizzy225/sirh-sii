import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { RequirePermission } from '../components/auth/ProtectedRoute';
import { Plus, Settings, Trash2, Edit2, ListChecks, ArrowRight, UserPlus, UserMinus, PlusCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_TEMPLATES = [
    {
        id: 'TPL-001',
        name: 'Intégration Standard',
        type: 'ONBOARDING',
        description: 'Parcours d\'intégration par défaut pour tous les nouveaux employés.',
        tasks: [
            { id: 'TSK-001', title: 'Créer une adresse e-mail', department: 'IT', relativeDays: -3, description: 'Configuration Google Workspace' },
            { id: 'TSK-002', title: 'Préparer le matériel', department: 'IT', relativeDays: -2, description: 'Installation du PC et de l\'écran au bureau' },
            { id: 'TSK-003', title: 'Signer le contrat de travail', department: 'HR', relativeDays: 0, description: 'Signature requise via Docusign' },
            { id: 'TSK-004', title: 'Visite des locaux & Badge', department: 'Facilities', relativeDays: 1, description: 'Délivrer le badge de sécurité' }
        ]
    },
    {
        id: 'TPL-002',
        name: 'Départ Standard',
        type: 'OFFBOARDING',
        description: 'Procédure standard lorsqu\'un employé quitte l\'entreprise.',
        tasks: [
            { id: 'TSK-005', title: 'Révoquer l\'accès au système', department: 'IT', relativeDays: 0, description: 'Bloquer l\'e-mail, VPN, outils internes' },
            { id: 'TSK-006', title: 'Récupérer le matériel', department: 'IT', relativeDays: 0, description: 'PC, téléphone, badges d\'accès' },
            { id: 'TSK-007', title: 'Entretien de départ', department: 'HR', relativeDays: -1, description: 'Recueillir les retours' }
        ]
    }
];

export function WorkflowBuilder() {
    const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
    const [activeTemplate, setActiveTemplate] = useState(INITIAL_TEMPLATES[0]);
    const [isEditingTask, setIsEditingTask] = useState(null);
    const [newTaskForm, setNewTaskForm] = useState(false);

    // Form inputs state
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDept, setTaskDept] = useState('IT');
    const [taskDays, setTaskDays] = useState(0);

    const [notification, setNotification] = useState(null);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSelectTemplate = (template) => {
        setActiveTemplate(template);
        setNewTaskForm(false);
        setIsEditingTask(null);
    };

    const handleDeleteTask = (taskId) => {
        const updatedTasks = activeTemplate.tasks.filter(t => t.id !== taskId);
        updateActiveTemplateTasks(updatedTasks);
    };

    const updateActiveTemplateTasks = (updatedTasks) => {
        const updatedTemplate = { ...activeTemplate, tasks: updatedTasks };
        setActiveTemplate(updatedTemplate);
        setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    };

    const handleSaveNewTask = () => {
        if (!taskTitle) return;
        const newTask = {
            id: `TSK-NEW-${Math.floor(Math.random() * 10000)}`,
            title: taskTitle,
            department: taskDept,
            relativeDays: parseInt(taskDays, 10) || 0,
            description: ''
        };
        const updatedTasks = [...activeTemplate.tasks, newTask].sort((a, b) => a.relativeDays - b.relativeDays);
        updateActiveTemplateTasks(updatedTasks);
        setNewTaskForm(false);
        setTaskTitle('');
        setTaskDays(0);
    };

    const getDayLabel = (relativeDays, type) => {
        const target = type === 'ONBOARDING' ? 'Date de Début' : 'Date de Fin';
        if (relativeDays === 0) return `Le jour J (Jour 0)`;
        if (relativeDays < 0) return `${Math.abs(relativeDays)} Jours Avant`;
        return `${relativeDays} Jours Après`;
    };

    const getDeptColor = (dept) => {
        const colors = {
            'IT': 'bg-blue-100 text-blue-800',
            'HR': 'bg-purple-100 text-purple-800',
            'Facilities': 'bg-amber-100 text-amber-800',
            'Manager': 'bg-emerald-100 text-emerald-800'
        };
        return colors[dept] || 'bg-slate-100 text-slate-800';
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen relative">
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

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Settings className="text-blue-600 h-8 w-8" />
                        Créateur de Workflow
                    </h2>
                    <p className="text-slate-500 mt-1">Concevez des modèles de tâches automatisés d'intégration et de départ.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                {/* Templates List Sidebar */}
                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-semibold text-slate-800">Modèles Disponibles</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {templates.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => handleSelectTemplate(t)}
                                    className={`p-4 border-b cursor-pointer transition-colors flex items-center justify-between hover:bg-slate-50 ${activeTemplate?.id === t.id ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {t.type === 'ONBOARDING' ? <UserPlus size={14} className="text-emerald-600" /> : <UserMinus size={14} className="text-amber-600" />}
                                            <span className="font-medium text-sm text-slate-800">{t.name}</span>
                                        </div>
                                        <div className="text-xs text-slate-500">{t.tasks.length} tâches standards</div>
                                    </div>
                                    <ArrowRight size={16} className={`text-slate-400 ${activeTemplate?.id === t.id ? 'text-blue-600' : ''}`} />
                                </div>
                            ))}
                            <div className="p-4 bg-slate-50 text-center">
                                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => showNotification("Création d'un nouveau template...")}>
                                    <Plus size={14} className="mr-1" /> Nouveau Modèle
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Workflow Editor */}
                <div className="md:col-span-3">
                    {activeTemplate && (
                        <Card className="min-h-[500px]">
                            <CardHeader className="flex flex-row items-start justify-between bg-slate-50/50 border-b pb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" className={activeTemplate.type === 'ONBOARDING' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                                            {activeTemplate.type}
                                        </Badge>
                                        <h3 className="text-xl font-bold text-slate-900">{activeTemplate.name}</h3>
                                    </div>
                                    <CardDescription>{activeTemplate.description}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => showNotification("Ouverture de l'éditeur de détails...")}>
                                    <Edit2 size={14} className="mr-2" /> Modifier les Détails
                                </Button>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <ListChecks size={18} className="text-slate-400" />
                                        Séquence de Tâches ({activeTemplate.tasks.length})
                                    </h4>
                                    <Button size="sm" onClick={() => setNewTaskForm(true)} className="bg-slate-900 text-white hover:bg-slate-800">
                                        <PlusCircle size={16} className="mr-2" /> Ajouter une Tâche
                                    </Button>
                                </div>

                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    {activeTemplate.tasks.map((task, index) => (
                                        <div key={task.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Timeline dot */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                                                <span className="text-xs font-bold font-mono">{task.relativeDays > 0 ? `+${task.relativeDays}` : task.relativeDays}</span>
                                            </div>

                                            {/* Task Card */}
                                            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:shadow-md transition-all group-hover:border-blue-200">
                                                <CardContent className="p-4 flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <Badge variant="secondary" className={getDeptColor(task.department)}>{task.department}</Badge>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="text-slate-400 hover:text-blue-600 p-1"><Edit2 size={14} /></button>
                                                            <button onClick={() => handleDeleteTask(task.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                    <h5 className="font-bold text-sm text-slate-900">{task.title}</h5>
                                                    <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                                                    <div className="text-xs font-medium text-slate-400 mt-2">
                                                        {getDayLabel(task.relativeDays, activeTemplate.type)}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}

                                    {/* New Task Inline Form */}
                                    {newTaskForm && (
                                        <div className="relative flex items-center justify-center p-6 border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl mt-8">
                                            <div className="w-full max-w-2xl space-y-4">
                                                <h5 className="font-semibold text-blue-900 pb-2 border-b border-blue-200">Créer une Nouvelle Tâche</h5>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2 col-span-2">
                                                        <label className="text-xs font-medium text-blue-800">Titre de la Tâche</label>
                                                        <Input placeholder="ex., Créer un compte VPN" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="bg-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-blue-800">Département Assigné</label>
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            value={taskDept}
                                                            onChange={e => setTaskDept(e.target.value)}
                                                        >
                                                            <option>IT</option>
                                                            <option>HR</option>
                                                            <option>Facilities</option>
                                                            <option>Manager</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-blue-800">Délai (Jours Relatifs)</label>
                                                        <Input type="number" placeholder="0" value={taskDays} onChange={e => setTaskDays(e.target.value)} className="bg-white" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <Button variant="ghost" className="hover:bg-blue-100 text-blue-700" onClick={() => setNewTaskForm(false)}>Annuler</Button>
                                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveNewTask}>Enregistrer au Modèle</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
