import React, { useState, useEffect } from 'react';
import { 
    Users, PiggyBank, ShieldCheck, Plus, CheckCircle2, 
    Calendar, ArrowRight, Wallet, Sparkles, AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function TontineRh() {
    const [cercles, setCercles] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formCercle, setFormCercle] = useState({
        nom: 'Tontine Agences Abidjan Nord',
        montantCotisation: 25000,
        nombreMembres: 10
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/tontine-rh/cercles');
            if (res.data) setCercles(res.data.cercles || []);
        } catch (e) {
            console.error('Erreur chargement tontines:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const creerCercle = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tontine-rh/creer', formCercle);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur création tontine:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <PiggyBank className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Tontine d'Entreprise Sécurisée (Épargne Solidaire)</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Cercles d'épargne rotatifs entre collègues avec prélèvement sur paie et virement Orange Money automatisé
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-md">
                        <Plus className="w-4 h-4" /> Créer un Cercle de Tontine
                    </Button>
                </div>
            </div>

            {/* Liste des cercles de tontine */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cercles.map((c) => (
                    <Card key={c.id} className="border-emerald-200 bg-linear-to-b from-white to-emerald-50/20 shadow-xs">
                        <CardHeader className="p-6 pb-3 border-b border-emerald-100 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{c.nom}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{c.nombreMembres} membres • Cotisation : {c.montantCotisationMensuelle.toLocaleString()} FCFA/mois</p>
                            </div>
                            <Badge className="bg-emerald-600 text-white font-bold text-xs">
                                Pot : {c.potMensuelTotal.toLocaleString()} FCFA
                            </Badge>
                        </CardHeader>

                        <CardContent className="p-6 space-y-4">
                            <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Bénéficiaire du mois :</span>
                                    <span className="font-bold text-emerald-800 text-sm">{c.beneficiaireDuMois}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Date versement OM :</span>
                                    <span className="font-semibold text-slate-700">{c.dateVirementOM}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                                    <span className="text-slate-500">Garantie prélèvement RH :</span>
                                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4" /> Sécurisé sur Bulletin
                                    </span>
                                </div>
                            </div>

                            {c.membres?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-700 mb-2">Ordre de passage du cercle :</p>
                                    <div className="space-y-1.5">
                                        {c.membres.map((m, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                                                <span className="font-medium text-slate-800">{m.nom} ({m.site})</span>
                                                <Badge variant={m.aRecu ? 'secondary' : 'default'} className="text-[10px] py-0 px-2">
                                                    {m.aRecu ? '✅ Perçu' : m.tourMois}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Nouveau Cercle */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Lancer un cercle de tontine</h3>
                        <form onSubmit={creerCercle} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du cercle d'épargne</label>
                                <Input value={formCercle.nom} onChange={e => setFormCercle({...formCercle, nom: e.target.value})} required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Cotisation / mois (FCFA)</label>
                                    <Input type="number" min="5000" step="5000" value={formCercle.montantCotisation} onChange={e => setFormCercle({...formCercle, montantCotisation: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre de membres</label>
                                    <Input type="number" min="3" max="24" value={formCercle.nombreMembres} onChange={e => setFormCercle({...formCercle, nombreMembres: e.target.value})} required />
                                </div>
                            </div>

                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                                <p className="font-bold">Pot total reversé au gagnant du mois :</p>
                                <p className="text-lg font-black text-emerald-700">
                                    {((parseInt(formCercle.montantCotisation, 10) || 0) * (parseInt(formCercle.nombreMembres, 10) || 0)).toLocaleString()} FCFA
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Activer le cercle</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
