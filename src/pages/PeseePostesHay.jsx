import React, { useState, useEffect } from 'react';
import { Scale, Award, TrendingUp, CheckCircle2, PlusCircle, Search, RefreshCw, BarChart2, Briefcase, DollarSign, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function PeseePostesHay() {
    const [postes, setPostes] = useState([]);
    const [bareme, setBareme] = useState(null);
    const [stats, setStats] = useState({});
    const [chargement, setChargement] = useState(true);
    const [modalOuvert, setModalOuvert] = useState(false);
    const [nouveauPoste, setNouveauPoste] = useState({
        intitule: '',
        departement: 'Réseau Agences Orange CI',
        competencesPoints: 180,
        resolutionProblemesPoints: 50,
        finalitePoints: 65,
        titulairesActifs: 5
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/pesee-hay/postes');
            if (res.data && res.data.success) {
                setPostes(res.data.postes);
                setBareme(res.data.baremeReference);
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error('Erreur chargement pesée Hay:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettrePesee = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/pesee-hay/evaluer', nouveauPoste);
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                setModalOuvert(false);
                setNouveauPoste({
                    intitule: '',
                    departement: 'Réseau Agences Orange CI',
                    competencesPoints: 180,
                    resolutionProblemesPoints: 50,
                    finalitePoints: 65,
                    titulairesActifs: 5
                });
                charger();
            }
        } catch (err) {
            alert('Erreur enregistrement de la pesée Hay');
        }
    };

    const fcfa = (montant) => montant?.toLocaleString('fr-FR') + ' FCFA';

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Scale className="w-7 h-7 text-indigo-700" />
                        Pesée des Postes & Classification Hay / Mercer
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Méthode universelle d'évaluation des fonctions, attribution des Points Hay, classification CCNI et fourchettes de salaires équitables
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                    <Button onClick={() => setModalOuvert(true)} className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-2 shadow-sm">
                        <PlusCircle className="w-4 h-4" />
                        Nouvelle Pesée de Poste
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Fonctions Évaluées Hay</p>
                            <p className="text-2xl font-bold text-indigo-700">{stats.totalPostesEvalues || postes.length} postes</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux d'Équité Salariale</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.tauxConformiteEquite || '96.4%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Salariés Couverts</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.salariesCouverts || 114} collaborateurs</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Prochain Comité Hay</p>
                            <p className="text-lg font-bold text-amber-700">{stats.prochaineRevueComite || '15 Décembre'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tableau des Postes Évalués */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Scale className="w-5 h-5 text-indigo-700" />
                        Matrice de Pesée des Fonctions & Fourchettes Conventionnelles
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Intitulé du Poste</th>
                                <th className="px-4 py-3">Département</th>
                                <th className="px-4 py-3">Points Hay (C + R + F)</th>
                                <th className="px-4 py-3">Classification CCNI</th>
                                <th className="px-4 py-3">Fourchette Salariale (Min - Médian - Max)</th>
                                <th className="px-4 py-3">Effectif</th>
                                <th className="px-4 py-3">Statut Équité</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {postes.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-900">{p.intitule}</td>
                                    <td className="px-4 py-3 text-slate-600">{p.departement}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono font-bold text-indigo-700 text-base">{p.pointsHay.totalPointsHay} pts</span>
                                        <span className="text-[11px] text-slate-400 block font-mono">
                                            ({p.pointsHay.competencesPoints} + {p.pointsHay.resolutionProblemesPoints} + {p.pointsHay.finalitePoints})
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200 border text-xs">
                                            {p.classificationCcni}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">
                                        <span className="text-slate-500">{fcfa(p.fourchetteSalariale.minimum)}</span>
                                        <span className="text-emerald-700 font-bold mx-1.5">➔ {fcfa(p.fourchetteSalariale.pointMedian)}</span>
                                        <span className="text-slate-500">➔ {fcfa(p.fourchetteSalariale.maximum)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 font-medium">{p.titulairesActifs} pers.</td>
                                    <td className="px-4 py-3">
                                        <Badge className="bg-emerald-600 text-white">
                                            {p.statutEquite}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal Pesée Hay */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Scale className="w-5 h-5 text-indigo-700" /> Évaluation selon la Méthode Hay
                            </h3>
                            <button onClick={() => setModalOuvert(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                        </div>
                        <form onSubmit={soumettrePesee} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Intitulé du Poste à évaluer</label>
                                <Input 
                                    required 
                                    placeholder="Ex: Responsable Trésorerie & Encaissements" 
                                    value={nouveauPoste.intitule}
                                    onChange={e => setNouveauPoste({...nouveauPoste, intitule: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Département</label>
                                <Input 
                                    required 
                                    value={nouveauPoste.departement}
                                    onChange={e => setNouveauPoste({...nouveauPoste, departement: e.target.value})}
                                />
                            </div>
                            
                            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-3">
                                <h4 className="text-xs font-bold text-indigo-900 uppercase">Facteurs d'Évaluation Hay</h4>
                                <div>
                                    <label className="text-xs text-slate-600 flex justify-between">
                                        <span>1. Compétences & Savoir-Faire (Know-How)</span>
                                        <strong className="text-indigo-700">{nouveauPoste.competencesPoints} pts</strong>
                                    </label>
                                    <input 
                                        type="range" min="80" max="400" step="10"
                                        className="w-full mt-1"
                                        value={nouveauPoste.competencesPoints}
                                        onChange={e => setNouveauPoste({...nouveauPoste, competencesPoints: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-600 flex justify-between">
                                        <span>2. Résolution de Problèmes (Problem Solving)</span>
                                        <strong className="text-indigo-700">{nouveauPoste.resolutionProblemesPoints} pts</strong>
                                    </label>
                                    <input 
                                        type="range" min="20" max="200" step="5"
                                        className="w-full mt-1"
                                        value={nouveauPoste.resolutionProblemesPoints}
                                        onChange={e => setNouveauPoste({...nouveauPoste, resolutionProblemesPoints: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-600 flex justify-between">
                                        <span>3. Finalité & Responsabilité (Accountability)</span>
                                        <strong className="text-indigo-700">{nouveauPoste.finalitePoints} pts</strong>
                                    </label>
                                    <input 
                                        type="range" min="30" max="250" step="5"
                                        className="w-full mt-1"
                                        value={nouveauPoste.finalitePoints}
                                        onChange={e => setNouveauPoste({...nouveauPoste, finalitePoints: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="pt-2 border-t border-indigo-100 flex justify-between text-xs font-bold text-slate-900">
                                    <span>Score Total Estimé :</span>
                                    <span className="text-indigo-700 text-sm">
                                        {nouveauPoste.competencesPoints + nouveauPoste.resolutionProblemesPoints + nouveauPoste.finalitePoints} Points Hay
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nombre de titulaires actuels</label>
                                <Input 
                                    type="number"
                                    value={nouveauPoste.titulairesActifs}
                                    onChange={e => setNouveauPoste({...nouveauPoste, titulairesActifs: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setModalOuvert(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-1">
                                    Enregistrer la Pesée
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
