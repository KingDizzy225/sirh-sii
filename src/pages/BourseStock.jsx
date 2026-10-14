import React, { useState, useEffect } from 'react';
import { 
    Layers, Package, AlertCircle, ArrowRightLeft, Plus, 
    CheckCircle2, Clock, MapPin, Building2, Send, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function BourseStock() {
    const [demandes, setDemandes] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formDemande, setFormDemande] = useState({
        siteDemandeur: 'Agence Orange Cocody Saint-Jean',
        materiel: 'Cartes SIM Physiques 4G/5G',
        quantiteDemandee: 50,
        urgence: 'HAUTE'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/bourse-stock/demandes');
            if (res.data) setDemandes(res.data.demandes || []);
        } catch (e) {
            console.error('Erreur bourse stock:', e);
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
            await api.post('/bourse-stock/demander', formDemande);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur création demande stock:', e);
        }
    };

    const accepterDepannage = async (id) => {
        try {
            await api.post(`/bourse-stock/accepter/${id}`, { siteCedeur: 'Mon Agence (Cédante)' });
            await charger();
        } catch (e) {
            console.error('Erreur acceptation dépannage:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                            <ArrowRightLeft className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Bourse de Dépannage Stock Inter-Agences</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Cessions d'urgence de SIMs, box Fibre et PLV entre agences Orange de même zone géographique
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Plus className="w-4 h-4" /> Publier un SOS Matériel
                    </Button>
                </div>
            </div>

            {/* Liste des demandes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demandes.map((d) => (
                    <Card key={d.id} className="border-slate-200 bg-white">
                        <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">{d.materiel}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5" /> {d.siteDemandeur}
                                </p>
                            </div>
                            <Badge variant={d.urgence === 'CRITIQUE' ? 'destructive' : 'warning'} className="text-xs px-2.5 py-1">
                                {d.urgence}
                            </Badge>
                        </CardHeader>

                        <CardContent className="p-5 pt-2 space-y-4">
                            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Quantité requise :</span>
                                    <span className="font-bold text-slate-900">{d.quantiteDemandee} unités</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Statut :</span>
                                    <span className="font-semibold text-blue-700">{d.statut}</span>
                                </div>
                                {d.bonDeTransfertRef && (
                                    <div className="flex justify-between pt-1 border-t border-slate-200">
                                        <span className="text-slate-500">Bon de transfert :</span>
                                        <span className="font-mono font-bold text-emerald-700">{d.bonDeTransfertRef}</span>
                                    </div>
                                )}
                            </div>

                            {d.statut === 'OUVERTE' ? (
                                <Button 
                                    size="sm" 
                                    onClick={() => accepterDepannage(d.id)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Dépanner cette agence (Émettre Bon)
                                </Button>
                            ) : (
                                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs text-center font-medium">
                                    ✅ Dépannage pris en charge par {d.siteCedeurPropose}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal SOS Matériel */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Demande de dépannage stock</h3>
                        <form onSubmit={soumettreDemande} className="space-y-4 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Agence demandeuse</label>
                                <Input value={formDemande.siteDemandeur} onChange={e => setFormDemande({...formDemande, siteDemandeur: e.target.value})} required />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Matériel en rupture</label>
                                <Input value={formDemande.materiel} onChange={e => setFormDemande({...formDemande, materiel: e.target.value})} placeholder="Ex: Flybox 4G Home" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Quantité</label>
                                    <Input type="number" min="1" value={formDemande.quantiteDemandee} onChange={e => setFormDemande({...formDemande, quantiteDemandee: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Niveau d'urgence</label>
                                    <select 
                                        value={formDemande.urgence} 
                                        onChange={e => setFormDemande({...formDemande, urgence: e.target.value})}
                                        className="w-full p-2 border border-slate-300 rounded-xl"
                                    >
                                        <option value="NORMALE">Normale</option>
                                        <option value="HAUTE">Haute</option>
                                        <option value="CRITIQUE">Critique (Rupture immédiate)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Diffuser l'appel</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
