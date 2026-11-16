import React, { useState, useEffect } from 'react';
import { ShieldCheck, Flame, Wind, BatteryCharging, Wrench, AlertTriangle, CheckCircle, Clock, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function MaintenanceQhse() {
    const [donnees, setDonnees] = useState({ equipements: [], totalEquipementsSupervises: 0, conformiteGlobale: '92.5%', alertesIntervention: 0 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [selectedEqId, setSelectedEqId] = useState('');
    const [formMaint, setFormMaint] = useState({ technicien: '', notes: '' });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/maintenance-qhse/statut');
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

    const ouvrirModalEntretien = (eqId) => {
        setSelectedEqId(eqId);
        setModalOuverte(true);
    };

    const enregistrerEntretien = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/maintenance-qhse/declarer-maintenance', {
                equipementId: selectedEqId,
                technicien: formMaint.technicien,
                notes: formMaint.notes
            });
            setModalOuverte(false);
            setFormMaint({ technicien: '', notes: '' });
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
                        <ShieldCheck className="w-7 h-7 text-emerald-600" />
                        Maintenance Préventive QHSE (Groupes, Clim & Extincteurs)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Suivi de la sécurité des agences Orange CI, du confort thermique en boutique et de la disponibilité des groupes électrogènes
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold px-3 py-1">
                        Normes QHSE & ONPC CI
                    </Badge>
                </div>
            </div>

            {/* Statistiques Métriques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Conformité QHSE Réseau</p>
                            <p className="text-2xl font-bold text-emerald-600">{donnees.conformiteGlobale}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Équipements Contrôlés</p>
                            <p className="text-2xl font-bold text-slate-900">{donnees.totalEquipementsSupervises} unités</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Interventions Requises</p>
                            <p className="text-2xl font-bold text-rose-600">{donnees.alertesIntervention}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Audit Général Réseau</p>
                            <p className="text-sm font-bold text-purple-700">{donnees.prochainControleGeneralDate || '25/11/2026'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des équipements suivis */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Registre du Matériel Critique & Conformité</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donnees.equipements.map((eq) => (
                        <motion.div key={eq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className={`border shadow-sm ${eq.statutConformite !== 'CONFORME_PRET' ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'}`}>
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-start justify-between border-b pb-3 border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                                                {eq.type === 'ENERGIE_SECOURS' && <BatteryCharging className="w-5 h-5 text-amber-600" />}
                                                {eq.type === 'CONFORT_ET_VENTILATION' && <Wind className="w-5 h-5 text-cyan-600" />}
                                                {eq.type === 'SECURITE_INCENDIE' && <Flame className="w-5 h-5 text-rose-600" />}
                                                {eq.type === 'PREMIERS_SECOURS_RH' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm">{eq.equipement}</h3>
                                                <p className="text-xs text-slate-500 font-medium">{eq.agence}</p>
                                            </div>
                                        </div>
                                        <Badge className={
                                            eq.statutConformite === 'CONFORME_PRET' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white animate-pulse'
                                        }>
                                            {eq.statutConformite.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                                        <div className="bg-slate-50 p-2 rounded">
                                            <span className="text-slate-400 block font-medium">Dernier Entretien :</span>
                                            <span className="font-semibold text-slate-900">{eq.dernierEntretien}</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded">
                                            <span className="text-slate-400 block font-medium">Prestataire Agréé :</span>
                                            <span className="font-semibold text-slate-900">{eq.technicienResponsable}</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded col-span-2">
                                            <span className="text-slate-400 block font-medium">État & Constat Technique :</span>
                                            <span className="font-medium text-slate-800">{eq.etatBatterieDemarrage} • {eq.niveauCarburant}</span>
                                        </div>
                                    </div>

                                    <div className="pt-1 flex justify-end">
                                        <Button 
                                            size="sm" 
                                            onClick={() => ouvrirModalEntretien(eq.id)} 
                                            className="text-xs bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5"
                                        >
                                            <Wrench className="w-3.5 h-3.5" /> Enregistrer un Entretien
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal déclaration entretien */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-emerald-600" />
                                Valider Maintenance Préventive
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={enregistrerEntretien} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Prestataire ou Technicien Spécialisé</label>
                                <Input 
                                    value={formMaint.technicien} 
                                    onChange={(e) => setFormMaint({ ...formMaint, technicien: e.target.value })}
                                    placeholder="Ex: Général Diesel CI / SICI"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Rapport d'Intervention / Pièces Changées</label>
                                <textarea 
                                    value={formMaint.notes} 
                                    onChange={(e) => setFormMaint({ ...formMaint, notes: e.target.value })}
                                    rows={3}
                                    className="w-full text-sm p-2 border rounded-md"
                                    placeholder="Ex: Vidange moteur effectuée, filtres remplacés, niveau d'huile et tension batterie certifiés conformes."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Certifier Conforme</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default MaintenanceQhse;
