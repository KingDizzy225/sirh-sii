import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Award, Target, Users, Calendar, CheckCircle2, Clock, 
    AlertCircle, Search, Filter, ArrowRight, Star, ChevronRight, 
    Send, Download, Printer, ShieldCheck, Briefcase, Building2,
    FileText, UserCheck, MessageSquare, ThumbsUp, Sparkles, X,
    Bookmark, GraduationCap, MapPin, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

// Données de test réalistes pour la campagne 2026 (194 collaborateurs)
const MOCK_ENTRETIENS = [
    {
        id: 'EAP-2026-001',
        employeeId: 'emp-001',
        name: 'Raïssa Fofana',
        role: 'Lead Développeur Fullstack',
        department: 'Informatique & SI',
        agency: 'Pôle Technique Grand-Bassam',
        manager: 'Marc Koffi (DG)',
        statut: 'SIGNE', // 'NON_INITIE', 'AUTO_EVAL', 'ENTRETIEN_FAIT', 'ARBITRAGE_RH', 'SIGNE'
        scorePerformance: 4.8,
        tauxObjectifs: 105,
        souhaitFormation: 'Architecture Cloud AWS & Cybersécurité Télécom',
        souhaitMobilite: 'Maintien au Pôle Tech (Grand-Bassam)',
        dateEntretien: '12 Nov 2026',
        commentaires: 'Excellente maîtrise technique. Leadership naturel sur la refonte du SIRH.'
    },
    {
        id: 'EAP-2026-002',
        employeeId: 'emp-002',
        name: 'Kouamé Jean-Luc',
        role: 'Conseiller Clientèle Réseau',
        department: 'Commercial & Relation Client',
        agency: 'Siège & Plateau Pyramide',
        manager: 'Oumar Diallo',
        statut: 'ARBITRAGE_RH',
        scorePerformance: 4.2,
        tauxObjectifs: 98,
        souhaitFormation: 'Techniques de négociation Grands Comptes B2B',
        souhaitMobilite: 'Évolution souhaitée vers Agence Cocody',
        dateEntretien: '14 Nov 2026',
        commentaires: 'Très bonne régularité. Forte satisfaction client au guichet Plateau.'
    },
    {
        id: 'EAP-2026-003',
        employeeId: 'emp-003',
        name: 'Amani Sylvie',
        role: 'Superviseur Centre d\'Appels',
        department: 'Support & Rétention',
        agency: 'Cocody Riviera Palmeraie',
        manager: 'Oumar Diallo',
        statut: 'ENTRETIEN_FAIT',
        scorePerformance: 4.5,
        tauxObjectifs: 102,
        souhaitFormation: 'Management d\'équipe & Gestion du stress client',
        souhaitMobilite: 'Maintien Agence Cocody',
        dateEntretien: '15 Nov 2026',
        commentaires: 'Taux de décroché supérieur à 94%. Très bon encadrement des juniors.'
    },
    {
        id: 'EAP-2026-004',
        employeeId: 'emp-004',
        name: 'Blaise Koffi',
        role: 'Responsable Comptabilité & Paie',
        department: 'Finance & Comptabilité',
        agency: 'Siège & Plateau Pyramide',
        manager: 'Marc Koffi (DG)',
        statut: 'SIGNE',
        scorePerformance: 4.9,
        tauxObjectifs: 100,
        souhaitFormation: 'Audit Fiscal OHADA & IFRS Avancé',
        souhaitMobilite: 'Siège Plateau uniquement',
        dateEntretien: '10 Nov 2026',
        commentaires: 'Rigueur absolue sur les déclarations CNPS et la paie sans aucun litige.'
    },
    {
        id: 'EAP-2026-005',
        employeeId: 'emp-005',
        name: 'Yao Anderson',
        role: 'Technicien Fibre & Réseau Optique',
        department: 'Opérations & Logistique',
        agency: 'Yopougon Bel Air Express',
        manager: 'Raïssa Fofana',
        statut: 'AUTO_EVAL',
        scorePerformance: 3.9,
        tauxObjectifs: 92,
        souhaitFormation: 'Habilitation Travail en Hauteur Pylônes 4G/5G',
        souhaitMobilite: 'Ouvert à mutation San Pedro',
        dateEntretien: 'Planifié le 22 Nov',
        commentaires: 'Auto-évaluation complétée. Entretien N+1 à finaliser.'
    },
    {
        id: 'EAP-2026-006',
        employeeId: 'emp-006',
        name: 'Bamba Mariam',
        role: 'Gestionnaire Recouvrement B2B',
        department: 'Finance & Comptabilité',
        agency: 'Siège & Plateau Pyramide',
        manager: 'Blaise Koffi',
        statut: 'NON_INITIE',
        scorePerformance: null,
        tauxObjectifs: null,
        souhaitFormation: 'Non renseigné',
        souhaitMobilite: 'Non renseigné',
        dateEntretien: 'À planifier',
        commentaires: 'En attente d\'ouverture par le collaborateur.'
    }
];

export function CampagneEntretiensEap() {
    const [entretiens, setEntretiens] = useState(MOCK_ENTRETIENS);
    const [filterStatut, setFilterStatut] = useState('ALL');
    const [filterAgency, setFilterAgency] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEntretien, setSelectedEntretien] = useState(null);
    const [isArbitrating, setIsArbitrating] = useState(false);

    // Statistiques globales de la campagne 2026
    const stats = useMemo(() => {
        const total = 194;
        const signed = 78;
        const arbitrage = 24;
        const done = 32;
        const auto = 36;
        const notStarted = total - (signed + arbitrage + done + auto);
        const percent = Math.round(((signed + arbitrage + done) / total) * 100);
        return { total, signed, arbitrage, done, auto, notStarted, percent };
    }, []);

    // Filtrage dynamique
    const filteredList = useMemo(() => {
        return entretiens.filter(e => {
            const matchStatut = filterStatut === 'ALL' || e.statut === filterStatut;
            const matchAgency = filterAgency === 'ALL' || e.agency.includes(filterAgency);
            const matchSearch = !searchQuery.trim() || (
                e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchStatut && matchAgency && matchSearch;
        });
    }, [entretiens, filterStatut, filterAgency, searchQuery]);

    const handleSendReminder = () => {
        toast.success("Relances automatiques envoyées par email aux managers et collaborateurs en attente !");
    };

    const handleValidateArbitrage = (id) => {
        setEntretiens(prev => prev.map(e => e.id === id ? { ...e, statut: 'SIGNE' } : e));
        toast.success("Entretien validé par la DRH et transmis pour archivage certifié !");
        setSelectedEntretien(null);
    };

    return (
        <div className="flex-1 space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 font-sans selection:bg-[#002B7F] selection:text-white">
            
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* EN-TÊTE PRINCIPAL : STYLE CORPORATE SII (BLEU MARINE & VERT)   */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-blue-50 text-[#002B7F] border border-blue-100">
                            <Award size={20} />
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Campagne des Entretiens Annuels & Professionnels (EAP)
                        </h1>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Session 2026
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Évaluation des objectifs SMART, soft skills, détection des talents et besoins de formation FDFP Côte d'Ivoire.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        onClick={handleSendReminder}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl cursor-pointer"
                    >
                        <Send size={14} className="mr-1.5 text-[#002B7F]" />
                        Relancer les Retardataires
                    </Button>

                    <Button
                        onClick={() => window.print()}
                        className="bg-[#002B7F] hover:bg-[#001F5C] text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md shadow-blue-900/15 cursor-pointer"
                    >
                        <Download size={14} className="mr-1.5" />
                        Exporter Rapport DRH
                    </Button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* COCKPIT DE PROGRESSION DE LA CAMPAGNE                         */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Avancement Global */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Avancement Global</span>
                            <span className="text-xs font-bold text-[#002B7F]">{stats.percent}%</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-2">
                            {stats.signed + stats.arbitrage + stats.done} <span className="text-xs font-normal text-slate-500">/ {stats.total}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-[#002B7F] h-full rounded-full transition-all duration-500" style={{ width: `${stats.percent}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Clôturés & Signés */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Signés Conjointement</span>
                            <CheckCircle2 size={16} className="text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-emerald-700 mt-2">{stats.signed}</div>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">Validés et archivés légalement</p>
                    </CardContent>
                </Card>

                {/* 3. Arbitrage DRH en attente */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">En Arbitrage DRH</span>
                            <Clock size={16} className="text-amber-500" />
                        </div>
                        <div className="text-2xl font-black text-amber-700 mt-2">{stats.arbitrage}</div>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">À valider par la Direction RH</p>
                    </CardContent>
                </Card>

                {/* 4. En attente ou non initiés */}
                <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Non Finalisés</span>
                            <AlertCircle size={16} className="text-slate-400" />
                        </div>
                        <div className="text-2xl font-black text-slate-700 mt-2">{stats.auto + stats.notStarted}</div>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">Date limite : 15 Décembre 2026</p>
                    </CardContent>
                </Card>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* FILTRES & RECHERCHE AVANCÉE                                  */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                
                {/* Filtre statut */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {[
                        { id: 'ALL', label: 'Tous' },
                        { id: 'ARBITRAGE_RH', label: 'Arbitrage DRH (24)' },
                        { id: 'ENTRETIEN_FAIT', label: 'Entretien Fait' },
                        { id: 'AUTO_EVAL', label: 'Auto-évaluation' },
                        { id: 'SIGNE', label: 'Signé (78)' },
                        { id: 'NON_INITIE', label: 'Non Initié' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilterStatut(f.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterStatut === f.id
                                    ? 'bg-[#002B7F] text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Barre de recherche */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <Input
                        placeholder="Rechercher collaborateur, manager..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 h-9 w-60 bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#002B7F]"
                    />
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TABLEAU DES DOSSIERS D'ÉVALUATION                            */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Card className="rounded-2xl border-slate-200 shadow-xs bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                                <th className="p-4 pl-6">Collaborateur & Poste</th>
                                <th className="p-4">Agence SII</th>
                                <th className="p-4">Manager Évaluateur</th>
                                <th className="p-4">Score & Objectifs</th>
                                <th className="p-4">Statut Workflow</th>
                                <th className="p-4 text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredList.map(item => {
                                const initials = item.name.split(' ').map(n => n[0]).join('').substring(0, 2);
                                
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                        
                                        {/* Collaborateur */}
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#002B7F] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                                                    <div className="text-slate-500 text-[11px] font-medium">{item.role}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Agence */}
                                        <td className="p-4 font-medium text-slate-700">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 size={13} className="text-[#002B7F]" />
                                                <span>{item.agency}</span>
                                            </div>
                                        </td>

                                        {/* Manager */}
                                        <td className="p-4 font-medium text-slate-700">
                                            <div className="flex items-center gap-1.5">
                                                <UserCheck size={13} className="text-emerald-600" />
                                                <span>{item.manager}</span>
                                            </div>
                                        </td>

                                        {/* Score / Objectifs */}
                                        <td className="p-4">
                                            {item.scorePerformance ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-slate-800 text-sm flex items-center gap-0.5">
                                                        <Star size={13} className="text-amber-500 fill-amber-500" />
                                                        {item.scorePerformance}/5
                                                    </span>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        {item.tauxObjectifs}% obj.
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">En attente</span>
                                            )}
                                        </td>

                                        {/* Statut Badge */}
                                        <td className="p-4">
                                            {item.statut === 'SIGNE' && (
                                                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                                                    Signé & Clôturé
                                                </Badge>
                                            )}
                                            {item.statut === 'ARBITRAGE_RH' && (
                                                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] animate-pulse">
                                                    Arbitrage DRH requis
                                                </Badge>
                                            )}
                                            {item.statut === 'ENTRETIEN_FAIT' && (
                                                <Badge className="bg-blue-50 text-[#002B7F] border-blue-200 text-[10px]">
                                                    Entretien N+1 réalisé
                                                </Badge>
                                            )}
                                            {item.statut === 'AUTO_EVAL' && (
                                                <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
                                                    Auto-évaluation en cours
                                                </Badge>
                                            )}
                                            {item.statut === 'NON_INITIE' && (
                                                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                                                    Non initié
                                                </Badge>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right pr-6">
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedEntretien(item)}
                                                className="bg-slate-100 hover:bg-[#002B7F] text-slate-700 hover:text-white font-bold text-xs h-8 px-3 rounded-lg transition-colors cursor-pointer"
                                            >
                                                Ouvrir le Dossier
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TIROIR MODAL : DÉTAIL & ARBITRAGE DU DOSSIER EAP               */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {selectedEntretien && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Header Modal */}
                            <div className="bg-[#002B7F] p-6 text-white flex justify-between items-start shrink-0">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full mb-1 inline-block">
                                        Réf : {selectedEntretien.id}
                                    </span>
                                    <h3 className="text-xl font-bold">{selectedEntretien.name}</h3>
                                    <p className="text-blue-100 text-xs mt-0.5">{selectedEntretien.role} · {selectedEntretien.agency}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedEntretien(null)}
                                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Corps du dossier */}
                            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                                
                                {/* Évaluation synthétique */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                        <span className="text-slate-400 font-bold uppercase text-[10px]">Taux d'atteinte des Objectifs</span>
                                        <div className="text-xl font-black text-slate-900 mt-1">
                                            {selectedEntretien.tauxObjectifs || 0}%
                                        </div>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                        <span className="text-slate-400 font-bold uppercase text-[10px]">Note Globale Performance</span>
                                        <div className="text-xl font-black text-amber-600 mt-1 flex items-center gap-1">
                                            <Star size={18} className="fill-amber-500 text-amber-500" />
                                            {selectedEntretien.scorePerformance || 'N/A'}/5
                                        </div>
                                    </div>
                                </div>

                                {/* Synthèse de l'Entretien N+1 */}
                                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                                    <div className="flex items-center gap-2 text-[#002B7F] font-bold">
                                        <MessageSquare size={14} />
                                        <span>Avis & Appréciation du Manager Évaluateur ({selectedEntretien.manager})</span>
                                    </div>
                                    <p className="text-slate-700 italic leading-relaxed">
                                        "{selectedEntretien.commentaires}"
                                    </p>
                                </div>

                                {/* Souhaits de Formation (Plan FDFP CI) */}
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                                        <GraduationCap size={15} className="text-emerald-600" />
                                        <span>Besoins de Formation Souhaités (Catalogue FDFP 2026)</span>
                                    </div>
                                    <p className="text-slate-600 font-medium pl-6">
                                        {selectedEntretien.souhaitFormation}
                                    </p>
                                </div>

                                {/* Souhaits de Mobilité Géographique Inter-Agences */}
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                                        <MapPin size={15} className="text-[#002B7F]" />
                                        <span>Mobilité Géographique & Évolution de Carrière</span>
                                    </div>
                                    <p className="text-slate-600 font-medium pl-6">
                                        {selectedEntretien.souhaitMobilite}
                                    </p>
                                </div>

                                {/* Bloc de validation / Arbitrage DRH */}
                                {selectedEntretien.statut === 'ARBITRAGE_RH' && (
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                                        <div className="flex items-center gap-2 font-bold">
                                            <ShieldCheck size={16} className="text-amber-600" />
                                            <span>Arbitrage & Validation Finale DRH</span>
                                        </div>
                                        <p className="text-xs text-amber-800">
                                            En validant, le dossier sera officiellement réputé clos, les demandes de formation seront versées au plan FDFP 2026 et le compte-rendu sera scellé numériquement.
                                        </p>
                                        <Button
                                            onClick={() => handleValidateArbitrage(selectedEntretien.id)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 rounded-xl cursor-pointer"
                                        >
                                            <Check size={15} className="mr-1.5" />
                                            Valider l'Entretien & Notifier le Salarié
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Footer Modal */}
                            <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                                <span className="text-[11px] text-slate-500">
                                    Dernière mise à jour : {selectedEntretien.dateEntretien}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedEntretien(null)}
                                    className="border-slate-200 text-slate-700 h-9 px-4 font-bold rounded-xl"
                                >
                                    Fermer
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
