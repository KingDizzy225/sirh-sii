import React, { useState, useEffect } from 'react';
import { Recycle, Leaf, BatteryCharging, Plus, CheckCircle2, Award, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function RecyclageBoutique() {
    const [donnees, setDonnees] = useState({ agences: [], baremePrime: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formPesee, setFormPesee] = useState({
        agenceNom: 'Agence Orange Treichville Arras',
        nbTelephones: 15,
        kgBatteries: 6.5
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/recyclage-boutique/statistiques');
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

    const soumettrePesee = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/recyclage-boutique/peser-bac', formPesee);
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
                        <Recycle className="w-7 h-7 text-emerald-600" />
                        Pacte Éco-Responsable "Boutique Verte & Recyclage DEEE"
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Collecte des vieux téléphones, chargeurs et batteries usagées en boutique avec prime reversée dans la cagnotte équipe
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Enregistrer Pesée du Bac Éco
                </Button>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs">
                🌱 <strong>Barème Éco-Prime :</strong> {donnees.baremePrime || '500 FCFA/téléphone + 1 000 FCFA/kg de batteries pour la cagnotte boutique'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.agences.map((ag) => (
                    <motion.div key={ag.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-emerald-600">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {ag.agenceNom}
                                    </CardTitle>
                                    <Badge className="bg-emerald-100 text-emerald-800 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {ag.statutEnlevement}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Partenaire : <strong>{ag.partenaireRecyclage}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>📱 <strong>Téléphones usagés collectés :</strong> {ag.telephonesHorsUsageRecus} appareils</p>
                                    <p>🔋 <strong>Batteries usagées sécurisées :</strong> {ag.kilosBatteriesCollectees} kg</p>
                                    <p>🔌 <strong>Câbles & chargeurs :</strong> {ag.cablesChargeursKilos} kg</p>
                                    <p className="text-emerald-700 font-bold text-sm">
                                        💰 Cagnotte d'Équipe Gagnée : +{ag.primeEcoEquipeGagneeFcfa?.toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Certificat recyclage vert</span>
                                    <span>{ag.datePesee}</span>
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
                            <Recycle className="w-5 h-5 text-emerald-600" />
                            Pesée du Bac de Recyclage
                        </h3>
                        <form onSubmit={soumettrePesee} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Agence</label>
                                <Input required value={formPesee.agenceNom} onChange={(e) => setFormPesee({ ...formPesee, agenceNom: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nombre de téléphones hors d'usage</label>
                                <Input type="number" required value={formPesee.nbTelephones} onChange={(e) => setFormPesee({ ...formPesee, nbTelephones: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Poids batteries usagées (kg)</label>
                                <Input type="number" step="0.5" required value={formPesee.kgBatteries} onChange={(e) => setFormPesee({ ...formPesee, kgBatteries: Number(e.target.value) })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Enregistrer & Créditer Prime</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
