import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GraduationCap, Award, TrendingUp, CheckCircle2, Clock, 
    AlertCircle, Search, Filter, Star, Building2, UserCheck, 
    Download, Printer, Send, Sparkles, X, ChevronRight, Check,
    BarChart3, ThumbsUp, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

// Données réalistes de formations agréées FDFP
const INITIAL_FORMATIONS_FDFP = [
    {
        id: 'FDFP-2026-01',
        theme: 'Architecture Cloud AWS & Virtualisation Télécom',
        cabinet: 'Centre d\'Excellence Télécom Abidjan',
        budgetFcfa: 4800000,
        participantsCount: 8,
        dateFinFormation: '2026-08-15',
        evalChaudScore: 4.8, // /5
        evalChaudTaux: 100, // 100% de réponses
        evalFroidScore: 4.6, // /5 à J+90
        evalFroidStatut: 'COMPLETE', // 'COMPLETE', 'EN_ATTENTE_J90', 'RETARD'
        impactTerrain: 'Déploiement réussi de 3 clusters Cloud sans faire appel à un intégrateur externe.',
        roiScore: 94
    },
    {
        id: 'FDFP-2026-02',
        theme: 'Techniques de Négociation & Vente Fibre B2B',
        cabinet: 'Cabinet Performance Commerciale CI',
        budgetFcfa: 3200000,
        participantsCount: 14,
        dateFinFormation: '2026-08-20',
        evalChaudScore: 4.5,
        evalChaudTaux: 100,
        evalFroidScore: 4.3,
        evalFroidStatut: 'COMPLETE',
        impactTerrain: '+18% de contrats fibre B2B signés sur le trimestre suivant.',
        roiScore: 91
    },
    {
        id: 'FDFP-2026-03',
        theme: 'Sécurité Électrique & Sauvetage sur Pylônes 4G/5G',
        cabinet: 'Institut National de Sécurité Industrielle',
        budgetFcfa: 2900000,
        participantsCount: 12,
        dateFinFormation: '2026-10-10',
        evalChaudScore: 4.9,
        evalChaudTaux: 100,
        evalFroidScore: null,
        evalFroidStatut: 'EN_ATTENTE_J90', // Échéance en Janvier 2027
        impactTerrain: 'Évaluation managériale J+90 programmée le 10 Janvier 2027.',
        roiScore: 88
    },
    {
        id: 'FDFP-2026-04',
        theme: 'Management Agile & Résolution des Conflits d\'Équipe',
        cabinet: 'Abidjan Executive Leadership',
        budgetFcfa: 3600000,
        participantsCount: 10,
        dateFinFormation: '2026-07-05',
        evalChaudScore: 3.8,
        evalChaudTaux: 90,
        evalFroidScore: 3.2,
        evalFroidStatut: 'COMPLETE',
        impactTerrain: 'Peu de changement visible sur le terrain. Cabinet à ne pas renouveler.',
        roiScore: 62
    }
];

export default function EvaluationEfficaciteFdfp() {
    const [formations, setFormations] = useState(INITIAL_FORMATIONS_FDFP);
    const [selectedFormation, setSelectedFormation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const stats = useMemo(() => {
        const totalBudget = formations.reduce((acc, f) => acc + f.budgetFcfa, 0);
        const avgChaud = (formations.reduce((acc, f) => acc + f.evalChaudScore, 0) / formations.length).toFixed(1);
        const completedFroid = formations.filter(f => f.evalFroidScore !== null);
        const avgFroid = completedFroid.length > 0 
            ? (completedFroid.reduce((acc, f) => acc + f.evalFroidScore, 0) / completedFroid.length).toFixed(1)
            : '4.4';
        return { totalBudget, avgChaud, avgFroid };
    }, [formations]);

    const handleSendReminderJ90 = () => {
        toast.success("Rappels d'évaluation à froid à J+90 envoyés aux managers concernés !");
    };

    return (
        <div className="flex-1 space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 font-sans selection:bg-[#002B7F] selection:text-white">
            
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* EN-TÊTE : ÉVALUATION DE L'EFFICACITÉ FORMATIONS FDFP         */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-blue-50 text-[#002B7F] border border-blue-100">
                            <GraduationCap size={20} />
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Évaluation de l'Efficacité des Formations FDFP
                        </h1>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Norme Qualité RH & ROI
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Double mesure d'impact : Évaluation à chaud par le salarié (J+1) et évaluation opérationnelle à froid par le manager (J+90).
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        onClick={handleSendReminderJ90}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl cursor-pointer"
                    >
                        <Send size={14} className="mr-1.5 text-[#002B7F]" />
                        Relancer les Évaluations J+90
                    </Button>

                    <Button
                        onClick={() => window.print()}
                        className="bg-[#002B7F] hover:bg-[#001F5C] text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md shadow-blue-900/15 cursor-pointer"
                    >
                        Rapport FDFP Officiel
                    </Button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* INDICATEURS CLÉS DU PLAN DE FORMATION                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Budget Déployé */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Investissement FDFP Déployé
                        </span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                            {stats.totalBudget.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-500">FCFA</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Totalité prise en charge sur cotisations</p>
                    </CardContent>
                </Card>

                {/* 2. Score à Chaud (J+1) */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Satisfaction Salarié (J+1 à Chaud)
                        </span>
                        <div className="text-2xl font-black text-[#002B7F] mt-1 flex items-center gap-1.5">
                            <Star size={20} className="fill-amber-500 text-amber-500" />
                            <span>{stats.avgChaud} / 5</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Pédagogie et qualité des formateurs</p>
                    </CardContent>
                </Card>

                {/* 3. Score à Froid (J+90) */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Impact Opérationnel (J+90 à Froid)
                        </span>
                        <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center gap-1.5">
                            <TrendingUp size={20} className="text-emerald-600" />
                            <span>{stats.avgFroid} / 5</span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">Validation de l'utilité sur le terrain</p>
                    </CardContent>
                </Card>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TABLEAU DES FORMATIONS ET ROI ASSOCIÉ                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Card className="rounded-2xl border-slate-200 shadow-xs bg-white overflow-hidden">
                <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Palmarès d'Efficacité des Formations et Cabinets Agréés
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Bilan qualitatif pour le renouvellement des conventions de formation
                        </CardDescription>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                                <th className="p-4 pl-6">Thème de la Formation</th>
                                <th className="p-4">Cabinet Formateur</th>
                                <th className="p-4">Budget FDFP</th>
                                <th className="p-4">Score J+1 (Chaud)</th>
                                <th className="p-4">Score J+90 (Froid)</th>
                                <th className="p-4">Indice ROI</th>
                                <th className="p-4 text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {formations.map(f => (
                                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                                    
                                    {/* Thème */}
                                    <td className="p-4 pl-6">
                                        <div className="font-bold text-slate-900 text-sm">{f.theme}</div>
                                        <div className="text-slate-500 text-[11px] mt-0.5">{f.participantsCount} collaborateurs formés</div>
                                    </td>

                                    {/* Cabinet */}
                                    <td className="p-4 font-medium text-slate-700">
                                        {f.cabinet}
                                    </td>

                                    {/* Budget */}
                                    <td className="p-4 font-mono font-bold text-slate-800">
                                        {f.budgetFcfa.toLocaleString('fr-FR')} F
                                    </td>

                                    {/* Score Chaud */}
                                    <td className="p-4 font-bold text-slate-800">
                                        <span className="flex items-center gap-1">
                                            <Star size={13} className="text-amber-500 fill-amber-500" />
                                            {f.evalChaudScore}/5
                                        </span>
                                    </td>

                                    {/* Score Froid */}
                                    <td className="p-4">
                                        {f.evalFroidScore ? (
                                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                                                <TrendingUp size={13} className="text-emerald-600" />
                                                {f.evalFroidScore}/5
                                            </span>
                                        ) : (
                                            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                                                En attente J+90
                                            </Badge>
                                        )}
                                    </td>

                                    {/* Indice ROI */}
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-full font-black text-xs border ${
                                            f.roiScore >= 90
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                : (f.roiScore >= 80 ? 'bg-blue-50 text-[#002B7F] border-blue-200' : 'bg-rose-50 text-rose-800 border-rose-200')
                                        }`}>
                                            {f.roiScore}% ROI
                                        </span>
                                    </td>

                                    {/* Action */}
                                    <td className="p-4 text-right pr-6">
                                        <Button
                                            size="sm"
                                            onClick={() => setSelectedFormation(f)}
                                            className="bg-slate-100 hover:bg-[#002B7F] text-slate-700 hover:text-white font-bold text-xs h-8 px-3 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Voir Rapport
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* MODAL RAPPORT QUALITÉ ET IMPACT TERRAIN                      */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {selectedFormation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-[#002B7F] p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">Rapport d'Impact FDFP</h3>
                                    <p className="text-blue-100 text-xs">{selectedFormation.theme}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedFormation(null)}
                                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 text-xs">
                                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Organisme Dispensateur</span>
                                    <p className="font-bold text-slate-900">{selectedFormation.cabinet}</p>
                                </div>

                                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
                                    <span className="font-bold block flex items-center gap-1.5 text-emerald-800">
                                        <TrendingUp size={15} /> Impact Constaté sur le Terrain (Évaluation J+90 Manager) :
                                    </span>
                                    <p className="leading-relaxed">"{selectedFormation.impactTerrain}"</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Score Salariés (J+1)</span>
                                        <span className="text-xl font-black text-slate-900 mt-1 block">{selectedFormation.evalChaudScore}/5</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Score Managers (J+90)</span>
                                        <span className="text-xl font-black text-emerald-700 mt-1 block">{selectedFormation.evalFroidScore || 'En attente'}/5</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        onClick={() => setSelectedFormation(null)}
                                        className="w-full bg-[#002B7F] hover:bg-[#001F5C] text-white font-bold h-10 rounded-xl cursor-pointer"
                                    >
                                        Fermer le Rapport
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
