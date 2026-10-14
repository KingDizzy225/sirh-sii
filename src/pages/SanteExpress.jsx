import React, { useState, useEffect } from 'react';
import { 
    HeartPulse, QrCode, ShieldCheck, Plus, CheckCircle2, 
    FileText, Building2, User, Phone, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function SanteExpress() {
    const [bons, setBons] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formBon, setFormBon] = useState({
        employeNom: '',
        matricule: 'EMP-0512',
        beneficiaire: 'Salarié',
        typeSoins: 'Pharmacie / Paludisme & Urgence',
        etablissementPartenaire: 'Pharmacie de garde conventionnée',
        montantEstime: 35000
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/sante-express/bons');
            if (res.data) setBons(res.data.bons || []);
        } catch (e) {
            console.error('Erreur santé express:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const emettreBon = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sante-express/generer', formBon);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur génération bon santé:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
                            <HeartPulse className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Tiers-Payant & Prise en Charge Médicale Express</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Garantie d'entreprise dématérialisée par QR Code pour pharmacie et clinique sans avance de frais
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
                        <Plus className="w-4 h-4" /> Générer un bon de prise en charge
                    </Button>
                </div>
            </div>

            {/* Liste des attestations et bons médicaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bons.map((b) => (
                    <Card key={b.id} className="border-rose-100 bg-linear-to-b from-white to-rose-50/20 shadow-xs">
                        <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">{b.employeNom}</h3>
                                <p className="text-xs text-slate-500">{b.matricule} • {b.beneficiaire}</p>
                            </div>
                            <Badge className="bg-emerald-600 text-white text-xs">ACTIF</Badge>
                        </CardHeader>

                        <CardContent className="p-5 pt-2 space-y-4">
                            <div className="p-3 bg-white rounded-xl border border-rose-100 space-y-1.5 text-xs">
                                <div className="text-slate-600">
                                    <span className="font-medium">Type de soin :</span> {b.typeSoins}
                                </div>
                                <div className="text-slate-600">
                                    <span className="font-medium">Établissement :</span> {b.etablissementPartenaire}
                                </div>
                                <div className="pt-1 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-slate-500">Plafond garanti :</span>
                                    <span className="font-bold text-rose-700 text-sm">{b.plafondAutoriseFcfa.toLocaleString()} FCFA</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
                                <div>
                                    <p className="text-slate-400 text-[10px]">Pass Sécurisé Guichet</p>
                                    <p className="font-mono font-bold tracking-wider">{b.qrCodeJeton}</p>
                                </div>
                                <QrCode className="w-8 h-8 text-rose-400" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Nouveau Bon */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Émission Bon Médical Express</h3>
                        <form onSubmit={emettreBon} className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du salarié</label>
                                <Input value={formBon.employeNom} onChange={e => setFormBon({...formBon, employeNom: e.target.value})} placeholder="Ex: Kouamé N'guessan" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Matricule</label>
                                    <Input value={formBon.matricule} onChange={e => setFormBon({...formBon, matricule: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Bénéficiaire</label>
                                    <Input value={formBon.beneficiaire} onChange={e => setFormBon({...formBon, beneficiaire: e.target.value})} placeholder="Ex: Conjoint(e), Enfant" required />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Type de soins ou pharmacie</label>
                                <Input value={formBon.typeSoins} onChange={e => setFormBon({...formBon, typeSoins: e.target.value})} required />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Plafond garanti (FCFA)</label>
                                <Input type="number" min="5000" step="5000" value={formBon.montantEstime} onChange={e => setFormBon({...formBon, montantEstime: e.target.value})} required />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Émettre le Pass Santé</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
