import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Search, MoreHorizontal, CheckCircle2, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { RequirePermission } from '../components/auth/ProtectedRoute';

import seedData from '../../seed_output.json';

const fallbackEmployees = [
    { id: 'EMP001', name: 'Sarah Jenkins', role: 'Directrice RH', systemRole: 'Administrator', department: 'Ressources Humaines', status: 'Actif', email: 'sarah.j@company.com', phone: '+1 234-567-8900', sex: 'Femme', onboardingProgress: 100 },
    { id: 'EMP002', name: 'Michael Dam', role: 'Ingénieur Frontend', systemRole: 'Employee', department: 'Ingénierie', status: 'Actif', email: 'michael.d@company.com', phone: '+1 234-567-8901', sex: 'Homme', onboardingProgress: 100 },
    { id: 'EMP003', name: 'Amanda Smith', role: 'Responsable Marketing', systemRole: 'Employee', department: 'Marketing', status: 'En congé', email: 'amanda.s@company.com', phone: '+1 234-567-8902', sex: 'Femme', onboardingProgress: 100 },
    { id: 'EMP004', name: 'John Doe', role: 'Commercial', systemRole: 'Employee', department: 'Ventes', status: 'Actif', email: 'john.d@company.com', phone: '+1 234-567-8903', sex: 'Homme', onboardingProgress: 100 },
    { id: 'EMP005', name: 'Robert Fox', role: 'Product Designer', systemRole: 'Employee', department: 'Design', status: 'Actif', email: 'robert.f@company.com', phone: '+1 234-567-8904', sex: 'Homme', onboardingProgress: 100 },
    { id: 'EMP006', name: 'Lisa Ray', role: 'Ingénieur Backend', systemRole: 'Employee', department: 'Ingénierie', status: 'Ancien employé', email: 'lisa.r@company.com', phone: '+1 234-567-8905', sex: 'Femme', onboardingProgress: 40 },
];

const mapSeededEmployees = () => {
    try {
        if (!seedData || !seedData.employees || seedData.employees.length === 0) return fallbackEmployees;

        return seedData.employees.map((emp, index) => ({
            id: `EMP${String(index + 1).padStart(3, '0')}`,
            name: `${emp.first_name} ${emp.last_name}`,
            role: emp.position_title,
            systemRole: emp.role === 'Employee' ? 'Employee' : emp.role,
            department: emp.department,
            status: emp.status === 'ACTIVE' ? 'Actif' : emp.status === 'ON_LEAVE' ? 'En congé' : 'Ancien employé',
            email: emp.email,
            phone: `+225 01${Math.floor(10000000 + Math.random() * 89999999)}`,
            sex: 'Non spécifié',
            onboardingProgress: emp.status === 'ACTIVE' ? 100 : Math.floor(Math.random() * 80) + 20
        }));
    } catch (e) {
        return fallbackEmployees;
    }
};

const getInitialEmployees = () => {
    const stored = localStorage.getItem('sirh_employees');
    if (stored) return JSON.parse(stored);
    const initial = mapSeededEmployees();
    localStorage.setItem('sirh_employees', JSON.stringify(initial));
    return initial;
};

const initialEmployees = getInitialEmployees();

const roleLabels = {
    'Administrator': 'Administrateur',
    'HR': 'RH',
    'Employee': 'Employé',
    'Social Worker': 'Assistante Sociale'
};

export function Employees() {
    const [employees, setEmployees] = useState([]);
    const [notification, setNotification] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialisation API
    useEffect(() => {
        fetch('http://localhost:3000/api/employees')
            .then(res => res.json())
            .then(data => {
                const mapped = data.map(emp => ({
                    id: emp.id,
                    name: `${emp.firstName} ${emp.lastName}`,
                    role: emp.positionTitle || 'Poste Non Assigné',
                    systemRole: emp.role || 'Employee',
                    department: emp.department || 'Non assigné',
                    status: emp.status === 'ACTIVE' ? 'Actif' : emp.status === 'ON_LEAVE' ? 'En congé' : 'Ancien employé',
                    email: emp.email,
                    phone: '+225 01234567', // A ajouter dans la BDD dans le futur
                    sex: 'Non spécifié',
                    onboardingProgress: emp.status === 'ACTIVE' ? 100 : 0
                }));
                // Combine with local mock fallback if API is empty
                setEmployees(mapped.length > 0 ? mapped : initialEmployees);
            })
            .catch(err => {
                console.error('API non joignable, fallback local:', err);
                setEmployees(initialEmployees);
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Form state corresponding to user request
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        position: '',
        sex: 'Homme'
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
            const res = await fetch('http://localhost:3000/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@entreprise.com`,
                    role: 'Employee',
                    department: 'Ressources Humaines', // Simplified default
                    positionTitle: formData.position || 'Poste Non Assigné',
                    status: 'ACTIVE'
                })
            });

            const dbEmp = await res.json();
            if (!res.ok) throw new Error(dbEmp.error || "Erreur création API");

            const newEmp = {
                id: dbEmp.id || `EMP00${employees.length + 1}`,
                name: `${dbEmp.firstName} ${dbEmp.lastName}`,
                role: dbEmp.positionTitle,
                systemRole: dbEmp.role,
                department: dbEmp.department,
                status: 'Actif',
                email: dbEmp.email,
                phone: formData.phone,
                sex: formData.sex,
                onboardingProgress: 0
            };

            const updatedEmployees = [newEmp, ...employees];
            setEmployees(updatedEmployees);
            localStorage.setItem('sirh_employees', JSON.stringify(updatedEmployees)); // Keeps fallback
            setIsAddModalOpen(false);
            setFormData({ firstName: '', lastName: '', phone: '', position: '', sex: 'Homme' }); // Reset form
            showNotification(`Profil créé sur Base de données globale pour ${formData.firstName}.`);

        } catch (error) {
            console.error(error);
            showNotification("Erreur de connexion au serveur Backend.");
        }
    };

    const handleExport = () => {
        showNotification('Annuaire des employés exporté avec succès en CSV.');
    };

    const handleRowAction = (name) => {
        showNotification(`Menu contextuel ouvert pour ${name}`);
    };

    const handleRoleChange = async (empId, newRole) => {
        // Envoi de la requête au Backend pour simuler une modification (Audit Trail l'interceptera si câblé)
        try {
            await fetch(`http://localhost:3000/api/employees/${empId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            const updated = employees.map(emp =>
                emp.id === empId ? { ...emp, systemRole: newRole } : emp
            );
            setEmployees(updated);
            localStorage.setItem('sirh_employees', JSON.stringify(updated));
            showNotification(`Accès métier mis à jour en BDD avec succès : ${newRole}`);
        } catch (e) {
            showNotification("Erreur de modification Backend.");
        }
    };

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
                                        <label className="text-sm font-medium text-slate-700">Sexe</label>
                                        <select
                                            name="sex"
                                            value={formData.sex}
                                            onChange={handleInputChange}
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="Homme">Homme</option>
                                            <option value="Femme">Femme</option>
                                            <option value="Autre">Autre</option>
                                            <option value="Préfère ne pas répondre">Préfère ne pas répondre</option>
                                        </select>
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

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Employés</h2>
                    <p className="text-slate-500 mt-1">Gérez les membres de votre équipe et leurs permissions d'accès.</p>
                </div>
                <div className="flex items-center space-x-2">
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
                            <Input placeholder="Rechercher des employés..." className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
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
                            {employees.map((emp) => (
                                <TableRow key={emp.id}>
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
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRowAction(emp.name)}>
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
