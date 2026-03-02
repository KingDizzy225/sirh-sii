import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Lock, Mail } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg -rotate-6 transform hover:rotate-0 transition-transform cursor-pointer">
                        <span className="text-white font-bold text-2xl">SII</span>
                    </div>
                    <h1 className="mt-4 text-3xl font-bold text-slate-900">SIRH Entreprise</h1>
                    <p className="text-slate-500 mt-2">Connectez-vous à votre espace personnel</p>
                </div>

                <Card className="shadow-xl border-slate-200">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center">Authentification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Adresse Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <Input
                                        type="email"
                                        required
                                        placeholder="admin@sirh.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <Input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Connexion en cours...' : 'Se Connecter'}
                            </Button>

                            <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
                                Comptes de test : <br />
                                <span className="font-semibold text-slate-700">admin@sirh.com</span> ou <span className="font-semibold text-slate-700">drh@sirh.com</span><br />
                                Mot de passe : <span className="font-semibold text-slate-700">sirh</span>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
