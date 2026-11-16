import React, { useState, useEffect } from 'react';
import { Coffee, Flame, Heart, Sparkles, CheckCircle2, Clock, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function SprintFinMois() {
    const [donnees, setDonnees] = useState({ agences: [], dispositifAntiBurnout: '' });
    const [chargement, setChargement] = useState(true);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/sprint-fin-mois/statuts');
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

    const commanderGouter = async (agenceNom) => {
        try {
            await api.post('/api/sprint-fin-mois/commander-gouter-equipe', { agenceNom });
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
                        <Coffee className="w-7 h-7 text-amber-600" />
                        Sentinelle Bien-Être & Pause Sprint Fin de Mois
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Suivi attentif du stress lors du rush des 3 derniers jours d'objectifs avec pause goûter tonus offerte à toute l'équipe
                    </p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold">
                    🛡️ {donnees.dispositifAntiBurnout || 'Fermeture obligatoire à 19h30 + Pause 16h offerte'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.agences.map((ag) => (
                    <motion.div key={ag.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className={`shadow-sm border-l-4 ${ag.indicePressionEquipe === 'SURCHAUFFE_ALERTE' ? 'border-l-red-500 bg-red-50/20' : 'border-l-amber-500'}`}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {ag.agenceNom}
                                    </CardTitle>
                                    <Badge className={ag.indicePressionEquipe === 'SURCHAUFFE_ALERTE' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'}>
                                        {ag.indicePressionEquipe}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Rush Clôture : <strong>J-{ag.joursRestantsAvantCloture} avant fin de mois</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>🎯 <strong>Reste pour atteindre 100% :</strong> {ag.objectifsRestantsPourcentage}% des ventes</p>
                                    <p>⏱️ <strong>Heures supplémentaires estimées :</strong> {ag.heuresSuppEstimeesSemaine}h</p>
                                    <p>🍰 <strong>Collation offerte par l'agence :</strong> {ag.menuGouterJour}</p>
                                    <p className="text-slate-600 italic">"{ag.statutBienEtre}"</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs">
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Pause 16h validée
                                    </span>
                                    <Button size="sm" onClick={() => commanderGouter(ag.agenceNom)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8">
                                        Renouveler Collation Équipe
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
