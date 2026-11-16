import React, { useState, useEffect } from 'react';
import { 
    Utensils, Clock, CheckCircle2, Wallet, Plus, 
    Users, Building2, ShoppingBag, Sparkles 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function PopoteAgence() {
    const [commandes, setCommandes] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formPlat, setFormPlat] = useState({
        employeNom: '',
        platChoisi: 'Attiéké Poisson Braisé (Tantie Marie)',
        montant: 2500
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/popote-agence/commandes');
            if (res.data) setCommandes(res.data.commandes || []);
        } catch (e) {
            console.error('Erreur chargement popote:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const ajouterPlat = async (e) => {
        e.preventDefault();
        try {
            await api.post('/popote-agence/rejoindre', formPlat);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur commande plat:', e);
        }
    };

    const cmd = commandes[0] || {};

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                            <Utensils className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Popote d'Agence & Commande Groupée du Midi</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Pause déjeuner conviviale et commande groupée Orange Money sans retard ni perte de monnaie
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-bold shadow-md">
                        <Plus className="w-4 h-4" /> Commander mon Plat du Midi
                    </Button>
                </div>
            </div>

            {/* Commande en cours aujourd'hui */}
            {cmd.id && (
                <Card className="border-amber-200 bg-linear-to-b from-white to-amber-50/20 shadow-md">
                    <CardHeader className="p-6 border-b border-amber-100 flex flex-row items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-amber-700 uppercase">Restaurant Partenaire du Jour</span>
                            <h2 className="text-2xl font-bold text-slate-900 mt-1">{cmd.restaurantChoisi}</h2>
                            <p className="text-xs text-slate-500 mt-1">{cmd.siteNom} • Livraison prévue : <strong>{cmd.heureLivraisonPrevue}</strong></p>
                        </div>
                        <Badge className="bg-emerald-600 text-white text-xs font-bold">
                            Cagnotte : {cmd.cagnotteOmTotalFcfa?.toLocaleString()} FCFA ({cmd.totalParticipants} collègues)
                        </Badge>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                        <div className="p-3 bg-white rounded-xl border border-amber-100 text-xs">
                            <p className="font-semibold text-slate-700">Menu proposé aujourd'hui :</p>
                            <p className="text-amber-800 font-bold mt-0.5">{cmd.menuDuJour}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-2">Plats déjà commandés par l'équipe :</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {cmd.commandesSalaries?.map((p, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-slate-900">{p.nom}</p>
                                            <p className="text-slate-500">{p.plat}</p>
                                        </div>
                                        <span className="font-bold text-amber-700">{p.montant} F</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal Commande */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Commander son plat du midi</h3>
                        <form onSubmit={ajouterPlat} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Votre nom</label>
                                <Input value={formPlat.employeNom} onChange={e => setFormPlat({...formPlat, employeNom: e.target.value})} placeholder="Ex: Kouassi Konan" required />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Choix du plat</label>
                                <Input value={formPlat.platChoisi} onChange={e => setFormPlat({...formPlat, platChoisi: e.target.value})} required />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Montant (FCFA)</label>
                                <Input type="number" step="500" value={formPlat.montant} onChange={e => setFormPlat({...formPlat, montant: e.target.value})} required />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Valider ma part</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
