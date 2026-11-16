import React, { useState, useEffect } from 'react';
import { 
    HeartPulse, Phone, AlertCircle, ShieldAlert, CheckCircle2, 
    MapPin, Building2, UserCheck, Stethoscope, Flame 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function SecourismeBoutique() {
    const [donnees, setDonnees] = useState({ secouristes: [], numerosNationaux: {} });
    const [chargement, setChargement] = useState(true);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/secourisme-boutique/annuaire');
            if (res.data) setDonnees(res.data);
        } catch (e) {
            console.error('Erreur annuaire secourisme:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const num = donnees.numerosNationaux || {};

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <HeartPulse className="w-8 h-8 text-rose-200 animate-pulse" />
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-rose-200">Santé, Sécurité & Urgence Vitale</span>
                            <h1 className="text-3xl font-black tracking-tight">Fiche Réflexe Secouriste & Premiers Soins en Boutique</h1>
                            <p className="text-rose-100 text-sm mt-1">
                                Identification immédiate des sauveteurs SST certifiés en agence, trousses de secours et numéros d'urgence CI
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a href="tel:180" className="bg-white text-red-700 hover:bg-red-50 font-black px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
                        <Phone className="w-5 h-5 animate-bounce" /> APPEL POMPIERS : 180
                    </a>
                </div>
            </div>

            {/* Numéros d'urgence en direct */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs font-bold text-red-600 uppercase">Pompiers GSPM (Abidjan)</p>
                        <p className="text-2xl font-black text-red-900 mt-1">{num.pompiersGSPM || '180'}</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs font-bold text-blue-600 uppercase">SAMU Côte d'Ivoire</p>
                        <p className="text-2xl font-black text-blue-900 mt-1">{num.samuAbidjan || '185'}</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-slate-50/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs font-bold text-slate-600 uppercase">Police Secours</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{num.policeSecours || '170 / 111'}</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs font-bold text-amber-600 uppercase">Centre Antipoison</p>
                        <p className="text-xs font-bold text-amber-900 mt-2">{num.centreAntipoison || '+225 27 22 44 90 61'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Secouristes SST présents en agence */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Secouristes Sauveteurs du Travail (SST) par Agence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {donnees.secouristes.map((s) => (
                        <Card key={s.id} className="border-slate-200 bg-white">
                            <CardHeader className="p-6 pb-3 border-b border-slate-100 flex flex-row items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{s.nomSecouriste}</h3>
                                    <p className="text-xs text-slate-500">{s.siteNom}</p>
                                </div>
                                <Badge className="bg-emerald-600 text-white text-xs">PRÉSENT AUJOURD'HUI</Badge>
                            </CardHeader>

                            <CardContent className="p-6 space-y-4">
                                <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 text-xs space-y-1.5">
                                    <p className="font-bold text-red-900 flex items-center gap-1.5">
                                        <Stethoscope className="w-4 h-4 text-red-600" /> {s.certification}
                                    </p>
                                    <p className="text-slate-700">
                                        <span className="font-medium text-slate-500">Contact direct :</span> {s.telephoneUrgence}
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                                    <div className="text-slate-700">
                                        <span className="font-medium text-slate-500">Emplacement trousse de secours :</span>
                                        <p className="font-bold text-slate-900 mt-0.5">{s.emplacementTrousseSecours}</p>
                                    </div>
                                    <div className="text-slate-700 pt-1 border-t border-slate-200">
                                        <span className="font-medium text-slate-500">Extincteurs :</span>
                                        <p className="font-semibold text-slate-800 mt-0.5">{s.emplacementExtincteur}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
