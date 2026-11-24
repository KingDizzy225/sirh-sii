import React, { useState, useEffect } from 'react';
import { ShieldCheck, Gift, Users, AlertTriangle, CheckCircle2, PlusCircle, Search, RefreshCw, FileText, Send, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function ComplianceConflitsInterets() {
    const [declarations, setDeclarations] = useState([]);
    const [reglementation, setReglementation] = useState({});
    const [stats, setStats] = useState({});
    const [chargement, setChargement] = useState(true);
    const [modalOuvert, setModalOuvert] = useState(false);
    const [actionEnCours, setActionEnCours] = useState(false);

    const [nouvelleDeclaration, setNouvelleDeclaration] = useState({
        matricule: 'EMP-0245',
        declarantNom: 'Kouassi Yves',
        departement: 'Ventes Réseau B2C & Distribution',
        typeDeclaration: 'CADEAU_FOURNISSEUR',
        natureDeclaration: '',
        tiersConcerne: '',
        valeurEstimeeCfa: 60000
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/compliance-conflits/declarations');
            if (res.data && res.data.success) {
                setDeclarations(res.data.declarations);
                setReglementation(res.data.reglementation);
                setStats(res.data.statistiques);
            }
        } catch (err) {
            console.error('Erreur chargement compliance:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreDeclaration = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/compliance-conflits/declarer', nouvelleDeclaration);
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                setModalOuvert(false);
                setNouvelleDeclaration({
                    matricule: 'EMP-0245',
                    declarantNom: 'Kouassi Yves',
                    departement: 'Ventes Réseau B2C & Distribution',
                    typeDeclaration: 'CADEAU_FOURNISSEUR',
                    natureDeclaration: '',
                    tiersConcerne: '',
                    valeurEstimeeCfa: 60000
                });
                charger();
            }
        } catch (err) {
            alert('Erreur enregistrement de la déclaration');
        }
    };

    const arbitrerConflit = async (declarationId, decision) => {
        setActionEnCours(true);
        try {
            const res = await api.post('/api/compliance-conflits/arbitrer', {
                declarationId,
                statutCompliance: decision,
                mesuresPrevention: decision === 'AUTORISE_AVEC_MESURES' ? 'Déport formel de tout arbitrage commercial.' : 'Autorisé sans restriction.'
            });
            if (res.data && res.data.success) {
                charger();
            }
        } catch (err) {
            alert('Erreur arbitrage compliance');
        } finally {
            setActionEnCours(false);
        }
    };

    const fcfa = (montant) => montant?.toLocaleString('fr-FR') + ' FCFA';

    const getStatutBadge = (statut) => {
        switch (statut) {
            case 'AUTORISE_SANS_RESERVE':
                return <Badge className="bg-emerald-600">Autorisé sans réserve</Badge>;
            case 'AUTORISE_AVEC_MESURES':
                return <Badge className="bg-blue-600">Autorisé avec déport</Badge>;
            case 'EN_ATTENTE_ARBITRAGE':
                return <Badge className="bg-amber-500 animate-pulse">En arbitrage</Badge>;
            case 'REFUSE_INCOMPATIBLE':
                return <Badge className="bg-red-600">Refusé / Incompatible</Badge>;
            default:
                return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Ergonomique */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Déclarations Anti-Corruption, Cadeaux & Conflits d'Intérêts
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Registre de transparence éthique, seuil cadeaux (50 000 FCFA), prévention des liens d'intérêts et arbitrages Compliance
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                    <Button onClick={() => setModalOuvert(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2 shadow-sm">
                        <PlusCircle className="w-4 h-4" />
                        Déclarer un Intérêt / Cadeau
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50/80 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Score Conformité Éthique</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.scoreConformiteEntreprise || '98.2%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50/80 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">En Attente d'Arbitrage</p>
                            <p className="text-2xl font-bold text-amber-700">{stats.enAttenteArbitrage || 1} dossier(s)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50/80 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Autorisations avec Déport</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.autorisesAvecDeport || 1} cas surveillés</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50/80 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Seuil Tolérance Cadeau</p>
                            <p className="text-lg font-bold text-purple-700">50 000 FCFA</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registre des Déclarations */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-700" />
                        Registre des Déclarations & Décisions de Conformité
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Déclarant</th>
                                <th className="px-4 py-3">Type & Nature de la Déclaration</th>
                                <th className="px-4 py-3">Tiers Concerne & Valeur</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Mesures Préventives</th>
                                <th className="px-4 py-3">Décision Compliance</th>
                                <th className="px-4 py-3">Arbitrage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {declarations.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{d.declarantNom}</div>
                                        <span className="text-xs text-slate-500">{d.matricule} • {d.departement}</span>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs">
                                        <Badge variant="outline" className="text-[11px] font-mono mb-1">
                                            {d.typeDeclaration.replace(/_/g, ' ')}
                                        </Badge>
                                        <p className="text-xs text-slate-700">{d.natureDeclaration}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        <span className="font-semibold text-slate-800">{d.tiersConcerne}</span>
                                        {d.valeurEstimeeCfa > 0 && (
                                            <span className="block font-mono text-emerald-700 font-bold">{fcfa(d.valeurEstimeeCfa)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                                        {d.dateDeclaration}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs italic">
                                        {d.mesuresPrevention}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatutBadge(d.statutCompliance)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {d.statutCompliance === 'EN_ATTENTE_ARBITRAGE' ? (
                                            <div className="flex gap-1.5">
                                                <Button 
                                                    size="sm" 
                                                    disabled={actionEnCours}
                                                    onClick={() => arbitrerConflit(d.id, 'AUTORISE_AVEC_MESURES')}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2"
                                                >
                                                    Autoriser Déport
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    disabled={actionEnCours}
                                                    onClick={() => arbitrerConflit(d.id, 'AUTORISE_SANS_RESERVE')}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2"
                                                >
                                                    Valider
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">Arbitré</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal Déclaration */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-700" /> Nouvelle Déclaration Éthique
                            </h3>
                            <button onClick={() => setModalOuvert(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                        </div>
                        <form onSubmit={soumettreDeclaration} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom du Déclarant</label>
                                <Input 
                                    required 
                                    value={nouvelleDeclaration.declarantNom}
                                    onChange={e => setNouvelleDeclaration({...nouvelleDeclaration, declarantNom: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Type de Déclaration</label>
                                <select 
                                    className="w-full border rounded-md p-2 text-sm bg-white"
                                    value={nouvelleDeclaration.typeDeclaration}
                                    onChange={e => setNouvelleDeclaration({...nouvelleDeclaration, typeDeclaration: e.target.value})}
                                >
                                    <option value="CADEAU_FOURNISSEUR">Cadeau ou Invitation Fournisseur (&gt; 50 000 FCFA)</option>
                                    <option value="LIEN_PARENTE_PARTENAIRE">Lien de Parenté avec un Partenaire / Sous-Traitant</option>
                                    <option value="ACTIVITE_EXTERIEURE">Activité Extérieure / Mandat Associatif</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Tiers ou Société Concernée</label>
                                <Input 
                                    required 
                                    placeholder="Ex: Société d'Impression Promo CI" 
                                    value={nouvelleDeclaration.tiersConcerne}
                                    onChange={e => setNouvelleDeclaration({...nouvelleDeclaration, tiersConcerne: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Description Détaillée des Faits</label>
                                <textarea 
                                    rows="3"
                                    required
                                    className="w-full border rounded-md p-2 text-sm"
                                    placeholder="Précisez la nature du lien ou du cadeau reçu..."
                                    value={nouvelleDeclaration.natureDeclaration}
                                    onChange={e => setNouvelleDeclaration({...nouvelleDeclaration, natureDeclaration: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Valeur Estimée (FCFA, si cadeau)</label>
                                <Input 
                                    type="number"
                                    value={nouvelleDeclaration.valeurEstimeeCfa}
                                    onChange={e => setNouvelleDeclaration({...nouvelleDeclaration, valeurEstimeeCfa: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setModalOuvert(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1">
                                    <Send className="w-4 h-4" /> Transmettre à la Conformité
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
