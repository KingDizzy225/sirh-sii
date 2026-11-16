import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Banknote, Plus, CheckCircle2, HeartHandshake, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function UrgenceProvince() {
    const [donnees, setDonnees] = useState({ demandes: [], partenairesCars: [] });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formDepart, setFormDepart] = useState({
        employeNom: '',
        destinationVillage: '',
        compagnieTransport: 'UTB Express Gare Treichville',
        motifUrgence: '',
        avanceFcfa: 50000
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/urgence-province/statuts');
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

    const soumettreDepart = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/urgence-province/demander-depart', formDepart);
            setModalOuverte(false);
            setFormDepart({
                employeNom: '',
                destinationVillage: '',
                compagnieTransport: 'UTB Express Gare Treichville',
                motifUrgence: '',
                avanceFcfa: 50000
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
                        <Bus className="w-7 h-7 text-indigo-600" />
                        Pass Rapatriement Express & Urgence Village (Province)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Billet de car UTB/CTE subventionné et virement d'urgence instantané lors d'un impératif familial ou coutumier au village
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Demander un Pass Urgence Village
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.demandes.map((d) => (
                    <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-indigo-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {d.employeNom} ({d.matricule})
                                    </CardTitle>
                                    <Badge className="bg-emerald-600 text-white">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {d.statutDossier}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> Destination : <strong>{d.destinationVillage}</strong>
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>🚌 <strong>Compagnie de car :</strong> {d.compagnieTransport}</p>
                                    <p>🙏 <strong>Motif :</strong> {d.motifUrgence}</p>
                                    <p>🎫 <strong>Billet pris en charge :</strong> {d.billetCarSubventionneFcfa?.toLocaleString('fr-FR')} FCFA</p>
                                    <p className="text-emerald-700 font-bold">
                                        💵 Avance virée OM : {d.avanceUrgenceFcfa?.toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Congé exceptionnel : <strong>{d.joursAbsenceAutorises} jours ouvrés</strong></span>
                                    <span>{d.dateDemande}</span>
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
                            <Bus className="w-5 h-5 text-indigo-600" />
                            Demande de Pass Urgence Village
                        </h3>
                        <form onSubmit={soumettreDepart} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input required value={formDepart.employeNom} onChange={(e) => setFormDepart({ ...formDepart, employeNom: e.target.value })} placeholder="Ex: Patrice Kouassi" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Village / Ville de destination</label>
                                <Input required value={formDepart.destinationVillage} onChange={(e) => setFormDepart({ ...formDepart, destinationVillage: e.target.value })} placeholder="Ex: Dimbokro, Bouaké, Korhogo..." />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Compagnie de Transport Partenaire</label>
                                <select className="w-full border rounded-lg p-2 text-sm" value={formDepart.compagnieTransport} onChange={(e) => setFormDepart({ ...formDepart, compagnieTransport: e.target.value })}>
                                    <option value="UTB Express Gare Treichville">UTB Express (Union des Transports de Bouaké)</option>
                                    <option value="CTE VIP Adjamé">CTE Transport Adjamé</option>
                                    <option value="STIF VIP">STIF VIP</option>
                                    <option value="AVS Transport">AVS Transport</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Motif de l'urgence</label>
                                <Input required value={formDepart.motifUrgence} onChange={(e) => setFormDepart({ ...formDepart, motifUrgence: e.target.value })} placeholder="Ex: Obsèques d'un parent direct" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Avance souhaitée (FCFA)</label>
                                <Input type="number" step="10000" min="20000" max="100000" required value={formDepart.avanceFcfa} onChange={(e) => setFormDepart({ ...formDepart, avanceFcfa: Number(e.target.value) })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Valider Mon Départ</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
