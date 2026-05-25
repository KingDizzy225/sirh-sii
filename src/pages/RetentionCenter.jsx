import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Target, Trash2, CheckCircle2, XCircle, AlertTriangle, UserMinus, BrainCircuit, Sparkles, TrendingUp, History, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function RetentionCenter() {
    const { token } = useAuth();
    const [actions, setActions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newEmpId, setNewEmpId] = useState('');
    const [newRisk, setNewRisk] = useState('High');
    const [newAction, setNewAction] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const loadData = async () => {
        try {
            const [actionRes, empRes] = await Promise.all([
                fetch(`${API_URL}/api/retention`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/employees`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setActions(await actionRes.json());
            setEmployees(await empRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/api/retention`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ employeeId: newEmpId, riskLevel: newRisk, recommendedAction: newAction })
            });
            setNewEmpId('');
            setNewAction('');
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await fetch(`${API_URL}/api/retention/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Supprimer cette alerte définitivement ?")) return;
        try {
            await fetch(`${API_URL}/api/retention/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateAIAction = () => {
        if (!newEmpId) {
            alert("Veuillez d'abord sélectionner un employé.");
            return;
        }
        setIsGeneratingAI(true);
        // Simulate AI delay
        setTimeout(() => {
            const strategies = [
                "Proposer un programme de mentorat croisé + flexibilité des horaires de travail (Télétravail 2j/semaine).",
                "Identifier un besoin de formation en management et débloquer un budget L&D spécifique de 500K FCFA.",
                "Redéfinir le plan de carrière à 3 ans avec des jalons d'augmentation claire pour pallier au manque de perspectives.",
                "Organiser un 'Stay Interview' avec le N+2 et proposer une prime exceptionnelle de rétention indexée sur les objectifs du T3."
            ];
            const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
            setNewAction(randomStrategy);
            setIsGeneratingAI(false);
        }, 1200);
    };

    const getRiskStyles = (risk) => {
        if (risk === 'High') return { 
            bg: 'bg-rose-500', 
            text: 'text-rose-600', 
            lightBg: 'bg-rose-100', 
            border: 'border-rose-200',
            shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]'
        };
        if (risk === 'Medium') return { 
            bg: 'bg-amber-500', 
            text: 'text-amber-600', 
            lightBg: 'bg-amber-100', 
            border: 'border-amber-200',
            shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]'
        };
        return { 
            bg: 'bg-blue-500', 
            text: 'text-blue-600', 
            lightBg: 'bg-blue-100', 
            border: 'border-blue-200',
            shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
        };
    };

    if (loading) return (
        <div className="flex-1 p-8 flex justify-center items-center h-[calc(100vh-4rem)]">
            <span className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
        </div>
    );

    const pendingActions = actions.filter(a => a.status === 'PENDING');
    const completedActions = actions.filter(a => a.status !== 'PENDING');

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 bg-slate-50/50 min-h-[calc(100vh-4rem)] overflow-x-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3 font-['Outfit']">
                            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shadow-inner">
                                <ShieldAlert size={32} />
                            </div>
                            Centre Anti-<span className="text-rose-600">Turnover</span>
                        </h2>
                        <p className="text-slate-500 font-medium text-lg mt-2 flex items-center gap-2">
                            <Target className="text-amber-500" size={18}/> Identifier, analyser et prévenir les départs critiques.
                        </p>
                    </div>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-12">
                    
                    {/* Colonne Gauche : Nouvelle Alerte */}
                    <motion.div variants={itemVariants} className="md:col-span-4 space-y-6">
                        <Card className="glass-panel border-0 rounded-3xl h-fit shadow-lg overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <BrainCircuit size={120} />
                            </div>
                            <CardHeader className="bg-white/40 border-b border-white/50 pb-4">
                                <CardTitle className="text-xl font-bold font-['Outfit'] flex items-center gap-2">
                                    <Sparkles size={20} className="text-indigo-600" />
                                    Nouvelle Alerte IA
                                </CardTitle>
                                <CardDescription className="text-slate-500 font-medium">Créer une recommandation manuelle ou assistée par IA.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 relative z-10">
                                <form onSubmit={handleCreate} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Employé à Risque</label>
                                        <select 
                                            required 
                                            className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm transition-all text-slate-700 font-medium" 
                                            value={newEmpId} 
                                            onChange={e => setNewEmpId(e.target.value)}
                                        >
                                            <option value="">Sélectionner un collaborateur...</option>
                                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} - {e.department}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Niveau de Risque Prédit</label>
                                        <select 
                                            className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm transition-all text-slate-700 font-medium" 
                                            value={newRisk} 
                                            onChange={e => setNewRisk(e.target.value)}
                                        >
                                            <option value="Low">🟢 Faible (Départ peu probable)</option>
                                            <option value="Medium">🟡 Moyen (Surveillance requise)</option>
                                            <option value="High">🔴 Élevé (Départ imminent)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Action de Rétention</label>
                                            <button 
                                                type="button" 
                                                onClick={handleGenerateAIAction}
                                                disabled={isGeneratingAI}
                                                className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-indigo-200 transition-colors"
                                            >
                                                {isGeneratingAI ? <span className="animate-pulse">Génération...</span> : <><BrainCircuit size={12}/> Générer via IA</>}
                                            </button>
                                        </div>
                                        <textarea 
                                            required 
                                            className="w-full text-sm border border-slate-200 rounded-xl p-3 min-h-[100px] bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm transition-all text-slate-700 resize-none font-medium" 
                                            value={newAction} 
                                            onChange={e => setNewAction(e.target.value)} 
                                            placeholder="Décrivez la stratégie pour retenir ce talent..."
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 uppercase tracking-widest">
                                        Enregistrer l'alerte
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Colonne Droite : Liste des actions */}
                    <div className="md:col-span-8 space-y-8">
                        
                        {/* Actions Requises */}
                        <motion.div variants={containerVariants} className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                                <AlertTriangle className="text-rose-500" size={24} />
                                <h3 className="text-xl font-bold text-slate-800 font-['Outfit']">
                                    Interventions Prioritaires
                                </h3>
                                <Badge variant="secondary" className="ml-auto bg-rose-100 text-rose-700">{pendingActions.length} en attente</Badge>
                            </div>
                            
                            <AnimatePresence>
                                {pendingActions.map(action => {
                                    const riskStyles = getRiskStyles(action.riskLevel);
                                    return (
                                        <motion.div 
                                            key={action.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Card className="glass-panel border-0 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
                                                {/* Risk Level Accent Bar */}
                                                <div className={`absolute top-0 left-0 h-full w-1.5 ${riskStyles.bg} ${riskStyles.shadow}`} />
                                                
                                                <CardContent className="p-5 pl-7 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white/40">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold font-['Outfit'] shrink-0 border border-white">
                                                                {action.employee.firstName[0]}{action.employee.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-slate-800 text-lg font-['Outfit'] block md:inline mr-2">
                                                                    {action.employee.firstName} {action.employee.lastName}
                                                                </span>
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${riskStyles.lightBg} ${riskStyles.text} ${riskStyles.border} border`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${riskStyles.bg} animate-pulse`} />
                                                                    Risque {action.riskLevel}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest ml-13">
                                                            <span>{action.employee.positionTitle}</span>
                                                            <span>•</span>
                                                            <span>{action.employee.department}</span>
                                                        </div>
                                                        
                                                        <div className="ml-13 bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                                            <div className="flex items-start gap-2">
                                                                <BrainCircuit size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                                                                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                                                    {action.recommendedAction}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <Button size="sm" onClick={() => handleStatusUpdate(action.id, 'COMPLETED')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-200 rounded-lg">
                                                            <CheckCircle2 size={16} className="mr-1.5" /> Appliquer
                                                        </Button>
                                                        <div className="flex gap-2 flex-1">
                                                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(action.id, 'REJECTED')} className="flex-1 text-slate-500 hover:bg-slate-100 border-slate-200 rounded-lg font-bold">
                                                                <XCircle size={16} />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(action.id)} className="text-rose-500 hover:bg-rose-50 rounded-lg">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {pendingActions.length === 0 && (
                                <motion.div variants={itemVariants} className="p-12 text-center text-slate-500 font-medium flex flex-col items-center bg-white/40 rounded-3xl border border-white/50 border-dashed">
                                    <Fingerprint size={48} className="text-slate-300 mb-4 opacity-50" />
                                    Aucune alerte de rétention en cours. <br/>Vos équipes semblent stables.
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Historique */}
                        <motion.div variants={itemVariants} className="space-y-4 pt-6">
                            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                                <History className="text-slate-400" size={20} />
                                <h3 className="text-lg font-bold text-slate-600 font-['Outfit']">
                                    Historique des Interventions
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {completedActions.slice(0, 5).map(action => (
                                    <div key={action.id} className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm hover:bg-white transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                                                {action.employee.firstName[0]}{action.employee.lastName[0]}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-700">{action.employee.firstName} {action.employee.lastName}</span>
                                                <p className="text-xs text-slate-500 truncate max-w-[200px] md:max-w-md mt-0.5">{action.recommendedAction}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`shrink-0 ${action.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            {action.status === 'COMPLETED' ? 'Stratégie Appliquée' : 'Ignoré'}
                                        </Badge>
                                    </div>
                                ))}
                                {completedActions.length > 5 && (
                                    <button className="text-sm font-bold text-indigo-600 hover:underline text-center w-full py-2">Voir tout l'historique...</button>
                                )}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
}
