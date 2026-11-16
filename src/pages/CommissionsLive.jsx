import React, { useState, useEffect } from 'react';
import { 
    Calculator, TrendingUp, Sparkles, Trophy, 
    Wifi, Smartphone, Wallet, ArrowRight, Award 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function CommissionsLive() {
    const [donnees, setDonnees] = useState({ conseillers: [], reglesCalcul: {} });
    const [chargement, setChargement] = useState(true);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/commissions-live/mon-compteur');
            if (res.data) setDonnees(res.data);
        } catch (e) {
            console.error('Erreur commissions live:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const regles = donnees.reglesCalcul || {};

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <TrendingUp className="w-8 h-8 text-emerald-200 animate-pulse" />
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-200">Rémunération Variable Transparente</span>
                            <h1 className="text-3xl font-black tracking-tight">Simulateur & Compteur de Commissions en Direct</h1>
                            <p className="text-emerald-100 text-sm mt-1">
                                Visibilité quotidienne sur les primes générées par vente (Fibre, SIM, OM) et déblocage des paliers bonus
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Règles de prime claires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600"><Wifi className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-500">Box Fibre Orange</p>
                            <p className="text-base font-bold text-slate-900">{regles.primeBoxFibre || '2 500 FCFA / box'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600"><Smartphone className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-500">Activation SIM / eSIM</p>
                            <p className="text-base font-bold text-slate-900">{regles.primeSimEsim || '500 FCFA / sim'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600"><Wallet className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-500">Palier Orange Money</p>
                            <p className="text-base font-bold text-slate-900">{regles.primePalierOM || '5 000 FCFA / million'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cartes conseillers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donnees.conseillers?.map((c) => (
                    <Card key={c.id} className="border-emerald-200 bg-white shadow-md">
                        <CardHeader className="p-6 pb-3 border-b border-emerald-100 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{c.employeNom}</h3>
                                <p className="text-xs text-slate-500">{c.siteNom} • {c.mois}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-emerald-600">{c.totalCommissionsFcfa.toLocaleString()} FCFA</span>
                                <Badge className="block mt-1 bg-amber-500 text-slate-950 font-bold text-[10px]">
                                    {c.palierActuel}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-slate-400">Fibre vendue</span>
                                    <p className="font-black text-slate-800 text-base">{c.ventesFibre}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">SIM activées</span>
                                    <p className="font-black text-slate-800 text-base">{c.ventesSim}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Paliers OM</span>
                                    <p className="font-black text-slate-800 text-base">{c.volumeOmPalier}</p>
                                </div>
                            </div>

                            {c.prochainPalier && (
                                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                                    <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                                        <Trophy className="w-4 h-4 text-amber-600" /> Prochain Palier : {c.prochainPalier.nom}
                                    </p>
                                    <p className="text-slate-700">
                                        Plus que <strong>{c.prochainPalier.ventesManquantes} ventes Fibre</strong> pour débloquer le super-bonus de <strong>+{c.prochainPalier.bonusAdditionnelFcfa.toLocaleString()} FCFA</strong> !
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
