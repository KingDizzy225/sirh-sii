import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, ShieldCheck, UserCheck, PlusCircle, Building2, Send, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function ConciergeriePapiers() {
    const [demandes, setDemandes] = useState([]);
    const [catalogue, setCatalogue] = useState([]);
    const [stats, setStats] = useState({});
    const [chargement, setChargement] = useState(true);
    const [modalOuvert, setModalOuvert] = useState(false);
    const [nouvelleDemande, setNouvelleDemande] = useState({
        matricule: 'EMP-0245',
        nom: '',
        departement: 'Ventes Réseau B2C',
        typeDemarche: 'CNI_ONECI',
        libelle: 'Renouvellement CNI biométrique ONECI',
        dateRdvPrevue: '',
        commentaires: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/conciergerie-papiers/demandes');
            if (res.data && res.data.success) {
                setDemandes(res.data.demandes);
                setCatalogue(res.data.catalogueServices);
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error('Erreur conciergerie-papiers:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreDemande = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/conciergerie-papiers/demandes', nouvelleDemande);
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                setModalOuvert(false);
                setNouvelleDemande({
                    matricule: 'EMP-0245',
                    nom: '',
                    departement: 'Ventes Réseau B2C',
                    typeDemarche: 'CNI_ONECI',
                    libelle: 'Renouvellement CNI biométrique ONECI',
                    dateRdvPrevue: '',
                    commentaires: ''
                });
                charger();
            }
        } catch (err) {
            alert('Erreur soumission démarche');
        }
    };

    const getStatutBadge = (statut) => {
        switch (statut) {
            case 'depot_dossier':
                return <Badge className="bg-amber-500">Dossier Déposé</Badge>;
            case 'en_cours_traitement':
                return <Badge className="bg-blue-600">Traitement ONECI/SNEDAI</Badge>;
            case 'rdv_enrolement_fixe':
                return <Badge className="bg-purple-600">RDV Coupe-File Fixé</Badge>;
            case 'document_recupere':
                return <Badge className="bg-emerald-600">Prêt à l'Accueil RH</Badge>;
            case 'remis_agent':
                return <Badge className="bg-slate-600">Remis au Salarié</Badge>;
            default:
                return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-7 h-7 text-indigo-600" />
                        Conciergerie Administrative RH : CNI, Passeport & Permis Express
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Prise en charge des démarches ONECI, SNEDAI & Quipux par la navette RH : zéro heure perdue dans les files d'attente
                    </p>
                </div>
                <Button onClick={() => setModalOuvert(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm">
                    <PlusCircle className="w-4 h-4" />
                    Nouvelle Démarche Employé
                </Button>
            </div>

            {/* Statistiques Impact */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Heures Économisées Salariés</p>
                            <p className="text-2xl font-bold text-indigo-700">{stats.heuresEconomiseesSalaries || 42} heures</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Dossiers Finalisés ce Mois</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.finaliseesCeMois || 14}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Dossiers en Navette RH</p>
                            <p className="text-2xl font-bold text-amber-700">{stats.enCours || demandes.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Coupe-File Officiel</p>
                            <p className="text-2xl font-bold text-purple-700">Partenariat SII</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Catalogue des démarches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {catalogue.slice(0, 3).map((cat, idx) => (
                    <Card key={idx} className="border-indigo-100 bg-indigo-50/20">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-900 text-sm">{cat.titre}</h4>
                                <Badge variant="outline" className="text-xs text-indigo-700 bg-indigo-50 border-indigo-200">
                                    {cat.delaiMoyen}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-600">Documents à fournir : {cat.documentsRequis.join(', ')}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Suivi des dossiers en cours */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Suivi des Formalités Salariés en Cours
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Salarié</th>
                                <th className="px-4 py-3">Département</th>
                                <th className="px-4 py-3">Démarche Officielle</th>
                                <th className="px-4 py-3">Lieu / Guichet</th>
                                <th className="px-4 py-3">RDV / Date</th>
                                <th className="px-4 py-3">Coursier RH</th>
                                <th className="px-4 py-3">Statut Dossier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {demandes.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-900">{d.nom}</td>
                                    <td className="px-4 py-3 text-slate-600">{d.departement}</td>
                                    <td className="px-4 py-3 text-indigo-700 font-medium">{d.libelle}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{d.lieuDepotOuRdv}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{d.dateRdv}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{d.coursierAssigne}</td>
                                    <td className="px-4 py-3">{getStatutBadge(d.statut)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal Démarche */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" /> Prise en Charge Démarche
                            </h3>
                            <button onClick={() => setModalOuvert(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                        </div>
                        <form onSubmit={soumettreDemande} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input 
                                    required 
                                    placeholder="Ex: Koffi Serge" 
                                    value={nouvelleDemande.nom}
                                    onChange={e => setNouvelleDemande({...nouvelleDemande, nom: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Type de Démarche</label>
                                <select 
                                    className="w-full border rounded-md p-2 text-sm bg-white"
                                    value={nouvelleDemande.typeDemarche}
                                    onChange={e => setNouvelleDemande({...nouvelleDemande, typeDemarche: e.target.value})}
                                >
                                    {catalogue.map(c => (
                                        <option key={c.code} value={c.code}>{c.titre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Commentaires / Urgence</label>
                                <Input 
                                    placeholder="Ex: Expiration CNI dans 10 jours" 
                                    value={nouvelleDemande.commentaires}
                                    onChange={e => setNouvelleDemande({...nouvelleDemande, commentaires: e.target.value})}
                                />
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-lg text-xs text-indigo-800">
                                ℹ️ Le coursier RH pré-validera vos pièces et réservera votre créneau sans file d'attente.
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setModalOuvert(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                                    <Send className="w-4 h-4" /> Enregistrer la Demande
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
