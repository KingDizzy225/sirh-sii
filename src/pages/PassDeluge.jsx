import React, { useState, useEffect } from 'react';
import { CloudRain, Navigation, ShieldCheck, Car, AlertTriangle, Clock, MapPin, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function PassDeluge() {
    const [donnees, setDonnees] = useState({ alertes: [], vouchers: [] });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formVoucher, setFormVoucher] = useState({
        employeNom: '',
        agenceDepart: 'Agence Orange Riviera Palmeraie',
        quartierDestination: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/pass-deluge/statuts');
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

    const soumettreDemande = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/pass-deluge/demande-voucher', formVoucher);
            setModalOuverte(false);
            setFormVoucher({ employeNom: '', agenceDepart: 'Agence Orange Riviera Palmeraie', quartierDestination: '' });
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
                        <CloudRain className="w-7 h-7 text-blue-600" />
                        Pass VTC "Déluge Abidjan" & Navettes de Sécurité
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Protection et rapatriement sécurisé des conseillers lors des crues et orages tropicaux abidjanais
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Demander un Pass VTC Express
                </Button>
            </div>

            {/* Alertes Météo Actives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.alertes.map((alt) => (
                    <motion.div key={alt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-l-4 border-l-red-500 bg-red-50/40 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-red-900 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        {alt.zone}
                                    </CardTitle>
                                    <Badge className="bg-red-600 text-white">{alt.niveauAlerte}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-slate-700">
                                <p className="font-semibold text-slate-900">{alt.consigneSecurite}</p>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Vouchers actifs : <strong className="text-blue-700">{alt.passVtcActifs}</strong></span>
                                    <span>Plafond : <strong className="text-slate-900">{alt.montantVoucherFcfa.toLocaleString('fr-FR')} FCFA</strong></span>
                                    <span>Navette : <strong className="text-emerald-700">{alt.statutNavette}</strong></span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Vouchers Émis */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Car className="w-5 h-5 text-indigo-600" />
                        Pass VTC Délivrés (Yango Business SII)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-slate-100">
                        {donnees.vouchers.map((v) => (
                            <div key={v.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{v.employeNom}</span>
                                        <Badge variant="outline" className="text-xs">{v.matricule}</Badge>
                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3 mr-1 inline" /> {v.statut}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Départ : <strong>{v.agenceDepart}</strong> ➔ Destination : <strong>{v.quartierDestination}</strong>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 bg-slate-900 text-amber-400 font-mono font-bold rounded text-xs">
                                        {v.codeVoucher}
                                    </span>
                                    <p className="text-xs text-slate-400 mt-1">Émis à {v.heureEmission}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Demande */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <CloudRain className="w-5 h-5 text-blue-600" />
                            Demande de Pass VTC Déluge
                        </h3>
                        <form onSubmit={soumettreDemande} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms du Conseiller</label>
                                <Input required value={formVoucher.employeNom} onChange={(e) => setFormVoucher({ ...formVoucher, employeNom: e.target.value })} placeholder="Ex: Kouamé Jean" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Agence de Départ</label>
                                <Input required value={formVoucher.agenceDepart} onChange={(e) => setFormVoucher({ ...formVoucher, agenceDepart: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Quartier de Destination (Domicile)</label>
                                <Input required value={formVoucher.quartierDestination} onChange={(e) => setFormVoucher({ ...formVoucher, quartierDestination: e.target.value })} placeholder="Ex: Yopougon Niangon Sud" />
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs">
                                💡 Course prise en charge à 100% par le compte d'entreprise SII. Le code voucher vous sera immédiatement délivré.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Émettre mon Voucher</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
