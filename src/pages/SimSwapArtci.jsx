import React, { useState, useEffect } from 'react';
import { ShieldAlert, QrCode, CheckCircle2, UserCheck, Plus, Lock, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function SimSwapArtci() {
    const [swaps, setSwaps] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formSwap, setFormSwap] = useState({
        numeroLigne: '',
        clientNom: '',
        cniNumero: '',
        motif: 'PERTE_VOL',
        conseillerNom: '',
        agenceNom: 'Agence Orange Plateau Postel 2001'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/sim-swap-artci/registre');
            if (res.data && res.data.succes) {
                setSwaps(res.data.swaps);
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

    const soumettreSwap = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/sim-swap-artci/valider-swap', formSwap);
            setModalOuverte(false);
            setFormSwap({
                numeroLigne: '',
                clientNom: '',
                cniNumero: '',
                motif: 'PERTE_VOL',
                conseillerNom: '',
                agenceNom: 'Agence Orange Plateau Postel 2001'
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
                        <Lock className="w-7 h-7 text-emerald-600" />
                        Registre Sécurisé des SIM Swaps & Conformité ARTCI
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Traçabilité légale, double vérification d'identité et protection juridique des conseillers en boutique
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Enregistrer un Remplacement SIM
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {swaps.map((s) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-emerald-600" />
                                        {s.numeroLigne}
                                    </CardTitle>
                                    <Badge className="bg-emerald-100 text-emerald-800">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {s.statutArtci}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Client : <strong>{s.clientNom}</strong> ({s.cniNumero})</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>🏬 <strong>Agence :</strong> {s.agenceNom}</p>
                                    <p>👤 <strong>Conseiller opérateur :</strong> {s.conseillerNom}</p>
                                    <p>🔑 <strong>OTP de contrôle :</strong> Code vérifié ({s.otpEnvoye})</p>
                                    <p className="text-emerald-700 font-semibold">🛡️ Risque Fraude : {s.risqueFraude}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span className="font-mono text-slate-400">ID : {s.id}</span>
                                    <span>{s.dateHeure}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-emerald-600" />
                            Certification Swap SIM (Conformité ARTCI)
                        </h3>
                        <form onSubmit={soumettreSwap} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Numéro de Téléphone Client</label>
                                <Input required value={formSwap.numeroLigne} onChange={(e) => setFormSwap({ ...formSwap, numeroLigne: e.target.value })} placeholder="+225 07 XX XX XX XX" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms du Client</label>
                                <Input required value={formSwap.clientNom} onChange={(e) => setFormSwap({ ...formSwap, clientNom: e.target.value })} placeholder="Ex: Kouamé N'Guessan" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Numéro CNI / Passeport</label>
                                <Input required value={formSwap.cniNumero} onChange={(e) => setFormSwap({ ...formSwap, cniNumero: e.target.value })} placeholder="Ex: CI003891829" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Conseiller Traitant</label>
                                <Input required value={formSwap.conseillerNom} onChange={(e) => setFormSwap({ ...formSwap, conseillerNom: e.target.value })} placeholder="Votre nom" />
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs">
                                ⚖️ L'opération génère une preuve numérique datée conformément aux exigences de l'Autorité de Régulation des Télécommunications de CI.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Certifier le Swap</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
