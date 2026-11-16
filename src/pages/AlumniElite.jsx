import React, { useState, useEffect } from 'react';
import { Award, Star, TrendingUp, Sparkles, Quote, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function AlumniElite() {
    const [donnees, setDonnees] = useState({ alumni: [], tauxPromotionInterneSii: '74%' });
    const [chargement, setChargement] = useState(true);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/alumni-elite/portraits');
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

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
                        Mur des Alumni & Parcours d'Élite SII (De la Boutique à la Direction)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Inspirer les nouveaux arrivants à travers les success stories réelles des anciens conseillers et animateurs de terrain
                    </p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> {donnees.tauxPromotionInterneSii || '74% des managers actuels sont issus du terrain'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donnees.alumni.map((a) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-md border-t-4 border-t-amber-500 bg-gradient-to-b from-white to-amber-50/20">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 font-bold text-lg flex items-center justify-center border-2 border-amber-400">
                                            {a.photoInitiale}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-slate-900">
                                                {a.nom}
                                            </CardTitle>
                                            <p className="text-xs font-bold text-amber-600">{a.posteActuel}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-slate-900 text-amber-400 font-bold">{a.badge}</Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Origine : <strong>{a.posteOrigine}</strong> • Ancienneté : <strong>{a.anneesAnciennete} ans</strong>
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-3 bg-white rounded-lg border border-amber-100 shadow-sm relative text-xs text-slate-700 italic">
                                    <Quote className="w-5 h-5 text-amber-300 absolute -top-2.5 -left-1 opacity-70" />
                                    <p className="relative z-10 pl-3">"{a.citationInspirante}"</p>
                                </div>

                                <div className="p-2.5 bg-amber-50/70 rounded-lg text-xs text-amber-900">
                                    💡 <strong>Conseil aux nouvelles recrues :</strong> {a.conseilAuxJuniors}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
