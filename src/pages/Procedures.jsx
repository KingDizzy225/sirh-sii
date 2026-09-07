import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Scale, AlertTriangle, CheckCircle2, Lock, Clock, Plus, X, RefreshCw, ShieldAlert
} from 'lucide-react';
import { api, listeSure } from '../lib/api';

/**
 * Procédures disciplinaires et de rupture.
 *
 * Le dossier disciplinaire enregistrait la décision — une date, un type, un
 * motif. Rien du chemin qui y mène. Or ce n'est pas le motif qui fait perdre
 * les litiges, c'est la forme : une convocation dont on ne peut prouver la
 * remise, un entretien tenu le jour même, une lettre sans motif.
 *
 * Cet écran ne dit pas le droit. Il tient le chemin, et refuse d'enregistrer
 * une étape franchie trop tôt plutôt que d'en garder la trace contre vous.
 */

const STATUTS = {
    EN_COURS: { libelle: 'En cours', ton: 'bg-sky-100 text-sky-800' },
    CLOTUREE: { libelle: 'Close', ton: 'bg-emerald-100 text-emerald-800' },
    ABANDONNEE: { libelle: 'Abandonnée', ton: 'bg-slate-200 text-slate-700' }
};

const dateFr = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');

export function Procedures() {
    const [procedures, setProcedures] = useState([]);
    const [modeles, setModeles] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [ouverte, setOuverte] = useState(null);
    const [formOuvert, setFormOuvert] = useState(false);
    const [message, setMessage] = useState(null);
    const [form, setForm] = useState({ employeeId: '', type: 'SANCTION', motif: '' });
    const [saisie, setSaisie] = useState({});

    const charger = useCallback(async () => {
        const [p, m, e] = await Promise.all([
            api.get('/procedures').catch(() => ({ data: null })),
            api.get('/procedures/modeles').catch(() => ({ data: null })),
            api.get('/employees').catch(() => ({ data: null }))
        ]);
        setProcedures(listeSure(p?.data, 'procédures'));
        setModeles(listeSure(m?.data, 'modèles de procédure'));
        setSalaries(listeSure(e?.data, 'effectif'));
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const annoncer = (texte, ton = 'info') => {
        setMessage({ texte, ton });
        setTimeout(() => setMessage(null), 10000);
    };

    const modeleChoisi = modeles.find((m) => m.type === form.type);

    const ouvrir = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/procedures', form);
            setOuverte(res.data);
            setFormOuvert(false);
            setForm({ employeeId: '', type: 'SANCTION', motif: '' });
            annoncer('Procédure ouverte.', 'succes');
            charger();
        } catch (err) {
            annoncer(err.message || "Ouverture impossible.", 'alerte');
        }
    };

    const rafraichir = async (id) => {
        const res = await api.get(`/procedures/${id}`).catch(() => ({ data: null }));
        if (res?.data?.id) setOuverte(res.data);
        charger();
    };

    const franchir = async (procedure, etape) => {
        const champs = saisie[etape.id] || {};
        try {
            const res = await api.post(`/procedures/${procedure.id}/etapes/${etape.id}`, {
                note: champs.note || undefined,
                preuve: champs.preuve || undefined,
                faiteLe: champs.faiteLe || undefined
            });
            setOuverte(res.data);
            setSaisie((s) => ({ ...s, [etape.id]: {} }));
            annoncer(`« ${etape.libelle} » consignée.`, 'succes');
            charger();
        } catch (err) {
            // Le refus porte la raison : délai non écoulé, étape antérieure à la
            // précédente, étape manquante. C'est l'information utile.
            annoncer(err.message || 'Consignation refusée.', 'alerte');
            rafraichir(procedure.id);
        }
    };

    const cloturer = async (procedure, abandon) => {
        const issue = prompt(abandon
            ? "Motif de l'abandon de la procédure :"
            : "Issue de la procédure (sanction retenue, rupture prononcée) :");
        if (!issue) return;
        try {
            const res = await api.post(`/procedures/${procedure.id}/cloturer`, { issue, abandon });
            setOuverte(res.data);
            annoncer(abandon ? 'Procédure abandonnée.' : 'Procédure close.', 'succes');
            charger();
        } catch (err) {
            annoncer(err.message || 'Clôture refusée.', 'alerte');
        }
    };

    const majSaisie = (etapeId, champ, valeur) =>
        setSaisie((s) => ({ ...s, [etapeId]: { ...(s[etapeId] || {}), [champ]: valeur } }));

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Scale className="text-indigo-600" /> Procédures disciplinaires et de rupture
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Chaque étape, sa date et sa preuve. Ce n'est pas le motif qui se conteste, c'est la forme.
                    </p>
                </div>
                <Button className="gap-2" onClick={() => setFormOuvert(true)}>
                    <Plus size={16} /> Ouvrir une procédure
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border text-sm ${
                    message.ton === 'alerte' ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : message.ton === 'succes' ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    {message.texte}
                </div>
            )}

            {formOuvert && (
                <Card className="border border-indigo-200 shadow-sm bg-white">
                    <CardHeader className="p-5 border-b border-slate-100 bg-indigo-50/40">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                            <span>Nouvelle procédure</span>
                            <button onClick={() => setFormOuvert(false)} className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer">
                                <X size={18} />
                            </button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <form onSubmit={ouvrir} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Salarié</label>
                                    <select
                                        required
                                        value={form.employeeId}
                                        onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                                    >
                                        <option value="">Choisir…</option>
                                        {salaries.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.lastName} {s.firstName} — {s.positionTitle}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Nature</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                                    >
                                        {modeles.map((m) => (
                                            <option key={m.type} value={m.type}>{m.libelle}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {modeleChoisi && (
                                <>
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-900">{modeleChoisi.avertissement}</p>
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        <span className="font-semibold">Étapes : </span>
                                        {modeleChoisi.etapes.map((e) => e.libelle).join(' → ')}
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">
                                    Motif — faits, dates, lieux
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.motif}
                                    onChange={(e) => setForm({ ...form, motif: e.target.value })}
                                    placeholder="Absences non justifiées les 12, 14 et 19 août 2026."
                                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                                />
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Ce motif sera repris dans la notification écrite. Un motif vague s'y retrouvera tel quel.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setFormOuvert(false)}>Annuler</Button>
                                <Button type="submit">Ouvrir</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Liste */}
                <div className="lg:col-span-5">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                                <span>Procédures</span>
                                <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                                    <RefreshCw size={12} /> Actualiser
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 max-h-[32rem] overflow-y-auto">
                                {procedures.length === 0 ? (
                                    <p className="p-6 text-sm text-slate-400 text-center">Aucune procédure ouverte.</p>
                                ) : procedures.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setOuverte(p)}
                                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors border-0 bg-transparent cursor-pointer ${
                                            ouverte?.id === p.id ? 'bg-indigo-50/60' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{p.salarie?.nom}</p>
                                                <p className="text-xs text-slate-500">{p.libelle}</p>
                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    Ouverte le {dateFr(p.ouverteLe)}
                                                    {p.prochaine ? ` · prochaine : ${p.prochaine.libelle}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <Badge className={`text-[10px] ${STATUTS[p.statut]?.ton || ''}`}>
                                                    {STATUTS[p.statut]?.libelle || p.statut}
                                                </Badge>
                                                {p.enRetard && (
                                                    <Badge className="bg-red-100 text-red-700 text-[10px]">En retard</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Détail */}
                <div className="lg:col-span-7">
                    {!ouverte ? (
                        <Card className="border border-dashed border-slate-300 bg-slate-50/50">
                            <CardContent className="p-10 text-center text-sm text-slate-400">
                                Choisissez une procédure pour en voir les étapes.
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border border-slate-200 shadow-sm bg-white">
                            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-base font-bold text-slate-900">
                                    {ouverte.salarie?.nom} — {ouverte.libelle}
                                </CardTitle>
                                <p className="text-xs text-slate-600 mt-1">{ouverte.motif}</p>
                                {ouverte.avertissement && (
                                    <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                        <ShieldAlert size={15} className="text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-900">{ouverte.avertissement}</p>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {ouverte.etapes.map((e) => (
                                        <div key={e.id} className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                        {e.faiteLe
                                                            ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                                                            : e.franchissable
                                                                ? <Clock size={15} className="text-sky-600 shrink-0" />
                                                                : <Lock size={15} className="text-slate-400 shrink-0" />}
                                                        {e.ordre}. {e.libelle}
                                                        {!e.obligatoire && (
                                                            <span className="text-[10px] font-normal text-slate-400">(facultative)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">{e.attendu}</p>
                                                </div>
                                                {e.enRetard && (
                                                    <Badge className="bg-red-100 text-red-700 text-[10px] shrink-0">
                                                        <AlertTriangle size={10} className="mr-1" /> En retard
                                                    </Badge>
                                                )}
                                            </div>

                                            {e.faiteLe ? (
                                                <p className="text-[11px] text-slate-500 mt-2 pl-6">
                                                    Consignée le {dateFr(e.faiteLe)} par {e.faitePar}
                                                    {e.preuve ? ` · preuve : ${e.preuve}` : ''}
                                                    {e.note ? ` · ${e.note}` : ''}
                                                </p>
                                            ) : ouverte.statut !== 'EN_COURS' ? null : !e.franchissable ? (
                                                <p className="text-[11px] text-slate-500 mt-2 pl-6">
                                                    Consignable à partir du {dateFr(e.exigibleLe)}.
                                                    {e.motifDelai ? ` ${e.motifDelai}` : ''}
                                                </p>
                                            ) : (
                                                <div className="mt-3 pl-6 space-y-2">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                        <Input
                                                            type="date"
                                                            value={(saisie[e.id] || {}).faiteLe || ''}
                                                            onChange={(ev) => majSaisie(e.id, 'faiteLe', ev.target.value)}
                                                            className="text-xs"
                                                        />
                                                        <Input
                                                            placeholder="Preuve de remise"
                                                            value={(saisie[e.id] || {}).preuve || ''}
                                                            onChange={(ev) => majSaisie(e.id, 'preuve', ev.target.value)}
                                                            className="text-xs"
                                                        />
                                                        <Input
                                                            placeholder="Note"
                                                            value={(saisie[e.id] || {}).note || ''}
                                                            onChange={(ev) => majSaisie(e.id, 'note', ev.target.value)}
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                    <Button size="sm" onClick={() => franchir(ouverte, e)} className="text-xs">
                                                        Consigner cette étape
                                                    </Button>
                                                    <p className="text-[11px] text-slate-400">
                                                        Sans date, l'étape est consignée à aujourd'hui.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {ouverte.statut === 'EN_COURS' ? (
                                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 justify-end">
                                        <Button variant="outline" size="sm" onClick={() => cloturer(ouverte, true)}>
                                            Abandonner
                                        </Button>
                                        <Button size="sm" onClick={() => cloturer(ouverte, false)}>
                                            Clôturer
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                        <p className="text-xs text-slate-600">
                                            <span className="font-semibold">Issue :</span> {ouverte.issue}
                                            {' · '}close le {dateFr(ouverte.clotureeLe)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
