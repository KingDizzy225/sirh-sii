import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Plus, CheckCircle2, ShoppingBag, HeartHandshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function RentreeScolaire() {
    const [donnees, setDonnees] = useState({ commandes: [], partenairesLibrairies: [] });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formKit, setFormKit] = useState({
        employeNom: '',
        niveauScolaire: 'Collège (6ème à 3ème)',
        nombreEnfants: 1,
        agenceRetrait: 'Agence Orange Yopougon Siporex'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/rentree-scolaire/kits');
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
            await api.post('/api/rentree-scolaire/commander', formKit);
            setModalOuverte(false);
            setFormKit({
                employeNom: '',
                niveauScolaire: 'Collège (6ème à 3ème)',
                nombreEnfants: 1,
                agenceRetrait: 'Agence Orange Yopougon Siporex'
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
                        <GraduationCap className="w-7 h-7 text-indigo-600" />
                        Pack Rentrée Scolaire SII (Kits & Subvention)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Fournitures négociées avec les librairies partenaires, subvention employeur et paiement échelonné sur 3 mois sans frais
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Commander un Pack Scolaire
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.commandes.map((k) => (
                    <motion.div key={k.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-indigo-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {k.employeNom}
                                    </CardTitle>
                                    <Badge className="bg-indigo-100 text-indigo-800">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {k.statutLivraison}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Niveau : <strong>{k.niveauScolaire}</strong> ({k.nombreEnfants} enfant{k.nombreEnfants > 1 ? 's' : ''})</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>📦 <strong>Valeur totale kit :</strong> {k.valeurTotaleFcfa?.toLocaleString('fr-FR')} FCFA</p>
                                    <p className="text-emerald-700 font-semibold">🎁 Subvention prise en charge SII : -{k.subventionSiiFcfa?.toLocaleString('fr-FR')} FCFA</p>
                                    <p className="text-indigo-900 font-bold">💳 Reste à charge : {k.resteAChargeSalarieFcfa?.toLocaleString('fr-FR')} FCFA</p>
                                    <p className="text-slate-500 text-[11px]">Échelonnement : {k.formulePrelevement}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Point retrait : <strong>{k.agenceRetrait}</strong></span>
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
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            Réserver un Pack Rentrée Scolaire
                        </h3>
                        <form onSubmit={soumettreCommande} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input required value={formKit.employeNom} onChange={(e) => setFormKit({ ...formKit, employeNom: e.target.value })} placeholder="Ex: David Yao" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Niveau Scolaire</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formKit.niveauScolaire} onChange={(e) => setFormKit({ ...formKit, niveauScolaire: e.target.value })}>
                                    <option value="Maternelle">Maternelle (Petite à Grande section)</option>
                                    <option value="Primaire (CP1 à CM2)">Primaire (CP1 à CM2)</option>
                                    <option value="Collège (6ème à 3ème)">Collège (6ème à 3ème)</option>
                                    <option value="Lycée (Seconde à Terminale)">Lycée (Seconde à Terminale)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nombre d'enfants</label>
                                <Input type="number" min="1" max="6" required value={formKit.nombreEnfants} onChange={(e) => setFormKit({ ...formKit, nombreEnfants: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Agence de livraison souhaitée</label>
                                <Input required value={formKit.agenceRetrait} onChange={(e) => setFormKit({ ...formKit, agenceRetrait: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Confirmer le Pack</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
