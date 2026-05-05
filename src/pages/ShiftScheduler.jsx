import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Clock, Plus, Users } from 'lucide-react';
import { api } from '../lib/api.js';

export function ShiftScheduler() {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShifts();
    }, []);

    const loadShifts = async () => {
        try {
            const res = await api.get('/shifts');
            setShifts(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddShift = async () => {
        const employeeId = window.prompt("ID de l'employé pour le shift ?");
        if (!employeeId) return;
        const dateInput = window.prompt("Date du shift (ex: 2026-05-01) ?");
        const startTime = window.prompt("Heure de début (ex: 08:00) ?") || "08:00";
        const endTime = window.prompt("Heure de fin (ex: 16:00) ?") || "16:00";

        if (employeeId && dateInput) {
            try {
                await api.post('/shifts', {
                    employeeId: parseInt(employeeId) || employeeId,
                    date: dateInput,
                    startTime,
                    endTime,
                    type: "Morning"
                });
                loadShifts();
            } catch (err) {
                console.error(err);
                alert("Erreur ou Employé introuvable.");
            }
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Plannings & Shifts</h2>
                    <p className="text-slate-500 mt-2">Visibilité sur les rotations d'équipes.</p>
                </div>
                <button 
                    onClick={handleAddShift}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                    <Plus size={16} /> Créer un planning
                </button>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="text-indigo-500" size={18} /> Semaine en cours
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-7 gap-4">
                        {days.map((day, idx) => (
                            <div key={day} className="bg-white border text-center border-slate-200 rounded-lg p-4 min-h-[150px] shadow-sm flex flex-col">
                                <h3 className="font-semibold text-slate-700 mb-2 border-b pb-2">{day}</h3>
                                <div className="flex-1 flex flex-col gap-2 relative">
                                    {shifts.filter(s => new Date(s.date).getDay() === (idx + 1) % 7).map(s => (
                                        <div key={s.id} className={`p-2 rounded text-xs font-medium text-left border-l-4 ${s.type === 'Night' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-emerald-50 border-emerald-500 text-emerald-700'}`}>
                                            <p className="font-bold">{s.employee?.firstName} {s.employee?.lastName}</p>
                                            <p className="flex items-center gap-1 mt-1 opacity-80"><Clock size={10} /> {s.startTime} - {s.endTime}</p>
                                        </div>
                                    ))}
                                    {shifts.filter(s => new Date(s.date).getDay() === (idx + 1) % 7).length === 0 && (
                                        <p className="text-xs text-slate-400 italic">Aucun shift affecté.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
