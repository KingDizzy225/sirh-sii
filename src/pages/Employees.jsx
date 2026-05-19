import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Check, X, Search, Calendar as CalendarIcon, CheckCircle2, ChevronDown, MoreHorizontal, Plus, Trash2, Pencil, Eye, UserX, Sparkles } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { RequirePermission } from '../components/auth/ProtectedRoute';

const roleLabels = {
    'Administrator': 'Administrateur',
    'HR': 'RH',
    'Employee': 'Employé',
    'Social Worker': 'Assistante Sociale'
};

export function Employees() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [notification, setNotification] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [contextMenu, setContextMenu] = useState(null); // { emp, x, y }
    const [editModal, setEditModal] = useState(null); // employee being edited
    const [editForm, setEditForm] = useState({});
    const fileInputRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Initialisation API
    const loadEmployees = () => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('sirh_token');
        fetch(`${API_URL}/api/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)){
                    const mapped = data.map(emp => ({
                        id: emp.id,
                        name: `${emp.firstName} ${emp.lastName}`,
                        role: emp.positionTitle || 'Poste Non Assigné',
                        systemRole: emp.role || 'Employee',
                        department: emp.department || 'Non assigné',
                        status: emp.status === 'ACTIVE' ? 'Actif' : emp.status === 'ON_LEAVE' ? 'En congé' : 'Ancien employé',
                        email: emp.email,
                        phone: emp.phone || '',
                        gender: emp.gender || 'Non spécifié',
                        birthDate: emp.birthDate ? emp.birthDate.split('T')[0] : '',
                        address: emp.address || '',
                        nationality: emp.nationality || '',
                        onboardingProgress: emp.status === 'ACTIVE' ? 100 : 0
                    }));
                    setEmployees(mapped);
                } else {
                    setEmployees([]);
                }
            })
            .catch(err => {
                console.error('API non joignable:', err);
                showNotification("Erreur lors du chargement des employés depuis la base de données.");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    // Form state corresponding to user request
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        position: '',
        gender: 'Non spécifié',
        birthDate: '',
        address: '',
        nationality: ''
    });

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEmployeeSubmit = async (e) => {
        e.preventDefault();

        // Ensure name and surname are provided
        if (!formData.firstName || !formData.lastName) {
            showNotification('Veuillez fournir le nom et le prénom.');
            return;
        }

        try {
            // Push towards real Backend Postgres API
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@entreprise.com`,
                    role: 'Employee',
                    department: 'Ressources Humaines', // Simplified default
                    positionTitle: formData.position || 'Poste Non Assigné',
                    status: 'ACTIVE',
                    phone: formData.phone,
                    gender: formData.gender,
                    birthDate: formData.birthDate,
                    address: formData.address,
                    nationality: formData.nationality
                })
            });

            const dbEmp = await res.json();
            if (!res.ok) throw new Error(dbEmp.error || "Erreur création API");

            const newEmployeeFormatted = {
                id: dbEmp.id || Date.now().toString(),
                name: `${formData.firstName} ${formData.lastName}`,
                role: formData.position || 'Poste Non Assigné',
                systemRole: 'Employee',
                department: 'Ressources Humaines',
                status: 'Actif',
                email: `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@entreprise.com`,
                phone: formData.phone,
                sex: formData.sex,
                onboardingProgress: 100
            };

            const updatedEmployees = [newEmployeeFormatted, ...employees];
            setEmployees(updatedEmployees);
            setIsAddModalOpen(false);
            setFormData({ firstName: '', lastName: '', phone: '', position: '', gender: 'Non spécifié', birthDate: '', address: '', nationality: '' }); // Reset form
            showNotification(`Employé ajouté à la base de données globale.`);

        } catch (error) {
            console.error("Détails de l'erreur frontend :", error);
            showNotification(error.message || "Erreur de connexion au serveur Backend.");
        }
    };

    const handleExport = () => {
        if (employees.length === 0) {
            showNotification('Aucune donnée à exporter.');
            return;
        }
        try {
            const csv = Papa.unparse(employees.map(emp => ({
                ID: emp.id,
                Nom: emp.name,
                Poste: emp.role,
                Département: emp.department,
                Statut: emp.status,
                Email: emp.email,
                Téléphone: emp.phone || '',
                Sexe: emp.sex || ''
            })));
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Annuaire_Employes_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification('Annuaire des employés exporté avec succès en CSV.');
        } catch (error) {
            console.error("Export error", error);
            showNotification('Erreur lors de l\'export CSV.');
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedEmployees(employees.map(emp => emp.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleSelectEmployee = (id, checked) => {
        if (checked) {
            setSelectedEmployees(prev => [...prev, id]);
        } else {
            setSelectedEmployees(prev => prev.filter(empId => empId !== id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedEmployees.length === 0) return;
        if (!confirm(`Toutes les données associées à ces ${selectedEmployees.length} employés seront définitivement effacées. Continuer ?`)) return;

        try {
            const token = localStorage.getItem('sirh_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const res = await fetch(`${API_URL}/api/employees/bulk`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ids: selectedEmployees })
            });

            if (res.ok) {
                const remainingEmployees = employees.filter(emp => !selectedEmployees.includes(emp.id));
                setEmployees(remainingEmployees);
                setSelectedEmployees([]);
                showNotification(`${selectedEmployees.length} employé(s) supprimé(s) définitivement de la base de données.`);
            } else {
                throw new Error("Erreur serveur lors de la suppression.");
            }
        } catch (error) {
            console.error("Delete Error", error);
            showNotification("Erreur de connexion. Impossible de supprimer.");
        }
    };

    const triggerImport = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const token = localStorage.getItem('sirh_token');
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    const res = await fetch(`${API_URL}/api/employees/bulk`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ employees: results.data })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        showNotification(data.message);
                        loadEmployees(); // Refresh directly from the server after CSV insertion
                    } else {
                        throw new Error('Erreur Server Bulk Import');
                    }
                } catch (error) {
                    console.error("Erreur Import CSV:", error);
                    showNotification("Erreur lors de l'importation. Vérifiez le format du CSV (colonnes firstName, lastName, email obligatoires).");
                }
                event.target.value = null; // reset
            },
            error: (error) => showNotification("Impossible de lire ce fichier CSV : " + error.message)
        });
    };

    const openContextMenu = (e, emp) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setContextMenu({ emp, x: rect.left - 160, y: rect.bottom + 4 });
    };

    const closeContextMenu = () => setContextMenu(null);

    const openEdit = (emp) => {
        setEditForm({
            firstName: emp.name.split(' ')[0] || '',
            lastName: emp.name.split(' ').slice(1).join(' ') || '',
            email: emp.email,
            phone: emp.phone,
            gender: emp.gender,
            birthDate: emp.birthDate,
            address: emp.address,
            nationality: emp.nationality,
            positionTitle: emp.role,
            department: emp.department,
            status: emp.status === 'Actif' ? 'ACTIVE' : emp.status === 'En congé' ? 'ON_LEAVE' : 'TERMINATED'
        });
        setEditModal(emp);
        closeContextMenu();
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('sirh_token');
        try {
            const res = await fetch(`${API_URL}/api/employees/${editModal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setEditModal(null);
                loadEmployees();
                showNotification('Employé mis à jour avec succès.');
            } else {
                showNotification('Erreur lors de la mise à jour.');
            }
        } catch { showNotification('Erreur de connexion.'); }
    };

    const handleDeleteOne = async (emp) => {
        closeContextMenu();
        if (!confirm(`Supprimer définitivement ${emp.name} ?`)) return;
        const token = localStorage.getItem('sirh_token');
        try {
            const res = await fetch(`${API_URL}/api/employees/${emp.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                loadEmployees();
                showNotification(`${emp.name} supprimé.`);
            }
        } catch { showNotification('Erreur lors de la suppression.'); }
    };

    const handleRowAction = (name) => {
        showNotification(`Menu contextuel ouvert pour ${name}`);
    };

    const handleRoleChange = async (empId, newRole) => {
        // Envoi de la requête au Backend pour simuler une modification (Audit Trail l'interceptera si câblé)
        try {
            const token = localStorage.getItem('sirh_token');
            await fetch(`${API_URL}/api/employees/${empId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            const updated = employees.map(emp =>
                emp.id === empId ? { ...emp, systemRole: newRole } : emp
            );
            setEmployees(updated);
            showNotification(`Accès métier mis à jour en BDD avec succès : ${newRole}`);
        } catch (e) {
            showNotification("Erreur de modification Backend.");
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative" onClick={closeContextMenu}>

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

            {/* Add Employee Modal Overlay */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Ajouter un Employé</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsAddModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="add-employee-form" onSubmit={handleAddEmployeeSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Prénom</label>
                                            <Input
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="ex. Jane"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Nom de famille</label>
                                            <Input
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="ex. Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Numéro de Téléphone</label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="ex. +225 01 23 45 67 89"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Poste</label>
                                        <Input
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            placeholder="ex. Lead Designer"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Date de Naissance</label>
                                        <Input
                                            type="date"
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Sexe / Genre</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="Non spécifié">Non spécifié</option>
                                                <option value="Homme">Homme</option>
                                                <option value="Femme">Femme</option>
                                                <option value="Autre">Autre</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Nationalité</label>
                                            <Input
                                                name="nationality"
                                                value={formData.nationality}
                                                onChange={handleInputChange}
                                                placeholder="ex. Ivoirienne"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Adresse Complète</label>
                                        <Input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="ex. Cocody Riviera, Abidjan"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="add-employee-form" className="bg-primary hover:bg-primary/90 text-primary-foreground">Enregistrer l'Employé</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Context Menu Dropdown */}
            <AnimatePresence>
                {contextMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed z-[200] bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 w-48 overflow-hidden"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => navigate(`/employees/${contextMenu.emp.id}`)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium">
                            <Eye size={14} className="text-emerald-500" /> Voir le profil complet
                        </button>
                        <button onClick={() => openEdit(contextMenu.emp)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium">
                            <Pencil size={14} className="text-blue-500" /> Modifier l'employé
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button onClick={() => handleDeleteOne(contextMenu.emp)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium">
                            <UserX size={14} /> Supprimer
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Employee Modal */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditModal(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                            onClick={e => e.stopPropagation()}>
                            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
                                <h3 className="text-lg font-bold text-white">Modifier l'Employé</h3>
                                <button onClick={() => setEditModal(null)} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-sm font-medium text-slate-700 block mb-1">Prénom</label>
                                        <Input value={editForm.firstName || ''} onChange={e => setEditForm({...editForm, firstName: e.target.value})} /></div>
                                    <div><label className="text-sm font-medium text-slate-700 block mb-1">Nom</label>
                                        <Input value={editForm.lastName || ''} onChange={e => setEditForm({...editForm, lastName: e.target.value})} /></div>
                                </div>
                                <div><label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
                                    <Input type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-sm font-medium text-slate-700 block mb-1">Poste</label>
                                        <Input value={editForm.positionTitle || ''} onChange={e => setEditForm({...editForm, positionTitle: e.target.value})} /></div>
                                    <div><label className="text-sm font-medium text-slate-700 block mb-1">Département</label>
                                        <Input value={editForm.department || ''} onChange={e => setEditForm({...editForm, department: e.target.value})} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-sm font-medium text-slate-700 block mb-1">Téléphone</label>
                                        <Input value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                                    <div><label className="text-sm font-medium text-slate-700 block mb-1">Date de Naissance</label>
                                        <Input type="date" value={editForm.birthDate || ''} onChange={e => setEditForm({...editForm, birthDate: e.target.value})} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-sm font-medium text-slate-700 block mb-1">Sexe / Genre</label>
                                        <select value={editForm.gender || 'Non spécifié'} onChange={e => setEditForm({...editForm, gender: e.target.value})}
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                            <option value="Non spécifié">Non spécifié</option>
                                            <option value="Homme">Homme</option>
                                            <option value="Femme">Femme</option>
                                            <option value="Autre">Autre</option>
                                        </select></div>
                                    <div><label className="text-sm font-medium text-slate-700 block mb-1">Nationalité</label>
                                        <Input value={editForm.nationality || ''} onChange={e => setEditForm({...editForm, nationality: e.target.value})} /></div>
                                </div>
                                <div><label className="text-sm font-medium text-slate-700 block mb-1">Adresse</label>
                                    <Input value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} /></div>
                                <div><label className="text-sm font-medium text-slate-700 block mb-1">Statut</label>
                                    <select value={editForm.status || 'ACTIVE'} onChange={e => setEditForm({...editForm, status: e.target.value})}
                                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                                        <option value="ACTIVE">Actif</option>
                                        <option value="ON_LEAVE">En congé</option>
                                        <option value="TERMINATED">Ancien employé</option>
                                    </select></div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setEditModal(null)}>Annuler</Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Sauvegarder</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Employés</h2>
                    <p className="text-slate-500 mt-1">Gérez les membres de votre équipe et leurs permissions d'accès.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    {selectedEmployees.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Button variant="destructive" className="gap-2 shadow-sm font-medium" onClick={handleDeleteSelected}>
                                <Trash2 size={16} /> Supprimer ({selectedEmployees.length})
                            </Button>
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium" onClick={() => showNotification(`Génération d'attestations IA pour ${selectedEmployees.length} employés...`)}>
                                <Sparkles size={16} /> Action IA Groupée
                            </Button>
                        </div>
                    )}
                    <Button variant="outline" onClick={triggerImport}>Importer CSV</Button>
                    <Button variant="outline" onClick={handleExport}>Exporter CSV</Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={16} /> Ajouter un Employé
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Tous les Employés</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Rechercher des employés..." className="pl-9"
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 w-4 h-4 cursor-pointer accent-blue-600"
                                        checked={selectedEmployees.length === employees.length && employees.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Employé</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Département</TableHead>
                                <TableHead>Intégration</TableHead>
                                <TableHead>Niveau d'Accès</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.filter(emp =>
                                !searchQuery ||
                                emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                emp.department.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((emp) => (
                                <TableRow key={emp.id} className={selectedEmployees.includes(emp.id) ? "bg-blue-50/50" : ""}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 w-4 h-4 cursor-pointer accent-blue-600"
                                            checked={selectedEmployees.includes(emp.id)}
                                            onChange={(e) => handleSelectEmployee(emp.id, e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground">
                                                {emp.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{emp.name}</div>
                                                <div className="text-xs text-slate-500">{emp.email} • {emp.phone || 'Pas de téléphone'}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{emp.role}</TableCell>
                                    <TableCell className="text-slate-600">{emp.department}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 w-32">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-medium">Progression</span>
                                                <span className={emp.onboardingProgress === 100 ? 'text-emerald-600 font-bold' : 'text-slate-700 font-medium'}>{emp.onboardingProgress}%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-1.5 border border-muted/50 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${emp.onboardingProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${emp.onboardingProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <RequirePermission permission="employees:edit" fallback={<span className="text-slate-600 font-medium">{roleLabels[emp.systemRole] || emp.systemRole}</span>}>
                                            <select
                                                value={emp.systemRole}
                                                onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                                                className="flex h-8 w-full max-w-[140px] rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
                                            >
                                                <option value="Administrator">Administrateur</option>
                                                <option value="HR">RH</option>
                                                <option value="Employee">Employé</option>
                                                <option value="Social Worker">Assistante Sociale</option>
                                            </select>
                                        </RequirePermission>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={emp.status === 'Actif' ? 'success' : emp.status === 'En congé' ? 'warning' : 'destructive'}>
                                            {emp.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => openContextMenu(e, emp)}>
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    );
}
