import React, { useState, useEffect } from 'react';
import { Wifi, Gift, Users, Plus, CheckCircle2, DollarSign, Award, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function AmbassadeurFibre() {
    const [donnees, setDonnees] = useState({ ambassadeurs: [], remiseStaffPourcentage: 50, bonusParParrainageFcfa: 10000 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formParrainage, setFormParrainage] = useState({
        nomVoisin: '',
        telephoneVoisin: '',
        localisationVoisin: 'Yopougon'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/ambassadeur-fibre/statuts');
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

    const soumettreParrainage = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/ambassadeur-fibre/parrainer-voisin', formParrainage);
            setModalOuverte(false);
            setFormParrainage({ nomVoisin: '', telephoneVoisin: '', localisationVoisin: 'Yopougon' });
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
                        <Wifi className="w-7 h-7 text-orange-500" />
                        Programme Ambassadeur "Fibre chez Moi" & Parrainage Voisins
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Tarif préférentiel personnel (-50% sur votre Box Fibre Orange) et prime de 10 000 FCFA par voisin parrainé
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Parrainer un Voisin d'Immeuble
                </Button>
            </div>

            {/* Avantages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                            <Gift className="w-4 h-4" /> Tarif Staff SII Privilège
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black">-50 % sur toute la gamme Fibre</p>
                        <p className="text-xs text-orange-100 mt-1">Ex: Box Fibre Sérénité à 12 500 FCFA/mois au lieu de 25 000 FCFA</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                            <DollarSign className="w-4 h-4" /> Bonus Parrainage Cash
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black">+10 000 FCFA / Raccordement</p>
                        <p className="text-xs text-emerald-100 mt-1">Crédités sur votre fiche de paie pour chaque voisin branché</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ambassadeurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.ambassadeurs.map((amb) => (
                    <motion.div key={amb.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-orange-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {amb.employeNom}
                                    </CardTitle>
                                    <Badge className="bg-orange-100 text-orange-800 font-bold">
                                        <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Ambassadeur Étoile
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Quartier : <strong>{amb.quartier}</strong> • Formule : {amb.debitSouscrit}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>💰 <strong>Abonnement personnel :</strong> {amb.tarifStaffSiiFcfa?.toLocaleString('fr-FR')} FCFA/mois (-50%)</p>
                                    <p>👥 <strong>Voisins d'immeuble raccordés :</strong> {amb.voisinsParraines} foyers</p>
                                    <p className="text-emerald-700 font-bold text-sm">
                                        💵 Primes parrainage gagnées : +{amb.bonusCumuleGagneFcfa?.toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Ligne Fibre opérationnelle</span>
                                    <Badge className="bg-emerald-600 text-white">{amb.statutLigne}</Badge>
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
                            <Wifi className="w-5 h-5 text-orange-500" />
                            Parrainer un Voisin d'Immeuble
                        </h3>
                        <form onSubmit={soumettreParrainage} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms du Voisin</label>
                                <Input required value={formParrainage.nomVoisin} onChange={(e) => setFormParrainage({ ...formParrainage, nomVoisin: e.target.value })} placeholder="Ex: Kouamé Bernard" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Téléphone du Voisin</label>
                                <Input required value={formParrainage.telephoneVoisin} onChange={(e) => setFormParrainage({ ...formParrainage, telephoneVoisin: e.target.value })} placeholder="+225 07 XX XX XX XX" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Localisation / Immeuble</label>
                                <Input required value={formParrainage.localisationVoisin} onChange={(e) => setFormParrainage({ ...formParrainage, localisationVoisin: e.target.value })} placeholder="Ex: Yopougon Maroc Immeuble B" />
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-900 rounded-lg text-xs">
                                🚀 L'équipe technique Fibre SII vérifiera l'éligibilité sous 24h. Votre prime de 10 000 FCFA sera automatiquement créditée dès l'installation.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Transmettre le Parrainage</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
