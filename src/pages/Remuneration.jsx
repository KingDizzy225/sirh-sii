import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Banknote, TrendingUp, Clock, RefreshCw, AlertTriangle, Search } from 'lucide-react';
import { api, listeSure } from '../lib/api';

/**
 * Rémunération de référence.
 *
 * L'application ne savait pas ce que gagnait un salarié : la paie lisait le
 * montant dans la requête, et l'analyse d'équité le déduisait du dernier
 * bulletin. Le salaire était la conséquence — ce qui avait été payé — et non une
 * donnée du contrat.
 *
 * Chaque révision se décide ici, avec sa date d'effet et son motif. Une
 * augmentation datée du mois prochain n'est pas appliquée avant terme, et
 * l'écran le dit plutôt que d'afficher un montant qui n'est pas encore le bon.
 */

const fcfa = (n) => (n == null ? '—' : `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} F`);
const dateFr = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');

export function Remuneration() {
    const [salaries, setSalaries] = useState([]);
    const [recherche, setRecherche] = useState('');
    const [ouvert, setOuvert] = useState(null);
    const [detail, setDetail] = useState(null);
    const [message, setMessage] = useState(null);
    const [form, setForm] = useState({ montant: '', effectiveFrom: '', motif: '' });

    const charger = useCallback(async () => {
        const res = await api.get('/employees').catch(() => ({ data: null }));
        setSalaries(listeSure(res?.data, 'effectif').filter((e) => e.status !== 'TERMINATED'));
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const annoncer = (texte, ton = 'info') => {
        setMessage({ texte, ton });
        setTimeout(() => setMessage(null), 9000);
    };

    const ouvrir = async (emp) => {
        setOuvert(emp);
        setDetail(null);
        const res = await api.get(`/employees/${emp.id}/remuneration`).catch(() => ({ data: null }));
        if (res?.data?.salarie) setDetail(res.data);
    };

    const decider = async (e) => {
        e.preventDefault();
        if (!ouvert) return;
        try {
            const res = await api.post(`/employees/${ouvert.id}/remuneration`, form);
            annoncer(res.data?.message || 'Décision enregistrée.', 'succes');
            setForm({ montant: '', effectiveFrom: '', motif: '' });
            ouvrir(ouvert);
            charger();
        } catch (err) {
            annoncer(err.message || 'Décision refusée.', 'alerte');
        }
    };

    const filtres = salaries.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.department} ${e.positionTitle}`
            .toLowerCase().includes(recherche.toLowerCase()));

    const sansSalaire = salaries.filter((e) => e.baseSalary == null).length;

    return (
        <div className="space-y-8 pb-12">
            <div className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Banknote className="text-emerald-700" /> Rémunérations
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Le salaire de référence de chaque collaborateur, et l'historique des décisions qui l'ont fixé.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border text-sm ${
                    message.ton === 'alerte' ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : message.ton === 'succes' ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    {message.texte}
                </div>
            )}

            {sansSalaire > 0 && (
                <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900">
                        <span className="font-semibold">{sansSalaire} collaborateur(s) sans rémunération de référence.</span>{' '}
                        Leur paie devra être saisie à la main chaque mois, et ils sont écartés de l'analyse d'équité
                        salariale faute de montant à comparer.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                                <span>Effectif</span>
                                <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                                    <RefreshCw size={12} /> Actualiser
                                </Button>
                            </CardTitle>
                            <div className="relative mt-3">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input value={recherche} onChange={(e) => setRecherche(e.target.value)}
                                    placeholder="Rechercher…" className="pl-9 text-sm" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 max-h-[30rem] overflow-y-auto">
                                {filtres.length === 0 ? (
                                    <p className="p-6 text-sm text-slate-400 text-center">Aucun collaborateur.</p>
                                ) : filtres.map((e) => (
                                    <button key={e.id} onClick={() => ouvrir(e)}
                                        className={`w-full text-left p-4 hover:bg-slate-50 border-0 bg-transparent cursor-pointer ${
                                            ouvert?.id === e.id ? 'bg-emerald-50/60' : ''}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {e.lastName} {e.firstName}
                                                </p>
                                                <p className="text-xs text-slate-500">{e.positionTitle} · {e.department}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {e.baseSalary != null ? (
                                                    <p className="text-sm font-mono font-bold text-slate-900">{fcfa(e.baseSalary)}</p>
                                                ) : (
                                                    <Badge className="bg-amber-100 text-amber-800 text-[10px]">Non renseigné</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-7">
                    {!ouvert ? (
                        <Card className="border border-dashed border-slate-300 bg-slate-50/50">
                            <CardContent className="p-10 text-center text-sm text-slate-400">
                                Choisissez un collaborateur pour voir sa rémunération et son historique.
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border border-slate-200 shadow-sm bg-white">
                            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-base font-bold text-slate-900">
                                    {ouvert.lastName} {ouvert.firstName}
                                </CardTitle>
                                {detail && (
                                    <p className="text-sm text-slate-700 mt-1">
                                        <span className="font-mono font-bold">{fcfa(detail.actuel)}</span>
                                        {detail.depuis ? <span className="text-slate-500"> depuis le {dateFr(detail.depuis)}</span> : null}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="p-5 space-y-5">
                                {detail?.aVenir?.length > 0 && (
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-sky-50 border border-sky-200">
                                        <Clock size={15} className="text-sky-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-sky-900">
                                            {detail.aVenir.map((d) => (
                                                <span key={d.id} className="block">
                                                    {fcfa(d.amount)} à compter du {dateFr(d.effectiveFrom)} — {d.motif}
                                                </span>
                                            ))}
                                            <span className="block mt-1 text-sky-700">
                                                Décision enregistrée, pas encore appliquée : la paie retiendra le montant
                                                en vigueur jusqu'à cette date.
                                            </span>
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={decider} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                    <div>
                                        <label className="text-xs font-medium text-slate-700 block mb-1">Nouveau montant</label>
                                        <Input required type="number" min="1" step="1000" value={form.montant}
                                            onChange={(e) => setForm({ ...form, montant: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-700 block mb-1">Date d'effet</label>
                                        <Input type="date" value={form.effectiveFrom}
                                            onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-medium text-slate-700 block mb-1">Motif</label>
                                        <Input required value={form.motif} placeholder="ex. Promotion, révision annuelle"
                                            onChange={(e) => setForm({ ...form, motif: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-4">
                                        <Button type="submit" size="sm">Enregistrer la décision</Button>
                                        <span className="text-[11px] text-slate-500 ml-3">
                                            Sans date d'effet, la décision s'applique aujourd'hui.
                                        </span>
                                    </div>
                                </form>

                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                        <TrendingUp size={13} /> Historique
                                    </p>
                                    {!detail ? (
                                        <p className="text-xs text-slate-400">Lecture…</p>
                                    ) : detail.decisions.length === 0 ? (
                                        <p className="text-sm text-slate-500">
                                            Aucune décision enregistrée. Le salaire de ce collaborateur n'a pas d'origine tracée.
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                                            {detail.decisions.map((d) => (
                                                <div key={d.id} className="p-3 flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-slate-900">
                                                            <span className="font-mono font-bold">{fcfa(d.amount)}</span>
                                                            {d.previousAmount != null && (
                                                                <span className="text-xs text-slate-400"> — auparavant {fcfa(d.previousAmount)}</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{d.motif || 'Sans motif'}</p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            Effet au {dateFr(d.effectiveFrom)}
                                                            {d.decidePar ? ` · décidé par ${d.decidePar}` : ''}
                                                        </p>
                                                    </div>
                                                    {new Date(d.effectiveFrom) > new Date() && (
                                                        <Badge className="bg-sky-100 text-sky-800 text-[10px] shrink-0">À venir</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
