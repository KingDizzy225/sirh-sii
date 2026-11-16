import React, { useState, useEffect } from 'react';
import { Power, Fuel, AlertTriangle, CheckCircle2, Clock, Plus, Zap, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function GasoilGroupe() {
    const [donnees, setDonnees] = useState({ groupes: [], seuilCritiqueAlerte: '40%' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formGasoil, setFormGasoil] = useState({
        agenceNom: 'Agence Orange Yopougon Siporex',
        litresDemandes: 100,
        motif: 'Délestage prolongé CIE - Sécurisation alimentation boutique'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/gasoil-groupe/statuts');
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

    const commanderGasoil = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/gasoil-groupe/commander-gasoil', formGasoil);
            setModalOuverte(false);
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
                        <Power className="w-7 h-7 text-amber-500" />
                        Passeport Énergie & Maintenance Groupe Électrogène d'Agence
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Surveillance du niveau de gasoil et avitaillement d'urgence pour garantir zéro coupure en boutique lors des délestages CIE
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Commander Ravitaillement Gasoil
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.groupes.map((grp) => (
                    <motion.div key={grp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className={`shadow-sm border-l-4 ${grp.alerteSeuilBas ? 'border-l-red-500 bg-red-50/20' : 'border-l-emerald-500'}`}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {grp.agenceNom}
                                    </CardTitle>
                                    <Badge className={grp.alerteSeuilBas ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600 text-white'}>
                                        {grp.alerteSeuilBas ? 'Niveau Critique' : 'Optimal'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">{grp.modeleGroupe}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span>Niveau réservoir : {grp.litresRestants}L / {grp.capaciteReservoirLitres}L</span>
                                        <span className={grp.niveauActuelPourcent < 40 ? 'text-red-600 font-bold' : 'text-slate-700'}>
                                            {grp.niveauActuelPourcent}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${grp.niveauActuelPourcent < 40 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${grp.niveauActuelPourcent}%` }} />
                                    </div>
                                </div>

                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>⚡ <strong>Statut :</strong> {grp.statutFonctionnement}</p>
                                    <p>⏳ <strong>Autonomie estimée :</strong> ~{grp.autonomieEstimeeHeures} heures continues</p>
                                    <p>⛽ <strong>Fournisseur agréé :</strong> {grp.fournisseurGasoil}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>{grp.derniereLivraisonGasoil}</span>
                                    {grp.ticketRavitaillementAuto && (
                                        <span className="font-mono text-red-600 font-bold">{grp.ticketRavitaillementAuto}</span>
                                    )}
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
                            <Fuel className="w-5 h-5 text-amber-500" />
                            Commande de Ravitaillement Gasoil
                        </h3>
                        <form onSubmit={commanderGasoil} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Agence / Boutique</label>
                                <Input required value={formGasoil.agenceNom} onChange={(e) => setFormGasoil({ ...formGasoil, agenceNom: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Quantité demandée (Litres)</label>
                                <Input type="number" min="50" max="200" step="10" required value={formGasoil.litresDemandes} onChange={(e) => setFormGasoil({ ...formGasoil, litresDemandes: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Motif</label>
                                <Input required value={formGasoil.motif} onChange={(e) => setFormGasoil({ ...formGasoil, motif: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Confirmer l'Avitaillement</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
