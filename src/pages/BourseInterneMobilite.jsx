import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, MapPin, Building2, Users, Search, Sparkles, 
    CheckCircle2, Clock, Send, ArrowRight, Star, Filter, 
    FileText, UserCheck, ShieldCheck, ChevronRight, X, 
    TrendingUp, ExternalLink, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

// Postes ouverts en priorité interne chez SII
const INTERNAL_JOB_OFFERS = [
    {
        id: 'JOB-2026-01',
        title: 'Superviseur des Ventes & Boutique',
        agency: 'Siège & Plateau Pyramide',
        department: 'Commercial & Relation Client',
        type: 'Mobilité Interne',
        closingDate: '2026-12-15',
        salaryRange: '750 000 - 900 000 FCFA',
        description: 'Pilotage de l\'équipe de conseillers clientèle de l\'agence Plateau Pyramide, atteinte des objectifs de vente fibre B2C et tenue des standards d\'accueil VIP.',
        requiredSkills: ['Management d\'équipe', 'Relation Client Télécom', 'Négociation B2C/B2B'],
        suggestedCandidates: [
            { name: 'Kouamé Jean-Luc', currentRole: 'Conseiller Clientèle Réseau', matchScore: 94 },
            { name: 'Amani Sylvie', currentRole: 'Superviseur Centre d\'Appels', matchScore: 88 }
        ]
    },
    {
        id: 'JOB-2026-02',
        title: 'Ingénieur Déploiement Fibre Optique',
        agency: 'Délégation Régionale San Pedro',
        department: 'Opérations & Logistique',
        type: 'Mutation Régionale',
        closingDate: '2026-12-20',
        salaryRange: '680 000 - 820 000 FCFA + Indemnité Logement',
        description: 'Supervision du raccordement des infrastructures portuaires et entreprises industrielles de San Pedro au réseau national SII.',
        requiredSkills: ['Fibre Optique FTTH', 'Gestion de Chantier', 'Permis B'],
        suggestedCandidates: [
            { name: 'Yao Anderson', currentRole: 'Technicien Fibre & Réseau Optique', matchScore: 96 }
        ]
    },
    {
        id: 'JOB-2026-03',
        title: 'Contrôleur de Gestion & Audit SoD',
        agency: 'Siège & Plateau Pyramide',
        department: 'Finance & Comptabilité',
        type: 'Promotion Interne',
        closingDate: '2026-12-10',
        salaryRange: '950 000 - 1 150 000 FCFA',
        description: 'Surveillance des habilitations bancaires, analyse des marges par agence et préparation du reporting trimestriel pour le Conseil d\'Administration.',
        requiredSkills: ['Comptabilité OHADA', 'Audit Interne', 'Contrôle SoD'],
        suggestedCandidates: [
            { name: 'Bamba Mariam', currentRole: 'Gestionnaire Recouvrement B2B', matchScore: 89 }
        ]
    }
];

export function BourseInterneMobilite() {
    const [offers] = useState(INTERNAL_JOB_OFFERS);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('ALL');

    // Formulaire de candidature interne
    const [candidateName, setCandidateName] = useState('');
    const [candidateMotivation, setCandidateMotivation] = useState('');

    const handleApply = (e) => {
        e.preventDefault();
        if (!candidateName.trim()) {
            toast.error("Veuillez renseigner votre nom.");
            return;
        }

        toast.success(`Candidature interne pour "${selectedOffer.title}" enregistrée en toute confidentialité auprès de la DRH !`);
        setIsApplyModalOpen(false);
        setCandidateName('');
        setCandidateMotivation('');
    };

    const filteredOffers = useMemo(() => {
        return offers.filter(o => {
            const matchAgency = selectedAgency === 'ALL' || o.agency.includes(selectedAgency);
            const matchSearch = !searchQuery.trim() || (
                o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.agency.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchAgency && matchSearch;
        });
    }, [offers, selectedAgency, searchQuery]);

    return (
        <div className="flex-1 space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 font-sans selection:bg-[#002B7F] selection:text-white">
            
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* EN-TÊTE : BOURSE INTERNE DES TALENTS                         */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-blue-50 text-[#002B7F] border border-blue-100">
                            <Briefcase size={20} />
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Bourse Interne des Talents & Mobilité Inter-Agences
                        </h1>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Priorité Collaborateurs
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Postes ouverts en priorité aux salariés SII avant tout recrutement externe · Matching intelligent de compétences.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-400 uppercase block">Taux de Promotion Interne</span>
                        <span className="text-lg font-black text-emerald-700">64% des postes</span>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* FILTRES PAR AGENCES                                         */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    {[
                        { id: 'ALL', label: 'Toutes les Opportunités' },
                        { id: 'Plateau', label: 'Siège Plateau' },
                        { id: 'San Pedro', label: 'San Pedro Régional' },
                        { id: 'Cocody', label: 'Cocody' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedAgency(f.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                selectedAgency === f.id
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
                        placeholder="Métier, compétence, agence..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 h-9 w-60 bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#002B7F]"
                    />
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* LISTE DES OFFRES D'EMPLOI INTERNES                           */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredOffers.map(job => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[#002B7F] transition-all flex flex-col justify-between group"
                    >
                        <div className="space-y-4">
                            
                            {/* Header offre */}
                            <div className="flex items-start justify-between gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#002B7F] border border-blue-200/60">
                                    <Building2 size={12} />
                                    {job.type}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                    Clôture : {job.closingDate}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#002B7F] transition-colors leading-snug">
                                    {job.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={13} className="text-emerald-600" />
                                        {job.agency}
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                {job.description}
                            </p>

                            {/* Rémunération */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Grille Salariale Proposée</span>
                                <span className="font-bold text-[#002B7F] font-mono mt-0.5 block">{job.salaryRange}</span>
                            </div>

                            {/* Matching IA / Vivier Interne */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles size={12} className="text-emerald-600" /> Salariés suggérés par compétences :
                                </span>
                                <div className="space-y-1.5">
                                    {job.suggestedCandidates.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/60">
                                            <span className="font-bold text-slate-800">{c.name}</span>
                                            <span className="text-[10px] font-black text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                                                {c.matchScore}% Match
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bouton Postuler */}
                        <div className="pt-5 mt-4 border-t border-slate-100 flex gap-2">
                            <Button
                                onClick={() => {
                                    setSelectedOffer(job);
                                    setIsApplyModalOpen(true);
                                }}
                                className="w-full bg-[#002B7F] hover:bg-[#001F5C] text-white font-bold text-xs h-10 rounded-xl shadow-md shadow-blue-900/15 cursor-pointer"
                            >
                                <Send size={14} className="mr-1.5" />
                                Postuler en Interne (Confidentiel)
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* MODAL : CANDIDATURE INTERNE CONFIDENTIELLE                   */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isApplyModalOpen && selectedOffer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-[#002B7F] p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">Candidature Mobilité Interne</h3>
                                    <p className="text-blue-100 text-xs">{selectedOffer.title} · {selectedOffer.agency}</p>
                                </div>
                                <button
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleApply} className="p-6 space-y-4 text-xs">
                                
                                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-start gap-2.5">
                                    <ShieldCheck size={18} className="shrink-0 text-emerald-700 mt-0.5" />
                                    <div>
                                        <span className="font-bold block">Garantie de Confidentialité DRH</span>
                                        <span>Votre manager N+1 ne sera informé qu'après validation de recevabilité de votre dossier par la Direction RH.</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">Votre Nom et Prénom *</label>
                                    <Input
                                        required
                                        placeholder="Ex: Kouamé Jean-Luc"
                                        value={candidateName}
                                        onChange={e => setCandidateName(e.target.value)}
                                        className="h-10 text-xs rounded-xl"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">Motivation & Valeur Ajoutée pour ce poste *</label>
                                    <textarea
                                        required
                                        placeholder="Précisez votre intérêt, vos réussites actuelles et votre disponibilité..."
                                        value={candidateMotivation}
                                        onChange={e => setCandidateMotivation(e.target.value)}
                                        className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#002B7F]"
                                    />
                                </div>

                                <div className="pt-2 flex gap-2">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-[#002B7F] hover:bg-[#001F5C] text-white font-bold h-11 rounded-xl shadow-md shadow-blue-900/15 cursor-pointer"
                                    >
                                        Transmettre ma Candidature
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsApplyModalOpen(false)}
                                        className="border-slate-200 text-slate-700 h-11 rounded-xl"
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
