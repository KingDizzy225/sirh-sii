import React, { useState, useEffect } from 'react';
import { 
    Key, Lock, ShieldCheck, CheckCircle2, UserCheck, 
    Clock, Building2, Plus, ArrowRightLeft, ShieldAlert 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function ClesCoffres() {
    const [passations, setPassations] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formPassation, setFormPassation] = useState({
        siteNom: 'Agence Orange Plateau Postel 2001',
        elementCle: 'Clé Coffre-Fort & Armoire SIM',
        remisPar: '',
        recuPar: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/cles-coffres/passations');
            if (res.data) setPassations(res.data.passations || []);
        } catch (e) {
            console.error('Erreur chargement clés:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettrePassation = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cles-coffres/transmettre', formPassation);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur transmission clé:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                            <Key className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Registre Coffre & Gestion des Clés d'Agence</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Traçabilité infalsifiable des clés physiques, trousseaux d'alarme et ouvertures de coffre-fort
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-bold shadow-md">
                        <ArrowRightLeft className="w-4 h-4" /> Enregistrer une Passation de Clé
                    </Button>
                </div>
            </div>

            {/* Liste des détentions actives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {passations.map((p) => (
                    <Card key={p.id} className="border-slate-200 bg-white">
                        <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">{p.elementCle}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3.5 h-3.5" /> {p.siteNom}
                                </p>
                            </div>
                            <Badge className="bg-emerald-600 text-white text-xs">EN MAIN</Badge>
                        </CardHeader>

                        <CardContent className="p-5 pt-2 space-y-3">
                            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Actuellement détenue par :</span>
                                    <span className="font-bold text-slate-900 text-sm">{p.recuPar}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Transmise par :</span>
                                    <span className="font-medium text-slate-700">{p.remisPar}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-slate-400">
                                    <span>Horodatage officiel :</span>
                                    <span className="font-mono">{p.heure}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Passation */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Passation de Clé d'Agence</h3>
                        <form onSubmit={soumettrePassation} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Clé ou trousseau concerné</label>
                                <Input value={formPassation.elementCle} onChange={e => setFormPassation({...formPassation, elementCle: e.target.value})} required />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Agence</label>
                                <Input value={formPassation.siteNom} onChange={e => setFormPassation({...formPassation, siteNom: e.target.value})} required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Remis par</label>
                                    <Input value={formPassation.remisPar} onChange={e => setFormPassation({...formPassation, remisPar: e.target.value})} placeholder="Ex: Kouassi Konan" required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Reçu par</label>
                                    <Input value={formPassation.recuPar} onChange={e => setFormPassation({...formPassation, recuPar: e.target.value})} placeholder="Ex: Aïcha Traoré" required />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Confirmer la passation</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
