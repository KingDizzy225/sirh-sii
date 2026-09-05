import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
    Smile, Meh, Frown, TrendingUp, MessageSquare, RefreshCw,
    AlertTriangle, Info, Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { api, listeSure } from '../lib/api';
import { cn } from '@/lib/utils';

/**
 * Un eNPS se lit en trois groupes : promoteurs (9-10), passifs (7-8),
 * détracteurs (0-6). Le score est la part de promoteurs moins celle de
 * détracteurs, exprimée en points et non en pourcentage — il va de −100 à +100.
 */
const groupe = (score) => (score >= 9 ? 'promoteur' : score >= 7 ? 'passif' : 'detracteur');

const calculerEnps = (reponses) => {
    if (!reponses.length) return null;
    const p = reponses.filter(r => groupe(r.score) === 'promoteur').length;
    const d = reponses.filter(r => groupe(r.score) === 'detracteur').length;
    return Math.round(((p - d) / reponses.length) * 100);
};

const couleurEnps = (v) => {
    if (v === null) return 'text-slate-400';
    if (v >= 30) return 'text-emerald-600';
    if (v >= 0) return 'text-amber-600';
    return 'text-rose-600';
};

const dateFr = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export function Engagement() {
    const [enquetes, setEnquetes] = useState([]);
    const [selection, setSelection] = useState('TOUTES');
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    const charger = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const { data } = await api.get('/surveys');
            setEnquetes(listeSure(data, 'enquêtes de climat'));
        } catch (e) {
            setErreur(e.message || 'Chargement impossible.');
            setEnquetes([]);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => { charger(); }, []);

    const reponses = useMemo(() => {
        const source = selection === 'TOUTES'
            ? enquetes
            : enquetes.filter(e => e.id === selection);
        return source.flatMap(e => (e.responses || []).map(r => ({ ...r, enquete: e.title })));
    }, [enquetes, selection]);

    const enps = calculerEnps(reponses);

    const repartition = useMemo(() => {
        const c = { promoteur: 0, passif: 0, detracteur: 0 };
        for (const r of reponses) c[groupe(r.score)]++;
        return c;
    }, [reponses]);

    // Une tendance se lit sur les enquêtes réellement passées, dans l'ordre où
    // elles l'ont été. La version précédente affichait six points mensuels
    // écrits en dur, qui ne bougeaient jamais quelles que soient les réponses.
    const tendance = useMemo(() => {
        return [...enquetes]
            .filter(e => (e.responses || []).length > 0)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map(e => ({
                nom: e.title.length > 18 ? e.title.slice(0, 18) + '…' : e.title,
                date: dateFr(e.createdAt),
                enps: calculerEnps(e.responses),
                reponses: e.responses.length
            }));
    }, [enquetes]);

    const parService = useMemo(() => {
        const m = new Map();
        for (const r of reponses) {
            const d = r.department || 'Non précisé';
            if (!m.has(d)) m.set(d, { service: d, scores: [] });
            m.get(d).scores.push(r);
        }
        return [...m.values()]
            .map(x => ({ service: x.service, nb: x.scores.length, enps: calculerEnps(x.scores) }))
            .sort((a, b) => (a.enps ?? 0) - (b.enps ?? 0));
    }, [reponses]);

    const verbatims = useMemo(
        () => reponses.filter(r => r.feedback && r.feedback.trim())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [reponses]
    );

    const part = (n) => (reponses.length ? Math.round((n / reponses.length) * 100) : 0);

    const bloc = (titre, valeur, detail, icone, couleur) => (
        <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{titre}</p>
                        <p className={cn('text-3xl font-bold mt-2', couleur || 'text-slate-900')}>{valeur}</p>
                        {detail && <p className="text-xs text-slate-400 mt-2">{detail}</p>}
                    </div>
                    {icone}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Gauge className="h-8 w-8 text-indigo-600" />
                        Engagement des collaborateurs
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Score eNPS calculé sur les réponses aux enquêtes de climat social.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2.5 max-w-xs"
                        value={selection}
                        onChange={(e) => setSelection(e.target.value)}
                    >
                        <option value="TOUTES">Toutes les enquêtes</option>
                        {enquetes.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.title} ({(e.responses || []).length} réponse(s))
                            </option>
                        ))}
                    </select>
                    <Button variant="outline" size="icon" onClick={charger} title="Actualiser">
                        <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            {erreur && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-800">{erreur}</p>
                </div>
            )}

            {!chargement && !erreur && enquetes.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
                    <p className="text-sm text-slate-500">
                        Aucune enquête de climat social. Créez-en une depuis le module
                        Enquêtes de climat : les scores et les verbatims remonteront ici.
                    </p>
                </div>
            )}

            {reponses.length > 0 && (
                <>
                    <div className="grid gap-6 md:grid-cols-4">
                        {bloc('Score eNPS', enps === null ? '—' : enps > 0 ? `+${enps}` : `${enps}`,
                            `sur ${reponses.length} réponse(s)`,
                            <TrendingUp className="h-5 w-5 text-indigo-500" />, couleurEnps(enps))}
                        {bloc('Promoteurs', `${part(repartition.promoteur)} %`,
                            `${repartition.promoteur} réponse(s), note 9-10`,
                            <Smile className="h-5 w-5 text-emerald-500" />, 'text-emerald-600')}
                        {bloc('Passifs', `${part(repartition.passif)} %`,
                            `${repartition.passif} réponse(s), note 7-8`,
                            <Meh className="h-5 w-5 text-amber-500" />, 'text-amber-600')}
                        {bloc('Détracteurs', `${part(repartition.detracteur)} %`,
                            `${repartition.detracteur} réponse(s), note 0-6`,
                            <Frown className="h-5 w-5 text-rose-500" />, 'text-rose-600')}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-base">Évolution du score</CardTitle>
                                <CardDescription>
                                    Une enquête, un point. {tendance.length < 2 && 'Une seconde enquête est nécessaire pour dessiner une tendance.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {tendance.length < 2 ? (
                                    <p className="py-12 text-center text-sm text-slate-400">
                                        {tendance.length === 1
                                            ? `Une seule enquête exploitée : eNPS ${tendance[0].enps > 0 ? '+' : ''}${tendance[0].enps}.`
                                            : 'Aucune enquête avec des réponses.'}
                                    </p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={tendance}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[-100, 100]} tick={{ fontSize: 11 }} />
                                            <ReferenceLine y={0} stroke="#94a3b8" />
                                            <Tooltip
                                                formatter={(v) => [`eNPS ${v > 0 ? '+' : ''}${v}`, '']}
                                                labelFormatter={(l, p) => {
                                                    const d = p?.[0]?.payload;
                                                    return d ? `${l} · ${d.date} · ${d.reponses} réponse(s)` : l;
                                                }}
                                            />
                                            <Line type="monotone" dataKey="enps" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-base">Par service</CardTitle>
                                <CardDescription>
                                    Du plus bas au plus haut. Les réponses sont anonymes : seul le
                                    service est connu, jamais son auteur.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {parService.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-slate-400">Aucune réponse.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {parService.map(s => (
                                            <div key={s.service}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-semibold text-slate-800">{s.service}</span>
                                                    <span className={cn('font-bold', couleurEnps(s.enps))}>
                                                        {s.enps === null ? '—' : s.enps > 0 ? `+${s.enps}` : s.enps}
                                                        <span className="text-slate-400 font-normal"> · {s.nb} rép.</span>
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 relative overflow-hidden">
                                                    <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
                                                    {s.enps !== null && (
                                                        <div className={cn('absolute inset-y-0 h-2',
                                                            s.enps >= 0 ? 'bg-emerald-500 left-1/2' : 'bg-rose-500 right-1/2')}
                                                            style={{ width: `${Math.min(Math.abs(s.enps) / 2, 50)}%` }} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare size={18} className="text-slate-500" />
                                Verbatims
                                <Badge variant="secondary" className="ml-1">{verbatims.length}</Badge>
                            </CardTitle>
                            <CardDescription>
                                Commentaires libres, sans identification de leur auteur — c'est la
                                condition pour qu'ils soient sincères.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {verbatims.length === 0 ? (
                                <p className="py-8 text-center text-sm text-slate-400">
                                    Aucun commentaire libre pour cette sélection.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {verbatims.map(v => (
                                        <div key={v.id} className={cn('rounded-lg border p-3',
                                            groupe(v.score) === 'promoteur' ? 'border-emerald-200 bg-emerald-50/40'
                                                : groupe(v.score) === 'detracteur' ? 'border-rose-200 bg-rose-50/40'
                                                    : 'border-slate-200 bg-slate-50/40')}>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Badge variant="outline" className="text-[10px] font-bold">
                                                    {v.score}/10
                                                </Badge>
                                                <span className="text-[11px] text-slate-500">
                                                    {v.department || 'Service non précisé'} · {dateFr(v.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700">{v.feedback}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                        <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-500">
                            L'eNPS est la part de promoteurs moins celle de détracteurs, en points
                            de −100 à +100. Il se lit avec le nombre de réponses : sur un effectif
                            réduit, quelques avis suffisent à le déplacer fortement.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
