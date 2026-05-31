import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
    Search, Filter, SlidersHorizontal, UserCircle, Briefcase, Award, 
    GraduationCap, X, Sparkles, Target, AlertTriangle, Plus, Check, 
    Trash2, UserCheck, TrendingUp, AlertOctagon, GripVertical, CheckCircle2, 
    Clock, Calendar, ShieldAlert, ChevronRight, BarChart2
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { skillsCatalog, getAllSkillsFlat } from '../constants/skillsCatalog';

// Dnd Kit Imports for Succession Planning
import { DndContext, useDraggable, useDroppable, closestCenter } from '@dnd-kit/core';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LEVEL_COLOR = (avg) => {
    const n = parseFloat(avg);
    if (n >= 3.5) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    if (n >= 2.5) return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
    if (n >= 1.5) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
    return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]';
};

const BOX_LABELS = {
    'High-Low': { title: 'L\'Énigme', bg: 'bg-amber-50/90 hover:bg-amber-100/90', border: 'border-amber-200 hover:border-amber-300', text: 'text-amber-800' },
    'High-Medium': { title: 'Haut Potentiel', bg: 'bg-indigo-50/90 hover:bg-indigo-100/90', border: 'border-indigo-200 hover:border-indigo-300', text: 'text-indigo-800' },
    'High-High': { title: 'Futur Leader', bg: 'bg-emerald-100/90 hover:bg-emerald-200/90', border: 'border-emerald-300 hover:border-emerald-400', text: 'text-emerald-900 font-extrabold' },
    
    'Medium-Low': { title: 'Joueur Inconstant', bg: 'bg-orange-50/90 hover:bg-orange-100/90', border: 'border-orange-200 hover:border-orange-300', text: 'text-orange-800' },
    'Medium-Medium': { title: 'Employé Clé', bg: 'bg-sky-50/90 hover:bg-sky-100/90', border: 'border-sky-200 hover:border-sky-300', text: 'text-sky-800' },
    'Medium-High': { title: 'Pilier Constant', bg: 'bg-teal-50/90 hover:bg-teal-100/90', border: 'border-teal-200 hover:border-teal-300', text: 'text-teal-800' },
    
    'Low-Low': { title: 'Sous-performant', bg: 'bg-rose-50/90 hover:bg-rose-100/90', border: 'border-rose-200 hover:border-rose-300', text: 'text-rose-800' },
    'Low-Medium': { title: 'Efficace', bg: 'bg-slate-50/90 hover:bg-slate-100/90', border: 'border-slate-200 hover:border-slate-300', text: 'text-slate-800' },
    'Low-High': { title: 'Expert Local', bg: 'bg-violet-50/90 hover:bg-violet-100/90', border: 'border-violet-200 hover:border-violet-300', text: 'text-violet-800' },
};

const TARGET_ROLES = [
    {
        title: 'Développeur Front-End Senior',
        requirements: {
            'Développement Front-End (React, Vue, Angular)': 4,
            'UI/UX Design': 3,
            'Communication Orale': 3,
            'Résolution de Problèmes': 4,
            'Gestion de Projet (Classique)': 2
        }
    },
    {
        title: 'Lead Tech Software',
        requirements: {
            'Développement Back-End (Node.js, Java, Python, C#)': 4,
            'Développement Front-End (React, Vue, Angular)': 3,
            'Architecture Logicielle': 4,
            'Management d\'Équipe': 3,
            'Résolution de Problèmes': 4
        }
    },
    {
        title: 'Responsable RH (HRBP)',
        requirements: {
            'Recrutement et Sourcing': 4,
            'Droit du Travail': 4,
            'Communication Orale': 4,
            'Gestion des Conflits': 4,
            'GPEC (Gestion Prévisionnelle des Emplois et Compétences)': 3
        }
    }
];

export function SkillsMatrix() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('matrix');
    const [notification, setNotification] = useState(null);

    // Dynamic Lists from Backend
    const [employees, setEmployees] = useState([]);
    const [talents, setTalents] = useState([]);
    const [gpecMap, setGpecMap] = useState([]);
    const [gpecGaps, setGpecGaps] = useState([]);
    const [skillDefinitions, setSkillDefinitions] = useState([]);
    const [successionPlans, setSuccessionPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Selected Employee Detail (Tab 1)
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
    const [compareRole, setCompareRole] = useState(TARGET_ROLES[0].title);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
    const [minLevelFilter, setMinLevelFilter] = useState(3);

    // GPEC sub-tab state (Cartographie, Lacunes, Référentiel)
    const [gpecSubTab, setGpecSubTab] = useState('map');
    const [showSkillForm, setShowSkillForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [skillForm, setSkillForm] = useState({ name: '', category: 'Technique', description: '', criticality: 'Normal' });
    const [assignForm, setAssignForm] = useState({ employeeId: '', skillName: '', proficiencyLevel: 'Débutant' });

    // Succession Plan State
    const [newPlanPos, setNewPlanPos] = useState('');
    const [newPlanDept, setNewPlanDept] = useState('');
    const [newPlanCrit, setNewPlanCrit] = useState('Medium');

    const notify = (m) => { 
        setNotification(m); 
        setTimeout(() => setNotification(null), 3000); 
    };

    // Main loading routine
    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [empData, talentData, mapData, gapsData, defsData, successionData] = await Promise.all([
                fetch(`${API_URL}/api/employees`, { headers }).then(r => r.ok ? r.json() : []),
                fetch(`${API_URL}/api/talents`, { headers }).then(r => r.ok ? r.json() : []),
                fetch(`${API_URL}/api/gpec/map`, { headers }).then(r => r.ok ? r.json() : []),
                fetch(`${API_URL}/api/gpec/gaps`, { headers }).then(r => r.ok ? r.json() : []),
                fetch(`${API_URL}/api/gpec/skill-definitions`, { headers }).then(r => r.ok ? r.json() : []),
                fetch(`${API_URL}/api/succession`, { headers }).then(r => r.ok ? r.json() : [])
            ]);

            setEmployees(empData);
            setTalents(talentData);
            setGpecMap(mapData);
            setGpecGaps(gapsData);
            setSkillDefinitions(defsData);
            setSuccessionPlans(successionData);

            // Select first employee by default if available
            if (empData.length > 0 && !selectedEmployee) {
                setSelectedEmployee(empData[0]);
            }
        } catch (err) {
            console.error("Error loading talents & GPEC data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadAllData();
        }
    }, [token]);

    // Load full details for selected employee in Tab 1
    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            if (!selectedEmployee) return;
            try {
                const res = await fetch(`${API_URL}/api/employees/${selectedEmployee.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSelectedEmployeeDetails(data);
                }
            } catch (err) {
                console.error("Error fetching employee details", err);
            }
        };

        fetchEmployeeDetails();
    }, [selectedEmployee, token]);

    // Helper: Map skill proficiency level strings to integers (1-4)
    const levelMap = { 'Débutant': 1, 'Intermédiaire': 2, 'Avancé': 3, 'Expert': 4 };
    const levelNameMap = { 1: 'Débutant', 2: 'Intermédiaire', 3: 'Avancé', 4: 'Expert' };

    // Format selected employee skills as object key-value
    const selectedEmpSkillsObj = useMemo(() => {
        if (!selectedEmployeeDetails) return {};
        const skillsObj = {};
        if (Array.isArray(selectedEmployeeDetails.skills)) {
            selectedEmployeeDetails.skills.forEach(s => {
                skillsObj[s.skillName] = levelMap[s.proficiencyLevel] || 1;
            });
        }
        return skillsObj;
    }, [selectedEmployeeDetails]);

    // Talent search & skill filtration (Tab 1 Sidebar)
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesText = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (emp.positionTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            // Skill filtration requires mapping GPEC map details or we filter based on backend assignments if loaded
            let matchesSkill = true;
            if (selectedSkillFilter) {
                // Find if employee is in the GPEC map for this skill
                const deptMap = gpecMap.find(d => d.dept === emp.department);
                const skillInfo = deptMap?.skills.find(s => s.skill === selectedSkillFilter);
                if (skillInfo) {
                    // Check count/average or we can load details
                    // For simplified matching, check if employee has details
                    matchesSkill = (skillInfo.count > 0);
                } else {
                    matchesSkill = false;
                }
            }
            return matchesText && matchesSkill;
        });
    }, [employees, searchQuery, selectedSkillFilter, gpecMap]);

    // Recharts data formatter (Tab 1)
    const getRadarData = () => {
        if (!selectedEmployeeDetails) return [];
        const targetRoleReqs = TARGET_ROLES.find(r => r.title === compareRole)?.requirements || {};
        
        // Combine current skills and target role skill requirements
        const allSkillNames = new Set([
            ...Object.keys(selectedEmpSkillsObj),
            ...Object.keys(targetRoleReqs)
        ]);

        return Array.from(allSkillNames).map(skillName => ({
            subject: skillName,
            Actuel: selectedEmpSkillsObj[skillName] || 0,
            Requis: targetRoleReqs[skillName] || 0,
            fullMark: 4
        }));
    };

    // Calculate role compatibility percentage
    const targetCompatibility = useMemo(() => {
        if (!selectedEmployeeDetails || !compareRole) return 0;
        const reqs = TARGET_ROLES.find(r => r.title === compareRole)?.requirements || {};
        const reqKeys = Object.keys(reqs);
        if (reqKeys.length === 0) return 100;

        let totalRequired = 0;
        let totalAcquired = 0;

        reqKeys.forEach(skill => {
            const reqVal = reqs[skill];
            const hasVal = selectedEmpSkillsObj[skill] || 0;
            totalRequired += reqVal;
            // Cap acquired level at required to prevent inflating percentage
            totalAcquired += Math.min(hasVal, reqVal);
        });

        return Math.round((totalAcquired / totalRequired) * 100);
    }, [selectedEmployeeDetails, selectedEmpSkillsObj, compareRole]);

    // HTML5 Drag and Drop for 9-Box
    const handleDragStart9Box = (e, employeeId) => {
        e.dataTransfer.setData('employeeId', employeeId);
    };

    const handleDrop9Box = async (e, targetPotential, targetPerformance) => {
        e.preventDefault();
        const employeeId = e.dataTransfer.getData('employeeId');
        
        // Optimistic UI Update
        setTalents(prev => prev.map(t => 
            t.id === employeeId ? { ...t, potential: targetPotential, performance: targetPerformance } : t
        ));

        const targetEmp = talents.find(t => t.id === employeeId);
        if (targetEmp) {
            try {
                const res = await fetch(`${API_URL}/api/talents/${employeeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        potential: targetPotential,
                        performance: targetPerformance,
                        flightRisk: targetEmp.flightRisk,
                        readiness: targetEmp.readiness
                    })
                });
                if (res.ok) {
                    notify(`9-Box mis à jour pour ${targetEmp.name} !`);
                }
            } catch (err) {
                console.error("Error updating 9-Box grid cell", err);
            }
        }
    };

    const updateTalentField = async (id, field, value) => {
        const targetEmp = talents.find(t => t.id === id);
        if (!targetEmp) return;

        // Optimistic UI Update
        setTalents(prev => prev.map(t => 
            t.id === id ? { ...t, [field]: value } : t
        ));

        try {
            const res = await fetch(`${API_URL}/api/talents/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    potential: targetEmp.potential,
                    performance: targetEmp.performance,
                    flightRisk: field === 'flightRisk' ? value : targetEmp.flightRisk,
                    readiness: field === 'readiness' ? value : targetEmp.readiness
                })
            });
            if (res.ok) {
                notify(`${field === 'flightRisk' ? 'Risque de rétention' : 'Préparation'} mis à jour.`);
            }
        } catch (err) {
            console.error("Error updating talent profile fields", err);
        }
    };

    // GPEC Catalog & Definitions Handlers
    const handleCreateSkillDef = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/gpec/skill-definitions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(skillForm)
            });
            if (res.ok) {
                setShowSkillForm(false);
                setSkillForm({ name: '', category: 'Technique', description: '', criticality: 'Normal' });
                loadAllData();
                notify('Compétence ajoutée au référentiel GPEC !');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignSkill = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/gpec/employee-skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(assignForm)
            });
            if (res.ok) {
                setShowAssignForm(false);
                setAssignForm({ employeeId: '', skillName: '', proficiencyLevel: 'Débutant' });
                loadAllData();
                notify('Compétence assignée au collaborateur !');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSkillDef = async (id) => {
        if (!confirm('Supprimer cette compétence du référentiel GPEC ?')) return;
        try {
            const res = await fetch(`${API_URL}/api/gpec/skill-definitions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                loadAllData();
                notify('Compétence retirée du référentiel.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Succession Planning Handlers
    const handleCreateSuccessionPlan = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/succession`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ positionTitle: newPlanPos, department: newPlanDept, criticality: newPlanCrit })
            });
            if (res.ok) {
                setNewPlanPos('');
                setNewPlanDept('');
                loadAllData();
                notify('Nouveau plan de succession initié !');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSuccessionPlan = async (id) => {
        if (!window.confirm("Supprimer ce plan de succession ?")) return;
        try {
            await fetch(`${API_URL}/api/succession/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadAllData();
            notify('Plan de succession supprimé.');
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddSuccessor = async (planId, employeeId, readiness) => {
        try {
            await fetch(`${API_URL}/api/succession/successors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ planId, employeeId, readiness })
            });
            loadAllData();
            notify('Candidat de succession ajouté.');
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveSuccessor = async (id) => {
        try {
            await fetch(`${API_URL}/api/succession/successors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadAllData();
            notify('Candidat retiré de la succession.');
        } catch (err) {
            console.error(err);
        }
    };

    // Dnd-kit Drag End for Succession Category updates
    const handleDragEndSuccession = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const successorId = active.id;
        const newReadiness = over.id; // 'Ready Now', '1-2 Years', '3+ Years'

        // Optimistic State Update
        const updatedPlans = successionPlans.map(plan => ({
            ...plan,
            successors: plan.successors.map(s => 
                s.id === successorId ? { ...s, readiness: newReadiness } : s
            )
        }));
        setSuccessionPlans(updatedPlans);

        try {
            await fetch(`${API_URL}/api/succession/successors/${successorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ readiness: newReadiness })
            });
            loadAllData();
            notify('Readiness succession mise à jour !');
        } catch (err) {
            console.error(err);
            loadAllData(); // Revert
        }
    };

    const getCritColor = (crit) => {
        if (crit === 'Critical') return 'bg-red-100 text-red-800 border-red-200 shadow-sm';
        if (crit === 'High') return 'bg-amber-100 text-amber-800 border-amber-200';
        if (crit === 'Medium') return 'bg-blue-100 text-blue-800 border-blue-200';
        return 'bg-slate-100 text-slate-800 border-slate-200';
    };

    const catColor = { 'Technique': 'bg-indigo-100 text-indigo-700 border-indigo-200', 'Managérial': 'bg-purple-100 text-purple-700 border-purple-200', 'Transversal': 'bg-teal-100 text-teal-700 border-teal-200' };
    const critColor = { 'Critique': 'bg-red-100 text-red-700 border-red-200', 'Important': 'bg-amber-100 text-amber-700 border-amber-200', 'Normal': 'bg-slate-100 text-slate-600 border-slate-200' };

    return (
        <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-screen flex flex-col h-full relative">
            {/* Notification alert */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, x: '-50%' }} 
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-indigo-300 border border-indigo-500/20 px-6 py-3.5 rounded-xl shadow-[0_10px_30px_rgba(99,102,241,0.2)] flex items-center gap-2.5 backdrop-blur-md"
                    >
                        <Sparkles size={16} className="text-indigo-400 animate-pulse" />
                        <span className="text-sm font-bold text-white tracking-wide">{notification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Award className="text-indigo-600 h-9 w-9" />
                        Talents, GPEC & Succession
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">Un portail RH unifié d'exploration de carrière, cartographie des compétences et pilotage de la relève.</p>
                </div>
                
                {/* Stats overview in header */}
                <div className="flex gap-4 shrink-0 overflow-x-auto pb-1">
                    <div className="bg-white/80 border border-slate-100 rounded-xl p-3 shadow-sm flex items-center gap-3 min-w-[140px]">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><Target size={18} /></div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase">GPEC Gaps</div>
                            <div className="text-lg font-black text-slate-800">{gpecGaps.length}</div>
                        </div>
                    </div>
                    <div className="bg-white/80 border border-slate-100 rounded-xl p-3 shadow-sm flex items-center gap-3 min-w-[140px]">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><TrendingUp size={18} /></div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase">9-Box Évalués</div>
                            <div className="text-lg font-black text-slate-800">{talents.length}</div>
                        </div>
                    </div>
                    <div className="bg-white/80 border border-slate-100 rounded-xl p-3 shadow-sm flex items-center gap-3 min-w-[140px]">
                        <div className="p-2 rounded-lg bg-violet-50 text-violet-600"><UserCheck size={18} /></div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase">Plans Actifs</div>
                            <div className="text-lg font-black text-slate-800">{successionPlans.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-slate-200/80 mb-6 gap-1 overflow-x-auto shrink-0 bg-slate-100/50 p-1 rounded-xl">
                {[
                    { id: 'matrix', label: 'Matrice & Écarts', icon: Award },
                    { id: 'gpec', label: 'Cartographie GPEC', icon: Target },
                    { id: '9box', label: 'Matrice 9-Box', icon: TrendingUp },
                    { id: 'succession', label: 'Plan de Succession', icon: UserCheck },
                    { id: 'retention', label: 'Risques de Rétention', icon: AlertOctagon }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2.5 px-5 py-3 rounded-lg text-sm font-bold tracking-wide transition-all uppercase whitespace-nowrap",
                                isActive 
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 scale-100" 
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                            )}
                        >
                            <Icon size={18} className={isActive ? "text-indigo-400" : "text-slate-400"} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* MAIN CONTAINER */}
            <div className="flex-1 min-h-0">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center p-12 text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                            <span className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></span>
                            <span className="text-sm font-semibold">Synchronisation des données talents...</span>
                        </div>
                    </div>
                ) : (
                    <div className="h-full">
                        {/* TAB 1: MATRICE & ECARTS */}
                        {activeTab === 'matrix' && (
                            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
                                {/* Left search sidebar */}
                                <Card className="lg:w-1/3 flex flex-col shrink-0 border-slate-200/80 bg-white/70 backdrop-blur-md shadow-sm">
                                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                                        <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                                            <Search size={18} className="text-slate-500" /> Vivier de Talents
                                        </CardTitle>
                                        <CardDescription>Rechercher des profils et filtrer par compétences</CardDescription>

                                        <div className="mt-4 space-y-3">
                                            <div className="relative">
                                                <Input
                                                    placeholder="Rechercher par nom, rôle..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="bg-white border-slate-200/80 pl-9"
                                                />
                                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            </div>

                                            <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-2.5">
                                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    <Filter size={14} className="text-indigo-600" /> Filtre de Compétence
                                                </div>
                                                <select
                                                    className="w-full text-xs font-semibold border-slate-200 rounded-md bg-slate-50 p-2 outline-none focus:ring-1 focus:ring-indigo-500"
                                                    value={selectedSkillFilter}
                                                    onChange={(e) => setSelectedSkillFilter(e.target.value)}
                                                >
                                                    <option value="">Toutes les compétences</option>
                                                    {skillsCatalog.map((cat, idx) => (
                                                        <optgroup key={idx} label={cat.category}>
                                                            {cat.skills.map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>

                                                {selectedSkillFilter && (
                                                    <div className="flex items-center gap-3 pt-2">
                                                        <span className="text-[10px] font-bold text-slate-500 w-24">Niveau Min. ({minLevelFilter}/4)</span>
                                                        <input
                                                            type="range"
                                                            min="1" max="4"
                                                            value={minLevelFilter}
                                                            onChange={(e) => setMinLevelFilter(parseInt(e.target.value))}
                                                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 overflow-y-auto p-0 max-h-[400px] lg:max-h-[500px]">
                                        {filteredEmployees.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-sm">
                                                <Search className="mx-auto mb-2 opacity-20" size={32} />
                                                Aucun collaborateur ne correspond à ces critères.
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {filteredEmployees.map(emp => (
                                                    <div
                                                        key={emp.id}
                                                        onClick={() => setSelectedEmployee(emp)}
                                                        className={cn(
                                                            "p-4 cursor-pointer hover:bg-slate-50/50 transition-all border-l-4",
                                                            selectedEmployee?.id === emp.id 
                                                                ? 'bg-indigo-50/30 border-l-indigo-600' 
                                                                : 'border-l-transparent'
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 text-sm">{emp.firstName} {emp.lastName}</h4>
                                                                <div className="text-xs text-slate-500 font-medium mt-0.5">{emp.positionTitle}</div>
                                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">{emp.department}</div>
                                                            </div>
                                                            <ChevronRight size={16} className="text-slate-300 mt-1" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Right Side: Radar Chart & Detail */}
                                <Card className="flex-1 bg-white border-slate-200/80 shadow-sm flex flex-col">
                                    {selectedEmployeeDetails ? (
                                        <>
                                            <CardHeader className="border-b bg-white pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex gap-4 items-center">
                                                    <div className="h-14 w-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200">
                                                        {selectedEmployeeDetails.firstName[0]}{selectedEmployeeDetails.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl font-black text-slate-800">{selectedEmployeeDetails.firstName} {selectedEmployeeDetails.lastName}</CardTitle>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs font-semibold text-slate-500">
                                                            <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400" /> {selectedEmployeeDetails.positionTitle}</span>
                                                            <span className="flex items-center gap-1.5"><UserCircle size={14} className="text-slate-400" /> {selectedEmployeeDetails.department}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 min-w-[260px] self-start sm:self-center">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Rôle Cible pour Écart</label>
                                                    <select
                                                        className="w-full text-xs font-bold bg-white border-slate-200 rounded p-1.5 text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                                                        value={compareRole}
                                                        onChange={(e) => setCompareRole(e.target.value)}
                                                    >
                                                        {TARGET_ROLES.map(role => (
                                                            <option key={role.title} value={role.title}>{role.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                                                {/* Recharts radar container */}
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
                                                    <div className="h-[280px] sm:h-[320px] w-full bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-center p-2">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getRadarData()}>
                                                                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                                                                <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 9 }} tickCount={5} />

                                                                <Radar
                                                                    name="Collaborateur"
                                                                    dataKey="Actuel"
                                                                    stroke="#6366f1"
                                                                    fill="#818cf8"
                                                                    fillOpacity={0.4}
                                                                    activeDot={{ r: 5 }}
                                                                />
                                                                {compareRole && (
                                                                    <Radar
                                                                        name="Cible"
                                                                        dataKey="Requis"
                                                                        stroke="#10b981"
                                                                        fill="#34d399"
                                                                        fillOpacity={0.15}
                                                                        strokeDasharray="4 4"
                                                                    />
                                                                )}
                                                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                                                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold' }} />
                                                            </RadarChart>
                                                        </ResponsiveContainer>
                                                    </div>

                                                    {/* Compatibility index visual */}
                                                    <div className="bg-slate-900 rounded-2xl text-white p-6 relative overflow-hidden flex flex-col justify-between h-full min-h-[280px] shadow-lg">
                                                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                                            <Award size={140} className="text-white" />
                                                        </div>
                                                        <div className="relative z-10">
                                                            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Indice de matching de rôle</span>
                                                            <div className="flex items-baseline gap-2 mt-2">
                                                                <span className="text-5xl font-black text-white">{targetCompatibility}%</span>
                                                                <span className="text-xs text-slate-400 font-bold">d'adéquation</span>
                                                            </div>
                                                            <p className="text-xs text-slate-300 mt-3 font-medium leading-relaxed">
                                                                Cet indice reflète la couverture des compétences requises pour le poste de <strong>{compareRole}</strong>.
                                                            </p>
                                                        </div>

                                                        {/* Progress bar matching */}
                                                        <div className="mt-4 relative z-10">
                                                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                                                                    style={{ width: `${targetCompatibility}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                                                            <div>
                                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Poste Cible</div>
                                                                <div className="text-xs font-bold text-white truncate max-w-[150px]">{compareRole}</div>
                                                            </div>
                                                            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] uppercase font-bold py-1 px-2">Gemini AI Engine</Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Detailed competency list */}
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                                                        <GraduationCap size={16} className="text-slate-400" /> Détail des compétences et écarts
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {selectedEmployeeDetails.skills && selectedEmployeeDetails.skills.length > 0 ? (
                                                            selectedEmployeeDetails.skills.map(s => {
                                                                const levelVal = levelMap[s.proficiencyLevel] || 1;
                                                                const targetLevelVal = compareRole ? (TARGET_ROLES.find(r => r.title === compareRole)?.requirements[s.skillName] || 0) : 0;
                                                                const isGap = compareRole && targetLevelVal > levelVal;

                                                                return (
                                                                    <div key={s.id} className={cn(
                                                                        "p-3.5 rounded-xl border flex items-center justify-between transition-all",
                                                                        isGap ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-slate-200'
                                                                    )}>
                                                                        <div>
                                                                            <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                                                                {s.skillName}
                                                                                {isGap && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] px-1 py-0.5">Écart de {targetLevelVal - levelVal}</Badge>}
                                                                            </div>
                                                                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Niveau Cible Requis : {targetLevelVal || 'Non requis'}</div>
                                                                        </div>
                                                                        <Badge className={cn("font-bold text-xs uppercase py-1 px-2.5", isGap ? "bg-amber-200 text-amber-900" : "bg-indigo-50 text-indigo-700")}>
                                                                            {s.proficiencyLevel}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="col-span-2 p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                                                                Aucune compétence assignée à ce collaborateur. Utilisez l'onglet « Cartographie GPEC » pour assigner des compétences.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Training Recommendations Module */}
                                                {compareRole && (
                                                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
                                                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                                            <Sparkles size={16} /> Recommandations IA de Développement de Carrière
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-3">
                                                                <p className="text-xs text-slate-300 italic font-medium">
                                                                    "Afin de promouvoir {selectedEmployeeDetails.firstName} au poste de {compareRole}, l'IA recommande les parcours de formation suivants :"
                                                                </p>
                                                                <div className="space-y-2">
                                                                    {[
                                                                        "Atelier d'excellence technique avancée",
                                                                        "Coaching individuel en soft-skills & collaboration",
                                                                        "Certification métier validante (niveau 4)"
                                                                    ].map((rec, i) => (
                                                                        <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5 text-[11px] font-semibold text-slate-200">
                                                                            <span className="text-emerald-400">✓</span> {rec}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between">
                                                                <div>
                                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Potentiel Impact de matching</div>
                                                                    <div className="text-3xl font-black text-indigo-400 mt-1">+35%</div>
                                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">Si les formations préconisées sont validées.</p>
                                                                </div>
                                                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 mt-4 rounded-lg border border-indigo-500/20">
                                                                    Inscrire au plan de formation
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-full min-h-[300px]">
                                            <Award className="h-16 w-16 mb-4 text-slate-200" />
                                            <h3 className="text-lg font-bold text-slate-600 mb-1">Aucun Collaborateur Sélectionné</h3>
                                            <p className="max-w-sm text-xs font-medium text-slate-400">Sélectionnez un employé dans la liste de gauche pour analyser son profil de compétences et ses écarts.</p>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}

                        {/* TAB 2: CARTOGRAPHIE GPEC */}
                        {activeTab === 'gpec' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                                    {/* Sub-tabs GPEC selector */}
                                    <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                                        {[
                                            { id: 'map', label: '🗺️ Cartographie' },
                                            { id: 'gaps', label: `⚠️ Lacunes (${gpecGaps.length})` },
                                            { id: 'defs', label: '📚 Référentiel GPEC' }
                                        ].map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => setGpecSubTab(sub.id)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap",
                                                    gpecSubTab === sub.id 
                                                        ? "bg-white text-slate-900 shadow-sm" 
                                                        : "text-slate-500 hover:text-slate-800"
                                                )}
                                            >
                                                {sub.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={() => setShowAssignForm(true)} 
                                            variant="outline" 
                                            className="text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 gap-1.5 text-xs font-bold"
                                        >
                                            <UserCheck size={14} /> Assigner Compétence
                                        </Button>
                                        <Button 
                                            onClick={() => setShowSkillForm(true)} 
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs font-bold"
                                        >
                                            <Plus size={14} /> Référencer Compétence
                                        </Button>
                                    </div>
                                </div>

                                {/* GPEC Sub-Tab: Cartographie */}
                                {gpecSubTab === 'map' && (
                                    <div className="space-y-4">
                                        {gpecMap.length === 0 ? (
                                            <Card className="shadow-sm border-slate-200 bg-white">
                                                <CardContent className="p-10 text-center text-slate-400 text-xs">
                                                    Aucune compétence employé enregistrée dans la base. Utilisez le bouton d'assignation pour commencer.
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            gpecMap.map((dept) => (
                                                <Card key={dept.dept} className="shadow-sm border-slate-200/80 bg-white hover:shadow-md transition-all">
                                                    <CardContent className="p-5">
                                                        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 mb-3 uppercase tracking-wider">{dept.dept}</h3>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {dept.skills.map(s => (
                                                                <div 
                                                                    key={s.skill} 
                                                                    className="relative group flex items-center gap-2 bg-slate-50 hover:bg-slate-100 rounded-lg px-3 py-2 border border-slate-200/60 transition-colors"
                                                                >
                                                                    <div className={`w-2.5 h-2.5 rounded-full ${LEVEL_COLOR(s.avgLevel)}`} />
                                                                    <span className="text-xs font-bold text-slate-700">{s.skill}</span>
                                                                    <span className="text-[10px] text-slate-400 font-bold">({s.count} collaborateurs)</span>
                                                                    
                                                                    {/* Tooltip on hover */}
                                                                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 shadow-md whitespace-nowrap pointer-events-none transition-all z-20">
                                                                        Moyenne : {s.avgLevel}/4 ({s.count} évalués)
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}

                                        <div className="flex items-center flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm w-fit">
                                            Légende GPEC :
                                            {[['bg-emerald-500','Expert (≥3.5)'],['bg-blue-500','Avancé (≥2.5)'],['bg-amber-400','Intermédiaire (≥1.5)'],['bg-red-400','Débutant (<1.5)']].map(([c, l]) => (
                                                <span key={l} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full inline-block ${c}`} />{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* GPEC Sub-Tab: Lacunes (Gaps) */}
                                {gpecSubTab === 'gaps' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {gpecGaps.length === 0 ? (
                                            <Card className="col-span-2 shadow-sm border-emerald-200 bg-emerald-50/50">
                                                <CardContent className="p-8 text-center text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="text-emerald-500" />
                                                    Aucune lacune critique détectée ! Toutes les compétences clés disposent d'un nombre suffisant d'experts.
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            gpecGaps.map((gap, i) => (
                                                <Card key={gap.skill} className="shadow-sm border-red-200/80 bg-red-50/30">
                                                    <CardContent className="p-4 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={18} /></div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm">{gap.skill}</p>
                                                                <p className="text-xs text-slate-500 font-medium">{gap.category} · Seulement {gap.experts} expert(s) actifs</p>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] uppercase font-bold py-1 px-2.5 shrink-0">Critique</Badge>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* GPEC Sub-Tab: Skill Definitions / Référentiel */}
                                {gpecSubTab === 'defs' && (
                                    <Card className="shadow-sm border-slate-200/80 bg-white">
                                        <CardContent className="p-0 overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                                        {['Compétence','Catégorie','Criticité','Description','Action'].map(h => (
                                                            <th key={h} className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {skillDefinitions.map(d => (
                                                        <tr key={d.id} className="hover:bg-slate-50/30">
                                                            <td className="p-4 font-bold text-slate-800 text-sm">{d.name}</td>
                                                            <td className="p-4">
                                                                <Badge className={cn("text-[10px] uppercase font-bold py-0.5 px-2 border", catColor[d.category] || '')}>
                                                                    {d.category}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4">
                                                                <Badge className={cn("text-[10px] uppercase font-bold py-0.5 px-2 border", critColor[d.criticality] || '')}>
                                                                    {d.criticality}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 text-slate-500 text-xs font-medium max-w-[280px] truncate">{d.description || '—'}</td>
                                                            <td className="p-4">
                                                                <button 
                                                                    onClick={() => handleDeleteSkillDef(d.id)} 
                                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg bg-transparent border-0 cursor-pointer"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {!skillDefinitions.length && (
                                                        <tr>
                                                            <td colSpan={5} className="p-10 text-center text-slate-400 text-xs font-medium">
                                                                Aucune compétence enregistrée dans le référentiel GPEC.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* TAB 3: MATRICE 9-BOX */}
                        {activeTab === '9box' && (
                            <div className="space-y-6">
                                <Card className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 overflow-x-auto">
                                    <div className="flex text-center font-black text-slate-400 text-xs uppercase tracking-wider mb-3">
                                        <div className="w-14 shrink-0"></div>
                                        <div className="flex-1 py-1">Performance Faible</div>
                                        <div className="flex-1 py-1 border-x border-slate-100">Performance Moyenne</div>
                                        <div className="flex-1 py-1">Performance Élevée</div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-4">
                                        {['High', 'Medium', 'Low'].map((pot) => (
                                            <div key={pot} className="flex min-w-max gap-4">
                                                <div className="w-14 shrink-0 flex items-center justify-center font-black text-slate-400 text-xs uppercase tracking-widest -rotate-90">
                                                    Potentiel {pot === 'High' ? 'Élevé' : pot === 'Medium' ? 'Moyen' : 'Faible'}
                                                </div>
                                                {['Low', 'Medium', 'High'].map((perf) => {
                                                    const cellId = `${pot}-${perf}`;
                                                    const boxInfo = BOX_LABELS[cellId] || { title: cellId, bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-800' };
                                                    const cellTalents = talents.filter(t => t.potential === pot && t.performance === perf);

                                                    return (
                                                        <div 
                                                            key={perf}
                                                            className={cn(
                                                                "flex-1 min-w-[280px] min-h-[160px] rounded-2xl border-2 p-4 flex flex-col transition-all duration-300",
                                                                boxInfo.border, boxInfo.bg
                                                            )}
                                                            onDragOver={(e) => e.preventDefault()}
                                                            onDrop={(e) => handleDrop9Box(e, pot, perf)}
                                                        >
                                                            <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-black/5">
                                                                <span className={cn("text-xs font-black uppercase tracking-wider", boxInfo.text)}>
                                                                    {boxInfo.title}
                                                                </span>
                                                                <Badge className="bg-white/70 border-0 shadow-none text-slate-600 text-[10px] font-bold">
                                                                    {cellTalents.length}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[160px]">
                                                                {cellTalents.map(emp => (
                                                                    <div 
                                                                        key={emp.id}
                                                                        draggable
                                                                        onDragStart={(e) => handleDragStart9Box(e, emp.id)}
                                                                        className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-sm border border-black/5 text-xs flex items-center justify-between cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-md transition-all group"
                                                                    >
                                                                        <div className="truncate max-w-[200px]">
                                                                            <div className="font-extrabold text-slate-800">{emp.name}</div>
                                                                            <div className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{emp.position}</div>
                                                                        </div>
                                                                        <GripVertical size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 ml-2" />
                                                                    </div>
                                                                ))}
                                                                {cellTalents.length === 0 && (
                                                                    <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-400 italic">
                                                                        Déposer un profil
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <div className="p-4 bg-slate-900 text-slate-400 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
                                    <Sparkles size={16} className="text-indigo-400 shrink-0" />
                                    <span>
                                        <strong>Interface interactive</strong> : Glissez-déposez un collaborateur entre les quadrants pour ajuster en temps réel son profil d'évaluation de talent.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: PLAN DE SUCCESSION */}
                        {activeTab === 'succession' && (
                            <DndContext onDragEnd={handleDragEndSuccession} collisionDetection={closestCenter}>
                                <div className="grid gap-6 lg:grid-cols-4 items-start">
                                    {/* Create Succession Plan Form */}
                                    <Card className="lg:col-span-1 shadow-sm border-slate-200/80 bg-white/70 backdrop-blur-md h-fit sticky top-6">
                                        <CardHeader>
                                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                                <Target size={18} className="text-indigo-600" /> Nouveau Poste Critique
                                            </CardTitle>
                                            <CardDescription>Définir un poste clé à risques</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleCreateSuccessionPlan} className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intitulé du Poste</label>
                                                    <Input 
                                                        required 
                                                        value={newPlanPos} 
                                                        onChange={e => setNewPlanPos(e.target.value)} 
                                                        placeholder="Ex: Directeur Technique" 
                                                        className="mt-1 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Département</label>
                                                    <Input 
                                                        required 
                                                        value={newPlanDept} 
                                                        onChange={e => setNewPlanDept(e.target.value)} 
                                                        placeholder="Ex: R&D" 
                                                        className="mt-1 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Niveau de Criticité</label>
                                                    <select 
                                                        className="w-full text-xs font-bold border-slate-200 rounded-md p-2.5 mt-1 bg-white outline-none focus:ring-1 focus:ring-indigo-500" 
                                                        value={newPlanCrit} 
                                                        onChange={e => setNewPlanCrit(e.target.value)}
                                                    >
                                                        <option value="Low">Faible</option>
                                                        <option value="Medium">Moyen</option>
                                                        <option value="High">Élevé</option>
                                                        <option value="Critical">Critique</option>
                                                    </select>
                                                </div>
                                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-md shadow-indigo-600/10">
                                                    Activer le Plan
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>

                                    {/* Plans Grid */}
                                    <div className="lg:col-span-3 space-y-6">
                                        {successionPlans.map(plan => (
                                            <Card key={plan.id} className="shadow-sm border-slate-200/80 bg-white overflow-hidden hover:shadow-md transition-shadow">
                                                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-4">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle className="text-base font-bold text-slate-800">{plan.positionTitle}</CardTitle>
                                                            <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider py-0.5 px-2", getCritColor(plan.criticality))}>
                                                                {plan.criticality}
                                                            </Badge>
                                                        </div>
                                                        <CardDescription className="text-xs mt-0.5 font-medium">{plan.department}</CardDescription>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleDeleteSuccessionPlan(plan.id)} 
                                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-0 bg-slate-50/20">
                                                    <div className="grid md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-slate-100">
                                                        {/* Ready Now Category */}
                                                        <DroppableSuccessionCategory 
                                                            id="Ready Now" 
                                                            title="Prêt Immédiatement" 
                                                            icon={<CheckCircle2 size={15} className="text-emerald-500" />}
                                                            successors={plan.successors.filter(s => s.readiness === 'Ready Now')}
                                                            onRemove={handleRemoveSuccessor}
                                                            renderAdd={() => (
                                                                <AddSuccessorMenu 
                                                                    planId={plan.id} 
                                                                    readiness="Ready Now" 
                                                                    employees={employees} 
                                                                    currentSuccessors={plan.successors} 
                                                                    onAdd={handleAddSuccessor} 
                                                                />
                                                            )}
                                                        />

                                                        {/* 1-2 Years Category */}
                                                        <DroppableSuccessionCategory 
                                                            id="1-2 Years" 
                                                            title="Prêt (1-2 ans)" 
                                                            icon={<Clock size={15} className="text-blue-500" />}
                                                            successors={plan.successors.filter(s => s.readiness === '1-2 Years')}
                                                            onRemove={handleRemoveSuccessor}
                                                            renderAdd={() => (
                                                                <AddSuccessorMenu 
                                                                    planId={plan.id} 
                                                                    readiness="1-2 Years" 
                                                                    employees={employees} 
                                                                    currentSuccessors={plan.successors} 
                                                                    onAdd={handleAddSuccessor} 
                                                                />
                                                            )}
                                                        />

                                                        {/* 3+ Years Category */}
                                                        <DroppableSuccessionCategory 
                                                            id="3+ Years" 
                                                            title="Horizon 3 ans+" 
                                                            icon={<Calendar size={15} className="text-amber-500" />}
                                                            successors={plan.successors.filter(s => s.readiness === '3+ Years')}
                                                            onRemove={handleRemoveSuccessor}
                                                            renderAdd={() => (
                                                                <AddSuccessorMenu 
                                                                    planId={plan.id} 
                                                                    readiness="3+ Years" 
                                                                    employees={employees} 
                                                                    currentSuccessors={plan.successors} 
                                                                    onAdd={handleAddSuccessor} 
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {successionPlans.length === 0 && (
                                            <div className="p-12 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                                                Aucun plan de succession défini. Renseignez un poste critique dans le formulaire de gauche.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DndContext>
                        )}

                        {/* TAB 5: RISQUES DE RETENTION */}
                        {activeTab === 'retention' && (
                            <Card className="shadow-sm border-slate-200/80 bg-white overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                                    <CardTitle className="text-base font-bold text-slate-800">
                                        Analyse de la Rétention & Risques de Départs
                                    </CardTitle>
                                    <CardDescription>
                                        Suivi des indicateurs d'engagement et mise à jour directe du risque d'attrition (flight risk).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/30 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                            <tr>
                                                <th className="p-4">Collaborateur</th>
                                                <th className="p-4">Poste & Département</th>
                                                <th className="p-4">Score Performance / Potentiel</th>
                                                <th className="p-4">Risque de Attrition</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm font-medium">
                                            {talents.map(emp => (
                                                <tr key={emp.id} className="hover:bg-slate-50/30">
                                                    <td className="p-4 text-slate-900 font-bold">{emp.name}</td>
                                                    <td className="p-4 text-slate-500 font-semibold text-xs">
                                                        <div>{emp.position}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{emp.department}</div>
                                                    </td>
                                                    <td className="p-4 text-xs font-bold text-slate-700">
                                                        Perf: <span className="text-indigo-600">{emp.performance}</span> | Pot: <span className="text-violet-600">{emp.potential}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <select
                                                            value={emp.flightRisk}
                                                            onChange={(e) => updateTalentField(emp.id, 'flightRisk', e.target.value)}
                                                            className={cn(
                                                                "text-xs font-bold rounded-lg px-3 py-1.5 border outline-none",
                                                                emp.flightRisk === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                                emp.flightRisk === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            )}
                                                        >
                                                            <option value="High">🚨 ÉLEVÉ (Alerte)</option>
                                                            <option value="Medium">⚡ MOYEN</option>
                                                            <option value="Low">✔ FAIBLE</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                            {talents.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-10 text-center text-slate-400 text-xs font-medium">
                                                        Aucun profil talent enregistré pour l'évaluation des risques.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {/* Modal: New Competence Definition */}
            {showSkillForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
                    >
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-slate-900 to-indigo-950 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Créer une compétence GPEC</h3>
                            <button onClick={() => setShowSkillForm(false)} className="text-white hover:text-slate-200 bg-transparent border-0 cursor-pointer"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreateSkillDef} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Sélection standard</label>
                                <select 
                                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold mb-3 bg-slate-50"
                                    onChange={e => {
                                        const val = e.target.value;
                                        if(!val) return;
                                        const list = getAllSkillsFlat();
                                        const obj = list.find(s => s.skill === val);
                                        let cat = 'Technique';
                                        if (obj?.category.includes('Soft Skills')) cat = 'Transversal';
                                        else if (obj?.category.includes('Management')) cat = 'Managérial';
                                        setSkillForm({ ...skillForm, name: val, category: cat });
                                    }}
                                >
                                    <option value="">Sélectionner depuis le catalogue général...</option>
                                    {skillsCatalog.map((cat, idx) => (
                                        <optgroup key={idx} label={cat.category}>
                                            {cat.skills.map(s => <option key={s} value={s}>{s}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Nom de la compétence</label>
                                <Input required value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} placeholder="Saisir ou modifier le nom..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Catégorie</label>
                                    <select value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold bg-white">
                                        <option value="Technique">Technique</option>
                                        <option value="Managérial">Managérial</option>
                                        <option value="Transversal">Transversal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Criticité</label>
                                    <select value={skillForm.criticality} onChange={e => setSkillForm({...skillForm, criticality: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold bg-white">
                                        <option value="Normal">Normal</option>
                                        <option value="Important">Important</option>
                                        <option value="Critique">Critique</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Description</label>
                                <textarea rows={2.5} value={skillForm.description} onChange={e => setSkillForm({...skillForm, description: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold resize-none bg-slate-50" />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button type="button" variant="outline" onClick={() => setShowSkillForm(false)} className="text-xs font-bold">Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold">Confirmer</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal: Assign Skill to Employee */}
            {showAssignForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
                    >
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-slate-900 to-indigo-950 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Assigner compétence collaborateur</h3>
                            <button onClick={() => setShowAssignForm(false)} className="text-white hover:text-slate-200 bg-transparent border-0 cursor-pointer"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleAssignSkill} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Employé</label>
                                <select required value={assignForm.employeeId} onChange={e => setAssignForm({...assignForm, employeeId: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold bg-white">
                                    <option value="">Sélectionner un collaborateur...</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName} - {e.department}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Compétence du référentiel</label>
                                <select required value={assignForm.skillName} onChange={e => setAssignForm({...assignForm, skillName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold bg-white">
                                    <option value="">Choisir une compétence référencée...</option>
                                    {skillDefinitions.map(d => (
                                        <option key={d.id} value={d.name}>{d.name} ({d.category})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Niveau d'Expertise</label>
                                <select required value={assignForm.proficiencyLevel} onChange={e => setAssignForm({...assignForm, proficiencyLevel: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold bg-white">
                                    <option value="Débutant">Débutant (Niveau 1)</option>
                                    <option value="Intermédiaire">Intermédiaire (Niveau 2)</option>
                                    <option value="Avancé">Avancé (Niveau 3)</option>
                                    <option value="Expert">Expert (Niveau 4)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)} className="text-xs font-bold">Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold">Confirmer l'assignation</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

// Succession Tab Helper: DroppableCategory Board Column
function DroppableSuccessionCategory({ id, title, icon, successors, onRemove, renderAdd }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={cn("p-4 transition-colors flex flex-col min-h-[220px]", isOver ? "bg-indigo-50/40" : "bg-transparent")}>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                {icon}
                <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">{title}</h4>
            </div>
            <div className="space-y-3 flex-1">
                {successors.map(s => (
                    <DraggableSuccessorCard key={s.id} successor={s} onRemove={onRemove} />
                ))}
                {successors.length === 0 && (
                    <div className="py-8 text-center text-[10px] font-bold text-slate-400 italic">
                        Glisser un remplaçant ici
                    </div>
                )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
                {renderAdd()}
            </div>
        </div>
    );
}

// Succession Tab Helper: Draggable successor item card
function DraggableSuccessorCard({ successor, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: successor.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
    } : undefined;

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={cn(
                "bg-white border border-slate-200/80 rounded-xl p-3 flex justify-between items-center group shadow-sm hover:shadow-md transition-all",
                isDragging ? "opacity-50 border-indigo-500 shadow-xl cursor-grabbing" : "cursor-default"
            )}
        >
            <div className="flex items-center gap-2.5 truncate">
                <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-0.5">
                    <GripVertical size={14} />
                </div>
                <div className="truncate">
                    <div className="font-bold text-slate-800 text-xs truncate">
                        {successor.employee.firstName} {successor.employee.lastName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                        {successor.employee.positionTitle}
                    </div>
                </div>
            </div>
            <button 
                onClick={() => onRemove(successor.id)} 
                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 bg-slate-50 hover:bg-red-50 rounded-lg transition-all shrink-0 ml-2"
            >
                <Trash2 size={13} />
            </button>
        </div>
    );
}

// Succession Tab Helper: Quick selector addition
function AddSuccessorMenu({ planId, readiness, employees, currentSuccessors, onAdd }) {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState('');

    const currentIds = currentSuccessors.map(s => s.employeeId);
    const availableEmployees = employees.filter(e => !currentIds.includes(e.id));

    if (!isAdding) {
        return (
            <button 
                onClick={() => setIsAdding(true)} 
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-2.5 text-[10px] font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
                <Plus size={13} /> Sélectionner candidat
            </button>
        );
    }

    return (
        <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 space-y-2">
            <select 
                className="w-full text-[10px] font-bold p-2 bg-white rounded border border-slate-300 outline-none"
                value={selectedEmp}
                onChange={e => setSelectedEmp(e.target.value)}
            >
                <option value="">Choisir...</option>
                {availableEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.positionTitle || 'Poste'})</option>
                ))}
            </select>
            <div className="flex gap-2">
                <Button 
                    size="sm" 
                    className="flex-1 h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 font-bold" 
                    onClick={() => {
                        if (selectedEmp) {
                            onAdd(planId, selectedEmp, readiness);
                            setIsAdding(false);
                            setSelectedEmp('');
                        }
                    }}
                >
                    Valider
                </Button>
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 h-7 text-[10px] font-bold" 
                    onClick={() => setIsAdding(false)}
                >
                    Annuler
                </Button>
            </div>
        </div>
    );
}
