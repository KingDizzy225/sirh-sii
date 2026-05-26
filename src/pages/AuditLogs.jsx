import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { ShieldAlert, User, Clock, Database, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { api } from '../lib/api';

export function AuditLogs() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data: result } = await api.get(`/audit?page=${page}&limit=20`);
            setLogs(result.data || []);
            setTotalPages(result.pagination?.totalPages || 1);
        } catch (err) {
            console.error("Error fetching audit logs", err);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <ShieldAlert size={64} className="mx-auto text-rose-500" />
                    <h2 className="text-2xl font-bold text-slate-900">Accès Refusé</h2>
                    <p className="text-slate-500">La piste d'audit est strictement réservée aux administrateurs système (Zero-Trust).</p>
                </div>
            </div>
        );
    }

    const getActionColor = (action) => {
        switch(action) {
            case 'POST': return 'bg-emerald-100 text-emerald-700';
            case 'PUT':
            case 'PATCH': return 'bg-blue-100 text-blue-700';
            case 'DELETE': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Activity className="text-indigo-600" />
                        Piste d'Audit (Audit Trail)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Journalisation immuable de toutes les modifications système.</p>
                </div>
            </div>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                    <CardTitle className="text-lg">Historique des Requêtes Sensibles</CardTitle>
                    <CardDescription className="text-slate-400">Toutes les actions POST, PUT, DELETE sont tracées ici.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Horodatage</th>
                                    <th className="px-6 py-4">Utilisateur</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Module (Table)</th>
                                    <th className="px-6 py-4">ID Cible</th>
                                    <th className="px-6 py-4">Adresse IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12">Chargement de la piste d'audit...</td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-slate-500">Aucun journal trouvé.</td>
                                    </tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap text-slate-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-slate-400" />
                                                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <User size={14} className="text-indigo-400" />
                                                    <span className="font-medium">{log.userId}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Database size={14} className="text-amber-500" />
                                                    {log.tableName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-slate-500 text-xs font-mono">
                                                {log.recordId}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-slate-500 text-xs">
                                                {log.ipAddress}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                        <span className="text-sm text-slate-500">Page {page} sur {totalPages || 1}</span>
                        <div className="flex gap-2">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                disabled={page === totalPages || totalPages === 0}
                                onClick={() => setPage(p => p + 1)}
                                className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
