import React, { useState, useEffect } from 'react';
import { Banknote, Zap, CheckCircle2, AlertCircle, Plus, Wallet, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function SosMicroAvance() {
    const [donnees, setDonnees] = useState({ avances: [], plafondMaximumFcfa: 30000, delaiMoyenMinutes: 2 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formAvance, setFormAvance] = useState({
        employeNom: '',
        montantFcfa: 20000,
        motifUrgence: '',
        canalPaiement: 'Orange Money',
        telephonePaiement: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/sos-micro-avance/historique');
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

    const soumettreAvance = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/sos-micro-avance/demander', formAvance);
            setModalOuverte(false);
            setFormAvance({
                employeNom: '',
                montantFcfa: 20000,
                motifUrgence: '',
                canalPaiement: 'Orange Money',
                telephonePaiement: ''
            });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Zap className="w-7 h-7 text-amber-500" />
                        SOS Dépannage Numéraire Express (Micro-Avance OM / Wave)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Déblocage d'urgence immédiat en 2 minutes (10 000 à 30 000 FCFA) sans frais ni intérêts pour urgence santé ou transport
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Demander une Micro-Avance Flash
                </Button>
            </div>

            {/* Cartes métriques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs uppercase text-amber-800 font-bold">Plafond Instantané</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-amber-900">{donnees.plafondMaximumFcfa?.toLocaleString('fr-FR')} FCFA</p>
                        <p className="text-xs text-amber-700 mt-1">Viré directement sur votre compte mobile</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs uppercase text-blue-800 font-bold">Délai Moyen Virement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-blue-900">~{donnees.delaiMoyenMinutes} minutes</p>
                        <p className="text-xs text-blue-700 mt-1">API Orange Money & Wave Entreprise</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs uppercase text-emerald-800 font-bold">Taux d'Intérêt</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-emerald-900">0 % (Solidarité SII)</p>
                        <p className="text-xs text-emerald-700 mt-1">Régularisation sur le bulletin de fin de mois</p>
                    </CardContent>
                </Card>
            </div>

            {/* Historique */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.avances.map((a) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {a.employeNom} ({a.matricule})
                                    </CardTitle>
                                    <Badge className="bg-emerald-600 text-white">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {a.statutVirement}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Motif : <strong>{a.motifUrgence}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>💳 <strong>Versement sur :</strong> {a.canalPaiement}</p>
                                    <p className="font-mono text-slate-500">Réf : {a.referenceTransaction}</p>
                                    <p className="text-slate-600">📅 Remboursement : {a.remboursementPrevu}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs">
                                    <span className="text-amber-700 font-bold text-base">
                                        {a.montantFcfa?.toLocaleString('fr-FR')} FCFA
                                    </span>
                                    <span className="text-slate-400">{a.dateDemande}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Demande de Micro-Avance SOS
                        </h3>
                        <form onSubmit={soumettreAvance} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input required value={formAvance.employeNom} onChange={(e) => setFormAvance({ ...formAvance, employeNom: e.target.value })} placeholder="Ex: Germain Brou" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Montant souhaité (Max 30 000 FCFA)</label>
                                <Input type="number" max="30000" min="5000" step="5000" required value={formAvance.montantFcfa} onChange={(e) => setFormAvance({ ...formAvance, montantFcfa: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Canal de réception</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formAvance.canalPaiement} onChange={(e) => setFormAvance({ ...formAvance, canalPaiement: e.target.value })}>
                                    <option value="Orange Money">Orange Money</option>
                                    <option value="Wave">Wave</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Numéro Mobile de Réception</label>
                                <Input required value={formAvance.telephonePaiement} onChange={(e) => setFormAvance({ ...formAvance, telephonePaiement: e.target.value })} placeholder="+225 07 XX XX XX XX" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Motif d'urgence</label>
                                <Input required value={formAvance.motifUrgence} onChange={(e) => setFormAvance({ ...formAvance, motifUrgence: e.target.value })} placeholder="Ex: Achat médicaments enfant en clinique" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Déclencher le Virement</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
