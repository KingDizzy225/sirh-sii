import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Vote, AlertTriangle, CalendarCheck, UserMinus, Plus, Trash2 } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

/**
 * Délégués du personnel : obligation, scrutins, mandats, réunions.
 *
 * L'application connaissait l'effectif sans rien dire de ce qu'il déclenche.
 */

const COLLEGES = ['UNIQUE', 'CADRES', 'AGENTS', 'OUVRIERS'];
const ETATS = {
    EN_COURS: { libelle: 'En cours', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ECHEANCE_PROCHE: { libelle: 'Échéance proche', classe: 'bg-amber-50 text-amber-800 border-amber-200' },
    ECHU: { libelle: 'Échu', classe: 'bg-slate-100 text-slate-500 border-slate-200' },
    INTERROMPU: { libelle: 'Interrompu', classe: 'bg-slate-100 text-slate-500 border-slate-200' }
};
const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');

export function Delegues() {
    const [situation, setSituation] = useState(null);
    const [salaries, setSalaries] = useState([]);
    const [message, setMessage] = useState(null);
    const [scrutin, setScrutin] = useState(null);
    const [reunion, setReunion] = useState(null);

    const charger = useCallback(async () => {
        try {
            const [res, resSalaries] = await Promise.all([api.get('/delegues'), api.get('/employees')]);
            setSituation(res?.data && Array.isArray(res.data.mandats) ? res.data : null);
            setSalaries(listeSure(resSalaries?.data, 'salariés').filter((s) => s.status !== 'TERMINATED'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const enregistrerScrutin = async (evenement) => {
        evenement.preventDefault();
        try {
            const res = await api.post('/delegues/scrutins', {
                ...scrutin,
                inscrits: Number(scrutin.inscrits),
                votants: Number(scrutin.votants),
                elus: scrutin.elus.filter((e) => e.employeeId)
            });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Scrutin enregistré.' });
            setScrutin(null);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        }
    };

    const terminer = async (mandat) => {
        const motif = window.prompt(`Motif de la fin du mandat de ${mandat.nom}`);
        if (!motif) return;
        try {
            const res = await api.post(`/delegues/mandats/${mandat.id}/terminer`, { motif });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Mandat clos.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Fin de mandat impossible.' });
        }
    };

    const enregistrerReunion = async (evenement) => {
        evenement.preventDefault();
        try {
            const res = await api.post('/delegues/reunions', reunion);
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Réunion enregistrée.' });
            setReunion(null);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        }
    };

    const mandats = situation?.mandats || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Vote className="w-6 h-6 text-indigo-600" /> Délégués du personnel</h1>
                    <p className="text-slate-500 mt-1">Obligation, élections, mandats et réunions.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setScrutin({ date: '', tour: 1, college: 'UNIQUE', inscrits: '', votants: '', observations: '', elus: [{ employeeId: '', qualite: 'TITULAIRE', college: 'UNIQUE' }] })}>
                        <Plus className="w-4 h-4 mr-1" /> Scrutin
                    </Button>
                    <Button variant="outline" onClick={() => setReunion({ date: '', objet: '', compteRendu: '' })}>
                        <CalendarCheck className="w-4 h-4 mr-1" /> Réunion
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            {situation && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            ['Effectif retenu', situation.effectif],
                            ['Seuil légal', situation.seuil],
                            ['Mandats en cours', situation.enCours],
                            ['Hors effectif', situation.horsEffectif]
                        ].map(([libelle, valeur]) => (
                            <Card key={libelle}><CardContent className="p-4">
                                <p className="text-2xl font-bold text-slate-900 tabular-nums">{valeur}</p>
                                <p className="text-xs text-slate-500">{libelle}</p>
                            </CardContent></Card>
                        ))}
                    </div>

                    {!situation.baremeSaisi && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            Le nombre de délégués par tranche d'effectif est fixé par arrêté et n'est pas saisi
                            (<code>DELEGUES_BAREME</code>). L'application suit les mandats et les échéances, mais ne dit pas
                            combien de délégués vous devez avoir : elle n'inventera pas un chiffre qui serait pris pour vrai.
                        </div>
                    )}

                    {situation.manques.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            <p className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> À traiter</p>
                            <ul className="mt-1 space-y-1">{situation.manques.map((m, i) => <li key={i}>{m.texte}</li>)}</ul>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Mandats</CardTitle>
                            <CardDescription>Durée retenue : {situation.dureeMandatMois} mois.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {mandats.length === 0 ? (
                                <p className="p-6 text-sm text-slate-500">Aucun mandat enregistré.</p>
                            ) : (
                                <ul className="divide-y">
                                    {mandats.map((m) => {
                                        const etat = ETATS[m.etat] || ETATS.ECHU;
                                        return (
                                            <li key={m.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-slate-800">{m.nom} <span className="text-xs text-slate-500">{m.qualite === 'TITULAIRE' ? 'titulaire' : 'suppléant'} · collège {m.college.toLowerCase()}</span></p>
                                                    <p className="text-xs text-slate-500">
                                                        du {date(m.debut)} au {date(m.fin)}
                                                        {m.finAnticipeeLe && ` · interrompu le ${date(m.finAnticipeeLe)} : ${m.finAnticipeeMotif}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full border ${etat.classe}`}>{etat.libelle}</span>
                                                    {['EN_COURS', 'ECHEANCE_PROCHE'].includes(m.etat) && (
                                                        <Button variant="outline" size="sm" onClick={() => terminer(m)}><UserMinus className="w-4 h-4" /></Button>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Réunions</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            {situation.reunions.length === 0 ? (
                                <p className="p-6 text-sm text-slate-500">Aucune réunion enregistrée.</p>
                            ) : (
                                <ul className="divide-y">
                                    {situation.reunions.map((r) => (
                                        <li key={r.id} className="p-4">
                                            <p className="font-medium text-slate-800">{date(r.date)} — {r.objet}</p>
                                            {r.compteRendu && <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{r.compteRendu}</p>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {scrutin && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setScrutin(null)}>
                    <form onSubmit={enregistrerScrutin} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Procès-verbal du scrutin</h2>
                        <div className="grid md:grid-cols-4 gap-3">
                            <label className="block md:col-span-2">
                                <span className="text-sm font-medium text-slate-700">Date</span>
                                <input required type="date" value={scrutin.date} onChange={(e) => setScrutin((s) => ({ ...s, date: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Tour</span>
                                <select value={scrutin.tour} onChange={(e) => setScrutin((s) => ({ ...s, tour: Number(e.target.value) }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                    <option value={1}>1er</option><option value={2}>2e</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Collège</span>
                                <select value={scrutin.college} onChange={(e) => setScrutin((s) => ({ ...s, college: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                    {COLLEGES.map((c) => <option key={c} value={c}>{c.toLowerCase()}</option>)}
                                </select>
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-sm font-medium text-slate-700">Inscrits</span>
                                <input required type="number" min="1" value={scrutin.inscrits} onChange={(e) => setScrutin((s) => ({ ...s, inscrits: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-sm font-medium text-slate-700">Votants</span>
                                <input required type="number" min="0" value={scrutin.votants} onChange={(e) => setScrutin((s) => ({ ...s, votants: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-700">Élus</p>
                            {scrutin.elus.map((elu, i) => (
                                <div key={i} className="flex gap-2">
                                    <select required value={elu.employeeId}
                                        onChange={(e) => setScrutin((s) => ({ ...s, elus: s.elus.map((x, j) => (j === i ? { ...x, employeeId: e.target.value } : x)) }))}
                                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                        <option value="">Choisir un salarié</option>
                                        {salaries.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                                    </select>
                                    <select value={elu.qualite}
                                        onChange={(e) => setScrutin((s) => ({ ...s, elus: s.elus.map((x, j) => (j === i ? { ...x, qualite: e.target.value } : x)) }))}
                                        className="rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                        <option value="TITULAIRE">Titulaire</option><option value="SUPPLEANT">Suppléant</option>
                                    </select>
                                    {scrutin.elus.length > 1 && (
                                        <button type="button" onClick={() => setScrutin((s) => ({ ...s, elus: s.elus.filter((_, j) => j !== i) }))}>
                                            <Trash2 className="w-4 h-4 text-slate-400" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="text-sm text-indigo-600"
                                onClick={() => setScrutin((s) => ({ ...s, elus: [...s.elus, { employeeId: '', qualite: 'TITULAIRE', college: s.college }] }))}>
                                + Ajouter un élu
                            </button>
                        </div>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Observations</span>
                            <textarea rows={2} value={scrutin.observations} onChange={(e) => setScrutin((s) => ({ ...s, observations: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setScrutin(null)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </div>
                    </form>
                </div>
            )}

            {reunion && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setReunion(null)}>
                    <form onSubmit={enregistrerReunion} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Réunion avec les délégués</h2>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Date</span>
                            <input required type="date" value={reunion.date} onChange={(e) => setReunion((r) => ({ ...r, date: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Objet</span>
                            <input required value={reunion.objet} onChange={(e) => setReunion((r) => ({ ...r, objet: e.target.value }))}
                                placeholder="Réunion mensuelle" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Compte rendu</span>
                            <textarea rows={5} value={reunion.compteRendu} onChange={(e) => setReunion((r) => ({ ...r, compteRendu: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setReunion(null)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
