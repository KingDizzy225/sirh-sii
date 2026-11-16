import React, { useState, useEffect } from 'react';
import { Heart, Plus, Users, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function CagnotteSolidarite() {
    const [donnees, setDonnees] = useState({ cagnottes: [], tauxAbondementEntreprise: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [cagnotteSelectionnee, setCagnotteSelectionnee] = useState(null);
    const [montantDon, setMontantDon] = useState(5000);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/cagnotte-solidarite/liste');
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

    const participerDon = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/cagnotte-solidarite/participer', {
                cagnotteId: cagnotteSelectionnee?.id,
                montantDonFcfa: montantDon
            });
            setModalOuverte(false);
            setMontantDon(5000);
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
                        <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                        Cagnotte de Solidarité "Coups Durs & Deuil" (Abondée 100% SII)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Caisse digitale d'entraide fraternelle : pour chaque franc versé par un collègue, SII verse un montant équivalent
                    </p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold">
                    🤝 Abondement Entreprise : 100% Match sur chaque don
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.cagnottes.map((c) => {
                    const pourcentage = Math.min(Math.round((c.totalCollecteFcfa / c.objectifFcfa) * 100), 100);
                    return (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="shadow-sm border-l-4 border-l-rose-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-bold text-slate-900">
                                            {c.beneficiaireNom}
                                        </CardTitle>
                                        <Badge className={c.statut === 'VERSEMENT_EFFECTUE_FAMILLE' ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-800'}>
                                            {c.statut === 'VERSEMENT_EFFECTUE_FAMILLE' ? 'Versement Effectué' : 'Collecte Active'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500">{c.description}</p>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span>Collecté : {c.totalCollecteFcfa?.toLocaleString('fr-FR')} FCFA</span>
                                            <span>Objectif : {c.objectifFcfa?.toLocaleString('fr-FR')} FCFA ({pourcentage}%)</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pourcentage}%` }} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg">
                                        <div>
                                            <span className="text-slate-500">Dons collaborateurs :</span>
                                            <p className="font-bold text-slate-800">{c.collecteEmployesFcfa?.toLocaleString('fr-FR')} FCFA</p>
                                        </div>
                                        <div>
                                            <span className="text-rose-600 font-semibold">Abondement SII (+100%) :</span>
                                            <p className="font-bold text-rose-700">+{c.abondementSiiFcfa?.toLocaleString('fr-FR')} FCFA</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                        <span>{c.nombreDonateurs} collègues solidaires</span>
                                        <Button size="sm" onClick={() => { setCagnotteSelectionnee(c); setModalOuverte(true); }} className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8">
                                            Participer à la Cagnotte
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Modal */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                            Participer à la Solidarité
                        </h3>
                        <p className="text-xs text-slate-500">Pour : <strong>{cagnotteSelectionnee?.beneficiaireNom}</strong></p>
                        <form onSubmit={participerDon} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Montant de votre contribution (FCFA)</label>
                                <Input type="number" min="1000" step="1000" required value={montantDon} onChange={(e) => setMontantDon(Number(e.target.value))} />
                            </div>
                            <div className="p-3 bg-rose-50 text-rose-900 rounded-lg text-xs">
                                🌟 <strong>Effet multiplicateur :</strong> Si vous donnez {montantDon.toLocaleString('fr-FR')} FCFA, SII ajoutera immédiatement {montantDon.toLocaleString('fr-FR')} FCFA. La famille recevra {(montantDon * 2).toLocaleString('fr-FR')} FCFA.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Valider mon Don Solidaire</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
