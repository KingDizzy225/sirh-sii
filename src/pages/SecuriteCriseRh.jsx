import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldAlert, PhoneCall, CheckCircle2, UserX, MapPin, RefreshCw, Radio, Send, LifeBuoy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function SecuriteCriseRh() {
    const [crises, setCrises] = useState([]);
    const [registre, setRegistre] = useState([]);
    const [synthese, setSynthese] = useState({});
    const [chargement, setChargement] = useState(true);
    const [modalOuvert, setModalOuvert] = useState(false);
    const [actionEnCours, setActionEnCours] = useState(false);

    const [nouvelleAlerte, setNouvelleAlerte] = useState({
        zoneConcernee: 'Abidjan Nord (Abobo, Yopougon, Adjamé)',
        typeEvenement: 'METEO_INONDATION',
        messageDiffusion: 'Alerte Crise RH : Pluies diluviennes. Veuillez confirmer immédiatement votre statut de mise en sécurité via le Safety Check.'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/securite-crise-rh/statut-crise');
            if (res.data && res.data.success) {
                setCrises(res.data.crises);
                setRegistre(res.data.registreSalaries);
                setSynthese(res.data.synthese);
            }
        } catch (err) {
            console.error('Erreur chargement sécurité crise:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const declencherSafetyCheck = async (e) => {
        e.preventDefault();
        setActionEnCours(true);
        try {
            const res = await api.post('/api/securite-crise-rh/declencher-safety-check', nouvelleAlerte);
            if (res.data && res.data.success) {
                alert(`🚨 ${res.data.message}`);
                setModalOuvert(false);
                charger();
            }
        } catch (err) {
            alert('Erreur déclenchement Safety Check');
        } finally {
            setActionEnCours(false);
        }
    };

    const marquerEnSecurite = async (matricule) => {
        try {
            const res = await api.post('/api/securite-crise-rh/repondre-statut', {
                matricule,
                statutSecurite: 'EN_SECURITE',
                localisation: 'Position confirmée sécurisée'
            });
            if (res.data && res.data.success) {
                charger();
            }
        } catch (err) {
            alert('Erreur mise à jour statut');
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <AlertOctagon className="w-7 h-7 text-red-600 animate-pulse" />
                        Plan de Continuité d'Urgence & Sécurité des Collaborateurs (Crisis Safety Hub)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Déclenchement instantané de Safety Checks (SMS/WhatsApp), pointage live des effectifs en zone sinistrée et coordination des centres de repli
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                    <Button onClick={() => setModalOuvert(true)} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 shadow-md">
                        <Radio className="w-4 h-4 animate-ping" />
                        Déclencher un Safety Check
                    </Button>
                </div>
            </div>

            {/* Crise Active en Cours */}
            {synthese.criseActive && (
                <div className="p-5 bg-gradient-to-r from-red-600 via-rose-700 to-amber-700 rounded-2xl text-white shadow-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl">
                                <ShieldAlert className="w-7 h-7" />
                            </div>
                            <div>
                                <Badge className="bg-white text-red-700 font-bold mb-1">CRISE RH EN COURS</Badge>
                                <h3 className="text-xl font-bold">{synthese.criseActive.titre}</h3>
                            </div>
                        </div>
                        <Badge className="bg-amber-400 text-slate-950 font-bold px-3 py-1">
                            {synthese.criseActive.severite}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/20 text-xs text-rose-100">
                        <div>
                            <strong>Périmètre :</strong> {synthese.criseActive.zoneConcernee}
                        </div>
                        <div>
                            <strong>Mesures d'Urgence :</strong> {synthese.criseActive.planReaffectation}
                        </div>
                        <div>
                            <strong>Taux de Réponse :</strong> {synthese.tauxReponseSafetyCheck}
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux de Réponse Safety Check</p>
                            <p className="text-2xl font-bold text-emerald-700">{synthese.tauxReponseSafetyCheck || '94.4%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <UserX className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Salariés Sans Réponse</p>
                            <p className="text-2xl font-bold text-rose-700">2 collaborateurs</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <LifeBuoy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Navettes de Secours Prêtes</p>
                            <p className="text-2xl font-bold text-blue-700">{synthese.navettesSecoursPretes || 4} navettes</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Centres de Repli Actifs</p>
                            <p className="text-lg font-bold text-purple-700">2 Centres Sécurisés</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registre des Collaborateurs sous Alerte */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-600" />
                        Pointage en Direct des Effectifs de la Zone sous Alerte
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Salarié</th>
                                <th className="px-4 py-3">Agence d'Affectation</th>
                                <th className="px-4 py-3">Statut de Sécurité</th>
                                <th className="px-4 py-3">Heure & Canal de Réponse</th>
                                <th className="px-4 py-3">Dernière Localisation</th>
                                <th className="px-4 py-3">Action Urgence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {registre.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-900">{r.nom} ({r.matricule})</td>
                                    <td className="px-4 py-3 text-slate-600">{r.agence}</td>
                                    <td className="px-4 py-3">
                                        {r.statutSecurite === 'EN_SECURITE' ? (
                                            <Badge className="bg-emerald-600 text-white flex items-center gap-1 w-fit">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> En Sécurité
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-600 text-white animate-pulse flex items-center gap-1 w-fit">
                                                <AlertOctagon className="w-3.5 h-3.5" /> Sans Réponse
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        <strong>{r.reponseHeure}</strong>
                                        <span className="block text-slate-400">{r.moyenReponse}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-700">{r.localisation}</td>
                                    <td className="px-4 py-3">
                                        {r.statutSecurite === 'SANS_REPONSE' ? (
                                            <Button 
                                                size="sm" 
                                                onClick={() => marquerEnSecurite(r.matricule)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                            >
                                                Confirmer Présence Saine
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Pointage Validé
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal Déclenchement Safety Check */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Radio className="w-5 h-5 text-red-600" /> Diffuser un Safety Check
                            </h3>
                            <button onClick={() => setModalOuvert(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                        </div>
                        <form onSubmit={declencherSafetyCheck} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Périmètre / Zone Concernée</label>
                                <Input 
                                    required 
                                    value={nouvelleAlerte.zoneConcernee}
                                    onChange={e => setNouvelleAlerte({...nouvelleAlerte, zoneConcernee: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Type de Crise</label>
                                <select 
                                    className="w-full border rounded-md p-2 text-sm bg-white"
                                    value={nouvelleAlerte.typeEvenement}
                                    onChange={e => setNouvelleAlerte({...nouvelleAlerte, typeEvenement: e.target.value})}
                                >
                                    <option value="METEO_INONDATION">Météo / Inondation Diluvienne</option>
                                    <option value="INCENDIE_ZONE">Incendie / Alerte Bâtiment</option>
                                    <option value="TENSION_SOCIALE_EMEUTE">Événement Social / Blocage Voirie</option>
                                    <option value="PANNE_DORSALE_FIBRE">Coupure Majeure Télécom & Réseau</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Message Diffusé en Urgence (SMS/WhatsApp)</label>
                                <textarea 
                                    rows="3"
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={nouvelleAlerte.messageDiffusion}
                                    onChange={e => setNouvelleAlerte({...nouvelleAlerte, messageDiffusion: e.target.value})}
                                />
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg text-xs text-red-800">
                                🚨 Tous les salariés de la zone recevront une notification prioritaire les invitant à cliquer pour confirmer leur sécurité.
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setModalOuvert(false)}>Annuler</Button>
                                <Button type="submit" disabled={actionEnCours} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1">
                                    <Send className="w-4 h-4" /> Déclencher l'Alerte Générale
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
