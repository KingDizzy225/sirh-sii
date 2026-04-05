import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, Plus, Check, Trash2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LEVEL_COLOR = (avg) => {
    const n = parseFloat(avg);
    if (n >= 3.5) return 'bg-emerald-500';
    if (n >= 2.5) return 'bg-blue-500';
    if (n >= 1.5) return 'bg-amber-400';
    return 'bg-red-400';
};

export function GPEC() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('map');
    const [map, setMap] = useState([]);
    const [gaps, setGaps] = useState([]);
    const [defs, setDefs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({ name: '', category: 'Technique', description: '', criticality: 'Normal' });
    const [assignForm, setAssignForm] = useState({ employeeId: '', skillName: '', proficiencyLevel: 'Débutant' });
    const [notification, setNotification] = useState(null);

    const load = async () => {
        const [mapData, gapsData, defsData, employeesData] = await Promise.all([
            fetch(`${API_URL}/api/gpec/map`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/api/gpec/gaps`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/api/gpec/skill-definitions`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/api/employees`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
        ]);
        setMap(mapData); setGaps(gapsData); setDefs(defsData); setEmployees(employeesData);
    };

    useEffect(() => { if (token) load(); }, [token]);

    const notify = (m) => { setNotification(m); setTimeout(() => setNotification(null), 3000); };

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/gpec/skill-definitions`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form)
        });
        if (res.ok) { setShowForm(false); load(); notify('Compétence ajoutée au référentiel !'); }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/gpec/employee-skills`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(assignForm)
        });
        if (res.ok) { setShowAssignForm(false); load(); notify('Compétence assignée avec succès !'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette compétence du référentiel ?')) return;
        await fetch(`${API_URL}/api/gpec/skill-definitions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        load();
    };

    const catColor = { 'Technique': 'bg-blue-100 text-blue-700', 'Managérial': 'bg-purple-100 text-purple-700', 'Transversal': 'bg-teal-100 text-teal-700' };
    const critColor = { 'Critique': 'bg-red-100 text-red-700', 'Important': 'bg-amber-100 text-amber-700', 'Normal': 'bg-slate-100 text-slate-600' };

    return (
        <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            {notification && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
                    <Check size={18} />{notification}
                </motion.div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Target className="text-purple-600" /> GPEC++ Compétences</h2>
                    <p className="text-slate-500 mt-1">Cartographie et gestion prévisionnelle des compétences.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowAssignForm(true)} variant="outline" className="text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 gap-2"><UserCheck size={16} /> Assigner Compétence</Button>
                    <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2"><Plus size={16} /> Nouvelle Compétence</Button>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                {[['map','🗺️ Cartographie'],['gaps',`⚠️ Lacunes (${gaps.length})`],['defs','📚 Référentiel']].map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === id ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Competency Map */}
            {activeTab === 'map' && (
                <div className="space-y-4">
                    {map.length === 0 && (
                        <Card className="shadow-sm border-slate-200"><CardContent className="p-10 text-center text-slate-400">
                            Aucune compétence employé enregistrée. Renseignez les compétences dans les profils employés.
                        </CardContent></Card>
                    )}
                    {map.map((dept) => (
                        <Card key={dept.dept} className="shadow-sm border-slate-200">
                            <CardContent className="p-5">
                                <h3 className="font-bold text-slate-800 mb-3">{dept.dept}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {dept.skills.map(s => (
                                        <div key={s.skill} className="relative group flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                                            <div className={`w-2.5 h-2.5 rounded-full ${LEVEL_COLOR(s.avgLevel)}`} />
                                            <span className="text-sm font-medium text-slate-700">{s.skill}</span>
                                            <span className="text-xs text-slate-400">({s.count})</span>
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                                                Niveau moy. {s.avgLevel}/4
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        {[['bg-emerald-500','Expert (≥3.5)'],['bg-blue-500','Avancé (≥2.5)'],['bg-amber-400','Intermédiaire (≥1.5)'],['bg-red-400','Débutant (<1.5)']].map(([c, l]) => (
                            <span key={l} className="flex items-center gap-1"><span className={`w-3 h-3 rounded-full inline-block ${c}`} />{l}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Skill Gaps */}
            {activeTab === 'gaps' && (
                <div className="space-y-3">
                    {gaps.length === 0 && (
                        <Card className="shadow-sm"><CardContent className="p-10 text-center text-emerald-600 font-medium">
                            ✅ Aucune lacune critique détectée ! Toutes les compétences critiques ont au moins 3 experts.
                        </CardContent></Card>
                    )}
                    {gaps.map((g, i) => (
                        <motion.div key={g.skill} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className="shadow-sm border-red-200 bg-red-50">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="text-red-500 shrink-0" size={20} />
                                        <div>
                                            <p className="font-semibold text-slate-900">{g.skill}</p>
                                            <p className="text-xs text-slate-500">{g.category} · {g.experts} expert(s) seulement</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-red-100 text-red-700 text-xs">Critique</Badge>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Skill Definitions */}
            {activeTab === 'defs' && (
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead><tr className="border-b border-slate-100">
                                {['Compétence','Catégorie','Criticité','Description',''].map(h => (
                                    <th key={h} className="text-left p-4 text-xs font-medium text-slate-500">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {defs.map(d => (
                                    <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="p-4 font-medium">{d.name}</td>
                                        <td className="p-4"><Badge className={`text-xs ${catColor[d.category] || ''}`}>{d.category}</Badge></td>
                                        <td className="p-4"><Badge className={`text-xs ${critColor[d.criticality] || ''}`}>{d.criticality}</Badge></td>
                                        <td className="p-4 text-slate-500 text-sm">{d.description || '—'}</td>
                                        <td className="p-4">
                                            <button onClick={() => handleDelete(d.id)} className="text-slate-300 hover:text-red-500 bg-transparent border-0 cursor-pointer"><Trash2 size={15} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {!defs.length && <tr><td colSpan={5} className="p-10 text-center text-slate-400">Aucune compétence dans le référentiel.</td></tr>}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {/* Add Skill Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 flex justify-between">
                            <h3 className="text-lg font-bold text-white">Nouvelle Compétence Référentiel</h3>
                            <button onClick={() => setShowForm(false)} className="text-white bg-transparent border-0 cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div><label className="text-sm font-medium text-slate-700 block mb-1">Nom</label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: React.js, Gestion de projet..." /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Catégorie</label>
                                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                        {['Technique','Managérial','Transversal'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Criticité</label>
                                    <select value={form.criticality} onChange={e => setForm({...form, criticality: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                        {['Normal','Important','Critique'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div><label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
                                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm resize-none" />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Ajouter</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Assign Skill Modal */}
            {showAssignForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-emerald-600 flex justify-between">
                            <h3 className="text-lg font-bold text-white">Assigner une Compétence</h3>
                            <button onClick={() => setShowAssignForm(false)} className="text-white bg-transparent border-0 cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleAssign} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Employé</label>
                                <select required value={assignForm.employeeId} onChange={e => setAssignForm({...assignForm, employeeId: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                    <option value="">Sélectionner un employé...</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} - {e.department}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Compétence du référentiel</label>
                                <select required value={assignForm.skillName} onChange={e => setAssignForm({...assignForm, skillName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                    <option value="">Sélectionner une compétence...</option>
                                    {defs.map(d => <option key={d.id} value={d.name}>{d.name} ({d.category})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Niveau d'expertise</label>
                                <select required value={assignForm.proficiencyLevel} onChange={e => setAssignForm({...assignForm, proficiencyLevel: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                    {['Débutant', 'Intermédiaire', 'Avancé', 'Expert'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)}>Annuler</Button>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Assigner</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
