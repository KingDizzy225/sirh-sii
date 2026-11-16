import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Flame, Zap, Shield, TrendingUp, Award, Plus, RefreshCw, Tv } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';

export function ChocDesGuichets() {
    const [duels, setDuels] = useState([]);
    const [classement, setClassement] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [miseAJourEnCours, setMiseAJourEnCours] = useState(false);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/choc-des-guichets/duels');
            if (res.data && res.data.success) {
                setDuels(res.data.duels);
                setClassement(res.data.classement);
            }
        } catch (err) {
            console.error('Erreur choc-des-guichets:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const marquerPoints = async (duelId, equipe, typeOperation) => {
        setMiseAJourEnCours(true);
        try {
            const res = await api.post('/api/choc-des-guichets/score', {
                duelId,
                equipe,
                typeOperation,
                valeur: 5
            });
            if (res.data && res.data.success) {
                charger();
            }
        } catch (err) {
            alert('Erreur enregistrement points duel');
        } finally {
            setMiseAJourEnCours(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Swords className="w-7 h-7 text-amber-500" />
                        Le Choc des Guichets : Battle Commerciale Live 1 vs 1
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Compétition en direct entre agences & boutiques Orange CI, scores télévisés et trophée tournant mensuel
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualiser Scores
                    </Button>
                    <Badge className="bg-red-600 text-white px-3 py-1 flex items-center gap-1.5 animate-pulse text-xs">
                        <Tv className="w-3.5 h-3.5" /> Wallboard TV Live
                    </Badge>
                </div>
            </div>

            {/* Duels en Cours */}
            <div className="space-y-6">
                {duels.map(duel => (
                    <Card key={duel.id} className="border-2 border-slate-800 bg-slate-950 text-white shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-red-900 px-6 py-3 flex items-center justify-between text-xs font-semibold">
                            <span className="flex items-center gap-2 text-amber-300">
                                <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                                {duel.titre}
                            </span>
                            <span className="text-amber-200">🏆 En jeu : {duel.primeEnJeu}</span>
                        </div>

                        <CardContent className="p-6">
                            {/* Défi Flash */}
                            <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                                <span className="text-xs text-amber-300 font-medium">⚡ DÉFI DU JOUR : {duel.defiFlash}</span>
                                <Badge className="bg-amber-500 text-slate-900 font-bold text-[10px]">COUP DOUBLE</Badge>
                            </div>

                            {/* Arène 1 vs 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                {/* VS Badge central */}
                                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black items-center justify-center shadow-lg border-2 border-white">
                                    VS
                                </div>

                                {/* Équipe A */}
                                <div className="bg-slate-900/90 rounded-2xl p-5 border border-blue-500/30 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-blue-400">{duel.equipeA.nom}</h3>
                                            <Badge className="bg-blue-600 text-white">{duel.equipeA.pointsTotal} PTS</Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-4">Capitaine : {duel.equipeA.leader} ({duel.equipeA.effectif} conseillers)</p>
                                        
                                        <div className="grid grid-cols-3 gap-2 text-center my-4">
                                            <div className="p-2 bg-slate-800 rounded-lg">
                                                <span className="text-xs text-slate-400 block">SIM 4G</span>
                                                <span className="text-lg font-bold text-white">{duel.equipeA.ventesSim}</span>
                                            </div>
                                            <div className="p-2 bg-slate-800 rounded-lg">
                                                <span className="text-xs text-slate-400 block">Fibre Box</span>
                                                <span className="text-lg font-bold text-white">{duel.equipeA.reabonnementsFibre}</span>
                                            </div>
                                            <div className="p-2 bg-slate-800 rounded-lg">
                                                <span className="text-xs text-slate-400 block">OM / Wave</span>
                                                <span className="text-lg font-bold text-white">{duel.equipeA.depotsOMWave}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                                        <Button 
                                            size="sm" 
                                            disabled={miseAJourEnCours}
                                            onClick={() => marquerPoints(duel.id, 'A', 'ventesSim')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1"
                                        >
                                            +5 SIM
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            disabled={miseAJourEnCours}
                                            onClick={() => marquerPoints(duel.id, 'A', 'reabonnementsFibre')}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex-1"
                                        >
                                            +1 Fibre
                                        </Button>
                                    </div>
                                </div>

                                {/* Équipe B */}
                                <div className="bg-slate-900/90 rounded-2xl p-5 border border-red-500/30 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-red-400">{duel.equipeB.nom}</h3>
                                            <Badge className="bg-red-600 text-white">{duel.equipeB.pointsTotal} PTS</Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-4">Capitaine : {duel.equipeB.leader} ({duel.equipeB.effectif} conseillers)</p>
                                        
                                        <div className="grid grid-cols-3 gap-2 text-center my-4">
                                            <div className="p-2 bg-slate-800 rounded-lg">
                                                <span className="text-xs text-slate-400 block">SIM 4G</span>
                                                <span className="text-lg font-bold text-white">{duel.equipeB.ventesSim}</span>
                                            </div>
                                            <div className="p-2 bg-slate-800 rounded-lg">
                                                <span className="text-xs text-slate-400 block">Fibre Box</span>
                                                <span className="text-lg font-bold text-white">{duel.equipeB.reabonnementsFibre}</span>
                                            </div>
                                            <div className="p-2 bg-slate-800 rounded-lg">
                                                <span className="text-xs text-slate-400 block">OM / Wave</span>
                                                <span className="text-lg font-bold text-white">{duel.equipeB.depotsOMWave}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                                        <Button 
                                            size="sm" 
                                            disabled={miseAJourEnCours}
                                            onClick={() => marquerPoints(duel.id, 'B', 'ventesSim')}
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs flex-1"
                                        >
                                            +5 SIM
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            disabled={miseAJourEnCours}
                                            onClick={() => marquerPoints(duel.id, 'B', 'reabonnementsFibre')}
                                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex-1"
                                        >
                                            +1 Fibre
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Classement Général de la Ligue des Guichets */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Classement Général de la Ligue des Agences Orange CI
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Rang</th>
                                <th className="px-4 py-3">Agence / Point de Vente</th>
                                <th className="px-4 py-3">Victoires</th>
                                <th className="px-4 py-3">Défaites</th>
                                <th className="px-4 py-3">Points Cumulés</th>
                                <th className="px-4 py-3">Taux de Réussite</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {classement.map((c, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-800">
                                        {c.rang === 1 ? '🥇 #1' : c.rang === 2 ? '🥈 #2' : c.rang === 3 ? '🥉 #3' : `#${c.rang}`}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-slate-900">{c.agence}</td>
                                    <td className="px-4 py-3 text-emerald-600 font-bold">{c.victoires} V</td>
                                    <td className="px-4 py-3 text-red-500">{c.defaites} D</td>
                                    <td className="px-4 py-3 font-mono font-bold text-indigo-700">{c.pointsCumules.toLocaleString()} pts</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                                            {c.ratioVictoire}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
