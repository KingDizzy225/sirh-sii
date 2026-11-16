import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, Navigation, Plus, Utensils, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function BadgeuseNomade() {
    const [pointages, setPointages] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formPointage, setFormPointage] = useState({
        animateurNom: '',
        campagne: 'Caravane Fibre Promo Abobo',
        lieuStand: 'Rond-Point Mairie d\'Abobo'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/badgeuse-nomade/pointages');
            if (res.data && res.data.succes) {
                setPointages(res.data.pointages);
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

    const soumettrePointage = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/badgeuse-nomade/pointer', formPointage);
            setModalOuverte(false);
            setFormPointage({ animateurNom: '', campagne: 'Caravane Fibre Promo Abobo', lieuStand: '' });
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
                        <Navigation className="w-7 h-7 text-indigo-600" />
                        Badgeuse Nomade des Caravanes & Street Marketing
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Pointage géolocalisé pour les équipes de stands éphémères et validation automatique des paniers repas
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Pointer sur Mon Stand (GPS)
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pointages.map((p) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-indigo-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {p.animateurNom}
                                    </CardTitle>
                                    <Badge className="bg-indigo-100 text-indigo-800">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {p.statutPointage}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 font-semibold">{p.campagne}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p className="flex items-center gap-1">📍 <strong>Lieu stand :</strong> {p.lieuStand}</p>
                                    <p className="font-mono text-slate-500">🛰️ GPS : {p.coordonneesGps}</p>
                                    <p className="text-emerald-700 font-semibold flex items-center gap-1">
                                        <Utensils className="w-3.5 h-3.5" /> Prime panier jour : {p.montantPanierJourFcfa.toLocaleString('fr-FR')} FCFA validée
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Arrivée à {p.heureArrivee}
                                    </span>
                                    <span className="text-emerald-600 font-bold">Rayon d'action certifié</span>
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
                            <Navigation className="w-5 h-5 text-indigo-600" />
                            Pointer Présence Stand Nomade
                        </h3>
                        <form onSubmit={soumettrePointage} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms de l'Animateur</label>
                                <Input required value={formPointage.animateurNom} onChange={(e) => setFormPointage({ ...formPointage, animateurNom: e.target.value })} placeholder="Ex: Yves-Roland Kouassi" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Campagne Commerciale</label>
                                <Input required value={formPointage.campagne} onChange={(e) => setFormPointage({ ...formPointage, campagne: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Emplacement du Stand</label>
                                <Input required value={formPointage.lieuStand} onChange={(e) => setFormPointage({ ...formPointage, lieuStand: e.target.value })} placeholder="Ex: Marché de Treichville" />
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-900 rounded-lg text-xs">
                                🛰️ Vos coordonnées GPS actuelles seront capturées pour attester de votre prise de poste sur le podium.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Confirmer le Pointage</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
