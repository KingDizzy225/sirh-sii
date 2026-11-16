import React, { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, CheckCircle2, ShieldCheck, Plus, AlertCircle, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function SavCartesSim() {
    const [donnees, setDonnees] = useState({ dossiers: [], tauxEchangeImmediat: '', remboursementOperateur: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formDiagnostic, setFormDiagnostic] = useState({
        numeroIccid: '',
        numeroTelephoneClient: '',
        clientNom: '',
        panneConstatee: 'PUCE_NON_RECONNUE_APRES_CHOC',
        agenceTraitement: 'Agence Orange Riviera Palmeraie',
        conseillerNom: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/sav-cartes-sim/statistiques');
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

    const soumettreDiagnostic = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/sav-cartes-sim/diagnostiquer-echanger', formDiagnostic);
            setModalOuverte(false);
            setFormDiagnostic({
                numeroIccid: '',
                numeroTelephoneClient: '',
                clientNom: '',
                panneConstatee: 'PUCE_NON_RECONNUE_APRES_CHOC',
                agenceTraitement: 'Agence Orange Riviera Palmeraie',
                conseillerNom: ''
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
                        <RefreshCw className="w-7 h-7 text-emerald-600" />
                        Diagnostic SAV & Échange Cartes SIM Défectueuses
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Traçabilité des puces défaillantes, remplacement gratuit pour le client et génération automatique d'avoirs Orange CI
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Diagnostiquer une SIM Défectueuse
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.dossiers.map((d) => (
                    <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-emerald-600" />
                                        {d.numeroTelephoneClient}
                                    </CardTitle>
                                    <Badge className="bg-emerald-100 text-emerald-800 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> Échange Gratuit Validé
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 font-mono">ICCID : {d.numeroIccid}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>👤 <strong>Client :</strong> {d.clientNom}</p>
                                    <p>🔬 <strong>Panne constatée :</strong> {d.panneConstatee}</p>
                                    <p>🏬 <strong>Boutique :</strong> {d.agenceTraitement} (Agent: {d.conseillerNom})</p>
                                    <p className="text-emerald-700 font-bold">
                                        💰 Avoir SII récupéré auprès d'Orange CI : +{d.avoirOrangeObtenuFcfa?.toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Banc de test certifié</span>
                                    <span>{d.dateHeure}</span>
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
                            <RefreshCw className="w-5 h-5 text-emerald-600" />
                            Diagnostic & Échange SIM Défectueuse
                        </h3>
                        <form onSubmit={soumettreDiagnostic} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Numéro ICCID de la Carte Défaillante</label>
                                <Input required value={formDiagnostic.numeroIccid} onChange={(e) => setFormDiagnostic({ ...formDiagnostic, numeroIccid: e.target.value })} placeholder="89225010XXXXXXXX" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Numéro de Téléphone Client</label>
                                <Input required value={formDiagnostic.numeroTelephoneClient} onChange={(e) => setFormDiagnostic({ ...formDiagnostic, numeroTelephoneClient: e.target.value })} placeholder="+225 07 XX XX XX XX" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms du Client</label>
                                <Input required value={formDiagnostic.clientNom} onChange={(e) => setFormDiagnostic({ ...formDiagnostic, clientNom: e.target.value })} placeholder="Ex: Soualiho Bamba" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Panne Constatée</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formDiagnostic.panneConstatee} onChange={(e) => setFormDiagnostic({ ...formDiagnostic, panneConstatee: e.target.value })}>
                                    <option value="PUCE_NON_RECONNUE_APRES_CHOC">Puce non reconnue après choc ou surchauffe</option>
                                    <option value="ECHEC_LECTURE_RESEAU_4G_5G">Échec de connexion aux réseaux 4G/5G</option>
                                    <option value="USURE_NATURELLE_CONNECTEURS_OR">Usure naturelle des connecteurs dorés</option>
                                    <option value="CARTE_SIM_GRILLÉE">Puce grillée (Absence de signal total)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Valider l'Échange</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
