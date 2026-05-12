import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, FileText, Receipt, Heart, Clock, ArrowRight, ShieldCheck, DollarSign, User, CheckCircle2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function EmployeePortal() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [logs, setLogs] = useState([]);
    const [isClocking, setIsClocking] = useState(false);
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [absenceForm, setAbsenceForm] = useState({
        type: 'Absence injustifiée',
        date: new Date().toISOString().split('T')[0],
        justification: '',
        file: null
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/api/employees/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setProfile(await res.json());
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };

        const fetchLogs = async () => {
            try {
                const res = await fetch(`${API_URL}/api/time-logs/today`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setLogs(await res.json());
            } catch (err) {
                console.error("Failed to load time logs", err);
            }
        };

        if (token) {
            fetchProfile();
            fetchLogs();
        }
    }, [token]);

    const handleClock = async (type) => {
        setIsClocking(true);
        try {
            const res = await fetch(`${API_URL}/api/time-logs`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ type })
            });
            if (res.ok) {
                const newLog = await res.json();
                setLogs([...logs, newLog]);
            }
        } catch (err) {
            console.error("Failed to clock", err);
        } finally {
            setIsClocking(false);
        }
    };

    const handleDownloadAttestation = async () => {
        if (!profile || !profile.id) return alert("Profil non chargé.");
        try {
            const res = await fetch(`${API_URL}/api/documents/generate-attestation/${profile.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Attestation_${profile.lastName}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Erreur lors de la génération du document.");
            }
        } catch (error) {
            console.error("Download error", error);
            alert("Impossible de générer l'attestation.");
        }
    };

    const handleAbsenceSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('type', absenceForm.type);
        formData.append('date', absenceForm.date);
        formData.append('justification', absenceForm.justification);
        if (absenceForm.file) {
            formData.append('justificatif', absenceForm.file);
        }

        try {
            const res = await fetch(`${API_URL}/api/absences`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                alert("Demande transmise avec succès.");
                setIsAbsenceModalOpen(false);
                setAbsenceForm({ type: 'Absence injustifiée', date: new Date().toISOString().split('T')[0], justification: '', file: null });
            } else {
                alert("Erreur lors de l'envoi.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau.");
        }
    };

    const hasClockedIn = logs.some(l => l.type === 'CLOCK_IN');
    const hasClockedOut = logs.some(l => l.type === 'CLOCK_OUT');
    const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 bg-slate-50/50 min-h-[calc(100vh-4rem)]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                        Bonjour, {profile?.firstName || user?.name.split(' ')[0] || ''}
                    </h2>
                    <p className="text-slate-500 mt-1">Voici un aperçu de vos informations et tâches de la journée.</p>
                </div>
            </div>

            {/* Onboarding Gamifié */}
            {profile && (new Date() - new Date(profile.hireDate)) / (1000 * 60 * 60 * 24) < 90 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Award className="text-yellow-300" /> Quêtes d'Intégration
                            </h3>
                            <p className="text-indigo-100 text-sm">Complétez votre profil pour débloquer le badge "Nouvelle Recrue" !</p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold">66%</span>
                        </div>
                    </div>
                    <div className="w-full bg-indigo-900/50 rounded-full h-3 mb-4">
                        <div className="bg-yellow-400 h-3 rounded-full" style={{ width: '66%' }}></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-400" />
                            <span className="text-sm font-medium line-through opacity-70">Connexion réussie</span>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-400" />
                            <span className="text-sm font-medium line-through opacity-70">Lire la charte</span>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3 border border-yellow-400/50">
                            <div className="w-6 h-6 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center"></div>
                            <span className="text-sm font-bold text-yellow-100">Uploader le RIB</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Les Widgets (Style ADP) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* WIDGET: Mon Salaire */}
                <Card className="rounded-xl shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <DollarSign className="text-emerald-600" size={20} />
                            Ma Paie
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-1">Dernier paiement : 28 Fév 2026</p>
                        <div className="text-3xl font-extrabold text-slate-900 mb-4">
                            *** *** <span className="text-xl text-slate-500">FCFA</span>
                        </div>
                        <Link to="/documents">
                            <Button variant="outline" className="w-full text-slate-700 border-slate-300 hover:bg-slate-50">
                                Voir mes documents de paie
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* WIDGET: Mes Congés */}
                <Card className="rounded-xl shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Calendar className="text-blue-600" size={20} />
                            Mes Congés
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-1">Solde disponible (Congés Annuels)</p>
                        <div className="text-3xl font-extrabold text-slate-900 mb-4">
                            14.5 <span className="text-xl font-semibold text-slate-500">Jours</span>
                        </div>
                        <Link to="/leaves">
                            <Button variant="outline" className="w-full text-slate-700 border-slate-300 hover:bg-slate-50">
                                Poser une absence
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* WIDGET: Badgeage / Pointage */}
                <Card className="rounded-xl shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="text-amber-600" size={20} />
                            Badgeage Virtuel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-2">
                            {lastLog ? `Dernier pointage : ${new Date(lastLog.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}` : "Aucun pointage aujourd'hui"}
                        </p>
                        
                        {!hasClockedIn || (hasClockedIn && hasClockedOut) ? (
                            <Button 
                                onClick={() => handleClock('CLOCK_IN')} 
                                disabled={isClocking}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md mb-2">
                                {isClocking ? 'En cours...' : 'Pointer mon ARRIVÉE'}
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => handleClock('CLOCK_OUT')} 
                                disabled={isClocking}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-md mb-2">
                                {isClocking ? 'En cours...' : 'Pointer mon DÉPART'}
                            </Button>
                        )}
                        
                        <Link to="/timesheet">
                            <Button variant="outline" className="w-full text-slate-700 border-slate-300 hover:bg-slate-50 text-xs">
                                Historique complet
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Guichet Unique RH (Smart Self-Service) */}
            <div className="mt-10 bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <User size={150} />
                </div>
                <div className="bg-indigo-600 p-6 flex items-center gap-4 text-white">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Guichet Unique RH</h3>
                        <p className="text-indigo-200 text-sm">Comment puis-je vous aider aujourd'hui ?</p>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div onClick={() => setIsAbsenceModalOpen(true)} className="cursor-pointer flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl transition-all group">
                        <Calendar size={32} className="text-indigo-400 group-hover:text-indigo-600 mb-3" />
                        <span className="font-bold text-slate-700 text-center">Je suis absent</span>
                    </div>
                    <Link to="/expenses" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-xl transition-all group">
                        <Receipt size={32} className="text-emerald-400 group-hover:text-emerald-600 mb-3" />
                        <span className="font-bold text-slate-700 text-center">J'ai fait une dépense</span>
                    </Link>
                    <div onClick={handleDownloadAttestation} className="cursor-pointer flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl transition-all group">
                        <FileText size={32} className="text-blue-400 group-hover:text-blue-600 mb-3" />
                        <span className="font-bold text-slate-700 text-center">J'ai besoin d'une attestation</span>
                    </div>
                    <div onClick={() => { setIsAbsenceModalOpen(true); setAbsenceForm({...absenceForm, type: "Demande d'autorisation"}); }} className="cursor-pointer flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-rose-50 border border-slate-100 rounded-xl transition-all group">
                        <Heart size={32} className="text-rose-400 group-hover:text-rose-600 mb-3" />
                        <span className="font-bold text-slate-700 text-center">Autorisation d'absence</span>
                    </div>
                </div>
            </div>

            {/* Privacy Section Highlight - Keep this as it's a good feature */}
             <div className="mt-8 bg-slate-900 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-lg">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck size={120} />
                </div>
                <div className="relative z-10 space-y-2 mb-6 md:mb-0 max-w-2xl">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" />
                        Confidentialité Garantie
                    </h3>
                    <p className="text-slate-300 text-sm md:text-base">
                        Vos demandes d'assistance sociale sont gérées de manière sécurisée et confidentielle par le service dédié.
                    </p>
                </div>
            </div>

            {/* Modal Absence / Autorisation */}
            <AnimatePresence>
                {isAbsenceModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                                <h3 className="text-xl font-bold">Déclarer une Absence</h3>
                                <button onClick={() => setIsAbsenceModalOpen(false)} className="text-white/80 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAbsenceSubmit} className="p-8 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Type de demande</label>
                                    <select 
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                        value={absenceForm.type}
                                        onChange={(e) => setAbsenceForm({...absenceForm, type: e.target.value})}
                                    >
                                        <option value="Absence injustifiée">Absence (déjà passée)</option>
                                        <option value="Demande d'autorisation">Autorisation d'absence (future)</option>
                                        <option value="Retard">Signalement de retard</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                        value={absenceForm.date}
                                        onChange={(e) => setAbsenceForm({...absenceForm, date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Justification / Commentaire</label>
                                    <textarea 
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-slate-700"
                                        placeholder="Précisez le motif..."
                                        value={absenceForm.justification}
                                        onChange={(e) => setAbsenceForm({...absenceForm, justification: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Pièce jointe (JPEG, PDF)</label>
                                    <input 
                                        type="file" 
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => setAbsenceForm({...absenceForm, file: e.target.files[0]})}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-200 mt-4 transition-all active:scale-95">
                                    Envoyer la demande
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
