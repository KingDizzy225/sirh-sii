import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, HeartPulse, Clock, Plus, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function AlloIncivilites() {
    const [donnees, setDonnees] = useState({ incidents: [], permanenceEcoute247: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formIncident, setFormIncident] = useState({
        conseillerNom: '',
        agenceNom: 'Agence Orange Cocody Angré',
        motifClient: '',
        typeAgression: 'VERBALE_INSULTES_MENACES',
        suiviPsy: false
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/allo-incivilites/statistiques');
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

    const soumettreIncident = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/allo-incivilites/declarer', formIncident);
            setModalOuverte(false);
            setFormIncident({
                conseillerNom: '',
                agenceNom: 'Agence Orange Cocody Angré',
                motifClient: '',
                typeAgression: 'VERBALE_INSULTES_MENACES',
                suiviPsy: false
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
                        <PhoneCall className="w-7 h-7 text-red-600" />
                        Cellule Écoute & Décompression "Allo Incivilités Boutique"
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Protection morale, droit de pause immédiate de 15 minutes et soutien psychologique en cas d'agression en agence
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Déclarer une Incivilité & Décompresser
                </Button>
            </div>

            {/* Hotline 24/7 */}
            <div className="p-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <HeartPulse className="w-8 h-8 text-white" />
                    <div>
                        <h3 className="font-bold text-base">Permanence Écoute & Soutien Psychologique SII</h3>
                        <p className="text-xs text-rose-100">Ligne verte confidentielle et gratuite réservée aux équipes de vente et caisse</p>
                    </div>
                </div>
                <span className="font-mono text-xl font-black bg-white/20 px-4 py-2 rounded-lg tracking-wider">
                    {donnees.permanenceEcoute247 || '+225 27 20 00 11 22'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.incidents.map((inc) => (
                    <motion.div key={inc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-red-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {inc.conseillerNom}
                                    </CardTitle>
                                    <Badge className="bg-emerald-100 text-emerald-800">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {inc.statutDossier}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Agence : <strong>{inc.agenceNom}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>⚠️ <strong>Type agression :</strong> {inc.typeAgression}</p>
                                    <p>💬 <strong>Contexte :</strong> {inc.motifClient}</p>
                                    <p className="text-emerald-700 font-semibold">☕ Pause décompression 15 min : Utilisée en salle de repos</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Vigile intervenu : <strong>Oui</strong></span>
                                    <span>{inc.dateHeure}</span>
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
                            <AlertOctagon className="w-5 h-5 text-red-600" />
                            Déclaration d'Incivilité Client
                        </h3>
                        <form onSubmit={soumettreIncident} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Votre Nom & Prénoms</label>
                                <Input required value={formIncident.conseillerNom} onChange={(e) => setFormIncident({ ...formIncident, conseillerNom: e.target.value })} placeholder="Ex: Fatoumata Soro" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Boutique / Agence</label>
                                <Input required value={formIncident.agenceNom} onChange={(e) => setFormIncident({ ...formIncident, agenceNom: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Motif ou motif de contestation du client</label>
                                <Input required value={formIncident.motifClient} onChange={(e) => setFormIncident({ ...formIncident, motifClient: e.target.value })} placeholder="Ex: Compte Orange Money bloqué" />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="psy" checked={formIncident.suiviPsy} onChange={(e) => setFormIncident({ ...formIncident, suiviPsy: e.target.checked })} />
                                <label htmlFor="psy" className="text-xs text-slate-700 font-medium">Je souhaite un entretien d'écoute avec la psychologue du travail</label>
                            </div>
                            <div className="p-3 bg-red-50 text-red-900 rounded-lg text-xs">
                                🧘 Vous avez le droit immédiat de vous retirer 15 minutes en salle de pause sans retenue sur vos objectifs.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Activer ma Décompression</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
