import React, { useState, useEffect } from 'react';
import { 
    Smartphone, QrCode, ShieldCheck, CheckCircle2, 
    ArrowRightLeft, Plus, Clock, Building2, Lock, Tag 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function EquipementsDemo() {
    const [equipements, setEquipements] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formEq, setFormEq] = useState({
        designation: 'Apple iPhone 16 Pro Max (Démo)',
        imei: '358921094412881',
        siteNom: 'Agence Orange Plateau Postel 2001',
        detenuPar: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/equipements-demo/liste');
            if (res.data) setEquipements(res.data.equipements || []);
        } catch (e) {
            console.error('Erreur chargement démos:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const assignerEquipement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/equipements-demo/scanner', { ...formEq, action: 'PRISE_COMPTOIR' });
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur assignation démo:', e);
        }
    };

    const restituerCoffre = async (imei) => {
        try {
            await api.post('/equipements-demo/scanner', { imei, action: 'RESTITUTION_COFFRE' });
            await charger();
        } catch (e) {
            console.error('Erreur restitution coffre:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                            <Tag className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Gardien des Téléphones de Démo & Terminaux TPE</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Traçabilité en 5 secondes par scan QR des modèles d'exposition et TPE de caisse
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold shadow-md">
                        <Plus className="w-4 h-4" /> Assigner un Appareil de Démo
                    </Button>
                </div>
            </div>

            {/* Liste des équipements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {equipements.map((eq) => (
                    <Card key={eq.id} className="border-slate-200 bg-white">
                        <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">{eq.designation}</h3>
                                <p className="text-[11px] font-mono text-slate-500 mt-0.5">{eq.imei}</p>
                            </div>
                            <Badge variant={eq.statut === 'EN_COMPTOIR' ? 'default' : 'secondary'} className="text-[10px]">
                                {eq.statut === 'EN_COMPTOIR' ? '📱 EN COMPTOIR' : '🔒 AU COFFRE'}
                            </Badge>
                        </CardHeader>

                        <CardContent className="p-5 pt-2 space-y-3">
                            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs border border-slate-100">
                                <div className="text-slate-600">
                                    <span className="font-medium">Sous la garde de :</span> <span className="font-bold text-slate-900">{eq.detenuPar}</span>
                                </div>
                                <div className="text-slate-500 text-[11px]">
                                    Agence : {eq.siteNom} • Check : {eq.dateDernierControle}
                                </div>
                            </div>

                            {eq.statut === 'EN_COMPTOIR' ? (
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => restituerCoffre(eq.imei)}
                                    className="w-full text-xs text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                                >
                                    <Lock className="w-3.5 h-3.5 mr-1.5" /> Réintégrer au coffre le soir
                                </Button>
                            ) : (
                                <p className="text-[11px] text-emerald-600 font-semibold text-center">
                                    ✅ Sécurisé dans le coffre d'agence
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Assignation */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Assigner un modèle démo</h3>
                        <form onSubmit={assignerEquipement} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Désignation du terminal</label>
                                <Input value={formEq.designation} onChange={e => setFormEq({...formEq, designation: e.target.value})} required />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Numéro IMEI ou Série</label>
                                <Input value={formEq.imei} onChange={e => setFormEq({...formEq, imei: e.target.value})} required />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du conseiller responsable</label>
                                <Input value={formEq.detenuPar} onChange={e => setFormEq({...formEq, detenuPar: e.target.value})} placeholder="Ex: Jean-Marc Koffi" required />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Valider l'assignation</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
