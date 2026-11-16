import React, { useState, useEffect } from 'react';
import { Bike, Award, ShieldAlert, CheckCircle2, TrendingUp, AlertCircle, Fuel, Gauge, RefreshCw, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';

export function EcoScoreMoto() {
    const [motards, setMotards] = useState([]);
    const [statsGlobales, setStatsGlobales] = useState({});
    const [chargement, setChargement] = useState(true);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/eco-score-moto/classement');
            if (res.data && res.data.success) {
                setMotards(res.data.motards);
                setStatsGlobales(res.data.statsGlobales);
            }
        } catch (err) {
            console.error('Erreur eco-score-moto:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const simulerReleve = async (motardId) => {
        try {
            const res = await api.post('/api/eco-score-moto/relever', {
                motardId,
                kmParcourus: 45,
                litresCarburant: 1.1,
                portCasqueEtGilet: true,
                zeroSinistre: true
            });
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                charger();
            }
        } catch (err) {
            alert('Erreur lors de la mise à jour du relevé éco-conduite');
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Bike className="w-7 h-7 text-emerald-600" />
                        Éco-Score Moto & Sécurité Flotte Deux-Roues
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Suivi de la consommation de carburant, zéro accident, port systématique du casque & prime mensuelle éco-sécurité
                    </p>
                </div>
                <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Actualiser Flotte
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Gauge className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Consommation Moyenne</p>
                            <p className="text-2xl font-bold text-emerald-700">{statsGlobales.moyenneConsommationLitres100 || '2.6 L/100km'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Conformité Casque & Gilet</p>
                            <p className="text-2xl font-bold text-blue-700">{statsGlobales.tauxPortEquipementSecurite || '100%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Primes Éco Attribuées</p>
                            <p className="text-2xl font-bold text-amber-700">{statsGlobales.primesAttribueesCfa?.toLocaleString() || '120 000'} FCFA</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Motos en Circulation</p>
                            <p className="text-2xl font-bold text-teal-700">{motards.length} deux-roues</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Classement des Commerciaux Motards */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bike className="w-5 h-5 text-emerald-600" />
                        Tableau d'Honneur des Pilotes Terrain & Commerciaux Nomades
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Motard / Commercial</th>
                                <th className="px-4 py-3">Zone de Tournée</th>
                                <th className="px-4 py-3">Moto / Modèle</th>
                                <th className="px-4 py-3">Score Sécurité</th>
                                <th className="px-4 py-3">Conso (L/100km)</th>
                                <th className="px-4 py-3">Jours Zéro Sinistre</th>
                                <th className="px-4 py-3">Statut Prime</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {motards.map(m => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-900">{m.nom}</td>
                                    <td className="px-4 py-3 text-slate-600">{m.zone}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{m.immatriculationMoto}</td>
                                    <td className="px-4 py-3 font-bold text-emerald-600">{m.scoreEcoSecurite} / 100</td>
                                    <td className="px-4 py-3 text-slate-700 font-medium">{m.consommationMoyenneLitre100Km} L</td>
                                    <td className="px-4 py-3 text-slate-600">{m.joursConsecutifsSansAccident} jours</td>
                                    <td className="px-4 py-3">
                                        <Badge className={m.primeEligible ? 'bg-emerald-600' : 'bg-slate-500'}>
                                            {m.primeEligible ? 'Eligible Prime (+30 000)' : 'En Observation'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button size="sm" variant="outline" onClick={() => simulerReleve(m.id)} className="text-xs">
                                            Relever Éco-Tournée
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
