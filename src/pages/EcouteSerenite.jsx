import React, { useState, useEffect } from 'react';
import { HeartHandshake, PhoneCall, ShieldCheck, AlertTriangle, UserX, Clock, CheckCircle2, PlusCircle, Send, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function EcouteSerenite() {
    const [consultations, setConsultations] = useState([]);
    const [indicateurs, setIndicateurs] = useState({});
    const [chargement, setChargement] = useState(true);
    const [modalOuvert, setModalOuvert] = useState(false);
    const [nouveauSignalement, setNouveauSignalement] = useState({
        agenceOuZone: 'Agence Yopougon Siporex',
        motifPrincipal: 'INCIDENT_CLIENT',
        severite: 'elevee',
        description: '',
        demandeAnonyme: true,
        contactRappel: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/ecoute-serenite/consultations');
            if (res.data && res.data.success) {
                setConsultations(res.data.consultations);
                setIndicateurs(res.data.indicateurs);
            }
        } catch (err) {
            console.error('Erreur ecoute-serenite:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreSignalement = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/ecoute-serenite/signaler', nouveauSignalement);
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                setModalOuvert(false);
                setNouveauSignalement({
                    agenceOuZone: 'Agence Yopougon Siporex',
                    motifPrincipal: 'INCIDENT_CLIENT',
                    severite: 'elevee',
                    description: '',
                    demandeAnonyme: true,
                    contactRappel: ''
                });
                charger();
            }
        } catch (err) {
            alert('Erreur enregistrement signalement');
        }
    };

    const getSeveriteBadge = (severite) => {
        switch (severite) {
            case 'critique':
                return <Badge className="bg-red-600 animate-pulse">Critique (Prise en charge &lt; 1h)</Badge>;
            case 'elevee':
                return <Badge className="bg-rose-600">Élevée (Sas Activé)</Badge>;
            case 'moderee':
                return <Badge className="bg-amber-600">Modérée</Badge>;
            default:
                return <Badge className="bg-blue-600">Faible</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <HeartHandshake className="w-7 h-7 text-emerald-600" />
                        Cellule d'Écoute Sérénité & Sas de Décompression RH
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Accompagnement post-agression guichet, prévention du burn-out commercial et entretiens psychologiques confidentiels
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setModalOuvert(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm">
                        <PlusCircle className="w-4 h-4" />
                        Activer un Sas / Écoute
                    </Button>
                </div>
            </div>

            {/* Bannière Ligne d'Urgence */}
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <PhoneCall className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="font-bold text-base">Ligne Verte Écoute & Soutien Psychologique 24/7</h4>
                        <p className="text-xs text-emerald-100">{indicateurs.lignesEcoute247 || 'Numéro Vert : 800 00 225 (Appel 100% Anonyme & Gratuit)'}</p>
                    </div>
                </div>
                <Badge className="bg-white text-emerald-800 font-bold px-3 py-1 text-xs">
                    Temps Moyen Prise en Charge : {indicateurs.tempsMoyenPriseEnChargeHeures || '2.4h'}
                </Badge>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Indice Sérénité Global</p>
                            <p className="text-2xl font-bold text-emerald-700">{indicateurs.indiceSereniteGlobal || '78 / 100'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux de Récupération Post-Choc</p>
                            <p className="text-2xl font-bold text-blue-700">{indicateurs.tauxRecuperationApresIncident || '94%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Sas Actifs ce Mois</p>
                            <p className="text-2xl font-bold text-rose-700">{indicateurs.alertesActives || 2}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Confidentialité</p>
                            <p className="text-2xl font-bold text-purple-700">100% Anonymisé</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Suivi des Dossiers Sérénité Confidentiels */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        Registre Sécurisé des Accompagnements & Décompressions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Identifiant Protégé</th>
                                <th className="px-4 py-3">Agence / Zone</th>
                                <th className="px-4 py-3">Motif Signalement</th>
                                <th className="px-4 py-3">Sévérité</th>
                                <th className="px-4 py-3">Sas Accordé</th>
                                <th className="px-4 py-3">Praticien Assigné</th>
                                <th className="px-4 py-3">Prochaine Étape</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {consultations.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">{c.matriculeAnonyme}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.agenceOuZone}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{c.motifPrincipal}</td>
                                    <td className="px-4 py-3">{getSeveriteBadge(c.severite)}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                                            {c.reposRecuperationAccorde}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{c.praticienAssigne}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{c.prochaineSeance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal Signalement */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <HeartHandshake className="w-5 h-5 text-emerald-600" /> Signalement Bien-être & Écoute
                            </h3>
                            <button onClick={() => setModalOuvert(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                        </div>
                        <form onSubmit={soumettreSignalement} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Agence ou Zone d'affectation</label>
                                <Input 
                                    required 
                                    value={nouveauSignalement.agenceOuZone}
                                    onChange={e => setNouveauSignalement({...nouveauSignalement, agenceOuZone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Motif de la demande</label>
                                <select 
                                    className="w-full border rounded-md p-2 text-sm bg-white"
                                    value={nouveauSignalement.motifPrincipal}
                                    onChange={e => setNouveauSignalement({...nouveauSignalement, motifPrincipal: e.target.value})}
                                >
                                    <option value="INCIDENT_CLIENT">Altercation / Agression client en agence</option>
                                    <option value="BURN_OUT">Épuisement physique & moral (Burn-out)</option>
                                    <option value="STRESS_OBJECTIF">Surcharge & pression commerciale fin de mois</option>
                                    <option value="DEUIL_FAMILIAL">Événement familial douloureux</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Niveau de Sévérité</label>
                                <select 
                                    className="w-full border rounded-md p-2 text-sm bg-white"
                                    value={nouveauSignalement.severite}
                                    onChange={e => setNouveauSignalement({...nouveauSignalement, severite: e.target.value})}
                                >
                                    <option value="critique">Critique (Besoin d'un sas immédiat)</option>
                                    <option value="elevee">Élevée</option>
                                    <option value="moderee">Modérée</option>
                                    <option value="faible">Préventive</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Description des faits (optionnelle & confidentielle)</label>
                                <textarea 
                                    rows="3"
                                    className="w-full border rounded-md p-2 text-sm"
                                    placeholder="Décrivez brièvement la situation..."
                                    value={nouveauSignalement.description}
                                    onChange={e => setNouveauSignalement({...nouveauSignalement, description: e.target.value})}
                                />
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800">
                                🔒 Votre identité est protégée par le secret professionnel et le code déontologique médical.
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setModalOuvert(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                                    <Send className="w-4 h-4" /> Transmettre à la Cellule d'Écoute
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
