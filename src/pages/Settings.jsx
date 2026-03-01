import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Save } from 'lucide-react';
import { RequirePermission } from '../components/auth/ProtectedRoute';

export function Settings() {
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('Integrations');
    const [logoPath, setLogoPath] = useState(null);

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
        if (tabName !== 'Company Profile') {
            showNotification(`Navigation vers les paramètres: ${tabName}`);
        }
    };

    const tabNames = {
        'Company Profile': 'Profil de l\'Entreprise',
        'Preferences': 'Préférences',
        'Integrations': 'Intégrations',
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
                    {renderTabButton('Integrations', 'settings:manage')}
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
                                            <Input defaultValue="SIRH-SII Global Solutions Ltd." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Numéro d'Immatriculation</label>
                                            <Input defaultValue="RC-504930219" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-slate-700">Email de Support</label>
                                            <Input defaultValue="hr-support@sirh-sii.com" type="email" />
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
                                        <Button size="sm" onClick={() => showNotification('Ouverture de la boîte de dialogue de création de webhook...')} className="bg-indigo-600 text-white hover:bg-indigo-700">Ajouter un Webhook</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Webhook Card 1 */}
                                        <div className="border border-slate-200 rounded-lg p-4 bg-white relative">
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mt-2"></span>
                                            </div>
                                            <h4 className="font-semibold text-slate-900 mb-1">Slack HR Announcements</h4>
                                            <p className="text-xs text-slate-500 font-mono mb-3 truncate" title="https://hooks.slack.com/services/T0000/B0000/XXXX">
                                                https://hooks.slack.com/services/T0000...
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium rounded uppercase tracking-wider">candidate.hired</span>
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium rounded uppercase tracking-wider">employee.created</span>
                                            </div>
                                            <div className="flex justify-between items-center border-t pt-3 mt-1">
                                                <span className="text-xs text-slate-400">Sécurisé via HMAC-SHA256</span>
                                                <Button variant="outline" size="sm" onClick={() => showNotification('Modification de la configuration du webhook...')} className="h-7 text-xs">Modifier</Button>
                                            </div>
                                        </div>

                                        {/* Webhook Card 2 */}
                                        <div className="border border-slate-200 rounded-lg p-4 bg-white relative">
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <span className="flex h-2 w-2 rounded-full bg-slate-300 mt-2"></span>
                                            </div>
                                            <h4 className="font-semibold text-slate-900 mb-1">Teams IT Provisioning</h4>
                                            <p className="text-xs text-slate-500 font-mono mb-3 truncate" title="https://outlook.office.com/webhook/xxx">
                                                https://outlook.office.com/webhook/xx...
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium rounded uppercase tracking-wider">onboarding.started</span>
                                            </div>
                                            <div className="flex justify-between items-center border-t pt-3 mt-1">
                                                <span className="text-xs text-slate-400">Statut : En pause</span>
                                                <Button variant="outline" size="sm" onClick={() => showNotification('Modification de la configuration du webhook...')} className="h-7 text-xs">Modifier</Button>
                                            </div>
                                        </div>
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
                                        <h3 className="font-bold text-slate-900 mb-1">Forfait SIRH Enterprise</h3>
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
