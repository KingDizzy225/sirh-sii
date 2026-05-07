import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, FileText, Receipt, Heart, Clock, ArrowRight, ShieldCheck, DollarSign, User, CheckCircle2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function EmployeePortal() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [logs, setLogs] = useState([]);
    const [isClocking, setIsClocking] = useState(false);

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

            {/* Accès Rapides */}
            <h3 className="text-lg font-bold tracking-tight text-slate-800 mt-10 mb-4">
                Liens Rapides
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link to="/expenses" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Notes de frais</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Soumettre une dépense</p>
                    </div>
                </Link>
                
                <Link to="/social-support" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-110 transition-transform">
                        <Heart size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Assistance Sociale</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Aide confidentielle</p>
                    </div>
                </Link>

                <Link to="/documents" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Mes Documents</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Attestations & Contrats</p>
                    </div>
                </Link>

                <div onClick={handleDownloadAttestation} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-500 hover:shadow-md transition-all group cursor-pointer">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Attestation PDF</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Générer immédiatement</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-lg group-hover:scale-110 transition-transform">
                        <User size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Mon Profil</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Mettre à jour mes infos</p>
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
        </div>
    );
}
