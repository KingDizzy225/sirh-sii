import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { RequirePermission } from '../components/auth/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, UploadCloud, Download, Trash2, Shield,
    Folder, FolderOpen, File, CheckCircle2, Lock, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function Documents() {
    const { user, hasPermission, token } = useAuth();
    const [activeTab, setActiveTab] = useState('company');
    const [companyDocs, setCompanyDocs] = useState([]);
    const [personalDocs, setPersonalDocs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [notification, setNotification] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    React.useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await fetch(`${API_URL}/api/documents`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();

                    const pDocs = data.filter(d => d.type === 'Personnel' || d.type === 'Paie' || d.type === 'Identité');
                    const cDocs = data.filter(d => d.type === 'Entreprise' || d.type === 'Contrat' || d.type === 'Autre');

                    setPersonalDocs(pDocs);
                    setCompanyDocs(cDocs);
                }
            } catch (err) {
                console.error("Erreur chargement docs", err);
            }
        };
        if (token) fetchDocs();
    }, [token]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Drag and Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        handleFiles(files);
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        handleFiles(files);
    };

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', file.name);
        formData.append('type', activeTab === 'company' ? 'Entreprise' : 'Personnel');

        setUploadProgress(10);
        try {
            const res = await fetch(`${API_URL}/api/documents/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const newDoc = await res.json();
                setUploadProgress(100);
                setTimeout(() => {
                    setUploadProgress(0);
                    if (activeTab === 'company') {
                        setCompanyDocs(prev => [newDoc, ...prev]);
                    } else {
                        setPersonalDocs(prev => [newDoc, ...prev]);
                    }
                    showNotification(`${file.name} téléversé avec succès.`);
                }, 500);
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            setUploadProgress(0);
            showNotification(`Erreur lors du téléversement de ${file.name}`);
        }
    };

    const handleDelete = async (docId, title) => {
        try {
            const res = await fetch(`${API_URL}/api/documents/${docId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCompanyDocs(prev => prev.filter(d => d.id !== docId));
                setPersonalDocs(prev => prev.filter(d => d.id !== docId));
                showNotification(`${title} supprimé avec succès.`);
            }
        } catch (err) {
            showNotification(`Erreur lors de la suppression.`);
        }
    };

    const getFileIcon = (type) => {
        if (type.includes('pdf')) return <img src="https://cdn-icons-png.flaticon.com/512/337/337946.png" className="w-8 h-8 opacity-80" alt="PDF" />;
        if (type.includes('word') || type.includes('document')) return <img src="https://cdn-icons-png.flaticon.com/512/337/337932.png" className="w-8 h-8 opacity-80" alt="Word" />;
        return <File className="w-8 h-8 text-blue-500" />;
    };

    const renderDocumentList = (documents) => {
        const filteredDocs = documents.filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));

        if (filteredDocs.length === 0) {
            return (
                <div className="text-center py-12 px-4 border rounded-xl bg-slate-50/50 border-dashed">
                    <FolderOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">Aucun document trouvé</h3>
                    <p className="text-xs text-slate-500 mt-1">Essayez de modifier votre recherche.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map(doc => (
                    <Card key={doc.id} className="group hover:border-blue-200 hover:shadow-md transition-all">
                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                            <div className="bg-slate-50 p-2 rounded-lg">
                                {getFileIcon(doc.type)}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => window.open(`${API_URL}${doc.filePath}`, '_blank')}>
                                    <Download size={16} />
                                </Button>
                                <RequirePermission permission="documents:manage">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(doc.id, doc.title)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </RequirePermission>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                            <h4 className="font-semibold text-sm text-slate-800 line-clamp-1 mb-1" title={doc.title}>
                                {doc.title}
                            </h4>
                            <div className="flex justify-between items-center text-xs text-slate-500 mt-3 pt-3 border-t">
                                <span>{(doc.fileSize / 1024 > 1024) ? `${(doc.fileSize / 1024 / 1024).toFixed(1)} Mo` : `${(doc.fileSize / 1024).toFixed(0)} Ko`}</span>
                                <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-medium text-sm"
                    >
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Folder className="text-blue-600 h-8 w-8" />
                        Documents
                    </h2>
                    <p className="text-slate-500 mt-1">Gérez les politiques de l'entreprise et vos dossiers personnels.</p>
                </div>
            </div>

            <Tabs defaultValue="company" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-white border shadow-sm">
                        <RequirePermission permission="documents:view_company">
                            <TabsTrigger value="company" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                <FileText size={16} /> Dossier Entreprise
                            </TabsTrigger>
                        </RequirePermission>
                        <RequirePermission permission="documents:view_personal">
                            <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                                <Shield size={16} /> Dossier Personnel
                            </TabsTrigger>
                        </RequirePermission>
                    </TabsList>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher des documents..."
                            className="pl-9 bg-white border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Upload Zone - Only visible if user has manage permissions */}
                <RequirePermission permission="documents:manage">
                    <div className="mb-8">
                        {uploadProgress > 0 ? (
                            <div className="w-full bg-white border rounded-xl p-6 shadow-sm overflow-hidden relative">
                                <div
                                    className="absolute left-0 top-0 bottom-0 bg-blue-50/50 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                                            <UploadCloud className="text-blue-600 h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Téléchargement vers {activeTab === 'company' ? 'Dossier Entreprise' : 'Dossier Personnel'}...</p>
                                            <p className="text-xs text-slate-500">Chiffrement et transfert du fichier ({uploadProgress}%)</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-blue-600">{uploadProgress}%</div>
                                </div>
                            </div>
                        ) : (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-8 transition-all relative overflow-hidden flex flex-col items-center justify-center text-center",
                                    isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:bg-slate-50/50 hover:border-slate-400"
                                )}
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileInput}
                                    multiple
                                />
                                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                    <UploadCloud className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900">Télécharger vers {activeTab === 'company' ? 'Dossier Entreprise' : 'Dossier Personnel'}</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                                    Glissez-déposez des fichiers ici, ou cliquez pour parcourir. Formats supportés : .pdf, .docx, .xlsx
                                </p>
                            </div>
                        )}
                    </div>
                </RequirePermission>

                <TabsContent value="company" className="mt-0 outline-none">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-lg">Politiques et Directives de l'Entreprise</CardTitle>
                            <CardDescription>Documents accessibles à tous les employés authentifiés.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            {renderDocumentList(companyDocs)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="personal" className="mt-0 outline-none">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lock size={18} className="text-purple-600" /> Mes Fichiers Confidentiels
                            </CardTitle>
                            <CardDescription>Documents privés appartenant spécifiquement à {user?.name}.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            {renderDocumentList(personalDocs)}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
