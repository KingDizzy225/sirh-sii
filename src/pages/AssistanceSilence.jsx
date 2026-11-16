import React, { useState, useEffect } from 'react';
import { 
    BellOff, ShieldAlert, CheckCircle2, AlertTriangle, 
    Radio, Clock, MapPin, Building2, UserCheck, Shield 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function AssistanceSilence() {
    const [alertes, setAlertes] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [declenchementActif, setDeclenchementActif] = useState(false);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/assistance-silence/alertes');
            if (res.data) setAlertes(res.data.alertes || []);
        } catch (e) {
            console.error('Erreur chargement alertes silence:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
        const t = setInterval(charger, 10000);
        return () => clearInterval(t);
    }, []);

    const declencherAlerte = async (motif) => {
        try {
            setDeclenchementActif(true);
            await api.post('/assistance-silence/declencher', {
                siteNom: 'Agence Orange Plateau Postel 2001',
                guichetNumero: 'Guichet 2 (Caisse)',
                motif: motif || 'Assistance immédiate requise au comptoir'
            });
            await charger();
            setTimeout(() => setDeclenchementActif(false), 3000);
        } catch (e) {
            console.error('Erreur alerte silence:', e);
            setDeclenchementActif(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
                            <BellOff className="w-6 h-6 animate-pulse" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Bouton Discret d'Assistance Guichet (Code Silence)</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Appel discret de renfort vigile et superviseur en cas de tension client ou tentative de fraude au comptoir
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="destructive" 
                        onClick={() => declencherAlerte('Alerte Discrète : Client menaçant / Tension')}
                        disabled={declenchementActif}
                        className="font-bold gap-2 px-6 py-6 text-base rounded-2xl shadow-lg"
                    >
                        <ShieldAlert className="w-5 h-5" /> 🚨 DÉCLENCHER CODE SILENCE
                    </Button>
                </div>
            </div>

            {declenchementActif && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 font-bold flex items-center gap-3">
                    <Radio className="w-6 h-6 text-rose-600 animate-ping" />
                    <span>Signal discret émis ! Le chef d'agence et l'agent de sécurité ont été notifiés pour une intervention calme.</span>
                </motion.div>
            )}

            {/* Raccourcis de déclenchement rapide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 bg-white hover:border-rose-300 transition-all cursor-pointer" onClick={() => declencherAlerte('Suspicion Fraude Orange Money')}>
                    <CardContent className="p-6 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Suspicion Fraude OM</span>
                            <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full font-bold">Code 1</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Tentative de retrait sans CNI valide ou manipulation suspecte du téléphone client.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white hover:border-rose-300 transition-all cursor-pointer" onClick={() => declencherAlerte('Client Énervé / Refus de file')}>
                    <CardContent className="p-6 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Client Agressif / Conflit</span>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">Code 2</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Ton qui monte, refus de respecter l'ordre des tickets ou propos intimidants.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white hover:border-rose-300 transition-all cursor-pointer" onClick={() => declencherAlerte('Malaise / Urgence Santé Guichet')}>
                    <CardContent className="p-6 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Malaise / Santé Client</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold">Code 3</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Client ou collègue pris de vertige, chaleur ou besoin immédiat de secours.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Historique des interventions */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Alertes Silencieuses du Jour ({alertes.length})</h2>
                <div className="space-y-3">
                    {alertes.map((a) => (
                        <Card key={a.id} className="border-slate-200 bg-white">
                            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 text-base">{a.motif}</h3>
                                        <Badge variant={a.statut === 'RESOLU' ? 'secondary' : 'destructive'} className="text-xs">
                                            {a.statut}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Déclenché par {a.employeNom} au {a.guichetNumero} • {a.siteNom} à {a.heure}
                                    </p>
                                </div>
                                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    👮‍♂️ Prise en charge : <span className="font-semibold text-slate-800">{a.interventionPar}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
