import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ssoLoading, setSsoLoading] = useState(null);
    const [ssoSuccess, setSsoSuccess] = useState(null);

    const { login } = useAuth();
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

    const handleSSO = (provider) => {
        setSsoLoading(provider);
        setSsoSuccess(null);
        setTimeout(() => {
            setSsoLoading(null);
            setSsoSuccess(provider);
            setTimeout(() => setSsoSuccess(null), 4000);
        }, 2000);
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
                        {/* SSO Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleSSO('Google')}
                                disabled={!!ssoLoading}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 disabled:opacity-60 transition-colors"
                            >
                                {ssoLoading === 'Google' ? <Loader2 size={16} className="animate-spin" /> : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                )}
                                {ssoLoading === 'Google' ? 'Redirection...' : 'Google Workspace'}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSSO('Microsoft')}
                                disabled={!!ssoLoading}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 disabled:opacity-60 transition-colors"
                            >
                                {ssoLoading === 'Microsoft' ? <Loader2 size={16} className="animate-spin" /> : (
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                                        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                                        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                                        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                                    </svg>
                                )}
                                {ssoLoading === 'Microsoft' ? 'Redirection...' : 'Microsoft 365'}
                            </button>
                        </div>

                        <AnimatePresence>
                            {ssoSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-3"
                                >
                                    <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                                    <span>SSO {ssoSuccess} simulé avec succès. En production, vous seriez redirigé vers le portail d'identité {ssoSuccess}.</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-700"></div>
                            <span className="text-xs text-slate-500 shrink-0">ou connexion classique</span>
                            <div className="h-px flex-1 bg-slate-700"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-rose-400 bg-rose-900/30 border border-rose-700/50 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input
                                        type="email"
                                        required
                                        placeholder="admin@sirh.com"
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

                        <div className="text-center text-xs text-slate-600 border-t border-slate-800 pt-4 space-y-1">
                            <p>Comptes test : <span className="text-slate-400 font-mono">admin@</span>, <span className="text-slate-400 font-mono">drh@</span>, <span className="text-slate-400 font-mono">rh1@sirh.com</span></p>
                            <p>Mot de passe : <span className="text-slate-400 font-mono">SIIRH</span></p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center justify-center gap-2 h-10 text-sm"
                            onClick={() => navigate('/ethics')}
                        >
                            <ShieldCheck size={16} /> Portail de Signalement Éthique
                        </Button>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-600 mt-6">
                    © {new Date().getFullYear()} SII · Système d'Information RH Enterprise
                </p>
            </motion.div>
        </div>
    );
}
