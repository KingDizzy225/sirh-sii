import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Users, Target, Activity, HeartPulse, ShieldAlert } from 'lucide-react';

export function DeiDashboard() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <HeartPulse className="h-8 w-8 text-fuchsia-600" />
                    Diversité, Équité & Inclusion
                </h2>
                <p className="text-slate-500 mt-2 text-lg">Indicateurs institutionnels (Reporting RSE / Index Égalité)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-fuchsia-500 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Index Égalité H/F</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">86/100</p>
                            </div>
                            <div className="p-3 bg-fuchsia-100 rounded-full text-fuchsia-600">
                                <Target size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-emerald-600 mt-4 flex items-center gap-1 font-medium">+2 points <span className="text-slate-400 font-normal">vs N-1</span></p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-sky-500 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Parité Globale</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">48%</p>
                            </div>
                            <div className="p-3 bg-sky-100 rounded-full text-sky-600">
                                <Users size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-4 font-medium flex gap-4">
                            <span><span className="text-sky-500">■</span> F 48%</span>
                            <span><span className="text-slate-400">■</span> H 52%</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Taux d'emploi DOETH</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">6.2%</p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                                <Activity size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-emerald-600 mt-4 font-medium">Objectif légal (6%) atteint</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Écart de Rémunération H/F par Categorie</CardTitle>
                        <CardDescription>Équivalent Temps Plein (ETP)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">Ouvriers / Employés</span>
                                    <span className="text-emerald-500">0.2% d'écart</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 flex">
                                    <div className="bg-fuchsia-500 h-2 rounded-l-full" style={{ width: '49.9%' }}></div>
                                    <div className="bg-sky-500 h-2 rounded-r-full" style={{ width: '50.1%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">Techniciens / Agents de Maîtrise</span>
                                    <span className="text-emerald-500">1.8% d'écart</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 flex">
                                    <div className="bg-fuchsia-500 h-2 rounded-l-full" style={{ width: '49.1%' }}></div>
                                    <div className="bg-sky-500 h-2 rounded-r-full" style={{ width: '50.9%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">Ingénieurs / Cadres</span>
                                    <span className="text-amber-500">4.5% d'écart</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 flex">
                                    <div className="bg-fuchsia-500 h-2 rounded-l-full" style={{ width: '47.7%' }}></div>
                                    <div className="bg-sky-500 h-2 rounded-r-full" style={{ width: '52.3%' }}></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Coconstruction Sociale & Formations</CardTitle>
                        <CardDescription>Initiatives internes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="bg-fuchsia-100 p-2 rounded-full mt-1">
                                    <Users className="h-4 w-4 text-fuchsia-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Réseau "Women At Work"</p>
                                    <p className="text-sm text-slate-500">Réseau interne lancé en Janvier 2026. Mentoring de plus de 45 femmes cadres.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="bg-sky-100 p-2 rounded-full mt-1">
                                    <ShieldAlert className="h-4 w-4 text-sky-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Sensibilisation Biais Cognitifs</p>
                                    <p className="text-sm text-slate-500">100% des managers recrutant formés aux biais inconscients cette année.</p>
                                </div>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
