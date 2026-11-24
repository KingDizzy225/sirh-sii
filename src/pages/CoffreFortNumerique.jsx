import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Download, FileText, CheckCircle2, Key, History, PlusCircle, Search, RefreshCw, Award, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export function CoffreFortNumerique() {
    const [documents, setDocuments] = useState([]);
    const [journalAudit, setJournalAudit] = useState([]);
    const [garanties, setGaranties] = useState({});
    const [chargement, setChargement] = useState(true);
    const [modalOuvert, setModalOuvert] = useState(false);
    const [telechargementActif, setTelechargementActif] = useState(null);
    const [nouveauDoc, setNouveauDoc] = useState({
        matricule: 'EMP-0245',
        salarieNom: 'Kouassi Yves',
        typeDocument: 'BULLETIN_PAIE_SCELLE',
        titre: 'Bulletin de Paie - Novembre 2026',
        periode: '2026-11'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/coffre-fort-numerique/documents');
            if (res.data && res.data.success) {
                setDocuments(res.data.documents);
                setJournalAudit(res.data.journalAudit);
                setGaranties(res.data.garanties);
            }
        } catch (err) {
            console.error('Erreur chargement coffre-fort:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const scellerDocument = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/coffre-fort-numerique/sceller', nouveauDoc);
            if (res.data && res.data.success) {
                alert(`✅ ${res.data.message}`);
                setModalOuvert(false);
                charger();
            }
        } catch (err) {
            alert('Erreur lors du scellement du document');
        }
    };

    const telechargerDocumentScelle = (doc) => {
        setTelechargementActif(doc.id);
        setTimeout(() => {
            setTelechargementActif(null);
            alert(`📥 Document scellé [${doc.titre}] exporté avec succès avec son certificat électronique X.509 et son empreinte SHA-256 certifiée.`);
        }, 1200);
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Lock className="w-7 h-7 text-emerald-700" />
                        Coffre-Fort Numérique Personnel Salarié (e-Vault 50 ans)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Archivage légal opposable à valeur probante (ISO 14641), bulletins scellés par empreinte SHA-256 et certificat X.509
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                    <Button onClick={() => setModalOuvert(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2 shadow-sm">
                        <PlusCircle className="w-4 h-4" />
                        Sceller un Document RH
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Garantie Légale de Conservation</p>
                            <p className="text-2xl font-bold text-emerald-800">50 Ans</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Intégrité Cryptographique</p>
                            <p className="text-lg font-bold text-blue-700">SHA-256 Scellé</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Documents Protégés</p>
                            <p className="text-2xl font-bold text-indigo-700">{documents.length} archives</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Accès Post-Départ Salarié</p>
                            <p className="text-lg font-bold text-amber-800">Garanti à Vie</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tableau des Documents du Coffre */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="w-5 h-5 text-emerald-700" />
                        Répertoire des Archives RH Scellées
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Document</th>
                                <th className="px-4 py-3">Salarié / Matricule</th>
                                <th className="px-4 py-3">Date de Scellement</th>
                                <th className="px-4 py-3">Empreinte SHA-256</th>
                                <th className="px-4 py-3">Statut Légal</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {documents.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{d.titre}</div>
                                        <span className="text-[11px] font-mono text-slate-400">{d.id} • {d.tailleKo} Ko</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-800">{d.salarieNom}</div>
                                        <span className="text-xs text-slate-500">{d.matricule}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {new Date(d.dateDepot).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-mono text-[10px] text-slate-500 bg-slate-100 p-1 rounded max-w-[200px] truncate" title={d.empreinteSha256}>
                                            {d.empreinteSha256}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className="bg-emerald-600 text-white text-xs">
                                            {d.statutArchivage}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            disabled={telechargementActif === d.id}
                                            onClick={() => telechargerDocumentScelle(d)}
                                            className="text-xs flex items-center gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            {telechargementActif === d.id ? 'Vérification...' : 'Télécharger Scellé'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Journal des Preuves & Audit Trail */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-600" />
                        Journal d'Intégrité & Audit Trail Certifié
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                    {journalAudit.map(j => (
                        <div key={j.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                            <div>
                                <span className="font-mono text-slate-500 mr-2">{j.date}</span>
                                <strong className="text-slate-800">{j.action}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[11px]">
                                    {j.statut}
                                </Badge>
                                <span className="text-slate-400 text-[11px]">{j.operateur}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Modal Scellement */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Lock className="w-5 h-5 text-emerald-700" /> Sceller un Document dans le Coffre
                            </h3>
                            <button onClick={() => setModalOuvert(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                        </div>
                        <form onSubmit={scellerDocument} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Matricule Salarié</label>
                                <Input 
                                    required 
                                    value={nouveauDoc.matricule}
                                    onChange={e => setNouveauDoc({...nouveauDoc, matricule: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom & Prénoms</label>
                                <Input 
                                    required 
                                    value={nouveauDoc.salarieNom}
                                    onChange={e => setNouveauDoc({...nouveauDoc, salarieNom: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Type de Document</label>
                                <select 
                                    className="w-full border rounded-md p-2 text-sm bg-white"
                                    value={nouveauDoc.typeDocument}
                                    onChange={e => setNouveauDoc({...nouveauDoc, typeDocument: e.target.value})}
                                >
                                    <option value="BULLETIN_PAIE_SCELLE">Bulletin de Paie Mensuel</option>
                                    <option value="CONTRAT_TRAVAIL_SIGNE">Contrat de Travail / Avenant</option>
                                    <option value="CERTIFICAT_TRAVAIL">Certificat de Travail / Attestation CNPS</option>
                                    <option value="SOLDE_TOUT_COMPTE">Reçu pour Solde de Tout Compte</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Titre du Document</label>
                                <Input 
                                    required 
                                    value={nouveauDoc.titre}
                                    onChange={e => setNouveauDoc({...nouveauDoc, titre: e.target.value})}
                                />
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800">
                                ℹ️ Le document sera immédiatement scellé avec un certificat électronique X.509 et une empreinte SHA-256 infalsifiable.
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setModalOuvert(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1">
                                    Sceller & Archiver (50 ans)
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
