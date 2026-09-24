import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
    Briefcase, Sparkles, Plus, Search, Filter, CheckCircle2, 
    Clock, Users, UserCheck, Calendar, ArrowRight, Star, 
    Layers, TrendingUp, X, Award, ChevronRight, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MISSIONS_INITIALES = [];

export function TalentMarketplace() {
    const [missions, setMissions] = useState(MISSIONS_INITIALES);
    const [selectedMission, setSelectedMission] = useState(MISSIONS_INITIALES[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [notification, setNotification] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Formulaire de création de mission
    const [newTitle, setNewTitle] = useState('');
    const [newDept, setNewDept] = useState('Commercial & Relation Client');
    const [newDuration, setNewDuration] = useState('1 mois');
    const [newTimeAlloc, setNewTimeAlloc] = useState('20% du temps de travail');
    const [newPriority, setNewPriority] = useState('Normale');
    const [newDesc, setNewDesc] = useState('');
    const [newSkill1, setNewSkill1] = useState('Gestion de la Relation Client (CRM)');

    const showNotice = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3500);
    };

    const filteredMissions = useMemo(() => {
        return missions.filter(m => {
            const matchesText = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                m.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
            return matchesText && matchesStatus;
        });
    }, [missions, searchQuery, statusFilter]);

    const handleApply = (missionId) => {
        setMissions(prev => prev.map(m => {
            if (m.id === missionId) {
                const alreadyApplied = m.applicants.some(a => a.name === 'Julie Konan');
                if (alreadyApplied) return m;
                return {
                    ...m,
                    applicants: [
                        ...m.applicants,
                        { id: `app-${Date.now()}`, name: '', date: new Date().toISOString().split('T')[0], status: 'APPLIED', note: 'Candidature spontanée transmise' }
                    ]
                };
            }
            return m;
        }));

        setSelectedMission(prev => {
            if (prev?.id === missionId) {
                const alreadyApplied = prev.applicants.some(a => a.name === 'Julie Konan');
                if (alreadyApplied) return prev;
                return {
                    ...prev,
                    applicants: [
                        ...prev.applicants,
                        { id: `app-${Date.now()}`, name: '', date: new Date().toISOString().split('T')[0], status: 'APPLIED', note: 'Candidature spontanée transmise' }
                    ]
                };
            }
            return prev;
        });

        showNotice("🚀 Votre candidature interne a été envoyée au responsable de la mission !");
    };

    const handleCreateMission = (e) => {
        e.preventDefault();
        const created = {
            id: `mis-${Date.now()}`,
            title: newTitle,
            department: newDept,
            lead: 'Vous (Manager)',
            duration: newDuration,
            timeAllocation: newTimeAlloc,
            priority: newPriority,
            status: 'OPEN',
            createdAt: new Date().toISOString().split('T')[0],
            description: newDesc,
            requiredSkills: [
                { name: newSkill1, level: 3 }
            ],
            topCandidateMatch: {
                employeeId: '',
                name: '',
                role: 'Chargée de Clientèle',
                matchScore: 94,
                matchedSkillsCount: 1
            },
            applicants: []
        };

        setMissions([created, ...missions]);
        setSelectedMission(created);
        setIsCreateModalOpen(false);
        showNotice("✅ Nouvelle mission interne publiée avec succès !");
        setNewTitle('');
        setNewDesc('');
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 text-sm font-semibold flex items-center gap-2.5"
                    >
                        <Sparkles size={16} className="text-indigo-400" />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
                        <Briefcase className="text-blue-600 h-7 w-7" />
                        Marketplace Interne des Talents &amp; Missions
                    </h2>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">
                        Bourse de projets agiles : mobilisez les compétences internes transversales des 191 collaborateurs.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white gap-2 font-bold shadow-xs rounded-xl text-xs"
                    >
                        <Plus size={15} /> Publier une Mission
                    </Button>
                </div>
            </div>

            {/* 4 CARTES KPI PASTEL HARMONISÉES AVEC LE DASHBOARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Missions Ouvertes</p>
                        <p className="text-2xl font-black text-slate-900">{missions.filter(m => m.status === 'OPEN').length}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">Prêtes à être pourvues</p>
                    </div>
                </div>

                <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Missions en Cours</p>
                        <p className="text-2xl font-black text-slate-900">{missions.filter(m => m.status === 'IN_PROGRESS').length}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">Collaboration active</p>
                    </div>
                </div>

                <div className="bg-[#F5F3FF] border border-[#EDE9FE] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Match Compétences IA</p>
                        <p className="text-2xl font-black text-slate-900">95%</p>
                        <p className="text-[11px] text-purple-700 font-semibold">Adéquation automatique</p>
                    </div>
                </div>

                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Award size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Talents Disponibles</p>
                        <p className="text-2xl font-black text-slate-900">191</p>
                        <p className="text-[11px] text-amber-700 font-semibold">Vivier interne mobilisable</p>
                    </div>
                </div>
            </div>

            {/* Layout 2 colonnes : Liste des Missions & Vue détaillée */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Colonne Gauche : Liste & Recherche */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="border-slate-200/80 shadow-sm bg-white">
                        <CardHeader className="p-4 border-b bg-slate-50/50 space-y-3">
                            <div className="relative">
                                <Input
                                    placeholder="Rechercher une mission, compétence..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 text-xs font-semibold bg-white"
                                />
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>

                            <div className="flex gap-1 bg-slate-200/60 p-1 rounded-lg">
                                {[
                                    { id: 'ALL', label: 'Toutes' },
                                    { id: 'OPEN', label: 'Ouvertes' },
                                    { id: 'IN_PROGRESS', label: 'En cours' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setStatusFilter(f.id)}
                                        className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
                                            statusFilter === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </CardHeader>

                        <CardContent className="p-0 divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
                            {filteredMissions.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => setSelectedMission(m)}
                                    className={`p-4 cursor-pointer transition-all border-l-4 ${
                                        selectedMission?.id === m.id 
                                            ? 'bg-indigo-50/40 border-l-indigo-600' 
                                            : 'border-l-transparent hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                        <Badge className={`text-[9px] font-bold uppercase tracking-wider ${
                                            m.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                            'bg-indigo-100 text-indigo-800 border-indigo-200'
                                        }`}>
                                            {m.status === 'OPEN' ? '🟢 Ouverte' : '⚡ En cours'}
                                        </Badge>
                                        <span className="text-[10px] font-semibold text-slate-400">{m.duration}</span>
                                    </div>
                                    <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{m.title}</h4>
                                    <div className="text-[11px] text-slate-500 font-medium mt-1">{m.department}</div>

                                    {/* Badge Matching IA */}
                                    {m.topCandidateMatch && (
                                        <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-indigo-50/80 border border-indigo-100">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900">
                                                <Sparkles size={13} className="text-indigo-600" />
                                                <span>Top Match : {m.topCandidateMatch.name}</span>
                                            </div>
                                            <Badge className="bg-indigo-600 text-white font-extrabold text-[10px]">
                                                {m.topCandidateMatch.matchScore}% Match
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne Droite : Fiche Détaillée & Candidatures */}
                <div className="lg:col-span-7 space-y-6">
                    {selectedMission ? (
                        <Card className="border-slate-200/80 shadow-sm bg-white">
                            <CardHeader className="border-b pb-5">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                    <Badge className="bg-slate-100 text-slate-700 font-bold border-slate-200">
                                        Réf : {selectedMission.id}
                                    </Badge>
                                    <span className="text-xs text-slate-400 font-medium">
                                        Publiée le {selectedMission.createdAt} par {selectedMission.lead}
                                    </span>
                                </div>
                                <CardTitle className="text-xl font-black text-slate-900">
                                    {selectedMission.title}
                                </CardTitle>
                                <CardDescription className="text-xs font-semibold text-indigo-600">
                                    {selectedMission.department} • {selectedMission.timeAllocation} ({selectedMission.duration})
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6 space-y-6">
                                {/* Description de la mission */}
                                <div>
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Objectif &amp; Périmètre de la Mission
                                    </h5>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        {selectedMission.description}
                                    </p>
                                </div>

                                {/* Compétences Exigées */}
                                <div>
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        Compétences Clés Recherchées
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                        {selectedMission.requiredSkills.map((s, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-200/80 bg-white">
                                                <span className="text-xs font-bold text-slate-800">{s.name}</span>
                                                <Badge className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px]">
                                                    Niveau {s.level}/4
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommandation IA Matchmaking */}
                                {selectedMission.topCandidateMatch && (
                                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                                        <div className="flex items-start justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-widest">
                                                    <Sparkles size={16} /> Recommandation Intelligente du Vivier
                                                </div>
                                                <h4 className="text-lg font-black text-white mt-1">
                                                    {selectedMission.topCandidateMatch.name}
                                                </h4>
                                                <p className="text-xs text-slate-300 mt-0.5 font-medium">
                                                    {selectedMission.topCandidateMatch.role} — Match à {selectedMission.topCandidateMatch.matchScore}% basé sur sa Matrice de Compétences
                                                </p>
                                            </div>
                                            <div className="text-3xl font-black text-emerald-400">
                                                {selectedMission.topCandidateMatch.matchScore}%
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Candidatures & Action */}
                                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-xs text-slate-500 font-semibold">
                                        {selectedMission.applicants.length} collaborateur(s) positionné(s) sur cette mission
                                    </div>
                                    <Button
                                        onClick={() => handleApply(selectedMission.id)}
                                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-emerald-100 gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Postuler / Affecter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                            Sélectionnez une mission pour visualiser les détails et les profils recommandés.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Publication de Mission */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                <Plus size={18} className="text-indigo-600" /> Publier une Mission Interne
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMission} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Intitulé de la Mission</label>
                                <Input 
                                    value={newTitle} 
                                    onChange={e => setNewTitle(e.target.value)} 
                                    placeholder="ex: Renfort Négociation Appel d'Offres..." 
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Département Demandeur</label>
                                    <select 
                                        value={newDept} 
                                        onChange={e => setNewDept(e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold"
                                    >
                                        <option value="Commercial & Relation Client">Commercial & Relation Client</option>
                                        <option value="Technologie & SI">Technologie & SI</option>
                                        <option value="Ressources Humaines">Ressources Humaines</option>
                                        <option value="Finance & Juridique">Finance & Juridique</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Durée Prévue</label>
                                    <Input 
                                        value={newDuration} 
                                        onChange={e => setNewDuration(e.target.value)} 
                                        placeholder="ex: 3 semaines, 1 mois" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Temps Mobilisé</label>
                                    <Input 
                                        value={newTimeAlloc} 
                                        onChange={e => setNewTimeAlloc(e.target.value)} 
                                        placeholder="ex: 20% du temps" 
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Priorité</label>
                                    <select 
                                        value={newPriority} 
                                        onChange={e => setNewPriority(e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold"
                                    >
                                        <option value="Normale">Normale</option>
                                        <option value="Moyenne">Moyenne</option>
                                        <option value="Urgente">Urgente</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Compétence Principale Requise</label>
                                <select
                                    value={newSkill1}
                                    onChange={e => setNewSkill1(e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold"
                                >
                                    <option value="Gestion de la Relation Client (CRM)">Gestion de la Relation Client (CRM)</option>
                                    <option value="Négociation de Contrats B2B/B2C">Négociation de Contrats B2B/B2C</option>
                                    <option value="Communication Orale">Communication Orale</option>
                                    <option value="Droit du Travail">Droit du Travail</option>
                                    <option value="Gestion de Projet (Classique)">Gestion de Projet</option>
                                    <option value="Développement Front-End (React, Vue, Angular)">Développement Web</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Description &amp; Livrables Attendus</label>
                                <textarea
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    rows={3}
                                    required
                                    placeholder="Détaillez le rôle et les attentes pour cette mission..."
                                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" className="bg-indigo-600 text-white font-bold">
                                    Publier sur la Marketplace
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
