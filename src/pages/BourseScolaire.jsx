import React, { useState, useEffect } from 'react';
import { GraduationCap, Award, BookOpen, Gift, Plus, Sparkles, CheckCircle2, User, Trophy, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function BourseScolaire() {
    const [donnees, setDonnees] = useState({ laureats: [], statistiques: {} });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formBrs, setFormBrs] = useState({
        parentNom: '',
        matricule: '',
        enfantNom: '',
        examenPasse: 'BACCALAURÉAT SÉRIE C',
        mention: 'TRÈS BIEN',
        primeFcfa: 150000
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/bourse-scolaire/statut');
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

    const soumettreLaureat = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/bourse-scolaire/declarer-laureat', formBrs);
            setModalOuverte(false);
            setFormBrs({ parentNom: '', matricule: '', enfantNom: '', examenPasse: 'BACCALAURÉAT SÉRIE C', mention: 'TRÈS BIEN', primeFcfa: 150000 });
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
                        <GraduationCap className="w-7 h-7 text-yellow-600" />
                        Bourse Scolaire & Prix d'Excellence Enfants du Personnel
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Programme de soutien familial SII : bourses d'études, kits scolaires complets et primes financières aux lauréats CEPE, BEPC et BAC
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Inscrire un Enfant Lauréat
                </Button>
            </div>

            {/* Statistiques KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 text-yellow-700 rounded-xl">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Lauréats Récompensés</p>
                            <p className="text-2xl font-bold text-slate-900">{donnees.statistiques.totalEnfantsRecompenses || 78} enfants</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux Réussite Enfants</p>
                            <p className="text-2xl font-bold text-emerald-600">{donnees.statistiques.tauxReussiteEnfantsSalaries || '96.2%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Kits Scolaires Distribués</p>
                            <p className="text-2xl font-bold text-blue-700">{donnees.statistiques.kitsDistribues || 215}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Budget Bourses Alloué</p>
                            <p className="text-xl font-bold text-purple-700">12 000 000 FCFA</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lauréats à l'honneur */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Tableau d'Honneur des Enfants Lauréats (Session 2026)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {donnees.laureats.map((brs) => (
                        <motion.div key={brs.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                            <Card className="border-slate-200 shadow-sm bg-white hover:border-yellow-300 transition-all flex flex-col justify-between h-full">
                                <CardHeader className="pb-3 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-yellow-50 text-yellow-800 border-yellow-300 font-semibold text-[10px]">
                                            {brs.examenPasse}
                                        </Badge>
                                        <span className="text-xs font-bold text-emerald-600">+{brs.primeExcellenceFcfa?.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                    <CardTitle className="text-base font-bold text-slate-900 mt-2">
                                        {brs.enfantNom} ({brs.age} ans)
                                    </CardTitle>
                                    <p className="text-xs text-slate-500">Parent collaborateur : <span className="font-semibold text-slate-800">{brs.parentNom}</span> ({brs.matricule})</p>
                                </CardHeader>

                                <CardContent className="py-4 space-y-3 text-xs text-slate-700">
                                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                                        <p><span className="text-slate-400 font-medium">Mention / Performance :</span> <span className="font-bold text-yellow-800">{brs.mentionObtenue}</span></p>
                                        <p><span className="text-slate-400 font-medium">Établissement :</span> {brs.ecoleProvenance}</p>
                                    </div>

                                    <div className="p-2.5 bg-yellow-50/60 rounded border border-yellow-200">
                                        <p className="text-[10px] font-bold text-yellow-800 uppercase flex items-center gap-1 mb-1">
                                            <Gift className="w-3.5 h-3.5" /> Dotation Spéciale SII Offerte
                                        </p>
                                        <p className="text-xs text-slate-800 font-medium">{brs.kitFournituresOffert}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-[10px] text-slate-400">Date versement : {brs.dateRemise}</span>
                                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
                                            {brs.statutDossier}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal inscription */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-yellow-600" />
                                Inscrire un Enfant pour la Bourse d'Excellence
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={soumettreLaureat} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Nom du Parent Salarié</label>
                                    <Input 
                                        value={formBrs.parentNom} 
                                        onChange={(e) => setFormBrs({ ...formBrs, parentNom: e.target.value })}
                                        placeholder="Ex: Koné Amadou"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Matricule</label>
                                    <Input 
                                        value={formBrs.matricule} 
                                        onChange={(e) => setFormBrs({ ...formBrs, matricule: e.target.value })}
                                        placeholder="EMP-4100"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Prénoms & Nom de l'Enfant</label>
                                <Input 
                                    value={formBrs.enfantNom} 
                                    onChange={(e) => setFormBrs({ ...formBrs, enfantNom: e.target.value })}
                                    placeholder="Ex: Fatimata Koné"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Examen Réussi</label>
                                    <select 
                                        value={formBrs.examenPasse} 
                                        onChange={(e) => setFormBrs({ ...formBrs, examenPasse: e.target.value })}
                                        className="w-full text-sm p-2 border rounded-md"
                                    >
                                        <option value="CEPE & Entrée en 6ème">CEPE / Entrée en 6ème</option>
                                        <option value="BEPC">BEPC</option>
                                        <option value="BACCALAURÉAT SÉRIE A">Baccalauréat A</option>
                                        <option value="BACCALAURÉAT SÉRIE D">Baccalauréat D</option>
                                        <option value="BACCALAURÉAT SÉRIE C">Baccalauréat C</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Mention Obtenue</label>
                                    <Input 
                                        value={formBrs.mention} 
                                        onChange={(e) => setFormBrs({ ...formBrs, mention: e.target.value })}
                                        placeholder="Ex: BIEN / TRÈS BIEN"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">Valider la Dotation</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default BourseScolaire;
