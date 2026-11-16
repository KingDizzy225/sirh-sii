import React, { useState, useEffect } from 'react';
import { QrCode, UserCheck, Users, Briefcase, PlusCircle, CheckCircle, Clock, MapPin, Search, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function JobDatingQr() {
    const [sessions, setSessions] = useState([]);
    const [candidatures, setCandidatures] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [modalOuvert, setModalOuvert] = useState(false);
    const [nouveauCandidat, setNouveauCandidat] = useState({
        sessionId: 1,
        nomComplet: '',
        telephone: '',
        communeResidence: 'Yopougon',
        experienceCaisse: 'Oui (1 an en boutique)',
        maitriseOrangeMoney: 'Excellente',
        permisMoto: 'Non'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/job-dating-qr/sessions');
            if (res.data && res.data.success) {
                setSessions(res.data.sessions);
                setCandidatures(res.data.candidatures);
            }
        } catch (err) {
            console.error('Erreur job-dating-qr:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreCandidature = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/job-dating-qr/candidater', nouveauCandidat);
            if (res.data && res.data.success) {
                alert(`✅ Candidature enregistrée ! Statut : ${res.data.candidature.statut}`);
                setModalOuvert(false);
                setNouveauCandidat({
                    sessionId: 1,
                    nomComplet: '',
                    telephone: '',
                    communeResidence: 'Yopougon',
                    experienceCaisse: 'Oui (1 an en boutique)',
                    maitriseOrangeMoney: 'Excellente',
                    permisMoto: 'Non'
                });
                charger();
            }
        } catch (err) {
            alert('Erreur enregistrement de la candidature');
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <QrCode className="w-7 h-7 text-indigo-600" />
                        Job Dating Express & Recrutement Flash par QR Code
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Scannez le QR Code en agence ou salon, pré-qualifiez les conseillers clients et hôtesses en 90 secondes
                    </p>
                </div>
                <Button onClick={() => setModalOuvert(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm">
                    <PlusCircle className="w-4 h-4" />
                    Simuler Scan QR Candidat
                </Button>
            </div>

            {/* Sessions de Recrutement Ouvertes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.map(s => (
                    <Card key={s.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg text-slate-900">{s.titre}</CardTitle>
                                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-600" /> {s.lieu} • {s.date}
                                    </span>
                                </div>
                                <Badge className={s.statut === 'ouvert' ? 'bg-emerald-600' : 'bg-slate-500'}>
                                    {s.statut === 'ouvert' ? 'Session Ouverte' : 'Clôturée'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>Postes recherchés : <strong className="text-slate-800">{s.postesRecherches.join(', ')}</strong></span>
                                <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded">
                                    {s.candidatsInscrits} inscrits
                                </span>
                            </div>
                            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between">
                                <div className="text-xs">
                                    <p className="font-semibold text-indigo-900">QR Code Affichage Agence</p>
                                    <p className="text-slate-500 text-[11px] font-mono">{s.qrCodePublic}</p>
                                </div>
                                <div className="p-2 bg-white rounded-md border border-indigo-200">
                                    <QrCode className="w-8 h-8 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Candidatures Reçues */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Candidatures Pré-Filtrées en Direct ({candidatures.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Candidat</th>
                                <th className="px-4 py-3">Téléphone</th>
                                <th className="px-4 py-3">Commune</th>
                                <th className="px-4 py-3">Expérience Caisse</th>
                                <th className="px-4 py-3">Maîtrise OM</th>
                                <th className="px-4 py-3">Statut RH</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {candidatures.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-900">{c.nomComplet}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.telephone}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.communeResidence}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.experienceCaisse}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-indigo-700 bg-indigo-50 border-indigo-200 text-xs">
                                            {c.maitriseOrangeMoney}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={c.statut === 'preselectionne_entretien' ? 'bg-emerald-600' : 'bg-amber-600'}>
                                            {c.statut === 'preselectionne_entretien' ? 'Entretien Fixé' : 'En Analyse'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal de Simulation Candidat */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-indigo-600" /> Formulaire Candidat Flash
                            </h3>
                            <button onClick={() => setModalOuvert(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                        </div>
                        <form onSubmit={soumettreCandidature} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input 
                                    required 
                                    placeholder="Ex: Kouamé Affoué Grâce" 
                                    value={nouveauCandidat.nomComplet}
                                    onChange={e => setNouveauCandidat({...nouveauCandidat, nomComplet: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Téléphone (WhatsApp)</label>
                                <Input 
                                    required 
                                    placeholder="Ex: 07 09 88 77 66" 
                                    value={nouveauCandidat.telephone}
                                    onChange={e => setNouveauCandidat({...nouveauCandidat, telephone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Commune de Résidence</label>
                                <Input 
                                    required 
                                    placeholder="Ex: Koumassi, Yopougon, Abobo" 
                                    value={nouveauCandidat.communeResidence}
                                    onChange={e => setNouveauCandidat({...nouveauCandidat, communeResidence: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Expérience en Caisse / Vente</label>
                                <Input 
                                    required 
                                    value={nouveauCandidat.experienceCaisse}
                                    onChange={e => setNouveauCandidat({...nouveauCandidat, experienceCaisse: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setModalOuvert(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                                    <Send className="w-4 h-4" /> Envoyer
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
