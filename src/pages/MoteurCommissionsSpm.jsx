import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle2, Award, Zap, DollarSign, Layers, ArrowRight, ShieldCheck, RefreshCw, BarChart2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';

export function MoteurCommissionsSpm() {
    const [plans, setPlans] = useState([]);
    const [bordereaux, setBordereaux] = useState([]);
    const [synthese, setSynthese] = useState({});
    const [chargement, setChargement] = useState(true);
    const [actionEnCours, setActionEnCours] = useState(false);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/moteur-commissions-spm/bordereaux');
            if (res.data && res.data.success) {
                setPlans(res.data.plans);
                setBordereaux(res.data.bordereaux);
                setSynthese(res.data.syntheseGlobale);
            }
        } catch (err) {
            console.error('Erreur moteur commissions:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const validerEtapeWorkflow = async (bordereauId, role) => {
        setActionEnCours(true);
        try {
            const res = await api.post('/api/moteur-commissions-spm/valider-etape', {
                bordereauId,
                roleValidateur: role
            });
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                charger();
            }
        } catch (err) {
            alert('Erreur lors de la validation du bordereau');
        } finally {
            setActionEnCours(false);
        }
    };

    const getWorkflowBadge = (statut) => {
        switch (statut) {
            case 'BROUILLON_CHEF_AGENCE':
                return <Badge className="bg-amber-500">1. Saisie Chef Agence</Badge>;
            case 'SOUMIS_CONTROLE_GESTION':
                return <Badge className="bg-blue-600">2. En Audit Contrôle de Gestion</Badge>;
            case 'VALIDE_DRH_PRET_PAIE':
                return <Badge className="bg-purple-600">3. Validé DRH (Prêt pour Paie)</Badge>;
            case 'INJECTE_BULLETIN':
                return <Badge className="bg-emerald-600">4. Injecté sur Bulletins</Badge>;
            default:
                return <Badge variant="outline">{statut}</Badge>;
        }
    };

    const fcfa = (montant) => montant?.toLocaleString('fr-FR') + ' FCFA';

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Target className="w-7 h-7 text-amber-600" />
                        Moteur de Rémunération Variable & Commissions Avancées (SPM)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Calcul automatique des plans de commissionnement, accélérateurs par palier d'atteinte et workflow tripartite de validation
                    </p>
                </div>
                <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Actualiser
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Commissions du Mois</p>
                            <p className="text-xl font-bold text-amber-800">{fcfa(synthese.totalCommissionsACeJourCfa || 0)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux Moyen d'Atteinte</p>
                            <p className="text-2xl font-bold text-emerald-700">{synthese.tauxMoyenAtteinteObjectif || '118.5%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Commerciaux Éligibles</p>
                            <p className="text-2xl font-bold text-blue-700">{synthese.totalVendeursEligibles || 28} conseillers</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">CA Généré par la Force de Vente</p>
                            <p className="text-xl font-bold text-purple-700">{fcfa(synthese.impactDirectChiffreAffairesCfa || 0)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Règles du Plan de Commissionnement Actif */}
            {plans.length > 0 && (
                <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <CardHeader className="pb-3 border-b border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-base text-amber-300 flex items-center gap-2">
                                    <Award className="w-5 h-5" /> {plans[0].nom} ({plans[0].codePlan})
                                </CardTitle>
                                <p className="text-xs text-slate-300 mt-1">Barème officiel de rémunération de la force de vente Orange CI & Partenaires</p>
                            </div>
                            <Badge className="bg-amber-500 text-slate-900 font-bold w-fit">PALIERS & ACCÉLÉRATEURS ACTIFS</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Commissions Unitaires par Produit</h4>
                                <div className="space-y-1.5 text-xs">
                                    {plans[0].reglesProduits.map((r, idx) => (
                                        <div key={idx} className="flex justify-between p-2 bg-white/5 rounded border border-white/10">
                                            <span>{r.produit}</span>
                                            <strong className="text-amber-300 font-mono">+{fcfa(r.commissionUnitaireBase)} / vente</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Accélérateurs de Performance</h4>
                                <div className="space-y-1.5 text-xs">
                                    {plans[0].accelerateurs.map((a, idx) => (
                                        <div key={idx} className="flex justify-between p-2 bg-white/5 rounded border border-white/10">
                                            <span>{a.palier}</span>
                                            <span className="font-semibold text-emerald-400">{a.libelle}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bordereaux Mensuels d'Agences */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="w-5 h-5 text-amber-600" />
                        Bordereaux Mensuels & Circuit d'Approbation Tripartite
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Agence</th>
                                <th className="px-4 py-3">Période</th>
                                <th className="px-4 py-3">Volumes Ventes (SIM / Fibre / OM)</th>
                                <th className="px-4 py-3">Montant Brut Commissions</th>
                                <th className="px-4 py-3">Meilleur Vendeur</th>
                                <th className="px-4 py-3">Statut Workflow</th>
                                <th className="px-4 py-3">Action Workflow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bordereaux.map(b => (
                                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{b.agence}</div>
                                        <span className="text-xs text-slate-500">Resp: {b.responsableAgence} ({b.effectifCommerciaux} vendeurs)</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{b.periode}</td>
                                    <td className="px-4 py-3 text-xs">
                                        <span className="font-semibold text-slate-800">{b.totalVentesSim} SIM</span> •{' '}
                                        <span className="text-indigo-600 font-semibold">{b.totalVentesFibre} Fibres</span> •{' '}
                                        <span className="text-emerald-600 font-semibold">{b.totalOuverturesOM} OM</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold text-amber-700 text-sm">
                                        {fcfa(b.montantBrutCommissionsCfa)}
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        <strong className="text-slate-800">{b.topVendeurMois.nom}</strong>
                                        <span className="text-emerald-700 block font-semibold">{b.topVendeurMois.tauxAtteinte} ({fcfa(b.topVendeurMois.commissionIndividuelleCfa)})</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getWorkflowBadge(b.statutWorkflow)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {b.statutWorkflow === 'BROUILLON_CHEF_AGENCE' && (
                                            <Button 
                                                size="sm" 
                                                disabled={actionEnCours}
                                                onClick={() => validerEtapeWorkflow(b.id, 'Chef d\'Agence')}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                            >
                                                Soumettre au Contrôle
                                            </Button>
                                        )}
                                        {b.statutWorkflow === 'SOUMIS_CONTROLE_GESTION' && (
                                            <Button 
                                                size="sm" 
                                                disabled={actionEnCours}
                                                onClick={() => validerEtapeWorkflow(b.id, 'Contrôleur de Gestion')}
                                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                                            >
                                                Valider Audit Chiffres
                                            </Button>
                                        )}
                                        {b.statutWorkflow === 'VALIDE_DRH_PRET_PAIE' && (
                                            <Button 
                                                size="sm" 
                                                disabled={actionEnCours}
                                                onClick={() => validerEtapeWorkflow(b.id, 'Direction RH')}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                            >
                                                Bon à Payer Paie
                                            </Button>
                                        )}
                                        {b.statutWorkflow === 'INJECTE_BULLETIN' && (
                                            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Clôturé & Payé
                                            </span>
                                        )}
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
