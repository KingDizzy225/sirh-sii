import React, { useState, useEffect } from 'react';
import { HeartPulse, Plus, Building2, Stethoscope, QrCode, FileCheck, CheckCircle2, Shield, PhoneCall, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function PassSante() {
    const [donnees, setDonnees] = useState({ prisesEnCharge: [], centres: [], tauxCouvertureGlobal: '80%', salariesAdherents: 385 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formBon, setFormBon] = useState({
        employeNom: '',
        matricule: '',
        beneficiaire: 'Salarié Titulaire',
        etablissement: 'Polyclinique Sainte Anne-Marie (PISAM Cocody)',
        montantEstimeFcfa: 40000
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/pass-sante/statut');
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

    const soumettreBon = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/pass-sante/generer-bon', formBon);
            setModalOuverte(false);
            setFormBon({ employeNom: '', matricule: '', beneficiaire: 'Salarié Titulaire', etablissement: 'Polyclinique Sainte Anne-Marie (PISAM Cocody)', montantEstimeFcfa: 40000 });
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
                        <HeartPulse className="w-7 h-7 text-rose-500" />
                        Pass Santé Digital & Tiers-Payant Cliniques / Pharmacies
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Couverture médicale 80% dématérialisée, bons de prise en charge instantanés et réseau conventionné à Abidjan et en province
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Émettre un Bon de Prise en Charge Express
                </Button>
            </div>

            {/* Statistiques KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux Tiers-Payant</p>
                            <p className="text-2xl font-bold text-rose-600">{donnees.tauxCouvertureGlobal}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Salariés Protégés</p>
                            <p className="text-2xl font-bold text-slate-900">{donnees.salariesAdherents} agents</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Ayants Droit Couverts</p>
                            <p className="text-2xl font-bold text-emerald-600">{donnees.ayantsDroitCouverts || 940} pers.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Centres Agréés</p>
                            <p className="text-sm font-bold text-purple-700">PISAM, Farandole, Bouaké...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Établissements Conventionnés */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose-500" />
                    Cliniques, Hôpitaux & Laboratoires Partenaires Agréés
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {donnees.centres.map((c) => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                            <p className="font-bold text-slate-900">{c.nom}</p>
                            <p className="text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {c.ville}</p>
                            <p className="text-rose-700 font-semibold">{c.convention}</p>
                            <p className="text-slate-400 flex items-center gap-1 font-mono"><PhoneCall className="w-3 h-3" /> {c.contact}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bons de prise en charge récents */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Bons de Prise en Charge Numériques Récents</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {donnees.prisesEnCharge.map((bon) => (
                        <motion.div key={bon.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                            <Card className="border-slate-200 shadow-sm hover:border-rose-300 transition-all bg-white flex flex-col justify-between h-full">
                                <CardHeader className="pb-3 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-semibold">
                                            {bon.codeBonDigital}
                                        </Badge>
                                        <span className="text-xs text-slate-400">{bon.dateEmission}</span>
                                    </div>
                                    <CardTitle className="text-sm font-bold text-slate-900 mt-2">
                                        {bon.employeNom}
                                    </CardTitle>
                                    <p className="text-xs text-slate-500">Bénéficiaire : <span className="font-semibold text-slate-800">{bon.beneficiaire}</span></p>
                                </CardHeader>

                                <CardContent className="py-4 space-y-2.5 text-xs text-slate-700">
                                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                                        <p className="font-semibold text-slate-900">{bon.etablissement}</p>
                                        <p className="text-slate-500">{bon.prestation}</p>
                                    </div>

                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Montant Facture :</span>
                                        <span className="font-semibold text-slate-900">{bon.montantTotalFcfa.toLocaleString('fr-FR')} FCFA</span>
                                    </div>

                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-emerald-700 font-medium">Prise en charge SII (80%) :</span>
                                        <span className="font-bold text-emerald-700">{bon.partAssuranceFcfa.toLocaleString('fr-FR')} FCFA</span>
                                    </div>

                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-400">Reste à charge (20%) :</span>
                                        <span className="font-medium text-slate-700">{bon.partSalarieFcfa.toLocaleString('fr-FR')} FCFA</span>
                                    </div>

                                    <div className="bg-rose-50/60 p-2 rounded text-[11px] text-rose-800 font-medium text-center">
                                        {bon.heureValidite}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal émission */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <HeartPulse className="w-5 h-5 text-rose-500" />
                                Générer un Bon Tiers-Payant Express
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={soumettreBon} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Nom du Salarié</label>
                                <Input 
                                    value={formBon.employeNom} 
                                    onChange={(e) => setFormBon({ ...formBon, employeNom: e.target.value })}
                                    placeholder="Ex: Kouassi Konan"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Matricule</label>
                                    <Input 
                                        value={formBon.matricule} 
                                        onChange={(e) => setFormBon({ ...formBon, matricule: e.target.value })}
                                        placeholder="EMP-7712"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Bénéficiaire</label>
                                    <Input 
                                        value={formBon.beneficiaire} 
                                        onChange={(e) => setFormBon({ ...formBon, beneficiaire: e.target.value })}
                                        placeholder="Ex: Salarié / Enfant / Conjoint"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Clinique ou Pharmacie Agréée</label>
                                <select 
                                    value={formBon.etablissement} 
                                    onChange={(e) => setFormBon({ ...formBon, etablissement: e.target.value })}
                                    className="w-full text-sm p-2 border rounded-md"
                                >
                                    <option value="Polyclinique Sainte Anne-Marie (PISAM Cocody)">PISAM (Cocody)</option>
                                    <option value="Polyclinique Internationale Hôtel-Dieu">Hôtel-Dieu (Treichville)</option>
                                    <option value="Clinique Farandole (Deux-Plateaux)">Farandole (Deux-Plateaux)</option>
                                    <option value="Clinique de l'Aurore (Bouaké)">Clinique de l'Aurore (Bouaké)</option>
                                    <option value="Pharmacie Agréée de Garde">Pharmacie Agréée Partenaire</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Montant Estimé Soins / Consultation (FCFA)</label>
                                <Input 
                                    type="number"
                                    value={formBon.montantEstimeFcfa} 
                                    onChange={(e) => setFormBon({ ...formBon, montantEstimeFcfa: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Émettre Bon Digital</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default PassSante;
