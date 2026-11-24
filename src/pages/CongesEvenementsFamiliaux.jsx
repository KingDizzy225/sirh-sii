import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, Baby, Calendar, FileText, CheckCircle2, Clock, 
    AlertCircle, Upload, Download, ShieldCheck, Plus, X, 
    Building2, UserCheck, Eye, Sparkles, Check, Church
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

// Barème officiel Code du Travail CI & Convention Collective
const BAREME_LEGAL_CI = [
    { id: 'MARIAGE_SALARIE', motif: 'Mariage du Travailleur', jours: 4, pieceRequise: 'Acte ou Certificat de Mariage', badge: 'Famille' },
    { id: 'MARIAGE_ENFANT', motif: 'Mariage d\'un Enfant', jours: 2, pieceRequise: 'Acte de Mariage de l\'enfant', badge: 'Famille' },
    { id: 'PATERNITE', motif: 'Paternité (Naissance au Foyer)', jours: 3, pieceRequise: 'Extrait d\'Acte de Naissance', badge: 'Naissance' },
    { id: 'MATERNITE_CNPS', motif: 'Maternité (14 Semaines)', jours: 98, pieceRequise: 'Certificat Médical Grossesse & Déclaration CNPS', badge: 'Maternité' },
    { id: 'DECES_PROCHE', motif: 'Décès Conjoint, Enfant, Père, Mère', jours: 6, pieceRequise: 'Certificat de Décès / Inhumation', badge: 'Deuil' },
    { id: 'DECES_COLLATERAL', motif: 'Décès Frère, Sœur, Beaux-parents', jours: 3, pieceRequise: 'Certificat de Décès', badge: 'Deuil' },
    { id: 'PELERINAGE', motif: 'Pèlerinage Religieux (Mecque / Jérusalem)', jours: 30, pieceRequise: 'Attestation Officielle Pèlerinage', badge: 'Spiritualité' },
    { id: 'MUTATION_AGENCE', motif: 'Déménagement suite à Mutation d\'Agence', jours: 2, pieceRequise: 'Ordre de Mutation RH', badge: 'Mobilité' }
];

// Historique des demandes
const MOCK_DEMANDES_FAMILLE = [
    {
        id: 'FAM-2026-081',
        employeeName: 'Kouamé Jean-Luc',
        role: 'Conseiller Clientèle',
        agency: 'Siège & Plateau Pyramide',
        motif: 'Paternité (Naissance au Foyer)',
        joursAccordes: 3,
        dateDebut: '2026-11-20',
        dateFin: '2026-11-23',
        pieceJustificative: 'Extrait_Naissance_Kouame_Junior.pdf',
        statut: 'VALIDE_RH', // 'EN_ATTENTE_PIECE', 'VALIDE_RH', 'REJETE'
        remboursementCnps: null,
        impactSoldeAnnuel: 0 // Non décompté légalement
    },
    {
        id: 'FAM-2026-082',
        employeeName: 'Amani Sylvie',
        role: 'Superviseur Télécoms',
        agency: 'Cocody Riviera Palmeraie',
        motif: 'Maternité (14 Semaines)',
        joursAccordes: 98,
        dateDebut: '2026-12-01',
        dateFin: '2027-03-08',
        pieceJustificative: 'Certificat_Grossesse_Clinique_Farah.pdf',
        statut: 'VALIDE_RH',
        remboursementCnps: 'Bordereau CNPS N° 84920 (Prise en charge 100%)',
        impactSoldeAnnuel: 0
    },
    {
        id: 'FAM-2026-083',
        employeeName: 'Yao Anderson',
        role: 'Technicien Fibre',
        agency: 'Yopougon Bel Air Express',
        motif: 'Mariage du Travailleur',
        joursAccordes: 4,
        dateDebut: '2026-11-27',
        dateFin: '2026-12-01',
        pieceJustificative: 'Certificat_Mariage_Mairie_Yopougon.pdf',
        statut: 'EN_ATTENTE_RH',
        remboursementCnps: null,
        impactSoldeAnnuel: 0
    }
];

export function CongesEvenementsFamiliaux() {
    const [demandes, setDemandes] = useState(MOCK_DEMANDES_FAMILLE);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [selectedBareme, setSelectedBareme] = useState(BAREME_LEGAL_CI[0].id);
    const [formEmployee, setFormEmployee] = useState('');
    const [formDateDebut, setFormDateDebut] = useState('');
    const [formFile, setFormFile] = useState(null);

    const activeBareme = useMemo(() => {
        return BAREME_LEGAL_CI.find(b => b.id === selectedBareme) || BAREME_LEGAL_CI[0];
    }, [selectedBareme]);

    const handleCreateDemande = (e) => {
        e.preventDefault();
        if (!formEmployee.trim() || !formDateDebut) {
            toast.error("Veuillez renseigner le collaborateur et la date de début.");
            return;
        }

        const newDemande = {
            id: `FAM-2026-0${demandes.length + 84}`,
            employeeName: formEmployee,
            role: 'Collaborateur SII',
            agency: 'Siège & Plateau Pyramide',
            motif: activeBareme.motif,
            joursAccordes: activeBareme.jours,
            dateDebut: formDateDebut,
            dateFin: 'Calculée selon barème',
            pieceJustificative: formFile ? formFile.name : `${activeBareme.pieceRequise}_En_Attente.pdf`,
            statut: 'VALIDE_RH',
            remboursementCnps: activeBareme.id === 'MATERNITE_CNPS' ? 'Bordereau CNPS généré' : null,
            impactSoldeAnnuel: 0
        };

        setDemandes([newDemande, ...demandes]);
        toast.success(`Demande de congé spécial enregistrée (${activeBareme.jours} jours ouvrés accordés, solde annuel préservé) !`);
        setIsNewModalOpen(false);
        setFormEmployee('');
        setFormDateDebut('');
        setFormFile(null);
    };

    return (
        <div className="flex-1 space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 font-sans selection:bg-[#002B7F] selection:text-white">
            
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* EN-TÊTE : CONGÉS ÉVÉNEMENTS FAMILIAUX & MATERNITÉ            */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-blue-50 text-[#002B7F] border border-blue-100">
                            <Heart size={20} />
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Congés Événements Familiaux & Maternité CNPS
                        </h1>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Code du Travail CI
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Congés légaux exceptionnels rémunérés à 100% avec justificatif obligatoire (sans décompte du solde de congés payés).
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        onClick={() => setIsNewModalOpen(true)}
                        className="bg-[#002B7F] hover:bg-[#001F5C] text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md shadow-blue-900/15 cursor-pointer"
                    >
                        <Plus size={15} className="mr-1.5" />
                        Nouvelle Déclaration d'Événement
                    </Button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* BARÈME LÉGAL OFFICIEL EN GRILLE VISUELLE                     */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#002B7F]" />
                    Barème des Droits Légaux en Vigueur (Côte d'Ivoire)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {BAREME_LEGAL_CI.slice(0, 4).map(b => (
                        <div key={b.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{b.badge}</span>
                                <span className="text-lg font-black text-emerald-700">+{b.jours} jours</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">{b.motif}</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                Justificatif : <span className="text-slate-700">{b.pieceRequise}</span>
                            </p>
                            <span className="text-[10px] text-emerald-600 font-bold block pt-1">
                                ✓ Rémunéré à 100% · Solde préservé
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* REGISTRE DES CONGÉS FAMILIAUX ACCORDÉS                       */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Card className="rounded-2xl border-slate-200 shadow-xs bg-white overflow-hidden">
                <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Registre des Absences Légales d'Événements Familiaux
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Suivi des actes d'état civil et bordereaux de prise en charge CNPS
                        </CardDescription>
                    </div>
                    <Badge className="bg-blue-50 text-[#002B7F] border-blue-200 text-xs">
                        {demandes.length} dossiers actifs
                    </Badge>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                                <th className="p-4 pl-6">Collaborateur</th>
                                <th className="p-4">Agence</th>
                                <th className="p-4">Motif Légal</th>
                                <th className="p-4">Durée Légale</th>
                                <th className="p-4">Période d'Absence</th>
                                <th className="p-4">Pièce Justificative</th>
                                <th className="p-4 text-right pr-6">Statut Légal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {demandes.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="p-4 pl-6 font-bold text-slate-900 text-sm">
                                        {d.employeeName}
                                    </td>
                                    <td className="p-4 text-slate-600 font-medium">
                                        {d.agency}
                                    </td>
                                    <td className="p-4 font-bold text-[#002B7F]">
                                        {d.motif}
                                    </td>
                                    <td className="p-4 font-black text-emerald-700 text-sm">
                                        +{d.joursAccordes} j
                                    </td>
                                    <td className="p-4 text-slate-600 font-medium">
                                        Du {d.dateDebut} au {d.dateFin}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                                            <FileText size={13} className="text-[#002B7F]" />
                                            <span className="truncate max-w-[160px]">{d.pieceJustificative}</span>
                                        </span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        {d.statut === 'VALIDE_RH' && (
                                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                                                Conforme & Validé
                                            </Badge>
                                        )}
                                        {d.statut === 'EN_ATTENTE_RH' && (
                                            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                                                Contrôle Acte en cours
                                            </Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* MODAL : NOUVELLE DÉCLARATION                                 */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isNewModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-[#002B7F] p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">Déclarer un Événement Familial Légal</h3>
                                    <p className="text-blue-100 text-xs">Code du Travail CI · Congé payé exceptionnel</p>
                                </div>
                                <button
                                    onClick={() => setIsNewModalOpen(false)}
                                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateDemande} className="p-6 space-y-4 text-xs">
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">Nom et Prénom du Salarié *</label>
                                    <Input
                                        required
                                        placeholder="Ex: Raïssa Fofana"
                                        value={formEmployee}
                                        onChange={e => setFormEmployee(e.target.value)}
                                        className="h-10 text-xs rounded-xl"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">Type d'Événement Légal *</label>
                                    <select
                                        value={selectedBareme}
                                        onChange={e => setSelectedBareme(e.target.value)}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#002B7F]"
                                    >
                                        {BAREME_LEGAL_CI.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.motif} (+{b.jours} jours)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-700">
                                    <span className="font-bold text-[#002B7F] block mb-0.5">Droit Légal Accordé :</span>
                                    <span>+{activeBareme.jours} jours ouvrés rémunérés sans déduction du solde annuel.</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">Date de Début *</label>
                                    <Input
                                        type="date"
                                        required
                                        value={formDateDebut}
                                        onChange={e => setFormDateDebut(e.target.value)}
                                        className="h-10 text-xs rounded-xl"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">
                                        Pièce Justificative ({activeBareme.pieceRequise}) *
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => setFormFile(e.target.files[0])}
                                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#002B7F] hover:file:bg-blue-100 cursor-pointer"
                                    />
                                </div>

                                <div className="pt-2 flex gap-2">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-[#002B7F] hover:bg-[#001F5C] text-white font-bold h-11 rounded-xl shadow-md shadow-blue-900/15 cursor-pointer"
                                    >
                                        Enregistrer et Valider les Droits
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsNewModalOpen(false)}
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
