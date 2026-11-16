import React, { useState, useEffect } from 'react';
import { UserMinus, TrendingDown, AlertTriangle, ShieldAlert, CheckCircle2, UserCheck, Sparkles, Filter, ChevronRight, Activity, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function ChurnPredictor() {
    const [donnees, setDonnees] = useState({ alertes: [], effectifEvalue: 0, tauxRetentionGlobal: '94.2%', economieEstimeeRecrutementFcfa: 0 });
    const [chargement, setChargement] = useState(true);
    const [filtreRisque, setFiltreRisque] = useState('TOUS');

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/churn-predictor/statistiques');
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

    const alertesFiltrees = donnees.alertes.filter(a => {
        if (filtreRisque === 'TOUS') return true;
        return a.niveauRisque === filtreRisque;
    });

    const validerAction = async (alerteId) => {
        try {
            await api.post('/api/churn-predictor/planifier-action', {
                alerteId,
                decision: 'ENTRETIEN_REALISE_ET_VALIDE',
                commentaire: 'Proposition de mobilité et réajustement des primes validés avec succès.'
            });
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
                        <TrendingDown className="w-7 h-7 text-rose-600" />
                        Radar IA de Rétention & Prédiction du Churn Vendeur
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Détection précoce des signaux faibles de démotivation, d'usure terrain ou de départ chez les conseillers commerciaux Orange CI
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-rose-100 text-rose-700 px-3 py-1 font-semibold text-xs border border-rose-300">
                        IA Prédictive Calibrée CI
                    </Badge>
                </div>
            </div>

            {/* Statistiques Métriques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Effectif Sous Surveillance</p>
                            <p className="text-2xl font-bold text-slate-900">{donnees.effectifEvalue} agents</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux de Rétention Annuel</p>
                            <p className="text-2xl font-bold text-emerald-600">{donnees.tauxRetentionGlobal}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Profils à Risque Élevé</p>
                            <p className="text-2xl font-bold text-rose-600">
                                {donnees.alertes.filter(a => a.niveauRisque === 'ELEVE').length} agents
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Économie Recrutement</p>
                            <p className="text-xl font-bold text-amber-700">{(donnees.economieEstimeeRecrutementFcfa || 18500000).toLocaleString('fr-FR')} F</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtres de risque */}
            <div className="flex gap-2 border-b pb-3 border-slate-200">
                {['TOUS', 'ELEVE', 'MODERE', 'FAIBLE'].map((f) => (
                    <Button 
                        key={f}
                        variant={filtreRisque === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFiltreRisque(f)}
                        className={filtreRisque === f ? 'bg-slate-800 text-white' : 'text-slate-600'}
                    >
                        {f === 'TOUS' ? 'Tous les profils' : `Risque ${f.toLowerCase()}`}
                    </Button>
                ))}
            </div>

            {/* Liste des alertes prédictives */}
            <div className="space-y-4">
                {alertesFiltrees.map((alerte) => (
                    <motion.div key={alerte.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className={`border ${alerte.niveauRisque === 'ELEVE' ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'} shadow-sm`}>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3 border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-white ${
                                            alerte.scoreRisque > 70 ? 'bg-rose-600' : alerte.scoreRisque > 40 ? 'bg-amber-500' : 'bg-emerald-600'
                                        }`}>
                                            <span className="text-base leading-none">{alerte.scoreRisque}%</span>
                                            <span className="text-[9px] uppercase tracking-wider mt-0.5">Risque</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 text-base">{alerte.employeNom}</h3>
                                                <Badge variant="outline">{alerte.matricule}</Badge>
                                                <Badge className={
                                                    alerte.niveauRisque === 'ELEVE' ? 'bg-rose-600 text-white' :
                                                    alerte.niveauRisque === 'MODERE' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                                                }>
                                                    {alerte.niveauRisque}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {alerte.agence} • {alerte.poste} (Ancienneté: {alerte.ancienneteMois} mois)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Référent RH attribué :</p>
                                        <p className="text-xs font-semibold text-slate-700">{alerte.responsableRH}</p>
                                    </div>
                                </div>

                                {/* Facteurs détectés et reco IA */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                                        <p className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5 mb-2">
                                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                            Signaux Faibles & Anomalies d'Engagement
                                        </p>
                                        <ul className="text-xs space-y-1.5 text-slate-700">
                                            {alerte.facteursDetectes.map((f, i) => (
                                                <li key={i} className="flex items-start gap-1.5">
                                                    <span className="text-rose-500 font-bold">•</span>
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-blue-50/50 p-3.5 rounded-lg border border-blue-200 flex flex-col justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1.5 mb-2">
                                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                                Plan d'Action Préconisé par l'IA
                                            </p>
                                            <p className="text-xs text-slate-700 leading-relaxed">{alerte.recommandationIA}</p>
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-blue-200/60 flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-500">Statut : <Badge variant="secondary" className="text-[10px]">{alerte.statutSuivi}</Badge></span>
                                            <Button size="sm" onClick={() => validerAction(alerte.id)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7">
                                                Engager l'Action RH
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
export default ChurnPredictor;
