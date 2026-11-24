import React, { useState, useEffect } from 'react';
import { Handshake, Calendar, CheckCircle2, Clock, FileText, PlusCircle, RefreshCw, Scale, Award, TrendingUp, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function AccordsEntrepriseNao() {
    const [sessions, setSessions] = useState([]);
    const [engagements, setEngagements] = useState([]);
    const [stats, setStats] = useState({});
    const [chargement, setChargement] = useState(true);
    const [filtreStatut, setFiltreStatut] = useState('TOUS');
    const [recherche, setRecherche] = useState('');
    const [actionEnCours, setActionEnCours] = useState(false);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/accords-nao/accords');
            if (res.data && res.data.success) {
                setSessions(res.data.sessions);
                setEngagements(res.data.engagements);
                setStats(res.data.statistiques);
            }
        } catch (err) {
            console.error('Erreur chargement accords NAO:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const actualiserTaux = async (engagementId, taux) => {
        setActionEnCours(true);
        try {
            const res = await api.post('/api/accords-nao/engagements/statut', {
                engagementId,
                nouveauTaux: taux,
                statut: taux >= 100 ? 'EFFECTUE' : 'EN_COURS'
            });
            if (res.data && res.data.success) {
                charger();
            }
        } catch (err) {
            alert('Erreur mise à jour de l\'engagement');
        } finally {
            setActionEnCours(false);
        }
    };

    const engagementsFiltres = engagements.filter(e => {
        const matchStatut = filtreStatut === 'TOUS' || e.statut === filtreStatut;
        const matchTexte = e.clause.toLowerCase().includes(recherche.toLowerCase()) || 
                           e.accordTitre.toLowerCase().includes(recherche.toLowerCase()) ||
                           e.responsableAction.toLowerCase().includes(recherche.toLowerCase());
        return matchStatut && matchTexte;
    });

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Ergonomique */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                        <Handshake className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Négociations Annuelles Obligatoires (NAO) & Accords d'Entreprise
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Suivi du dialogue social avec SYNAPOSTEL & Délégués, dépôts légaux DGT et traçabilité des engagements pris
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* KPI Cards avec dégradés légers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50/80 to-white border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                            <Scale className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux d'Exécution Global</p>
                            <p className="text-2xl font-bold text-indigo-700">{stats.tauxGlobalExecutionEngagements || '88.5%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50/80 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Accords Clôturés & Déposés</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.totalAccordsSignes || 1} Accord officiel</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50/80 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Engagements en Cours</p>
                            <p className="text-2xl font-bold text-amber-700">{stats.engagementsEnCours || 2} chantiers actifs</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50/80 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Prochaine Session Paritaire</p>
                            <p className="text-sm font-bold text-purple-800">25 Novembre 2026</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sessions de Négociation & Dépôts Légaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map(s => (
                    <Card key={s.id} className="border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className={s.statut === 'CLOTUREE_SIGNEE' ? 'bg-emerald-600' : 'bg-amber-600'}>
                                        {s.statut === 'CLOTUREE_SIGNEE' ? 'Accord Signé & Déposé' : 'En Négociation'}
                                    </Badge>
                                    <CardTitle className="text-base text-slate-900 mt-2">{s.titre}</CardTitle>
                                </div>
                                <span className="text-xs font-mono text-slate-500">{s.annee}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 text-xs text-slate-600">
                            <div>
                                <strong className="text-slate-800">Partenaires Sociaux :</strong> {s.organisationsSyndicales.join(' • ')}
                            </div>
                            <div>
                                <strong className="text-slate-800">Dépôt Légal DGT :</strong>{' '}
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                    {s.referenceDepotGreffe}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                                <span className="font-semibold text-slate-800 block mb-1">Thèmes Majeurs Convenus :</span>
                                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                                    {s.themesNegocies.map((t, idx) => (
                                        <li key={idx}>{t}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tableau Interactif des Engagements de l'Accord */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-700" />
                            Feuille de Route & Suivi d'Exécution des Clauses Négociées
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Input 
                                placeholder="Rechercher une clause..." 
                                className="w-52 h-9 text-xs"
                                value={recherche}
                                onChange={e => setRecherche(e.target.value)}
                            />
                            <select 
                                className="border border-slate-200 rounded-md text-xs px-2 py-1.5 bg-white h-9"
                                value={filtreStatut}
                                onChange={e => setFiltreStatut(e.target.value)}
                            >
                                <option value="TOUS">Tous les statuts</option>
                                <option value="EFFECTUE">Effectué (100%)</option>
                                <option value="EN_COURS">En cours</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Accord & Clause</th>
                                <th className="px-4 py-3">Responsable</th>
                                <th className="px-4 py-3">Échéance</th>
                                <th className="px-4 py-3">Avancement</th>
                                <th className="px-4 py-3">Preuve de Conformité</th>
                                <th className="px-4 py-3">Action Rapide</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {engagementsFiltres.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 max-w-sm">
                                        <div className="font-semibold text-slate-900">{e.accordTitre}</div>
                                        <p className="text-xs text-slate-600 mt-0.5">{e.clause}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                                        {e.responsableAction}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                                        {e.echeance}
                                    </td>
                                    <td className="px-4 py-3 min-w-[140px]">
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span>{e.tauxRealisation}%</span>
                                            <Badge variant="outline" className={e.statut === 'EFFECTUE' ? 'text-emerald-700 border-emerald-300' : 'text-amber-700 border-amber-300'}>
                                                {e.statut}
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-500 ${e.statut === 'EFFECTUE' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                                style={{ width: `${e.tauxRealisation}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 italic max-w-xs">
                                        {e.preuvVerification}
                                    </td>
                                    <td className="px-4 py-3">
                                        {e.statut !== 'EFFECTUE' ? (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                disabled={actionEnCours}
                                                onClick={() => actualiserTaux(e.id, 100)}
                                                className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Marquer Réalisé (100%)
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
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
