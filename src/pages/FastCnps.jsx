import React, { useState, useEffect } from 'react';
import { FileCheck, Users, Plus, CheckCircle2, ShieldCheck, Clock, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function FastCnps() {
    const [donnees, setDonnees] = useState({ dossiers: [], guichetPartenaire: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formCnps, setFormCnps] = useState({
        employeNom: '',
        typePrestation: 'ALLOCATIONS_FAMILIALES_NOUVEAU_NE',
        nomEnfant: '',
        dateNaissanceEnfant: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/fast-cnps/dossiers');
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

    const soumettreDossier = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/fast-cnps/teletransmettre', formCnps);
            setModalOuverte(false);
            setFormCnps({ employeNom: '', typePrestation: 'ALLOCATIONS_FAMILIALES_NOUVEAU_NE', nomEnfant: '', dateNaissanceEnfant: '' });
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
                        <FileCheck className="w-7 h-7 text-emerald-600" />
                        Fast-Track Télétransmission CNPS & Allocations Familiales
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Numérisation et transmission directe à la CNPS sans file d'attente pour le versement des allocations et indemnités maternité
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Télétransmettre un Dossier Enfant
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.dossiers.map((d) => (
                    <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {d.employeNom} ({d.matricule})
                                    </CardTitle>
                                    <Badge className="bg-emerald-100 text-emerald-800 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {d.statutTeletransmission}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Prestation : <strong>{d.typePrestation}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>👶 <strong>Enfant :</strong> {d.nomEnfant} (Né le {d.dateNaissanceEnfant})</p>
                                    <p className="font-mono text-slate-500">N° dossier CNPS : {d.numeroDossierCnps}</p>
                                    <p className="text-emerald-700 font-bold">
                                        💰 Allocation estimée : {d.montantMensuelEstimeFcfa?.toLocaleString('fr-FR')} FCFA / mois
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Pièces certifiées conformes</span>
                                    <span>Déposé le {d.dateDepotDigital}</span>
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
                            <FileCheck className="w-5 h-5 text-emerald-600" />
                            Télétransmettre à la CNPS
                        </h3>
                        <form onSubmit={soumettreDossier} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms du Salarié</label>
                                <Input required value={formCnps.employeNom} onChange={(e) => setFormCnps({ ...formCnps, employeNom: e.target.value })} placeholder="Ex: David Brou" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Prestation Demandée</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formCnps.typePrestation} onChange={(e) => setFormCnps({ ...formCnps, typePrestation: e.target.value })}>
                                    <option value="ALLOCATIONS_FAMILIALES_NOUVEAU_NE">Allocations Familiales (Nouveau-né)</option>
                                    <option value="CONGE_MATERNITE_INDEMNITES_JOURNALIERES">Indemnités Journalières Maternité</option>
                                    <option value="PRESTATION_FAMILIALE_SCOLARITE">Allocations Rentrée / Scolarité</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom de l'enfant</label>
                                <Input required value={formCnps.nomEnfant} onChange={(e) => setFormCnps({ ...formCnps, nomEnfant: e.target.value })} placeholder="Ex: Marie-Emmanuelle Brou" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Date de naissance</label>
                                <Input type="date" required value={formCnps.dateNaissanceEnfant} onChange={(e) => setFormCnps({ ...formCnps, dateNaissanceEnfant: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Télétransmettre à la CNPS</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
