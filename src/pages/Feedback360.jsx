import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
    Users, Star, Sparkles, Award, CheckCircle2, MessageSquare, 
    TrendingUp, UserCheck, RefreshCw, Send, Plus, X, Heart, Shield
} from 'lucide-react';
import { 
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
    PolarRadiusAxis, Radar, Tooltip, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const FEEDBACK_360_JULIE = {
    employeeId: 'julie-konan-demo',
    employeeName: 'Julie Konan',
    position: 'Chargée de Clientèle',
    department: 'Commercial & Relation Client',
    completionRate: 89, // 8 avis sur 9 reçus
    radarScores: [
        { subject: 'Orientation Client & Service', auto: 4.5, pairs: 4.8, manager: 4.7, fullMark: 5 },
        { subject: 'Communication & Écoute', auto: 4.2, pairs: 4.6, manager: 4.5, fullMark: 5 },
        { subject: 'Négociation & Influence', auto: 3.8, pairs: 4.2, manager: 4.0, fullMark: 5 },
        { subject: 'Rigueur & Engagements', auto: 4.0, pairs: 4.3, manager: 4.2, fullMark: 5 },
        { subject: 'Esprit d\'Équipe & Entraide', auto: 4.6, pairs: 4.9, manager: 4.6, fullMark: 5 },
        { subject: 'Gestion du Stress & Sérénité', auto: 3.5, pairs: 4.1, manager: 3.9, fullMark: 5 }
    ],
    verbatims: [
        {
            role: 'Pair / Collègue',
            date: '2026-09-19',
            strength: 'Capacité d\'écoute exceptionnelle avec les clients mécontents. Elle désamorce les situations tendues avec calme et diplomatie.',
            improvement: 'Pourrait encore plus déléguer certaines relances administratives pour se concentrer sur les comptes stratégiques.'
        },
        {
            role: 'Manager (Armand Kouassi)',
            date: '2026-09-18',
            strength: 'Grande autonomie, posture exemplaire et sens aigu du résultat. Julie est un moteur pour toute l\'équipe commerciale.',
            improvement: 'Continuer le perfectionnement en anglais des affaires pour piloter les négociations avec nos filiales régionales.'
        },
        {
            role: 'Client Interne (Support Technique)',
            date: '2026-09-16',
            strength: 'Excellente collaboration inter-services. Ses briefs clients sont clairs et facilitent grandement les résolutions techniques.',
            improvement: 'Rien à signaler, un plaisir constant de travailler avec elle.'
        }
    ]
};

export function Feedback360() {
    const [campaignData, setCampaignData] = useState(FEEDBACK_360_JULIE);
    const [notification, setNotification] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    // Formulaire d'évaluation d'un pair
    const [newRole, setNewRole] = useState('Pair / Collègue');
    const [scoreClient, setScoreClient] = useState(5);
    const [scoreComm, setScoreComm] = useState(4);
    const [scoreTeam, setScoreTeam] = useState(5);
    const [newStrength, setNewStrength] = useState('');
    const [newImprovement, setNewImprovement] = useState('');

    const showNotice = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3500);
    };

    const handleAddFeedback = (e) => {
        e.preventDefault();
        const created = {
            role: newRole,
            date: new Date().toISOString().split('T')[0],
            strength: newStrength,
            improvement: newImprovement
        };

        setCampaignData(prev => ({
            ...prev,
            completionRate: 100,
            verbatims: [created, ...prev.verbatims]
        }));

        setIsSubmitModalOpen(false);
        showNotice("🌟 Votre feedback 360° a été enregistré avec succès !");
        setNewStrength('');
        setNewImprovement('');
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
                        className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2"
                    >
                        <Sparkles size={18} className="text-indigo-400" />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Users className="text-indigo-600 h-8 w-8" />
                        Évaluation Feedback 360° &amp; Avis des Pairs
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Campagne d'évaluation croisée bienveillante : auto-évaluation, retour des collègues et vision managériale.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-md shadow-indigo-100"
                    >
                        <Plus size={16} /> Donner mon Avis 360°
                    </Button>
                </div>
            </div>

            {/* Carte Profil Démo Collaborateur */}
            <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                            JK
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-white">{campaignData.employeeName}</h3>
                                <Badge className="bg-emerald-500 text-white font-bold text-[10px]">
                                    Campagne Q3 2026
                                </Badge>
                            </div>
                            <div className="text-xs text-indigo-300 font-semibold mt-1">
                                {campaignData.position} • {campaignData.department}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-300">Taux de Réponse</div>
                            <div className="text-2xl font-black text-emerald-400 mt-0.5">{campaignData.completionRate}%</div>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-300">Avis Consignés</div>
                            <div className="text-2xl font-black text-white mt-0.5">{campaignData.verbatims.length + 5} / 9</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Layout 2 colonnes : Radar comparatif & Verbatims */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Colonne Gauche : Radar Chart Recharts */}
                <div className="lg:col-span-6 space-y-6">
                    <Card className="border-slate-200/80 shadow-sm bg-white">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp size={18} className="text-indigo-600" /> Comparaison Croisée des Perceptions
                            </CardTitle>
                            <CardDescription>Auto-évaluation (Violet) vs Moyenne des Pairs (Émeraude) vs Manager (Ambre)</CardDescription>
                        </CardHeader>

                        <CardContent className="p-4">
                            <div className="h-[340px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={campaignData.radarScores}>
                                        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 9 }} tickCount={6} />
                                        
                                        <Radar name="Auto-évaluation Julie" dataKey="auto" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                                        <Radar name="Avis des Pairs (Collègues)" dataKey="pairs" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                        <Radar name="Avis Manager (N+1)" dataKey="manager" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />

                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-950 font-medium mt-2">
                                <span className="font-bold">Constat Clé IA : </span>
                                Julie Konan est encore plus appréciée par ses pairs (note moyenne de 4,6/5) qu'elle ne s'auto-évalue (4,0/5). Forte reconnaissance sur l'entraide et l'orientation client.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne Droite : Verbatims & Retours Qualitatifs */}
                <div className="lg:col-span-6 space-y-4">
                    <Card className="border-slate-200/80 shadow-sm bg-white">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                                <span>Retours Qualitatifs &amp; Verbatims</span>
                                <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200">
                                    {campaignData.verbatims.length} avis récents
                                </Badge>
                            </CardTitle>
                            <CardDescription>Commentaires constructifs des collègues et du management</CardDescription>
                        </CardHeader>

                        <CardContent className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto">
                            {campaignData.verbatims.map((v, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <Badge className="bg-slate-100 text-slate-800 font-bold text-[10px]">
                                            {v.role}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 font-medium">{v.date}</span>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
                                            <CheckCircle2 size={12} /> Points Forts Remarqués
                                        </div>
                                        <p className="text-xs text-slate-800 font-medium mt-0.5 leading-relaxed">
                                            "{v.strength}"
                                        </p>
                                    </div>

                                    <div className="pt-1.5 border-t border-slate-100">
                                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1">
                                            <Sparkles size={12} /> Axe de Développement Suggéré
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                                            "{v.improvement}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal Évaluer un Collègue */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                <Star size={18} className="text-indigo-600" /> Rédiger un Feedback 360° pour Julie Konan
                            </h3>
                            <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddFeedback} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Votre Relation Professionnelle</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg font-semibold">
                                    <option value="Pair / Collègue">Pair / Collègue de même niveau</option>
                                    <option value="Client Interne (Autre service)">Client Interne (Autre service)</option>
                                    <option value="Manager / Référent Projet">Manager / Référent Projet</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Points Forts &amp; Talents Particuliers</label>
                                <textarea
                                    value={newStrength}
                                    onChange={e => setNewStrength(e.target.value)}
                                    rows={3}
                                    required
                                    placeholder="Ce que vous appréciez particulièrement dans son travail, son attitude..."
                                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Conseil / Axe d'Amélioration Constructif</label>
                                <textarea
                                    value={newImprovement}
                                    onChange={e => setNewImprovement(e.target.value)}
                                    rows={2}
                                    required
                                    placeholder="Une suggestion bienveillante pour l'aider à grandir dans ses missions..."
                                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 text-white font-bold">Transmettre le Feedback</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
