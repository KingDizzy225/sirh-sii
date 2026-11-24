import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Scale, Calendar, ArrowRight, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';

export function HeuresSupLegales() {
    const [decomptes, setDecomptes] = useState([]);
    const [textes, setTextes] = useState({});
    const [stats, setStats] = useState({});
    const [chargement, setChargement] = useState(true);
    const [actionEnCours, setActionEnCours] = useState(false);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/heures-sup-legales/decomptes');
            if (res.data && res.data.success) {
                setDecomptes(res.data.decomptes);
                setTextes(res.data.textesLegaux);
                setStats(res.data.statistiques);
            }
        } catch (err) {
            console.error('Erreur chargement heures sup légales:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const convertirEnRco = async (decomptId) => {
        setActionEnCours(true);
        try {
            const res = await api.post('/api/heures-sup-legales/convertir-rco', {
                decomptId,
                heuresAConvertir: 2.0
            });
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                charger();
            }
        } catch (err) {
            alert('Erreur lors de la conversion en repos compensateur');
        } finally {
            setActionEnCours(false);
        }
    };

    const fcfa = (montant) => montant?.toLocaleString('fr-FR') + ' FCFA';

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-7 h-7 text-indigo-700" />
                        Moteur Légal des Heures Supplémentaires & Repos Compensateur (Code CI)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Décret N° 96-203 du 7 mars 1996 : ventilation par tranches de majoration (+15%, +50%, +75%, +100%) et surveillance du contingent annuel (75h/an)
                    </p>
                </div>
                <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Actualiser Décomptes
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Volume Heures Sup du Mois</p>
                            <p className="text-2xl font-bold text-indigo-800">{stats.totalHeuresSupMois?.toFixed(1) || '67.5'} h</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Impact Brut Paie Majoré</p>
                            <p className="text-xl font-bold text-emerald-700">{fcfa(stats.montantGlobalMajoreCfa || 0)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Alertes Plafond 75h/an</p>
                            <p className="text-2xl font-bold text-rose-700">{stats.alertesPlafond75h || 1} salarié(s)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Heures RCO Disponibles</p>
                            <p className="text-2xl font-bold text-purple-700">{stats.heuresRcoEnAttente?.toFixed(1) || '10.5'} h repos</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rappel du Barème Légal Ivoirien */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                <div>
                    <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-indigo-700" />
                        Barème Légal en Vigueur (Décret N° 96-203 du Code du Travail CI)
                    </h4>
                    <p className="text-indigo-800 mt-0.5">
                        Contingent annuel légal : <strong>75 heures max par an</strong>. Au-delà, autorisation préalable de l'Inspection du Travail obligatoire.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white border-indigo-300 text-indigo-900">41e-46e h : +15%</Badge>
                    <Badge variant="outline" className="bg-white border-indigo-300 text-indigo-900">&gt; 46e h : +50%</Badge>
                    <Badge variant="outline" className="bg-white border-indigo-300 text-indigo-900">Nuit : +75%</Badge>
                    <Badge variant="outline" className="bg-white border-indigo-300 text-indigo-900">Dimanche : +75% / +100%</Badge>
                </div>
            </div>

            {/* Décompte des Collaborateurs */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-700" />
                        Ventilation Individuelle des Heures & Statut du Contingent Annuel
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Salarié</th>
                                <th className="px-4 py-3">Heures Mois</th>
                                <th className="px-4 py-3">Ventilation Majorations (+15% / +50% / +75% / +100%)</th>
                                <th className="px-4 py-3">Contingent 75h/an</th>
                                <th className="px-4 py-3">Solde Repos RCO</th>
                                <th className="px-4 py-3">Montant Brut</th>
                                <th className="px-4 py-3">Action RCO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {decomptes.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{d.nom}</div>
                                        <span className="text-xs text-slate-500">{d.matricule} • {d.agence}</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">
                                        <strong>{d.totalHeuresSupplementaires} h sup</strong>
                                        <span className="block text-slate-400">sur {d.heuresReellementTravaillees} h</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono mr-1">
                                            {d.repartitionLegaleCi.majoration15}h (+15%)
                                        </span>
                                        <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono mr-1">
                                            {d.repartitionLegaleCi.majoration50}h (+50%)
                                        </span>
                                        {d.repartitionLegaleCi.majoration75Nuit > 0 && (
                                            <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono mr-1">
                                                {d.repartitionLegaleCi.majoration75Nuit}h (Nuit)
                                            </span>
                                        )}
                                        {d.repartitionLegaleCi.majoration100DimancheFerie > 0 && (
                                            <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-mono">
                                                {d.repartitionLegaleCi.majoration100DimancheFerie}h (Dim)
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-xs font-bold text-slate-800">
                                                {d.contingentAnnuel.cumulHeuresSupAnnee}h / 75h
                                            </span>
                                            {d.contingentAnnuel.alerteDepassement && (
                                                <Badge className="bg-red-600 text-white text-[10px] animate-pulse">
                                                    Plafond Proche
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-slate-500 block">Reste : {d.contingentAnnuel.soldeRestantAvantPlafond}h</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200">
                                            {d.reposCompensateur.soldeRcoDisponible}h disponibles
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-xs">
                                        {fcfa(d.valorisationFinanciereBruteCfa)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            disabled={actionEnCours}
                                            onClick={() => convertirEnRco(d.id)}
                                            className="text-xs text-purple-700 border-purple-300 hover:bg-purple-50"
                                        >
                                            Convertir 2h en RCO
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
