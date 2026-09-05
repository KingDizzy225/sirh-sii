import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ShieldAlert, CheckCircle, AlertTriangle, Scale, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';

/**
 * Indicateurs de conformité RH.
 *
 * Ce panneau affichait quatre alertes codées en dur — « 2 fins de contrat sans
 * action », « index de parité 88/100 » — identiques quel que soit l'effectif,
 * et un bouton d'audit qui annonçait 92 % après deux secondes d'animation sans
 * rien analyser. Il est désormais calculé sur les données réelles.
 */

const ICONES = { safe: CheckCircle, warning: AlertTriangle, danger: ShieldAlert };

export function ComplianceMonitor() {
    const [donnees, setDonnees] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(false);

    const charger = async () => {
        setChargement(true);
        try {
            const res = await api.get('/compliance/dashboard');
            if (res?.data && Array.isArray(res.data.indicateurs)) {
                setDonnees(res.data);
                setErreur(false);
            } else {
                setDonnees(null);
                setErreur(true);
            }
        } catch (e) {
            // Aucun indicateur inventé en cas d'échec : mieux vaut un panneau
            // qui se tait qu'un panneau qui rassure à tort.
            setDonnees(null);
            setErreur(true);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => { charger(); }, []);

    return (
        <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                        <Scale size={16} /> Conformité RH
                    </CardTitle>
                    {donnees?.score !== null && donnees?.score !== undefined && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            donnees.score >= 75 ? 'bg-emerald-500/20 text-emerald-400'
                                : donnees.score >= 50 ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                        }`}>
                            {donnees.score} %
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {chargement && (
                    <div className="flex items-center gap-2 text-white/50 text-xs py-6 justify-center">
                        <Loader2 size={14} className="animate-spin" /> Calcul des indicateurs…
                    </div>
                )}

                {!chargement && erreur && (
                    <p className="text-xs text-white/50 py-6 text-center">
                        Indicateurs indisponibles. Aucun chiffre n'est affiché tant que
                        les données réelles ne sont pas accessibles.
                    </p>
                )}

                {!chargement && donnees && donnees.indicateurs.map((item, idx) => {
                    const Icone = ICONES[item.statut] || CheckCircle;
                    return (
                        <motion.div
                            key={item.titre}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className={`mt-0.5 p-1.5 rounded-lg ${
                                item.statut === 'safe' ? 'bg-emerald-500/20 text-emerald-400' :
                                item.statut === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-rose-500/20 text-rose-400'
                            }`}>
                                <Icone size={14} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white/90">{item.titre}</p>
                                <p className="text-[10px] text-white/50 mt-0.5">{item.message}</p>
                            </div>
                        </motion.div>
                    );
                })}

                {!chargement && donnees && (
                    <p className="text-[10px] text-white/30 text-center pt-1">
                        Effectif analysé : {donnees.effectif} · calculé le{' '}
                        {new Date(donnees.calculeLe).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                )}

                <button
                    onClick={charger}
                    disabled={chargement}
                    className="w-full mt-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-70"
                >
                    <RefreshCw size={13} className={chargement ? 'animate-spin' : ''} />
                    Recalculer
                </button>
            </CardContent>
        </Card>
    );
}
