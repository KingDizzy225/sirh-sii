import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, CheckCircle2, Award, Sparkles, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function PasseportEvenements() {
    const [donnees, setDonnees] = useState({ missions: [], principeSelection: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formCandidature, setFormCandidature] = useState({
        nomEvenement: 'Salon International de l\'Agriculture (SARA Abidjan)',
        conseillerNom: '',
        agence: 'Agence Orange Cocody Angré'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/passeport-evenements/missions');
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

    const soumettreCandidature = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/passeport-evenements/candidater', formCandidature);
            setModalOuverte(false);
            setFormCandidature({ nomEvenement: 'Salon International de l\'Agriculture (SARA Abidjan)', conseillerNom: '', agence: '' });
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
                        <Sparkles className="w-7 h-7 text-amber-500" />
                        Passeport Événementiel (Concerts, Salons & Stades Orange)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Système de roulement transparent et équitable pour l'affectation des équipes sur les grands événements partenaires
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Postuler pour une Mission VIP
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.missions.map((m) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {m.nomEvenement}
                                    </CardTitle>
                                    <Badge className="bg-amber-100 text-amber-800">{m.dateMission}</Badge>
                                </div>
                                <p className="text-xs text-slate-500">{m.typeEvenement}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p className="font-bold text-slate-900">Équipe sélectionnée :</p>
                                    {m.conseillersSelectionnes.map((c, idx) => (
                                        <p key={idx} className="flex items-center gap-1">
                                            <span className="text-amber-600 font-bold">•</span>
                                            <span><strong>{c.nom}</strong> ({c.agence}) - <em>{c.role}</em></span>
                                        </p>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs">
                                    <span className="text-emerald-700 font-bold">
                                        Prime mission : +{m.primeMissionJourFcfa?.toLocaleString('fr-FR')} FCFA/jour
                                    </span>
                                    <Badge variant="outline" className="text-slate-600">{m.statutMission}</Badge>
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
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Candidater à une Mission Événementielle
                        </h3>
                        <form onSubmit={soumettreCandidature} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Votre Nom & Prénoms</label>
                                <Input required value={formCandidature.conseillerNom} onChange={(e) => setFormCandidature({ ...formCandidature, conseillerNom: e.target.value })} placeholder="Ex: Mariam Diomandé" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Votre Agence</label>
                                <Input required value={formCandidature.agence} onChange={(e) => setFormCandidature({ ...formCandidature, agence: e.target.value })} placeholder="Ex: Plateau Postel" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Événement Souhaité</label>
                                <Input required value={formCandidature.nomEvenement} onChange={(e) => setFormCandidature({ ...formCandidature, nomEvenement: e.target.value })} />
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-900 rounded-lg text-xs">
                                ⚖️ <strong>Équité garantie :</strong> Les collaborateurs n'ayant pas participé aux missions récentes bénéficient d'un coefficient prioritaire.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Envoyer Candidature</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
