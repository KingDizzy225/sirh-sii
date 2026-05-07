import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { SignaturePad } from '../components/ui/SignaturePad';
import { ShieldCheck, FileText, CheckCircle2, Building, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function PublicSignature() {
    const { id } = useParams();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState(null);
    const sigPadRef = useRef(null);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const res = await fetch(`${API_URL}/api/documents/public/${id}`);
                if (res.ok) {
                    setDocument(await res.json());
                } else {
                    const data = await res.json();
                    setError(data.error || "Document introuvable ou lien expiré.");
                }
            } catch (err) {
                setError("Impossible de joindre le serveur.");
            } finally {
                setLoading(false);
            }
        };

        fetchDocument();
    }, [id]);

    const clearSignature = () => {
        setSignatureDataUrl(null);
    };

    const handleSign = async () => {
        if (!signatureDataUrl) {
            alert('Veuillez dessiner votre signature avant de valider.');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/api/documents/public/${id}/sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ signatureDataUrl })
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                alert("Erreur lors de l'enregistrement de la signature.");
            }
        } catch (error) {
            console.error("Signature error", error);
            alert("Erreur serveur lors de la signature.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <span className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></span>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <ShieldCheck size={48} className="mx-auto text-rose-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Lien Invalide</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <p className="text-sm text-slate-400">Veuillez contacter le service RH pour obtenir un nouveau lien.</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4"
                >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Document Signé !</h2>
                    <p className="text-slate-600">
                        Votre signature a bien été apposée sur le document avec un horodatage sécurisé.
                    </p>
                    <p className="text-sm text-slate-500">
                        Vous pouvez maintenant fermer cette page. Une copie vous sera envoyée par le service RH.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Navbar simplifiée */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Building size={20} />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">SIRH<span className="text-indigo-600">-SII</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-100">
                        <ShieldCheck size={16} /> Connexion Sécurisée
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">Signature Électronique</h1>
                    <p className="text-slate-600 mt-2">Veuillez lire le document ci-dessous et apposer votre signature.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* Colonne Gauche: Aperçu du document */}
                    <Card className="shadow-lg border-0 overflow-hidden">
                        <CardHeader className="bg-slate-100 border-b border-slate-200">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText size={20} className="text-indigo-600" /> 
                                {document.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 bg-slate-200/50 flex flex-col items-center justify-center min-h-[400px]">
                            <div className="p-4 text-center">
                                <div className="bg-white p-6 shadow-md rounded border border-slate-200 w-full max-w-[300px] aspect-[1/1.4] mx-auto flex flex-col items-center justify-center mb-4">
                                    <FileText size={48} className="text-slate-300 mb-2" />
                                    <p className="text-sm font-medium text-slate-500">Aperçu non disponible</p>
                                </div>
                                <a 
                                    href={`${API_URL}${document.filePath}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium text-sm flex items-center justify-center gap-1"
                                >
                                    Télécharger le document PDF original
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Colonne Droite: Espace Signature */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                            <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                                <PenTool size={20} className="text-indigo-600" />
                                Votre Signature
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-700">Signataire :</p>
                                <p className="text-lg font-bold text-slate-900">{document.employee?.firstName} {document.employee?.lastName}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-medium text-slate-700">Dessinez votre signature ci-dessous :</label>
                                    <button onClick={clearSignature} className="text-xs text-rose-600 hover:underline">
                                        Effacer
                                    </button>
                                </div>
                                
                                <div className="border-2 border-dashed border-indigo-200 rounded-xl bg-white overflow-hidden shadow-inner p-2">
                                    <SignaturePad onSign={setSignatureDataUrl} />
                                </div>
                                <p className="text-xs text-slate-400">
                                    En signant, vous acceptez les termes du document. Cette signature a une valeur légale.
                                </p>
                            </div>

                            <Button 
                                onClick={handleSign} 
                                disabled={isSubmitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-bold rounded-xl shadow-lg shadow-emerald-200"
                            >
                                {isSubmitting ? 'Traitement en cours...' : 'Approuver et Signer'}
                            </Button>

                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
