import React, { useState, useEffect } from 'react';
import { Bike, ShieldAlert, Camera, MapPin, Plus, CheckCircle2, PhoneCall, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function ConstatMoto() {
    const [constats, setConstats] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formAccident, setFormAccident] = useState({
        coursierNom: '',
        motoImmatriculation: '',
        lieuAccident: '',
        gravite: 'LEGER_DEGATS_MATERIELS',
        description: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/constat-moto/liste');
            if (res.data && res.data.succes) {
                setConstats(res.data.constats);
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

    const soumettreConstat = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/constat-moto/declarer', formAccident);
            setModalOuverte(false);
            setFormAccident({
                coursierNom: '',
                motoImmatriculation: '',
                lieuAccident: '',
                gravite: 'LEGER_DEGATS_MATERIELS',
                description: ''
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
                        <Bike className="w-7 h-7 text-amber-600" />
                        Constat Amiable & Urgence Flotte Moto (Coursiers & Techniciens)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Déclaration d'accrochage en 60 secondes, prise en charge médicale partenaire et moto de secours
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Déclarer un Incident Moto
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {constats.map((c) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Bike className="w-4 h-4 text-amber-600" />
                                        {c.coursierNom} ({c.matricule})
                                    </CardTitle>
                                    <Badge className="bg-amber-100 text-amber-800">{c.gravite}</Badge>
                                </div>
                                <p className="text-xs text-slate-500">Moto : <strong>{c.motoImmatriculation}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>📍 <strong>Lieu :</strong> {c.lieuAccident}</p>
                                    <p>🩺 <strong>Santé :</strong> {c.statutSante}</p>
                                    <p>📸 <strong>Photos :</strong> {c.photosJointes} photos géolocalisées certifiées</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Moto de secours déployée
                                    </span>
                                    <span>{c.dateHeure}</span>
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
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            Déclaration d'Accrochage Flotte Moto
                        </h3>
                        <form onSubmit={soumettreConstat} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom du Conducteur / Coursier</label>
                                <Input required value={formAccident.coursierNom} onChange={(e) => setFormAccident({ ...formAccident, coursierNom: e.target.value })} placeholder="Ex: Sylvain Drogba" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Immatriculation de la Moto SII</label>
                                <Input required value={formAccident.motoImmatriculation} onChange={(e) => setFormAccident({ ...formAccident, motoImmatriculation: e.target.value })} placeholder="Ex: 4489 KH 01" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Lieu précis de l'accrochage</label>
                                <Input required value={formAccident.lieuAccident} onChange={(e) => setFormAccident({ ...formAccident, lieuAccident: e.target.value })} placeholder="Ex: Boulevard VGE carrefour Solibra" />
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-900 rounded-lg text-xs">
                                🚨 L'assistance médicale partenaire et le gestionnaire de flotte SII seront notifiés dès validation.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Transmettre le Constat</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
