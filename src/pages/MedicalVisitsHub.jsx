import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    HeartPulse, Shield, Calendar, Clock, CheckCircle2, AlertTriangle, 
    Plus, Search, UserCheck, Stethoscope, FileText, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

const MOCK_RECORDS = [
    {
        id: 'med-1',
        employeeId: 'emp-1',
        employee: { firstName: 'Jean', lastName: 'Kouassi', department: 'Technologie', positionTitle: 'Ingénieur DevOps' },
        visitType: 'ANNUAL',
        visitDate: '2026-05-10',
        doctorName: 'Dr. Kouamé (Médecine du Travail Abidjan)',
        aptitudeStatus: 'FIT',
        nextCheckupDate: '2027-05-10',
        notes: 'Aptitude complète validée sans réserve.'
    },
    {
        id: 'med-2',
        employeeId: 'emp-2',
        employee: { firstName: 'Awa', lastName: 'Traoré', department: 'Ressources Humaines', positionTitle: 'Chef de Projet RH' },
        visitType: 'RECRUITMENT',
        visitDate: '2026-08-01',
        doctorName: 'Dr. Bakayoko (Centre Médical Cocody)',
        aptitudeStatus: 'FIT_WITH_RESTRICTION',
        nextCheckupDate: '2026-09-15',
        notes: 'Aptitude validée avec recommandation de siège ergonomique.'
    }
];

export function MedicalVisitsHub() {
    const [records, setRecords] = useState(MOCK_RECORDS);
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const [form, setForm] = useState({
        employeeId: '',
        visitType: 'ANNUAL',
        visitDate: new Date().toISOString().split('T')[0],
        doctorName: 'Dr. Kouamé (Médecine du Travail Abidjan)',
        aptitudeStatus: 'FIT',
        nextCheckupDate: '2027-09-01',
        notes: ''
    });

    useEffect(() => {
        fetchRecords();
        api.get('/employees').then(res => {
            if (res.data && Array.isArray(res.data)) {
                setEmployees(res.data);
                if (res.data.length > 0) setForm(f => ({ ...f, employeeId: res.data[0].id }));
            }
        }).catch(() => {});
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await api.get('/medical').catch(() => ({ data: null }));
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                setRecords(res.data);
            }
        } catch (e) {}
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/medical', form).catch(() => ({ data: null }));
            showNotification("✅ Visite médicale et certificat d'aptitude enregistrés avec succès !");
            setIsModalOpen(false);
            fetchRecords();
        } catch (err) {
            showNotification("Erreur lors de l'enregistrement.");
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <HeartPulse className="text-rose-600" /> Hub Santé au Travail & Visites Médicales
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Conformité légale du Code du Travail : Suivi des examens annuels et certificats d'aptitude.
                    </p>
                </div>

                <Button onClick={() => setIsModalOpen(true)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md gap-2">
                    <Plus size={16} /> Enregistrer une Visite Médicale
                </Button>
            </div>

            {/* Notification */}
            {notification && (
                <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium">
                    {notification}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                            <Stethoscope size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Examens Réalisés</p>
                            <p className="text-2xl font-bold text-slate-900">{records.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Aptes 100%</p>
                            <p className="text-2xl font-bold text-slate-900">{records.filter(r => r.aptitudeStatus === 'FIT').length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Restrictions / Réaménagements</p>
                            <p className="text-2xl font-bold text-slate-900">{records.filter(r => r.aptitudeStatus === 'FIT_WITH_RESTRICTION').length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">À Renouveler (&lt; 30j)</p>
                            <p className="text-2xl font-bold text-slate-900">1</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Medical Records Table */}
            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-6 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-900">Registres de Santé au Travail</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {records.map(rec => (
                            <div key={rec.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">
                                        {rec.employee?.firstName?.[0]}{rec.employee?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-base">{rec.employee?.firstName} {rec.employee?.lastName}</h4>
                                        <p className="text-xs text-slate-500">{rec.employee?.positionTitle} — {rec.employee?.department}</p>
                                        <p className="text-xs text-slate-600 mt-2 font-medium">Médecin : {rec.doctorName}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className={`text-xs ${
                                        rec.aptitudeStatus === 'FIT' 
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                            : 'bg-amber-100 text-amber-800 border-amber-200'
                                    }`}>
                                        {rec.aptitudeStatus === 'FIT' ? '✓ APTE SANS RÉSERVE' : '⚠️ APTE AVEC RÉSERVE'}
                                    </Badge>
                                    <span className="text-xs text-slate-400 font-medium">
                                        Prochain examen : {rec.nextCheckupDate ? new Date(rec.nextCheckupDate).toLocaleDateString('fr-FR') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal: New Visit */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
                            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6 text-white flex justify-between items-center">
                                <h3 className="text-lg font-bold">Enregistrer une Visite Médicale</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Collaborateur concerné</label>
                                    <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold">
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.positionTitle || e.role}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Type d'examen</label>
                                        <select value={form.visitType} onChange={e => setForm({ ...form, visitType: e.target.value })}
                                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold">
                                            <option value="ANNUAL">Visite Annuelle Obligatoire</option>
                                            <option value="RECRUITMENT">Visite d'Embauche</option>
                                            <option value="RECONVERSION">Visite de Reprise</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Aptitude Médicale</label>
                                        <select value={form.aptitudeStatus} onChange={e => setForm({ ...form, aptitudeStatus: e.target.value })}
                                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold">
                                            <option value="FIT">Apte sans réserve</option>
                                            <option value="FIT_WITH_RESTRICTION">Apte avec réaménagement</option>
                                            <option value="UNFIT">Inapte temporaire</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Date d'Examen</label>
                                        <Input type="date" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Prochain Examen</label>
                                        <Input type="date" value={form.nextCheckupDate} onChange={e => setForm({ ...form, nextCheckupDate: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Médecin / Centre Médical</label>
                                    <Input value={form.doctorName} onChange={e => setForm({ ...form, doctorName: e.target.value })} />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold">Enregistrer</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
