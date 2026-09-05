import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Save } from 'lucide-react';
import { RequirePermission } from '../components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export function Settings() {
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('Integrations');
    const [logoPath, setLogoPath] = useState(null);
    const { user } = useAuth();
    const [usersList, setUsersList] = useState([]);
    const [isFetchingUsers, setIsFetchingUsers] = useState(false);
    
    // Webhooks state
    const [webhooksList, setWebhooksList] = useState([]);
    const [isFetchingWebhooks, setIsFetchingWebhooks] = useState(false);
    const [isAddingWebhook, setIsAddingWebhook] = useState(false);

    // Work sites (pointage géolocalisé) state
    const [workSites, setWorkSites] = useState([]);
    const [isAddingSite, setIsAddingSite] = useState(false);
    const [siteForm, setSiteForm] = useState({ name: '', latitude: '', longitude: '', radiusMeters: '200' });

    // Traitements RH automatiques (acquisition des congés, alertes d'échéances)
    const [jobStatus, setJobStatus] = useState(null);
    const [isFetchingJobs, setIsFetchingJobs] = useState(false);
    const [isRunningJobs, setIsRunningJobs] = useState(false);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = () => {
        showNotification('Paramètres enregistrés avec succès');
    };

    const handleDiscard = () => {
        showNotification('Modifications annulées');
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoPath(URL.createObjectURL(file));
            showNotification('Logo mis à jour localement. N\'oubliez pas d\'enregistrer les modifications.');
        }
    };

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    const fetchWebhooks = async () => {
        setIsFetchingWebhooks(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/webhooks`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWebhooksList(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsFetchingWebhooks(false);
        }
    };

    const fetchJobStatus = async () => {
        setIsFetchingJobs(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/jobs/status`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) setJobStatus(await res.json());
            else setJobStatus(null);
        } catch (error) {
            console.error(error);
            setJobStatus(null);
        } finally {
            setIsFetchingJobs(false);
        }
    };

    const runJobsNow = async () => {
        setIsRunningJobs(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/jobs/run`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) {
                showNotification('Traitements exécutés. Les périodes déjà traitées sont ignorées.');
                fetchJobStatus();
            } else {
                const data = await res.json().catch(() => ({}));
                showNotification(data.error || "Exécution impossible.");
            }
        } catch (err) {
            showNotification('Erreur serveur');
        } finally {
            setIsRunningJobs(false);
        }
    };

    const fetchWorkSites = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/worksites`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) setWorkSites(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const saveWorkSite = async (e) => {
        e.preventDefault();
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/worksites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('sirh_token')}`
                },
                body: JSON.stringify({
                    name: siteForm.name,
                    latitude: parseFloat(siteForm.latitude),
                    longitude: parseFloat(siteForm.longitude),
                    radiusMeters: parseInt(siteForm.radiusMeters, 10)
                })
            });
            if (res.ok) {
                showNotification('Site de pointage créé avec succès');
                setIsAddingSite(false);
                setSiteForm({ name: '', latitude: '', longitude: '', radiusMeters: '200' });
                fetchWorkSites();
            } else {
                const data = await res.json();
                showNotification(data.error || 'Erreur lors de la création du site');
            }
        } catch (err) {
            showNotification('Erreur serveur');
        }
    };

    const toggleWorkSite = async (site) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/worksites/${site.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('sirh_token')}`
                },
                body: JSON.stringify({ isActive: !site.isActive })
            });
            if (res.ok) fetchWorkSites();
        } catch (err) {
            showNotification('Erreur serveur');
        }
    };

    const deleteWorkSite = async (site) => {
        if (!window.confirm(`Supprimer le site "${site.name}" ? Les pointages existants seront conservés.`)) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/worksites/${site.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) {
                showNotification('Site supprimé');
                fetchWorkSites();
            }
        } catch (err) {
            showNotification('Erreur serveur');
        }
    };

    const useMyPosition = () => {
        if (!navigator.geolocation) return showNotification('Géolocalisation non disponible sur ce navigateur');
        navigator.geolocation.getCurrentPosition(
            (pos) => setSiteForm(f => ({
                ...f,
                latitude: pos.coords.latitude.toFixed(6),
                longitude: pos.coords.longitude.toFixed(6)
            })),
            () => showNotification('Impossible de récupérer votre position'),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    React.useEffect(() => {
        if (activeTab === 'Integrations') {
            fetchWebhooks();
        }
        if (activeTab === 'Work Sites') {
            fetchWorkSites();
        }
        if (activeTab === 'Scheduled Jobs') {
            fetchJobStatus();
        }
    }, [activeTab]);

    const tabNames = {
        'Company Profile': 'Profil de l\'Entreprise',
        'Preferences': 'Préférences',
        'Security': 'Sécurité du Compte',
        'Access Management': 'Comptes et Rôles',
        'Integrations': 'Intégrations',
        'Work Sites': 'Sites de pointage',
        'Scheduled Jobs': 'Traitements RH automatiques',
        'Notifications': 'Notifications',
        'Billing': 'Facturation'
    };

    const renderTabButton = (tab, requiredPermission = null) => {
        const button = (
            <Button
                key={tab}
                variant="ghost"
                onClick={() => handleTabChange(tab)}
                className={`w-full justify-start ${activeTab === tab ? 'bg-slate-200/50 text-slate-900 font-medium' : 'text-slate-600'}`}
            >
                {tabNames[tab] || tab}
            </Button>
        );

        if (requiredPermission) {
            return (
                <RequirePermission key={tab} permission={requiredPermission}>
                    {button}
                </RequirePermission>
            );
        }

        return button;
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <CheckCircle2 size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Paramètres</h2>
                    <p className="text-slate-500 mt-1">Gérez les paramètres de l'organisation et les configurations globales.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleSave} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Save size={18} /> Enregistrer la Config.
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-5 mt-6">
                {/* Settings Navigation Sidebar */}
                <div className="md:col-span-1 flex flex-col gap-1 pr-4">
                    {renderTabButton('Company Profile')}
                    {renderTabButton('Preferences')}
                    {renderTabButton('Security')}
                    {user?.role === 'ADMIN' && renderTabButton('Access Management')}
                    {renderTabButton('Integrations', 'settings:manage')}
                    {['ADMIN', 'Administrator', 'HR'].includes(user?.role) && renderTabButton('Work Sites')}
                    {['ADMIN', 'Administrator', 'HR'].includes(user?.role) && renderTabButton('Scheduled Jobs')}
                    {renderTabButton('Notifications')}
                    {renderTabButton('Billing', 'settings:manage')}
                </div>

                {/* Settings Content Area */}
                <div className="md:col-span-3 lg:col-span-4 space-y-6">
                    {activeTab === 'Company Profile' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profil de l'Entreprise</CardTitle>
                                    <CardDescription>Mettez à jour les détails de votre entreprise et les informations légales.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    <div className="flex items-center gap-6">
                                        <label htmlFor="logo-upload" className="cursor-pointer">
                                            <div className="w-24 h-24 rounded bg-gradient-to-tr from-blue-100 to-indigo-100 border-2 border-dashed border-blue-300 flex items-center justify-center text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors overflow-hidden">
                                                {logoPath ? <img src={logoPath} className="w-full h-full object-cover" alt="Logo" /> : "Transférer un Logo"}
                                            </div>
                                            <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                        </label>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-medium text-slate-900">Logo de l'Entreprise</h4>
                                            <p className="text-xs text-slate-500 max-w-sm">Utilisez une image carrée haute résolution (PNG ou JPG) de moins de 2 Mo. Utilisé pour les rapports et les emails.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Raison Sociale</label>
                                            <Input defaultValue="SIIRH-SII Global Solutions Ltd." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Numéro d'Immatriculation</label>
                                            <Input defaultValue="RC-504930219" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Email de Support</label>
                                            <Input defaultValue="hr-support@siirh-sii.com" type="email" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Devise par Défaut</label>
                                            <Input defaultValue="FCFA" disabled className="bg-slate-50 text-slate-500" />
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Adresse du Siège</CardTitle>
                                    <CardDescription>Configurez le siège principal pour le système.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-slate-700">Adresse Ligne 1</label>
                                        <Input defaultValue="1204 Technology Drive" />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Ville</label>
                                            <Input defaultValue="Abidjan" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">État / Région</label>
                                            <Input defaultValue="Lagunes" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Code Postal</label>
                                            <Input defaultValue="01 BP 1234" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-3 mt-8">
                                <Button variant="outline" onClick={handleDiscard}>Annuler les Modifications</Button>
                                <Button onClick={handleSave}>Enregistrer la Configuration</Button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Preferences' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Préférences Système</CardTitle>
                                    <CardDescription>Personnalisez les formats de date, le fuseau horaire et la langue.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-slate-700">Fuseau Horaire</label>
                                        <Input defaultValue="UTC+00:00 (GMT Abidjan)" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-slate-700">Langue</label>
                                        <Input defaultValue="Français (CI)" />
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex justify-end gap-3 mt-8">
                                <Button variant="outline" onClick={handleDiscard}>Annuler les Modifications</Button>
                                <Button onClick={handleSave}>Enregistrer les Préférences</Button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Security' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sécurité & Identifiants</CardTitle>
                                    <CardDescription>Mettez à jour votre mot de passe et votre adresse email de connexion.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target);
                                        const email = formData.get('email');
                                        const currentPassword = formData.get('currentPassword');
                                        const newPassword = formData.get('newPassword');

                                        try {
                                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                                            const res = await fetch(`${API_URL}/api/auth/update-credentials`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${localStorage.getItem('sirh_token')}`
                                                },
                                                body: JSON.stringify({ email, currentPassword, newPassword })
                                            });
                                            if (res.ok) {
                                                showNotification('Identifiants mis à jour. Veuillez vous reconnecter.');
                                                setTimeout(() => {
                                                    localStorage.removeItem('sirh_token');
                                                    localStorage.removeItem('sirh_user');
                                                    window.location.href = '/login';
                                                }, 2000);
                                            } else {
                                                const data = await res.json();
                                                showNotification(data.error || 'Erreur lors de la mise à jour');
                                            }
                                        } catch (err) {
                                            showNotification('Erreur serveur');
                                        }
                                    }} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Nouvelle adresse email (optionnel)</label>
                                            <Input name="email" type="email" placeholder="Nouvelle adresse pour la connexion" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Mot de passe actuel</label>
                                            <Input name="currentPassword" type="password" required placeholder="Nécessaire pour enregistrer les modifications" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Nouveau mot de passe (optionnel)</label>
                                            <Input name="newPassword" type="password" placeholder="Laissez vide si vous ne changez que l'email" />
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <Button type="button" variant="outline" onClick={handleDiscard}>Annuler</Button>
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Mettre à jour la sécurité</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'Access Management' && user?.role === 'ADMIN' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Gestion des Utilisateurs</CardTitle>
                                        <CardDescription>Visualisez tous les comptes ayant accès au système SIIRH.</CardDescription>
                                    </div>
                                    <Button size="sm" onClick={async () => {
                                        setIsFetchingUsers(true);
                                        try {
                                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                                            const res = await fetch(`${API_URL}/api/auth/users`, {
                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
                                            });
                                            if (res.ok) {
                                                const data = await res.json();
                                                setUsersList(data);
                                            }
                                        } catch (err) {
                                            console.error(err);
                                        } finally {
                                            setIsFetchingUsers(false);
                                        }
                                    }} variant="outline" className="h-8">
                                        {isFetchingUsers ? 'Chargement...' : 'Actualiser la liste'}
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {usersList.length === 0 ? (
                                        <div className="text-center py-6 text-slate-500">
                                            Cliquez sur "Actualiser la liste" pour afficher les comptes.
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium text-slate-500">Nom Complet</th>
                                                        <th className="px-4 py-3 font-medium text-slate-500">Email</th>
                                                        <th className="px-4 py-3 font-medium text-slate-500">Rôle (Accès)</th>
                                                        <th className="px-4 py-3 font-medium text-slate-500">Date de création</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {usersList.map(u => (
                                                        <tr key={u.id}>
                                                            <td className="px-4 py-3 font-medium">{u.name}</td>
                                                            <td className="px-4 py-3 text-slate-600">{u.email}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                                    u.role === 'HR' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-slate-100 text-slate-700'
                                                                    }`}>
                                                                    {u.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-500">
                                                                {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Créer un Nouveau Compte</CardTitle>
                                    <CardDescription>Générez un accès pour un nouvel employé ou manager.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target);
                                        const payload = Object.fromEntries(formData);

                                        try {
                                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                                            const res = await fetch(`${API_URL}/api/auth/users`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${localStorage.getItem('sirh_token')}`
                                                },
                                                body: JSON.stringify(payload)
                                            });
                                            if (res.ok) {
                                                showNotification('Compte utilisateur créé avec succès !');
                                                e.target.reset();
                                            } else {
                                                const data = await res.json();
                                                showNotification(data.error || 'Erreur de création');
                                            }
                                        } catch (err) {
                                            showNotification('Erreur serveur');
                                        }
                                    }} className="space-y-4 max-w-2xl">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium leading-none text-slate-700">Nom Complet</label>
                                                <Input name="name" required placeholder="Ex: Jean Dupont" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium leading-none text-slate-700">Adresse Email</label>
                                                <Input name="email" type="email" required placeholder="jean.dupont@siirh.com" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium leading-none text-slate-700">Mot de Passe Provisoire</label>
                                                <Input name="password" required placeholder="••••••••" minLength="6" />
                                            </div>
                                            <div className="space-y-2 flex flex-col">
                                                <label className="text-sm font-medium leading-none text-slate-700">Rôle d'Accès</label>
                                                <select name="role" required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
                                                    <option value="MANAGER">Manager / Employé Standard</option>
                                                    <option value="HR">Ressources Humaines (RH)</option>
                                                    <option value="ADMIN">Administrateur Système</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                                                Générer le Compte
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'Scheduled Jobs' && ['ADMIN', 'Administrator', 'HR'].includes(user?.role) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>Traitements RH automatiques</CardTitle>
                                            <CardDescription>
                                                L'acquisition mensuelle des congés et les alertes d'échéances
                                                (fins de CDD, périodes d'essai, visites médicales) s'exécutent
                                                sans intervention. Cet historique permet de vérifier qu'elles
                                                ont bien tourné.
                                            </CardDescription>
                                        </div>
                                        {['ADMIN', 'Administrator'].includes(user?.role) && (
                                            <Button size="sm" onClick={runJobsNow} disabled={isRunningJobs} className="bg-indigo-600 text-white hover:bg-indigo-700 shrink-0">
                                                {isRunningJobs ? 'Exécution…' : 'Exécuter maintenant'}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isFetchingJobs ? (
                                        <p className="text-sm text-slate-500 py-6 text-center">Chargement…</p>
                                    ) : !jobStatus ? (
                                        <p className="text-sm text-slate-500 py-6 text-center">
                                            Suivi indisponible. Vérifiez que vous êtes connecté avec un compte RH ou administrateur.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="border rounded-lg p-4">
                                                    <p className="text-xs font-medium text-slate-500 mb-1">Planification</p>
                                                    <p className="font-semibold">
                                                        {jobStatus.planificationActive
                                                            ? <span className="text-emerald-600">Active</span>
                                                            : <span className="text-amber-600">Désactivée</span>}
                                                    </p>
                                                </div>
                                                <div className="border rounded-lg p-4">
                                                    <p className="text-xs font-medium text-slate-500 mb-1">Acquisition mensuelle</p>
                                                    <p className="font-semibold">{jobStatus.acquisitionParMois} jour(s) par salarié</p>
                                                </div>
                                            </div>

                                            {(!jobStatus.executions || jobStatus.executions.length === 0) ? (
                                                <p className="text-sm text-slate-500 py-6 text-center">
                                                    Aucune exécution enregistrée pour l'instant. Les traitements se
                                                    lancent au démarrage du serveur et à leur échéance.
                                                </p>
                                            ) : (
                                                <div className="border rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-slate-50 border-b">
                                                            <tr>
                                                                <th className="px-4 py-3 font-medium text-slate-500">Traitement</th>
                                                                <th className="px-4 py-3 font-medium text-slate-500">Période</th>
                                                                <th className="px-4 py-3 font-medium text-slate-500">Exécuté le</th>
                                                                <th className="px-4 py-3 font-medium text-slate-500">Résultat</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {jobStatus.executions.map(run => (
                                                                <tr key={run.id}>
                                                                    <td className="px-4 py-3 font-medium">
                                                                        {run.jobName === 'LEAVE_ACCRUAL' ? 'Acquisition des congés'
                                                                            : run.jobName === 'DEADLINE_ALERTS' ? "Alertes d'échéances"
                                                                            : run.jobName}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{run.period}</td>
                                                                    <td className="px-4 py-3 text-slate-500">
                                                                        {new Date(run.runAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-slate-600">{run.details || '—'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'Work Sites' && ['ADMIN', 'Administrator', 'HR'].includes(user?.role) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>Sites de pointage géolocalisés</CardTitle>
                                            <CardDescription>Définissez les lieux où le pointage mobile est considéré comme valide. Un pointage effectué hors du rayon est enregistré mais signalé "Hors zone" à la RH.</CardDescription>
                                        </div>
                                        <Button size="sm" onClick={() => setIsAddingSite(true)} className="bg-indigo-600 text-white hover:bg-indigo-700">Ajouter un Site</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isAddingSite && (
                                        <div className="border-2 border-indigo-200 border-dashed rounded-lg p-4 bg-indigo-50/50">
                                            <form onSubmit={saveWorkSite} className="space-y-4">
                                                <h4 className="font-semibold text-indigo-900 border-b border-indigo-200 pb-2">Nouveau Site de Pointage</h4>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-slate-700">Nom du site</label>
                                                        <Input required placeholder="ex. Siège Abidjan Plateau" className="bg-white" value={siteForm.name} onChange={e => setSiteForm(f => ({ ...f, name: e.target.value }))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-slate-700">Rayon autorisé (mètres)</label>
                                                        <Input required type="number" min="10" className="bg-white" value={siteForm.radiusMeters} onChange={e => setSiteForm(f => ({ ...f, radiusMeters: e.target.value }))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-slate-700">Latitude</label>
                                                        <Input required type="number" step="any" placeholder="5.323600" className="bg-white" value={siteForm.latitude} onChange={e => setSiteForm(f => ({ ...f, latitude: e.target.value }))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-slate-700">Longitude</label>
                                                        <Input required type="number" step="any" placeholder="-4.016100" className="bg-white" value={siteForm.longitude} onChange={e => setSiteForm(f => ({ ...f, longitude: e.target.value }))} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button type="button" variant="outline" size="sm" onClick={useMyPosition}>📍 Utiliser ma position actuelle</Button>
                                                    <div className="flex-1" />
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingSite(false)}>Annuler</Button>
                                                    <Button type="submit" size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">Enregistrer le Site</Button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {workSites.length === 0 && !isAddingSite ? (
                                        <p className="text-sm text-slate-500 py-6 text-center">Aucun site configuré : le pointage est accepté partout, sans contrôle de zone.</p>
                                    ) : (
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium text-slate-500">Site</th>
                                                        <th className="px-4 py-3 font-medium text-slate-500">Coordonnées</th>
                                                        <th className="px-4 py-3 font-medium text-slate-500">Rayon</th>
                                                        <th className="px-4 py-3 font-medium text-slate-500">Statut</th>
                                                        <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {workSites.map(site => (
                                                        <tr key={site.id}>
                                                            <td className="px-4 py-3 font-medium">{site.name}</td>
                                                            <td className="px-4 py-3 text-slate-500 font-mono text-xs">{site.latitude.toFixed(5)}, {site.longitude.toFixed(5)}</td>
                                                            <td className="px-4 py-3 text-slate-500">{site.radiusMeters} m</td>
                                                            <td className="px-4 py-3">
                                                                {site.isActive
                                                                    ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">Actif</span>
                                                                    : <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs">Inactif</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                                <Button variant="ghost" size="sm" onClick={() => toggleWorkSite(site)} className="h-8 px-2 text-slate-600 hover:bg-slate-100">
                                                                    {site.isActive ? 'Désactiver' : 'Activer'}
                                                                </Button>
                                                                <Button variant="ghost" size="sm" onClick={() => deleteWorkSite(site)} className="text-rose-600 h-8 px-2 hover:bg-rose-50">Supprimer</Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'Integrations' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                            {/* Inbound API Keys */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>Clés API Entrantes (RESTful)</CardTitle>
                                            <CardDescription>Générez des clés pour les logiciels externes (comme Sage Paye) afin d'extraire des données en toute sécurité.</CardDescription>
                                        </div>
                                        <Button size="sm" onClick={() => showNotification('Génération d\'une nouvelle clé API...')} className="bg-slate-900 text-white hover:bg-slate-800">Générer une Nouvelle Clé</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium text-slate-500">Nom de la Clé</th>
                                                    <th className="px-4 py-3 font-medium text-slate-500">Portées Cibles</th>
                                                    <th className="px-4 py-3 font-medium text-slate-500">Dernière Utilisation</th>
                                                    <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                <tr>
                                                    <td className="px-4 py-3 font-medium">Sage Paye 2026</td>
                                                    <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">payroll:read</span></td>
                                                    <td className="px-4 py-3 text-slate-500">Aujourd'hui, 09:41 AM</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => showNotification('Clé révoquée avec succès')} className="text-rose-600 h-8 px-2 hover:bg-rose-50">Révoquer</Button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 font-medium">Synchronisation Utilisateurs ERP</td>
                                                    <td className="px-4 py-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">employees:read</span></td>
                                                    <td className="px-4 py-3 text-slate-500">12 Oct, 2025</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => showNotification('Clé révoquée avec succès')} className="text-rose-600 h-8 px-2 hover:bg-rose-50">Révoquer</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Outbound Webhooks */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>Webhooks Sortants</CardTitle>
                                            <CardDescription>Envoyez des événements en temps réel vers des outils externes comme Slack ou Microsoft Teams.</CardDescription>
                                        </div>
                                        <Button size="sm" onClick={() => setIsAddingWebhook(true)} className="bg-indigo-600 text-white hover:bg-indigo-700">Ajouter un Webhook</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {isAddingWebhook && (
                                            <div className="border-2 border-indigo-200 border-dashed rounded-lg p-4 bg-indigo-50/50 md:col-span-2">
                                                <form onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    const formData = new FormData(e.target);
                                                    try {
                                                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                                                        const res = await fetch(`${API_URL}/api/webhooks`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${localStorage.getItem('sirh_token')}`
                                                            },
                                                            body: JSON.stringify(Object.fromEntries(formData))
                                                        });
                                                        if (res.ok) {
                                                            showNotification('Webhook créé avec succès');
                                                            setIsAddingWebhook(false);
                                                            fetchWebhooks();
                                                        }
                                                    } catch (err) {
                                                        showNotification('Erreur serveur');
                                                    }
                                                }} className="space-y-4">
                                                    <h4 className="font-semibold text-indigo-900 border-b border-indigo-200 pb-2">Nouveau Webhook Sortant</h4>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-medium text-slate-700">Nom descriptif</label>
                                                            <Input name="name" required placeholder="ex. Notif Slack HR" className="bg-white" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-medium text-slate-700">Événement déclencheur</label>
                                                            <select name="eventType" required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                                                                <option value="EMPLOYEE_CREATED">EMPLOYEE_CREATED (Création Profil)</option>
                                                                <option value="PAYROLL_APPROVED">PAYROLL_APPROVED (Paie Validée)</option>
                                                                <option value="LEAVE_REQUESTED">LEAVE_REQUESTED (Demande Congé)</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2 md:col-span-2">
                                                            <label className="text-xs font-medium text-slate-700">URL de destination cible (POST)</label>
                                                            <Input name="url" type="url" required placeholder="https://hooks.slack.com/services/..." className="bg-white" />
                                                        </div>
                                                        <div className="space-y-2 md:col-span-2">
                                                            <label className="text-xs font-medium text-slate-700">Secret HMAC (Optionnel)</label>
                                                            <Input name="secret" type="password" placeholder="Clé secrète pour sécuriser l'appel" className="bg-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-2">
                                                        <Button type="button" variant="ghost" onClick={() => setIsAddingWebhook(false)}>Annuler</Button>
                                                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Enregistrer le Webhook</Button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {isFetchingWebhooks ? (
                                            <div className="col-span-2 text-center py-8 text-slate-500">Chargement des webhooks...</div>
                                        ) : webhooksList.length === 0 && !isAddingWebhook ? (
                                            <div className="col-span-2 text-center py-8 text-slate-500">Aucun webhook configuré.</div>
                                        ) : (
                                            webhooksList.map(webhook => (
                                                <div key={webhook.id} className="border border-slate-200 rounded-lg p-4 bg-white relative">
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <span className={`flex h-2 w-2 rounded-full mt-2 ${webhook.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                    </div>
                                                    <h4 className="font-semibold text-slate-900 mb-1">{webhook.name}</h4>
                                                    <p className="text-xs text-slate-500 font-mono mb-3 truncate" title={webhook.url}>
                                                        {webhook.url}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium rounded uppercase tracking-wider">{webhook.eventType}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t pt-3 mt-1">
                                                        <span className="text-xs text-slate-400">{webhook.secret ? 'Sécurisé' : 'Non sécurisé'}</span>
                                                        <Button variant="outline" size="sm" onClick={async () => {
                                                            if (!window.confirm('Voulez-vous supprimer ce webhook ?')) return;
                                                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                                                            await fetch(`${API_URL}/api/webhooks/${webhook.id}`, {
                                                                method: 'DELETE',
                                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('sirh_token')}` }
                                                            });
                                                            fetchWebhooks();
                                                            showNotification('Webhook supprimé');
                                                        }} className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-100">Supprimer</Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                        </motion.div>
                    )}

                    {activeTab === 'Notifications' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notifications par Email</CardTitle>
                                    <CardDescription>Gérez qui reçoit quelles alertes système spécifiques.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm text-slate-600">
                                    Les paramètres de notification sont actuellement gérés par utilisateur dans leur profil.
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'Billing' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Facturation & Abonnement</CardTitle>
                                    <CardDescription>Gérez votre forfait et vos moyens de paiement.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-slate-50 border rounded-lg p-6">
                                        <h3 className="font-bold text-slate-900 mb-1">Forfait SIIRH Enterprise</h3>
                                        <p className="text-sm text-slate-500 mb-4">Vous êtes actuellement facturé 4 500 000 FCFA annuellement.</p>
                                        <Button onClick={() => showNotification('Redirection vers le Portail Client Stripe...')} className="bg-slate-900 text-white hover:bg-slate-800">Gérer l'Abonnement</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
