import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Save, AlertCircle, LogOut, Download, Calculator, PiggyBank, Briefcase } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

// Données initiales pour la campagne salariale
const initialEmployees = [
    { id: '1', name: 'Sarah Jenkins', role: 'Directrice RH', department: 'Ressources Humaines', perfScore: 4.8, currentSalary: 95000, proposedIncreasePercentage: 0 },
    { id: '2', name: 'Michael Chen', role: 'Lead Developer', department: 'Ingénierie', perfScore: 4.5, currentSalary: 110000, proposedIncreasePercentage: 0 },
    { id: '3', name: 'Emma Wilson', role: 'Spécialiste Marketing', department: 'Marketing', perfScore: 3.2, currentSalary: 55000, proposedIncreasePercentage: 0 },
    { id: '4', name: 'James Rodriguez', role: 'Commercial', department: 'Ventes', perfScore: 4.9, currentSalary: 62000, proposedIncreasePercentage: 0 },
    { id: '5', name: 'Lisa Thompson', role: 'Comptable', department: 'Finance', perfScore: 3.8, currentSalary: 68000, proposedIncreasePercentage: 0 },
    { id: '6', name: 'David Kim', role: 'Développeur Frontend', department: 'Ingénierie', perfScore: 3.5, currentSalary: 75000, proposedIncreasePercentage: 0 },
];

export function Compensation() {
    const [employees, setEmployees] = useState(initialEmployees);
    const [globalBudget] = useState(25000); // Enveloppe de 25 000 FCFA autorisée par mois supplémentaire, ou par an

    const handleIncreaseChange = (id, newPercentage) => {
        // Validation simple: empêcher les pourcentages négatifs absurdes ou trop hauts
        let val = parseFloat(newPercentage) || 0;
        if (val < 0) val = 0;
        if (val > 50) val = 50;

        setEmployees(employees.map(emp =>
            emp.id === id ? { ...emp, proposedIncreasePercentage: val } : emp
        ));
    };

    // Calculs globaux mémorisés pour la performance
    const stats = useMemo(() => {
        let totalCurrent = 0;
        let totalProposed = 0;

        employees.forEach(emp => {
            totalCurrent += emp.currentSalary;
            const increaseAmount = (emp.currentSalary * emp.proposedIncreasePercentage) / 100;
            totalProposed += (emp.currentSalary + increaseAmount);
        });

        const budgetConsumed = totalProposed - totalCurrent;
        return { totalCurrent, totalProposed, budgetConsumed };
    }, [employees]);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 min-h-[calc(100vh-4rem)] bg-slate-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <PiggyBank className="h-8 w-8 text-blue-600" />
                        Campagne de Révision Salariale
                    </h2>
                    <p className="text-slate-500 mt-1">Gérez le plan de rémunération annuel Q1-2026.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> Sauvegarder Campagne
                    </Button>
                </div>
            </div>

            {/* KPI Budget (The 'Enveloppe') */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Masse Salariale Actuelle</CardTitle>
                        <Briefcase className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalCurrent.toLocaleString()} F</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Masse Salariale Projetée</CardTitle>
                        <Calculator className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalProposed.toLocaleString()} F</div>
                        <p className="text-xs text-slate-500 mt-1">+{((stats.totalProposed - stats.totalCurrent) / stats.totalCurrent * 100).toFixed(2)}% global</p>
                    </CardContent>
                </Card>
                <Card className={`border-none shadow-sm ${stats.budgetConsumed > globalBudget ? 'bg-red-50' : 'bg-white'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Consommation du Budget</CardTitle>
                        <AlertCircle className={`h-4 w-4 ${stats.budgetConsumed > globalBudget ? 'text-red-500' : 'text-emerald-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.budgetConsumed > globalBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                            {stats.budgetConsumed.toLocaleString()} F <span className="text-sm font-normal text-slate-500">/ {globalBudget.toLocaleString()} F</span>
                        </div>
                        {stats.budgetConsumed > globalBudget && (
                            <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Budget dépassé de {(stats.budgetConsumed - globalBudget).toLocaleString()} F</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Compensation Spreadsheet Table */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg font-semibold text-slate-800">Grille d'Attribution</CardTitle>
                    <CardDescription>Les augmentations doivent être validées selon le score de performance.</CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="w-[200px] font-semibold">Employé</TableHead>
                                <TableHead className="font-semibold">Département</TableHead>
                                <TableHead className="text-center font-semibold">Perf. (sur 5)</TableHead>
                                <TableHead className="text-right font-semibold">Salaire Actuel</TableHead>
                                <TableHead className="text-center font-semibold bg-blue-50/50 w-[150px]">Augmentation %</TableHead>
                                <TableHead className="text-right font-semibold bg-blue-50/50 w-[150px]">Nouveau Salaire</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((emp) => {
                                const increaseAmount = (emp.currentSalary * emp.proposedIncreasePercentage) / 100;
                                const newSalary = emp.currentSalary + increaseAmount;

                                // Coloration simple basée sur la performance vs augmentation
                                let perfWarning = false;
                                if (emp.perfScore < 3.0 && emp.proposedIncreasePercentage > 0) perfWarning = true;
                                if (emp.perfScore > 4.5 && emp.proposedIncreasePercentage < 2) perfWarning = true;

                                return (
                                    <TableRow key={emp.id} className="group hover:bg-slate-50 transition-colors">
                                        <TableCell>
                                            <p className="font-semibold text-slate-900">{emp.name}</p>
                                            <p className="text-xs text-slate-500">{emp.role}</p>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{emp.department}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={`
                                                ${emp.perfScore >= 4.0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                                ${emp.perfScore < 3.0 ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                            `}>
                                                {emp.perfScore}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-700">
                                            {emp.currentSalary.toLocaleString()} F
                                        </TableCell>
                                        <TableCell className="bg-blue-50/30">
                                            <div className="flex items-center justify-center relative">
                                                <input
                                                    type="number"
                                                    min="0" max="50" step="0.5"
                                                    value={emp.proposedIncreasePercentage}
                                                    onChange={(e) => handleIncreaseChange(emp.id, e.target.value)}
                                                    className={`w-20 rounded border p-1.5 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500
                                                        ${perfWarning ? 'border-orange-300 bg-orange-50' : 'border-slate-200'}
                                                    `}
                                                />
                                                <span className="ml-1 text-slate-500 font-medium">%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-blue-700 bg-blue-50/30">
                                            {newSalary.toLocaleString()} F
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
