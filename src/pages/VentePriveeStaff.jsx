import React, { useState, useEffect } from 'react';
import { Smartphone, Tag, ShoppingBag, Plus, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function VentePriveeStaff() {
    const [donnees, setDonnees] = useState({ catalogue: [], reservations: [], remisePrivilege: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [articleSelectionne, setArticleSelectionne] = useState(null);
    const [formReservation, setFormReservation] = useState({
        employeNom: '',
        agenceRetrait: 'Agence Orange Plateau Postel 2001'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/vente-privee-staff/catalogue');
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

    const reserverArticle = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/vente-privee-staff/reserver', {
                equipementId: articleSelectionne?.id,
                employeNom: formReservation.employeNom,
                agenceRetrait: formReservation.agenceRetrait
            });
            setModalOuverte(false);
            setFormReservation({ employeNom: '', agenceRetrait: 'Agence Orange Plateau Postel 2001' });
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
                        <Smartphone className="w-7 h-7 text-purple-600" />
                        Bourse Privilège Staff & Smartphones Reconditionnés Orange
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Accès exclusif aux smartphones haut de gamme de démo et box Fibre reconditionnés garantis 1 an à -70% avec prélèvement sur salaire
                    </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs font-semibold flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-purple-600" /> {donnees.remisePrivilege || 'Jusqu\'à -70% sur prix public'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {donnees.catalogue.map((eq) => (
                    <motion.div key={eq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-t-4 border-t-purple-600">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-purple-100 text-purple-800 font-bold">Garantie {eq.garantieMois} Mois</Badge>
                                    <Badge variant="outline" className="text-slate-600">{eq.stockDisponible} en stock</Badge>
                                </div>
                                <CardTitle className="text-base font-bold text-slate-900 mt-2">
                                    {eq.designation}
                                </CardTitle>
                                <p className="text-xs text-slate-500">{eq.etatEsthetique}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs">
                                    <p className="text-slate-400 line-through">Prix marché : {eq.prixPublicMarcheFcfa?.toLocaleString('fr-FR')} FCFA</p>
                                    <p className="text-xl font-black text-purple-700">
                                        {eq.prixStaffSiiFcfa?.toLocaleString('fr-FR')} FCFA
                                    </p>
                                    <p className="text-slate-600">💳 Facilité : {eq.prelevementSalairePossible}</p>
                                </div>
                                <Button onClick={() => { setArticleSelectionne(eq); setModalOuverte(true); }} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs h-9">
                                    Réserver cet Appareil
                                </Button>
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
                            <ShoppingBag className="w-5 h-5 text-purple-600" />
                            Réserver au Tarif Privilège Staff
                        </h3>
                        <p className="text-xs text-slate-600">
                            Article : <strong>{articleSelectionne?.designation}</strong> ({articleSelectionne?.prixStaffSiiFcfa?.toLocaleString('fr-FR')} FCFA)
                        </p>
                        <form onSubmit={reserverArticle} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input required value={formReservation.employeNom} onChange={(e) => setFormReservation({ ...formReservation, employeNom: e.target.value })} placeholder="Ex: Marc Gouaméné" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Agence de Livraison / Retrait</label>
                                <Input required value={formReservation.agenceRetrait} onChange={(e) => setFormReservation({ ...formReservation, agenceRetrait: e.target.value })} />
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-900 rounded-lg text-xs">
                                🎁 Le prélèvement sera automatiquement étalé sur vos 3 prochaines fiches de paie sans aucun intérêt.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Confirmer ma Réservation</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
