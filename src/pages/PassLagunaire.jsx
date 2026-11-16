import React, { useState, useEffect } from 'react';
import { Anchor, Waves, Clock, CheckCircle2, Ticket, PlusCircle, AlertCircle, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function PassLagunaire() {
    const [abonnements, setAbonnements] = useState([]);
    const [lignes, setLignes] = useState([]);
    const [stats, setStats] = useState({});
    const [chargement, setChargement] = useState(true);
    const [modalOuvert, setModalOuvert] = useState(false);
    const [nouvelleDemande, setNouvelleDemande] = useState({
        matricule: 'EMP-0145',
        nom: '',
        gareDepart: 'Gare Abobodoumé (Yopougon)',
        gareArrivee: 'Gare Plateau (Postel 2001)',
        compagnie: 'SOTRA Bateau-Bus'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/pass-lagunaire/abonnements');
            if (res.data && res.data.success) {
                setAbonnements(res.data.abonnements);
                setLignes(res.data.lignesPrisesEnCharge);
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error('Erreur pass-lagunaire:', err);
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
            const res = await api.post('/api/pass-lagunaire/souscrire', nouvelleDemande);
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                setModalOuvert(false);
                setNouvelleDemande({
                    matricule: 'EMP-0145',
                    nom: '',
                    gareDepart: 'Gare Abobodoumé (Yopougon)',
                    gareArrivee: 'Gare Plateau (Postel 2001)',
                    compagnie: 'SOTRA Bateau-Bus'
                });
                charger();
            }
        } catch (err) {
            alert('Erreur soumission pass lagunaire');
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Anchor className="w-7 h-7 text-cyan-600" />
                        Pass Lagunaire RH : Bateaux-Bus SOTRA & STL Abidjan
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Prise en charge entreprise (70%), contournement des embouteillages d'Abidjan et ponctualité garantie aux agences
                    </p>
                </div>
                <Button onClick={() => setModalOuvert(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2 shadow-sm">
                    <PlusCircle className="w-4 h-4" />
                    Nouvelle Prise en Charge Pass
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-cyan-100 text-cyan-700 rounded-xl">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Bénéficiaires Actifs</p>
                            <p className="text-2xl font-bold text-cyan-800">{stats.salariesBeneficiaires || abonnements.length} salariés</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Temps Moyen Économisé</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.heuresEconomiseesMoyenne || '52 min / jour'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Prise en Charge SII</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.tauxPriseEnChargeEntreprise || '70%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Waves className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Budget Subventionné</p>
                            <p className="text-2xl font-bold text-indigo-700">12 600 FCFA / mois</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lignes Ouvertes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lignes.map((l, idx) => (
                    <Card key={idx} className="border-cyan-100 bg-cyan-50/30">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">{l.trajet}</span>
                                <Badge className="bg-cyan-700">{l.dureeEstimee}</Badge>
                            </div>
                            <p className="text-xs text-slate-600">Compagnie : <strong>{l.compagnie}</strong></p>
                            <p className="text-xs text-emerald-700 font-medium">💡 Gain : {l.gainTempsEmbouteillage}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tableau des Abonnements Salariés */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Waves className="w-5 h-5 text-cyan-600" />
                        Abonnements Lagunaires Subventionnés en Cours
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Salarié</th>
                                <th className="px-4 py-3">Poste / Agence</th>
                                <th className="px-4 py-3">Trajet Lagunaire</th>
                                <th className="px-4 py-3">Opérateur</th>
                                <th className="px-4 py-3">Coût Mensuel</th>
                                <th className="px-4 py-3">Statut Pass</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {abonnements.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-900">{a.nom}</td>
                                    <td className="px-4 py-3 text-slate-600">{a.poste}</td>
                                    <td className="px-4 py-3 text-cyan-800 font-medium">{a.trajetQuotidien}</td>
                                    <td className="px-4 py-3 text-slate-600">{a.compagnie}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-emerald-700 font-bold">{a.partEntrepriseCfa?.toLocaleString()} FCFA</span>
                                        <span className="text-xs text-slate-400 block">sur {a.coutAbonnementCfa?.toLocaleString()} FCFA</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className="bg-emerald-600">Actif & Rechargé</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal de Demande */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Anchor className="w-5 h-5 text-cyan-600" /> Demande Pass Bateau-Bus RH
                            </h3>
                            <button onClick={() => setModalOuvert(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                        </div>
                        <form onSubmit={soumettreDemande} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms du salarié</label>
                                <Input 
                                    required 
                                    placeholder="Ex: Bakayoko Souleymane" 
                                    value={nouvelleDemande.nom}
                                    onChange={e => setNouvelleDemande({...nouvelleDemande, nom: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Gare de Départ (Embarcadère)</label>
                                <Input 
                                    required 
                                    value={nouvelleDemande.gareDepart}
                                    onChange={e => setNouvelleDemande({...nouvelleDemande, gareDepart: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Gare d'Arrivée (Agence / Siège)</label>
                                <Input 
                                    required 
                                    value={nouvelleDemande.gareArrivee}
                                    onChange={e => setNouvelleDemande({...nouvelleDemande, gareArrivee: e.target.value})}
                                />
                            </div>
                            <div className="p-3 bg-cyan-50 rounded-lg text-xs text-cyan-800">
                                ℹ️ SII prendra en charge 70% de l'abonnement mensuel directement auprès de la SOTRA / STL.
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setModalOuvert(false)}>Annuler</Button>
                                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1">
                                    <Send className="w-4 h-4" /> Soumettre Prise en Charge
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
