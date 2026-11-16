import React, { useState, useEffect } from 'react';
import { ShieldAlert, DollarSign, Cpu, CheckCircle2, AlertTriangle, Scale, Lock, Plus, FileText, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function AuditCaissesSim() {
    const [donnees, setDonnees] = useState({ audits: [], indicateurs: {} });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formAudit, setFormAudit] = useState({
        agence: 'Agence Orange Plateau République',
        caissierNom: '',
        encaissementDeclareFcfa: 3500000,
        activationsSimSysteme: 110,
        ecartConstatFcfa: 0
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/audit-caisses-sim/statut');
            if (res.data && res.data.succes) {
                setDonnees(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreAudit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/audit-caisses-sim/valider-cloture', formAudit);
            setModalOuverte(false);
            setFormAudit({ agence: 'Agence Orange Plateau République', caissierNom: '', encaissementDeclareFcfa: 3500000, activationsSimSysteme: 110, ecartConstatFcfa: 0 });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Scale className="w-7 h-7 text-emerald-700" />
                        Audit Trail Caisses & Réconciliation Cartes SIM / UV
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Rapprochement automatisé entre les clôtures de caisse journalières et les activations effectives sur le réseau Orange CI
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Enregistrer un Audit de Caisse
                </Button>
            </div>

            {/* Statistiques KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux d'Équilibre Caisses</p>
                            <p className="text-2xl font-bold text-emerald-700">{donnees.indicateurs.tauxConformiteGlobal || '98.8%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Fonds Sécurisés ce Jour</p>
                            <p className="text-xl font-bold text-slate-900">{(donnees.indicateurs.totalFondsSecurisesJourFcfa || 13170000).toLocaleString('fr-FR')} F</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Écarts en Cours d'Examen</p>
                            <p className="text-2xl font-bold text-amber-700">
                                {donnees.audits.filter(a => a.statutAudit !== 'PARFAIT_EQUILIBRE').length} caisse(s)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Protocole Brinks / Banque</p>
                            <p className="text-xs font-bold text-purple-800">Scellage sécurisé J+1</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registre des Clôtures de Caisse */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Procès-Verbaux de Réconciliation Caisse vs Ventes SIM</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {donnees.audits.map((aud) => {
                        const estEquilibre = aud.statutAudit === 'PARFAIT_EQUILIBRE';
                        return (
                            <motion.div key={aud.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                                <Card className={`border shadow-sm flex flex-col justify-between h-full bg-white ${
                                    estEquilibre ? 'border-slate-200' : 'border-amber-300 bg-amber-50/10'
                                }`}>
                                    <CardHeader className="pb-3 border-b border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <Badge className={
                                                estEquilibre ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                                            }>
                                                {aud.statutAudit.replace(/_/g, ' ')}
                                            </Badge>
                                            <span className="text-xs text-slate-400 font-mono">{aud.dateCloture}</span>
                                        </div>
                                        <CardTitle className="text-base font-bold text-slate-900 mt-2">
                                            {aud.agence}
                                        </CardTitle>
                                        <p className="text-xs text-slate-500">Caissier responsable : <span className="font-semibold text-slate-700">{aud.caissierNom}</span></p>
                                    </CardHeader>

                                    <CardContent className="py-4 space-y-3 text-xs text-slate-700">
                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500">Encaissement Déclaré :</span>
                                            <span className="font-bold text-slate-900">{aud.encaissementDeclareFcfa.toLocaleString('fr-FR')} FCFA</span>
                                        </div>

                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500">Activations SIM Système :</span>
                                            <span className="font-semibold text-blue-700">{aud.activationsSimSysteme} cartes SIM</span>
                                        </div>

                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500">Écart Constaté :</span>
                                            <span className={`font-bold ${aud.ecartConstatFcfa === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {aud.ecartConstatFcfa === 0 ? '0 FCFA (Équilibré)' : `${aud.ecartConstatFcfa.toLocaleString('fr-FR')} FCFA`}
                                            </span>
                                        </div>

                                        <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                                            <p className="font-mono text-[10px] text-slate-500">Lot contrôlé : {aud.lotSimVerifie}</p>
                                            <p className="text-slate-700 italic">{aud.observationAudit}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Modal déclaration audit */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Scale className="w-5 h-5 text-emerald-700" />
                                Procès-Verbal de Réconciliation Caisse
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={soumettreAudit} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Agence de Clôture</label>
                                <Input 
                                    value={formAudit.agence} 
                                    onChange={(e) => setFormAudit({ ...formAudit, agence: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Nom du Caissier Déclarant</label>
                                <Input 
                                    value={formAudit.caissierNom} 
                                    onChange={(e) => setFormAudit({ ...formAudit, caissierNom: e.target.value })}
                                    placeholder="Ex: Sylvie Konan"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Encaissement Réel (FCFA)</label>
                                    <Input 
                                        type="number"
                                        value={formAudit.encaissementDeclareFcfa} 
                                        onChange={(e) => setFormAudit({ ...formAudit, encaissementDeclareFcfa: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-700">SIM Activées</label>
                                    <Input 
                                        type="number"
                                        value={formAudit.activationsSimSysteme} 
                                        onChange={(e) => setFormAudit({ ...formAudit, activationsSimSysteme: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Écart Détecté (0 si équilibre)</label>
                                <Input 
                                    type="number"
                                    value={formAudit.ecartConstatFcfa} 
                                    onChange={(e) => setFormAudit({ ...formAudit, ecartConstatFcfa: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white">Sceller le Procès-Verbal</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default AuditCaissesSim;
