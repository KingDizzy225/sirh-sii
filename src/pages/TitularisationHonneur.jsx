import React, { useState, useEffect } from 'react';
import { 
    Award, PartyPopper, Sparkles, CheckCircle2, Trophy, 
    Gift, Heart, Star, Plus, ShieldCheck, FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function TitularisationHonneur() {
    const [titularisations, setTitularisations] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formTitularisation, setFormTitularisation] = useState({
        employeNom: '',
        matricule: 'EMP-0520',
        poste: 'Conseiller Commercial Fibre & B2B',
        siteNom: 'Agence Orange Plateau',
        motDirection: 'Toutes nos félicitations pour ton passage en CDI ! Ton professionnalisme fait la force de SII.'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/titularisation/liste');
            if (res.data) setTitularisations(res.data.titularisations || []);
        } catch (e) {
            console.error('Erreur chargement titularisations:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const celebrerTitularisation = async (e) => {
        e.preventDefault();
        try {
            await api.post('/titularisation/celebrer', formTitularisation);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur célébration titularisation:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <PartyPopper className="w-8 h-8 text-amber-200 animate-bounce" />
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-amber-200">Reconnaissance & Carrière</span>
                            <h1 className="text-3xl font-black tracking-tight">Mur des Anciens & Cérémonie de Titularisation</h1>
                            <p className="text-amber-100 text-sm mt-1">
                                Célébration du passage de CDD en CDI avec Passeport d'Honneur et diffusion festive sur les écrans d'agence
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-white text-orange-800 hover:bg-orange-50 font-bold shadow-lg">
                        <Plus className="w-4 h-4 mr-2" /> Titulariser & Célébrer en Direct
                    </Button>
                </div>
            </div>

            {/* Passeports CDI d'Honneur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {titularisations.map((t) => (
                    <motion.div key={t.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="border-amber-300 bg-linear-to-br from-amber-50/60 via-white to-orange-50/40 shadow-md">
                            <CardHeader className="p-6 pb-4 border-b border-amber-200/60 flex flex-row items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
                                        CDI
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{t.employeNom}</h3>
                                        <p className="text-xs text-slate-500">{t.matricule} • {t.poste}</p>
                                        <p className="text-xs font-semibold text-amber-700 mt-0.5">{t.siteNom}</p>
                                    </div>
                                </div>
                                <Badge className="bg-amber-500 text-slate-950 font-black text-xs">
                                    {t.dateTitularisation}
                                </Badge>
                            </CardHeader>

                            <CardContent className="p-6 space-y-4">
                                <div className="p-4 bg-white/90 rounded-2xl border border-amber-200/80 shadow-xs">
                                    <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Mot de la Direction Générale :
                                    </p>
                                    <p className="text-sm text-slate-700 italic leading-relaxed">
                                        « {t.motDirection} »
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="p-2.5 bg-amber-100/60 rounded-xl text-amber-900 font-semibold flex items-center justify-center gap-1">
                                        <Award className="w-3.5 h-3.5 text-amber-700" /> Badge Doré
                                    </div>
                                    <div className="p-2.5 bg-amber-100/60 rounded-xl text-amber-900 font-semibold flex items-center justify-center gap-1">
                                        <Gift className="w-3.5 h-3.5 text-amber-700" /> Kit Polo SII
                                    </div>
                                    <div className="p-2.5 bg-amber-100/60 rounded-xl text-amber-900 font-semibold flex items-center justify-center gap-1">
                                        <PartyPopper className="w-3.5 h-3.5 text-amber-700" /> Célébré TV
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Modal Titularisation */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <span className="p-3 bg-amber-100 rounded-2xl"><PartyPopper className="w-6 h-6" /></span>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Titulariser un salarié en CDI</h3>
                                <p className="text-xs text-slate-500">Édition du passeport d'honneur & projection immédiate sur TV boutique</p>
                            </div>
                        </div>

                        <form onSubmit={celebrerTitularisation} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du collaborateur</label>
                                <Input value={formTitularisation.employeNom} onChange={e => setFormTitularisation({...formTitularisation, employeNom: e.target.value})} placeholder="Ex: Jean-Eudes Yao" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Poste CDI confirmé</label>
                                    <Input value={formTitularisation.poste} onChange={e => setFormTitularisation({...formTitularisation, poste: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Boutique / Site</label>
                                    <Input value={formTitularisation.siteNom} onChange={e => setFormTitularisation({...formTitularisation, siteNom: e.target.value})} required />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Message d'honneur de la Direction</label>
                                <textarea 
                                    rows={3} 
                                    value={formTitularisation.motDirection} 
                                    onChange={e => setFormTitularisation({...formTitularisation, motDirection: e.target.value})}
                                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold">
                                    <Sparkles className="w-4 h-4 mr-2" /> Valider & Déclencher la Fête
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
