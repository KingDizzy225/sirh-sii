import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clock, AlertTriangle, RefreshCw, MapPinOff } from 'lucide-react';
import { api } from '../lib/api';

/**
 * Relevé mensuel des heures.
 *
 * La chaîne était coupée au milieu : les pointages étaient enregistrés d'un
 * côté, les heures supplémentaires ressaisies à la main dans la paie de
 * l'autre. Personne ne rapprochait les deux, et une heure supplémentaire
 * oubliée l'était définitivement.
 *
 * Ce que le relevé ne peut pas compter, il le dit : une entrée sans sortie ne
 * se devine pas, et une journée de dix-huit heures est une sortie oubliée.
 */

const moisCourant = () => new Date().toISOString().slice(0, 7);

export function ReleveHeures() {
    const [periode, setPeriode] = useState(moisCourant());
    const [releve, setReleve] = useState(null);
    const [ouvert, setOuvert] = useState(null);

    const charger = useCallback(async () => {
        const res = await api.get(`/time-logs/releve?period=${periode}`).catch(() => ({ data: null }));
        setReleve(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
    }, [periode]);

    useEffect(() => { charger(); }, [charger]);

    const h = (n) => (n == null ? '—' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n)} h`);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Clock className="text-sky-700" /> Relevé des heures
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Ce que les pointages disent des heures travaillées, et des heures supplémentaires qui en découlent.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} className="w-44" />
                    <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                        <RefreshCw size={12} /> Actualiser
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { titre: 'Salariés pointant', valeur: releve?.effectifPointant },
                    { titre: 'Heures travaillées', valeur: releve ? h(releve.totalHeures) : null },
                    { titre: 'Heures supplémentaires', valeur: releve ? h(releve.totalSupplementaires) : null },
                    { titre: 'Relevés incomplets', valeur: releve?.avecAnomalies }
                ].map((c) => (
                    <Card key={c.titre} className="border border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.titre}</p>
                            <p className="text-2xl font-extrabold text-slate-900 mt-2">{c.valeur ?? '—'}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {releve && releve.avecAnomalies > 0 && (
                <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900">
                        <span className="font-semibold">{releve.avecAnomalies} relevé(s) incomplet(s).</span>{' '}
                        Une entrée sans sortie n'est pas devinée — la durée serait inventée — et une journée
                        anormalement longue est écartée. Corrigez les pointages avant de reprendre ces heures en paie.
                    </p>
                </div>
            )}

            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-slate-900">
                        Par collaborateur
                        {releve && (
                            <span className="text-xs font-normal text-slate-500 ml-2">
                                base hebdomadaire : {releve.heuresHebdomadaires} h
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                <tr>
                                    <th className="px-5 py-3">Collaborateur</th>
                                    <th className="px-5 py-3 text-right">Jours</th>
                                    <th className="px-5 py-3 text-right">Heures</th>
                                    <th className="px-5 py-3 text-right">Supplémentaires</th>
                                    <th className="px-5 py-3">État</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!releve ? (
                                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Lecture des pointages…</td></tr>
                                ) : releve.lignes.length === 0 ? (
                                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                                        Aucun pointage sur cette période.
                                    </td></tr>
                                ) : releve.lignes.map((l) => (
                                    <React.Fragment key={l.employeeId}>
                                        <tr className="bg-white border-b hover:bg-slate-50 cursor-pointer"
                                            onClick={() => setOuvert(ouvert === l.employeeId ? null : l.employeeId)}>
                                            <td className="px-5 py-3 font-semibold text-slate-800">
                                                {l.nom}
                                                <span className="block text-xs font-normal text-slate-500">{l.departement}</span>
                                            </td>
                                            <td className="px-5 py-3 text-right">{l.joursTravailles}</td>
                                            <td className="px-5 py-3 text-right font-mono">{h(l.heuresTravaillees)}</td>
                                            <td className="px-5 py-3 text-right font-mono">
                                                {l.heuresSupplementaires > 0
                                                    ? <span className="font-bold text-sky-700">{h(l.heuresSupplementaires)}</span>
                                                    : '—'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {l.exploitable
                                                        ? <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Complet</Badge>
                                                        : <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                                                            {l.anomalies.length} anomalie(s)
                                                          </Badge>}
                                                    {l.journeesHorsZone > 0 && (
                                                        <Badge className="bg-slate-100 text-slate-700 text-[10px] gap-1">
                                                            <MapPinOff size={9} /> {l.journeesHorsZone} hors zone
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {ouvert === l.employeeId && (
                                            <tr className="bg-slate-50/60">
                                                <td colSpan={5} className="px-5 py-3">
                                                    <p className="text-xs font-semibold text-slate-700 mb-1">Par semaine</p>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {l.parSemaine.map((s) => (
                                                            <span key={s.semaineDu} className="text-[11px] bg-white border border-slate-200 rounded px-2 py-1">
                                                                Semaine du {new Date(s.semaineDu).toLocaleDateString('fr-FR')} :{' '}
                                                                <span className="font-mono">{h(s.heures)}</span>
                                                                {s.supplementaires > 0 && (
                                                                    <span className="text-sky-700 font-mono"> (+{h(s.supplementaires)})</span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {l.anomalies.length > 0 && (
                                                        <>
                                                            <p className="text-xs font-semibold text-amber-800 mb-1">Anomalies</p>
                                                            <ul className="text-[11px] text-amber-900 list-disc list-inside space-y-0.5">
                                                                {l.anomalies.map((a, i) => (
                                                                    <li key={i}>
                                                                        {new Date(a.le).toLocaleString('fr-FR')} — {a.detail}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
