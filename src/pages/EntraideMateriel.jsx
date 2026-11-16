import React, { useState, useEffect } from 'react';
import { Truck, Bike, PackageCheck, AlertTriangle, Clock, MapPin, Plus, PhoneCall, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function EntraideMateriel() {
    const [donnees, setDonnees] = useState({ missions: [], reserveSecours: [], missionsActives: 0, tempsMoyenAcheminementMin: 28 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formSecours, setFormSecours] = useState({
        agenceDemanseuse: 'Agence Orange Treichville Arras',
        agencePreteuse: 'Agence Orange Marcory Zone 4',
        equipementRequis: '1x Lecteur de Carte SIM ARTCI USB',
        motifUrgence: 'Panne subite matériel principal',
        priorite: 'CRITIQUE'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/entraide-materiel/statut');
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
            await api.post('/api/entraide-materiel/demande-secours', formSecours);
            setModalOuverte(false);
            setFormSecours({ agenceDemanseuse: 'Agence Orange Treichville Arras', agencePreteuse: 'Agence Orange Marcory Zone 4', equipementRequis: '', motifUrgence: '', priorite: 'CRITIQUE' });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Bike className="w-7 h-7 text-amber-500" />
                        Bourse d'Entraide Matériel Caisse & TPE (Dépannage Moto Express)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Secours immédiat inter-agences pour lecteurs SIM ARTCI, TPE bancaires et imprimantes thermiques via coursier moto
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Déclencher un SOS Matériel Express
                </Button>
            </div>

            {/* Statistiques KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Missions de Secours en Cours</p>
                            <p className="text-2xl font-bold text-slate-900">{donnees.missionsActives} livraisons</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Délai Moyen d'Arrivée</p>
                            <p className="text-2xl font-bold text-emerald-600">{donnees.tempsMoyenAcheminementMin} min (Abidjan)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <PackageCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Sauvetage Activités</p>
                            <p className="text-2xl font-bold text-blue-700">{donnees.tauxSuccesSauvetageBoutique}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Bike className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Flotte de Coursiers Partenaires</p>
                            <p className="text-sm font-bold text-purple-700">Yango Business & SII Moto</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Réserve Centrale de Secours */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    Stocks Tampons d'Urgence Disponibles par Hub Réseau
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {donnees.reserveSecours.map((r) => (
                        <div key={r.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                            <p className="font-semibold text-slate-800">{r.type}</p>
                            <div className="mt-2 space-y-0.5 text-slate-500">
                                <p>Hub Plateau : <span className="font-bold text-slate-900">{r.dispoPlateau} dispo</span></p>
                                <p>Hub Marcory : <span className="font-bold text-slate-900">{r.dispoMarcory} dispo</span></p>
                                <p>Hub Yopougon : <span className="font-bold text-slate-900">{r.dispoYopougon} dispo</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Missions actives */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Missions d'Acheminement en Temps Réel</h2>

                <div className="grid grid-cols-1 gap-4">
                    {donnees.missions.map((m) => (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="border-slate-200 shadow-sm">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-3 border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                                                <Bike className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 text-sm">{m.equipementRequis}</h3>
                                                    <Badge className={
                                                        m.priorite === 'CRITIQUE' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                                                    }>{m.priorite}</Badge>
                                                    <Badge variant="outline" className="text-xs">{m.statutMission.replace(/_/g, ' ')}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    De : <span className="font-semibold text-slate-700">{m.agencePreteuse}</span> ➔ Vers : <span className="font-semibold text-slate-900">{m.agenceDemanseuse}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400">Heure demande : {m.heureDemande}</p>
                                            {m.delaiEstimeMin > 0 && (
                                                <p className="text-xs font-bold text-amber-600 flex items-center justify-end gap-1 mt-0.5">
                                                    <Clock className="w-3.5 h-3.5" /> Arrivée estimée dans ~{m.delaiEstimeMin} min
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div>
                                            <p className="text-slate-500 font-medium">Motif & Conséquence Boutique :</p>
                                            <p className="text-slate-800 mt-0.5">{m.motifUrgence}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 font-medium">Coursier Dépêché :</p>
                                            <p className="text-slate-900 font-semibold flex items-center gap-2 mt-0.5">
                                                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                                                {m.coursierNom} ({m.coursierTelephone})
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal de déclenchement */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Bike className="w-5 h-5 text-amber-500" />
                                Déclencher un SOS Matériel Caisse
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={soumettreDemande} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Agence Demandeuse (En panne)</label>
                                <Input 
                                    value={formSecours.agenceDemanseuse} 
                                    onChange={(e) => setFormSecours({ ...formSecours, agenceDemanseuse: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Agence / Hub Prêteur</label>
                                <Input 
                                    value={formSecours.agencePreteuse} 
                                    onChange={(e) => setFormSecours({ ...formSecours, agencePreteuse: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Équipement Requis d'Urgence</label>
                                <Input 
                                    value={formSecours.equipementRequis} 
                                    onChange={(e) => setFormSecours({ ...formSecours, equipementRequis: e.target.value })}
                                    placeholder="Ex: 1x Lecteur de Carte SIM ARTCI USB"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Motif & Urgence</label>
                                <textarea 
                                    value={formSecours.motifUrgence} 
                                    onChange={(e) => setFormSecours({ ...formSecours, motifUrgence: e.target.value })}
                                    rows={2}
                                    className="w-full text-sm p-2 border rounded-md"
                                    placeholder="Ex: TPE grillé, file d'attente de 20 clients pour retrait OM."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">Dépêcher un Coursier Moto</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default EntraideMateriel;
