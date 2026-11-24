import React, { useState, useEffect } from 'react';
import { 
    PiggyBank, 
    Calculator, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp, 
    Coins, 
    RefreshCw, 
    FileText, 
    Landmark, 
    Users, 
    Scale,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function IndemnitesFinCarriereIdr() {
    const [salaries, setSalaries] = useState([]);
    const [projections, setProjections] = useState([]);
    const [reglementation, setReglementation] = useState(null);
    const [syntheseDaf, setSyntheseDaf] = useState({});
    const [chargement, setChargement] = useState(true);
    const [modalRecalcul, setModalRecalcul] = useState(false);
    const [tauxActualisation, setTauxActualisation] = useState('6.5%');
    const [actionEnCours, setActionEnCours] = useState(false);
    const [messageSucces, setMessageSucces] = useState('');

    const formaterCfa = (montant) => {
        if (!montant && montant !== 0) return '0 FCFA';
        return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
    };

    const chargerDonnees = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/indemnites-idr/engagements');
            if (res.data && res.data.success) {
                setSalaries(res.data.salariesProchesRetraite || []);
                setProjections(res.data.projections || []);
                setReglementation(res.data.reglementation || null);
                setSyntheseDaf(res.data.syntheseDaf || {});
            }
        } catch (err) {
            console.error('Erreur chargement IDR:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, []);

    const executerRecalcul = async () => {
        try {
            setActionEnCours(true);
            const res = await api.post('/api/indemnites-idr/recalculer-provisions', {
                tauxActualisationActuariel: tauxActualisation,
                tauxInflationPrevu: '3.0%'
            });
            if (res.data && res.data.success) {
                setMessageSucces(res.data.message || 'Recalcul actuariel IAS 19 exécuté avec succès.');
                setModalRecalcul(false);
                setTimeout(() => setMessageSucces(''), 4500);
                chargerDonnees();
            }
        } catch (err) {
            alert('Erreur lors du recalcul actuariel');
        } finally {
            setActionEnCours(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
            {/* Bannière entête ergonomique */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-amber-900/40">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                            <PiggyBank className="h-6 w-6" />
                        </span>
                        <div>
                            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">IAS 19 & SYSCOHADA Révisé - Engagements Sociaux</span>
                            <h1 className="text-2xl font-bold">Indemnités Fin de Carrière & Provisions Retraite (IDR)</h1>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                        Calcul actuariel des obligations de départ à la retraite, barème légal CCNI Côte d'Ivoire (30%/35%/40%), dotation comptable au passif et prévision de trésorerie.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setModalRecalcul(true)}
                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center gap-2"
                    >
                        <Calculator className="h-4 w-4" />
                        Recalcul Actuariel IAS 19
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={chargerDonnees} 
                        disabled={chargement}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                        <RefreshCw className={`h-4 w-4 ${chargement ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Notification de succès */}
            {messageSucces && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm font-medium">{messageSucces}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setMessageSucces('')}>Fermer</Button>
                </div>
            )}

            {/* KPI Cards ergonomiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-amber-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Engagement Total IDR</p>
                            <h3 className="text-xl font-bold text-slate-900 mt-1">
                                {formaterCfa(syntheseDaf.totalEngagementActuarielCfa)}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Dette sociale brute actualisée</p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Scale className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Provisions Passif (Cpt 19)</p>
                            <h3 className="text-xl font-bold text-emerald-600 mt-1">
                                {formaterCfa(syntheseDaf.totalProvisionsConstitueesCfa)}
                            </h3>
                            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Couvert à {syntheseDaf.tauxCouvertureGlobal || '87%'}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Landmark className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Dotation Mensuelle DAF</p>
                            <h3 className="text-xl font-bold text-blue-600 mt-1">
                                {formaterCfa(syntheseDaf.dotationMensuelleRecommandeeCfa)}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Lissage annuel de provision</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Coins className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-indigo-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Départs Horizon 3 ans</p>
                            <h3 className="text-xl font-bold text-indigo-600 mt-1">
                                {projections[0]?.deputantsAttendus || 4} collaborateurs
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Besoin: {formaterCfa(projections[0]?.tresorerieNecessaireCfa)}</p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 1 : Registre Individuel des Droits Acquis IDR */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <CardTitle className="text-lg font-bold">Registre des Collaborateurs Proches du Départ (50 ans et +)</CardTitle>
                            <CardDescription>
                                Estimation individuelle des indemnités légales selon l'ancienneté CCNI et l'âge légal de 60 ans.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs bg-slate-50">
                            Âge légal Retraite : 60 ans (CNPS Côte d'Ivoire)
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 border-y text-xs uppercase font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Salarié</th>
                                    <th className="py-3 px-4 text-center">Âge / Ancienneté</th>
                                    <th className="py-3 px-4 text-center">Départ Prévu</th>
                                    <th className="py-3 px-4 text-right">Salaire Moyen Réf.</th>
                                    <th className="py-3 px-4 text-right">Indemnité IDR Due</th>
                                    <th className="py-3 px-4 text-right">Provision Constituée</th>
                                    <th className="py-3 px-4 text-center">Écart & Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {salaries.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 text-xs md:text-sm">{s.nom}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{s.matricule}</div>
                                        </td>
                                        <td className="py-3 px-4 text-center text-xs">
                                            <div className="font-semibold text-slate-800">{s.ageActuel} ans</div>
                                            <div className="text-slate-500">{s.ancienneteAnnees} ans d'ancienneté</div>
                                        </td>
                                        <td className="py-3 px-4 text-center text-xs whitespace-nowrap">
                                            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                {s.anneePrevueDepartRetraite} (dans {s.anneesRestantes} ans)
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-slate-700 text-xs">
                                            {formaterCfa(s.salaireMoyenReferenceCfa)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-900 text-xs">
                                            {formaterCfa(s.engagementTotalIdrCfa)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold text-emerald-700 text-xs">
                                            {formaterCfa(s.provisionConstitueeCfa)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="text-xs font-bold text-slate-700">
                                                -{formaterCfa(s.ecartAProvisionnerCfa)}
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[10px] mt-0.5">
                                                Provisionné à 85%+
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2 : Barème Légal CCNI & Projections Décaissement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Barème CCNI Côte d'Ivoire */}
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Scale className="h-5 w-5 text-amber-600" />
                            <CardTitle className="text-base font-bold text-slate-900">
                                Barème Conventionnel Retraite (CCNI Côte d'Ivoire)
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                            Base de calcul de l'Indemnité Légale de Départ à la Retraite applicable aux salariés du secteur privé.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                <span className="text-slate-600">Tranche 1 à 5 ans d'ancienneté :</span>
                                <span className="font-bold text-slate-900">30% du salaire moyen / an</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                <span className="text-slate-600">Tranche 6 à 10 ans d'ancienneté :</span>
                                <span className="font-bold text-slate-900">35% du salaire moyen / an</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-600">Au-delà de 10 ans d'ancienneté :</span>
                                <span className="font-bold text-slate-900">40% du salaire moyen / an</span>
                            </div>
                        </div>

                        <div className="text-xs text-slate-500 space-y-1">
                            <p>📌 <strong>Salaire moyen de référence :</strong> Moyenne des 12 derniers mois de salaires bruts précédant le départ en retraite.</p>
                            <p>📌 <strong>Traitement fiscal :</strong> Exonération totale d'impôts sur les traitements et salaires (ITS) dans la limite légale.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Projections Pluriannuelles Décaissements Retraite */}
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            <CardTitle className="text-base font-bold text-slate-900">
                                Calendrier Prévisionnel de Trésorerie DAF
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                            Anticipation des sorties de trésorerie sur les horizons 3, 5 et 10 ans.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {projections.map((p, index) => (
                            <div key={index} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{p.horizon}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {p.deputantsAttendus} salariés atteignant l'âge limite légal
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-extrabold text-indigo-700 text-xs sm:text-sm">
                                        {formaterCfa(p.tresorerieNecessaireCfa)}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] text-slate-500 mt-0.5">
                                        Trésorerie à gager
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de recalcul actuariel IAS 19 */}
            {modalRecalcul && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
                        <div className="flex items-center gap-3 text-amber-600">
                            <div className="p-2.5 bg-amber-100 rounded-xl">
                                <Calculator className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Recalcul Actuariel IAS 19</h3>
                                <p className="text-xs text-slate-500">Mise à jour des hypothèses démographiques & financières</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Taux d'actualisation financière (Bons du Trésor UEMOA)</label>
                                <select 
                                    value={tauxActualisation} 
                                    onChange={(e) => setTauxActualisation(e.target.value)}
                                    className="w-full border rounded-lg p-2 font-semibold text-slate-800"
                                >
                                    <option value="6.0%">6.0% (Obligations souveraines État CI)</option>
                                    <option value="6.5%">6.5% (Taux de référence UEMOA retenu)</option>
                                    <option value="7.0%">7.0% (Scénario de hausse de taux)</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Taux d'inflation annuel anticipé</label>
                                <Input value="3.0% (Cible zone BCEAO)" disabled className="text-xs bg-slate-50" />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Table de mortalité de référence</label>
                                <Input value="Table OMS / CIPRES Afrique Subsaharienne" disabled className="text-xs bg-slate-50" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setModalRecalcul(false)}
                                disabled={actionEnCours}
                            >
                                Annuler
                            </Button>
                            <Button 
                                onClick={executerRecalcul}
                                disabled={actionEnCours}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {actionEnCours ? 'Calcul actuariel...' : 'Lancer le Recalcul'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IndemnitesFinCarriereIdr;
