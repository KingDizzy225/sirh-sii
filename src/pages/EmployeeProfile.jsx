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
    FileText,
    Trash2,
    X,
    History,
    Gavel,
    TrendingDown,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export function EmployeeProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [careerHistory, setCareerHistory] = useState([]);
    const [disciplinaryRecords, setDisciplinaryRecords] = useState([]);
    
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

                // Fetch dossier personnel docs
                const docsRes = await fetch(`${API_URL}/api/documents/employee/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (docsRes.ok) setPersonnelDocs(await docsRes.json());

                // Fetch history
                const historyRes = await fetch(`${API_URL}/api/career/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (historyRes.ok) setCareerHistory(await historyRes.json());

                // Fetch disciplinary
                const discRes = await fetch(`${API_URL}/api/disciplinary/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (discRes.ok) setDisciplinaryRecords(await discRes.json());
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

    const handleUploadDoc = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('title', uploadForm.title);
            formData.append('type', uploadForm.type);
            const res = await fetch(`${API_URL}/api/documents/employee/${id}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                const newDoc = await res.json();
                setPersonnelDocs(prev => [newDoc, ...prev]);
                setShowUploadModal(false);
                setUploadForm({ title: '', type: 'Contrat' });
                setUploadFile(null);
            }
        } catch (err) {
            console.error('Upload error', err);
        } finally {
            setIsUploading(false);
        }
    };

    const docTypeIcon = (type) => {
        const icons = { Contrat: '📜', Identité: '🪹', Diplôme: '🎓', Paie: '💰', Avenant: '✍️', Médical: '🏥', Autre: '📁' };
        return icons[type] || '📁';
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
                    <p className="text-slate-500 text-sm">Vue détaillée des informations, compétences et dossier personnel.</p>
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

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit mb-6 overflow-x-auto">
                {[
                    { id: 'competences', label: 'Compétences & Matériel' }, 
                    { id: 'dossier', label: '📂 Dossier' },
                    { id: 'history', label: '🕰️ Historique' },
                    { id: 'disciplinary', label: '⚖️ Disciplinaire' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab.id 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Colonne Gauche : Compétences & Matériel */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Carte Compétences */}
                    {activeTab === 'competences' && (
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
                    )}

                    {/* Onglet Dossier Personnel */}
                    {activeTab === 'dossier' && (
                        <div className="space-y-4">
                            {/* Modal Upload */}
                            {showUploadModal && (
                                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                            <h3 className="text-lg font-bold text-slate-900">Ajouter un document</h3>
                                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setShowUploadModal(false)}><X size={18} /></Button>
                                        </div>
                                        <form onSubmit={handleUploadDoc} className="px-6 py-5 space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700">Intitulé du document</label>
                                                <input
                                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                    placeholder="ex: Contrat CDI 2024"
                                                    value={uploadForm.title}
                                                    onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700">Catégorie</label>
                                                <select
                                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                    value={uploadForm.type}
                                                    onChange={e => setUploadForm(f => ({ ...f, type: e.target.value }))}
                                                >
                                                    {['Contrat', 'Identité', 'Diplôme', 'Paie', 'Avenant', 'Médical', 'Autre'].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700">Fichier (PDF, image)</label>
                                                <label className="block border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                                                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setUploadFile(e.target.files[0])} />
                                                    {uploadFile ? (
                                                        <p className="text-sm font-medium text-emerald-600">✅ {uploadFile.name}</p>
                                                    ) : (
                                                        <p className="text-sm text-slate-500">Cliquez pour sélectionner</p>
                                                    )}
                                                </label>
                                            </div>
                                            <div className="flex justify-end gap-3 pt-2">
                                                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>Annuler</Button>
                                                <Button type="submit" disabled={isUploading || !uploadFile} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                    {isUploading ? 'Envoi...' : 'Enregistrer'}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                        <FolderOpen size={20} className="text-amber-600" /> Dossier Personnel
                                    </CardTitle>
                                    {(user?.role === 'HR' || user?.role === 'ADMIN') && (
                                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => setShowUploadModal(true)}>
                                            <Upload size={14} /> Ajouter
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0">
                                    {personnelDocs.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <FolderOpen size={40} className="mx-auto text-slate-300 mb-3" />
                                            <p className="font-medium">Aucun document dans le dossier</p>
                                            {(user?.role === 'HR' || user?.role === 'ADMIN') && (
                                                <p className="text-sm mt-1">Cliquez sur "Ajouter" pour enrichir ce dossier.</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {personnelDocs.map(doc => (
                                                <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                                                    <div className="text-2xl w-10 text-center flex-shrink-0">{docTypeIcon(doc.type)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-800 truncate">{doc.title}</p>
                                                        <p className="text-xs text-slate-500">{doc.type} • Ajouté par {doc.uploadedBy} • {new Date(doc.createdAt).toLocaleDateString('fr-FR')}</p>
                                                    </div>
                                                    <a
                                                        href={`${API_URL}${doc.filePath}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-shrink-0 flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                                    >
                                                        <Download size={14} /> Télécharger
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Onglet Historique de Carrière */}
                    {activeTab === 'history' && (
                        <Card className="border-slate-100 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                    <History size={20} className="text-blue-600" />
                                    Historique & Évolution
                                </CardTitle>
                                <CardDescription>Suivi des changements de poste, de département et promotions.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {careerHistory.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <p>Aucun événement historique enregistré.</p>
                                    </div>
                                ) : (
                                    <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-8 py-2">
                                        {careerHistory.map((event, idx) => (
                                            <div key={event.id} className="relative">
                                                <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-2 border-blue-500 z-10" />
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{formatDate(event.eventDate)}</span>
                                                    <h4 className="font-bold text-slate-900">{event.type}</h4>
                                                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                                                        {event.previousValue && (
                                                            <p className="mb-1"><span className="font-medium text-slate-400">Ancien :</span> {event.previousValue}</p>
                                                        )}
                                                        <p><span className="font-medium text-blue-600">Nouveau :</span> {event.newValue}</p>
                                                        {event.comment && (
                                                            <p className="mt-2 pt-2 border-t border-slate-200 italic text-slate-500">"{event.comment}"</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Onglet Dossier Disciplinaire */}
                    {activeTab === 'disciplinary' && (
                        <Card className="border-slate-100 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                    <Gavel size={20} className="text-rose-600" />
                                    Dossier Disciplinaire
                                </CardTitle>
                                <CardDescription>Sanctions, avertissements et mesures disciplinaires.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {disciplinaryRecords.length === 0 ? (
                                    <div className="text-center py-12 bg-emerald-50 rounded-xl border border-dashed border-emerald-200">
                                        <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
                                        <p className="font-bold text-emerald-800 text-lg">Dossier exemplaire</p>
                                        <p className="text-emerald-600">Aucune sanction ou avertissement enregistré.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {disciplinaryRecords.map(record => (
                                            <div key={record.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${record.type === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                                            <Gavel size={18} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900">{record.type}</h4>
                                                            <p className="text-xs text-slate-500">{formatDate(record.date)}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={record.status === 'Active' ? 'destructive' : 'secondary'}>
                                                        {record.status}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2 mt-4">
                                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Motif</p>
                                                    <p className="text-slate-700 text-sm">{record.reason}</p>
                                                </div>
                                                {record.sanction && (
                                                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Sanction appliquée</p>
                                                        <p className="text-sm font-medium text-slate-800">{record.sanction}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Carte Équipement - visible dans l'onglet compétences */}
                    {activeTab === 'competences' && (
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
                    )}

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
