import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { History, AlertTriangle, RefreshCw, Search, TrendingUp, Briefcase } from 'lucide-react';
import { api, listeSure } from '../lib/api';

/**
 * Historique daté.
 *
 * L'application ne connaissait que le présent : qui occupe quel poste
 * aujourd'hui, jamais qui l'occupait au 1er janvier, ni dans quel service, ni
 * sous quel responsable.
 *
 * Deux précautions tenues à l'écran. Une situation reconstituée lors de la mise
 * en place n'est pas une situation observée, et le dire évite de prendre une
 * hypothèse pour un constat. Et un salarié sans historique est signalé comme
 * lacune, faute de quoi son absence passerait pour une baisse d'effectif.
 */

const dateFr = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');
const fcfa = (n) => (n == null ? '—' : `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} F`);

export function Historique() {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [effectif, setEffectif] = useState(null);
    const [recherche, setRecherche] = useState('');
    const [salaries, setSalaries] = useState([]);
    const [frise, setFrise] = useState(null);
    const [ouvert, setOuvert] = useState(null);

    const charger = useCallback(async () => {
        const res = await api.get(`/employees/effectif-a?date=${date}`).catch(() => ({ data: null }));
        setEffectif(res?.data && Array.isArray(res.data.salaries) ? res.data : null);
    }, [date]);

    useEffect(() => { charger(); }, [charger]);

    useEffect(() => {
        api.get('/employees')
            .then((r) => setSalaries(listeSure(r?.data, 'effectif')))
            .catch(() => setSalaries([]));
    }, []);

    const ouvrirFrise = async (emp) => {
        setOuvert(emp);
        setFrise(null);
        const res = await api.get(`/employees/${emp.id}/historique`).catch(() => ({ data: null }));
        if (res?.data?.salarie) setFrise(res.data);
    };

    const filtres = salaries.filter((e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(recherche.toLowerCase()));

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <History className="text-violet-700" /> Historique daté
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Qui était là, à quel poste, dans quel service — à la date de votre choix.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
                    <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                        <RefreshCw size={12} /> Actualiser
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { titre: 'Effectif à cette date', valeur: effectif?.effectif },
                    { titre: 'Situations reconstituées', valeur: effectif?.reconstitues },
                    { titre: 'Sans historique', valeur: effectif?.sansHistorique }
                ].map((c) => (
                    <Card key={c.titre} className="border border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.titre}</p>
                            <p className="text-3xl font-extrabold text-slate-900 mt-2">{c.valeur ?? '—'}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {effectif && effectif.sansHistorique > 0 && (
                <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900">
                        <span className="font-semibold">
                            {effectif.sansHistorique} salarié(s) présents à cette date mais sans historique.
                        </span>{' '}
                        Ils n'apparaissent pas ci-dessous : l'effectif réel était de {effectif.effectifAttendu}.
                        Reprenez leur situation avec <code className="font-mono">npm run reprise-situations</code>,
                        sinon cette lacune se lira comme une baisse d'effectif.
                    </p>
                </div>
            )}

            {effectif && effectif.reconstitues > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <TrendingUp size={15} className="text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700">
                        {effectif.reconstitues} situation(s) sont <span className="font-semibold">reconstituées</span> —
                        posées lors de la reprise sous l'hypothèse « inchangé depuis l'embauche ». Elles sont
                        fausses pour quiconque a été promu ou muté avant la mise en place de l'historique.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900">
                                Effectif au {dateFr(date)}
                            </CardTitle>
                            {effectif && Object.keys(effectif.parDepartement).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(effectif.parDepartement).map(([d, n]) => (
                                        <Badge key={d} className="bg-slate-100 text-slate-700 text-[10px]">
                                            {d} : {n}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 max-h-[26rem] overflow-y-auto">
                                {!effectif ? (
                                    <p className="p-6 text-sm text-slate-400 text-center">Lecture…</p>
                                ) : effectif.salaries.length === 0 ? (
                                    <p className="p-6 text-sm text-slate-400 text-center">
                                        Aucun salarié connu à cette date.
                                    </p>
                                ) : effectif.salaries.map((s) => (
                                    <div key={s.employeeId} className="p-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900">{s.nom}</p>
                                            <p className="text-xs text-slate-500">
                                                {s.poste || '—'} · {s.departement || '—'}
                                            </p>
                                        </div>
                                        {s.reconstituee && (
                                            <Badge className="bg-slate-200 text-slate-600 text-[10px] shrink-0">
                                                Reconstituée
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-5">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase size={16} className="text-slate-500" /> Parcours d'un salarié
                            </CardTitle>
                            <div className="relative mt-3">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input value={recherche} onChange={(e) => setRecherche(e.target.value)}
                                    placeholder="Rechercher…" className="pl-9 text-sm" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {!ouvert ? (
                                <div className="divide-y divide-slate-100 max-h-[24rem] overflow-y-auto">
                                    {filtres.slice(0, 40).map((e) => (
                                        <button key={e.id} onClick={() => ouvrirFrise(e)}
                                            className="w-full text-left p-3 hover:bg-slate-50 border-0 bg-transparent cursor-pointer">
                                            <p className="text-sm font-semibold text-slate-900">{e.lastName} {e.firstName}</p>
                                            <p className="text-xs text-slate-500">{e.positionTitle}</p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-bold text-slate-900">
                                            {frise?.salarie?.nom || `${ouvert.lastName} ${ouvert.firstName}`}
                                        </p>
                                        <Button variant="outline" size="sm" className="text-xs"
                                            onClick={() => { setOuvert(null); setFrise(null); }}>
                                            Retour
                                        </Button>
                                    </div>

                                    {!frise ? (
                                        <p className="text-xs text-slate-400">Lecture…</p>
                                    ) : frise.repris ? (
                                        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            {frise.repris}
                                        </p>
                                    ) : (
                                        <ol className="relative border-l border-slate-200 ml-2 space-y-4">
                                            {frise.evenements.map((e, i) => (
                                                <li key={i} className="ml-4">
                                                    <span className={`absolute -left-1.5 w-3 h-3 rounded-full ${
                                                        e.type === 'REMUNERATION' ? 'bg-emerald-500' : 'bg-violet-500'}`}></span>
                                                    <p className="text-xs text-slate-400">{dateFr(e.date)}</p>
                                                    {e.type === 'SITUATION' ? (
                                                        <>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {e.poste || '—'}
                                                                {e.reconstituee && (
                                                                    <span className="text-[10px] font-normal text-slate-400 ml-2">
                                                                        reconstituée
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {e.departement || '—'}
                                                                {e.jusqua ? ` · jusqu'au ${dateFr(e.jusqua)}` : ' · en cours'}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm font-semibold text-emerald-800">
                                                                {fcfa(e.montant)}
                                                                {e.precedent != null && (
                                                                    <span className="text-xs font-normal text-slate-400">
                                                                        {' '}— auparavant {fcfa(e.precedent)}
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </>
                                                    )}
                                                    {e.motif && <p className="text-xs text-slate-500 mt-0.5">{e.motif}</p>}
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
