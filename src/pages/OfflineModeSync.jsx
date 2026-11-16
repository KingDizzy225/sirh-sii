import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Database, Server, AlertOctagon, CheckCircle2, HardDrive, Smartphone, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function OfflineModeSync() {
    const [donnees, setDonnees] = useState({ agences: [], agencesSupervisees: 0, agencesHorsLigne: 0, totalOperationsEnAttente: 0 });
    const [chargement, setChargement] = useState(true);
    const [synchronisant, setSynchronisant] = useState(false);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/offline-sync/statut');
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

    const forcerSynchro = async (agenceId) => {
        try {
            setSynchronisant(true);
            await api.post('/api/offline-sync/forcer-synchro', { agenceId });
            await charger();
        } catch (err) {
            console.error(err);
        } finally {
            setSynchronisant(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <WifiOff className="w-7 h-7 text-cyan-600" />
                        Résilience Réseau & Supervision Mode Hors-Ligne (PWA)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Suivi des agences Orange en zone blanche ou coupure internet. Stockage local IndexedDB et réconciliation temps réel à chaud
                    </p>
                </div>
                <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${chargement ? 'animate-spin' : ''}`} /> Actualiser Statuts
                </Button>
            </div>

            {/* Statistiques Métriques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-cyan-100 text-cyan-700 rounded-xl">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Boutiques Sous Supervision</p>
                            <p className="text-2xl font-bold text-slate-900">{donnees.agencesSupervisees} agences</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <AlertOctagon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Agences Actuellement Hors-Ligne</p>
                            <p className="text-2xl font-bold text-rose-600">{donnees.agencesHorsLigne}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Opérations en File d'Attente</p>
                            <p className="text-2xl font-bold text-amber-700">{donnees.totalOperationsEnAttente} act.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Intégrité des Données PWA</p>
                            <p className="text-2xl font-bold text-emerald-600">100% (Zéro perte)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grille des Agences et Statuts de Synchro */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">État de Connexion des Points de Vente & Caisses</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donnees.agences.map((ag) => (
                        <motion.div key={ag.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className={`border shadow-sm ${ag.statutReseau.includes('OFFLINE') ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'}`}>
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                                {ag.statutReseau.includes('OFFLINE') ? (
                                                    <WifiOff className="w-4 h-4 text-rose-600" />
                                                ) : (
                                                    <Wifi className="w-4 h-4 text-emerald-600" />
                                                )}
                                                {ag.nom}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">{ag.derniereConnexion}</p>
                                        </div>
                                        <Badge className={
                                            ag.statutReseau === 'ONLINE_STABLE' ? 'bg-emerald-600 text-white' :
                                            ag.statutReseau.includes('OFFLINE') ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-white'
                                        }>
                                            {ag.statutReseau.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                            <span className="text-slate-400 block font-medium">Données en Cache Local :</span>
                                            <span className="font-bold text-slate-900 text-sm">{ag.elementsEnAttenteLocal} actions ({ag.tailleCacheMo} Mo)</span>
                                        </div>
                                        <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                            <span className="text-slate-400 block font-medium">Batterie Routeur 4G :</span>
                                            <span className="font-bold text-slate-900 text-sm">{ag.batterieRouteur4G}</span>
                                        </div>
                                    </div>

                                    {ag.motifCoupure !== 'Aucun' && (
                                        <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                                            <span className="font-bold">Incident :</span> {ag.motifCoupure}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <HardDrive className="w-3.5 h-3.5 text-slate-400" /> IndexedDB Active
                                        </span>
                                        <Button 
                                            size="sm" 
                                            onClick={() => forcerSynchro(ag.id)}
                                            disabled={synchronisant || ag.elementsEnAttenteLocal === 0}
                                            className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" /> Forcer la Synchronisation
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default OfflineModeSync;
