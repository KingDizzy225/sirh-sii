import React, { useState, useEffect } from 'react';
import { FileCheck, QrCode, Shield, Download, ExternalLink, Plus, CheckCircle, Copy, Building2, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function AttestationsSecurisees() {
    const [donnees, setDonnees] = useState({ documents: [], totalEmis: 0, banquesPartenairesConnectees: [] });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formGen, setFormGen] = useState({
        employeNom: '',
        matricule: '',
        typeDocument: 'ATTESTATION_TRAVAIL_PRET',
        banqueCible: 'SGBCI (Société Générale Côte d\'Ivoire)',
        salaireBrutFcfa: 450000
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/attestations-securisees/documents');
            if (res.data && res.data.succes) {
                setDonnees(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreGeneration = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/attestations-securisees/generer', formGen);
            setModalOuverte(false);
            setFormGen({ employeNom: '', matricule: '', typeDocument: 'ATTESTATION_TRAVAIL_PRET', banqueCible: 'SGBCI', salaireBrutFcfa: 450000 });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileCheck className="w-7 h-7 text-indigo-600" />
                        Générateur d'Attestations Sécurisées & Scellement QR
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Certificats RH infalsifiables avec empreinte cryptographique SHA-256 pour banques ivoiriennes et ambassades
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Générer une Attestation Officielle
                </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Attestations Émises</p>
                            <p className="text-2xl font-bold text-slate-900">{donnees.totalEmis}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux de Fraude</p>
                            <p className="text-2xl font-bold text-emerald-600">0.0% (Zéro faux)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Banques Reconnues</p>
                            <p className="text-xl font-bold text-blue-700">6 Établissements CI</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Algorithme de Scellement</p>
                            <p className="text-sm font-bold text-purple-700">SHA-256 / RSA 2048</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des attestations émises */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Registre des Documents Officiels Actifs</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {donnees.documents.map((doc) => (
                        <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                            <Card className="border-slate-200 shadow-sm flex flex-col justify-between h-full bg-white hover:border-indigo-300 transition-all">
                                <CardHeader className="pb-3 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold">
                                            {doc.typeDocument.replace(/_/g, ' ')}
                                        </Badge>
                                        <span className="text-xs text-slate-400 font-mono">{doc.dateDelivrance}</span>
                                    </div>
                                    <CardTitle className="text-base font-bold text-slate-900 mt-2">
                                        {doc.employeNom}
                                    </CardTitle>
                                    <p className="text-xs text-slate-500">Matricule : {doc.matricule} • {doc.statutContrat}</p>
                                </CardHeader>

                                <CardContent className="py-4 space-y-3 text-xs text-slate-700">
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Destinataire :</span>
                                        <span className="font-semibold text-slate-900">{doc.banqueCible}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Salaire Brut Certifié :</span>
                                        <span className="font-bold text-emerald-600">{doc.salaireBrutDeclareFcfa.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Ancienneté Validée :</span>
                                        <span className="font-medium text-slate-800">{doc.ancienneteReconnue}</span>
                                    </div>

                                    {/* Bloc Empreinte QR */}
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                                            <QrCode className="w-3 h-3 text-indigo-600" /> Empreinte Scellée
                                        </p>
                                        <p className="font-mono text-[10px] text-slate-500 truncate">{doc.empreinteSHA256}</p>
                                    </div>

                                    <div className="pt-2 flex items-center justify-between gap-2">
                                        <Button size="sm" variant="outline" className="text-xs w-full flex items-center justify-center gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                            <Download className="w-3.5 h-3.5" /> Télécharger PDF
                                        </Button>
                                        <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1">
                                            <ExternalLink className="w-3.5 h-3.5" /> Vérifier
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal de génération */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-indigo-600" />
                                Délivrer une Attestation Sécurisée
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={soumettreGeneration} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Nom & Prénoms du Salarié</label>
                                <Input 
                                    value={formGen.employeNom} 
                                    onChange={(e) => setFormGen({ ...formGen, employeNom: e.target.value })}
                                    placeholder="Ex: Kouamé N'Guessan"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Matricule</label>
                                    <Input 
                                        value={formGen.matricule} 
                                        onChange={(e) => setFormGen({ ...formGen, matricule: e.target.value })}
                                        placeholder="EMP-8812"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Salaire Brut Mensuel (FCFA)</label>
                                    <Input 
                                        type="number"
                                        value={formGen.salaireBrutFcfa} 
                                        onChange={(e) => setFormGen({ ...formGen, salaireBrutFcfa: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Type d'Attestation</label>
                                <select 
                                    value={formGen.typeDocument} 
                                    onChange={(e) => setFormGen({ ...formGen, typeDocument: e.target.value })}
                                    className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="ATTESTATION_TRAVAIL_PRET">Attestation de Travail pour Prêt Bancaire</option>
                                    <option value="ATTESTATION_NON_REDEVANCE">Attestation de Non-Redevance</option>
                                    <option value="CERTIFICAT_EMPLOI_VISA">Certificat d'Emploi pour Demande de Visa</option>
                                    <option value="SIMULATION_CAPACITE_EMPRUNT">Attestation de Salaire & Capacité d'Emprunt</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Organisme / Banque Destinataire</label>
                                <Input 
                                    value={formGen.banqueCible} 
                                    onChange={(e) => setFormGen({ ...formGen, banqueCible: e.target.value })}
                                    placeholder="Ex: SGBCI Agence Centrale Plateau"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Générer & Sceller</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default AttestationsSecurisees;
