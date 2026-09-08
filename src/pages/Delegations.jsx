import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { UserCheck, RefreshCw, Ban, ArrowRight } from 'lucide-react';
import { api, listeSure } from '../lib/api';

/**
 * Délégations de validation.
 *
 * Rien n'existait : quand le responsable qui valide était lui-même en congé,
 * les demandes s'arrêtaient — précisément à la période où elles affluent.
 *
 * Une délégation ne donne jamais plus que ce que le titulaire pouvait faire,
 * et cesse d'elle-même à son terme.
 */

const PORTEES = [
    { code: 'TOUT', libelle: 'Toutes les validations' },
    { code: 'CONGES', libelle: 'Congés et absences' },
    { code: 'DEPENSES', libelle: 'Notes de frais' }
];

const dateFr = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');
const pourInput = (d) => d.toISOString().slice(0, 10);

export function Delegations() {
    const [delegations, setDelegations] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [message, setMessage] = useState(null);
    const [form, setForm] = useState({
        titulaireId: '', suppleantId: '', portee: 'TOUT',
        debut: pourInput(new Date()),
        fin: pourInput(new Date(Date.now() + 14 * 86400000)),
        motif: ''
    });

    const charger = useCallback(async () => {
        const [d, e] = await Promise.all([
            api.get('/delegations').catch(() => ({ data: null })),
            api.get('/employees').catch(() => ({ data: null }))
        ]);
        setDelegations(listeSure(d?.data, 'délégations'));
        setSalaries(listeSure(e?.data, 'effectif').filter((x) => x.status !== 'TERMINATED'));
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const annoncer = (texte, ton = 'info') => {
        setMessage({ texte, ton });
        setTimeout(() => setMessage(null), 9000);
    };

    const creer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/delegations', form);
            annoncer('Délégation enregistrée. Le suppléant en est averti.', 'succes');
            setForm({ ...form, titulaireId: '', suppleantId: '', motif: '' });
            charger();
        } catch (err) {
            annoncer(err.message || 'Délégation refusée.', 'alerte');
        }
    };

    const revoquer = async (d) => {
        if (!confirm(`Révoquer la délégation de ${d.titulaire?.nom} à ${d.suppleant?.nom} ?`)) return;
        try {
            await api.post(`/delegations/${d.id}/revoquer`);
            annoncer('Délégation révoquée.', 'succes');
            charger();
        } catch (err) {
            annoncer(err.message || 'Révocation impossible.', 'alerte');
        }
    };

    const nom = (e) => `${e.lastName} ${e.firstName}`;

    return (
        <div className="space-y-8 pb-12">
            <div className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <UserCheck className="text-indigo-600" /> Délégations de validation
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Pour que les demandes ne s'arrêtent pas quand celui qui valide est absent.
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

            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-bold text-slate-900">Nouvelle délégation</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <form onSubmit={creer} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-slate-700 block mb-1">Titulaire (absent)</label>
                            <select required value={form.titulaireId}
                                onChange={(e) => setForm({ ...form, titulaireId: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm">
                                <option value="">Choisir…</option>
                                {salaries.map((e) => <option key={e.id} value={e.id}>{nom(e)} — {e.positionTitle}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-slate-700 block mb-1">Suppléant</label>
                            <select required value={form.suppleantId}
                                onChange={(e) => setForm({ ...form, suppleantId: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm">
                                <option value="">Choisir…</option>
                                {salaries.map((e) => <option key={e.id} value={e.id}>{nom(e)} — {e.positionTitle}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-slate-700 block mb-1">Portée</label>
                            <select value={form.portee}
                                onChange={(e) => setForm({ ...form, portee: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm">
                                {PORTEES.map((p) => <option key={p.code} value={p.code}>{p.libelle}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Du</label>
                            <Input required type="date" value={form.debut}
                                onChange={(e) => setForm({ ...form, debut: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Au</label>
                            <Input required type="date" value={form.fin}
                                onChange={(e) => setForm({ ...form, fin: e.target.value })} />
                        </div>
                        <div className="sm:col-span-3">
                            <label className="text-xs font-medium text-slate-700 block mb-1">Motif</label>
                            <Input value={form.motif} placeholder="ex. Congés annuels"
                                onChange={(e) => setForm({ ...form, motif: e.target.value })} />
                        </div>
                        <Button type="submit">Déléguer</Button>
                        <p className="sm:col-span-6 text-[11px] text-slate-500">
                            Le suppléant reçoit les droits du titulaire pour la portée et la période indiquées —
                            jamais davantage, et jamais au-delà.
                        </p>
                    </form>
                </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                        <span>Délégations enregistrées</span>
                        <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                            <RefreshCw size={12} /> Actualiser
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {delegations.length === 0 ? (
                            <p className="p-6 text-sm text-slate-400 text-center">Aucune délégation.</p>
                        ) : delegations.map((d) => (
                            <div key={d.id} className="p-4 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                                        {d.titulaire?.nom}
                                        <ArrowRight size={13} className="text-slate-400" />
                                        {d.suppleant?.nom}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {PORTEES.find((p) => p.code === d.portee)?.libelle || d.portee}
                                        {' · '}du {dateFr(d.debut)} au {dateFr(d.fin)}
                                    </p>
                                    {d.motif && <p className="text-[11px] text-slate-400 mt-0.5">{d.motif}</p>}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {d.revoqueeLe ? (
                                        <Badge className="bg-slate-200 text-slate-600 text-[10px]">
                                            Révoquée le {dateFr(d.revoqueeLe)}
                                        </Badge>
                                    ) : d.enCours ? (
                                        <>
                                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">En cours</Badge>
                                            <button onClick={() => revoquer(d)} title="Révoquer"
                                                className="text-slate-300 hover:text-red-600 bg-transparent border-0 cursor-pointer">
                                                <Ban size={15} />
                                            </button>
                                        </>
                                    ) : (
                                        <Badge className="bg-slate-100 text-slate-600 text-[10px]">
                                            {new Date(d.debut) > new Date() ? 'À venir' : 'Terminée'}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
