import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, AlertTriangle, Users, Building2, CheckCircle2, 
    Clock, ArrowRight, UserCheck, Search, Filter, ShieldAlert, 
    RefreshCw, Sparkles, X, Plus, Award, AlertCircle, Play, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

// Postes critiques pour la continuité de service SII Côte d'Ivoire
const INITIAL_POSTES_CRITIQUES = [
    {
        id: 'CRIT-01',
        title: 'Responsable Comptabilité & Déclarations Paie',
        department: 'Finance & Comptabilité',
        agency: 'Siège & Plateau Pyramide',
        holderName: 'Blaise Koffi',
        backupName: 'Bamba Mariam',
        backupRole: 'Gestionnaire Recouvrement B2B',
        autonomyLevel: 3, // 1: Observateur, 2: Partiel, 3: Pleine Autonomie 100%
        lastRelayTest: '2026-10-15',
        testResult: 'SUCCES',
        riskLevel: 'SECURISE', // 'SECURISE', 'EN_COURS', 'CRITIQUE'
        impactDescription: 'Blocage du virement bancaire mensuel des 194 salariés et des déclarations CNPS/ITS.'
    },
    {
        id: 'CRIT-02',
        title: 'Caissier Principal & Réconciliation SIM Orange',
        department: 'Commercial & Relation Client',
        agency: 'Agence Yopougon Bel Air Express',
        holderName: 'Koffi Blaise',
        backupName: 'Non Assigné',
        backupRole: 'Aucun suppléant certifié',
        autonomyLevel: 0,
        lastRelayTest: 'Aucun test',
        testResult: 'NON_TESTE',
        riskLevel: 'CRITIQUE', // Single Point of Failure
        impactDescription: 'Impossibilité d\'ouvrir le coffre et la caisse agence en cas d\'absence imprévue.'
    },
    {
        id: 'CRIT-03',
        title: 'Superviseur Cœur de Réseau & Astreinte NOC',
        department: 'Informatique & SI',
        agency: 'Pôle Technique Grand-Bassam',
        holderName: 'Raïssa Fofana',
        backupName: 'Yao Anderson',
        backupRole: 'Technicien Fibre & Réseau',
        autonomyLevel: 2,
        lastRelayTest: '2026-09-02',
        testResult: 'SUCCES_PARTIEL',
        riskLevel: 'EN_COURS',
        impactDescription: 'Rupture potentielle des liaisons inter-agences en cas d\'incident nocturne.'
    },
    {
        id: 'CRIT-04',
        title: 'Responsable Accueil & Caisse VIP',
        department: 'Commercial & Relation Client',
        agency: 'Cocody Riviera Palmeraie',
        holderName: 'Amani Sylvie',
        backupName: 'Kouamé Jean-Luc',
        backupRole: 'Conseiller Clientèle Réseau',
        autonomyLevel: 3,
        lastRelayTest: '2026-11-04',
        testResult: 'SUCCES',
        riskLevel: 'SECURISE',
        impactDescription: 'Détérioration du service client Grands Comptes et encaissements.'
    },
    {
        id: 'CRIT-05',
        title: 'Chef de Délégation Régionale & Caisse Portuaire',
        department: 'Opérations & Logistique',
        agency: 'Délégation Régionale San Pedro',
        holderName: 'Diallo Oumar',
        backupName: 'Non Assigné',
        backupRole: 'Recherche doublure interne',
        autonomyLevel: 0,
        lastRelayTest: 'Aucun test',
        testResult: 'NON_TESTE',
        riskLevel: 'CRITIQUE',
        impactDescription: 'Arrêt complet des opérations régionales de San Pedro.'
    }
];

export default function MatricePolyvalenceSuppleance() {
    const [postes, setPostes] = useState(INITIAL_POSTES_CRITIQUES);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRisk, setFilterRisk] = useState('ALL');
    const [selectedPosteForTest, setSelectedPosteForTest] = useState(null);

    // Calculs de résilience globale
    const stats = useMemo(() => {
        const total = postes.length;
        const securises = postes.filter(p => p.riskLevel === 'SECURISE').length;
        const enCours = postes.filter(p => p.riskLevel === 'EN_COURS').length;
        const critiques = postes.filter(p => p.riskLevel === 'CRITIQUE').length;
        const coverageRate = Math.round(((securises + (enCours * 0.5)) / total) * 100);
        return { total, securises, enCours, critiques, coverageRate };
    }, [postes]);

    const handleLaunchRelayTest = (id) => {
        setPostes(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    lastRelayTest: new Date().toISOString().split('T')[0],
                    testResult: 'SUCCES',
                    autonomyLevel: 3,
                    riskLevel: 'SECURISE'
                };
            }
            return p;
        }));
        toast.success("Test de suppléance 48h validé avec succès ! Le poste est désormais certifié sécurisé.");
        setSelectedPosteForTest(null);
    };

    const filteredPostes = useMemo(() => {
        return postes.filter(p => {
            const matchRisk = filterRisk === 'ALL' || p.riskLevel === filterRisk;
            const matchSearch = !searchQuery.trim() || (
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.backupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.agency.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchRisk && matchSearch;
        });
    }, [postes, filterRisk, searchQuery]);

    return (
        <div className="flex-1 space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 font-sans selection:bg-[#002B7F] selection:text-white">
            
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* EN-TÊTE : MATRICE DE POLYVALENCE & CONTINUITÉ DE SERVICE      */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-blue-50 text-[#002B7F] border border-blue-100">
                            <ShieldCheck size={20} />
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Matrice de Polyvalence & Suppléance des Postes Clés
                        </h1>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Plan de Continuité RH
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Élimination des points de défaillance uniques (*Single Point of Failure*) et certification des doublures opérationnelles en agence.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl cursor-pointer"
                    >
                        Imprimer l'Audit Continuité
                    </Button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* COCKPIT DE RÉSILIENCE OPÉRATIONNELLE                         */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Taux de couverture globale */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Taux de Résilience RH
                        </span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                            {stats.coverageRate}%
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                            <div className="bg-[#002B7F] h-full rounded-full" style={{ width: `${stats.coverageRate}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Postes 100% Sécurisés */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Postes avec Doublure Autonome
                        </span>
                        <div className="text-2xl font-black text-emerald-700 mt-1">
                            {stats.securises} <span className="text-xs font-semibold text-slate-500">/ {stats.total}</span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">Niveau 3 certifié (Test 48h validé)</p>
                    </CardContent>
                </Card>

                {/* 3. Postes en cours de transfert */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Suppléants en Formation
                        </span>
                        <div className="text-2xl font-black text-amber-600 mt-1">
                            {stats.enCours}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Autonomie partielle (Niveau 1 ou 2)</p>
                    </CardContent>
                </Card>

                {/* 4. Alertes Critiques (0 Backup) */}
                <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-xs">
                    <CardContent className="p-5">
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block flex items-center gap-1">
                            <AlertTriangle size={12} /> Postes Sans Aucun Suppléant
                        </span>
                        <div className="text-2xl font-black text-rose-700 mt-1">
                            {stats.critiques}
                        </div>
                        <p className="text-[11px] text-rose-800 font-medium mt-1">Risque de blocage immédiat</p>
                    </CardContent>
                </Card>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GUIDE D'ÉVALUATION DE L'AUTONOMIE DU SUPPLÉANT               */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span> Niveau 1 : Observateur
                    </span>
                    <p className="text-slate-500 text-[11px]">Connaît les procédures écrites mais n'a pas encore opéré sur le système réel.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-amber-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Niveau 2 : Autonomie Partielle
                    </span>
                    <p className="text-slate-500 text-[11px]">Capable d'exécuter 70% des tâches courantes sous supervision ponctuelle.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Niveau 3 : Pleine Autonomie
                    </span>
                    <p className="text-slate-500 text-[11px]">Opère à 100% sans aucune assistance. A réussi le test inopiné de 48h.</p>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TABLEAU DES POSTES CRITIQUES ET SUPPLÉANTS                   */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Card className="rounded-2xl border-slate-200 shadow-xs bg-white overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                        {[
                            { id: 'ALL', label: 'Tous les Postes' },
                            { id: 'CRITIQUE', label: 'Sans Backup (Critique)' },
                            { id: 'EN_COURS', label: 'En Formation' },
                            { id: 'SECURISE', label: 'Sécurisés (Niveau 3)' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilterRisk(f.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    filterRisk === f.id
                                        ? 'bg-[#002B7F] text-white shadow-xs'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <Input
                            placeholder="Rechercher poste, titulaire..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 pr-3 h-9 w-60 bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#002B7F]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                                <th className="p-4 pl-6">Poste Névralgique & Agence</th>
                                <th className="p-4">Titulaire Officiel</th>
                                <th className="p-4">Suppléant / Doublure Interne</th>
                                <th className="p-4">Niveau d'Autonomie</th>
                                <th className="p-4">Dernier Test 48h</th>
                                <th className="p-4">Statut Continuité</th>
                                <th className="p-4 text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPostes.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                    
                                    {/* Poste & Agence */}
                                    <td className="p-4 pl-6">
                                        <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                                            <Building2 size={12} className="text-[#002B7F]" />
                                            <span>{item.agency}</span>
                                        </div>
                                    </td>

                                    {/* Titulaire */}
                                    <td className="p-4 font-bold text-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-[#002B7F] text-white font-bold text-[10px] flex items-center justify-center">
                                                {item.holderName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span>{item.holderName}</span>
                                        </div>
                                    </td>

                                    {/* Suppléant */}
                                    <td className="p-4">
                                        {item.backupName === 'Non Assigné' ? (
                                            <span className="font-bold text-rose-600 flex items-center gap-1">
                                                <AlertCircle size={13} /> {item.backupName}
                                            </span>
                                        ) : (
                                            <div>
                                                <div className="font-bold text-emerald-800 flex items-center gap-1">
                                                    <UserCheck size={13} className="text-emerald-600" />
                                                    {item.backupName}
                                                </div>
                                                <div className="text-[10px] text-slate-400">{item.backupRole}</div>
                                            </div>
                                        )}
                                    </td>

                                    {/* Niveau d'autonomie */}
                                    <td className="p-4">
                                        {item.autonomyLevel === 3 && (
                                            <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px]">
                                                Niveau 3 (100% Autonome)
                                            </span>
                                        )}
                                        {item.autonomyLevel === 2 && (
                                            <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-[10px]">
                                                Niveau 2 (Partiel)
                                            </span>
                                        )}
                                        {item.autonomyLevel === 1 && (
                                            <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-[10px]">
                                                Niveau 1 (Observateur)
                                            </span>
                                        )}
                                        {item.autonomyLevel === 0 && (
                                            <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-[10px]">
                                                Niveau 0 (Inexistant)
                                            </span>
                                        )}
                                    </td>

                                    {/* Dernier Test 48h */}
                                    <td className="p-4 font-mono text-slate-600">
                                        {item.lastRelayTest}
                                    </td>

                                    {/* Statut Continuité */}
                                    <td className="p-4">
                                        {item.riskLevel === 'SECURISE' && (
                                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                                                ✓ Sécurisé
                                            </Badge>
                                        )}
                                        {item.riskLevel === 'EN_COURS' && (
                                            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                                                En Formation
                                            </Badge>
                                        )}
                                        {item.riskLevel === 'CRITIQUE' && (
                                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] animate-pulse">
                                                ⚠️ Risque Rupture
                                            </Badge>
                                        )}
                                    </td>

                                    {/* Action */}
                                    <td className="p-4 text-right pr-6">
                                        {item.backupName !== 'Non Assigné' ? (
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedPosteForTest(item)}
                                                className="bg-blue-50 hover:bg-[#002B7F] text-[#002B7F] hover:text-white font-bold text-xs h-8 px-3 rounded-xl transition-all cursor-pointer"
                                            >
                                                <Play size={12} className="mr-1" />
                                                Tester Relais 48h
                                            </Button>
                                        ) : (
                                            <span className="text-[11px] text-rose-500 font-bold">Assigner Doublure</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* MODAL : LANCEMENT DU TEST DE RELAIS 48H                      */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {selectedPosteForTest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-[#002B7F] p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">Certification du Relais de Continuité</h3>
                                    <p className="text-blue-100 text-xs">{selectedPosteForTest.title}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPosteForTest(null)}
                                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 text-xs">
                                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-slate-700 space-y-1">
                                    <span className="font-bold text-[#002B7F] block">Protocole de Passage de Témoin 48h :</span>
                                    <p className="leading-relaxed">
                                        Pendant 48 heures ouvrées, le titulaire ({selectedPosteForTest.holderName}) se met en retrait total et la doublure ({selectedPosteForTest.backupName}) prend les commandes exclusives des opérations de l'agence.
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Impact prévenu en cas de défaillance</span>
                                    <p className="font-semibold text-slate-800">{selectedPosteForTest.impactDescription}</p>
                                </div>

                                <div className="pt-2 flex gap-2">
                                    <Button
                                        onClick={() => handleLaunchRelayTest(selectedPosteForTest.id)}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-xl shadow-md shadow-emerald-900/15 cursor-pointer"
                                    >
                                        <CheckCircle2 size={15} className="mr-1.5" />
                                        Certifier le Relais à 100%
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedPosteForTest(null)}
                                        className="border-slate-200 text-slate-700 h-11 rounded-xl"
                                    >
                                        Annuler
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
