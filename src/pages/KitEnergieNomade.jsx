import React, { useState, useEffect } from 'react';
import { BatteryCharging, Zap, Smartphone, Plus, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function KitEnergieNomade() {
    const [donnees, setDonnees] = useState({ parc: [], normeTerrain: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formEchange, setFormEchange] = useState({
        animateurNom: '',
        motif: 'Batterie en fin de cycle / Baisse d\'autonomie sur stand'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/kit-energie-nomade/statuts');
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

    const soumettreEchange = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/kit-energie-nomade/demander-remplacement', formEchange);
            setModalOuverte(false);
            setFormEchange({ animateurNom: '', motif: 'Batterie en fin de cycle / Baisse d\'autonomie sur stand' });
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
                        <BatteryCharging className="w-7 h-7 text-amber-500" />
                        Dotation Énergie Nomade & Powerbanks Haute Capacité (Terrain & Caravanes)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Équipement des animateurs et coursiers pour garantir 0 panne de batterie sur les terminaux TPE et smartphones de vente
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Demander un Échange Standard
                </Button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold">
                ⚡ {donnees.normeTerrain || 'Garantie 0 panne pour TPE et box de démonstration mobile'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.parc.map((p) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {p.animateurNom} ({p.matricule})
                                    </CardTitle>
                                    <Badge className="bg-emerald-600 text-white">
                                        Santé {p.etatBatteriePourcent}%
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Équipe : <strong>{p.equipeTerrain}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>🔋 <strong>Modèle :</strong> {p.modeleBatterie}</p>
                                    <p className="font-mono text-slate-500">S/N : {p.numeroSerie}</p>
                                    <p className="text-emerald-700 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Compatible charge rapide TPE & Smartphones Orange
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Attribué le {p.dateAttribution}</span>
                                    <span className="font-bold text-slate-700">{p.statutDotation}</span>
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
                            <RefreshCw className="w-5 h-5 text-amber-500" />
                            Échange Standard Batterie Nomade
                        </h3>
                        <form onSubmit={soumettreEchange} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input required value={formEchange.animateurNom} onChange={(e) => setFormEchange({ ...formEchange, animateurNom: e.target.value })} placeholder="Ex: Jean Kouakou" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Motif du remplacement</label>
                                <Input required value={formEchange.motif} onChange={(e) => setFormEchange({ ...formEchange, motif: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Valider la Demande</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
