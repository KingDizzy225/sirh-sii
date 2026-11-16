import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Users, Award, CheckCircle2, Flame, ShoppingBag, Radio, Plus, RefreshCw, Calendar, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';

export function CaravaneStreetMarketing() {
    const [caravanes, setCaravanes] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [selectionnee, setSelectionnee] = useState(null);
    const [pointageEnCours, setPointageEnCours] = useState(false);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/caravane-marketing/caravanes');
            if (res.data && res.data.success) {
                setCaravanes(res.data.caravanes);
                if (res.data.caravanes.length > 0) {
                    setSelectionnee(res.data.caravanes[0]);
                }
            }
        } catch (err) {
            console.error('Erreur chargement caravanes:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const enregistrerPointage = async () => {
        if (!selectionnee) return;
        setPointageEnCours(true);
        try {
            const res = await api.post('/api/caravane-marketing/pointage-terrain', {
                caravaneId: selectionnee.id,
                nomPromoteur: 'Kouakou Jean-Philippe',
                zonePointage: selectionnee.lieuPointDeRassemblement,
                cartesSimVendues: 25,
                rechargesVendues: 18
            });
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                charger();
            }
        } catch (err) {
            alert('Erreur lors du pointage terrain');
        } finally {
            setPointageEnCours(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Truck className="w-7 h-7 text-amber-600" />
                        Caravanes Street Marketing & Vente Nomade
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Déploiement des équipes mobiles, sonorisation, kits chasubles Orange, pointage terrain et primes de vente nomade
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                    <Button onClick={enregistrerPointage} disabled={pointageEnCours} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 shadow-sm">
                        <Radio className="w-4 h-4 animate-pulse" />
                        {pointageEnCours ? 'Pointage en cours...' : 'Pointer Ventes Nomades (+25 SIM)'}
                    </Button>
                </div>
            </div>

            {/* Statistiques Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Caravanes en Mission</p>
                            <p className="text-2xl font-bold text-amber-700">{caravanes.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">SIM Vendues en Nomade</p>
                            <p className="text-2xl font-bold text-emerald-700">
                                {caravanes.reduce((acc, c) => acc + (c.ventesSimActuelles || 0), 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Promoteurs & Hôtesses</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {caravanes.reduce((acc, c) => acc + (c.promoteursActifs || 0), 0)} agents
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux d'Atteinte Objectif</p>
                            <p className="text-2xl font-bold text-purple-700">106.8%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des Caravanes Actives */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold text-slate-800 text-lg">Opérations en Direct</h3>
                    {chargement ? (
                        <p className="text-sm text-slate-500">Chargement des données...</p>
                    ) : (
                        caravanes.map(c => (
                            <Card 
                                key={c.id} 
                                onClick={() => setSelectionnee(c)}
                                className={`cursor-pointer transition-all border-2 ${selectionnee?.id === c.id ? 'border-amber-500 bg-amber-50/30 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{c.nomOperation}</h4>
                                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3.5 h-3.5 text-amber-600" /> {c.commune}
                                            </span>
                                        </div>
                                        <Badge className={c.statut === 'active' ? 'bg-emerald-600' : 'bg-slate-500'}>
                                            {c.statut === 'active' ? 'En Direct' : 'Planifiée'}
                                        </Badge>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                                        <span>Leader: <strong>{c.chefDeCaravane}</strong></span>
                                        <span className="text-amber-700 font-semibold">{c.ventesSimActuelles} / {c.objectifSim} SIM</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Détails de la Caravane Sélectionnée */}
                <div className="lg:col-span-2">
                    {selectionnee ? (
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-amber-600" />
                                            {selectionnee.nomOperation}
                                        </CardTitle>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Point de ralliement : {selectionnee.lieuPointDeRassemblement} ({selectionnee.commune})
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 w-fit">
                                        Budget Animation : {selectionnee.budgetAnimationCfa?.toLocaleString()} FCFA
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Bar de progression */}
                                <div>
                                    <div className="flex justify-between text-sm font-semibold mb-1">
                                        <span className="text-slate-700">Progression Ventes SIM 4G/5G</span>
                                        <span className="text-amber-600">
                                            {Math.round((selectionnee.ventesSimActuelles / selectionnee.objectifSim) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="bg-amber-500 h-3 rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min(100, (selectionnee.ventesSimActuelles / selectionnee.objectifSim) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>Réalisé : {selectionnee.ventesSimActuelles} cartes SIM</span>
                                        <span>Objectif : {selectionnee.objectifSim} cartes SIM</span>
                                    </div>
                                </div>

                                {/* Détails Équipements & Logistique */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                        <h5 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                            <ShoppingBag className="w-4 h-4 text-amber-600" />
                                            Kit Logistique & Goodies
                                        </h5>
                                        <p className="text-xs text-slate-600"><strong>Véhicule :</strong> {selectionnee.vehiculeSonorise}</p>
                                        <p className="text-xs text-slate-600"><strong>Dotation :</strong> {selectionnee.dotationGoodies}</p>
                                        <p className="text-xs text-slate-600"><strong>Équipe :</strong> {selectionnee.promoteursActifs} promoteurs & hôtesses</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                        <h5 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                            <Award className="w-4 h-4 text-emerald-600" />
                                            Prime Nomade Terrain
                                        </h5>
                                        <p className="text-xs text-slate-600"><strong>Prime Leader :</strong> 25 000 FCFA / jour</p>
                                        <p className="text-xs text-slate-600"><strong>Indemnité Panier Nomade :</strong> 5 000 FCFA / agent</p>
                                        <p className="text-xs text-slate-600"><strong>Bonus Palier (&gt;100%) :</strong> +150 FCFA / SIM supplémentaire</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-amber-900">Coordination & Sécurité Terrain</p>
                                        <p className="text-xs text-amber-700">Chasubles rétro-réfléchissantes obligatoires. Liaison avec le commissariat de zone effectuée.</p>
                                    </div>
                                    <Button onClick={enregistrerPointage} disabled={pointageEnCours} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                                        Valider Passage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="p-12 text-center text-slate-400 border border-dashed rounded-xl">
                            Sélectionnez une caravane pour consulter sa feuille de route.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
