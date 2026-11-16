import React, { useState, useEffect } from 'react';
import { Trophy, Activity, Users, Plus, CheckCircle2, Calendar, Award, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function MaracanaLigue() {
    const [donnees, setDonnees] = useState({ classement: [], programme: [], edition: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formJoueur, setFormJoueur] = useState({
        nomJoueur: '',
        equipeSouhaitee: 'Les Éléphants de Yopougon (Siporex & Bel Air)',
        posteTerrain: 'Attaquant'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/maracana-ligue/tournoi');
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

    const inscrireJoueur = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/maracana-ligue/inscrire-joueur', formJoueur);
            setModalOuverte(false);
            setFormJoueur({ nomJoueur: '', equipeSouhaitee: 'Les Éléphants de Yopougon (Siporex & Bel Air)', posteTerrain: 'Attaquant' });
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
                        <Trophy className="w-7 h-7 text-emerald-600" />
                        Ligue Corporative Maracana & Fitness SII (Samedi Sport & Santé)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Tournoi inter-agences du samedi pour renforcer la cohésion, décompresser de la semaine et partager un moment de fête
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Rejoindre une Équipe Boutique
                </Button>
            </div>

            {/* Match de la semaine */}
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Badge className="bg-white/20 text-white mb-2">⚽ Prochain Choc au Sommet</Badge>
                        <h3 className="text-xl font-black">{donnees.programme[0]?.affiche}</h3>
                        <p className="text-xs text-emerald-100 mt-1">
                            📍 {donnees.programme[0]?.terrain} • 🕒 {donnees.programme[0]?.dateHeure}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-400 font-semibold inline-block">
                            🎉 {donnees.programme[0]?.animationTroisiemeMiTemps}
                        </span>
                    </div>
                </div>
            </div>

            {/* Classement */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Classement Général du Championnat SII
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-slate-100">
                        {donnees.classement.map((eq) => (
                            <div key={eq.rang} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm">
                                        #{eq.rang}
                                    </span>
                                    <div>
                                        <p className="font-bold text-slate-900">{eq.equipeNom}</p>
                                        <p className="text-xs text-slate-500">Capitaine : {eq.capitaine} • {eq.prochainMatch}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <span>{eq.matchsJoues} MJ</span>
                                    <span className="text-emerald-700">{eq.victoires} V</span>
                                    <span>{eq.butsPour} BP / {eq.butsContre} BC</span>
                                    <Badge className="bg-emerald-100 text-emerald-800 font-black text-sm">
                                        {eq.points} PTS
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-emerald-600" />
                            Inscription Joueur / Joueuse Maracana
                        </h3>
                        <form onSubmit={inscrireJoueur} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Votre Nom & Prénoms</label>
                                <Input required value={formJoueur.nomJoueur} onChange={(e) => setFormJoueur({ ...formJoueur, nomJoueur: e.target.value })} placeholder="Ex: Yves Kouassi" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Équipe de rattachement</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formJoueur.equipeSouhaitee} onChange={(e) => setFormJoueur({ ...formJoueur, equipeSouhaitee: e.target.value })}>
                                    <option value="Les Éléphants de Yopougon (Siporex & Bel Air)">Les Éléphants de Yopougon (Siporex & Bel Air)</option>
                                    <option value="Team Fibre & Techniciens Terrain">Team Fibre & Techniciens Terrain</option>
                                    <option value="FC Plateau Postel (Vente & Corporate)">FC Plateau Postel (Vente & Corporate)</option>
                                    <option value="Les Requins de Treichville">Les Requins de Treichville</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Poste préféré</label>
                                <Input required value={formJoueur.posteTerrain} onChange={(e) => setFormJoueur({ ...formJoueur, posteTerrain: e.target.value })} placeholder="Ex: Défenseur, Milieu, Gardien..." />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirmer Inscription</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
