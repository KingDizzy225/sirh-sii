import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { HeartPulse, ShieldCheck, FilePlus } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext';

export function Benefits() {
    const { user } = useAuth();
    const [benefits, setBenefits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBenefits();
    }, []);

    const loadBenefits = async () => {
        try {
            const res = await api.get('/benefits');
            setBenefits(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBenefit = async () => {
        const provider = window.prompt("Nom de la mutuelle ou assurance souhaitée ?");
        if (!provider) return;
        const planLevel = window.prompt("Niveau concerné (Ex: Famille, Isolé) ?");
        
        if (provider) {
            try {
                // If user doesn't have an ID available easily, we assume the backend gets it from token?
                // Wait, our backend requires employeeId in body for Benefits, but 'user.employeeId' is in auth context.
                const empId = user?.employeeId || user?.id; // Attempt to use the user's ID
                await api.post('/benefits/enroll', {
                    employeeId: empId,
                    type: "Mutuelle",
                    provider,
                    planLevel: planLevel || "Individuel"
                });
                alert("Demande envoyée avec succès.");
                loadBenefits();
            } catch (err) {
                console.error(err);
                alert("Erreur lors de la demande d'adhésion.");
            }
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;

    const isAdmin = user?.role === 'Administrator' || user?.role === 'HR';

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Assurance & Mutuelle</h2>
                    <p className="text-slate-500 mt-2">Gérez la couverture santé et prévoyance institutionnelle.</p>
                </div>
                {!isAdmin && (
                    <button 
                        onClick={handleAddBenefit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <FilePlus size={16} /> Demander une adhésion Familiale
                    </button>
                )}
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                    <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                        <HeartPulse className="text-emerald-500" size={18} /> {isAdmin ? 'Suivi des Adhésions' : 'Ma Couverture Active'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {benefits.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Aucune couverture santé détectée dans la base de données.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {benefits.map(b => (
                                <div key={b.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{b.provider} - {b.planLevel}</h3>
                                            <p className="text-slate-500 text-sm">{b.type} {isAdmin && `| Bénéficiaire: ${b.employee?.firstName} ${b.employee?.lastName}`}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${b.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {b.status}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-2">Adhésion: {new Date(b.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
