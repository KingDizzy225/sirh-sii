import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Lock, Mail, ShieldCheck, Loader2, Users } from 'lucide-react';
import { ServerStatus } from '../components/ui/ServerStatus';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(
        new URLSearchParams(window.location.search).has('expired')
            ? 'Votre session a expiré. Veuillez vous reconnecter.'
            : null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ssoEtat, setSsoEtat] = useState(null); // null = en cours de lecture
    const boutonGoogle = useRef(null);
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
        e.preventDefault();
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

    /**
     * Authentification Google Workspace.
     *
     * Les deux boutons précédents — « Google Workspace » et « Microsoft 365 » —
     * ne faisaient rien : deux secondes d'animation, puis un message. Sur un
     * écran de connexion, un bouton qui n'authentifie pas est le pire endroit
     * pour une façade.
     *
     * Le bouton n'apparaît que si le serveur est configuré : mieux vaut aucun
     * bouton qu'un bouton mort.
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
                theme: 'filled_black', size: 'large', width: 320,
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        className="h-16 w-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30"
                        whileHover={{ rotate: 6, scale: 1.05 }}
                    >
                        <span className="text-white font-bold text-2xl">SII</span>
                    </motion.div>
                    <h1 className="mt-4 text-3xl font-bold text-white">SIIRH Entreprise</h1>
                    <p className="text-blue-300/80 mt-2 text-sm">Connectez-vous à votre espace de travail</p>
                </div>

                <Card className="shadow-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-center text-white">Authentification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Status du Serveur Render */}
                        <div className="mb-4">
                            <ServerStatus />
                        </div>

                        {ssoEtat && ssoEtat.actif && (
                            <div className="flex flex-col items-center gap-2">
                                <div ref={boutonGoogle}></div>
                                {ssoEtat.domaineRestreint ? (
                                    <p className="text-[11px] text-slate-500">
                                        Comptes @{ssoEtat.domaine} uniquement.
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-amber-400">
                                        Aucun domaine n'est restreint sur ce serveur : tout compte Google
                                        rattaché à un dossier salarié peut se connecter.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-700"></div>
                            <span className="text-xs text-slate-500 shrink-0">ou avec un mot de passe</span>
                            <div className="h-px flex-1 bg-slate-700"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                /* Un refus de rôle n'est pas une erreur de saisie : le compte
                                   existe et le mot de passe était bon. On oriente vers le
                                   portail au lieu de laisser recommencer indéfiniment. */
                                <div className={`p-3 text-sm rounded-lg border ${
                                    /ressources humaines/i.test(error)
                                        ? 'text-amber-200 bg-amber-900/30 border-amber-700/50'
                                        : 'text-rose-400 bg-rose-900/30 border-rose-700/50'
                                }`}>
                                    {error}
                                    {/ressources humaines/i.test(error) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setError(null);
                                                setIsPortalOpen(true);
                                            }}
                                            className="block mt-2 font-semibold underline underline-offset-2 text-amber-100 hover:text-white"
                                        >
                                            Ouvrir le portail des salariés
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input
                                        type="email"
                                        required
                                        placeholder="votre.email@entreprise.com"
                                        className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 h-11 text-base font-semibold shadow-lg shadow-blue-500/20"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <><Loader2 size={18} className="mr-2 animate-spin" /> Connexion...</> : 'Se Connecter'}
                            </Button>
                        </form>

                        {demoMode && (
                            <button
                                type="button"
                                onClick={async () => { await loginAsDemo(); navigate('/'); }}
                                className="w-full text-xs font-semibold text-amber-400/80 hover:text-amber-300 border border-dashed border-amber-700/40 hover:border-amber-600/60 rounded-lg py-2.5 transition-colors"
                            >
                                Accès démonstration (sans identifiants)
                            </button>
                        )}

                        <div className="flex flex-col gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-2 h-10 text-sm"
                                onClick={() => navigate('/portal')}
                            >
                                <Users size={16} /> Self Service Employé (Demande RH)
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center justify-center gap-2 h-10 text-sm"
                                onClick={() => navigate('/ethics')}
                            >
                                <ShieldCheck size={16} /> Portail de Signalement Éthique
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-600 mt-6">
                    © {new Date().getFullYear()} SII · Système d'Information RH Enterprise
                </p>
            </motion.div>

            {/* Modal Self-Service Public */}
            <AnimatePresence>
                {isPortalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold">Guichet Libre-Service</h3>
                                    <p className="text-blue-100 text-xs">Réservé aux employés SII sans accès applicatif</p>
                                </div>
                                <button onClick={() => setIsPortalOpen(false)} className="text-white/80 hover:text-white">
                                    <Loader2 className="rotate-45" size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handlePortalSubmit} className="p-8 space-y-5">
                                {portalStatus === 'success' ? (
                                    <div className="text-center py-10 space-y-4">
                                        <div className="h-20 w-20 bg-emerald-500/20 text-emerald-500 rounded-full mx-auto flex items-center justify-center">
                                            <ShieldCheck size={40} />
                                        </div>
                                        <h4 className="text-xl font-bold text-white">Demande Transmise !</h4>
                                        <p className="text-slate-400">Votre justificatif a été envoyé avec succès au service RH.</p>
                                    </div>
                                ) : (
                                    <>
                                        {portalForm.type === 'Pointage' ? (
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-400">Votre Nom et Prénom</label>
                                                <Input 
                                                    type="text" 
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                    placeholder="Ex: Jean Dupont"
                                                    value={portalForm.name}
                                                    onChange={(e) => setPortalForm({...portalForm, name: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-400">Votre Email Professionnel</label>
                                                <Input 
                                                    type="email" 
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                    placeholder="nom.prenom@sii-ci.com"
                                                    value={portalForm.email}
                                                    onChange={(e) => setPortalForm({...portalForm, email: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-400">Type de demande</label>
                                            <select 
                                                className="w-full bg-slate-800 border-slate-700 text-white p-2.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                value={portalForm.type}
                                                onChange={(e) => setPortalForm({...portalForm, type: e.target.value})}
                                            >
                                                <option value="Pointage">Pointage (Je suis là)</option>
                                                <option value="Absence injustifiée">Justificatif d'absence</option>
                                                <option value="Demande d'autorisation">Autorisation d'absence</option>
                                                <option value="Retard">Signalement de retard</option>
                                            </select>
                                        </div>

                                        {portalForm.type !== 'Pointage' && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-400">Date</label>
                                                    <Input 
                                                        type="date" 
                                                        className="bg-slate-800 border-slate-700 text-white"
                                                        value={portalForm.date}
                                                        onChange={(e) => setPortalForm({...portalForm, date: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-400">Commentaire</label>
                                                    <textarea 
                                                        className="w-full bg-slate-800 border-slate-700 text-white p-3 rounded-xl text-sm h-20 outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Précisez le motif..."
                                                        value={portalForm.justification}
                                                        onChange={(e) => setPortalForm({...portalForm, justification: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-400">Justificatif (JPEG, PNG, PDF)</label>
                                                    <input 
                                                        type="file" 
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        onChange={(e) => setPortalForm({...portalForm, file: e.target.files[0]})}
                                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <Button 
                                            type="submit" 
                                            disabled={portalStatus === 'loading'}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl text-lg font-bold shadow-lg shadow-blue-500/20 mt-4 transition-all"
                                        >
                                            {portalStatus === 'loading' ? <Loader2 className="animate-spin" /> : 'Transmettre au RH'}
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
