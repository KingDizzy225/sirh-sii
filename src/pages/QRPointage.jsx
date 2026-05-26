import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { QrCode, Search, Download, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export function QRPointage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrCodes, setQrCodes] = useState({});
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const { data } = await api.get('/employees');
                if (Array.isArray(data)) {
                    setEmployees(data);
                }
            } catch (err) {
                console.error("Failed to fetch employees", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const generateQR = async (employeeId) => {
        try {
            const { data } = await api.get(`/qr/generate/${employeeId}`);
            setQrCodes(prev => ({ ...prev, [employeeId]: data.qrCode }));
        } catch (err) {
            console.error("Failed to generate QR", err);
        }
    };

    const downloadQR = (qrDataUrl, employeeName) => {
        const link = document.createElement('a');
        link.download = `QR_Pointage_${employeeName.replace(/\s+/g, '_')}.png`;
        link.href = qrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredEmployees = employees.filter(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        e.department?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <QrCode className="text-indigo-600 w-8 h-8" />
                        Générateur de QR Code de Pointage
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Générez des QR Codes individuels pour le pointage mobile des employés.
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un employé..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEmployees.map(emp => (
                    <Card key={emp.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <div className="h-1 bg-indigo-500" />
                        <CardContent className="p-6 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl mb-4">
                                {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <h3 className="font-bold text-slate-900 text-center mb-1">{emp.firstName} {emp.lastName}</h3>
                            <p className="text-xs text-slate-500 mb-6">{emp.department}</p>

                            {qrCodes[emp.id] ? (
                                <div className="flex flex-col items-center">
                                    <img src={qrCodes[emp.id]} alt={`QR Code ${emp.firstName}`} className="w-40 h-40 rounded-lg shadow-sm border border-slate-100 mb-4" />
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full gap-2 hover:bg-indigo-50"
                                        onClick={() => downloadQR(qrCodes[emp.id], `${emp.firstName} ${emp.lastName}`)}
                                    >
                                        <Download size={16} /> Télécharger
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    className="w-full gap-2 bg-slate-900 hover:bg-black text-white"
                                    onClick={() => generateQR(emp.id)}
                                >
                                    <QrCode size={16} /> Générer QR
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!loading && filteredEmployees.length === 0 && (
                <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
                    <p className="text-slate-500">Aucun employé trouvé.</p>
                </div>
            )}
        </div>
    );
}
