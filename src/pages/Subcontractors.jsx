import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Building, Factory, Plus } from 'lucide-react';
import { api } from '../lib/api.js';

export function Subcontractors() {
    const [subcontractors, setSubcontractors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubcontractors();
    }, []);

    const loadSubcontractors = async () => {
        try {
            const res = await api.get('/subcontractors');
            setSubcontractors(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const firstName = window.prompt("Prénom du contact ?");
        if (!firstName) return;
        const lastName = window.prompt("Nom du contact ?");
        const companyName = window.prompt("Entreprise / Cabinet ?");
        if (firstName && lastName && companyName) {
            try {
                await api.post('/subcontractors', { 
                    firstName, 
                    lastName, 
                    companyName, 
                    startDate: new Date(), 
                    type: "Freelance" 
                });
                loadSubcontractors();
            } catch (err) {
                console.error(err);
                alert("Erreur lors de la création.");
            }
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Flex-Workforce</h2>
                    <p className="text-slate-500 mt-2">Gestion des sous-traitants, intérimaires et freelances hors-paie.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                    <Plus size={16} /> Nouveau contrat externe
                </button>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2 text-sky-800">
                        <Building size={18} /> Registre du Personnel Externe
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Nom Complet</th>
                                <th className="px-6 py-4">Société / ESN</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Début</th>
                                <th className="px-6 py-4 text-right">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcontractors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Aucun travailleur externe enregistré.</td>
                                </tr>
                            ) : (
                                subcontractors.map(s => (
                                    <tr key={s.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-800">{s.firstName} {s.lastName}</td>
                                        <td className="px-6 py-4 flex items-center gap-2"><Factory size={14} className="text-slate-400" /> {s.companyName}</td>
                                        <td className="px-6 py-4">{s.type}</td>
                                        <td className="px-6 py-4">{new Date(s.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${s.status === 'Active' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
