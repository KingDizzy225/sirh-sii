import React, { useState, useEffect } from 'react';
import { Fuel, Navigation, Plus, CheckCircle2, AlertTriangle, CreditCard, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function FraisCarburant() {
    const [donnees, setDonnees] = useState({ tournees: [], plafondMensuelZoneFcfa: 150000 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formRecharge, setFormRecharge] = useState({
        superviseurNom: 'Aka Jean-Baptiste',
        montantFcfa: 50000,
        motif: 'Tournée hebdomadaire sous-distributeurs'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/frais-carburant/statuts');
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

    const soumettreRecharge = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/frais-carburant/demander-recharge', formRecharge);
            setModalOuverte(false);
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
                        <Fuel className="w-7 h-7 text-amber-600" />
                        Carte Carburant & Tournées Kilométriques des Superviseurs
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Suivi des dotations essence Total/Shell dématérialisées et rapprochement GPS des visites de points de vente
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Demander Recharge Carte Carburant
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.tournees.map((trn) => (
                    <motion.div key={trn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Car className="w-4 h-4 text-amber-600" />
                                        {trn.superviseurNom}
                                    </CardTitle>
                                    <Badge className="bg-amber-100 text-amber-800 font-bold">
                                        {trn.soldeCarteTotalFcfa?.toLocaleString('fr-FR')} FCFA dispo
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Véhicule : <strong>{trn.vehiculeType}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>🗺️ <strong>Zone :</strong> {trn.zoneSupervision}</p>
                                    <p>🛣️ <strong>Kilomètres parcourus :</strong> {trn.kmParcourusMois} km</p>
                                    <p>🏪 <strong>Points de vente audités :</strong> {trn.pointsDeVenteVisites} boutiques</p>
                                    <p className="text-emerald-700 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Trajet certifié conforme par la balise GPS SII
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>{trn.dernierRavitaillement}</span>
                                    {trn.rechargeAutoDeclenchee && (
                                        <span className="text-rose-600 font-bold animate-pulse">Alerte Solde Bas</span>
                                    )}
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
                            <Fuel className="w-5 h-5 text-amber-600" />
                            Recharge Carte Carburant
                        </h3>
                        <form onSubmit={soumettreRecharge} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Superviseur</label>
                                <Input required value={formRecharge.superviseurNom} onChange={(e) => setFormRecharge({ ...formRecharge, superviseurNom: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Montant Souhaité (FCFA)</label>
                                <Input type="number" step="10000" required value={formRecharge.montantFcfa} onChange={(e) => setFormRecharge({ ...formRecharge, montantFcfa: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Motif de la tournée</label>
                                <Input required value={formRecharge.motif} onChange={(e) => setFormRecharge({ ...formRecharge, motif: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Valider la Recharge</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
