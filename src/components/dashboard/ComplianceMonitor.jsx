import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ShieldAlert, CheckCircle, AlertTriangle, Scale, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const COMPLIANCE_ITEMS = [
    { id: 1, title: 'Visites Médicales', status: 'warning', message: '4 visites à planifier avant fin de mois.', icon: AlertTriangle },
    { id: 2, title: 'Durée du Travail', status: 'safe', message: 'Aucun dépassement d\'heures sup détecté.', icon: CheckCircle },
    { id: 3, title: 'Contrats CDD', status: 'danger', message: '2 fins de contrat sans action (J-5).', icon: ShieldAlert },
    { id: 4, title: 'Égalité F/H', status: 'safe', message: 'Index de parité stable à 88/100.', icon: Scale },
];

export function ComplianceMonitor() {
    return (
        <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                        <Scale size={16} /> Compliance Guardian AI
                    </CardTitle>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">EN VEILLE</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {COMPLIANCE_ITEMS.map((item, idx) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className={`mt-0.5 p-1.5 rounded-lg ${
                            item.status === 'safe' ? 'bg-emerald-500/20 text-emerald-400' : 
                            item.status === 'warning' ? 'bg-amber-500/20 text-amber-400' : 
                            'bg-rose-500/20 text-rose-400'
                        }`}>
                            <item.icon size={14} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white/90">{item.title}</p>
                            <p className="text-[10px] text-white/50 mt-0.5">{item.message}</p>
                        </div>
                    </motion.div>
                ))}
                
                <button className="w-full mt-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[10px] font-black uppercase tracking-widest transition-all">
                    Lancer l'Audit Complet
                </button>
            </CardContent>
        </Card>
    );
}
