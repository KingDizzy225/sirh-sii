import React, { useState, useEffect } from 'react';
import { Scale, ShieldAlert, Lock, CheckCircle2, Plus, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function RequisitionsArtci() {
    const [donnees, setDonnees] = useState({ requisitions: [], secretProfessionnel: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formReq, setFormReq] = useState({
        autoriteEmettrice: 'Police Judiciaire - Brigade des Enquêtes Spéciales',
        numeroDossierJudiciaire: '',
        numeroLigneConcernee: '',
        objetDemande: '',
        officierDemandeur: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/requisitions-artci/registre');
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

    const soumettreRequisition = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/requisitions-artci/consigner-requisition', formReq);
            setModalOuverte(false);
            setFormReq({
                autoriteEmettrice: 'Police Judiciaire - Brigade des Enquêtes Spéciales',
                numeroDossierJudiciaire: '',
                numeroLigneConcernee: '',
                objetDemande: '',
                officierDemandeur: ''
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
                        <Scale className="w-7 h-7 text-indigo-700" />
                        Guichet Sécurisé des Réquisitions Judiciaires & ARTCI
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Enregistrement chiffré des demandes des autorités (Police, Gendarmerie) avec protection pénale du personnel d'agence
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Consigner une Réquisition Légale
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.requisitions.map((req) => (
                    <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-indigo-700">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-indigo-700" />
                                        {req.numeroDossierJudiciaire}
                                    </CardTitle>
                                    <Badge className="bg-indigo-100 text-indigo-900 font-bold">
                                        {req.statutConformiteLegale}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Autorité : <strong>{req.autoriteEmettrice}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>📱 <strong>Ligne ciblée :</strong> <span className="font-mono font-bold text-slate-900">{req.numeroLigneConcernee}</span></p>
                                    <p>⚖️ <strong>Objet :</strong> {req.objetDemande}</p>
                                    <p>👮 <strong>Demandeur :</strong> {req.officierDemandeur}</p>
                                    <p>🛡️ <strong>Juriste SII référant :</strong> {req.officierRhTraiteur}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-[11px] text-slate-400 font-mono">
                                    <span>Scellé numérique : {req.chiffrementScelle}</span>
                                    <span>{req.traiteLe}</span>
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
                            <Scale className="w-5 h-5 text-indigo-700" />
                            Consignation d'une Réquisition Judiciaire
                        </h3>
                        <form onSubmit={soumettreRequisition} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Autorité Émettrice</label>
                                <Input required value={formReq.autoriteEmettrice} onChange={(e) => setFormReq({ ...formReq, autoriteEmettrice: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">N° Dossier Judiciaire / Référence PV</label>
                                <Input required value={formReq.numeroDossierJudiciaire} onChange={(e) => setFormReq({ ...formReq, numeroDossierJudiciaire: e.target.value })} placeholder="Ex: PV-N°982/DPCJ/2026" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Numéro de Téléphone / Ligne Visée</label>
                                <Input required value={formReq.numeroLigneConcernee} onChange={(e) => setFormReq({ ...formReq, numeroLigneConcernee: e.target.value })} placeholder="+225 07 XX XX XX XX" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Objet de la Demande</label>
                                <Input required value={formReq.objetDemande} onChange={(e) => setFormReq({ ...formReq, objetDemande: e.target.value })} placeholder="Ex: Identification titulaire de SIM et flux" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Officier Demandeur</label>
                                <Input required value={formReq.officierDemandeur} onChange={(e) => setFormReq({ ...formReq, officierDemandeur: e.target.value })} placeholder="Ex: Capitaine Kouadio" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-700 hover:bg-indigo-800 text-white">Sceller la Réquisition</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
