import React, { useState, useEffect } from 'react';
import { 
    Baby, Gift, Heart, Sparkles, Plus, CheckCircle2, 
    Calendar, Wallet, ShieldCheck, HeartHandshake, Smile 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function BerceauSii() {
    const [dossiers, setDossiers] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formDossier, setFormDossier] = useState({
        employeNom: '',
        matricule: 'EMP-0450',
        siteNom: 'Agence Cap Sud Marcory',
        evenement: 'Naissance d\'un petit garçon (Ismaël)',
        type: 'MATERNITE',
        dateEvenement: '14 Octobre 2026'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/berceau-sii/dossiers');
            if (res.data) setDossiers(res.data.dossiers || []);
        } catch (e) {
            console.error('Erreur chargement berceaux:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const declarerNaissance = async (e) => {
        e.preventDefault();
        try {
            await api.post('/berceau-sii/declarer', formDossier);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur déclaration berceau:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <Baby className="w-8 h-8 text-pink-200 animate-bounce" />
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-pink-200">Parentalité & Famille SII</span>
                            <h1 className="text-3xl font-black tracking-tight">Berceau SII : Coffret Naissance & Maternité</h1>
                            <p className="text-pink-100 text-sm mt-1">
                                Prime Orange Money de bienvenue bébé, kit layette offert et parrainage d'accueil post-maternité
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-white text-rose-700 hover:bg-rose-50 font-bold shadow-lg">
                        <Plus className="w-4 h-4 mr-2" /> Déclarer une Naissance / Paternité
                    </Button>
                </div>
            </div>

            {/* Dossiers récents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dossiers.map((d) => (
                    <Card key={d.id} className="border-pink-200 bg-linear-to-b from-white to-pink-50/20 shadow-xs">
                        <CardHeader className="p-6 pb-3 border-b border-pink-100 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{d.employeNom}</h3>
                                <p className="text-xs text-slate-500">{d.matricule} • {d.siteNom}</p>
                            </div>
                            <Badge className="bg-pink-600 text-white text-xs">{d.dateEvenement}</Badge>
                        </CardHeader>

                        <CardContent className="p-6 space-y-4">
                            <div className="p-3 bg-white rounded-2xl border border-pink-100 space-y-1">
                                <p className="text-xs font-semibold text-pink-800">🎉 Événement :</p>
                                <p className="font-bold text-slate-900 text-sm">{d.evenement}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-white rounded-xl border border-slate-100">
                                    <span className="text-slate-500">Prime OM Naissance :</span>
                                    <p className="font-bold text-rose-600 text-base">{d.primeNaissanceOMFcfa.toLocaleString()} FCFA</p>
                                    <span className="text-[10px] text-emerald-600 font-semibold">✅ Virement direct</span>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-slate-100">
                                    <span className="text-slate-500">Kit Layette Bébé SII :</span>
                                    <p className="font-bold text-purple-700 text-base">🎁 Remis</p>
                                    <span className="text-[10px] text-slate-500">Aux couleurs SII</span>
                                </div>
                            </div>

                            {d.parrainageMamanNom && (
                                <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs flex items-center justify-between">
                                    <span>Marraine de retour d'activité :</span>
                                    <span className="font-bold">{d.parrainageMamanNom}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Déclaration */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Déclarer un heureux événement</h3>
                        <form onSubmit={declarerNaissance} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du collaborateur</label>
                                <Input value={formDossier.employeNom} onChange={e => setFormDossier({...formDossier, employeNom: e.target.value})} placeholder="Ex: Mariam Diabaté" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Type d'événement</label>
                                    <select 
                                        value={formDossier.type} 
                                        onChange={e => setFormDossier({...formDossier, type: e.target.value})}
                                        className="w-full p-2 border border-slate-300 rounded-xl"
                                    >
                                        <option value="MATERNITE">Maternité (75 000 F)</option>
                                        <option value="PATERNITE">Paternité (40 000 F)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Boutique</label>
                                    <Input value={formDossier.siteNom} onChange={e => setFormDossier({...formDossier, siteNom: e.target.value})} required />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Prénom du nouveau-né</label>
                                <Input value={formDossier.evenement} onChange={e => setFormDossier({...formDossier, evenement: e.target.value})} required />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold">Valider & Déclencher</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
