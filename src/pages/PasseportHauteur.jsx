import React, { useState, useEffect } from 'react';
import { HardHat, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Camera, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function PasseportHauteur() {
    const [donnees, setDonnees] = useState({ techniciens: [], normeSecurite: '' });
    const [chargement, setChargement] = useState(true);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/passeport-hauteur/techniciens');
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

    const validerChecklist = async (technicienId) => {
        try {
            await api.post('/api/passeport-hauteur/valider-checklist-jour', { technicienId });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <HardHat className="w-7 h-7 text-amber-600" />
                        Passeport Hauteur & Habilitation Poteaux CIE (Techniciens Fibre)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Suivi des certifications, contrôle quotidien de l'état du harnais et de l'échelle avant raccordement client
                    </p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold">
                    ⚡ {donnees.normeSecurite || 'Norme Électrique CIE & Orange CI'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.techniciens.map((tec) => (
                    <motion.div key={tec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <HardHat className="w-4 h-4 text-amber-600" />
                                        {tec.technicienNom} ({tec.matricule})
                                    </CardTitle>
                                    <Badge className={tec.statutEpi === 'CONFORME_INSPECTE' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}>
                                        {tec.statutEpi}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Zone : <strong>{tec.zoneIntervention}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>🎖️ <strong>Habilitation :</strong> {tec.certificationHauteur}</p>
                                    <p>📅 <strong>Validité :</strong> Jusqu'au {tec.validiteJusquau}</p>
                                    <p>🪢 <strong>Inspection harnais :</strong> Fait le {tec.dateDerniereInspectionHarnais}</p>
                                    <p className="text-emerald-700 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Autorisé à grimper sur poteaux télécom/CIE
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs">
                                    <span className="text-slate-500">Checklist du jour certifiée</span>
                                    <Button size="sm" onClick={() => validerChecklist(tec.id)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8">
                                        Renouveler Inspection Jour
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
