import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
    GraduationCap, TrendingUp, PiggyBank, Plus, CheckCircle2, 
    Clock, AlertTriangle, FileText, Download, Building2, 
    ArrowUpRight, BarChart2, ShieldCheck, X, Users
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DOSSIERS_FDFP_INITIAUX = [
    {
        id: 'FDFP-2026-001',
        title: 'Certification Négociation Grands Comptes & CRM Salesforce',
        provider: 'Cabinet Externe Agréé FDFP (Abidjan Plateau)',
        category: 'Formation Continue (FPC)',
        participantsCount: 6,
        budgetEngaged: 4200000,
        fdfpCoverageRequested: 3800000,
        fdfpRefundReceived: 3800000,
        status: 'REFUNDED', // IN_PREPARATION, SUBMITTED, APPROVED, REFUNDED
        submissionDate: '2026-03-10',
        approvalRef: 'AGR-FDFP-2026-891',
        keyLearners: 'Julie Konan, Marc Koffi, Armand Kouassi'
    },
    {
        id: 'FDFP-2026-002',
        title: 'Cybersécurité Avancée, Architecture Cloud & Sécurité SI',
        provider: 'Institut International des Technologies (IIT Abidjan)',
        category: 'Formation Continue (FPC)',
        participantsCount: 8,
        budgetEngaged: 6500000,
        fdfpCoverageRequested: 5800000,
        fdfpRefundReceived: 5800000,
        status: 'REFUNDED',
        submissionDate: '2026-05-15',
        approvalRef: 'AGR-FDFP-2026-1142',
        keyLearners: 'Équipe Infrastructure & DevOps'
    },
    {
        id: 'FDFP-2026-003',
        title: 'Management Agile, Scrum Master & Conduite du Changement',
        provider: 'Cabinet Performance Afrique',
        category: 'Formation Continue (FPC)',
        participantsCount: 12,
        budgetEngaged: 5400000,
        fdfpCoverageRequested: 4800000,
        fdfpRefundReceived: 0,
        status: 'APPROVED',
        submissionDate: '2026-07-20',
        approvalRef: 'AGR-FDFP-2026-1605',
        keyLearners: 'Chefs de projets & Lead Tech'
    },
    {
        id: 'FDFP-2026-004',
        title: 'Atelier Excellence Rédactionnelle & Synthèse Décisionnelle',
        provider: 'Centre de Formation Professionnelle Continue',
        category: 'Formation Continue (FPC)',
        participantsCount: 5,
        budgetEngaged: 2800000,
        fdfpCoverageRequested: 2500000,
        fdfpRefundReceived: 0,
        status: 'SUBMITTED',
        submissionDate: '2026-09-05',
        approvalRef: 'En attente commission FDFP',
        keyLearners: 'Julie Konan, Équipe Relation Client'
    }
];

export function GestionFDFP() {
    const [dossiers, setDossiers] = useState(DOSSIERS_FDFP_INITIAUX);
    const [annualPayroll, setAnnualPayroll] = useState(1850000000); // Masse salariale annuelle brute 1.85 Md FCFA
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    // Formulaire nouveau dossier FDFP
    const [newTitle, setNewTitle] = useState('');
    const [newProvider, setNewProvider] = useState('');
    const [newParticipants, setNewParticipants] = useState(4);
    const [newBudget, setNewBudget] = useState(3000000);

    const showNotice = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3500);
    };

    // Calculs légaux FDFP Côte d'Ivoire
    const fdfpBudget = useMemo(() => {
        const totalFdfpTax = Math.round(annualPayroll * 0.016); // 1,6% (0,4% TAP + 1,2% FPC)
        const fpcPot = Math.round(annualPayroll * 0.012); // 1,2% disponible pour remboursement formation continue

        const totalEngaged = dossiers.reduce((acc, d) => acc + d.budgetEngaged, 0);
        const totalRefunded = dossiers.reduce((acc, d) => acc + d.fdfpRefundReceived, 0);
        const totalApprovedPending = dossiers
            .filter(d => d.status === 'APPROVED' || d.status === 'SUBMITTED')
            .reduce((acc, d) => acc + d.fdfpCoverageRequested, 0);

        const recoveryRate = Math.round(((totalRefunded + totalApprovedPending) / fpcPot) * 100);
        const remainingBudget = Math.max(0, fpcPot - totalRefunded - totalApprovedPending);

        return {
            totalFdfpTax,
            fpcPot,
            totalEngaged,
            totalRefunded,
            totalApprovedPending,
            recoveryRate,
            remainingBudget
        };
    }, [annualPayroll, dossiers]);

    const chartData = [
        { name: 'Cagnotte FDFP Cotisée', montant: fdfpBudget.fpcPot },
        { name: 'Remboursements Encaissés', montant: fdfpBudget.totalRefunded },
        { name: 'Dossiers Validés / En Cours', montant: fdfpBudget.totalApprovedPending },
        { name: 'Reliquat à Mobiliser', montant: fdfpBudget.remainingBudget }
    ];

    const handleCreateDossier = (e) => {
        e.preventDefault();
        const requested = Math.round(newBudget * 0.9); // Le FDFP prend en charge en moyenne 85% à 90%
        const created = {
            id: `FDFP-2026-${String(dossiers.length + 1).padStart(3, '0')}`,
            title: newTitle,
            provider: newProvider,
            category: 'Formation Continue (FPC)',
            participantsCount: Number(newParticipants),
            budgetEngaged: Number(newBudget),
            fdfpCoverageRequested: requested,
            fdfpRefundReceived: 0,
            status: 'SUBMITTED',
            submissionDate: new Date().toISOString().split('T')[0],
            approvalRef: 'Dépôt en cours (Antenne FDFP Cocody)',
            keyLearners: 'Collaborateurs concernés'
        };

        setDossiers([created, ...dossiers]);
        setIsCreateModalOpen(false);
        showNotice("📁 Dossier d'agrément FDFP créé et transmis au plan de formation !");
        setNewTitle('');
        setNewProvider('');
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <GraduationCap className="text-indigo-600 h-8 w-8" />
                        Gestionnaire de Remboursement FDFP &amp; Plan Agréé
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Optimisation et rentabilisation de la taxe formation (1,2% FPC &amp; 0,4% TAP) auprès du FDFP Côte d'Ivoire.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold shadow-md shadow-indigo-100"
                    >
                        <Plus size={16} /> Monter un Dossier FDFP
                    </Button>
                </div>
            </div>

            {/* Cartes KPIs FDFP */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Droit à Remboursement (FPC 1,2%)</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                        {fdfpBudget.fpcPot.toLocaleString()} F
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Cotisé annuellement sur la masse salariale</span>
                </div>

                <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-lg shadow-emerald-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Remboursements Reçus</span>
                    <div className="text-2xl font-black mt-1">
                        {fdfpBudget.totalRefunded.toLocaleString()} F
                    </div>
                    <span className="text-[10px] text-emerald-100 font-medium flex items-center gap-1 mt-1">
                        <CheckCircle2 size={12} /> Virés sur le compte de l'entreprise
                    </span>
                </div>

                <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-lg shadow-indigo-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Taux de Récupération Taxe</span>
                    <div className="text-3xl font-black mt-1">
                        {fdfpBudget.recoveryRate}%
                    </div>
                    <span className="text-[10px] text-indigo-100 font-medium mt-1 block">
                        Objectif annuel DG &gt; 80%
                    </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reliquat à Mobiliser</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">
                        {fdfpBudget.remainingBudget.toLocaleString()} F
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold mt-1 block">
                        Fonds à engager avant le 31 décembre
                    </span>
                </div>
            </div>

            {/* Graphique de Rentabilisation */}
            <Card className="border-slate-200/80 shadow-sm bg-white">
                <CardHeader className="border-b pb-3">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <BarChart2 size={18} className="text-indigo-600" /> Bilan Financier FDFP de l'Exercice
                    </CardTitle>
                    <CardDescription>Comparaison entre le potentiel cotisé, les remboursements encaissés et le reliquat</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} />
                                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip formatter={(val) => `${Number(val).toLocaleString()} FCFA`} />
                                <Bar dataKey="montant" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Tableau des Dossiers d'Agrément FDFP */}
            <Card className="border-slate-200/80 shadow-sm bg-white">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                        <span>Dossiers d'Agrément &amp; Remboursement</span>
                        <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200">
                            {dossiers.length} dossiers instruits
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50/60 border-b text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-3.5">Réf. Dossier</th>
                                <th className="p-3.5">Action de Formation</th>
                                <th className="p-3.5">Cabinet Formateur</th>
                                <th className="p-3.5 text-center">Bénéficiaires</th>
                                <th className="p-3.5 text-right">Coût Engagé</th>
                                <th className="p-3.5 text-right">Remboursé FDFP</th>
                                <th className="p-3.5 text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {dossiers.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-3.5 font-mono font-bold text-indigo-600">{d.id}</td>
                                    <td className="p-3.5">
                                        <div className="font-bold text-slate-900">{d.title}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">Participants : {d.keyLearners}</div>
                                    </td>
                                    <td className="p-3.5 text-slate-600 font-semibold">{d.provider}</td>
                                    <td className="p-3.5 text-center font-bold text-slate-800">{d.participantsCount} pers.</td>
                                    <td className="p-3.5 text-right font-mono text-slate-700">{d.budgetEngaged.toLocaleString()} F</td>
                                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                                        {d.fdfpRefundReceived > 0 ? `${d.fdfpRefundReceived.toLocaleString()} F` : '—'}
                                    </td>
                                    <td className="p-3.5 text-center">
                                        <Badge className={`text-[9px] font-bold ${
                                            d.status === 'REFUNDED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                            d.status === 'APPROVED' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                            'bg-amber-100 text-amber-800 border-amber-200'
                                        }`}>
                                            {d.status === 'REFUNDED' ? '✔ Remboursé' :
                                             d.status === 'APPROVED' ? 'Agrée FDFP' : 'En Instruction'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal Nouveau Dossier FDFP */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                <Plus size={18} className="text-indigo-600" /> Monter un Dossier d'Agrément FDFP
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDossier} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Thème de la Formation</label>
                                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="ex: Négociation B2B, Lean Management, Sécurité..." />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Cabinet / Organisme Formateur Agréé</label>
                                <Input value={newProvider} onChange={e => setNewProvider(e.target.value)} required placeholder="ex: Cabinet Agréé FDFP Abidjan..." />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nombre de Salariés</label>
                                    <Input type="number" min="1" value={newParticipants} onChange={e => setNewParticipants(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Budget Total (FCFA)</label>
                                    <Input type="number" min="50000" step="50000" value={newBudget} onChange={e => setNewBudget(e.target.value)} required />
                                </div>
                            </div>

                            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 font-medium">
                                <span className="font-bold">Estimation Prise en Charge FDFP : </span>
                                environ {Math.round(newBudget * 0.9).toLocaleString()} FCFA (90% du coût pédagogique remboursable sur agrément préalable).
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 text-white font-bold">Valider le Dossier FDFP</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
