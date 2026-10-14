import React, { useState, useEffect } from 'react';
import { 
    Trophy, Flame, TrendingUp, Sparkles, Plus, Award, 
    Wifi, Smartphone, Wallet, RefreshCw, Star, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function AgenceBattle() {
    const [donnees, setDonnees] = useState({ agences: [], challenges: [] });
    const [chargement, setChargement] = useState(true);
    const [modalVente, setModalVente] = useState(false);
    const [formVente, setFormVente] = useState({ agenceId: '', typeVente: 'FIBRE', quantite: 1 });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/battle/leaderboard');
            if (res.data) setDonnees(res.data);
        } catch (e) {
            console.error('Erreur chargement battle:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
        const t = setInterval(charger, 15000);
        return () => clearInterval(t);
    }, []);

    const enregistrerVente = async (e) => {
        e.preventDefault();
        try {
            await api.post('/battle/saisir-vente', formVente);
            setModalVente(false);
            await charger();
        } catch (e) {
            console.error('Erreur saisie vente:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <Trophy className="w-8 h-8 text-amber-200 animate-bounce" />
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-orange-200">Challenge Commercial Télécom</span>
                            <h1 className="text-3xl font-black tracking-tight">Agence Battle & Live League SII</h1>
                            <p className="text-orange-100 text-sm mt-1">
                                Classement en temps réel des boutiques Orange CI partenaires — Ventes Fibre, SIM & Orange Money
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => {
                            if (donnees.agences[0]) setFormVente({...formVente, agenceId: donnees.agences[0].id});
                            setModalVente(true);
                        }} 
                        className="bg-white text-orange-700 hover:bg-orange-50 font-bold shadow-lg"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Enregistrer une performance
                    </Button>
                </div>
            </div>

            {/* Challenges en cours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donnees.challenges.map((c) => (
                    <Card key={c.id} className="border-orange-200 bg-linear-to-br from-amber-50 to-orange-50/50">
                        <CardContent className="p-6 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-900 text-lg">{c.titre}</h3>
                                <Badge className="bg-orange-500 text-white">Fin : {c.dateFin}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
                            <div className="p-3 bg-white/80 rounded-xl border border-orange-200/60 text-xs flex justify-between items-center">
                                <span className="text-slate-500">🏆 En tête du sprint :</span>
                                <span className="font-bold text-orange-700">{c.leaderActuel}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Classement des Agences */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-600" />
                    Classement Général de la Semaine
                </h2>

                <div className="space-y-4">
                    {donnees.agences.map((ag, index) => {
                        const top1 = index === 0;
                        const top2 = index === 1;
                        const top3 = index === 2;

                        return (
                            <motion.div key={ag.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className={`border transition-all ${top1 ? 'border-amber-300 bg-amber-50/40 shadow-md ring-2 ring-amber-300/40' : 'border-slate-200 bg-white'}`}>
                                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
                                                top1 ? 'bg-amber-400 text-slate-950 shadow-md' :
                                                top2 ? 'bg-slate-300 text-slate-900' :
                                                top3 ? 'bg-amber-700 text-white' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                #{ag.rang}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 text-lg">{ag.nom}</h3>
                                                    {top1 && <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">👑 Leader</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">{ag.zone} • {ag.etoileMois}</p>
                                            </div>
                                        </div>

                                        {/* KPIs */}
                                        <div className="grid grid-cols-3 gap-6 text-center border-y md:border-y-0 md:border-x border-slate-200 py-3 md:py-0 md:px-8 w-full md:w-auto">
                                            <div>
                                                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                                                    <Wifi className="w-3.5 h-3.5 text-blue-500" /> Fibre
                                                </p>
                                                <p className="text-lg font-black text-slate-900 mt-0.5">{ag.boxFibreVendues}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                                                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> SIM/eSIM
                                                </p>
                                                <p className="text-lg font-black text-slate-900 mt-0.5">{ag.simActivees}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                                                    <Wallet className="w-3.5 h-3.5 text-orange-500" /> OM (MFcfa)
                                                </p>
                                                <p className="text-lg font-black text-slate-900 mt-0.5">{(ag.volumeOmFcfa / 1000000).toFixed(1)}</p>
                                            </div>
                                        </div>

                                        {/* Score Points */}
                                        <div className="text-right shrink-0 w-full md:w-36 flex md:flex-col justify-between items-center md:items-end">
                                            <span className="text-2xl font-black text-orange-600">{ag.scorePoints.toLocaleString()} pts</span>
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                {ag.progression} vs sem. passée
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Saisie Rapide Vente */}
            {modalVente && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Enregistrer une performance boutique</h3>
                        <form onSubmit={enregistrerVente} className="space-y-4 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Agence concernée</label>
                                <select 
                                    value={formVente.agenceId} 
                                    onChange={e => setFormVente({...formVente, agenceId: e.target.value})}
                                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                                    required
                                >
                                    {donnees.agences.map(a => (
                                        <option key={a.id} value={a.id}>{a.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Type de produit</label>
                                <select 
                                    value={formVente.typeVente} 
                                    onChange={e => setFormVente({...formVente, typeVente: e.target.value})}
                                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                                >
                                    <option value="FIBRE">🚀 Box Fibre Orange (+50 pts)</option>
                                    <option value="SIM">📲 Activation SIM / eSIM (+10 pts)</option>
                                    <option value="OM">💰 Palier 100k Orange Money (+25 pts)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Quantité réalisée</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="50" 
                                    value={formVente.quantite} 
                                    onChange={e => setFormVente({...formVente, quantite: e.target.value})}
                                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                                    required 
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3">
                                <Button type="button" variant="outline" onClick={() => setModalVente(false)}>Annuler</Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">Valider la performance</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
