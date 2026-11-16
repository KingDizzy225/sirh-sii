import React, { useState, useEffect } from 'react';
import { ScanFace, UserCheck, ShieldAlert, MapPin, Smartphone, CheckCircle2, XCircle, Plus, Camera, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function BiometriePresence() {
    const [donnees, setDonnees] = useState({ pointages: [], tauxSuccesBiometrique: '99.2%', tentativesFraudeRejetees: 0, rayonGeofencingMetres: 50 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formBio, setFormBio] = useState({
        employeNom: '',
        agence: 'Agence Orange Plateau République',
        typePointage: 'PRISE_DE_POSTE_MATIN'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/biometrie-presence/statut');
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

    const soumettreScan = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/biometrie-presence/simuler-scan', formBio);
            setModalOuverte(false);
            setFormBio({ employeNom: '', agence: 'Agence Orange Plateau République', typePointage: 'PRISE_DE_POSTE_MATIN' });
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
                        <ScanFace className="w-7 h-7 text-sky-600" />
                        Pointage Biométrique & Détection de Présence Réelle (Anti-Fraude)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Contrôle de vivacité faciale (liveness detection) et géofencing strict 50m pour équipes terrain et conseillers guichet Orange
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Simuler un Pointage Facial en Direct
                </Button>
            </div>

            {/* Statistiques KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux Reconnaissance IA</p>
                            <p className="text-2xl font-bold text-sky-600">{donnees.tauxSuccesBiometrique}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Tentatives Fraude Bloquées</p>
                            <p className="text-2xl font-bold text-rose-600">{donnees.tentativesFraudeRejetees}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Périmètre Geofencing</p>
                            <p className="text-xl font-bold text-emerald-700">Rayon {donnees.rayonGeofencingMetres} m</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Contrôle de Vivacité</p>
                            <p className="text-sm font-bold text-purple-700">Clignement + 3D Scan</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registre des pointages récents */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Journal des Pointages Biométriques et Alertes d'Usurpation</h2>

                <div className="grid grid-cols-1 gap-4">
                    {donnees.pointages.map((pt) => {
                        const estConforme = pt.statutValidation === 'POINTAGE_CERTIFIE';
                        return (
                            <motion.div key={pt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className={`border shadow-sm ${estConforme ? 'border-slate-200' : 'border-rose-300 bg-rose-50/20'}`}>
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-3 border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl ${estConforme ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    <ScanFace className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-900 text-sm">{pt.employeNom}</h3>
                                                        <Badge variant="outline">{pt.matricule}</Badge>
                                                        <Badge className={estConforme ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white animate-pulse'}>
                                                            {pt.statutValidation.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {pt.agenceAffectation} • Heure : {pt.heurePointage} ({pt.typePointage})
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs font-bold ${estConforme ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    Score IA : {pt.scoreReconnaissanceFaciale}
                                                </span>
                                                <p className="text-xs text-slate-400 mt-0.5">{pt.deviceInfo}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                                <span className="text-slate-400 font-medium block">Test de Vivacité (Anti-Photo / Écran) :</span>
                                                <span className={`font-semibold ${estConforme ? 'text-slate-800' : 'text-rose-700'}`}>{pt.testVivacite}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                                <span className="text-slate-400 font-medium block">Contrôle Géofencing GPS :</span>
                                                <span className="font-semibold text-slate-800">
                                                    Distance agence : {pt.geolocalisation.distanceMetresAgence} m {pt.geolocalisation.geofencingValide ? '(Zone OK)' : '(HORS PÉRIMÈTRE)'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Modal de simulation */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <ScanFace className="w-5 h-5 text-sky-600" />
                                Simuler un Scan Facial en Direct
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={soumettreScan} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Nom du Salarié</label>
                                <Input 
                                    value={formBio.employeNom} 
                                    onChange={(e) => setFormBio({ ...formBio, employeNom: e.target.value })}
                                    placeholder="Ex: Mamadou Diabaté"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Agence Orange de Pointage</label>
                                <Input 
                                    value={formBio.agence} 
                                    onChange={(e) => setFormBio({ ...formBio, agence: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Moment du Pointage</label>
                                <select 
                                    value={formBio.typePointage} 
                                    onChange={(e) => setFormBio({ ...formBio, typePointage: e.target.value })}
                                    className="w-full text-sm p-2 border rounded-md"
                                >
                                    <option value="PRISE_DE_POSTE_MATIN">Prise de Poste (Matin)</option>
                                    <option value="DEPART_PAUSE_DEJEUNER">Départ Pause Déjeuner</option>
                                    <option value="RETOUR_PAUSE">Retour de Pause</option>
                                    <option value="FIN_DE_SERVICE_SOIR">Fin de Service (Soir)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white">Certifier le Pointage Facial</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default BiometriePresence;
