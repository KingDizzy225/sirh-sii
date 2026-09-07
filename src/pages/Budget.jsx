import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Wallet, Users, TrendingUp, AlertTriangle, RefreshCw, Trash2, Info
} from 'lucide-react';
import { api } from '../lib/api';

/**
 * Budget d'effectif et de masse salariale.
 *
 * L'application savait dire ce qui avait été payé, jamais ce qui avait été
 * prévu : le mot « budget » n'apparaissait nulle part dans le modèle. Un écart
 * ne se voit pas sans point de comparaison.
 *
 * Trois choses sont dites explicitement plutôt que laissées à l'interprétation :
 * les bulletins sans décomposition ne sont pas comptés pour zéro, la projection
 * n'apparaît qu'à partir d'assez de mois renseignés, et les services qui
 * emploient sans budget sont nommés.
 */

const fcfa = (n) =>
    n == null ? '—' : `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} F`;

export function Budget() {
    const [annee, setAnnee] = useState(new Date().getFullYear());
    const [bilan, setBilan] = useState(null);
    const [message, setMessage] = useState(null);
    const [form, setForm] = useState({ departement: '', effectifBudgete: '', masseSalarialeBudgetee: '' });

    const charger = useCallback(async () => {
        const res = await api.get(`/budget?annee=${annee}`).catch(() => ({ data: null }));
        setBilan(res?.data && Array.isArray(res.data.services) ? res.data : null);
    }, [annee]);

    useEffect(() => { charger(); }, [charger]);

    const annoncer = (texte, ton = 'info') => {
        setMessage({ texte, ton });
        setTimeout(() => setMessage(null), 9000);
    };

    const enregistrer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budget', { annee, ...form });
            setForm({ departement: '', effectifBudgete: '', masseSalarialeBudgetee: '' });
            annoncer('Budget enregistré.', 'succes');
            charger();
        } catch (err) {
            annoncer(err.message || 'Enregistrement refusé.', 'alerte');
        }
    };

    const retirer = async (ligne) => {
        if (!confirm(`Retirer le budget ${annee} de ${ligne.departement} ?`)) return;
        try {
            await api.delete(`/budget/${ligne.id}`);
            charger();
        } catch (err) {
            annoncer(err.message || 'Suppression impossible.', 'alerte');
        }
    };

    const t = bilan?.totaux;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Wallet className="text-emerald-700" /> Budget d'effectif et de masse salariale
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Ce qui était prévu, ce qui est engagé, et l'écart — service par service.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Exercice</label>
                    <Input
                        type="number"
                        value={annee}
                        onChange={(e) => setAnnee(parseInt(e.target.value, 10) || annee)}
                        className="w-24"
                    />
                    <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                        <RefreshCw size={12} /> Actualiser
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border text-sm ${
                    message.ton === 'alerte' ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : message.ton === 'succes' ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    {message.texte}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { titre: 'Effectif budgété', valeur: t?.effectifBudgete, icone: Users, sous: `${t?.effectifReel ?? '—'} en poste` },
                    { titre: 'Masse budgétée', valeur: t ? fcfa(t.masseSalarialeBudgetee) : null, icone: Wallet, sous: "coût employeur annuel" },
                    { titre: 'Réalisé à ce jour', valeur: t ? fcfa(t.masseRealisee) : null, icone: TrendingUp, sous: `${bilan?.moisRenseignes ?? 0} mois renseigné(s)` },
                    {
                        titre: 'Projection annuelle',
                        valeur: bilan?.projetable ? fcfa(t.projectionAnnuelle) : '—',
                        icone: TrendingUp,
                        sous: bilan?.projetable ? 'extrapolée sur les mois renseignés' : 'pas assez de mois'
                    }
                ].map((c) => (
                    <Card key={c.titre} className="border border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.titre}</p>
                                <c.icone size={17} className="text-slate-400" />
                            </div>
                            <p className="text-2xl font-extrabold text-slate-900 mt-2">{c.valeur ?? '—'}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{c.sous}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {bilan && !bilan.projetable && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700">{bilan.motifSansProjection}</p>
                </div>
            )}

            {bilan && t?.bulletinsIncomplets > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900">
                        {t.bulletinsIncomplets} bulletin(s) sans décomposition des cotisations sont exclus du
                        réalisé. Les compter à zéro ferait apparaître une économie qui n'existe pas —
                        relancer la paie du mois, ou <code className="font-mono">npm run repair-payrolls</code>.
                    </p>
                </div>
            )}

            {bilan && bilan.horsBudget.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900">
                        <span className="font-semibold">Services employant sans budget : </span>
                        {bilan.horsBudget.join(', ')}. Ce sont eux qu'on découvre en fin d'exercice.
                    </p>
                </div>
            )}

            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-bold text-slate-900">Par service</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                <tr>
                                    <th className="px-5 py-3">Service</th>
                                    <th className="px-5 py-3 text-right">Postes</th>
                                    <th className="px-5 py-3 text-right">En poste</th>
                                    <th className="px-5 py-3 text-right">Masse budgétée</th>
                                    <th className="px-5 py-3 text-right">Réalisé</th>
                                    <th className="px-5 py-3 text-right">Projection</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {!bilan ? (
                                    <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Lecture du budget…</td></tr>
                                ) : bilan.services.length === 0 ? (
                                    <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Aucun service.</td></tr>
                                ) : bilan.services.map((s) => (
                                    <tr key={s.departement} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-5 py-3 font-semibold text-slate-800">
                                            {s.departement}
                                            {!s.budgete && (
                                                <Badge className="bg-amber-100 text-amber-800 text-[10px] ml-2">Hors budget</Badge>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">{s.effectifBudgete || '—'}</td>
                                        <td className="px-5 py-3 text-right">
                                            {s.effectifReel}
                                            {s.budgete && s.ecartEffectif !== 0 && (
                                                <span className={`ml-2 text-[11px] font-semibold ${s.ecartEffectif > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                                    {s.ecartEffectif > 0 ? `+${s.ecartEffectif}` : s.ecartEffectif}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">{s.masseSalarialeBudgetee ? fcfa(s.masseSalarialeBudgetee) : '—'}</td>
                                        <td className="px-5 py-3 text-right">
                                            {fcfa(s.masseRealisee)}
                                            {s.bulletinsIncomplets > 0 && (
                                                <span className="block text-[10px] text-amber-700">
                                                    {s.bulletinsIncomplets} fiche(s) exclue(s)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {s.projectionAnnuelle == null ? '—' : (
                                                <span className={s.depassementProjete ? 'text-red-600 font-semibold' : ''}>
                                                    {fcfa(s.projectionAnnuelle)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {s.id && (
                                                <button onClick={() => retirer(s)}
                                                    className="text-slate-300 hover:text-red-600 bg-transparent border-0 cursor-pointer">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-slate-900">Budgéter un service</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <form onSubmit={enregistrer} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Service</label>
                            <Input required list="services-connus" value={form.departement}
                                onChange={(e) => setForm({ ...form, departement: e.target.value })} />
                            <datalist id="services-connus">
                                {(bilan?.services || []).map((s) => <option key={s.departement} value={s.departement} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Postes budgétés</label>
                            <Input required type="number" min="0" value={form.effectifBudgete}
                                onChange={(e) => setForm({ ...form, effectifBudgete: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Masse annuelle (F)</label>
                            <Input required type="number" min="0" step="1000" value={form.masseSalarialeBudgetee}
                                onChange={(e) => setForm({ ...form, masseSalarialeBudgetee: e.target.value })} />
                        </div>
                        <Button type="submit">Enregistrer</Button>
                    </form>
                    <p className="text-[11px] text-slate-500 mt-3">
                        La masse s'entend en coût employeur — brut plus charges patronales — sur l'exercice.
                        C'est ce que l'entreprise décaisse, et la seule grandeur comparable au réalisé.
                        Une nouvelle saisie remplace le budget existant du service.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
