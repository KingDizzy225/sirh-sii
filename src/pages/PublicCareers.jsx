import React, { useState } from 'react';
import { Briefcase, Upload, CheckCircle2, ChevronRight, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function PublicCareers() {
    const [cvFile, setCvFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cvFile) {
            setError("Veuillez sélectionner un CV (PDF).");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', cvFile);
        // On pourrait ajouter d'autres champs ici, mais l'IA va tout extraire !

        try {
            const res = await fetch(`${API_URL}/api/recruitment/public-apply`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                const data = await res.json();
                setError(data.error || "Une erreur est survenue lors de l'envoi.");
            }
        } catch (err) {
            console.error("Error submitting application", err);
            setError("Impossible de contacter le serveur. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Candidature Reçue !</h2>
                    <p className="text-slate-600">
                        Votre CV a été transmis à notre équipe de recrutement. Notre IA a déjà commencé à analyser votre profil.
                    </p>
                    <p className="text-sm text-slate-500">
                        Nous vous recontacterons très prochainement.
                    </p>
                    <button onClick={() => window.location.href = '/'} className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full">
                        Retour au site principal
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Navbar simplifiée */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Building size={20} />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">SIRH<span className="text-indigo-600">-SII</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Notre Entreprise</a>
                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Nos Valeurs</a>
                    </nav>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-12 items-center">
                
                {/* Left Side: Presentation */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-2">
                        <Briefcase size={16} /> Rejoignez-nous
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                        Faites décoller votre carrière.
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Déposez simplement votre CV. Notre système intelligent se charge d'analyser vos compétences et de vous proposer les meilleures opportunités au sein de nos équipes.
                    </p>
                    
                    <div className="space-y-4 pt-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-1 rounded text-emerald-600 mt-1"><CheckCircle2 size={16} /></div>
                            <div>
                                <h4 className="font-bold text-slate-800">Candidature en 1 clic</h4>
                                <p className="text-slate-500 text-sm">Pas de formulaire à rallonge. L'IA extrait vos informations directement de votre CV.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-1 rounded text-emerald-600 mt-1"><CheckCircle2 size={16} /></div>
                            <div>
                                <h4 className="font-bold text-slate-800">Matching Intelligent</h4>
                                <p className="text-slate-500 text-sm">Nous faisons le lien entre vos compétences et nos besoins en temps réel.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Upload Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8"
                >
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Candidature Spontanée</h3>
                    
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium border border-rose-100">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Votre CV (PDF)</label>
                            <label className={`block border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${cvFile ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50 hover:border-indigo-400'}`}>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf" 
                                    onChange={(e) => setCvFile(e.target.files[0])} 
                                />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${cvFile ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                                    <Upload size={24} />
                                </div>
                                {cvFile ? (
                                    <>
                                        <p className="text-base font-bold text-indigo-900">{cvFile.name}</p>
                                        <p className="text-sm text-indigo-600 mt-1">Cliquez pour modifier</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-base font-bold text-slate-900">Cliquez ou glissez votre CV ici</p>
                                        <p className="text-sm text-slate-500 mt-1">Format PDF uniquement (Max 5Mo)</p>
                                    </>
                                )}
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!cvFile || isSubmitting}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium transition-all ${!cvFile ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg shadow-indigo-200'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    Analyse en cours...
                                </>
                            ) : (
                                <>Envoyer ma candidature <ChevronRight size={18} /></>
                            )}
                        </button>
                        
                        <p className="text-xs text-center text-slate-400">
                            En postulant, vous acceptez notre politique de confidentialité concernant le traitement de vos données.
                        </p>
                    </form>
                </motion.div>

            </main>
        </div>
    );
}
