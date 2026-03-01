import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Receipt, Plus, Upload, Check, X, DollarSign, Calendar as CalendarIcon, FileImage } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';

const initialExpenses = [
    { id: 'EXP-101', employee: 'Sarah Jenkins', amount: 30000, currency: 'FCFA', category: 'Repas', date: '24 Oct 2026', merchant: 'Le Bistro', status: 'Approuvé' },
    { id: 'EXP-102', employee: 'John Doe', amount: 75000, currency: 'FCFA', category: 'Transport', date: '23 Oct 2026', merchant: 'SNCF', status: 'En attente' },
    { id: 'EXP-103', employee: 'Amanda Smith', amount: 225000, currency: 'FCFA', category: 'Hébergement', date: '21 Oct 2026', merchant: 'Hotel Mercure', status: 'En attente' },
    { id: 'EXP-104', employee: 'Sarah Jenkins', amount: 10000, currency: 'FCFA', category: 'Transport', date: '20 Oct 2026', merchant: 'Uber', status: 'Remboursé' },
    { id: 'EXP-105', employee: 'Sarah Jenkins', amount: 55000, currency: 'FCFA', category: 'Équipement', date: '15 Oct 2026', merchant: 'Amazon', status: 'Rejeté', rejectionReason: 'Approbation du budget matériel manquante' }
];

export function Expenses() {
    const [activeTab, setActiveTab] = useState('my-expenses');
    const [expenses, setExpenses] = useState(initialExpenses);
    const [notification, setNotification] = useState(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    const currentUser = 'Sarah Jenkins';

    const [expenseForm, setExpenseForm] = useState({
        amount: '',
        category: 'Meals',
        date: '',
        merchant: '',
        description: ''
    });

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        if (!expenseForm.amount || !expenseForm.date || !expenseForm.merchant) {
            showNotification('Please fill in required fields.');
            return;
        }

        const shortMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const d = new Date(expenseForm.date);
        const dateStr = `${String(d.getDate()).padStart(2, '0')} ${shortMonths[d.getMonth()]} ${d.getFullYear()}`;

        const newExpense = {
            id: `EXP-10${expenses.length + 6}`,
            employee: currentUser,
            amount: parseFloat(expenseForm.amount),
            currency: 'FCFA',
            category: expenseForm.category,
            date: dateStr,
            merchant: expenseForm.merchant,
            status: 'En attente'
        };

        setExpenses([newExpense, ...expenses]);
        setIsExpenseModalOpen(false);
        setExpenseForm({ amount: '', category: 'Repas', date: '', merchant: '', description: '' });
        showNotification('Note de frais soumise avec succès.');
    };

    const handleApprove = (id) => {
        setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, status: 'Approuvé' } : exp));
        showNotification(`Note de frais ${id} approuvée`);
    };

    const handleReject = (id) => {
        setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, status: 'Rejeté', rejectionReason: 'Examen par le responsable : hors politique' } : exp));
        showNotification(`Note de frais ${id} rejetée`);
    };

    const myExpenses = expenses.filter(e => e.employee === currentUser);
    const pendingApprovals = expenses.filter(e => e.status === 'Pending' && e.employee !== currentUser);

    const totalPending = pendingApprovals.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <Check size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Expense Modal */}
            <AnimatePresence>
                {isExpenseModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">Nouvelle Note de Frais</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsExpenseModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto">
                                <form id="add-expense-form" onSubmit={handleExpenseSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Montant (FCFA)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <DollarSign size={16} className="text-slate-400" />
                                                </div>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    className="pl-9"
                                                    value={expenseForm.amount}
                                                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Catégorie</label>
                                            <select
                                                value={expenseForm.category}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="Repas">Repas</option>
                                                <option value="Transport">Transport</option>
                                                <option value="Hébergement">Hébergement</option>
                                                <option value="Équipement">Équipement</option>
                                                <option value="Divertissement Client">Divertissement Client</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Date de la Dépense</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <CalendarIcon size={16} className="text-slate-400" />
                                                </div>
                                                <Input
                                                    type="date"
                                                    className="pl-9"
                                                    value={expenseForm.date}
                                                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Commerçant</label>
                                            <Input
                                                value={expenseForm.merchant}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, merchant: e.target.value })}
                                                placeholder="ex. Starbucks, Uber"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Description (Optionnelle)</label>
                                        <textarea
                                            value={expenseForm.description}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                            className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Objectif professionnel de cette dépense..."
                                        />
                                    </div>
                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                        <label className="text-sm font-medium text-slate-700">Reçu / Facture</label>
                                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <Upload size={20} />
                                            </div>
                                            <p className="text-sm font-medium text-slate-900">Cliquez pour télécharger ou glissez le reçu ici</p>
                                            <p className="text-xs text-slate-500 mt-1">PDF, JPG ou PNG (Max. 5Mo)</p>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Annuler</Button>
                                <Button type="submit" form="add-expense-form" className="bg-blue-600 hover:bg-blue-700 text-white">Soumettre</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Notes de Frais</h2>
                    <p className="text-slate-500 mt-1">Soumettez, suivez et approuvez les dépenses d'entreprise.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setIsExpenseModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus size={18} /> Nouvelle Dépense
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max mb-6">
                <button
                    onClick={() => setActiveTab('my-expenses')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'my-expenses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <Receipt size={16} /> Mes Dépenses
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <Check size={16} /> Approbations en Attente
                    {pendingApprovals.length > 0 && (
                        <span className="ml-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingApprovals.length}</span>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'my-expenses' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2 text-sm font-medium text-slate-500">Non soumises / Brouillons</CardHeader>
                            <CardContent className="text-3xl font-bold text-slate-900">0 FCFA</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 text-sm font-medium text-slate-500">En Examen</CardHeader>
                            <CardContent className="text-3xl font-bold text-amber-600">
                                {myExpenses.filter(e => e.status === 'En attente').reduce((a, b) => a + b.amount, 0).toFixed(0)} FCFA
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 text-sm font-medium text-slate-500">Remboursées (Année)</CardHeader>
                            <CardContent className="text-3xl font-bold text-emerald-600">
                                {myExpenses.filter(e => e.status === 'Remboursé').reduce((a, b) => a + b.amount, 0).toFixed(0)} FCFA
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Historique des Dépenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Commerçant</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Reçu</TableHead>
                                        <TableHead>Statut</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myExpenses.map((exp) => (
                                        <TableRow key={exp.id}>
                                            <TableCell className="text-slate-600 font-medium">{exp.date}</TableCell>
                                            <TableCell className="text-slate-900">{exp.merchant}</TableCell>
                                            <TableCell className="text-slate-500">{exp.category}</TableCell>
                                            <TableCell className="font-semibold text-slate-900">{exp.amount.toFixed(0)} {exp.currency}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50 px-2" onClick={() => showNotification(`Ouverture du justificatif pour ${exp.merchant}`)}><FileImage size={14} className="mr-1.5" /> Voir</Button>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={exp.status === 'Approuvé' ? 'success' : exp.status === 'Remboursé' ? 'blue' : exp.status === 'En attente' ? 'warning' : 'destructive'}>
                                                    {exp.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'approvals' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="bg-gradient-to-br from-amber-500 to-amber-700 text-white border-0 shadow-md mb-6">
                        <CardHeader className="pb-2 text-sm font-medium text-amber-100">Total Approbations en Attente</CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{totalPending.toFixed(0)} FCFA</div>
                            <p className="text-amber-200 text-xs mt-1">{pendingApprovals.length} demandes en attente de votre examen</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Dépenses de l'Équipe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employé</TableHead>
                                        <TableHead>Date & Commerçant</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Reçu</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingApprovals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">À jour ! Aucune dépense en attente d'approbation.</TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingApprovals.map((exp) => (
                                            <TableRow key={exp.id}>
                                                <TableCell className="font-medium text-slate-900">{exp.employee}</TableCell>
                                                <TableCell>
                                                    <div className="text-slate-900 font-medium">{exp.merchant}</div>
                                                    <div className="text-slate-500 text-xs">{exp.date}</div>
                                                </TableCell>
                                                <TableCell className="text-slate-500">{exp.category}</TableCell>
                                                <TableCell className="font-bold text-slate-900">{exp.amount.toFixed(0)} {exp.currency}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50 px-2" onClick={() => showNotification(`Ouverture du justificatif de ${exp.employee}`)}><FileImage size={14} /></Button>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleApprove(exp.id)}
                                                            className="h-8 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                                        >
                                                            <Check size={14} className="mr-1" /> Approuver
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReject(exp.id)}
                                                            className="h-8 border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                                        >
                                                            <X size={14} className="mr-1" /> Rejeter
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
