import React, { useState, useEffect } from 'react';
import { 
    GraduationCap, Award, Sparkles, CheckCircle2, 
    FileText, UserCheck, Plus, TrendingUp, Building2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function ParrainageStagiaires() {
    const [stagiaires, setStagiaires] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formEval, setFormEval] = useState({
        stagiaireNom: '',
        ecoleProvenance: 'INP-HB Yamoussoukro',
        siteNom: 'Agence Orange Plateau',
        postureClient: 95,
        rapiditeCaisseOm: 92,
        espritEquipe: 94
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/parrainage-stagiaires/talents');
            if (res.data) setStagiaires(res.data.stagiaires || []);
        } catch (e) {
            console.error('Erreur parrainage stagiaires:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreEval = async (e) => {
        e.preventDefault();
        try {
            await api.post('/parrainage-stagiaires/evaluer', formEval);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur évaluation stagiaire:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <GraduationCap className="w-8 h-8 text-blue-200 animate-bounce" />
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-blue-200">Pépinière de Talents Orange</span>
                            <h1 className="text-3xl font-black tracking-tight">Fast-Track Parrainage Stagiaires & Alternants</h1>
                            <p className="text-blue-100 text-sm mt-1">
                                Détection des meilleurs juniors en boutique et déclenchement d'offres CDI avant la fin de leur stage
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg">
                        <Plus className="w-4 h-4 mr-2" /> Évaluer & Activer Fast-Track
                    </Button>
                </div>
            </div>

            {/* Liste des talents juniors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stagiaires.map((s) => (
                    <Card key={s.id} className="border-blue-200 bg-linear-to-b from-white to-blue-50/20 shadow-xs">
                        <CardHeader className="p-6 pb-3 border-b border-blue-100 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{s.stagiaireNom}</h3>
                                <p className="text-xs text-slate-500">{s.ecoleProvenance} • Tuteur : {s.tuteurNom}</p>
                                <p className="text-xs font-semibold text-blue-700 mt-0.5">{s.siteNom}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-blue-600">{s.scoreGlobal}%</span>
                                <Badge className="block mt-1 bg-emerald-600 text-white text-[10px]">
                                    CDI FAST-TRACK 🚀
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white p-3 rounded-2xl border border-blue-100">
                                <div>
                                    <span className="text-slate-400">Posture Client</span>
                                    <p className="font-bold text-slate-800 text-sm">{s.criteres.postureClient}%</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Vitesse Caisse OM</span>
                                    <p className="font-bold text-slate-800 text-sm">{s.criteres.rapiditeCaisseOm}%</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Esprit Équipe</span>
                                    <p className="font-bold text-slate-800 text-sm">{s.criteres.espritEquipe}%</p>
                                </div>
                            </div>

                            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs space-y-1">
                                <p className="font-bold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Offre contractuelle pré-validée :
                                </p>
                                <p className="leading-relaxed">{s.offreProposee}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Évaluation */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Évaluation Fast-Track Stagiaire</h3>
                        <form onSubmit={soumettreEval} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du stagiaire</label>
                                <Input value={formEval.stagiaireNom} onChange={e => setFormEval({...formEval, stagiaireNom: e.target.value})} placeholder="Ex: Moussa Diakité" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">École de provenance</label>
                                    <Input value={formEval.ecoleProvenance} onChange={e => setFormEval({...formEval, ecoleProvenance: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Boutique</label>
                                    <Input value={formEval.siteNom} onChange={e => setFormEval({...formEval, siteNom: e.target.value})} required />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                                <div>
                                    <label className="text-slate-600 block mb-1">Posture client & accueil (/100)</label>
                                    <Input type="number" min="50" max="100" value={formEval.postureClient} onChange={e => setFormEval({...formEval, postureClient: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-slate-600 block mb-1">Rapidité caisse & encaissement (/100)</label>
                                    <Input type="number" min="50" max="100" value={formEval.rapiditeCaisseOm} onChange={e => setFormEval({...formEval, rapiditeCaisseOm: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-slate-600 block mb-1">Esprit d'équipe & discipline (/100)</label>
                                    <Input type="number" min="50" max="100" value={formEval.espritEquipe} onChange={e => setFormEval({...formEval, espritEquipe: e.target.value})} required />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Valider & Générer Offre</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
