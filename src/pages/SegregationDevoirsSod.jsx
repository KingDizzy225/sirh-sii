import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    AlertTriangle, 
    CheckCircle2, 
    Lock, 
    UserX, 
    RefreshCw, 
    Users, 
    FileSpreadsheet, 
    ShieldAlert, 
    Search, 
    ArrowRightLeft,
    Check,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function SegregationDevoirsSod() {
    const [regles, setRegles] = useState([]);
    const [conflits, setConflits] = useState([]);
    const [campagne, setCampagne] = useState(null);
    const [statistiques, setStatistiques] = useState({});
    const [chargement, setChargement] = useState(true);
    const [recherche, setRecherche] = useState('');
    const [filtreRisque, setFiltreRisque] = useState('TOUS');
    const [modalResolution, setModalResolution] = useState(null);
    const [actionEnCours, setActionEnCours] = useState(false);
    const [messageSucces, setMessageSucces] = useState('');

    const chargerDonnees = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/segregation-sod/matrice');
            if (res.data && res.data.success) {
                setRegles(res.data.regles || []);
                setConflits(res.data.conflitsActifs || []);
                setCampagne(res.data.campagne || null);
                setStatistiques(res.data.statistiques || {});
            }
        } catch (err) {
            console.error('Erreur chargement SoD:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, []);

    const executerResolution = async (conflitId, action) => {
        try {
            setActionEnCours(true);
            const res = await api.post('/api/segregation-sod/recertifier', {
                conflitId,
                actionCorrective: action || 'Habilitation incompatible révoquée manuellement par l\'administrateur SoD.'
            });
            if (res.data && res.data.success) {
                setMessageSucces('L\'habilitation cumulative a été révoquée avec succès. Matrice remise en conformité.');
                setModalResolution(null);
                setTimeout(() => setMessageSucces(''), 4000);
                chargerDonnees();
            }
        } catch (err) {
            alert('Erreur lors de la recertification');
        } finally {
            setActionEnCours(false);
        }
    };

    const reglesFiltrees = regles.filter(r => {
        const matchRisque = filtreRisque === 'TOUS' || r.risqueFraude === filtreRisque;
        const matchTexte = r.titre.toLowerCase().includes(recherche.toLowerCase()) ||
                           r.roleA.toLowerCase().includes(recherche.toLowerCase()) ||
                           r.roleB.toLowerCase().includes(recherche.toLowerCase()) ||
                           r.codeRegle.toLowerCase().includes(recherche.toLowerCase());
        return matchRisque && matchTexte;
    });

    const getBadgeRisque = (risque) => {
        switch (risque) {
            case 'CRITIQUE':
                return <Badge className="bg-red-600 text-white hover:bg-red-700">CRITIQUE</Badge>;
            case 'ELEVE':
                return <Badge className="bg-amber-500 text-white hover:bg-amber-600">ÉLEVÉ</Badge>;
            case 'MOYEN':
                return <Badge className="bg-yellow-500 text-slate-900 hover:bg-yellow-600">MOYEN</Badge>;
            default:
                return <Badge variant="outline">{risque}</Badge>;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
            {/* Entête ergonomique */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/40">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                            <ShieldCheck className="h-6 w-6" />
                        </span>
                        <div>
                            <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">Audit, Risques & Contrôle Interne</span>
                            <h1 className="text-2xl font-bold">Ségrégation des Devoirs & Matrice SoD</h1>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                        Prévention anti-fraude et séparation stricte des fonctions sensibles (Création Salarié vs Virement, Encaissement Guichet vs Annulation OM).
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

            {/* Cartes KPI ergonomiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-indigo-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Score Santé SoD</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{statistiques.scoreSanteSod || '98.5%'}</h3>
                            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" /> 0 anomalie critique
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Conflits d'Habilitation</p>
                            <h3 className="text-2xl font-bold text-amber-600 mt-1">{conflits.filter(c => c.statutAction !== 'RESOLU_DROITS_REVOQUES').length}</h3>
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                                Anomalie détectée en agence
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Règles Sous Contrôle</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{regles.length}</h3>
                            <p className="text-xs text-slate-500 mt-1">Incompatibilités formalisées</p>
                        </div>
                        <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                            <Lock className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Recertification Q4</p>
                            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{campagne?.tauxProgression || '86.6%'}</h3>
                            <p className="text-xs text-slate-500 mt-1">{campagne?.comptesRecertifies}/{campagne?.totalComptesActifs} comptes audités</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 1 : Conflits Actifs & Anomalies à corriger */}
            {conflits.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/30">
                    <CardHeader className="pb-3 border-b border-amber-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                <CardTitle className="text-lg text-amber-950 font-bold">
                                    Conflits d'Intérêts Opérationnels & Droits Incompatibles Détectés
                                </CardTitle>
                            </div>
                            <Badge className="bg-amber-600 text-white">Action Requise</Badge>
                        </div>
                        <CardDescription className="text-amber-800 text-xs">
                            Ces collaborateurs détiennent simultanément deux rôles ou autorisations qui violent la ségrégation des devoirs (fraude potentielle).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {conflits.map((c) => (
                            <div key={c.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 text-base">{c.nom}</span>
                                        <Badge variant="outline" className="text-xs text-slate-600 font-mono">{c.matricule}</Badge>
                                        <Badge variant="outline" className="text-xs text-slate-500">{c.agence}</Badge>
                                        {c.statutAction === 'RESOLU_DROITS_REVOQUES' ? (
                                            <Badge className="bg-emerald-600 text-white flex items-center gap-1">
                                                <Check className="h-3 w-3" /> Résolu
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-600 text-white">A Corriger d'Urgence</Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 mt-1">
                                        <span className="font-semibold text-slate-800">Rôle titulaire :</span> {c.rolePrincipal}
                                        <span className="text-amber-600 font-bold">VS</span>
                                        <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                            {c.roleIncompatibleCumule}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                                        💡 {c.recommandation}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    {c.statutAction !== 'RESOLU_DROITS_REVOQUES' ? (
                                        <Button 
                                            size="sm" 
                                            onClick={() => setModalResolution(c)}
                                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-2"
                                        >
                                            <UserX className="h-4 w-4" />
                                            Révoquer l'Habilitation
                                        </Button>
                                    ) : (
                                        <div className="text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Profil purgé
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Section 2 : Matrice des Règles SoD */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-lg font-bold">Matrice de Ségrégation des Fonctions Sensibles</CardTitle>
                            <CardDescription>
                                Définition formelle des incompatibilités strictes et contrôle automatique des habilitations applicatives.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Rechercher règle ou fonction..." 
                                    value={recherche}
                                    onChange={(e) => setRecherche(e.target.value)}
                                    className="pl-9 text-xs"
                                />
                            </div>
                            <select 
                                value={filtreRisque}
                                onChange={(e) => setFiltreRisque(e.target.value)}
                                className="text-xs border rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium"
                            >
                                <option value="TOUS">Tous les risques</option>
                                <option value="CRITIQUE">Risque Critique</option>
                                <option value="ELEVE">Risque Élevé</option>
                                <option value="MOYEN">Risque Moyen</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 border-y text-xs uppercase font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Code Règle</th>
                                    <th className="py-3 px-4">Intitulé & Description de Risque</th>
                                    <th className="py-3 px-4">Niveau Risque</th>
                                    <th className="py-3 px-4">Fonction A Incompatible avec Fonction B</th>
                                    <th className="py-3 px-4 text-center">Statut Conformité</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reglesFiltrees.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                                            Aucune règle SoD ne correspond aux critères de filtre.
                                        </td>
                                    </tr>
                                ) : (
                                    reglesFiltrees.map((r) => (
                                        <tr key={r.codeRegle} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-xs text-indigo-700 whitespace-nowrap">
                                                {r.codeRegle}
                                            </td>
                                            <td className="py-3 px-4 max-w-md">
                                                <div className="font-semibold text-slate-900 text-xs md:text-sm">{r.titre}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{r.description}</div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {getBadgeRisque(r.risqueFraude)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 text-xs">
                                                    <span className="font-medium bg-slate-100 px-2 py-1 rounded text-slate-800 border">
                                                        {r.roleA}
                                                    </span>
                                                    <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                    <span className="font-medium bg-slate-100 px-2 py-1 rounded text-slate-800 border">
                                                        {r.roleB}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                {r.statutViolation === 'ZERO_CONFLIT' ? (
                                                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300">
                                                        ✓ 0 Conflit
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-300 animate-pulse">
                                                        ⚠️ Alerte Détectée
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Section 3 : Campagne de Recertification Trimestrielle */}
            {campagne && (
                <Card className="border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-white">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-indigo-600" />
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        Campagne de Recertification Périodique ({campagne.periode})
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Revue obligatoire trimestrielle des habilitations des 194 collaborateurs ayant accès aux systèmes sensibles.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-white">Échéance : {campagne.echeance}</Badge>
                                <Badge className="bg-indigo-600 text-white text-xs">{campagne.statut}</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                                <span>Progression globale de la campagne</span>
                                <span className="text-indigo-600">{campagne.tauxProgression} ({campagne.comptesRecertifies} / {campagne.totalComptesActifs} comptes audités)</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                <div 
                                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                                    style={{ width: campagne.tauxProgression }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-slate-500">Superviseurs & Managers engagés :</span>
                                <div className="font-bold text-slate-900 text-sm mt-0.5">{campagne.managersParticipants} managers</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-slate-500">Objectif Clôture :</span>
                                <div className="font-bold text-slate-900 text-sm mt-0.5">15 Décembre 2026</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-slate-500">Périmètre Contrôle :</span>
                                <div className="font-bold text-slate-900 text-sm mt-0.5">ERP Paie, SIM Swap, Orange Money DAF</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal de résolution d'anomalie */}
            {modalResolution && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="p-2.5 bg-red-100 rounded-xl">
                                <UserX className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Révocation Immédiate de Droits Incompatibles</h3>
                                <p className="text-xs text-slate-500">Action corrective de contrôle interne</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-200">
                            <div><strong className="text-slate-700">Collaborateur :</strong> {modalResolution.nom} ({modalResolution.matricule})</div>
                            <div><strong className="text-slate-700">Site :</strong> {modalResolution.agence}</div>
                            <div><strong className="text-slate-700">Règle enfreinte :</strong> {modalResolution.regleViolee}</div>
                            <div className="text-red-700 font-medium">
                                <strong>Droit à désactiver :</strong> {modalResolution.roleIncompatibleCumule}
                            </div>
                        </div>

                        <p className="text-xs text-slate-600">
                            En confirmant cette action, les permissions de superviseur temporaire seront révoquées dans l'annuaire d'accès et le journal d'audit sera mis à jour avec votre signature.
                        </p>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setModalResolution(null)}
                                disabled={actionEnCours}
                            >
                                Annuler
                            </Button>
                            <Button 
                                onClick={() => executerResolution(modalResolution.id, 'Révocation immédiate par administrateur SoD')}
                                disabled={actionEnCours}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {actionEnCours ? 'Révocation en cours...' : 'Confirmer la Révocation'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SegregationDevoirsSod;
