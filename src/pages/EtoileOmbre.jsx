import React, { useState, useEffect } from 'react';
import { 
    Star, Award, Trophy, Heart, Sparkles, Plus, 
    ThumbsUp, MessageSquare, Building2, User 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function EtoileOmbre() {
    const [palmares, setPalmares] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [candidatSelectionne, setCandidatSelectionne] = useState(null);
    const [motEncouragement, setMotEncouragement] = useState('');

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/etoile-ombre/palmares');
            if (res.data) setPalmares(res.data.palmares || []);
        } catch (e) {
            console.error('Erreur chargement étoiles de l\'ombre:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const voter = async (e) => {
        e.preventDefault();
        if (!candidatSelectionne) return;
        try {
            await api.post('/etoile-ombre/voter', {
                candidatId: candidatSelectionne.id,
                motEncouragement
            });
            setModalOuverte(false);
            setMotEncouragement('');
            await charger();
        } catch (e) {
            console.error('Erreur vote étoile ombre:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <Star className="w-8 h-8 text-amber-300 animate-pulse fill-amber-300" />
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-purple-200">Reconnaissance Métiers Supports</span>
                            <h1 className="text-3xl font-black tracking-tight">Trophée de l'Étoile de l'Ombre</h1>
                            <p className="text-purple-100 text-sm mt-1">
                                Célébration mensuelle des piliers discrets mais essentiels : agents d'entretien, vigiles et techniciens de nos agences
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nominés & Palmarès */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {palmares.map((c) => (
                    <Card key={c.id} className="border-purple-200 bg-linear-to-b from-white to-purple-50/20 shadow-md">
                        <CardHeader className="p-6 pb-3 border-b border-purple-100 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-xl">{c.employeNom}</h3>
                                <p className="text-xs font-medium text-purple-700">{c.poste}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{c.siteNom} • {c.mois}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-amber-500 flex items-center justify-end gap-1">
                                    <Star className="w-6 h-6 fill-amber-500" /> {c.votesRecueillis}
                                </span>
                                <span className="text-xs text-slate-400">votes collègues</span>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-4">
                            {c.tropheeDecerne && (
                                <div className="p-3 bg-amber-100/70 border border-amber-300 text-amber-950 rounded-2xl text-xs font-bold flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Trophy className="w-4 h-4 text-amber-600" /> Vainqueur du Mois & Trophée d'Honneur
                                    </span>
                                    <span>+{c.primeSpecialeOMFcfa?.toLocaleString()} FCFA (Orange Money)</span>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-bold text-slate-700 mb-2">Témoignages de reconnaissance de l'équipe :</h4>
                                <div className="space-y-2">
                                    {c.commentairesEquipe?.map((msg, idx) => (
                                        <p key={idx} className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-purple-100 leading-relaxed">
                                            {msg}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <Button 
                                onClick={() => {
                                    setCandidatSelectionne(c);
                                    setModalOuverte(true);
                                }}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2"
                            >
                                <ThumbsUp className="w-4 h-4" /> Voter pour {c.employeNom.split(' ')[0]}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Vote */}
            {modalOuverte && candidatSelectionne && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Voter pour {candidatSelectionne.employeNom}</h3>
                        <form onSubmit={voter} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">
                                    Laissez un mot d'encouragement ou de remerciement :
                                </label>
                                <textarea 
                                    rows={3}
                                    value={motEncouragement}
                                    onChange={e => setMotEncouragement(e.target.value)}
                                    placeholder="Ex: Merci pour ta disponibilité et ton aide précieuse au quotidien !"
                                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">Confirmer mon vote</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
