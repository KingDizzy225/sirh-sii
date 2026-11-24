import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { 
    Lock, Mail, ShieldCheck, Loader2, Users, Eye, EyeOff, 
    ArrowRight, ShieldAlert, Sparkles, KeyRound
} from 'lucide-react';
import { ServerStatus } from '../components/ui/ServerStatus';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(
        new URLSearchParams(window.location.search).has('expired')
            ? 'Votre session a expiré. Veuillez vous reconnecter.'
            : null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ssoEtat, setSsoEtat] = useState(null); // null = en cours de lecture
    const boutonGoogle = useRef(null);

    // Modal Self-Service Public express intégré
    const [isPortalOpen, setIsPortalOpen] = useState(false);
    const [portalForm, setPortalForm] = useState({
        email: '',
        name: '',
        type: 'Absence injustifiée',
        date: new Date().toISOString().split('T')[0],
        justification: '',
        file: null
    });
    const [portalStatus, setPortalStatus] = useState(null);

    const { login, loginAsDemo, loginAvecGoogle, demoMode } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setIsSubmitting(false);
    };

    // Remplissage rapide par profil de test pour l'ergonomie
    const handleQuickPersona = (pEmail, pPassword) => {
        setEmail(pEmail);
        setPassword(pPassword);
        setError(null);
    };

    /**
     * Authentification Google Workspace.
     */
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        let vivant = true;

        fetch(`${API_URL}/api/auth/sso`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { if (vivant) setSsoEtat(d || { actif: false }); })
            .catch(() => { if (vivant) setSsoEtat({ actif: false }); });

        return () => { vivant = false; };
    }, []);

    useEffect(() => {
        if (!ssoEtat || !ssoEtat.actif || !ssoEtat.clientId) return;

        const rendre = () => {
            if (!window.google || !boutonGoogle.current) return;
            window.google.accounts.id.initialize({
                client_id: ssoEtat.clientId,
                callback: async (reponse) => {
                    setError('');
                    const resultat = await loginAvecGoogle(reponse.credential);
                    if (resultat.success) navigate('/');
                    else setError(resultat.error);
                }
            });
            window.google.accounts.id.renderButton(boutonGoogle.current, {
                theme: 'outline', size: 'large', width: 320,
                text: 'signin_with', locale: 'fr'
            });
        };

        if (window.google && window.google.accounts) { rendre(); return; }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = rendre;
        script.onerror = () => setError("Le service d'authentification Google est injoignable.");
        document.head.appendChild(script);
    }, [ssoEtat, loginAvecGoogle, navigate]);

    const handlePortalSubmit = async (e) => {
        e.preventDefault();
        setPortalStatus('loading');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        if (portalForm.type === 'Pointage') {
            try {
                const res = await fetch(`${API_URL}/api/public/clock-in`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: portalForm.name })
                });
                if (res.ok) {
                    setPortalStatus('success');
                    setTimeout(() => { setIsPortalOpen(false); setPortalStatus(null); }, 3000);
                } else {
                    const data = await res.json();
                    setError(data.error || "Erreur lors du pointage.");
                    setPortalStatus('error');
                }
            } catch (err) {
                setPortalStatus('error');
            }
            return;
        }

        const formData = new FormData();
        formData.append('email', portalForm.email);
        formData.append('type', portalForm.type);
        formData.append('date', portalForm.date);
        formData.append('justification', portalForm.justification);
        if (portalForm.file) {
            formData.append('justificatif', portalForm.file);
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/absences/public`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                setPortalStatus('success');
                setTimeout(() => { setIsPortalOpen(false); setPortalStatus(null); }, 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Erreur lors de l'envoi.");
                setPortalStatus('error');
            }
        } catch (err) {
            setPortalStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center relative overflow-hidden font-sans selection:bg-[#002B7F] selection:text-white">
            
            {/* Arrière-plan moderne en THÈME CLAIR (Lueur subtile aux couleurs du logo : Bleu Marine #002B7F et Vert #008000) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 left-1/4 w-[36rem] h-[36rem] bg-sky-500/10 rounded-full blur-3xl"></div>
                <div 
                    className="absolute inset-0 opacity-[0.035]" 
                    style={{ 
                        backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', 
                        backgroundSize: '24px 24px' 
                    }}
                ></div>
            </div>

            {/* Container principal centré (Thème Clair épuré sans texte superflu) */}
            <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
                
                {/* Logo de l'Entreprise & En-tête Institutionnel */}
                <motion.div 
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-6 w-full flex flex-col items-center"
                >
                    <div className="p-3.5 px-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs inline-flex items-center justify-center mb-3.5">
                        <img 
                            src="/logo.png" 
                            alt="Logo SII" 
                            className="h-14 sm:h-16 w-auto object-contain" 
                        />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Système d'Information RH
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        SII Côte d'Ivoire · Espace d'Authentification Sécurisé
                    </p>
                </motion.div>

                {/* ======================================================== */}
                {/* Console d'Identification (Thème Clair aux Couleurs SII)  */}
                {/* ======================================================== */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full"
                >
                    <Card className="shadow-xl shadow-slate-200/70 border border-slate-200 bg-white rounded-3xl overflow-hidden">
                        
                        {/* En-tête de la Console */}
                        <div className="p-6 sm:p-7 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Connexion Sécurisée</h2>
                                    <p className="text-xs text-slate-500">Console d'administration RH & Finance</p>
                                </div>
                                <ServerStatus />
                            </div>
                        </div>

                        <CardContent className="p-6 sm:p-7 pt-5 space-y-5">
                            
                            {/* SSO Google si configuré */}
                            {ssoEtat && ssoEtat.actif && (
                                <div className="space-y-3">
                                    <div className="flex justify-center">
                                        <div ref={boutonGoogle}></div>
                                    </div>
                                    <div className="relative flex items-center justify-center">
                                        <div className="border-t border-slate-200 w-full"></div>
                                        <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            ou avec vos identifiants
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Alerte Erreur / Expiration */}
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                                        /ressources humaines/i.test(error)
                                            ? 'text-amber-900 bg-amber-50 border-amber-200'
                                            : 'text-rose-900 bg-rose-50 border-rose-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <ShieldAlert size={16} className="shrink-0 mt-0.5 text-rose-600" />
                                        <div className="flex-1">
                                            <span>{error}</span>
                                            {/ressources humaines/i.test(error) && (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/portal')}
                                                    className="block mt-2 font-bold underline underline-offset-2 text-amber-800 hover:text-amber-950"
                                                >
                                                    Accéder au Guichet Collaborateur →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Formulaire de Connexion en Thème Clair */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Adresse Email Professionnelle
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <Input
                                            type="email"
                                            required
                                            placeholder="prenom.nom@sii-ci.com"
                                            className="pl-10 h-11 bg-slate-50/70 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-[#002B7F] focus:ring-2 focus:ring-[#002B7F]/10 transition-all text-sm font-medium"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Mot de passe
                                        </label>
                                        <span className="text-[11px] text-slate-400 font-medium cursor-default">
                                            Conforme ISO 27001
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="••••••••••••"
                                            className="pl-10 pr-10 h-11 bg-slate-50/70 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-[#002B7F] focus:ring-2 focus:ring-[#002B7F]/10 transition-all text-sm font-medium"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#002B7F] hover:bg-[#002060] text-white h-12 text-sm font-bold shadow-lg shadow-blue-900/15 rounded-xl transition-all cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 size={18} className="mr-2 animate-spin" /> Connexion en cours...</>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Se Connecter à la Console <ArrowRight size={16} />
                                        </span>
                                    )}
                                </Button>
                            </form>

                            {/* Section Démo Express / Profils de Test Rapides */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <KeyRound size={13} className="text-amber-500" /> Profils Démo en 1 Clic
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleQuickPersona('admin@sirh.com', 'SIIRH')}
                                        className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 transition-all text-left group cursor-pointer"
                                    >
                                        <div className="text-xs font-bold text-[#002B7F]">Super Admin</div>
                                        <div className="text-[10px] text-slate-500 truncate">Plein accès</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleQuickPersona('drh@sirh.com', 'SIIRH')}
                                        className="p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 transition-all text-left group cursor-pointer"
                                    >
                                        <div className="text-xs font-bold text-emerald-700">Directeur RH</div>
                                        <div className="text-[10px] text-slate-500 truncate">Gouvernance</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleQuickPersona('manager1@sirh.com', 'SIIRH')}
                                        className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 transition-all text-left group cursor-pointer"
                                    >
                                        <div className="text-xs font-bold text-amber-700">Manager Agence</div>
                                        <div className="text-[10px] text-slate-500 truncate">Validation</div>
                                    </button>
                                </div>

                                {demoMode && (
                                    <button
                                        type="button"
                                        onClick={async () => { await loginAsDemo(); navigate('/'); }}
                                        className="w-full mt-2.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50/60 hover:bg-amber-100/60 border border-dashed border-amber-300 rounded-xl py-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Sparkles size={13} className="text-amber-500" /> Entrée Directe Démo (Sans mot de passe)
                                    </button>
                                )}
                            </div>

                            {/* Passerelles vers le Guichet Collaborateur & Éthique */}
                            <div className="pt-3 border-t border-slate-100 space-y-2">
                                <Button
                                    type="button"
                                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-between px-4 h-11 text-xs rounded-xl border border-slate-200 transition-all shadow-xs cursor-pointer"
                                    onClick={() => navigate('/portal')}
                                >
                                    <span className="flex items-center gap-2">
                                        <Users size={16} className="text-emerald-600" />
                                        <span>Guichet Collaborateur</span>
                                    </span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                        Sans mot de passe
                                    </span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-2 h-9 text-xs transition-colors cursor-pointer"
                                    onClick={() => navigate('/ethics')}
                                >
                                    <ShieldCheck size={14} className="text-[#002B7F]" />
                                    <span>Signalement Éthique & Alerte Professionnelle</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-slate-500 mt-5">
                        © {new Date().getFullYear()} SII Côte d'Ivoire · Système d'Information Ressources Humaines
                    </p>
                </motion.div>
            </div>

            {/* Modal Libre-Service Express Thème Clair */}
            <AnimatePresence>
                {isPortalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-[#002B7F] p-6 text-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain bg-white rounded-lg p-1" />
                                    <div>
                                        <h3 className="text-base font-bold">Guichet Libre-Service Express</h3>
                                        <p className="text-blue-100 text-xs">Collaborateurs sans accès applicatif console</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsPortalOpen(false)} 
                                    className="text-white/80 hover:text-white p-1 rounded-lg"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <form onSubmit={handlePortalSubmit} className="p-6 space-y-4">
                                {portalStatus === 'success' ? (
                                    <div className="text-center py-8 space-y-3">
                                        <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center border border-emerald-200">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">Demande Transmise !</h4>
                                        <p className="text-slate-500 text-xs">Votre justificatif a été transmis avec succès aux équipes RH.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700">Votre Email Professionnel</label>
                                            <Input 
                                                type="email" 
                                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl text-sm"
                                                placeholder="prenom.nom@sii-ci.com"
                                                value={portalForm.email}
                                                onChange={(e) => setPortalForm({...portalForm, email: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700">Type de Demande</label>
                                            <select 
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl text-sm outline-none focus:border-[#002B7F]"
                                                value={portalForm.type}
                                                onChange={(e) => setPortalForm({...portalForm, type: e.target.value})}
                                            >
                                                <option value="Absence injustifiée">Justificatif d'absence</option>
                                                <option value="Demande d'autorisation">Autorisation d'absence</option>
                                                <option value="Retard">Signalement de retard</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700">Date concernée</label>
                                            <Input 
                                                type="date" 
                                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl text-sm"
                                                value={portalForm.date}
                                                onChange={(e) => setPortalForm({...portalForm, date: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700">Commentaire & Justification</label>
                                            <textarea 
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl text-xs h-20 outline-none focus:border-[#002B7F]"
                                                placeholder="Précisez les circonstances..."
                                                value={portalForm.justification}
                                                onChange={(e) => setPortalForm({...portalForm, justification: e.target.value})}
                                            />
                                        </div>

                                        <Button 
                                            type="submit" 
                                            disabled={portalStatus === 'loading'}
                                            className="w-full bg-[#002B7F] hover:bg-[#002060] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/15 transition-all cursor-pointer"
                                        >
                                            {portalStatus === 'loading' ? <Loader2 className="animate-spin" size={16} /> : 'Transmettre au Guichet RH'}
                                        </Button>
                                    </>
                                )}
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
