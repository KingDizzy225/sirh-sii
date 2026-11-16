import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2, Award, Sparkles, Building2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function AuditClientMystere() {
    const [donnees, setDonnees] = useState({ visites: [], moyenneReseauSii: '94.4%' });
    const [chargement, setChargement] = useState(true);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/audit-client-mystere/visites');
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
                        <Eye className="w-7 h-7 text-emerald-600" />
                        Audit Qualité & Visites "Client Mystère" Orange
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Évaluations objectives de l'accueil, de la propreté et de la maîtrise commerciale avec primes d'excellence d'équipe
                    </p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" /> Moyenne Réseau SII : {donnees.moyenneReseauSii}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.visites.map((aud) => (
                    <motion.div key={aud.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {aud.agenceNom}
                                    </CardTitle>
                                    <Badge className="bg-emerald-600 text-white font-bold">
                                        Score {aud.scoreGlobalPourcent}% ({aud.mention})
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Auditeur : <strong>{aud.auditeurCabinet}</strong> • Date : {aud.dateVisite}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2 bg-slate-50 rounded">
                                        <span className="text-slate-500">Accueil & Sourire :</span>
                                        <p className="font-bold text-slate-800">{aud.noteAccueil}/100</p>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded">
                                        <span className="text-slate-500">Propreté & Tenue :</span>
                                        <p className="font-bold text-slate-800">{aud.notePropreteUniforme}/100</p>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded">
                                        <span className="text-slate-500">Maîtrise Offres Fibre :</span>
                                        <p className="font-bold text-slate-800">{aud.noteMaitriseOffreFibre}/100</p>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded">
                                        <span className="text-slate-500">Rapidité Service :</span>
                                        <p className="font-bold text-slate-800">{aud.noteSourireRapidite}/100</p>
                                    </div>
                                </div>

                                <div className="p-2.5 bg-emerald-50/60 rounded border border-emerald-100 text-xs text-slate-700 italic">
                                    "{aud.verbatimAuditeur}"
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t text-xs font-bold text-emerald-700">
                                    <span>🎉 Prime d'Équipe Débloquée :</span>
                                    <span>+{aud.primeEquipeBoutiqueFcfa?.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
