import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, BookOpen, GraduationCap, X, Calendar, Clock, User, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { useAuth } from '../context/AuthContext';

export function Trainings() {
    const { user } = useAuth();
    const [trainings, setTrainings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Formulaire état
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    const fetchTrainings = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/trainings`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTrainings(data);
            }
        } catch (error) {
            console.error('Erreur de chargement des formations', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/employees`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error('Erreur de chargement des employés', error);
        }
    };

    useEffect(() => {
        Promise.all([fetchTrainings(), fetchEmployees()]).finally(() => setLoading(false));
    }, []);

    const toggleParticipant = (empId) => {
        setSelectedParticipants(prev =>
            prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
        );
    };

    const handleCreateTraining = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const payload = {
            title: formData.get('title'),
            description: formData.get('description'),
            trainerName: formData.get('trainerName'),
            date: formData.get('date'),
            durationHours: parseFloat(formData.get('durationHours')),
            participantIds: selectedParticipants
        };

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/trainings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('sirh_token')}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Succès : rafraîchir et fermer
                await fetchTrainings();
                setIsAddModalOpen(false);
                setSelectedParticipants([]);
            } else {
                const data = await res.json();
                alert(data.error || 'Erreur lors de l\'ajout de la formation');
            }
        } catch (error) {
            alert('Erreur serveur de communication');
        }
    };

    const handleExport = () => {
        if (trainings.length === 0) return alert('Aucune formation à exporter.');
        const csv = Papa.unparse(trainings.map(t => ({
            "Titre": t.title,
            "Formateur": t.trainerName,
            "Date": new Date(t.date).toLocaleDateString('fr-FR'),
            "Durée (H)": t.durationHours,
            "Nombre de participants": t.participations.length
        })));
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Cahier_Formation_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cahier de Formation</h1>
                    <p className="text-slate-500 mt-1">Gérez et consultez les modules de formation réalisés.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                        <Download size={18} />
                        Exporter CSV
                    </Button>
                    {['ADMIN', 'HR'].includes(user?.role) && (
                        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2">
                            <Plus size={18} />
                            Ajouter une formation
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : trainings.length === 0 ? (
                <Card className="text-center py-16 px-4 bg-slate-50 border-dashed">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune formation enregistrée</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Le cahier de formation est vide. Cliquez sur "Ajouter une formation" pour tracer les modules passés.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {trainings.map(training => (
                        <Card key={training.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b px-6 py-4 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <GraduationCap className="text-blue-600" size={20} />
                                        {training.title}
                                    </h3>
                                    {training.description && <p className="text-sm text-slate-600 mt-1">{training.description}</p>}
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">
                                    Effectuée
                                </span>
                            </div>
                            <CardContent className="p-0">
                                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                                    <div className="p-6 col-span-1 space-y-4">
                                        <div className="flex items-center text-sm text-slate-600 gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User size={16} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Formateur</p>
                                                <p className="font-semibold text-slate-900">{training.trainerName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <Calendar size={16} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Date de réalisation</p>
                                                <p className="font-medium">{new Date(training.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                                <Clock size={16} className="text-purple-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Volume Horaire</p>
                                                <p className="font-medium">{training.durationHours} Heures</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 col-span-2 bg-slate-50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Apprenants Ayant Suivi le Module ({training.participations.length})</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {training.participations.map(p => (
                                                <div key={p.id} className="bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                                                        {p.employee.firstName[0]}{p.employee.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-900">{p.employee.firstName} {p.employee.lastName}</p>
                                                        <p className="text-[10px] text-slate-500">{p.employee.department}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {training.participations.length === 0 && (
                                                <p className="text-sm text-slate-500 italic">Aucun participant enregistré.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal de Création de Formation */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
                        >
                            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl pointer-events-auto overflow-hidden">
                                <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between py-4">
                                    <div>
                                        <CardTitle className="text-lg">Ajouter une session au Cahier</CardTitle>
                                        <CardDescription>Tracer une formation ayant déjà été effectuée.</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" className="-mr-2 text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setIsAddModalOpen(false)}>
                                        <X size={20} />
                                    </Button>
                                </CardHeader>

                                <form onSubmit={handleCreateTraining} className="flex-1 overflow-auto flex flex-col">
                                    <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-sm font-medium text-slate-700">Titre du Module de Formation</label>
                                                <Input required name="title" placeholder="Ex: Formation SSI, Management Sensible..." />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-sm font-medium text-slate-700">Description (Optionnel)</label>
                                                <Input name="description" placeholder="Contexte ou détails sur la formation..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Nom du Formateur / Cabinet</label>
                                                <Input required name="trainerName" placeholder="Ex: Cabinet ABC ou Jane Doe" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Date de Réalisation</label>
                                                <Input required name="date" type="date" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Volume Horaire (Heures)</label>
                                                <Input required name="durationHours" type="number" step="0.5" placeholder="Ex: 8" />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-sm font-bold text-slate-900">Sélectionner les Apprenants Formés</label>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{selectedParticipants.length} sélectionnés</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                                {employees.map(emp => (
                                                    <label key={emp.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedParticipants.includes(emp.id) ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                                            checked={selectedParticipants.includes(emp.id)}
                                                            onChange={() => toggleParticipant(emp.id)}
                                                        />
                                                        <div>
                                                            <div className="font-medium text-sm text-slate-900">{emp.firstName} {emp.lastName}</div>
                                                            <div className="text-xs text-slate-500">{emp.positionTitle}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <div className="border-t bg-slate-50 p-4 flex justify-end gap-3 shrink-0">
                                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
                                        <Button type="submit" disabled={selectedParticipants.length === 0} className="bg-blue-600 text-white hover:bg-blue-700">
                                            Enregistrer la Formation
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
