import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, MapPin, Clock, Plus, CheckCircle2, Building2, User, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function PermutationQuartier() {
    const [permutations, setPermutations] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formPerm, setFormPerm] = useState({
        demandeurNom: '',
        poste: 'Conseiller Commercial Fibre & SIM',
        agenceActuelle: '',
        quartierHabite: '',
        agenceSouhaitee: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/permutation-quartier/annonces');
            if (res.data && res.data.succes) {
                setPermutations(res.data.permutations);
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

    const soumettreDemande = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/permutation-quartier/publier', formPerm);
            setModalOuverte(false);
            setFormPerm({
                demandeurNom: '',
                poste: 'Conseiller Commercial Fibre & SIM',
                agenceActuelle: '',
                quartierHabite: '',
                agenceSouhaitee: ''
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
                        <ArrowLeftRight className="w-7 h-7 text-emerald-600" />
                        Bourse de Permutation de Quartier (Rapprochement Domicile)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Permutez de boutique volontairement avec un collègue pour économiser jusqu'à 2h de trajet quotidien
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Publier une Demande de Permutation
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permutations.map((item) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <User className="w-4 h-4 text-emerald-600" />
                                        {item.demandeurNom}
                                    </CardTitle>
                                    <Badge className={item.statut === 'MATCH_TROUVE' ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'}>
                                        {item.statut === 'MATCH_TROUVE' ? 'Match Confirmé !' : 'En recherche'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">{item.poste}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs">
                                    <p className="text-slate-600">🏠 Résidence : <strong>{item.quartierHabite}</strong></p>
                                    <p className="text-slate-600">📍 Agence actuelle : <strong>{item.agenceActuelle}</strong></p>
                                    <p className="text-emerald-700 font-semibold">🎯 Agence souhaitée : {item.agenceSouhaitee}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span className="flex items-center gap-1 font-bold text-emerald-600">
                                        <Clock className="w-3.5 h-3.5" /> Gain estimé : ~{item.gainTrajetEstimeMinutes} min/jour
                                    </span>
                                    <span>Publié le {item.datePublication}</span>
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
                            <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
                            Proposer une Permutation
                        </h3>
                        <form onSubmit={soumettreDemande} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Votre Nom & Prénoms</label>
                                <Input required value={formPerm.demandeurNom} onChange={(e) => setFormPerm({ ...formPerm, demandeurNom: e.target.value })} placeholder="Ex: Kouassi Jean" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Agence Actuelle</label>
                                <Input required value={formPerm.agenceActuelle} onChange={(e) => setFormPerm({ ...formPerm, agenceActuelle: e.target.value })} placeholder="Ex: Agence Orange Treichville" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Quartier où vous résidez</label>
                                <Input required value={formPerm.quartierHabite} onChange={(e) => setFormPerm({ ...formPerm, quartierHabite: e.target.value })} placeholder="Ex: Cocody Angré 8ème" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Agence(s) souhaitée(s)</label>
                                <Input required value={formPerm.agenceSouhaitee} onChange={(e) => setFormPerm({ ...formPerm, agenceSouhaitee: e.target.value })} placeholder="Ex: Agence Orange Cocody Angré ou St Jean" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Publier</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
