import React, { useState, useEffect } from 'react';
import { 
    ClipboardCheck, Camera, AlertTriangle, CheckCircle2, 
    ShieldCheck, Plus, Clock, MapPin, Building2, Eye, Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function OuvertureAgence() {
    const [donnees, setDonnees] = useState({ audits: [], total: 0, conformes: 0, avecIncidents: 0 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formAudit, setFormAudit] = useState({
        siteNom: 'Agence Orange Plateau Postel 2001',
        responsableNom: '',
        pointsVerifies: {
            coffreArme: true,
            fondCaisseOm: true,
            climFonctionnelle: true,
            presentoirsAllumes: true,
            flyersAjour: true
        },
        remarques: '',
        photosUrls: []
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/ouverture-agence/audits');
            if (res.data) setDonnees(res.data);
        } catch (e) {
            console.error('Erreur chargement audits:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreAudit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/ouverture-agence/valider', formAudit);
            setModalOuverte(false);
            await charger();
        } catch (e) {
            console.error('Erreur validation audit:', e);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <ClipboardCheck className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Check-list Prise de Poste & Store Opening</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Audit visuel et conformité sécurité des boutiques Orange CI avant l'ouverture client à 08h30
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOuverte(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                        <Camera className="w-4 h-4" /> Enregistrer l'ouverture d'agence
                    </Button>
                </div>
            </div>

            {/* Statistiques d'ouverture */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Agences auditées ce matin</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{donnees.total}</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Building2 className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Ouvertures 100% Conformes</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">{donnees.conformes}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-slate-200 ${donnees.avecIncidents > 0 ? 'bg-amber-50/50 border-amber-200' : ''}`}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Signalements techniques</p>
                            <p className={`text-3xl font-black mt-1 ${donnees.avecIncidents > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                {donnees.avecIncidents}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des audits du jour */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Audits d'Ouverture du Jour ({donnees.audits.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {donnees.audits.map((a) => (
                        <Card key={a.id} className="border-slate-200 bg-white">
                            <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">{a.siteNom}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                        <Clock className="w-3.5 h-3.5" /> Audité à {a.heure} par {a.responsableNom}
                                    </p>
                                </div>
                                <Badge variant={a.statut === 'CONFORME' ? 'success' : 'destructive'} className="px-2.5 py-1 text-xs">
                                    {a.statut === 'CONFORME' ? '🟢 CONFORME' : '⚠️ ANOMALIE DÉTECTÉE'}
                                </Badge>
                            </CardHeader>

                            <CardContent className="p-5 pt-2 space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        {a.pointsVerifies.coffreArme ? '✅' : '❌'} Coffre-fort armé
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {a.pointsVerifies.fondCaisseOm ? '✅' : '❌'} Caisse Orange Money prête
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {a.pointsVerifies.climFonctionnelle ? '✅' : '❌'} Climatisation OK
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {a.pointsVerifies.presentoirsAllumes ? '✅' : '❌'} Présentoirs allumés
                                    </div>
                                </div>

                                {a.incidentsDetectes?.length > 0 && (
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                                        <p className="font-bold flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-amber-700" /> Ticket technique ouvert :</p>
                                        <p>{a.incidentsDetectes.join(' ')}</p>
                                    </div>
                                )}

                                {a.photosUrls?.length > 0 && (
                                    <div className="flex gap-2">
                                        {a.photosUrls.map((url, idx) => (
                                            <img key={idx} src={url} alt="Preuve ouverture" className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-xs" />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Modal Nouvel Audit */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Validation Prise de Poste Boutique</h3>
                        <form onSubmit={soumettreAudit} className="space-y-4 text-sm">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Agence concernée</label>
                                <Input value={formAudit.siteNom} onChange={e => setFormAudit({...formAudit, siteNom: e.target.value})} required />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nom du responsable d'ouverture</label>
                                <Input value={formAudit.responsableNom} onChange={e => setFormAudit({...formAudit, responsableNom: e.target.value})} placeholder="Ex: Kouamé N'guessan" required />
                            </div>

                            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                                <p className="font-bold text-slate-700 mb-2">Check-list de sécurité & accueil :</p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formAudit.pointsVerifies.coffreArme} onChange={e => setFormAudit({
                                        ...formAudit, pointsVerifies: {...formAudit.pointsVerifies, coffreArme: e.target.checked}
                                    })} className="rounded text-emerald-600 w-4 h-4" />
                                    <span>Coffre armé et caméras opérationnelles</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formAudit.pointsVerifies.fondCaisseOm} onChange={e => setFormAudit({
                                        ...formAudit, pointsVerifies: {...formAudit.pointsVerifies, fondCaisseOm: e.target.checked}
                                    })} className="rounded text-emerald-600 w-4 h-4" />
                                    <span>Fond de caisse Orange Money approvisionné</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formAudit.pointsVerifies.climFonctionnelle} onChange={e => setFormAudit({
                                        ...formAudit, pointsVerifies: {...formAudit.pointsVerifies, climFonctionnelle: e.target.checked}
                                    })} className="rounded text-emerald-600 w-4 h-4" />
                                    <span>Climatisation fonctionnelle</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formAudit.pointsVerifies.presentoirsAllumes} onChange={e => setFormAudit({
                                        ...formAudit, pointsVerifies: {...formAudit.pointsVerifies, presentoirsAllumes: e.target.checked}
                                    })} className="rounded text-emerald-600 w-4 h-4" />
                                    <span>Présentoirs smartphones allumés & propres</span>
                                </label>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Remarques ou anomalie à signaler</label>
                                <Input value={formAudit.remarques} onChange={e => setFormAudit({...formAudit, remarques: e.target.value})} placeholder="Facultatif (ex: rideau métallique grinçant)" />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Valider l'ouverture</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
