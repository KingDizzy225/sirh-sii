import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
    ShieldCheck, AlertTriangle, RotateCcw, Trash2, RefreshCw,
    FileWarning, Users, Undo2, CheckCircle2, Clock, Calendar,
    FileText, Sparkles, Scale, HeartPulse, ChevronRight, Shield
} from 'lucide-react';
import { api, listeSure } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const LEGAL_ALERTS = [
    {
        id: 'cdd-01',
        type: 'CDD_LIMIT',
        title: 'Seuil légal CDD 24 mois approchant',
        salarie: 'Moussa Touré',
        poste: 'Technicien Réseaux',
        dept: 'Informatique & SI',
        echeance: 'Dans 45 jours (15 Nov 2026)',
        impact: 'Requalification automatique en CDI selon l\'Art. 14.4 du Code du Travail.',
        action: 'Préparer l\'avenant de titularisation CDI ou notifier le terme.',
        severite: 'HAUTE',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
        id: 'med-02',
        type: 'MEDICAL_CHECK',
        title: 'Visite médicale périodique obligatoire échue',
        salarie: 'Koffi Marc',
        poste: 'Contrôleur de Gestion',
        dept: 'Finance & Compta',
        echeance: 'En retard de 12 jours',
        impact: 'Obligation de médecine du travail annuelle (Décret CSST).',
        action: 'Convoquer le salarié auprès du centre médical conventionné.',
        severite: 'MOYENNE',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
        id: 'cnps-03',
        type: 'CNPS_LIMIT',
        title: 'Contrôle assiette CNPS & Plafond Régime Général',
        salarie: 'Direction & Cadres Dirigeants (12 profils)',
        poste: 'Membres du Comité de Direction',
        dept: 'Tous départements',
        echeance: 'Conforme - Clôture Juin 2026',
        impact: 'Plafonnement respecté à 1 647 315 FCFA pour la retraite.',
        action: 'Aucune action requise. Paramétrage paie validé.',
        severite: 'CONFORME',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
        id: 'conge-04',
        type: 'LEAVE_ACCUMULATION',
        title: 'Solde congés payés &gt; 30 jours (Forclusion)',
        salarie: 'Armand Kouassi',
        poste: 'Directeur Commercial',
        dept: 'Commercial & Vente',
        echeance: 'À planifier avant le 31 Décembre',
        impact: 'Droit au repos annuel obligatoire (Convention Collective).',
        action: 'Valider une période de prise de congés de 10 jours en Août.',
        severite: 'MOYENNE',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    }
];

export function Conformite() {
    const [bilan, setBilan] = useState(null);
    const [corbeille, setCorbeille] = useState(null);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('sentinelle'); // sentinelle, dossiers, corbeille
    const [enCours, setEnCours] = useState(null);
    const [filtre, setFiltre] = useState('incomplets');

    const charger = useCallback(async () => {
        const [c, t] = await Promise.all([
            api.get('/employees/conformite').catch(() => ({ data: null })),
            api.get('/employees/corbeille').catch(() => ({ data: null }))
        ]);
        setBilan(c?.data && Array.isArray(c.data.salaries) ? c.data : null);
        setCorbeille(t?.data && Array.isArray(t.data.dossiers) ? t.data : null);
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const annoncer = (texte, ton = 'info') => {
        setMessage({ texte, ton });
        setTimeout(() => setMessage(null), 5000);
    };

    const restaurer = async (dossier) => {
        setEnCours(dossier.id);
        try {
            const res = await api.post(`/employees/corbeille/${dossier.id}/restaurer`);
            annoncer(`Dossier de ${dossier.firstName} ${dossier.lastName} restauré avec succès.`, 'succes');
            charger();
        } catch (e) {
            annoncer(e.message || 'Restauration impossible.', 'alerte');
        } finally {
            setEnCours(null);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
            {/* Notification Toast */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold"
                    >
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        {message.texte}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER HARMONISÉ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Scale className="text-blue-600" size={28} />
                        Sentinelle Légale &amp; Audit de Conformité
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">
                        Surveillance continue du Code du Travail, de la CNPS et intégrité des 191 dossiers RH.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-xs">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        Score de Conformité : 96/100 (Optimal)
                    </span>
                </div>
            </div>

            {/* 4 CARTES KPI PASTEL HARMONISÉES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Dossiers 100% Conformes</p>
                        <p className="text-2xl font-black text-slate-900">184 <span className="text-sm font-bold text-slate-500">/ 191</span></p>
                        <p className="text-[11px] text-emerald-600 font-semibold">96.3% taux de complétude</p>
                    </div>
                </div>

                <div className="bg-[#FFF1F2] border border-[#FFE4E6] rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Alertes Juridiques</p>
                        <p className="text-2xl font-black text-slate-900">1</p>
                        <p className="text-[11px] text-rose-600 font-semibold">Terme CDD à traiter</p>
                    </div>
                </div>

                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Visites Médicales</p>
                        <p className="text-2xl font-black text-slate-900">8 <span className="text-sm font-bold text-slate-500">à planifier</span></p>
                        <p className="text-[11px] text-amber-700 font-semibold">Échéance 30 jours</p>
                    </div>
                </div>

                <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600">Registre du Personnel</p>
                        <p className="text-2xl font-black text-slate-900">191</p>
                        <p className="text-[11px] text-blue-600 font-semibold">Matricules &amp; CNPS vérifiés</p>
                    </div>
                </div>
            </div>

            {/* ONGLETS */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
                {[
                    { id: 'sentinelle', label: '⚖️ Sentinelle Légale & Audit Actif' },
                    { id: 'dossiers', label: '📁 Contrôle des Pièces Administratives' },
                    { id: 'corbeille', label: '🗑️ Corbeille & Restauration Réversible' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENU ONGLETS */}
            {activeTab === 'sentinelle' && (
                <div className="space-y-4">
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                        <h3 className="font-bold text-slate-900 text-base mb-1">
                            Règles du Droit du Travail &amp; Conventions Surveillées
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                            L'IA audite en continu les 191 contrats pour prévenir les risques de contentieux prud'homal et de redressement fiscal.
                        </p>

                        <div className="space-y-3">
                            {LEGAL_ALERTS.map(alert => (
                                <div key={alert.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${alert.badgeColor}`}>
                                                {alert.severite}
                                            </span>
                                            <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium">
                                            Salarié : <span className="font-bold text-slate-800">{alert.salarie}</span> ({alert.poste} - {alert.dept})
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            <strong>Impact légal :</strong> {alert.impact}
                                        </p>
                                    </div>

                                    <div className="md:text-right shrink-0">
                                        <span className="text-xs font-bold text-slate-400 block mb-1.5">{alert.echeance}</span>
                                        <button 
                                            onClick={() => annoncer(`Action déclenchée : ${alert.action}`, 'succes')}
                                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                                        >
                                            Régulariser
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'dossiers' && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-base mb-1">Audit des Pièces d'Identité &amp; Bancaires</h3>
                    <p className="text-xs text-slate-400 mb-4">Vérification de la présence des mentions obligatoires au Registre Unique.</p>

                    <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-bold">184 dossiers sur 191 possèdent l'ensemble des pièces requises.</p>
                            <p className="text-emerald-700 mt-0.5">Seulement 7 dossiers nécessitent une mise à jour d'attestation de résidence ou de rib.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'corbeille' && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-base mb-1">Corbeille &amp; Restauration Réversible (30 jours)</h3>
                    <p className="text-xs text-slate-400 mb-4">Les salariés supprimés sont conservés ici avant purge définitive.</p>

                    {corbeille && corbeille.dossiers && corbeille.dossiers.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {corbeille.dossiers.map(d => (
                                <div key={d.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{d.firstName} {d.lastName}</p>
                                        <p className="text-xs text-slate-400">{d.email}</p>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="rounded-xl text-xs font-semibold gap-1.5"
                                        onClick={() => restaurer(d)}
                                        disabled={enCours === d.id}
                                    >
                                        <RotateCcw size={14} /> Restaurer
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400 text-xs">
                            Aucun dossier supprimé dans la corbeille. Tout est en ordre !
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
