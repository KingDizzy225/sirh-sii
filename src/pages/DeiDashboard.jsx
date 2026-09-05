import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Users, HeartPulse, Info, AlertTriangle, RefreshCw, Scale } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { api, listeSure } from '../lib/api';
import { cn } from '@/lib/utils';

const GENRES = {
    F: { libelle: 'Femmes', classe: 'bg-fuchsia-500' },
    M: { libelle: 'Hommes', classe: 'bg-sky-500' },
    INCONNU: { libelle: 'Non renseigné', classe: 'bg-slate-300' }
};

const normaliserGenre = (v) => {
    const s = String(v || '').trim().toLowerCase();
    if (['f', 'femme', 'féminin', 'feminin', 'female'].includes(s)) return 'F';
    if (['m', 'homme', 'masculin', 'male'].includes(s)) return 'M';
    return 'INCONNU';
};

const pourcent = (n, total) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

export function DeiDashboard() {
    const [salaries, setSalaries] = useState([]);
    const [equite, setEquite] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    const charger = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const [emp, eq] = await Promise.all([
                api.get('/employees'),
                api.get('/equity')
            ]);
            setSalaries(listeSure(emp.data, 'employés'));
            setEquite(eq.data || null);
        } catch (e) {
            setErreur(e.message || 'Chargement impossible.');
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => { charger(); }, []);

    const actifs = useMemo(
        () => salaries.filter(s => s.status === 'ACTIVE'),
        [salaries]
    );

    const repartition = useMemo(() => {
        const c = { F: 0, M: 0, INCONNU: 0 };
        for (const s of actifs) c[normaliserGenre(s.gender)]++;
        return c;
    }, [actifs]);

    // La parité ne se calcule que sur les fiches renseignées, et l'effectif de
    // référence est affiché : rapporter les femmes à tout l'effectif ferait
    // baisser le taux à mesure que des fiches restent incomplètes.
    const renseignes = repartition.F + repartition.M;

    const parService = useMemo(() => {
        const m = new Map();
        for (const s of actifs) {
            const d = s.department || 'Non affecté';
            if (!m.has(d)) m.set(d, { service: d, F: 0, M: 0, INCONNU: 0, total: 0 });
            const e = m.get(d);
            e[normaliserGenre(s.gender)]++;
            e.total++;
        }
        return [...m.values()].sort((a, b) => b.total - a.total);
    }, [actifs]);

    const couverture = equite?.couverture || null;
    const services = listeSure(equite?.departments, 'services');
    const comparables = services.filter(d => d.payGap !== null && d.payGap !== undefined);
    const ecartGlobal = comparables.length > 0
        ? comparables.reduce((s, d) => s + d.payGap, 0) / comparables.length
        : null;

    const carte = (titre, valeur, detail, couleur) => (
        <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{titre}</p>
                <p className={cn('text-3xl font-bold mt-2', couleur || 'text-slate-900')}>{valeur}</p>
                {detail && <p className="text-sm text-slate-400 mt-3">{detail}</p>}
            </CardContent>
        </Card>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <HeartPulse className="h-8 w-8 text-fuchsia-600" />
                        Diversité, Équité &amp; Inclusion
                    </h2>
                    <p className="text-slate-500 mt-2">
                        Indicateurs calculés sur l'effectif et les bulletins enregistrés.
                    </p>
                </div>
                <Button variant="outline" size="icon" onClick={charger} title="Actualiser">
                    <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
                </Button>
            </div>

            {erreur && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-800">{erreur}</p>
                </div>
            )}

            {/* Ce que les chiffres ne couvrent pas est annoncé avant eux. Cette page
                affichait auparavant des valeurs écrites en dur — un index à 86/100,
                une parité à 48 %, un taux d'emploi de travailleurs handicapés —
                sans lien avec la moindre donnée, et sur un cadre réglementaire
                français qui ne s'applique pas ici. */}
            {repartition.INCONNU > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-900">
                        {repartition.INCONNU} fiche(s) sur {actifs.length} sans genre renseigné.
                        Ces salariés sont comptés dans l'effectif mais exclus des ratios de parité
                        et des écarts de rémunération : renseigner le champ sur la fiche employé
                        étendra la portée de ces indicateurs.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {carte('Effectif actif', actifs.length,
                    `${repartition.INCONNU} sans genre renseigné`)}
                {carte('Part de femmes',
                    renseignes > 0 ? `${pourcent(repartition.F, renseignes)} %` : '—',
                    renseignes > 0
                        ? `${repartition.F} F / ${repartition.M} H sur ${renseignes} fiches renseignées`
                        : 'Aucune fiche renseignée')}
                {carte('Écart salarial H/F',
                    ecartGlobal === null ? '—' : `${ecartGlobal > 0 ? '+' : ''}${ecartGlobal.toFixed(1)} %`,
                    ecartGlobal === null
                        ? 'Aucun service ne compte les deux groupes'
                        : `moyenne sur ${comparables.length} service(s) comparable(s)`,
                    ecartGlobal !== null && Math.abs(ecartGlobal) > 5 ? 'text-amber-600' : undefined)}
                {carte('Services analysables', `${comparables.length}/${services.length}`,
                    'les deux groupes y sont représentés')}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-base">Répartition par service</CardTitle>
                        <CardDescription>Effectif actif, par genre déclaré</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chargement ? (
                            <p className="py-8 text-center text-sm text-slate-400">Chargement…</p>
                        ) : parService.length === 0 ? (
                            <p className="py-8 text-center text-sm text-slate-500">Aucun salarié actif.</p>
                        ) : (
                            <div className="space-y-5">
                                {parService.map(s => (
                                    <div key={s.service}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-semibold text-slate-800">{s.service}</span>
                                            <span className="text-slate-500">{s.total} salarié(s)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
                                            {['F', 'M', 'INCONNU'].map(g => s[g] > 0 && (
                                                <div key={g} className={GENRES[g].classe}
                                                    style={{ width: `${pourcent(s[g], s.total)}%` }}
                                                    title={`${GENRES[g].libelle} : ${s[g]}`} />
                                            ))}
                                        </div>
                                        <div className="flex gap-3 mt-1 text-[11px] text-slate-500">
                                            {['F', 'M', 'INCONNU'].map(g => s[g] > 0 && (
                                                <span key={g} className="flex items-center gap-1">
                                                    <span className={cn('inline-block h-2 w-2 rounded-full', GENRES[g].classe)} />
                                                    {GENRES[g].libelle} {s[g]}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Scale size={18} className="text-emerald-600" />
                            Écart de rémunération par service
                        </CardTitle>
                        <CardDescription>
                            Salaire de base moyen du dernier bulletin. Un service n'apparaît
                            comme comparable que si les deux groupes y sont représentés.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {chargement ? (
                            <p className="py-8 text-center text-sm text-slate-400">Chargement…</p>
                        ) : services.length === 0 ? (
                            <p className="py-8 text-center text-sm text-slate-500">
                                Aucun bulletin enregistré : l'écart de rémunération ne peut pas être calculé.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead>Service</TableHead>
                                            <TableHead className="text-right">Femmes</TableHead>
                                            <TableHead className="text-right">Hommes</TableHead>
                                            <TableHead className="text-right">Écart</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-xs">
                                        {services.map(d => (
                                            <TableRow key={d.department} className="font-medium">
                                                <td className="p-3 font-semibold text-slate-800">{d.department}</td>
                                                <td className="p-3 text-right text-slate-600">
                                                    {d.countWomen > 0
                                                        ? `${d.avgSalaryWomen.toLocaleString('fr-FR')} (${d.countWomen})`
                                                        : '—'}
                                                </td>
                                                <td className="p-3 text-right text-slate-600">
                                                    {d.countMen > 0
                                                        ? `${d.avgSalaryMen.toLocaleString('fr-FR')} (${d.countMen})`
                                                        : '—'}
                                                </td>
                                                <td className={cn('p-3 text-right font-bold',
                                                    d.payGap === null || d.payGap === undefined ? 'text-slate-400'
                                                        : Math.abs(d.payGap) > 5 ? 'text-amber-600' : 'text-emerald-600')}>
                                                    {d.payGap === null || d.payGap === undefined
                                                        ? 'non comparable'
                                                        : `${d.payGap > 0 ? '+' : ''}${d.payGap.toFixed(1)} %`}
                                                </td>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {couverture && (
                <p className="text-xs text-slate-400">
                    Écarts calculés sur {couverture.actifs - couverture.sansSalaire} salarié(s) disposant
                    d'un bulletin, sur {couverture.actifs} actifs. Les analyses individuelles et les
                    recommandations figurent dans l'Analyseur d'équité salariale.
                </p>
            )}
        </div>
    );
}
