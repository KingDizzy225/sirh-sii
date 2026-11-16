import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Users, Plus, CheckCircle2, HeartHandshake, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function LeadershipFeminin() {
    const [donnees, setDonnees] = useState({ binomes: [], objectifMixite: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formCandidate, setFormCandidate] = useState({
        nomCollaboratrice: '',
        posteActuel: 'Conseillère Commerciale',
        ambitionPoste: 'Cheffe d\'Agence Boutique'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/leadership-feminin/programme');
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

    const postulerProgramme = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/leadership-feminin/rejoindre-programme', formCandidate);
            setModalOuverte(false);
            setFormCandidate({ nomCollaboratrice: '', posteActuel: 'Conseillère Commerciale', ambitionPoste: 'Cheffe d\'Agence Boutique' });
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
                        <Sparkles className="w-7 h-7 text-pink-600" />
                        Programme "Leadership Féminin & Femmes du Télécom SII"
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Mentorat individuel pour propulser les conseillères et animatrices vers les postes de Cheffe d'Agence et Responsable Régionale
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Postuler au Programme Mentorat
                </Button>
            </div>

            <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl shadow flex items-center justify-between">
                <div>
                    <Badge className="bg-white/20 text-white mb-1">🎯 Objectif Mixité SII</Badge>
                    <h3 className="text-lg font-black">{donnees.objectifMixite || '45% de femmes chefs d\'agence'}</h3>
                </div>
                <div className="text-right text-xs text-pink-100 font-semibold">
                    Mentorat par les Directrices & Managers séniors de SII
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.binomes.map((b) => (
                    <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-pink-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {b.filleuleNom}
                                    </CardTitle>
                                    <Badge className="bg-pink-100 text-pink-800 font-bold">
                                        {b.progressionParcoursPourcent}% Progression
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Actuel : <strong>{b.posteActuel}</strong> ➔ Vise : <strong className="text-pink-700">{b.posteCible}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>👩‍💼 <strong>Mentore assignée :</strong> {b.mentoreNom}</p>
                                    <p>📚 <strong>Modules acquis :</strong> {b.modulesSuivis.join(', ')}</p>
                                    <p className="text-pink-700 font-semibold">📅 Prochaine session coaching : {b.prochaineSession}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Évaluation managériale positive
                                    </span>
                                    <span>{b.statutMentorat}</span>
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
                            <Sparkles className="w-5 h-5 text-pink-600" />
                            Postuler au Mentorat Leadership
                        </h3>
                        <form onSubmit={postulerProgramme} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Votre Nom & Prénoms</label>
                                <Input required value={formCandidate.nomCollaboratrice} onChange={(e) => setFormCandidate({ ...formCandidate, nomCollaboratrice: e.target.value })} placeholder="Ex: Kadiatou Traoré" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Votre Poste Actuel</label>
                                <Input required value={formCandidate.posteActuel} onChange={(e) => setFormCandidate({ ...formCandidate, posteActuel: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Poste ou Ambition Visée</label>
                                <Input required value={formCandidate.ambitionPoste} onChange={(e) => setFormCandidate({ ...formCandidate, ambitionPoste: e.target.value })} placeholder="Ex: Cheffe d'Agence, Superviseure de Zone" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">Rejoindre la Promotion</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
