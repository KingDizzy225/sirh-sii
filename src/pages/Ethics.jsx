import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ShieldAlert, Send } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext';

export function Ethics() {
    // Determine context: Public user or Admin
    const auth = useAuth();
    const isAdmin = auth?.user?.role === 'Administrator' || auth?.user?.role === 'HR';

    const [category, setCategory] = useState('Fraud');
    const [description, setDescription] = useState('');
    const [trackingId, setTrackingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // For Admin View
    const [reports, setReports] = useState([]);

    useEffect(() => {
        if (isAdmin) {
            loadReports();
        }
    }, [isAdmin]);

    const loadReports = async () => {
        try {
            const res = await api.get('/ethics');
            setReports(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/ethics/submit', { category, description });
            setTrackingId(res.data.trackingId);
            setDescription('');
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'envoi.");
        } finally {
            setSubmitting(false);
        }
    };

    if (isAdmin) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Admin: Signalements Éthiques</h2>
                        <p className="text-slate-500 mt-1">Ligne de conformité Loi Sapin 2 / Lanceur d'Alerte</p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Dossiers Confidentiels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reports.map((r) => (
                                <div key={r.id} className="p-4 border rounded-lg shadow-sm bg-white">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-700">ID: {r.trackingId}</span>
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">{r.category}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-2">{r.description}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-xs text-slate-400">Date: {new Date(r.createdAt).toLocaleString()}</span>
                                        <select 
                                            className="text-sm border p-1 rounded" 
                                            defaultValue={r.status}
                                            onChange={async (e) => {
                                                await api.put(`/ethics/${r.id}`, { status: e.target.value });
                                                loadReports();
                                            }}
                                        >
                                            <option value="Submitted">Soumis</option>
                                            <option value="Under Investigation">En enquête</option>
                                            <option value="Resolved">Résolu</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Public Form
    return (
        <div className="min-h-screen bg-slate-900 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <ShieldAlert className="mx-auto h-16 w-16 text-emerald-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Signalement Sécurisé & Anonyme</h2>
                    <p className="mt-2 text-sm text-slate-400">Protégez l'entreprise et vos collègues. Conformité garantie.</p>
                </div>
                
                {trackingId ? (
                    <Card className="bg-slate-800 text-white border-emerald-500/50">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-xl font-bold text-emerald-400 mb-4">Signalement Enregistré</h3>
                            <p className="mb-4">Conservez précieusement cet identifiant pour suivre l'avancée de votre dossier:</p>
                            <div className="bg-black/50 py-4 px-6 rounded-lg text-2xl font-mono tracking-widest text-emerald-300 select-all">
                                {trackingId}
                            </div>
                            <p className="mt-6 text-sm text-slate-400">Il n'est pas possible de récupérer ce code s'il est perdu.</p>
                            <button onClick={() => window.location.href='/login'} className="mt-8 text-emerald-400 hover:text-emerald-300">Retourner à l'accueil</button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-slate-100 border-b border-slate-700 pb-4">Soumettre une Alerte</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300">Catégorie</label>
                                    <select 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="mt-1 block w-full bg-slate-700 border-slate-600 text-white rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-3"
                                    >
                                        <option value="Fraud">Fraude financière ou corruption</option>
                                        <option value="Harassment">Harcèlement (moral, sexuel)</option>
                                        <option value="Safety">Atteinte à la sécurité / Environnement</option>
                                        <option value="Discrimination">Discrimination</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300">Description détaillée</label>
                                    <textarea
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        placeholder="Décrivez les faits avec un maximum de détails (dates, lieux, personnes). Ne donnez pas d'informations personnelles permettant de vous identifier si vous souhaitez rester anonyme."
                                        className="mt-1 block w-full bg-slate-700 border-slate-600 text-white rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-3"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 gap-2"
                                >
                                    {submitting ? 'Chiffrement et envoi...' : <><Send size={18} /> Transmettre en toute sécurité</>}
                                </button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
