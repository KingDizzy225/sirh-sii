import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PhoneCall, AlertTriangle, Info, Plus, Check, X } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Astreintes.
 *
 * Le planning dit qui couvre. Les deux choses qui manquaient le plus n'en font
 * pas partie : les nuits que personne ne couvre, et les enchaînements qu'aucun
 * responsable ne voit venir. Elles sont donc affichées en premier.
 */

const montant = (n) => new Intl.NumberFormat('fr-CI').format(Math.round(n || 0)) + ' F';
const jour = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');
const moisCourant = () => new Date().toISOString().slice(0, 7);

const TONS = {
    PLANIFIEE: 'bg-sky-100 text-sky-800',
    EFFECTUEE: 'bg-amber-100 text-amber-800',
    PAYEE: 'bg-emerald-100 text-emerald-800',
    ANNULEE: 'bg-slate-100 text-slate-500'
};

export function Astreintes() {
    const [donnees, setDonnees] = useState(null);
    const [mois, setMois] = useState(moisCourant());
    const [message, setMessage] = useState(null);
    const [ajout, setAjout] = useState(null);

    const charger = useCallback(async (periode) => {
        try {
            const res = await api.get(`/astreintes?mois=${periode}`);
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(mois); }, [charger, mois]);

    const planifier = async (evenement) => {
        evenement.preventDefault();
        try {
            const res = await api.post('/astreintes', {
                employeeId: ajout.employeeId,
                debut: ajout.debut,
                fin: ajout.fin,
                type: ajout.type,
                site: ajout.site,
                compensation: ajout.compensation,
                commentaire: ajout.commentaire
            });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Astreinte planifiée.' });
            setAjout(null);
            charger(mois);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Planification impossible.' });
        }
    };

    const constater = async (ligne) => {
        const saisi = window.prompt('Nombre d\'interventions pendant cette astreinte', '0');
        if (saisi === null) return;
        try {
            const res = await api.post(`/astreintes/${ligne.id}/constater`, { interventions: Number(saisi) });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Astreinte constatée.' });
            charger(mois);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Constatation impossible.' });
        }
    };

    const annuler = async (ligne) => {
        try {
            const res = await api.post(`/astreintes/${ligne.id}/annuler`, {});
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Astreinte annulée.' });
            charger(mois);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Annulation impossible.' });
        }
    };

    const lignes = donnees?.lignes || [];
    const trous = donnees?.joursSansCouverture || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <PhoneCall className="w-6 h-6 text-orange-600" /> Astreintes
                    </h1>
                    <p className="text-slate-500 mt-1">Rester joignable sans être au travail — et ce que ça vaut.</p>
                </div>
                <div className="flex items-center gap-2">
                    <input type="month" value={mois} onChange={(e) => setMois(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2" />
                    <Button onClick={() => setAjout({
                        employeeId: '', debut: '', fin: '', type: 'SEMAINE', site: '', compensation: '', commentaire: ''
                    })}>
                        <Plus className="w-4 h-4 mr-1" /> Planifier
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            {donnees?.avertissement && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{donnees.avertissement}</span>
                </div>
            )}

            {trous.length > 0 && (
                <Card className="border-rose-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-rose-800">
                            {trous.length} jour(s) sans aucune couverture
                        </CardTitle>
                        <CardDescription>{trous.slice(0, 12).join(', ')}{trous.length > 12 ? '…' : ''}</CardDescription>
                    </CardHeader>
                </Card>
            )}

            {donnees?.anomalies?.length > 0 && (
                <Card className="border-amber-200">
                    <CardHeader className="pb-3"><CardTitle className="text-base text-amber-900">À regarder</CardTitle></CardHeader>
                    <CardContent className="pt-0">
                        <ul className="text-sm text-amber-900 space-y-1">
                            {donnees.anomalies.map((a, i) => (
                                <li key={`${a.employeeId}-${i}`}>{a.nom} — {a.texte}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                    <strong>Une intervention n'est pas une astreinte.</strong> Être appelé et travailler est du temps de
                    travail effectif : cela relève des heures supplémentaires, avec leurs majorations, en plus de
                    l'indemnité. Les interventions sont comptées ici pour ce qu'elles disent de la charge réelle,
                    pas pour être payées au forfait.
                </span>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Planning du mois</CardTitle>
                    <CardDescription>
                        {donnees?.aPayer > 0 ? `${montant(donnees.aPayer)} à porter sur la paie.` : 'Rien à porter sur la paie.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {lignes.length === 0 && <li className="p-6 text-sm text-slate-500">Aucune astreinte ce mois-ci.</li>}
                        {lignes.map((l) => (
                            <li key={l.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium text-slate-800">{l.nom}</p>
                                    <p className="text-xs text-slate-500">
                                        {jour(l.debut)} → {jour(l.fin)} · {l.type}
                                        {l.site && ` · ${l.site}`}
                                        {l.interventions > 0 && ` · ${l.interventions} intervention(s)`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-slate-800">{montant(l.compensation)}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${TONS[l.statut] || ''}`}>{l.statut}</span>
                                    {l.statut === 'PLANIFIEE' && (
                                        <>
                                            <button onClick={() => constater(l)} title="Constater l'astreinte">
                                                <Check className="w-4 h-4 text-slate-400 hover:text-emerald-600" />
                                            </button>
                                            <button onClick={() => annuler(l)} title="Annuler">
                                                <X className="w-4 h-4 text-slate-400 hover:text-rose-600" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {ajout && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setAjout(null)}>
                    <form onSubmit={planifier} onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Planifier une astreinte</h2>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Salarié</span>
                            <select required value={ajout.employeeId}
                                onChange={(e) => setAjout((a) => ({ ...a, employeeId: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                <option value="">Choisir…</option>
                                {(donnees?.salaries || []).map((s) => (
                                    <option key={s.id} value={s.id}>{s.nom}</option>
                                ))}
                            </select>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Début</span>
                                <input required type="date" value={ajout.debut}
                                    onChange={(e) => setAjout((a) => ({ ...a, debut: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Fin</span>
                                <input required type="date" value={ajout.fin}
                                    onChange={(e) => setAjout((a) => ({ ...a, fin: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Type</span>
                                <select value={ajout.type} onChange={(e) => setAjout((a) => ({ ...a, type: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                    {(donnees?.types || []).map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Compensation</span>
                                <input type="number" min="0" value={ajout.compensation}
                                    placeholder={donnees?.forfaits ? String(donnees.forfaits[ajout.type] ?? '') : 'à saisir'}
                                    onChange={(e) => setAjout((a) => ({ ...a, compensation: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Site</span>
                            <input value={ajout.site} onChange={(e) => setAjout((a) => ({ ...a, site: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setAjout(null)}>Annuler</Button>
                            <Button type="submit">Planifier</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
