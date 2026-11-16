import React, { useState, useEffect } from 'react';
import { 
    Smartphone, Zap, RefreshCw, CheckCircle2, ShieldCheck, 
    Clock, Building2, Plus, Sparkles, AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function SmartphoneSecours() {
    const [prets, setPrets] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formPret, setFormPret] = useState({
        employeNom: '',
        matricule: 'EMP-0511',
        siteNom: 'Agence Cap Sud Marcory',
        motif: 'Écran brisé / panne soudaine',
        modelePrete: 'Orange Neva Zen 4G (Stock Tampon)',
        dureeJours: 7
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/smartphone-secours/prets');
            if (res.data) setPrets(res.data.prets || []);
        } catch (e) {
            console.error('Erreur chargement prêts smartphone:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const attribuerTelephone = async (e) => {
        e.preventDefault();
        try {
            await api.post('/smartphone-secours/attribuer', formPret);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur attribution smartphone:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600">
                            <Smartphone className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Jocker Smartphone : Dépannage Immédiat Collaborateur</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Prêt de smartphone tampon en 2 minutes en cas de casse ou vol pour maintenir l'accès aux ventes et briefs
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-bold shadow-md">
                        <Plus className="w-4 h-4" /> Attribuer un Téléphone Joker
                    </Button>
                </div>
            </div>

            {/* Liste des prêts en cours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prets.map((p) => (
                    <Card key={p.id} className="border-orange-200 bg-white">
                        <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">{p.employeNom}</h3>
                                <p className="text-xs text-slate-500">{p.matricule} • {p.siteNom}</p>
                            </div>
                            <Badge className="bg-orange-500 text-white text-xs">JOKER ACTIF</Badge>
                        </CardHeader>

                        <CardContent className="p-5 pt-2 space-y-3">
                            <div className="p-3 bg-orange-50/50 rounded-xl space-y-1.5 text-xs border border-orange-100">
                                <div className="text-slate-700">
                                    <span className="font-medium text-slate-500">Modèle prêté :</span> {p.modelePrete}
                                </div>
                                <div className="text-slate-700">
                                    <span className="font-medium text-slate-500">Motif :</span> {p.motif}
                                </div>
                                <div className="text-slate-700 font-mono text-[11px]">
                                    <span className="font-medium text-slate-500">IMEI :</span> {p.imei}
                                </div>
                                <div className="pt-1 border-t border-orange-200/60 flex justify-between items-center text-slate-500">
                                    <span>Prêt accordé le : {p.datePret}</span>
                                    <span className="font-bold text-orange-700">{p.dureeJours} jours de garde</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Attribution */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Attribuer un smartphone de secours</h3>
                        <form onSubmit={attribuerTelephone} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du conseiller</label>
                                <Input value={formPret.employeNom} onChange={e => setFormPret({...formPret, employeNom: e.target.value})} placeholder="Ex: Yves Koffi" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Boutique</label>
                                    <Input value={formPret.siteNom} onChange={e => setFormPret({...formPret, siteNom: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Durée (jours)</label>
                                    <Input type="number" min="1" max="30" value={formPret.dureeJours} onChange={e => setFormPret({...formPret, dureeJours: e.target.value})} required />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Motif de la panne</label>
                                <Input value={formPret.motif} onChange={e => setFormPret({...formPret, motif: e.target.value})} required />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Valider l'attribution</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
