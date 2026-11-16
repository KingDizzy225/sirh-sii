import React, { useState, useEffect } from 'react';
import { Shirt, Sparkles, Plus, CheckCircle2, ShoppingBag, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function KiosqueUniformes() {
    const [donnees, setDonnees] = useState({ commandes: [], quotaGratuitAnnuel: '', reductionPressingPourcentage: 50 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formUniforme, setFormUniforme] = useState({
        employeNom: '',
        agenceNom: 'Agence Orange Cocody Deux Plateaux',
        article: 'Pack 3 Polos Orange Officiels SII + Gilet Hivernage',
        taille: 'M (Femme)'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/kiosque-uniformes/statuts');
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

    const soumettreCommande = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/kiosque-uniformes/commander', formUniforme);
            setModalOuverte(false);
            setFormUniforme({
                employeNom: '',
                agenceNom: 'Agence Orange Cocody Deux Plateaux',
                article: 'Pack 3 Polos Orange Officiels SII + Gilet Hivernage',
                taille: 'M (Femme)'
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
                        <Shirt className="w-7 h-7 text-orange-600" />
                        Kiosque Uniformes Officiels & Pressing Subventionné
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Renouvellement gratuit des tenues officielles Orange et bons de pressing partenaires à -50%
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Commander Ma Nouvelle Dotation Tenue
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.commandes.map((u) => (
                    <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-orange-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {u.employeNom}
                                    </CardTitle>
                                    <Badge className="bg-orange-100 text-orange-800 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {u.statutCommande}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Agence : <strong>{u.agenceNom}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>👔 <strong>Article :</strong> {u.article}</p>
                                    <p>📏 <strong>Taille :</strong> {u.taille}</p>
                                    <p>🧺 <strong>Pressing agréé :</strong> {u.pressingPartenaire}</p>
                                    <p className="text-orange-700 font-mono font-bold">Code voucher pressing : {u.codePressingMois}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Quota gratuit annuel : {donnees.quotaGratuitAnnuel}</span>
                                    <span>Demande : {u.dateDemande}</span>
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
                            <Shirt className="w-5 h-5 text-orange-600" />
                            Commander une Dotation Tenue
                        </h3>
                        <form onSubmit={soumettreCommande} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input required value={formUniforme.employeNom} onChange={(e) => setFormUniforme({ ...formUniforme, employeNom: e.target.value })} placeholder="Ex: Marina Zadi" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Votre Boutique</label>
                                <Input required value={formUniforme.agenceNom} onChange={(e) => setFormUniforme({ ...formUniforme, agenceNom: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Pack Tenue</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formUniforme.article} onChange={(e) => setFormUniforme({ ...formUniforme, article: e.target.value })}>
                                    <option value="Pack 3 Polos Orange Officiels SII + Gilet Hivernage">Pack 3 Polos Orange Officiels SII + Gilet Hivernage</option>
                                    <option value="Chemise Cérémonie Manches Longues Orange Business">Chemise Cérémonie Manches Longues Orange Business</option>
                                    <option value="Blouson Imperméable Orange Coupe-Vent">Blouson Imperméable Orange Coupe-Vent</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Taille</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formUniforme.taille} onChange={(e) => setFormUniforme({ ...formUniforme, taille: e.target.value })}>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">Confirmer la Dotation</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
