import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { FileText, Sparkles, Download, Save, Trash2, Edit2, CheckCircle2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function JobDescriptionStudio() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    
    const [newTitle, setNewTitle] = useState('');
    const [newDept, setNewDept] = useState('');
    const [activeJob, setActiveJob] = useState(null);

    const editorRef = useRef(null);

    const loadJobs = async () => {
        try {
            // Utilisation de api.get pour bénéficier du parsing JSON sécurisé et de la gestion d'erreurs
            const { data } = await api.get('/job-descriptions');
            // Sécurité absolue : s'assurer que c'est toujours un tableau pour éviter le crash de map()
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur chargement fiches de poste:', err);
            setJobs([]); // Fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadJobs(); }, [token]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const { data } = await api.post('/job-descriptions/generate', { title: newTitle, department: newDept });
            setNewTitle('');
            setNewDept('');
            await loadJobs();
            setActiveJob(data);
        } catch (err) {
            console.error('Erreur génération fiche de poste:', err);
            // On pourrait ajouter un toast d'erreur ici si nécessaire
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!activeJob || !editorRef.current) return;
        const newContent = editorRef.current.innerHTML;
        try {
            await api.put(`/job-descriptions/${activeJob.id}`, { content: newContent, status: 'FINAL' });
            alert("Fiche de poste sauvegardée !");
            setActiveJob({ ...activeJob, content: newContent, status: 'FINAL' });
            loadJobs();
        } catch (err) {
            console.error('Erreur sauvegarde:', err);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Supprimer cette fiche ?")) return;
        try {
            await api.delete(`/job-descriptions/${id}`);
            if (activeJob && activeJob.id === id) setActiveJob(null);
            loadJobs();
        } catch (err) {
            console.error('Erreur suppression:', err);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50 print:bg-white print:h-auto">
            {/* Header (Hidden in Print) */}
            <div className="px-8 py-6 print:hidden shrink-0">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <Sparkles className="text-fuchsia-600" /> AI Job Studio
                </h2>
                <p className="text-slate-500 mt-1">Générez des fiches de poste complètes et attractives grâce à l'Intelligence Artificielle.</p>
            </div>

            <div className="flex-1 flex overflow-hidden print:overflow-visible">
                {/* Sidebar List (Hidden in Print) */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 print:hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <form onSubmit={handleGenerate} className="space-y-3">
                            <div>
                                <Input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titre du Poste (ex: Développeur)" className="text-sm bg-white" />
                            </div>
                            <div>
                                <Input required value={newDept} onChange={e => setNewDept(e.target.value)} placeholder="Département (ex: IT)" className="text-sm bg-white" />
                            </div>
                            <Button type="submit" disabled={generating} className="w-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white shadow-md">
                                {generating ? <Bot className="animate-spin mr-2" size={16} /> : <Sparkles className="mr-2" size={16} />}
                                {generating ? "Génération en cours..." : "Générer avec l'IA"}
                            </Button>
                        </form>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loading ? <div className="text-center p-4 text-slate-400 text-sm">Chargement...</div> : null}
                        {jobs.map(job => (
                            <div 
                                key={job.id} 
                                onClick={() => setActiveJob(job)}
                                className={cn(
                                    "p-3 rounded-lg cursor-pointer transition-colors group flex items-start justify-between",
                                    activeJob?.id === job.id ? "bg-fuchsia-50 border border-fuchsia-200" : "hover:bg-slate-50 border border-transparent"
                                )}
                            >
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{job.title}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                        <span>{job.department}</span>
                                        {job.status === 'FINAL' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Edit2 size={12} className="text-amber-500" />}
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 overflow-y-auto bg-slate-100/50 p-8 print:p-0 print:bg-white flex justify-center">
                    {!activeJob ? (
                        <div className="text-center text-slate-400 self-center print:hidden">
                            <Bot size={64} className="mx-auto mb-4 text-slate-200" />
                            <p>Sélectionnez ou générez une fiche de poste pour commencer l'édition.</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl">
                            {/* Toolbar (Hidden in Print) */}
                            <div className="flex justify-end gap-3 mb-4 print:hidden">
                                <Button variant="outline" onClick={handleSaveEdit} className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
                                    <Save size={16} className="mr-2" /> Enregistrer les modifications
                                </Button>
                                <Button onClick={handlePrint} className="bg-slate-900 text-white hover:bg-slate-800">
                                    <Download size={16} className="mr-2" /> Exporter PDF
                                </Button>
                            </div>
                            
                            {/* The Document (A4 format roughly) */}
                            <div className="bg-white p-12 shadow-sm rounded-xl border border-slate-200 min-h-[1056px] print:shadow-none print:border-none print:p-0 print:min-h-0">
                                <div className="mb-8 border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">Fiche de Poste</h1>
                                        <div className="text-xl text-fuchsia-700 font-bold">{activeJob.department}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500">Généré le {activeJob.createdAt ? new Date(activeJob.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                                        <div className="font-bold text-slate-900 mt-1">S.I.I Entreprise</div>
                                    </div>
                                </div>
                                
                                {/* Editable Content Area */}
                                <div 
                                    ref={editorRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-fuchsia-800 prose-ul:my-4 prose-li:my-1 focus:outline-none focus:ring-2 focus:ring-fuchsia-100 focus:rounded-lg p-2 transition-all"
                                    dangerouslySetInnerHTML={{ __html: activeJob.content }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
