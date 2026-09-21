import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Gift, Info, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Prime de fin d'année.
 *
 * Deux choses sur le même écran, et il importe de ne pas les confondre : la
 * provision, qui bouge à chaque paie et dit ce qui est déjà engagé ; l'arrêté,
 * qui fige les montants dus et part en paie.
 */

const montant = (n) => (n == null ? '—' : new Intl.NumberFormat('fr-CI').format(Math.round(n)) + ' F');

export function PrimeAnnuelle() {
    const [donnees, setDonnees] = useState(null);
    const [annee, setAnnee] = useState(new Date().getFullYear());
    const [message, setMessage] = useState(null);
    const [occupe, setOccupe] = useState(false);

    const charger = useCallback(async (exercice) => {
        try {
            const res = await api.get(`/prime-annuelle?annee=${exercice}`);
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(annee); }, [charger, annee]);

    const arreter = async () => {
        if (!window.confirm(`Arrêter l'exercice ${annee} ? Les montants seront figés et porteront sur la paie prévue.`)) return;
        setOccupe(true);
        try {
            const res = await api.post('/prime-annuelle/arreter', { annee });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Exercice arrêté.' });
            charger(annee);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Arrêté impossible.' });
        } finally {
            setOccupe(false);
        }
    };

    const lignes = (donnees?.lignes || []).filter((l) => l.montant == null || l.montant > 0);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Gift className="w-6 h-6 text-orange-600" /> Prime de fin d'année
                    </h1>
                    <p className="text-slate-500 mt-1">Ce que l'exercice a déjà engagé, et ce qui sera versé.</p>
                </div>
                <div className="flex items-center gap-2">
                    <input type="number" value={annee} onChange={(e) => setAnnee(Number(e.target.value))}
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2" />
                    <Button onClick={arreter} disabled={occupe || !donnees?.parametree}>Arrêter l'exercice</Button>
                </div>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            {donnees?.avertissement && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{donnees.avertissement}</span>
                </div>
            )}

            {donnees?.parametree && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Provision à ce jour</p>
                        <p className="text-2xl font-bold text-slate-900">{montant(donnees.total)}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Règle appliquée</p>
                        <p className="text-2xl font-bold text-slate-900">{donnees.fraction} mois</p>
                        <p className="text-xs text-slate-500">versé sur la paie de {donnees.moisVersement}/{donnees.annee}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Salariés concernés</p>
                        <p className="text-2xl font-bold text-slate-900">{donnees.salaries}</p>
                        {donnees.sansReference > 0 && (
                            <p className="text-xs text-amber-700">{donnees.sansReference} sans rémunération de référence</p>
                        )}
                    </CardContent></Card>
                </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                    La prime est calculée au prorata des mois de présence : un mois entamé compte pour ce qu'il vaut.
                    La provision se recalcule à chaque consultation ; l'arrêté, lui, fige les montants — et une prime
                    déjà versée n'est jamais réécrite.
                </span>
            </div>

            {donnees?.arretees?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Primes arrêtées</CardTitle>
                        <CardDescription>Ces montants partiront en paie, ou l'ont déjà fait.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {donnees.arretees.map((p) => (
                                <li key={p.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-slate-800">{p.nom}</p>
                                        <p className="text-xs text-slate-500">
                                            {p.moisComptes} mois sur 12 · base {montant(p.base)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{montant(p.montant)}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${p.statut === 'VERSE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {p.statut === 'VERSE' ? 'Versée' : 'À verser'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Provision par salarié</CardTitle>
                    <CardDescription>Acquis à ce jour, avant arrêté.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {lignes.length === 0 && <li className="p-6 text-sm text-slate-500">Rien à provisionner.</li>}
                        {lignes.map((l) => (
                            <li key={l.employeeId} className="p-4 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="font-medium text-slate-800">{l.nom}</p>
                                    <p className="text-xs text-slate-500">{l.contrat} · {l.mois} mois de présence</p>
                                </div>
                                {l.montant == null
                                    ? <span className="text-xs text-amber-700">Rémunération de référence inconnue</span>
                                    : <span className="font-semibold text-slate-800">{montant(l.montant)}</span>}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
