import React, { useState, useEffect } from 'react';
import { Compass, Calendar, Users, MapPin, Plus, Sparkles, CheckCircle2, AlertCircle, Gift, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function RetourVillage() {
    const [donnees, setDonnees] = useState({ rotations: [], feteEnPreparation: 'Fêtes de Fin d\'Année 2026', regles: {}, tauxCouverturePermanenceBoutiques: '68%' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formRot, setFormRot] = useState({
        employeNom: '',
        agence: 'Agence Orange Cocody St Jean',
        destinationVillage: 'Man (Tonkpi)',
        feteSollicitee: 'Noël & Réveillon 2026',
        vagueSouhaitee: 'VAGUE_1 (Du 21 au 28 Déc)'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/retour-village/statut');
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

    const soumettreDemande = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/retour-village/demande-rotation', formRot);
            setModalOuverte(false);
            setFormRot({ employeNom: '', agence: 'Agence Orange Cocody St Jean', destinationVillage: '', feteSollicitee: 'Noël & Réveillon 2026', vagueSouhaitee: 'VAGUE_1 (Du 21 au 28 Déc)' });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Compass className="w-7 h-7 text-teal-600" />
                        Planificateur Équitable "Retour au Village & Fêtes"
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Gestion paritaire et alternée des départs en province pour Noël, Tabaski et Pâques sans dégarnir les agences Orange
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Poser ma Candidature Rotation Fêtes
                </Button>
            </div>

            {/* Statistiques KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-teal-100 text-teal-700 rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Événement en Cours</p>
                            <p className="text-sm font-bold text-slate-900">Noël & Fin d'Année 2026</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Permanence Boutiques</p>
                            <p className="text-2xl font-bold text-emerald-600">{donnees.tauxCouverturePermanenceBoutiques}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Prime Présence Fêtes</p>
                            <p className="text-xl font-bold text-amber-700">+50 000 FCFA</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Car className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Prise en Charge Car UTB</p>
                            <p className="text-sm font-bold text-blue-700">100% Forfait Province</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Règles de justice paritaire */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-xl shadow-md">
                <h3 className="font-bold text-sm flex items-center gap-2 text-teal-300">
                    <Sparkles className="w-4 h-4" />
                    Charte de Justice Sociale & Équité de Rotation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs text-slate-200">
                    <p>• <span className="text-teal-200 font-semibold">Alternance Annuelle Stricte :</span> Tout agent resté en poste à Abidjan pour Noël 2025 est prioritaire absolu pour partir au village en 2026.</p>
                    <p>• <span className="text-teal-200 font-semibold">Prime de Solidarité :</span> Les agents assurant le guichet les 24, 25 et 31 Décembre perçoivent une gratification exceptionnelle de 50 000 FCFA.</p>
                </div>
            </div>

            {/* Liste des rotations */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Affectations & Départs en Province Validés</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {donnees.rotations.map((rot) => (
                        <motion.div key={rot.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="border-slate-200 shadow-sm bg-white hover:border-teal-300 transition-all">
                                <CardHeader className="pb-3 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">
                                            {rot.sessionAttribution}
                                        </Badge>
                                        <span className="text-xs font-bold text-emerald-600">+{rot.primeTransportFcfa?.toLocaleString('fr-FR')} F Transport</span>
                                    </div>
                                    <CardTitle className="text-base font-bold text-slate-900 mt-2">
                                        {rot.employeNom}
                                    </CardTitle>
                                    <p className="text-xs text-slate-500">{rot.agence}</p>
                                </CardHeader>

                                <CardContent className="py-4 space-y-3 text-xs text-slate-700">
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                                        <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                                        <span className="font-semibold text-slate-900">Destination : {rot.destinationVillage}</span>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-slate-400 font-medium">Critère d'attribution équitable :</p>
                                        <p className="text-slate-800 italic">{rot.historiquePrecedent}</p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-slate-500">Binôme Relève :</span>
                                        <span className="font-medium text-slate-800">{rot.permanenceRemplaceePar}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal de candidature */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Compass className="w-5 h-5 text-teal-600" />
                                Candidature Rotation Fêtes de Fin d'Année
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={soumettreDemande} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Nom & Prénoms du Conseiller</label>
                                <Input 
                                    value={formRot.employeNom} 
                                    onChange={(e) => setFormRot({ ...formRot, employeNom: e.target.value })}
                                    placeholder="Ex: Kouamé Jean"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Agence de Rattachement</label>
                                <Input 
                                    value={formRot.agence} 
                                    onChange={(e) => setFormRot({ ...formRot, agence: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Ville / Village de Destination (Province)</label>
                                <Input 
                                    value={formRot.destinationVillage} 
                                    onChange={(e) => setFormRot({ ...formRot, destinationVillage: e.target.value })}
                                    placeholder="Ex: Bouaflé / Korhogo / Daoukro"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Créneau Souhaité</label>
                                <select 
                                    value={formRot.vagueSouhaitee} 
                                    onChange={(e) => setFormRot({ ...formRot, vagueSouhaitee: e.target.value })}
                                    className="w-full text-sm p-2 border rounded-md"
                                >
                                    <option value="VAGUE_1 (Du 21 au 28 Décembre)">Vague 1 : Fête de Noël (Du 21 au 28 Déc)</option>
                                    <option value="VAGUE_2 (Du 28 Décembre au 05 Janvier)">Vague 2 : Réveillon & Nouvel An (Du 28 Déc au 05 Jan)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Transmettre au Comité Paritaire</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default RetourVillage;
