import React, { useState, useEffect } from 'react';
import { 
    HeartHandshake, Gift, Users, Plus, CheckCircle2, 
    Calendar, Heart, Sparkles, AlertCircle, ShieldCheck 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function SolidariteConges() {
    const [donnees, setDonnees] = useState({ appels: [], dons: [] });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formDon, setFormDon] = useState({
        joursOfferts: 1,
        donateurAnonyme: true
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/solidarite-conges/campagnes');
            if (res.data) setDonnees(res.data);
        } catch (e) {
            console.error('Erreur solidarité congés:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreDon = async (e) => {
        e.preventDefault();
        try {
            await api.post('/solidarite-conges/donner', formDon);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur soumission don:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <HeartHandshake className="w-8 h-8 text-teal-200 animate-pulse" />
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-teal-200">Solidarité & Fraternité RH</span>
                            <h1 className="text-3xl font-black tracking-tight">Bourse aux Dons de Congés & Récupérations</h1>
                            <p className="text-teal-100 text-sm mt-1">
                                Cession anonyme de jours de repos et RTT pour soutenir un collègue confronté à une épreuve familiale grave
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-white text-teal-800 hover:bg-teal-50 font-bold shadow-lg">
                        <Heart className="w-4 h-4 mr-2 text-rose-500 fill-rose-500" /> Offrir 1 Jour de Récupération
                    </Button>
                </div>
            </div>

            {/* Appels de solidarité en cours */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Campagnes de Solidarité Actives</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {donnees.appels.map((a) => {
                        const progression = Math.min(100, Math.round((a.joursRecueillis / a.joursDemandes) * 100));
                        return (
                            <Card key={a.id} className="border-teal-200 bg-white shadow-xs">
                                <CardHeader className="p-6 pb-3 flex flex-row items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">Pour : {a.beneficiaireNom}</h3>
                                        <p className="text-xs text-slate-500">{a.siteNom}</p>
                                    </div>
                                    <Badge className="bg-teal-600 text-white text-xs">EN COURS</Badge>
                                </CardHeader>

                                <CardContent className="p-6 space-y-4">
                                    <p className="text-sm text-slate-700 leading-relaxed bg-teal-50/50 p-4 rounded-2xl border border-teal-100 italic">
                                        « {a.motif} »
                                    </p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-700">
                                            <span>Jours recueillis : {a.joursRecueillis} / {a.joursDemandes} jours</span>
                                            <span className="text-teal-700">{progression}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${progression}%` }} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Historique des dons fraternels */}
            <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Derniers gestes de fraternité enregistrés
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {donnees.dons.map((d) => (
                        <Card key={d.id} className="border-slate-200 bg-white">
                            <CardContent className="p-4 flex items-center justify-between text-xs">
                                <div>
                                    <p className="font-bold text-slate-900">{d.donateurNom}</p>
                                    <p className="text-slate-500">Pour {d.beneficiaireNom} • {d.dateDon}</p>
                                </div>
                                <Badge variant="success" className="px-2.5 py-1 text-xs">
                                    +{d.joursOfferts} jour(s) 🎁
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Modal de don */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Offrir un jour de récupération</h3>
                        <form onSubmit={soumettreDon} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre de jours à céder</label>
                                <Input type="number" min="1" max="5" value={formDon.joursOfferts} onChange={e => setFormDon({...formDon, joursOfferts: e.target.value})} required />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border">
                                <input type="checkbox" checked={formDon.donateurAnonyme} onChange={e => setFormDon({...formDon, donateurAnonyme: e.target.checked})} className="rounded text-teal-600 w-4 h-4" />
                                <span className="text-xs text-slate-700 font-medium">Faire ce don de manière anonyme</span>
                            </label>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold">Confirmer mon geste</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
