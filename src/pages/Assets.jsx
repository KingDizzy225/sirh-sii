import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Laptop, Smartphone, Car, Plus, Search, CheckCircle2, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const initialAssets = [
    { id: 'AST-001', tag: 'IT-MAC-001', category: 'Laptop', name: 'MacBook Pro M2 14"', status: 'Assigné', assignedTo: 'Sarah Jenkins', department: 'Ressources Humaines', date: '2023-01-15', condition: 'Bon' },
    { id: 'AST-002', tag: 'IT-MAC-002', category: 'Laptop', name: 'MacBook Pro M2 14"', status: 'Disponible', assignedTo: '-', department: 'Ingénierie', date: '2023-06-20', condition: 'Neuf' },
    { id: 'AST-003', tag: 'IT-PHO-001', category: 'Mobile Phone', name: 'iPhone 14 Pro', status: 'Assigné', assignedTo: 'John Doe', department: 'Ventes', date: '2022-11-05', condition: 'Bon' },
    { id: 'AST-004', tag: 'VH-CAR-001', category: 'Vehicle', name: 'Peugeot 208', status: 'Assigné', assignedTo: 'Amanda Smith', department: 'Marketing', date: '2021-04-12', condition: 'Réparation requise' },
    { id: 'AST-005', tag: 'IT-MAC-003', category: 'Laptop', name: 'MacBook Air M1', status: 'En réparation', assignedTo: '-', department: 'IT', date: '2020-09-30', condition: 'Écran cassé' },
];

export function Assets() {
    const [assets, setAssets] = useState(initialAssets);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Laptop': return <Laptop size={16} className="text-slate-500" />;
            case 'Mobile Phone': return <Smartphone size={16} className="text-slate-500" />;
            case 'Vehicle': return <Car size={16} className="text-slate-500" />;
            default: return <Laptop size={16} className="text-slate-500" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Disponible': return <Badge className="bg-emerald-100 text-emerald-800 border-none">Disponible</Badge>;
            case 'Assigné': return <Badge className="bg-blue-100 text-blue-800 border-none">Assigné</Badge>;
            case 'En réparation': return <Badge className="bg-orange-100 text-orange-800 border-none">En réparation</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const totalAssets = assets.length;
    const availableAssets = assets.filter(a => a.status === 'Disponible').length;
    const assignedAssets = assets.filter(a => a.status === 'Assigné').length;
    const repairAssets = assets.filter(a => a.status === 'En réparation').length;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <CheckCircle2 size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Laptop className="h-8 w-8 text-blue-600" />
                        Matériel & Flotte
                    </h2>
                    <p className="text-slate-500 mt-1">Gérez l'inventaire des équipements et leurs assignations.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => showNotification("Export CSV lancé.")}>Exporter</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nouvel Équipement
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Matériel</CardTitle>
                        <Laptop className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalAssets}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Disponibles</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{availableAssets}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Assignés</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{assignedAssets}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">En Réparation</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{repairAssets}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card className="border-none shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-800">Registre d'Inventaire</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher tag, nom, employé..."
                                className="pl-9 bg-slate-50 border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[100px]">Catégorie</TableHead>
                                <TableHead>Tag ID</TableHead>
                                <TableHead>Modèle / Nom</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Assigné à</TableHead>
                                <TableHead>Département</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAssets.map((asset) => (
                                <TableRow key={asset.id} className="hover:bg-slate-50/50 cursor-pointer transition-colors">
                                    <TableCell>
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100">
                                            {getCategoryIcon(asset.category)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900">{asset.tag}</TableCell>
                                    <TableCell>
                                        <p className="font-semibold text-slate-800">{asset.name}</p>
                                        <p className="text-xs text-slate-500">Acquis le {asset.date}</p>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                                    <TableCell>
                                        <span className={asset.assignedTo === '-' ? 'text-slate-400 italic' : 'font-medium text-slate-700'}>
                                            {asset.assignedTo}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{asset.department}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => showNotification(`Détails de ${asset.tag}`)}>
                                            Gérer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredAssets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                        Aucun équipement trouvé.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Asset Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Ajouter un Équipement</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsAddModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Catégorie</label>
                                    <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                                        <option>Laptop</option>
                                        <option>Mobile Phone</option>
                                        <option>Vehicle</option>
                                        <option>Access Badge</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Modèle / Description</label>
                                    <Input placeholder="ex: Dell XPS 15" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tag / N° de Série (Optionnel)</label>
                                    <Input placeholder="Généré automatiquement si vide" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Département Propriétaire</label>
                                    <Input placeholder="ex: IT, R&D..." />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                                    showNotification("Le nouvel équipement a été ajouté à l'inventaire en statut 'Disponible'.");
                                    setIsAddModalOpen(false);
                                }}>
                                    Ajouter à l'inventaire
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
