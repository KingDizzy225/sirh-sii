import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    FileText, Sparkles, Download, CheckCircle2, Copy, Eye, Settings, 
    User, DollarSign, Calendar, Building, Layers, Check, ShieldCheck, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

const MOCK_EMPLOYEES = [
    { id: 'emp-1', firstName: 'Jean', lastName: 'Kouassi', positionTitle: 'Ingénieur DevOps', department: 'Technologie', email: 'jean.kouassi@entreprise.com', baseSalary: '850 000' },
    { id: 'emp-2', firstName: 'Awa', lastName: 'Traoré', positionTitle: 'Chef de Projet RH', department: 'Ressources Humaines', email: 'awa.traore@entreprise.com', baseSalary: '750 000' },
    { id: 'emp-3', firstName: 'Koffi', lastName: 'N\'Guessan', positionTitle: 'Analyste Financier', department: 'Finance', email: 'koffi.nguessan@entreprise.com', baseSalary: '650 000' }
];

export function ContractStudio() {
    const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(MOCK_EMPLOYEES[0].id);
    const [contractType, setContractType] = useState('CDI');
    const [baseSalary, setBaseSalary] = useState('850 000');
    const [probationMonths, setProbationMonths] = useState('3');
    const [includeNonCompete, setIncludeNonCompete] = useState(true);
    const [includeRemoteClause, setIncludeRemoteClause] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        api.get('/employees').then(res => {
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setEmployees(res.data);
                setSelectedEmployeeId(res.data[0].id);
            }
        }).catch(() => {});
    }, []);

    const selectedEmp = employees.find(e => e.id === selectedEmployeeId) || employees[0];

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handlePrintOrDownload = () => {
        window.print();
        showNotification("Contrat généré prêt à l'impression / PDF.");
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText className="text-blue-600" /> Générateur Intelligent de Contrats RH
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Créez des contrats de travail modulaires et personnalisés avec injection automatique des données collaborateurs.
                    </p>
                </div>

                <Button onClick={handlePrintOrDownload} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md gap-2">
                    <Printer size={16} /> Imprimer / Exporter PDF
                </Button>
            </div>

            {/* Notification */}
            {notification && (
                <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} /> {notification}
                </div>
            )}

            {/* Split View Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Configuration Parameters */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Settings size={18} className="text-blue-600" /> Paramètres du Contrat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-5">
                            {/* Employee Selection */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Collaborateur concerné</label>
                                <select 
                                    value={selectedEmployeeId} 
                                    onChange={e => {
                                        setSelectedEmployeeId(e.target.value);
                                        const emp = employees.find(x => x.id === e.target.value);
                                        if (emp?.baseSalary) setBaseSalary(emp.baseSalary);
                                    }}
                                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-800 bg-white"
                                >
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName} — {emp.positionTitle || emp.role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Contract Type */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Type de Contrat</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['CDI', 'CDD', 'Stage'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setContractType(type)}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                                                contractType === type 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Salary & Probation */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Salaire Brut (FCFA)</label>
                                    <Input value={baseSalary} onChange={e => setBaseSalary(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Essai (Mois)</label>
                                    <Input value={probationMonths} onChange={e => setProbationMonths(e.target.value)} />
                                </div>
                            </div>

                            {/* Modular Clauses Toggles */}
                            <div className="pt-2 space-y-3 border-t border-slate-100">
                                <p className="text-xs font-bold uppercase text-slate-600">Clauses Optionnelles</p>
                                
                                <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={includeNonCompete} 
                                        onChange={e => setIncludeNonCompete(e.target.checked)}
                                        className="rounded border-slate-300 w-4 h-4 text-blue-600"
                                    />
                                    <span>Clause de Non-Concurrence (12 mois)</span>
                                </label>

                                <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={includeRemoteClause} 
                                        onChange={e => setIncludeRemoteClause(e.target.checked)}
                                        className="rounded border-slate-300 w-4 h-4 text-blue-600"
                                    />
                                    <span>Accord Télétravail Hybride (2j / semaine)</span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Live Document Preview (A4 Paper Style) */}
                <div className="lg:col-span-7">
                    <Card className="border border-slate-300 shadow-xl bg-white min-h-[680px] p-8 sm:p-12 text-slate-900 font-serif leading-relaxed text-sm">
                        <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
                            <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-900 font-sans">
                                CONTRAT DE TRAVAIL ({contractType})
                            </h2>
                            <p className="text-xs text-slate-500 font-sans mt-1">Référence : SII-CI-2026-{(selectedEmp?.id || '001').slice(0, 6).toUpperCase()}</p>
                        </div>

                        <div className="space-y-6 font-sans text-sm">
                            <div>
                                <p className="font-bold">ENTRE LES SOUSSIGNÉS :</p>
                                <p className="mt-1">
                                    La société <strong>SII Côte d'Ivoire</strong>, sise à Abidjan Cocody, représentée par la Direction des Ressources Humaines,
                                </p>
                                <p className="italic text-slate-600 text-xs mt-1">D'une part,</p>
                            </div>

                            <div>
                                <p className="font-bold">ET :</p>
                                <p className="mt-1">
                                    M./Mme <strong>{selectedEmp?.firstName} {selectedEmp?.lastName}</strong>, résidant à Abidjan, de nationalité {selectedEmp?.nationality || 'Ivoirienne'},
                                </p>
                                <p className="italic text-slate-600 text-xs mt-1">D'autre part.</p>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <p className="font-bold text-slate-900">ARTICLE 1 — ENGAGEMENT & FONCTIONS</p>
                                <p className="mt-1 text-slate-700">
                                    Le collaborateur est engagé en qualité de <strong>{selectedEmp?.positionTitle || 'Collaborateur'}</strong> au sein du département <strong>{selectedEmp?.department || 'Ressources Humaines'}</strong>.
                                </p>
                            </div>

                            <div>
                                <p className="font-bold text-slate-900">ARTICLE 2 — RÉMUNÉRATION</p>
                                <p className="mt-1 text-slate-700">
                                    En contrepartie de ses prestations, M./Mme <strong>{selectedEmp?.firstName} {selectedEmp?.lastName}</strong> percevra une rémunération mensuelle brute de <strong>{baseSalary} FCFA</strong>.
                                </p>
                            </div>

                            <div>
                                <p className="font-bold text-slate-900">ARTICLE 3 — PÉRIODE D'ESSAI</p>
                                <p className="mt-1 text-slate-700">
                                    Le présent contrat comporte une période d'essai de <strong>{probationMonths} mois</strong>, renouvelable une fois conformément à la législation en vigueur.
                                </p>
                            </div>

                            {includeNonCompete && (
                                <div>
                                    <p className="font-bold text-slate-900">ARTICLE 4 — CLAUSE DE NON-CONCURRENCE</p>
                                    <p className="mt-1 text-slate-700 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                                        Pendant une durée de 12 mois suivant la fin du contrat, le collaborateur s'engage à ne pas exercer d'activité concurrente directe sur le territoire ivoirien.
                                    </p>
                                </div>
                            )}

                            {includeRemoteClause && (
                                <div>
                                    <p className="font-bold text-slate-900">ARTICLE 5 — MODALITÉS DE TÉLÉTRAVAIL</p>
                                    <p className="mt-1 text-slate-700 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                                        Le collaborateur bénéficie du dispositif de télétravail hybride à raison de 2 jours par semaine sous réserve de validation managériale.
                                    </p>
                                </div>
                            )}

                            <div className="pt-12 flex justify-between items-end text-xs font-bold text-slate-700">
                                <div>
                                    <p>Pour SII Côte d'Ivoire</p>
                                    <div className="h-16 border-b border-dashed border-slate-400 w-40 mt-2"></div>
                                </div>
                                <div className="text-right">
                                    <p>Le Collaborateur (Lu et approuvé)</p>
                                    <div className="h-16 border-b border-dashed border-slate-400 w-40 mt-2 ml-auto"></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
