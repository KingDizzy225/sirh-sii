import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Plus, CheckCircle2, Award, Sparkles, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function BonsFestifs() {
    const [donnees, setDonnees] = useState({ campagnes: [], dotations: [] });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formDotation, setFormDotation] = useState({
        employeNom: '',
        campagne: 'Tabaski & Fêtes Musulmanes 2026',
        montantFcfa: 40000,
        astreinte: 'Non (En repos familial)'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/bons-festifs/campagnes');
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

    const soumettreDotation = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/bons-festifs/attribuer', formDotation);
            setModalOuverte(false);
            setFormDotation({
                employeNom: '',
                campagne: 'Tabaski & Fêtes Musulmanes 2026',
                montantFcfa: 40000,
                astreinte: 'Non (En repos familial)'
            });
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
                        <Gift className="w-7 h-7 text-rose-600" />
                        Bons Festifs "Tabaski & Paquinou" & Roulement des Ponts
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Dotations alimentaires équitables (bons Prosuma / sacs de riz) et planification transparente des astreintes
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Attribuer un Bon Festif
                </Button>
            </div>

            {/* Campagnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.campagnes.map((c) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-rose-500 bg-rose-50/20">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-rose-600" />
                                        {c.evenement}
                                    </CardTitle>
                                    <Badge className="bg-rose-100 text-rose-800">{c.dateFete}</Badge>
                                </div>
                                <p className="text-xs text-slate-500">{c.dotationType}</p>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-slate-700">
                                <div className="flex items-center justify-between">
                                    <span>Valeur unitaire : <strong>{c.valeurBonFcfa?.toLocaleString('fr-FR')} FCFA</strong></span>
                                    <span>Bénéficiaires : <strong>{c.beneficiairesConcernes} salariés</strong></span>
                                </div>
                                <div className="p-2 bg-white rounded border text-xs text-slate-600">
                                    ⚖️ <strong>Astreinte :</strong> {c.roulementAstreinte}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Dotations attribuées */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-slate-700" />
                        Bons et Vouchers Émis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-slate-100">
                        {donnees.dotations.map((d) => (
                            <div key={d.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{d.employeNom}</span>
                                        <Badge variant="outline" className="text-xs">{d.matricule}</Badge>
                                        <Badge className="bg-emerald-100 text-emerald-800">{d.statutRetrait}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Fête : <strong>{d.campagne}</strong> • Statut garde : <strong>{d.astreinteValidee}</strong>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono text-sm font-bold text-rose-600">{d.codeBonVoucher}</span>
                                    <p className="text-xs font-bold text-slate-700">{d.montantFcfa?.toLocaleString('fr-FR')} FCFA</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-rose-600" />
                            Attribuer une Dotation Festive
                        </h3>
                        <form onSubmit={soumettreDotation} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms du Bénéficiaire</label>
                                <Input required value={formDotation.employeNom} onChange={(e) => setFormDotation({ ...formDotation, employeNom: e.target.value })} placeholder="Ex: Cissé Mamadou" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Événement Fête</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formDotation.campagne} onChange={(e) => setFormDotation({ ...formDotation, campagne: e.target.value })}>
                                    <option value="Tabaski & Fêtes Musulmanes 2026">Tabaski & Fêtes Musulmanes 2026</option>
                                    <option value="Pâques & Paquinou 2026">Pâques & Paquinou 2026</option>
                                    <option value="Fêtes de Fin d'Année & Noël 2026">Fêtes de Fin d'Année & Noël 2026</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Valeur Bon (FCFA)</label>
                                <Input type="number" required value={formDotation.montantFcfa} onChange={(e) => setFormDotation({ ...formDotation, montantFcfa: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Statut Astreinte</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formDotation.astreinte} onChange={(e) => setFormDotation({ ...formDotation, astreinte: e.target.value })}>
                                    <option value="Non (En repos familial)">Non (En repos familial)</option>
                                    <option value="Oui (Volontaire astreinte payée double)">Oui (Volontaire astreinte payée double)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Générer le Bon</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
