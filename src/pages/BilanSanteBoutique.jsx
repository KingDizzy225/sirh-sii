import React, { useState, useEffect } from 'react';
import { Stethoscope, Eye, Glasses, Plus, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function BilanSanteBoutique() {
    const [donnees, setDonnees] = useState({ bilans: [], priseEnChargeForfaitLunettesFcfa: 50000, tauxCouvertureMutuelle: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formBilan, setFormBilan] = useState({
        employeNom: '',
        agenceNom: 'Agence Orange Plateau Postel 2001',
        besoinLunettes: true
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/bilan-sante-boutique/bilans');
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
            await api.post('/api/bilan-sante-boutique/demander-bilan', formBilan);
            setModalOuverte(false);
            setFormBilan({ employeNom: '', agenceNom: 'Agence Orange Plateau Postel 2001', besoinLunettes: true });
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
                        <Stethoscope className="w-7 h-7 text-teal-600" />
                        Bilan Annuel Santé Visuelle, Auditive & Ergonomie Écran
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Protection de la vue des conseillers (fatigue écran caisse) et forfait lunettes anti-lumière bleue subventionné
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Réserver Mon Bilan Ophtalmo / Santé
                </Button>
            </div>

            {/* Avantages Lunettes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                            <Glasses className="w-4 h-4" /> Forfait Lunettes Repos & Écran
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black">{donnees.priseEnChargeForfaitLunettesFcfa?.toLocaleString('fr-FR')} FCFA</p>
                        <p className="text-xs text-teal-100 mt-1">Prise en charge intégrale monture + verres antireflet et anti-lumière bleue</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                            <ShieldCheck className="w-4 h-4" /> Prise en Charge Mutuelle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black">100 % Couvert</p>
                        <p className="text-xs text-blue-100 mt-1">{donnees.tauxCouvertureMutuelle || '80% Mutuelle + 20% Subvention employeur SII'}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.bilans.map((b) => (
                    <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-teal-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {b.employeNom}
                                    </CardTitle>
                                    <Badge className="bg-teal-100 text-teal-800 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> Dossier Médical à Jour
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Agence : <strong>{b.agenceNom}</strong> • Centre : {b.centreMedicalPartenaire}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>👁️ <strong>Examen visuel :</strong> {b.examenVisuel}</p>
                                    <p>👂 <strong>Examen auditif :</strong> {b.examenAuditif}</p>
                                    <p>🩺 <strong>Tension artérielle :</strong> {b.tensionArterielle}</p>
                                    {b.priseEnChargeLunettesFcfa > 0 && (
                                        <p className="text-teal-700 font-bold">
                                            👓 Forfait lunettes accordé : {b.priseEnChargeLunettesFcfa?.toLocaleString('fr-FR')} FCFA
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Date : {b.dateExamen}</span>
                                    <span>Prochain contrôle : {b.prochainControle}</span>
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
                            <Eye className="w-5 h-5 text-teal-600" />
                            Réserver un Bilan Médical & Visuel
                        </h3>
                        <form onSubmit={soumettreDemande} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input required value={formBilan.employeNom} onChange={(e) => setFormBilan({ ...formBilan, employeNom: e.target.value })} placeholder="Ex: Aïcha Bamba" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Votre Agence</label>
                                <Input required value={formBilan.agenceNom} onChange={(e) => setFormBilan({ ...formBilan, agenceNom: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="lunettes" checked={formBilan.besoinLunettes} onChange={(e) => setFormBilan({ ...formBilan, besoinLunettes: e.target.checked })} />
                                <label htmlFor="lunettes" className="text-xs text-slate-700 font-medium">Je ressens une fatigue oculaire (besoin de verres anti-lumière bleue)</label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Confirmer le Rendez-vous</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
