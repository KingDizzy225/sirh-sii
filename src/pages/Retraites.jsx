import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Hourglass, AlertTriangle, Info } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Départs à la retraite.
 *
 * L'application connaissait toutes les dates de naissance et n'en tirait rien.
 * Un départ se préparait donc dans l'urgence, et l'allocation de fin de
 * carrière se calculait à la main — quand elle se calculait.
 */

const montant = (n) => (n == null ? '—' : new Intl.NumberFormat('fr-CI').format(Math.round(n)) + ' F');
const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');

export function Retraites() {
    const [donnees, setDonnees] = useState(null);
    const [horizon, setHorizon] = useState(24);
    const [erreur, setErreur] = useState(null);

    const charger = useCallback(async (mois) => {
        try {
            const res = await api.get(`/retraites?horizonMois=${mois}`);
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setErreur(err.message || 'Lecture impossible.');
        }
    }, []);

    useEffect(() => { charger(horizon); }, [charger, horizon]);

    const lignes = donnees?.lignes || [];
    const depasses = lignes.filter((l) => l.depasse);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Hourglass className="w-6 h-6 text-orange-600" /> Départs à la retraite
                    </h1>
                    <p className="text-slate-500 mt-1">Qui part, quand, et ce que l'entreprise devra.</p>
                </div>
                <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}
                    className="rounded-lg border border-slate-300 px-3 py-2 bg-white">
                    <option value={12}>12 mois</option>
                    <option value={24}>24 mois</option>
                    <option value={60}>5 ans</option>
                </select>
            </div>

            {erreur && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{erreur}</div>
            )}

            {donnees?.avertissement && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{donnees.avertissement}</span>
                </div>
            )}

            {depasses.length > 0 && (
                <Card className="border-rose-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-rose-800">
                            {depasses.length} salarié(s) ont déjà dépassé l'âge de départ
                        </CardTitle>
                        <CardDescription>
                            Ce n'est pas une erreur de saisie : c'est un départ qui aurait dû être préparé.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {donnees && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Départs prévus</p>
                        <p className="text-2xl font-bold text-slate-900">{lignes.length}</p>
                        <p className="text-xs text-slate-500">dans les {donnees.horizonMois} prochains mois</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Âge de départ retenu</p>
                        <p className="text-2xl font-bold text-slate-900">{donnees.age} ans</p>
                        <p className="text-xs text-slate-500"><code>RETRAITE_AGE</code></p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Allocations à prévoir</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {donnees.baremeDeclare ? montant(donnees.total) : '—'}
                        </p>
                        {donnees.sansDateDeNaissance > 0 && (
                            <p className="text-xs text-amber-700">
                                {donnees.sansDateDeNaissance} fiche(s) sans date de naissance
                            </p>
                        )}
                    </CardContent></Card>
                </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                    L'allocation de fin de carrière a son propre barème : elle n'est ni l'indemnité de
                    licenciement, ni soumise au même régime. Le décompte de départ la porte désormais —
                    <strong> et refuse d'établir un reçu</strong> tant qu'elle n'est pas chiffrable, pour qu'aucun
                    salarié ne signe une décharge amputée de son poste le plus lourd.
                </span>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Salariés concernés</CardTitle>
                    <CardDescription>Du départ le plus proche au plus lointain.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {lignes.length === 0 && (
                            <li className="p-6 text-sm text-slate-500">Aucun départ prévu sur cette période.</li>
                        )}
                        {lignes.map((l) => (
                            <li key={l.employeeId} className={`p-4 flex flex-wrap items-center justify-between gap-3 ${l.depasse ? 'bg-rose-50' : ''}`}>
                                <div>
                                    <p className="font-medium text-slate-800">{l.nom}</p>
                                    <p className="text-xs text-slate-500">
                                        {l.fonction} · {l.age} ans · {l.ancienneteAuDepart} an(s) d'ancienneté au départ
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-800">{date(l.dateDepart)}</p>
                                    <p className="text-xs text-slate-500">
                                        {l.allocationChiffrable ? montant(l.allocation) : 'allocation non chiffrable'}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
