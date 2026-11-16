import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, PlayCircle, Sparkles, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function AcademieManager() {
    const [donnees, setDonnees] = useState({ capsules: [], scoreHebdoManager: '' });
    const [chargement, setChargement] = useState(true);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/academie-manager/capsules');
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

    const validerCapsule = async (capsuleId) => {
        try {
            await api.post('/api/academie-manager/valider-capsule', { capsuleId });
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
                        <PlayCircle className="w-7 h-7 text-indigo-600" />
                        Académie Minute du Néo-Manager SII (Micro-Learning 3 min)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Capsules quotidiennes de coaching pour accompagner les vendeurs promus chefs d'agence
                    </p>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Score Hebdo Managers : {donnees.scoreHebdoManager}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.capsules.map((c) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-indigo-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-indigo-100 text-indigo-800">{c.dureeMinutes} minutes chrono</Badge>
                                    <Badge className="bg-amber-100 text-amber-800 font-bold">{c.badgeDebloque}</Badge>
                                </div>
                                <CardTitle className="text-base font-bold text-slate-900 mt-2">
                                    {c.titre}
                                </CardTitle>
                                <p className="text-xs text-slate-500 font-semibold uppercase">{c.thematique}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p className="font-bold text-indigo-900">Conseils d'action terrain :</p>
                                    {c.pointsCles.map((pt, idx) => (
                                        <p key={idx} className="flex items-start gap-1">
                                            <span className="text-indigo-600">•</span> {pt}
                                        </p>
                                    ))}
                                </div>
                                <div className="p-2 bg-emerald-50 rounded text-xs text-emerald-800 font-medium">
                                    💡 <strong>Quiz Réflexe :</strong> {c.quizRapide}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs">
                                    <span className="text-slate-500">{c.tauxCompletionManager}% des chefs d'agence l'ont validée</span>
                                    <Button size="sm" onClick={() => validerCapsule(c.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
                                        Valider la Capsule
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
