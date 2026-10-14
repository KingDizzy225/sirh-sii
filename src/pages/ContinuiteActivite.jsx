import React, { useState, useEffect } from 'react';
import { 
    Zap, AlertTriangle, ShieldCheck, RefreshCw, Radio, 
    Power, Wifi, WifiOff, MapPin, ArrowRight, CheckCircle2,
    Send, Building2, Bell, PhoneCall
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function ContinuiteActivite() {
    const [donnees, setDonnees] = useState({ sites: [], totalSites: 0, enModeDegrade: 0 });
    const [chargement, setChargement] = useState(true);
    const [actionEnCours, setActionEnCours] = useState(null);
    const [siteSelectionne, setSiteSelectionne] = useState(null);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [messageProtocole, setMessageProtocole] = useState('');

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/continuite/sites');
            if (res.data && res.data.sites) {
                setDonnees(res.data);
            }
        } catch (e) {
            console.error('Erreur chargement continuité:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
        const timer = setInterval(charger, 20000);
        return () => clearInterval(timer);
    }, []);

    const basculerMode = async (site, modeDegrade) => {
        try {
            setActionEnCours(site.id);
            await api.post(`/continuite/sites/${site.id}/basculer`, {
                modeDegrade,
                typeIncident: modeDegrade ? 'COUPURE_ENERGIE_RESEAU' : 'AUCUN',
                groupeElectrogene: modeDegrade,
                box4gSecours: modeDegrade,
                messageSecours: messageProtocole || "Protocole de délestage enclenché. Émargement papier et renforts orientés vers l'agence voisine."
            });
            await charger();
            setModalOuverte(false);
        } catch (e) {
            console.error('Erreur bascule continuité:', e);
        } finally {
            setActionEnCours(null);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                            <Radio className="w-6 h-6 animate-pulse" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Continuité d'Activité & Délestage Agences</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Surveillance du réseau électrique & télécom des boutiques Orange CI et protocoles de repli d'urgence
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={charger} disabled={chargement} className="gap-2">
                        <RefreshCw className={`w-4 h-4 ${chargement ? 'animate-spin' : ''}`} />
                        Actualiser les flux
                    </Button>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200/80">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Agences surveillées</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{donnees.totalSites}</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Building2 className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-slate-200/80 ${donnees.enModeDegrade > 0 ? 'bg-amber-50/50 border-amber-200' : ''}`}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Agences en mode dégradé</p>
                            <p className={`text-3xl font-black mt-1 ${donnees.enModeDegrade > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {donnees.enModeDegrade}
                            </p>
                        </div>
                        <div className={`p-3 rounded-2xl ${donnees.enModeDegrade > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
                            {donnees.enModeDegrade > 0 ? <AlertTriangle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Taux de résilience réseau</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">
                                {donnees.totalSites > 0 ? Math.round(((donnees.totalSites - donnees.enModeDegrade) / donnees.totalSites) * 100) : 100}%
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Zap className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grille des sites */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donnees.sites.map((site) => (
                    <motion.div key={site.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className={`h-full border transition-all ${site.modeDegrade ? 'border-amber-300 bg-amber-50/30 shadow-md' : 'border-slate-200/80 bg-white hover:border-slate-300'}`}>
                            <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{site.nom}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span>GPS : {site.latitude?.toFixed(4)}, {site.longitude?.toFixed(4)}</span>
                                    </div>
                                </div>
                                <Badge variant={site.modeDegrade ? 'destructive' : 'success'} className="px-2.5 py-1 text-xs">
                                    {site.modeDegrade ? '🚨 DÉLESTAGE ACTIF' : '🟢 NORMAL'}
                                </Badge>
                            </CardHeader>

                            <CardContent className="p-5 pt-2 space-y-4">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 flex items-center gap-1.5">
                                            {site.modeDegrade ? <WifiOff className="w-3.5 h-3.5 text-rose-500" /> : <Wifi className="w-3.5 h-3.5 text-emerald-500" />}
                                            Ping Écrans TV boutique :
                                        </span>
                                        <span className="font-semibold text-slate-700">
                                            {site.dernierPing ? new Date(site.dernierPing).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Aucun ping'}
                                        </span>
                                    </div>

                                    {site.siteRepli && (
                                        <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                                            <span className="text-slate-500">Agence de repli conseillée :</span>
                                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                                                {site.siteRepli.name} ({site.siteRepli.distanceKm} km)
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {site.modeDegrade && (
                                    <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                                        <p className="font-bold flex items-center gap-1">
                                            <Power className="w-3.5 h-3.5 text-amber-700" /> Mesures d'urgence déployées :
                                        </p>
                                        <p className="leading-relaxed">{site.messageSecours}</p>
                                    </div>
                                )}

                                <div className="pt-2">
                                    {site.modeDegrade ? (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            disabled={actionEnCours === site.id}
                                            onClick={() => basculerMode(site, false)}
                                            className="w-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Rétablir le mode normal
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            disabled={actionEnCours === site.id}
                                            onClick={() => {
                                                setSiteSelectionne(site);
                                                setMessageProtocole(`Coupure constatée à ${site.nom}. Bascule sur groupe électrogène & box 4G de secours. Les flux clients sont invités vers l'agence ${site.siteRepli?.name || 'voisine'}.`);
                                                setModalOuverte(true);
                                            }}
                                            className="w-full"
                                        >
                                            <AlertTriangle className="w-4 h-4 mr-2" /> Enclencher protocole délestage
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Modal de déclenchement */}
            {modalOuverte && siteSelectionne && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
                        <div className="flex items-center gap-3 text-amber-600">
                            <span className="p-3 bg-amber-100 rounded-2xl"><AlertTriangle className="w-6 h-6" /></span>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Activer le protocole de délestage</h3>
                                <p className="text-xs text-slate-500">{siteSelectionne.nom}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-700 block">
                                Consignes d'urgence diffusées aux équipes :
                            </label>
                            <textarea 
                                value={messageProtocole} 
                                onChange={(e) => setMessageProtocole(e.target.value)}
                                rows={4}
                                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                            />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2 border border-slate-200">
                            <p className="font-bold text-slate-700">Actions automatiques exécutées :</p>
                            <p>• Pointages salariés redirigés vers le stockage résilient local (offline)</p>
                            <p>• Agence de délestage recommandée : <strong>{siteSelectionne.siteRepli?.name}</strong></p>
                            <p>• Alerte de sécurité notifiée aux superviseurs régionaux</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                            <Button 
                                variant="destructive" 
                                onClick={() => basculerMode(siteSelectionne, true)}
                                disabled={actionEnCours === siteSelectionne.id}
                            >
                                <Zap className="w-4 h-4 mr-2" /> Déclencher le secours
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
