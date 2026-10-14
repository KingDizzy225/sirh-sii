import React, { useState, useEffect } from 'react';
import { 
    Car, Users, MapPin, Clock, ShieldCheck, Plus, CheckCircle2, 
    ArrowRight, Phone, Ticket, AlertCircle, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function CovoiturageSecurite() {
    const [trajets, setTrajets] = useState([]);
    const [bons, setBons] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalTrajet, setModalTrajet] = useState(false);
    const [modalBon, setModalBon] = useState(false);

    // Formulaire de proposition de trajet
    const [formTrajet, setFormTrajet] = useState({
        departNom: 'Agence Orange Plateau',
        arriveeZone: 'Yopougon Niangon / Toits Rouges',
        heureDepart: '19:30',
        placesDispos: 3,
        telephone: '+225 07 ',
        vehicule: 'Véhicule personnel'
    });

    // Formulaire de bon transport
    const [formBon, setFormBon] = useState({
        employeNom: '',
        siteNom: 'Agence Cap Sud Marcory',
        motif: 'Fermeture tardive & inventaire caisse',
        montantEstime: 3500
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/covoiturage/trajets');
            if (res.data) {
                setTrajets(res.data.trajets || []);
                setBons(res.data.bonsTransport || []);
            }
        } catch (e) {
            console.error('Erreur chargement covoiturage:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreTrajet = async (e) => {
        e.preventDefault();
        try {
            await api.post('/covoiturage/proposer', formTrajet);
            setModalTrajet(false);
            await charger();
        } catch (e) {
            console.error('Erreur création trajet:', e);
        }
    };

    const rejoindreTrajet = async (id) => {
        try {
            await api.post(`/covoiturage/rejoindre/${id}`, {});
            await charger();
        } catch (e) {
            console.error('Erreur réservation place:', e);
        }
    };

    const soumettreBon = async (e) => {
        e.preventDefault();
        try {
            await api.post('/covoiturage/bon-transport', formBon);
            setModalBon(false);
            await charger();
        } catch (e) {
            console.error('Erreur demande bon:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                            <Car className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Retour Serein (Covoiturage & Navette Nuit)</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Mobilité collaborative et bons de transport sécurisés pour les sorties tardives des équipes de boutique
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setModalBon(true)} className="gap-2">
                        <Ticket className="w-4 h-4 text-amber-600" />
                        Demander un bon Taxi Nuit
                    </Button>
                    <Button onClick={() => setModalTrajet(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4" />
                        Proposer des places en voiture
                    </Button>
                </div>
            </div>

            {/* Trajets disponibles */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-indigo-600" />
                    Départs & Navettes collègues ce soir ({trajets.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trajets.map((t) => {
                        const complet = t.placesOccupees.length >= t.placesDispos;
                        return (
                            <Card key={t.id} className="border-slate-200/80 bg-white hover:border-indigo-200 transition-all">
                                <CardHeader className="p-5 pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{t.chauffeurNom}</p>
                                            <p className="text-xs text-slate-500">{t.vehicule}</p>
                                        </div>
                                        <Badge variant={complet ? 'secondary' : 'default'} className="px-2.5 py-1">
                                            {complet ? 'COMPLET' : `${t.placesDispos - t.placesOccupees.length} place(s) dispo`}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 pt-2 space-y-4">
                                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span className="font-medium">Départ :</span> {t.departNom}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                                            <span className="font-medium">Vers :</span> {t.arriveeZone}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700 pt-1 border-t border-slate-200/60">
                                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                                            <span className="font-medium">Heure :</span> {t.heureDepart}
                                        </div>
                                    </div>

                                    {t.placesOccupees.length > 0 && (
                                        <p className="text-xs text-slate-500">
                                            Passagers confirmés : <span className="font-semibold text-slate-700">{t.placesOccupees.join(', ')}</span>
                                        </p>
                                    )}

                                    <Button 
                                        size="sm" 
                                        disabled={complet}
                                        onClick={() => rejoindreTrajet(t.id)}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        {complet ? 'Trajet complet' : 'Réserver une place'}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Bons de transport nocturnes validés */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Bons de Transport Partenaire (Yango / Uber Corporate)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bons.map((b) => (
                        <Card key={b.id} className="border-slate-200/80 bg-white">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-900">{b.employeNom}</p>
                                        <p className="text-xs text-slate-500">{b.siteNom}</p>
                                    </div>
                                    <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                        {b.statut}
                                    </Badge>
                                </div>
                                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs space-y-1">
                                    <p className="text-slate-600">{b.motif}</p>
                                    <p className="font-bold text-amber-900">Forfait pris en charge : {b.montantFcfa.toLocaleString()} FCFA</p>
                                </div>
                                <div className="flex items-center justify-between text-xs pt-1">
                                    <span className="text-slate-500">{b.partenaire}</span>
                                    <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800 border">
                                        Code : {b.codeBon}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Modal Nouveau Trajet */}
            {modalTrajet && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Proposer des places ce soir</h3>
                        <form onSubmit={soumettreTrajet} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Agence de départ</label>
                                <Input value={formTrajet.departNom} onChange={e => setFormTrajet({...formTrajet, departNom: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Zone de destination</label>
                                <Input value={formTrajet.arriveeZone} onChange={e => setFormTrajet({...formTrajet, arriveeZone: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Heure de départ</label>
                                    <Input value={formTrajet.heureDepart} onChange={e => setFormTrajet({...formTrajet, heureDepart: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre de places</label>
                                    <Input type="number" min="1" max="6" value={formTrajet.placesDispos} onChange={e => setFormTrajet({...formTrajet, placesDispos: e.target.value})} required />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <Button type="button" variant="outline" onClick={() => setModalTrajet(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Publier</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal Bon Transport */}
            {modalBon && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Bon de transport sécurisé</h3>
                        <form onSubmit={soumettreBon} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du collaborateur</label>
                                <Input value={formBon.employeNom} onChange={e => setFormBon({...formBon, employeNom: e.target.value})} placeholder="Ex: Kouamé N'goran" required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Boutique / Agence</label>
                                <Input value={formBon.siteNom} onChange={e => setFormBon({...formBon, siteNom: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Motif de la fermeture tardive</label>
                                <Input value={formBon.motif} onChange={e => setFormBon({...formBon, motif: e.target.value})} required />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <Button type="button" variant="outline" onClick={() => setModalBon(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Générer le bon</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
