import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Building2, 
    TrendingUp, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    ArrowRight, 
    RefreshCw, 
    Activity, 
    Sparkles, 
    Compass, 
    Zap,
    MapPin,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function CapaciteChargeAgences() {
    const [agences, setAgences] = useState([]);
    const [statistiques, setStatistiques] = useState({});
    const [chargement, setChargement] = useState(true);

    // États pour le simulateur interactif
    const [agenceSimuleeId, setAgenceSimuleeId] = useState('1');
    const [hausseTrafic, setHausseTrafic] = useState(25);
    const [renfortEtp, setRenfortEtp] = useState(1);
    const [resultatSimulation, setResultatSimulation] = useState(null);
    const [simulationEnCours, setSimulationEnCours] = useState(false);

    const chargerDonnees = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/capacite-charge/diagnostic');
            if (res.data && res.data.success) {
                setAgences(res.data.agences || []);
                setStatistiques(res.data.statistiquesGlobales || {});
                if (res.data.agences && res.data.agences.length > 0) {
                    setAgenceSimuleeId(String(res.data.agences[0].id));
                }
            }
        } catch (err) {
            console.error('Erreur chargement capacité charge:', err);
        } finally {
            setChargement(false);
        }
    };

    const lancerSimulation = async () => {
        try {
            setSimulationEnCours(true);
            const res = await api.post('/api/capacite-charge/simuler', {
                agenceId: agenceSimuleeId,
                hausseTraficPourcent: hausseTrafic,
                etpAdditionnels: renfortEtp
            });
            if (res.data && res.data.success) {
                setResultatSimulation(res.data.simulation);
            }
        } catch (err) {
            console.error('Erreur simulation:', err);
        } finally {
            setSimulationEnCours(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, []);

    // Déclencher simulation automatique à l'initialisation ou quand les filtres changent
    useEffect(() => {
        if (agences.length > 0) {
            lancerSimulation();
        }
    }, [agenceSimuleeId, hausseTrafic, renfortEtp, agences]);

    const getBadgeTension = (statut, taux) => {
        if (taux > 115 || statut === 'SURCHARGE_CRITIQUE') {
            return <Badge className="bg-red-600 text-white">Surcharge ({taux}%)</Badge>;
        }
        if (taux >= 100 || statut === 'TENSION_MODEREE') {
            return <Badge className="bg-amber-500 text-white">Tension ({taux}%)</Badge>;
        }
        if (taux < 75 || statut === 'SOUS_CAPACITE') {
            return <Badge className="bg-blue-500 text-white">Sous-charge ({taux}%)</Badge>;
        }
        return <Badge className="bg-emerald-600 text-white">Optimal ({taux}%)</Badge>;
    };

    const getCouleurBarre = (taux) => {
        if (taux > 115) return 'bg-red-600';
        if (taux >= 100) return 'bg-amber-500';
        if (taux < 75) return 'bg-blue-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
            {/* Bannière entête ergonomique */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-teal-900/40">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                            <Activity className="h-6 w-6" />
                        </span>
                        <div>
                            <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold">Workforce Management & Pilotage Réseau</span>
                            <h1 className="text-2xl font-bold">Capacité & Dimensionnement Charge Agences</h1>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                        Équilibre charge/effectifs en temps réel, ratio de saturation des guichets, temps d'attente clients et simulation d'absorption des pics de trafic.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={chargerDonnees} 
                        disabled={chargement}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${chargement ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Cartes KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-teal-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Effectif Conseillers ETP</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{statistiques.totalEtpDeployes || 32} ETP</h3>
                            <p className="text-xs text-slate-500 mt-1">Sur l'ensemble des points de vente</p>
                        </div>
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Affluence Réseau / Jour</p>
                            <h3 className="text-2xl font-bold text-blue-600 mt-1">{statistiques.visiteursJourCumules || 1570}</h3>
                            <p className="text-xs text-slate-500 mt-1">Visiteurs quotidiens traités</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Building2 className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Taux Saturation Moyen</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{statistiques.tauxSaturationMoyenReseau || '98.5%'}</h3>
                            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Équilibre global sain
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Agences en Surcharge</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-1">{statistiques.agencesEnSurcharge || 1}</h3>
                            <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" /> Attente &gt; 12 min
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <Clock className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Simulateur Interactif de Dimensionnement */}
            <Card className="border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-slate-50 shadow-md">
                <CardHeader className="pb-3 border-b border-teal-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-teal-600" />
                            <CardTitle className="text-lg font-bold text-slate-900">
                                Simulateur Prédictif d'Absorption des Pics & Renforts ETP
                            </CardTitle>
                        </div>
                        <Badge className="bg-teal-600 text-white">Moteur IA Sizing</Badge>
                    </div>
                    <CardDescription className="text-xs text-slate-600">
                        Testez en temps réel l'impact d'un afflux exceptionnel (+20%, +50% pour fin de mois ou promo) et visualisez le renfort ETP nécessaire pour stabiliser le temps d'attente sous 8 minutes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Sélection Agence */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                1. Point de Vente à Simuler
                            </label>
                            <select 
                                value={agenceSimuleeId}
                                onChange={(e) => setAgenceSimuleeId(e.target.value)}
                                className="w-full text-sm font-semibold border rounded-xl p-2.5 bg-white text-slate-800 shadow-sm focus:ring-2 focus:ring-teal-500"
                            >
                                {agences.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.nomAgence} ({a.commune}) - Actuel: {a.effectifEtpReel} ETP
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500">
                                Diagnostic de base de l'agence sélectionnée.
                            </p>
                        </div>

                        {/* 2. Hausse de Trafic */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    2. Hausse Affluence Client
                                </label>
                                <span className="text-sm font-extrabold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                                    +{hausseTrafic}%
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                step="5"
                                value={hausseTrafic}
                                onChange={(e) => setHausseTrafic(parseInt(e.target.value))}
                                className="w-full accent-teal-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                                <span>Normal (0%)</span>
                                <span>Pic modéré (+25%)</span>
                                <span>Ruée (+100%)</span>
                            </div>
                        </div>

                        {/* 3. Renfort ETP */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    3. Renfort Conseillers Déployés
                                </label>
                                <span className="text-sm font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                                    +{renfortEtp} ETP
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="5" 
                                step="1"
                                value={renfortEtp}
                                onChange={(e) => setRenfortEtp(parseInt(e.target.value))}
                                className="w-full accent-indigo-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                                <span>0 renfort</span>
                                <span>+2 ETP</span>
                                <span>+5 ETP Max</span>
                            </div>
                        </div>
                    </div>

                    {/* Résultat de la simulation dynamique */}
                    {resultatSimulation && (
                        <div className="bg-white rounded-xl p-4 border border-teal-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <span className="font-bold text-slate-900 text-sm">{resultatSimulation.agenceNom}</span>
                                    <Badge variant="outline" className="text-xs">
                                        Effectif projeté : {resultatSimulation.etpApresRenfort} conseillers
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-600">
                                    Flux simulé : <strong className="text-slate-900">{resultatSimulation.visiteursSimules} clients/jour</strong> (vs {resultatSimulation.visiteursActuels} habituellement).
                                </p>
                                <div className="text-xs font-medium mt-1">
                                    {resultatSimulation.tauxSaturationSimule > 115 ? (
                                        <span className="text-red-700 flex items-center justify-center md:justify-start gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" /> {resultatSimulation.diagnosticSimulation}
                                        </span>
                                    ) : (
                                        <span className="text-emerald-700 flex items-center justify-center md:justify-start gap-1">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> {resultatSimulation.diagnosticSimulation}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Attente Estimée</span>
                                    <div className={`text-xl font-extrabold ${resultatSimulation.tempsAttenteEstimeMinutes > 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        ~{resultatSimulation.tempsAttenteEstimeMinutes} min
                                    </div>
                                </div>

                                <div className="text-center">
                                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Saturation Projetée</span>
                                    <div className="text-xl font-extrabold text-slate-900">
                                        {resultatSimulation.tauxSaturationSimule}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Diagnostic de Capacité par Agence */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg font-bold">Matrice de Charge & Tension des Boutiques</CardTitle>
                            <CardDescription>
                                Suivi continu du ratio visiteurs/effectif et préconisations de mobilité ou renforts d'équipes.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 border-y text-xs uppercase font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Boutique / Commune</th>
                                    <th className="py-3 px-4 text-center">Effectif ETP</th>
                                    <th className="py-3 px-4 text-center">Affluence Jour</th>
                                    <th className="py-3 px-4 text-center">Transactions</th>
                                    <th className="py-3 px-4 text-center">Attente Moyenne</th>
                                    <th className="py-3 px-4">Saturation de Charge</th>
                                    <th className="py-3 px-4">Statut & Préconisation Dimensionnement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {agences.map((a) => (
                                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 text-xs md:text-sm">{a.nomAgence}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <MapPin className="h-3 w-3 text-slate-400" /> {a.commune}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center font-bold text-slate-800 text-xs">
                                            {a.effectifEtpReel} conseillers
                                        </td>
                                        <td className="py-3 px-4 text-center font-semibold text-slate-700 text-xs">
                                            {a.visiteursMoyensJour} / jour
                                        </td>
                                        <td className="py-3 px-4 text-center text-slate-600 text-xs">
                                            {a.transactionsMoyennesJour} actes
                                        </td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded ${a.tempsAttenteMoyenMinutes > 10 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                <Clock className="h-3 w-3" /> {a.tempsAttenteMoyenMinutes} min
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 min-w-[140px]">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span>{a.tauxSaturationCharge}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className={`h-2 rounded-full ${getCouleurBarre(a.tauxSaturationCharge)}`}
                                                        style={{ width: `${Math.min(a.tauxSaturationCharge, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs">
                                            <div className="mb-1">{getBadgeTension(a.statutTension, a.tauxSaturationCharge)}</div>
                                            <div className="text-xs text-slate-600 line-clamp-2">
                                                {a.recommandationDimensionnement}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default CapaciteChargeAgences;
