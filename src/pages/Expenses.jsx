import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
    Plus, 
    Receipt, 
    Search, 
    Upload, 
    Scan, 
    CheckCircle2, 
    XCircle, 
    Download, 
    Eye,
    Filter,
    ArrowUpDown,
    MoreVertical,
    Trash2,
    Check,
    X,
    Clock,
    DollarSign,
    Tag,
    Calendar,
    Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Expenses() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [form, setForm] = useState({
        amount: '',
        currency: 'FCFA',
        category: 'Repas',
        merchant: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('sirh_token');

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/expenses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setExpenses(data);
        } catch (error) {
            console.error("Error fetching expenses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        
        // Auto-scan if AI is desired
        setIsScanning(true);
        const formData = new FormData();
        formData.append('receipt', file);

        try {
            const res = await fetch(`${API_URL}/api/expenses/scan`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                const result = await res.json();
                setScanResult(result);
                setForm({
                    amount: result.amount,
                    currency: 'FCFA',
                    category: result.category,
                    merchant: result.merchant,
                    date: result.date || new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error("Scanning error", error);
        } finally {
            setIsScanning(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (Number(form.amount) <= 0) {
            alert('Le montant doit être supérieur à zéro.');
            return;
        }

        const formData = new FormData();
        formData.append('amount', form.amount);
        formData.append('currency', form.currency);
        formData.append('category', form.category);
        formData.append('merchant', form.merchant);
        formData.append('date', form.date);
        if (selectedFile) formData.append('receipt', selectedFile);

        try {
            const res = await fetch(`${API_URL}/api/expenses`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                setShowAddModal(false);
                setForm({ amount: '', currency: 'FCFA', category: 'Repas', merchant: '', date: new Date().toISOString().split('T')[0] });
                setSelectedFile(null);
                setScanResult(null);
                fetchExpenses();
            } else {
                alert('Erreur lors de la soumission de la note de frais.');
            }
        } catch (error) {
            console.error("Error saving expense", error);
            alert('Erreur réseau. Veuillez réessayer.');
        }
    };

    const handleStatusUpdate = async (id, status, reason = '') => {
        try {
            const res = await fetch(`${API_URL}/api/expenses/${id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, rejectionReason: reason })
            });
            if (res.ok) fetchExpenses();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Receipt className="text-indigo-600" size={32} />
                        Notes de Frais
                    </h2>
                    <p className="text-slate-500 font-medium">Gestion et remboursement des dépenses professionnelles.</p>
                </div>
                <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 h-11 px-6 rounded-xl flex items-center gap-2"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={18} />
                    Nouvelle dépense
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400">EN ATTENTE</p>
                            <p className="text-2xl font-black text-slate-900">{expenses.filter(e => e.status === 'En attente').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400">APPROUVÉES</p>
                            <p className="text-2xl font-black text-slate-900">{expenses.filter(e => e.status === 'Approuvé' || e.status === 'APPROVED').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400">TOTAL REMBOURSÉ</p>
                            <p className="text-2xl font-black text-slate-900">
                                {expenses.filter(e => e.status === 'Approuvé' || e.status === 'APPROVED').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()} <span className="text-sm font-medium">FCFA</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses List */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">Liste des demandes</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 gap-2"><Filter size={14}/> Filtrer</Button>
                            <Button variant="outline" size="sm" className="h-8 gap-2"><Download size={14}/> Export</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Collaborateur</th>
                                    <th className="px-6 py-4">Détails</th>
                                    <th className="px-6 py-4">Montant</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-slate-400">Chargement...</td></tr>
                                ) : expenses.length === 0 ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-slate-400 text-sm italic">Aucune note de frais enregistrée.</td></tr>
                                ) : (
                                    expenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {exp.employee?.[0] || '?'}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{exp.employee || 'Anonyme'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">{exp.merchant}</span>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1"><Tag size={10}/> {exp.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-slate-900">{exp.amount.toLocaleString()}</span>
                                                <span className="ml-1 text-[10px] font-bold text-slate-400">{exp.currency}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{exp.date}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={(exp.status === 'Approuvé' || exp.status === 'APPROVED') ? 'success' : (exp.status === 'Rejeté' || exp.status === 'REJECTED') ? 'destructive' : 'secondary'}>
                                                    {exp.status === 'APPROVED' ? 'Approuvé' : exp.status === 'REJECTED' ? 'Rejeté' : exp.status === 'PENDING' ? 'En attente' : exp.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {isAdmin && exp.status === 'En attente' ? (
                                                        <>
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                                onClick={() => handleStatusUpdate(exp.id, 'Approuvé')}
                                                            >
                                                                <Check size={18} />
                                                            </Button>
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                                                                onClick={() => handleStatusUpdate(exp.id, 'Rejeté')}
                                                            >
                                                                <X size={18} />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                                                            <Eye size={18} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Nouvelle Note de Frais</h3>
                                    <p className="text-xs text-slate-500 font-medium">Uploadez votre reçu pour une saisie assistée par l'IA.</p>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowAddModal(false)}><X size={20} /></Button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Upload Section */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Reçu / Facture</label>
                                        <div className="relative group">
                                            <input 
                                                type="file" 
                                                id="receipt-upload" 
                                                className="hidden" 
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange}
                                            />
                                            <label 
                                                htmlFor="receipt-upload"
                                                className="block border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center cursor-pointer group-hover:border-indigo-400 group-hover:bg-indigo-50/30 transition-all relative overflow-hidden"
                                            >
                                                {isScanning ? (
                                                    <div className="space-y-3">
                                                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                        <p className="text-sm font-bold text-indigo-600">L'IA analyse votre reçu...</p>
                                                    </div>
                                                ) : selectedFile ? (
                                                    <div className="space-y-2">
                                                        <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                                                        <p className="text-sm font-bold text-slate-700">{selectedFile.name}</p>
                                                        <p className="text-xs text-slate-400">Cliquez pour changer</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Upload size={40} className="mx-auto text-slate-300 group-hover:text-indigo-400 group-hover:scale-110 transition-transform" />
                                                        <p className="text-sm font-bold text-slate-500">Cliquez ou glissez votre reçu</p>
                                                        <p className="text-xs text-slate-400">JPG, PNG ou PDF (max 5Mo)</p>
                                                    </div>
                                                )}

                                                {scanResult && !isScanning && (
                                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                                        <Scan size={14} />
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        {scanResult && (
                                            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500 text-white rounded-xl">
                                                    <Check size={16} />
                                                </div>
                                                <p className="text-xs font-bold text-emerald-700 leading-tight">Données extraites avec succès par l'IA Gemini !</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fields Section */}
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Montant & Devise</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                        <DollarSign size={16} />
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                        placeholder="0.00"
                                                        value={form.amount}
                                                        onChange={e => setForm({...form, amount: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <select 
                                                    className="bg-slate-50 border-none rounded-xl px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                                    value={form.currency}
                                                    onChange={e => setForm({...form, currency: e.target.value})}
                                                >
                                                    <option>FCFA</option>
                                                    <option>EUR</option>
                                                    <option>USD</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Catégorie</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Tag size={16} />
                                                </div>
                                                <select 
                                                    className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                                                    value={form.category}
                                                    onChange={e => setForm({...form, category: e.target.value})}
                                                >
                                                    <option>Repas</option>
                                                    <option>Transport</option>
                                                    <option>Hébergement</option>
                                                    <option>Fournitures</option>
                                                    <option>Autre</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Marchand / Lieu</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Building2 size={16} />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="ex: Uber, Carrefour..."
                                                    value={form.merchant}
                                                    onChange={e => setForm({...form, merchant: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date de la dépense</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Calendar size={16} />
                                                </div>
                                                <input 
                                                    type="date" 
                                                    className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={form.date}
                                                    onChange={e => setForm({...form, date: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        className="flex-1 h-12 rounded-2xl text-slate-400 font-bold hover:bg-slate-50"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-2xl font-bold shadow-lg shadow-indigo-200"
                                    >
                                        Soumettre la demande
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
