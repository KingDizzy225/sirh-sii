import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Download, PenTool, CheckCircle, FileText } from 'lucide-react';
import { SignaturePad } from '../components/ui/SignaturePad';
import { toast } from 'sonner';

export function PayslipViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [payslip, setPayslip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSigning, setIsSigning] = useState(false);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchPayslip();
    }, [id]);

    const fetchPayslip = async () => {
        try {
            const { data } = await api.get(`/payrolls/${id}`);
            setPayslip(data);
        } catch (error) {
            toast.error("Impossible de charger la fiche de paie");
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async (signatureData) => {
        try {
            await api.post(`/payrolls/${id}/sign`, { signature: signatureData });
            toast.success("Fiche de paie signée électroniquement !");
            setIsSigning(false);
            fetchPayslip(); // Reload
        } catch (error) {
            toast.error("La signature a échoué");
        }
    };

    const handleDownload = () => {
        // Download directly using browser (api.js is designed for JSON)
        const token = localStorage.getItem('sirh_token');
        window.open(`${API_URL}/api/payrolls/${id}/download?token=${token}`, '_blank');
    };

    if (loading) return <div className="flex-1 p-8 text-center text-slate-500">Chargement de la fiche de paie...</div>;
    if (!payslip) return <div className="flex-1 p-8 text-center text-rose-500">Fiche de paie introuvable</div>;

    const formatMoney = (val) => new Intl.NumberFormat('fr-CI').format(Math.round(val || 0)) + ' FCFA';

    return (
        <div className="flex-1 p-8 bg-slate-50 min-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* En-tête de navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500">
                        <ArrowLeft size={16} className="mr-2" /> Retour
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleDownload} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                            <Download size={16} className="mr-2" />
                            Télécharger PDF
                        </Button>
                        {!payslip.signature && !isSigning && (
                            <Button onClick={() => setIsSigning(true)} className="bg-indigo-600 text-white hover:bg-indigo-700">
                                <PenTool size={16} className="mr-2" />
                                Signer le document
                            </Button>
                        )}
                        {payslip.signature && (
                            <Button variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 cursor-default">
                                <CheckCircle size={16} className="mr-2" />
                                Signé le {new Date(payslip.signedAt).toLocaleDateString('fr-FR')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Zone de Signature Dynamique */}
                {isSigning && (
                    <Card className="border-indigo-200 shadow-md ring-1 ring-indigo-50 animate-in fade-in slide-in-from-top-4">
                        <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                            <CardTitle className="text-indigo-900 flex items-center gap-2">
                                <PenTool size={18} className="text-indigo-600" />
                                Signature Électronique
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <SignaturePad 
                                onSign={handleSign} 
                                onCancel={() => setIsSigning(false)} 
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Prévisualisation de la Fiche de Paie (HTML) */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-12 space-y-8 bg-white text-slate-800">
                        <div className="text-center space-y-2 border-b border-slate-200 pb-8">
                            <div className="inline-flex p-3 bg-indigo-50 rounded-full mb-2">
                                <FileText size={32} className="text-indigo-600" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">BULLETIN DE PAIE</h1>
                            <p className="text-slate-500 uppercase tracking-widest text-sm">
                                Période : {new Date(payslip.period).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-12 text-sm">
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Employeur</h3>
                                <p className="font-bold">SII Côte d'Ivoire</p>
                                <p className="text-slate-500">Abidjan, Plateau</p>
                            </div>
                            <div className="space-y-2 text-right">
                                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Employé(e)</h3>
                                <p className="font-bold">{payslip.employee?.firstName} {payslip.employee?.lastName}</p>
                                <p className="text-slate-500">{payslip.employee?.positionTitle}</p>
                            </div>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="border-b-2 border-slate-800">
                                <tr>
                                    <th className="py-3 text-left font-bold text-slate-600">Désignation</th>
                                    <th className="py-3 text-right font-bold text-slate-600">Base</th>
                                    <th className="py-3 text-right font-bold text-slate-600">Montant</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-4 font-medium text-slate-900">Salaire Brut de Base</td>
                                    <td className="py-4 text-right text-slate-500">-</td>
                                    <td className="py-4 text-right font-medium">{formatMoney(payslip.baseSalary)}</td>
                                </tr>
                                {payslip.bonus > 0 && (
                                    <tr>
                                        <td className="py-4 font-medium text-emerald-600">Prime & Bonus</td>
                                        <td className="py-4 text-right text-slate-500">-</td>
                                        <td className="py-4 text-right text-emerald-600">+{formatMoney(payslip.bonus)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="py-4 font-medium text-rose-600">Cotisations Salariales (CNPS/CMU/ITS)</td>
                                    <td className="py-4 text-right text-slate-500">-</td>
                                    <td className="py-4 text-right text-rose-600">-{formatMoney(payslip.employeeContributions)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="flex justify-end pt-6">
                            <div className="bg-slate-900 text-white rounded-lg p-6 w-72 shadow-lg">
                                <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Net à Payer</p>
                                <p className="text-3xl font-bold">{formatMoney(payslip.netSalary)}</p>
                            </div>
                        </div>

                        {payslip.signature && (
                            <div className="pt-12 flex justify-end">
                                <div className="text-center space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signature Approuvée</p>
                                    <img src={payslip.signature} alt="Signature" className="h-16 object-contain opacity-80" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
