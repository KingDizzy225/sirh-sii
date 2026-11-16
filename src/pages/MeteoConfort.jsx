import React, { useState, useEffect } from 'react';
import { 
    Thermometer, AlertTriangle, CheckCircle2, Wrench, 
    Droplets, Wind, Clock, Building2, Plus, Sparkles 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function MeteoConfort() {
    const [agences, setAgences] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formAlerte, setFormAlerte] = useState({
        siteNom: 'Agence Orange Yopougon Siporex',
        temperatureRessentie: 33,
        etatClimatisation: 'EN_PANNE'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/meteo-confort/statuts');
            if (res.data) setAgences(res.data.agences || []);
        } catch (e) {
            console.error('Erreur chargement météo confort:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreAlerte = async (e) => {
        e.preventDefault();
        try {
            await api.post('/meteo-confort/signaler', formAlerte);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur signalement météo confort:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600">
                            <Thermometer className="w-6 h-6 animate-pulse" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Météo du Confort & Alerte Frigoriste Express</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Surveillance thermique des boutiques Orange, relance prioritaire clim et livraison d'eau minérale
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-bold shadow-md">
                        <AlertTriangle className="w-4 h-4" /> Signaler Panne Clim / Chaleur
                    </Button>
                </div>
            </div>

            {/* Liste des agences et statuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agences.map((a) => {
                    const estChaud = a.temperatureRessentie >= 30;
                    return (
                        <Card key={a.id} className={`border bg-white ${estChaud ? 'border-amber-300 shadow-md ring-1 ring-amber-300/40' : 'border-slate-200'}`}>
                            <CardHeader className="p-6 pb-3 flex flex-row items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{a.siteNom}</h3>
                                    <p className="text-xs text-slate-500">Dernier contrôle : {a.heureDernierSignalement}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-3xl font-black ${estChaud ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {a.temperatureRessentie}°C
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 space-y-4">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">État climatisation :</span>
                                        <Badge variant={a.etatClimatisation === 'OPTIMAL' ? 'success' : 'destructive'} className="text-[10px]">
                                            {a.etatClimatisation}
                                        </Badge>
                                    </div>
                                    {a.ticketFrigoriste && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Ticket Frigoriste :</span>
                                            <span className="font-mono font-bold text-orange-700">{a.ticketFrigoriste} (SLA 4h)</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-1 border-t border-slate-200">
                                        <span className="text-slate-500">Hydratation équipe :</span>
                                        <span className="font-semibold text-blue-700 flex items-center gap-1">
                                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                                            {a.packsEauLivres ? '4 packs d\'eau livrés ✅' : 'Eau disponible'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                                    💡 <strong>Mesure RH :</strong> {a.recommandationRh}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Modal Signalement */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Signaler un pic de chaleur en agence</h3>
                        <form onSubmit={soumettreAlerte} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Agence concernée</label>
                                <Input value={formAlerte.siteNom} onChange={e => setFormAlerte({...formAlerte, siteNom: e.target.value})} required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Température estimée (°C)</label>
                                    <Input type="number" min="18" max="45" value={formAlerte.temperatureRessentie} onChange={e => setFormAlerte({...formAlerte, temperatureRessentie: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">État Climatiseur</label>
                                    <select 
                                        value={formAlerte.etatClimatisation} 
                                        onChange={e => setFormAlerte({...formAlerte, etatClimatisation: e.target.value})}
                                        className="w-full p-2 border border-slate-300 rounded-xl"
                                    >
                                        <option value="EN_PANNE">En panne totale</option>
                                        <option value="DEGRADE">Souffle tiède / Dégradé</option>
                                        <option value="OPTIMAL">Normal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Déclencher l'alerte</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
