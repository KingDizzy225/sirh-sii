import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, Calculator, AlertTriangle, CheckCircle2, 
    Coins, Banknote, RefreshCw, Trophy, ArrowRight, Clock, Building2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function CaisseSecurite() {
    const [donnees, setDonnees] = useState({ clotures: [], total: 0, parfaites: 0, tauxConformite: 100 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formCloture, setFormCloture] = useState({
        siteNom: 'Agence Orange Plateau Postel 2001',
        caissierNom: '',
        matricule: 'EMP-CAISSE',
        fondInitialFcfa: 150000,
        soldeOmTheorique: 12450000,
        soldeOmReel: 12450000,
        especesTheoriquesFcfa: 2850000,
        detailBillets: {
            dixMille: 200,
            cinqMille: 130,
            deuxMille: 80,
            mille: 40
        }
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/caisse-securite/clotures');
            if (res.data) setDonnees(res.data);
        } catch (e) {
            console.error('Erreur chargement caisses:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreCloture = async (e) => {
        e.preventDefault();
        try {
            await api.post('/caisse-securite/enregistrer', formCloture);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur enregistrement clôture:', e);
        }
    };

    const totalBilletsCalcules = 
        ((parseInt(formCloture.detailBillets.dixMille, 10) || 0) * 10000) +
        ((parseInt(formCloture.detailBillets.cinqMille, 10) || 0) * 5000) +
        ((parseInt(formCloture.detailBillets.deuxMille, 10) || 0) * 2000) +
        ((parseInt(formCloture.detailBillets.mille, 10) || 0) * 1000);

    const ecartCalcule = (totalBilletsCalcules - (parseInt(formCloture.especesTheoriquesFcfa, 10) || 0)) +
        ((parseInt(formCloture.soldeOmReel, 10) || 0) - (parseInt(formCloture.soldeOmTheorique, 10) || 0));

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                            <ShieldCheck className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Rapprochement de Caisse Éclair & Anti-Fraude</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Clôture ultra-rapide des espèces et soldes Orange Money avec détection d'écart à 0 FCFA
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-bold shadow-md">
                        <Calculator className="w-4 h-4" /> Clôturer ma Caisse (3 min)
                    </Button>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Caisses clôturées</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{donnees.total}</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Building2 className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Caisses Parfaites (0 écart)</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">{donnees.parfaites}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Trophy className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Taux de précision monétaire</p>
                            <p className="text-3xl font-black text-amber-600 mt-1">{donnees.tauxConformite}%</p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Coins className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des clôtures du jour */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Rapprochements du Jour ({donnees.clotures.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {donnees.clotures.map((c) => (
                        <Card key={c.id} className="border-slate-200 bg-white">
                            <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">{c.caissierNom}</h3>
                                    <p className="text-xs text-slate-500">{c.siteNom} • {c.dateHeure}</p>
                                </div>
                                <Badge variant={c.statut === 'PARFAIT' ? 'success' : 'destructive'} className="text-xs px-2.5 py-1">
                                    {c.statut === 'PARFAIT' ? '🟢 0 FCFA ÉCART' : `⚠️ ÉCART : ${c.ecartFcfa.toLocaleString()} FCFA`}
                                </Badge>
                            </CardHeader>

                            <CardContent className="p-5 pt-2 space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div>
                                        <span className="text-slate-500">Espèces comptées :</span>
                                        <p className="font-bold text-slate-900 text-sm">{c.especesCompteesFcfa.toLocaleString()} FCFA</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Solde Orange Money :</span>
                                        <p className="font-bold text-orange-600 text-sm">{c.soldeOrangeMoneyReel.toLocaleString()} FCFA</p>
                                    </div>
                                </div>

                                {c.badgeDecerne && (
                                    <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                                        <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                                        {c.badgeDecerne}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Modal Clôture Rapide */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Rapprochement de Caisse Flash</h3>
                            <Badge className={ecartCalcule === 0 ? 'bg-emerald-600' : 'bg-rose-600'}>
                                Écart direct : {ecartCalcule.toLocaleString()} FCFA
                            </Badge>
                        </div>

                        <form onSubmit={soumettreCloture} className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du caissier</label>
                                    <Input value={formCloture.caissierNom} onChange={e => setFormCloture({...formCloture, caissierNom: e.target.value})} placeholder="Ex: Aïcha Traoré" required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Boutique</label>
                                    <Input value={formCloture.siteNom} onChange={e => setFormCloture({...formCloture, siteNom: e.target.value})} required />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                                <p className="text-xs font-bold text-slate-700">Comptage par billets (Espèces) :</p>
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">10 000 F</label>
                                        <Input type="number" min="0" value={formCloture.detailBillets.dixMille} onChange={e => setFormCloture({
                                            ...formCloture, detailBillets: {...formCloture.detailBillets, dixMille: e.target.value}
                                        })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">5 000 F</label>
                                        <Input type="number" min="0" value={formCloture.detailBillets.cinqMille} onChange={e => setFormCloture({
                                            ...formCloture, detailBillets: {...formCloture.detailBillets, cinqMille: e.target.value}
                                        })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">2 000 F</label>
                                        <Input type="number" min="0" value={formCloture.detailBillets.deuxMille} onChange={e => setFormCloture({
                                            ...formCloture, detailBillets: {...formCloture.detailBillets, deuxMille: e.target.value}
                                        })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">1 000 F</label>
                                        <Input type="number" min="0" value={formCloture.detailBillets.mille} onChange={e => setFormCloture({
                                            ...formCloture, detailBillets: {...formCloture.detailBillets, mille: e.target.value}
                                        })} />
                                    </div>
                                </div>
                                <p className="text-right text-xs font-bold text-slate-800 pt-1">
                                    Total espèces : {totalBilletsCalcules.toLocaleString()} FCFA
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Espèces attendues</label>
                                    <Input type="number" value={formCloture.especesTheoriquesFcfa} onChange={e => setFormCloture({...formCloture, especesTheoriquesFcfa: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Solde Orange Money réel</label>
                                    <Input type="number" value={formCloture.soldeOmReel} onChange={e => setFormCloture({...formCloture, soldeOmReel: e.target.value})} required />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Valider la clôture</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
