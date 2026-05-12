import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Plus, Trash2, Edit2, ChevronRight, ChevronDown, Calculator, Search, Briefcase, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function OrgSimulation() {
    const { token } = useAuth();
    const [simulations, setSimulations] = useState([]);
    const [activeSimulation, setActiveSimulation] = useState(null);
    const [loading, setLoading] = useState(true);

    const [newSimName, setNewSimName] = useState('');
    const [newSimDesc, setNewSimDesc] = useState('');

    const loadSimulations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/simulations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSimulations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSimulations();
    }, []);

    const handleCreateSimulation = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/simulations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newSimName, description: newSimDesc, copyCurrentOrg: true })
            });
            if (res.ok) {
                setNewSimName('');
                setNewSimDesc('');
                loadSimulations();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadSimulationDetails = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/simulations/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setActiveSimulation(data);
        } catch (err) {
            console.error(err);
        }
    };

    if (activeSimulation) {
        return <SandboxView simulation={activeSimulation} onBack={() => { setActiveSimulation(null); loadSimulations(); }} token={token} reload={() => loadSimulationDetails(activeSimulation.id)} />;
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Network className="text-indigo-600" /> Simulateur d'Organigramme
                    </h2>
                    <p className="text-slate-500 mt-1">Créez des "Brouillons" pour simuler de nouvelles structures organisationnelles.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 shadow-sm border-slate-200 bg-slate-50/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Nouvelle Simulation</CardTitle>
                        <CardDescription>L'organigramme actuel sera copié comme base de travail.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateSimulation} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Nom du Scénario</label>
                                <Input required value={newSimName} onChange={e => setNewSimName(e.target.value)} placeholder="Ex: Filiale Dakar 2027" className="bg-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <textarea 
                                    className="w-full text-sm border-slate-200 rounded-md p-2 bg-white resize-none" 
                                    rows={3} 
                                    value={newSimDesc} onChange={e => setNewSimDesc(e.target.value)} 
                                    placeholder="Objectifs de cette restructuration..."
                                />
                            </div>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus size={16} className="mr-2"/> Créer le scénario
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Chargement des simulations...</div>
                    ) : simulations.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                            <Network size={40} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-700">Aucune simulation active</h3>
                            <p className="text-slate-500 text-sm mt-1">Créez votre premier scénario pour commencer.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {simulations.map(sim => (
                                <Card key={sim.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => loadSimulationDetails(sim.id)}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{sim.name}</h3>
                                            <Badge variant={sim.status === 'DRAFT' ? 'secondary' : 'default'}>{sim.status}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">{sim.description || "Aucune description"}</p>
                                        <div className="flex items-center text-xs text-slate-400 font-medium">
                                            <span>Modifié le {new Date(sim.updatedAt).toLocaleDateString()}</span>
                                            <div className="ml-auto flex items-center text-indigo-600">
                                                Ouvrir l'éditeur <ChevronRight size={14} className="ml-1" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SandboxView({ simulation, onBack, token, reload }) {
    const [nodes, setNodes] = useState(simulation.nodes || []);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isAddingMode, setIsAddingMode] = useState(false);

    // Form state for adding/editing
    const [formTitle, setFormTitle] = useState('');
    const [formDept, setFormDept] = useState('');
    const [formSalary, setFormSalary] = useState(0);

    // Build hierarchy
    const rootNodes = nodes.filter(n => !n.parentId);

    const calculateTotalCost = () => {
        return nodes.reduce((sum, n) => sum + (n.monthlySalary || 0), 0);
    };

    const handleSaveNode = async () => {
        if (!selectedNode && !isAddingMode) return;

        const url = isAddingMode ? `${API_URL}/api/simulations/nodes` : `${API_URL}/api/simulations/nodes/${selectedNode.id}`;
        const method = isAddingMode ? 'POST' : 'PUT';
        
        const body = {
            simulationId: simulation.id,
            title: formTitle,
            department: formDept,
            monthlySalary: parseFloat(formSalary),
            isVacant: isAddingMode ? true : selectedNode?.isVacant,
        };

        if (isAddingMode && selectedNode) {
            body.parentId = selectedNode.id; // Adding a child to the selected node
        }

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            setIsAddingMode(false);
            reload(); // Reload from parent to get updated tree
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteNode = async (id) => {
        if (!window.confirm("Supprimer ce poste de la simulation ?")) return;
        try {
            await fetch(`${API_URL}/api/simulations/nodes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSelectedNode(null);
            reload();
        } catch (err) {
            console.error(err);
        }
    };

    // Recursive component for Tree
    const TreeNode = ({ node, level = 0 }) => {
        const children = nodes.filter(n => n.parentId === node.id);
        const [expanded, setExpanded] = useState(true);
        const isSelected = selectedNode?.id === node.id && !isAddingMode;

        return (
            <div className="w-full">
                <div 
                    className={cn(
                        "flex items-center p-2 rounded-lg cursor-pointer transition-colors border",
                        isSelected ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-300",
                        level > 0 && "ml-6 mt-2 relative before:absolute before:-left-4 before:top-1/2 before:w-4 before:border-t-2 before:border-slate-200"
                    )}
                    onClick={() => {
                        setSelectedNode(node);
                        setIsAddingMode(false);
                        setFormTitle(node.title);
                        setFormDept(node.department);
                        setFormSalary(node.monthlySalary);
                    }}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            {node.isVacant ? <UserPlus size={14} className="text-amber-500" /> : <Briefcase size={14} className="text-slate-500" />}
                            <span className="font-bold text-slate-800 text-sm">{node.title}</span>
                            {node.isVacant && <Badge variant="outline" className="text-[9px] h-4 bg-amber-50 text-amber-600 border-amber-200 px-1">À RECRUTER</Badge>}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{node.department}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">{node.monthlySalary.toLocaleString()} FCFA/mois</span>
                            {!node.isVacant && node.employee && (
                                <>
                                    <span>•</span>
                                    <span className="text-indigo-600 font-medium">{node.employee.firstName} {node.employee.lastName}</span>
                                </>
                            )}
                        </div>
                    </div>
                    {children.length > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="p-1 text-slate-400 hover:text-slate-600">
                            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}
                </div>
                {expanded && children.length > 0 && (
                    <div className="border-l-2 border-slate-100 ml-3">
                        {children.map(child => <TreeNode key={child.id} node={child} level={level + 1} />)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
            {/* Header Toolbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center">
                        <ChevronRight size={16} className="rotate-180 mr-1" /> Retour
                    </button>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">{simulation.name}</h2>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">{simulation.status}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                    <Calculator size={18} className="text-indigo-600" />
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Masse Salariale Projetée</div>
                        <div className="text-lg font-black text-slate-900 font-mono">{calculateTotalCost().toLocaleString()} FCFA <span className="text-xs text-slate-500 font-sans font-medium">/mois</span></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Org Chart Tree Viewer */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {rootNodes.map(root => (
                            <TreeNode key={root.id} node={root} />
                        ))}
                        {rootNodes.length === 0 && <div className="text-center text-slate-500 py-10">L'organigramme est vide.</div>}
                    </div>
                </div>

                {/* Properties Sidebar */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Éditeur de Nœud</h3>
                        {!isAddingMode && selectedNode && (
                            <Button variant="ghost" size="sm" onClick={() => { setIsAddingMode(true); setFormTitle(''); setFormDept(''); setFormSalary(0); }} className="text-indigo-600 h-8 px-2">
                                <Plus size={14} className="mr-1" /> Sous-Poste
                            </Button>
                        )}
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                        {!selectedNode && !isAddingMode ? (
                            <div className="text-center text-slate-400 py-10 text-sm">
                                Sélectionnez un poste dans l'organigramme pour le modifier, ou ajoutez un sous-poste.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {isAddingMode && selectedNode && (
                                    <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-md mb-4 font-medium border border-blue-100">
                                        Création d'un sous-poste (À RECRUTER) sous <strong>{selectedNode.title}</strong>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block uppercase">Titre du Poste</label>
                                    <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} className="bg-slate-50" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block uppercase">Département</label>
                                    <Input value={formDept} onChange={e => setFormDept(e.target.value)} className="bg-slate-50" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block uppercase">Salaire Mensuel Estimé (FCFA)</label>
                                    <Input type="number" value={formSalary} onChange={e => setFormSalary(e.target.value)} className="bg-slate-50 font-mono" />
                                </div>
                                
                                {!isAddingMode && selectedNode && !selectedNode.isVacant && selectedNode.employee && (
                                    <div className="bg-slate-100 p-3 rounded-md border border-slate-200 mt-4">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Employé Actuel</div>
                                        <div className="text-sm font-semibold text-slate-800">{selectedNode.employee.firstName} {selectedNode.employee.lastName}</div>
                                        <div className="text-xs text-slate-500">{selectedNode.employee.email}</div>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-2">
                                    <Button onClick={handleSaveNode} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                                        Sauvegarder
                                    </Button>
                                    {!isAddingMode && selectedNode && (
                                        <Button onClick={() => handleDeleteNode(selectedNode.id)} variant="outline" className="px-3 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                    {isAddingMode && (
                                        <Button onClick={() => setIsAddingMode(false)} variant="outline" className="px-3">
                                            Annuler
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
