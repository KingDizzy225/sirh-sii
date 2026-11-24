import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Coins, TrendingUp, ShieldCheck, CheckCircle2, AlertTriangle, 
    Building2, Users, FileText, Send, Download, Calculator, 
    ArrowUpRight, Sliders, Check, X, Search, Sparkles, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

// Données de simulation pour la campagne de revue salariale
const INITIAL_SALARY_REVIEW = [
    {
        id: 'REV-01',
        employeeId: 'emp-001',
        name: 'Raïssa Fofana',
        role: 'Lead Développeur Fullstack',
        department: 'Informatique & SI',
        agency: 'Pôle Technique Grand-Bassam',
        currentSalary: 1450000,
        midMarketSalary: 1600000, // Compa-ratio = 90.6%
        perfRating: 5,
        proposedPercent: 4.5,
        motif: 'Dépassement exceptionnel des objectifs et leadership sur la refonte du SIRH.',
        status: 'EN_REVUE_DRH' // 'BROUILLON', 'EN_REVUE_DRH', 'VALIDE_DG'
    },
    {
        id: 'REV-02',
        employeeId: 'emp-002',
        name: 'Kouamé Jean-Luc',
        role: 'Conseiller Clientèle Réseau',
        department: 'Commercial & Relation Client',
        agency: 'Siège & Plateau Pyramide',
        currentSalary: 480000,
        midMarketSalary: 520000, // Compa-ratio = 92.3%
        perfRating: 4,
        proposedPercent: 3.0,
        motif: 'Excellente fidélisation de la clientèle agence Plateau.',
        status: 'EN_REVUE_DRH'
    },
    {
        id: 'REV-03',
        employeeId: 'emp-003',
        name: 'Amani Sylvie',
        role: 'Superviseur Télécoms',
        department: 'Support & Rétention',
        agency: 'Cocody Riviera Palmeraie',
        currentSalary: 720000,
        midMarketSalary: 750000, // Compa-ratio = 96%
        perfRating: 4,
        proposedPercent: 3.5,
        motif: 'Tenue des SLA d\'appels au-dessus de 94%.',
        status: 'VALIDE_DG'
    },
    {
        id: 'REV-04',
        employeeId: 'emp-004',
        name: 'Blaise Koffi',
        role: 'Responsable Comptabilité & Paie',
        department: 'Finance & Comptabilité',
        agency: 'Siège & Plateau Pyramide',
        currentSalary: 1200000,
        midMarketSalary: 1250000,
        perfRating: 5,
        proposedPercent: 4.0,
        motif: 'Zéro litige fiscal OHADA et respect scrupuleux des déclarations CNPS.',
        status: 'VALIDE_DG'
    },
    {
        id: 'REV-05',
        employeeId: 'emp-005',
        name: 'Yao Anderson',
        role: 'Technicien Fibre & Réseau Optique',
        department: 'Opérations & Logistique',
        agency: 'Yopougon Bel Air Express',
        currentSalary: 420000,
        midMarketSalary: 480000, // Compa-ratio = 87.5% (Bas)
        perfRating: 3,
        proposedPercent: 2.0,
        motif: 'Rattrapage d\'équité salariale suite à l\'obtention du permis nacelle.',
        status: 'BROUILLON'
    }
];

export function RevueSalarialeMerite() {
    const [reviews, setReviews] = useState(INITIAL_SALARY_REVIEW);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('ALL');
    const [budgetEnveloppe] = useState(2500000); // 2 500 000 FCFA d'augmentation mensuelle globale

    // Calcul du Compa-Ratio : Salaire Actuel / Salaire Médian du Marché * 100
    const calculateCompaRatio = (current, mid) => {
        if (!mid) return 100;
        return Math.round((current / mid) * 100);
    };

    // Calculs budgétaires en temps réel
    const budgetStats = useMemo(() => {
        let totalCurrent = 0;
        let totalCostIncrease = 0;

        reviews.forEach(r => {
            totalCurrent += r.currentSalary;
            const inc = Math.round(r.currentSalary * (r.proposedPercent / 100));
            totalCostIncrease += inc;
        });

        const remain = budgetEnveloppe - totalCostIncrease;
        const consumeRate = Math.round((totalCostIncrease / budgetEnveloppe) * 100);

        return {
            totalCurrent,
            totalCostIncrease,
            remain,
            consumeRate,
            isOverBudget: remain < 0
        };
    }, [reviews, budgetEnveloppe]);

    // Modification interactive du pourcentage d'augmentation
    const handlePercentChange = (id, newPercent) => {
        const val = Math.max(0, Math.min(15, parseFloat(newPercent) || 0));
        setReviews(prev => prev.map(r => r.id === id ? { ...r, proposedPercent: val } : r));
    };

    const handleValidateAllDRH = () => {
        if (budgetStats.isOverBudget) {
            toast.error("Impossible de soumettre : le budget alloué par la Direction Générale est dépassé !");
            return;
        }
        setReviews(prev => prev.map(r => ({ ...r, status: 'VALIDE_DG' })));
        toast.success("Revue salariale validée par la DRH et transmise au Directeur Général !");
    };

    // Filtrage
    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchAgency = selectedAgency === 'ALL' || r.agency.includes(selectedAgency);
            const matchSearch = !searchQuery.trim() || (
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchAgency && matchSearch;
        });
    }, [reviews, selectedAgency, searchQuery]);

    return (
        <div className="flex-1 space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 font-sans selection:bg-[#002B7F] selection:text-white">
            
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* EN-TÊTE : CAMPAGNE DE REVUE SALARIALE 2026                    */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-blue-50 text-[#002B7F] border border-blue-100">
                            <Coins size={20} />
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Revue Salariale Annuelle & Matrice de Mérite
                        </h1>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Session Budgétaire 2026
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Arbitrage des augmentations individuelles au mérite croisant le Compa-Ratio télécom et la performance annuelle.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl cursor-pointer"
                    >
                        <Download size={14} className="mr-1.5 text-[#002B7F]" />
                        Export Grille Paie
                    </Button>

                    <Button
                        onClick={handleValidateAllDRH}
                        disabled={budgetStats.isOverBudget}
                        className="bg-[#002B7F] hover:bg-[#001F5C] text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md shadow-blue-900/15 cursor-pointer disabled:opacity-50"
                    >
                        <ShieldCheck size={14} className="mr-1.5" />
                        Valider l'Arbitrage DRH
                    </Button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* COCKPIT DE SUIVI DE L'ENVELOPPE BUDGÉTAIRE                   */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Enveloppe allouée */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Enveloppe Globale Allouée (DG)
                        </span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                            {budgetEnveloppe.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-500">FCFA / mois</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Budget d'augmentation validé</p>
                    </CardContent>
                </Card>

                {/* 2. Coût des augmentations proposées */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Consommation du Budget
                        </span>
                        <div className="text-xl font-black text-[#002B7F] mt-1">
                            {budgetStats.totalCostIncrease.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-500">FCFA</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                    budgetStats.isOverBudget ? 'bg-rose-600' : 'bg-emerald-600'
                                }`} 
                                style={{ width: `${Math.min(100, budgetStats.consumeRate)}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Solde disponible */}
                <Card className={`rounded-2xl border shadow-xs ${
                    budgetStats.isOverBudget ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
                }`}>
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Marge Budgétaire Restante
                        </span>
                        <div className={`text-xl font-black mt-1 ${
                            budgetStats.isOverBudget ? 'text-rose-600' : 'text-emerald-700'
                        }`}>
                            {budgetStats.remain.toLocaleString('fr-FR')} <span className="text-xs font-semibold">FCFA</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {budgetStats.isOverBudget ? '⚠️ Dépassement budgétaire' : 'Conforme à l\'enveloppe'}
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Taux moyen d'augmentation */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Taux Moyen Accordé
                        </span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                            +3.4%
                        </div>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                            Ciblé sur les top performers
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GUIDE MÉTHODOLOGIQUE DE LA MATRICE DE MÉRITE                 */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#002B7F] font-bold">
                    <Calculator size={18} className="shrink-0" />
                    <span>Règle de Gestion RH : Le Compa-Ratio compare le salaire au médian du marché télécom (100% = aligné marché).</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Performance 5★ & Compa-Ratio &lt; 90% = +4.5% à +6% recommandé</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TABLEAU DES RECOMMANDATIONS SALARIALES                       */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Card className="rounded-2xl border-slate-200 shadow-xs bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                                <th className="p-4 pl-6">Collaborateur</th>
                                <th className="p-4">Agence</th>
                                <th className="p-4">Salaire Actuel</th>
                                <th className="p-4">Compa-Ratio</th>
                                <th className="p-4">Note EAP</th>
                                <th className="p-4 w-32">% Proposé</th>
                                <th className="p-4">Nouveau Salaire</th>
                                <th className="p-4">Coût Entreprise</th>
                                <th className="p-4 text-right pr-6">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReviews.map(r => {
                                const compa = calculateCompaRatio(r.currentSalary, r.midMarketSalary);
                                const increaseAmt = Math.round(r.currentSalary * (r.proposedPercent / 100));
                                const newSalary = r.currentSalary + increaseAmt;

                                return (
                                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                        
                                        {/* Collaborateur */}
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                                            <div className="text-slate-500 text-[11px]">{r.role}</div>
                                        </td>

                                        {/* Agence */}
                                        <td className="p-4 text-slate-600 font-medium truncate max-w-[150px]">
                                            {r.agency}
                                        </td>

                                        {/* Salaire Actuel */}
                                        <td className="p-4 font-mono font-bold text-slate-800">
                                            {r.currentSalary.toLocaleString('fr-FR')} F
                                        </td>

                                        {/* Compa-Ratio */}
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                                compa < 90
                                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                    : (compa > 105 ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-blue-50 text-[#002B7F] border-blue-200')
                                            }`}>
                                                {compa}% ({compa < 90 ? 'Sous-coté' : (compa > 105 ? 'Sur-coté' : 'Aligné')})
                                            </span>
                                        </td>

                                        {/* Note Perf */}
                                        <td className="p-4 font-bold text-slate-800 flex items-center gap-1">
                                            <Star size={13} className="text-amber-500 fill-amber-500" />
                                            <span>{r.perfRating}/5</span>
                                        </td>

                                        {/* % Proposé (Curseur ajustable) */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    max="15"
                                                    value={r.proposedPercent}
                                                    onChange={e => handlePercentChange(r.id, e.target.value)}
                                                    className="w-16 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900 text-xs focus:bg-white focus:border-[#002B7F]"
                                                />
                                                <span className="font-bold text-slate-500">%</span>
                                            </div>
                                        </td>

                                        {/* Nouveau Salaire */}
                                        <td className="p-4 font-mono font-black text-emerald-700 text-sm">
                                            {newSalary.toLocaleString('fr-FR')} F
                                        </td>

                                        {/* Coût Augmentation Mensuel */}
                                        <td className="p-4 font-mono font-bold text-slate-600">
                                            +{increaseAmt.toLocaleString('fr-FR')} F
                                        </td>

                                        {/* Statut */}
                                        <td className="p-4 text-right pr-6">
                                            {r.status === 'VALIDE_DG' && (
                                                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                                                    Validé DG
                                                </Badge>
                                            )}
                                            {r.status === 'EN_REVUE_DRH' && (
                                                <Badge className="bg-blue-50 text-[#002B7F] border-blue-200 text-[10px]">
                                                    En arbitrage DRH
                                                </Badge>
                                            )}
                                            {r.status === 'BROUILLON' && (
                                                <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                                                    Brouillon Manager
                                                </Badge>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
