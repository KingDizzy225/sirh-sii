import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
    ChevronLeft, 
    User, 
    Mail, 
    Briefcase, 
    Calendar, 
    Award, 
    Monitor, 
    TrendingUp, 
    Shield, 
    MapPin,
    Phone,
    Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export function EmployeeProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await fetch(`${API_URL}/api/employees/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!res.ok) {
                    throw new Error("Impossible de charger le profil de l'employé.");
                }
                
                const data = await res.json();
                setEmployee(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id, API_URL, token]);

    if (loading) {
        return (
            <div className="flex-1 p-8 flex justify-center items-center h-[calc(100vh-4rem)]">
                <span className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></span>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="flex-1 p-8">
                <div className="bg-red-50 text-red-700 p-6 rounded-lg flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-bold text-lg">Erreur</h3>
                        <p>{error || "Employé introuvable."}</p>
                    </div>
                    <Button onClick={() => navigate('/employees')} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                        Retour à l'annuaire
                    </Button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'ACTIVE': return 'success';
            case 'ON_LEAVE': return 'warning';
            case 'TERMINATED': return 'destructive';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'ACTIVE': return 'Actif';
            case 'ON_LEAVE': return 'En Congé';
            case 'TERMINATED': return 'Ancien';
            default: return status;
        }
    };

    // Prepare Radar Data (Mocking expected vs actual based on skills)
    const radarData = employee?.skills?.length > 0 
        ? employee.skills.map(s => ({
            subject: s.skillName,
            A: s.proficiencyLevel === 'Expert' ? 90 : s.proficiencyLevel === 'Intermédiaire' ? 60 : 30,
            fullMark: 100,
        }))
        : [
            { subject: 'Leadership', A: 80, fullMark: 100 },
            { subject: 'Communication', A: 90, fullMark: 100 },
            { subject: 'Technique', A: 60, fullMark: 100 },
            { subject: 'Gestion', A: 70, fullMark: 100 },
            { subject: 'Innovation', A: 85, fullMark: 100 },
        ];

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4 mb-8">
                <Button 
                    variant="outline" 
                    className="p-2 bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                    onClick={() => navigate('/employees')}
                >
                    <ChevronLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Profil Collaborateur</h2>
                    <p className="text-slate-500 text-sm">Vue détaillée des informations et compétences.</p>
                </div>
            </div>

            {/* Top Section : Identité Visuelle */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -z-0 -mr-20 -mt-20"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white">
                        {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h1 className="text-3xl font-extrabold text-slate-900">
                                {employee.firstName} {employee.lastName}
                            </h1>
                            <Badge variant={getStatusColor(employee.status)} className="w-fit mx-auto md:mx-0">
                                {getStatusText(employee.status)}
                            </Badge>
                        </div>
                        
                        <div className="text-lg text-slate-600 font-medium flex items-center justify-center md:justify-start gap-2">
                            <Briefcase size={18} className="text-slate-400"/>
                            {employee.positionTitle}
                            <span className="text-slate-300 mx-2">|</span>
                            <span className="text-blue-600">{employee.department}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-slate-400"/>
                                {employee.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400"/>
                                Embauché(e) le {formatDate(employee.hireDate)}
                            </div>
                            {employee.manager && (
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-slate-400"/>
                                    Manager : {employee.manager.firstName} {employee.manager.lastName}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Colonne Gauche : Compétences & Matériel */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Carte Compétences */}
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                <Award size={20} className="text-indigo-600" />
                                Cartographie des Compétences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {employee.skills && employee.skills.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {employee.skills.map((skill) => (
                                        <div key={skill.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-white hover:border-indigo-200 transition-colors">
                                            <span className="font-medium text-slate-700">{skill.skillName}</span>
                                            <Badge variant={
                                                skill.proficiencyLevel === 'Expert' ? 'success' : 
                                                skill.proficiencyLevel === 'Intermédiaire' ? 'primary' : 'warning'
                                            }>
                                                {skill.proficiencyLevel}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200 mb-4">
                                    <p>Aucune compétence recensée pour cet employé. Radar par défaut affiché.</p>
                                </div>
                            )}

                            <div className="mt-6 border-t border-slate-100 pt-6">
                                <h4 className="text-sm font-semibold text-slate-700 mb-4 text-center">GPEC : Cartographie des Compétences</h4>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Employé" dataKey="A" stroke="#6366f1" fill="#818cf8" fillOpacity={0.5} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Carte Équipement */}
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                <Monitor size={20} className="text-sky-600" />
                                Matériel Assigné
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {employee.assets && employee.assets.length > 0 ? (
                                <div className="space-y-3">
                                    {employee.assets.filter(a => !a.returnedDate).map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sky-600">
                                                    <Monitor size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{assignment.asset.model}</p>
                                                    <p className="text-xs text-slate-500">Tag : {assignment.asset.assetTag} • {assignment.asset.category}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-white">
                                                Depuis le {formatDate(assignment.assignedDate)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-500">
                                    <p>Aucun équipement assigné en cours.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Colonne Droite : Talent, Solde Congés */}
                <div className="space-y-6">
                    
                    {/* Carte Talent Profile */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-600">
                            <TrendingUp size={100} />
                        </div>
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 relative z-10">
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                <Star size={20} className="text-purple-600" />
                                Profil Talent (GPEC)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 relative z-10 space-y-5">
                            {employee.talentProfile ? (
                                <>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Performance</div>
                                        <div className="font-medium text-slate-800 text-lg">{employee.talentProfile.performance}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Potentiel</div>
                                        <div className="font-medium text-slate-800 text-lg">{employee.talentProfile.potential}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Risque de départ</div>
                                        <Badge variant={employee.talentProfile.flightRisk === 'High' ? 'destructive' : 'success'}>
                                            {employee.talentProfile.flightRisk === 'High' ? 'Élevé' : 'Faible / Moyen'}
                                        </Badge>
                                    </div>
                                    {employee.talentProfile.readyForPromotion && (
                                        <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg text-purple-700 font-medium flex items-center gap-2 text-sm">
                                            <TrendingUp size={16} />
                                            Prêt(e) pour une promotion
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-slate-500 text-center py-4">Profil talent non évalué.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Carte Synthèse Temps */}
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                <Calendar size={20} className="text-emerald-600" />
                                Congés & Absences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 text-center">
                            <div className="text-5xl font-black text-slate-800 mb-2">
                                {employee.annualLeaveBalance}
                            </div>
                            <p className="text-slate-500 font-medium">Jours de congés disponibles</p>
                            
                            {employee.leaves && employee.leaves.length > 0 && (
                                <div className="mt-6 text-left border-t border-slate-100 pt-4">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Derniers congés</h4>
                                    <div className="space-y-2">
                                        {employee.leaves.slice(0,3).map(l => (
                                            <div key={l.id} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600">{formatDate(l.startDate)}</span>
                                                <Badge variant="outline" className="text-xs">{l.durationDays}j</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
