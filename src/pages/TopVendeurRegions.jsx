import React, { useState, useEffect } from 'react';
import { Trophy, Award, MapPin, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function TopVendeurRegions() {
    const [donnees, setDonnees] = useState({ palmares: [], moisEnCours: 'Octobre 2026', criteresPonderation: '' });
    const [chargement, setChargement] = useState(true);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/top-vendeur-regions/classement');
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
                        <Trophy className="w-7 h-7 text-amber-500" />
                        Challenge "Top Vendeurs des Régions de l'Intérieur"
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Classement pondéré valorisant les performances des agences hors d'Abidjan (Bouaké, San Pedro, Korhogo, Daloa)
                    </p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold">
                    📅 Édition : {donnees.moisEnCours}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {donnees.palmares.map((p) => (
                    <motion.div key={p.rang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className={`shadow-sm border-t-4 ${p.rang === 1 ? 'border-t-amber-500 bg-amber-50/20' : p.rang === 2 ? 'border-t-slate-400 bg-slate-50/30' : 'border-t-amber-700 bg-orange-50/20'}`}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-slate-800">#{p.rang}</span>
                                    <Badge className="bg-slate-900 text-amber-400 font-bold">{p.badgeDistinction}</Badge>
                                </div>
                                <CardTitle className="text-base font-bold text-slate-900 mt-1">
                                    {p.agenceNom}
                                </CardTitle>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {p.region}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-white rounded-lg border space-y-1 text-xs text-slate-700">
                                    <p>👤 <strong>Chef d'Agence :</strong> {p.chefAgence}</p>
                                    <p>📈 <strong>Taux d'atteinte :</strong> <span className="font-bold text-emerald-600">{p.tauxAtteinteObjectifs}%</span> (Score {p.scorePondere}/100)</p>
                                    <p>🌐 <strong>Fibre installée :</strong> {p.ventesFibreMois} box</p>
                                    <p>📲 <strong>SIM Activées :</strong> {p.ventesSimPostpayees} lignes</p>
                                    <p>💼 <strong>Flux Orange Money :</strong> {p.volumeOrangeMoneyMillionsFcfa} Millions FCFA</p>
                                </div>
                                <div className="p-2 bg-emerald-50 text-emerald-800 rounded text-center text-xs font-bold">
                                    💰 Prime d'Équipe Gagnée : +{p.primeEquipeGagneeFcfa?.toLocaleString('fr-FR')} FCFA
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
