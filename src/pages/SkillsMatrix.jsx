import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Search, Filter, SlidersHorizontal, UserCircle, Briefcase, Award, GraduationCap, X } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RequirePermission } from '../components/auth/ProtectedRoute';

// Mock Data representing the DB structure requested
const SKILLS_CATALOG = [
    { id: 'S1', name: 'React.js', category: 'HARD_SKILL' },
    { id: 'S2', name: 'Node.js', category: 'HARD_SKILL' },
    { id: 'S3', name: 'Design UI/UX', category: 'HARD_SKILL' },
    { id: 'S4', name: 'Analyse de Données', category: 'HARD_SKILL' },
    { id: 'S5', name: 'Gestion de Projet', category: 'SOFT_SKILL' },
    { id: 'S6', name: 'Leadership', category: 'SOFT_SKILL' },
    { id: 'S7', name: 'Communication', category: 'SOFT_SKILL' },
    { id: 'S8', name: 'Résolution de Problèmes', category: 'SOFT_SKILL' },
];

const MOCK_EMPLOYEES = [
    {
        id: 'EMP001', name: 'Sarah Jenkins', role: 'Directrice RH', department: 'Ressources Humaines',
        skills: {
            'S5': 5, 'S6': 5, 'S7': 4, 'S8': 4, 'S4': 2
        }
    },
    {
        id: 'EMP002', name: 'Michael Dam', role: 'Ingénieur Frontend', department: 'Ingénierie',
        skills: {
            'S1': 5, 'S2': 3, 'S3': 4, 'S8': 4, 'S7': 3
        }
    },
    {
        id: 'EMP003', name: 'Amanda Smith', role: 'Manager UX', department: 'Design',
        skills: {
            'S3': 5, 'S1': 2, 'S5': 4, 'S6': 3, 'S7': 5
        }
    },
    {
        id: 'EMP004', name: 'John Doe', role: 'Développeur Fullstack', department: 'Ingénierie',
        skills: {
            'S1': 4, 'S2': 5, 'S4': 3, 'S8': 5, 'S7': 3
        }
    }
];

const TARGET_ROLES = [
    {
        title: 'Ingénieur Frontend Senior',
        requirements: { 'S1': 5, 'S2': 3, 'S3': 3, 'S8': 4, 'S5': 2 }
    },
    {
        title: 'Leader Technique',
        requirements: { 'S1': 4, 'S2': 4, 'S5': 4, 'S6': 4, 'S8': 5 }
    }
];

export function SkillsMatrix() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
    const [minLevelFilter, setMinLevelFilter] = useState(3);
    const [selectedEmployee, setSelectedEmployee] = useState(MOCK_EMPLOYEES[1]); // Default to Michael Dam
    const [compareRole, setCompareRole] = useState(TARGET_ROLES[0].title);

    // Filter Logic for the Talent Pool Sidebar
    const filteredEmployees = useMemo(() => {
        return MOCK_EMPLOYEES.filter(emp => {
            // Text Search
            const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.role.toLowerCase().includes(searchQuery.toLowerCase());

            // Skill Filter
            let matchesSkill = true;
            if (selectedSkillFilter) {
                const empSkillLevel = emp.skills[selectedSkillFilter] || 0;
                matchesSkill = empSkillLevel >= minLevelFilter;
            }

            return matchesSearch && matchesSkill;
        });
    }, [searchQuery, selectedSkillFilter, minLevelFilter]);

    // Format Data for Radar Chart 
    const getChartData = () => {
        if (!selectedEmployee) return [];

        const targetRoleReqs = TARGET_ROLES.find(r => r.title === compareRole)?.requirements || {};

        // Take all skills this employee has, plus any skills required by the role to show gaps
        const relevantSkillIds = new Set([...Object.keys(selectedEmployee.skills), ...Object.keys(targetRoleReqs)]);

        return Array.from(relevantSkillIds).map(skillId => {
            const skillDef = SKILLS_CATALOG.find(s => s.id === skillId);
            return {
                subject: skillDef ? skillDef.name : skillId,
                Current: selectedEmployee.skills[skillId] || 0,
                Target: targetRoleReqs[skillId] || 0,
                fullMark: 5,
            };
        });
    };

    const getSkillName = (id) => SKILLS_CATALOG.find(s => s.id === id)?.name || id;
    const getSkillCategory = (id) => SKILLS_CATALOG.find(s => s.id === id)?.category === 'HARD_SKILL' ? 'Compétence Technique' : 'Savoir-être';

    return (
        <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-screen flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Award className="text-blue-600 h-8 w-8" />
                        Matrice des Compétences & GPEC
                    </h2>
                    <p className="text-slate-500 mt-1">Découvrez les talents internes et effectuez des analyses d'écarts par rapport aux rôles cibles.</p>
                </div>
            </div>

            <div className="flex gap-6 h-[calc(100vh-140px)]">

                {/* LEFT SIDEBAR: Talent Search */}
                <Card className="w-1/3 flex flex-col shrink-0 h-full border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search size={18} className="text-slate-500" /> Recherche de Talents
                        </CardTitle>
                        <CardDescription>Filtrer les employés par compétences confirmées</CardDescription>

                        <div className="mt-4 space-y-3">
                            <Input
                                placeholder="Rechercher par nom ou rôle..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white"
                            />

                            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Filter size={14} className="text-blue-600" /> Filtre de Compétence
                                </div>
                                <select
                                    className="w-full text-sm border-slate-200 rounded-md bg-slate-50"
                                    value={selectedSkillFilter}
                                    onChange={(e) => setSelectedSkillFilter(e.target.value)}
                                >
                                    <option value="">-- Toutes les Compétences --</option>
                                    <optgroup label="Compétences Techniques">
                                        {SKILLS_CATALOG.filter(s => s.category === 'HARD_SKILL').map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Savoir-être">
                                        {SKILLS_CATALOG.filter(s => s.category === 'SOFT_SKILL').map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </optgroup>
                                </select>

                                {selectedSkillFilter && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500 w-24">Niveau Min. ({minLevelFilter}/5)</span>
                                        <input
                                            type="range"
                                            min="1" max="5"
                                            value={minLevelFilter}
                                            onChange={(e) => setMinLevelFilter(parseInt(e.target.value))}
                                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-0">
                        {filteredEmployees.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                <Search className="mx-auto mb-2 opacity-20" size={32} />
                                Aucun employé ne correspond à ce profil de compétences.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredEmployees.map(emp => (
                                    <div
                                        key={emp.id}
                                        onClick={() => setSelectedEmployee(emp)}
                                        className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedEmployee?.id === emp.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 text-sm">{emp.name}</h4>
                                                <div className="text-xs text-slate-500 mt-0.5">{emp.role}</div>
                                            </div>
                                            {selectedSkillFilter && emp.skills[selectedSkillFilter] && (
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold border-blue-200 shadow-none">
                                                    Niv. {emp.skills[selectedSkillFilter]}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* RIGHT AREA: Gap Analysis & Radar Chart */}
                <Card className="w-2/3 h-full flex flex-col">
                    {selectedEmployee ? (
                        <>
                            <CardHeader className="border-b bg-white pb-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
                                            {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">{selectedEmployee.name}</CardTitle>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-slate-400" /> {selectedEmployee.role}</span>
                                                <span className="flex items-center gap-1.5"><UserCircle size={16} className="text-slate-400" /> {selectedEmployee.department}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 min-w-[250px]">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Analyse d'Écart vs Rôle Cible</label>
                                        <select
                                            className="w-full text-sm font-medium bg-white border-slate-200 rounded text-slate-900 focus:ring-blue-500"
                                            value={compareRole}
                                            onChange={(e) => setCompareRole(e.target.value)}
                                        >
                                            {TARGET_ROLES.map(role => (
                                                <option key={role.title} value={role.title}>{role.title}</option>
                                            ))}
                                            <option value="">-- Aucun Rôle Cible --</option>
                                        </select>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 overflow-y-auto p-6 flex flex-col">
                                <div className="h-[400px] w-full relative bg-slate-50/50 rounded-xl border border-slate-100 mb-6 flex items-center justify-center p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getChartData()}>
                                            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickCount={6} />

                                            <Radar
                                                name={selectedEmployee.name}
                                                dataKey="Current"
                                                stroke="#2563eb" // Blue
                                                fill="#3b82f6"
                                                fillOpacity={0.4}
                                                activeDot={{ r: 6 }}
                                            />
                                            {compareRole && (
                                                <Radar
                                                    name={`Requis : ${compareRole}`}
                                                    dataKey="Target"
                                                    stroke="#059669" // Emerald
                                                    fill="#10b981"
                                                    fillOpacity={0.15}
                                                    strokeDasharray="5 5"
                                                />
                                            )}
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <GraduationCap size={18} className="text-slate-400" /> Inventaire Détaillé des Compétences
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(selectedEmployee.skills)
                                            .sort(([, valA], [, valB]) => valB - valA)
                                            .map(([skillId, level]) => {
                                                const targetLevel = compareRole ? (TARGET_ROLES.find(r => r.title === compareRole)?.requirements[skillId] || 0) : 0;
                                                const isGap = compareRole && targetLevel > level;

                                                return (
                                                    <div key={skillId} className={`p-3 rounded-lg border flex items-center justify-between ${isGap ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                                                        <div>
                                                            <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
                                                                {getSkillName(skillId)}
                                                                {isGap && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1 py-0">Écart</Badge>}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mt-0.5">
                                                                {getSkillCategory(skillId)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-400">Niveau</span>
                                                            <Badge variant="secondary" className={`font-mono text-base font-bold ${isGap ? 'bg-amber-200 text-amber-900' : 'bg-blue-100 text-blue-700'}`}>
                                                                {level}<span className="text-xs text-blue-400 opacity-50">/5</span>
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-full">
                            <Award className="h-16 w-16 mb-4 text-slate-200" />
                            <h3 className="text-xl font-medium text-slate-600 mb-2">Aucun Profil Sélectionné</h3>
                            <p className="max-w-sm">Sélectionnez un employé dans la liste de recherche pour voir sa matrice et effectuer une analyse d'écart.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
