import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { History, Info, Search, X } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Rappels de salaire.
 *
 * L'écart des mois écoulés se saisissait à la main dans le champ « prime » :
 * un montant sans période et sans détail. Ici, le calcul est montré avant
 * d'être enregistré — la simulation précède toujours la décision.
 */

const montant = (n) => new Intl.NumberFormat('fr-CI').format(Math.round(n || 0)) + ' F';
const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');

const LIBELLES = { A_VERSER: 'À verser', VERSE: 'Versé', ANNULE: 'Annulé' };
const TONS = {
    A_VERSER: 'bg-amber-100 text-amber-800',
    VERSE: 'bg-emerald-100 text-emerald-800',
    ANNULE: 'bg-slate-100 text-slate-500'
};

export function Rappels() {
    const [donnees, setDonnees] = useState(null);
    const [salaries, setSalaries] = useState([]);
    const [message, setMessage] = useState(null);
    const [formulaire, setFormulaire] = useState(null);
    const [simulation, setSimulation] = useState(null);
    const [occupe, setOccupe] = useState(false);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/rappels');
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : { lignes: [] });
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    const chargerSalaries = useCallback(async () => {
        try {
            const res = await api.get('/employees');
            setSalaries(Array.isArray(res?.data) ? res.data : []);
        } catch {
            setSalaries([]);
        }
    }, []);

    useEffect(() => { charger(); chargerSalaries(); }, [charger, chargerSalaries]);

    const simuler = async () => {
        if (!formulaire?.employeeId || !formulaire?.dateEffet) return;
        setOccupe(true);
        setSimulation(null);
        try {
            const res = await api.get(
                `/rappels/simulation/${formulaire.employeeId}?dateEffet=${encodeURIComponent(formulaire.dateEffet)}`
            );
            setSimulation(res?.data || null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Simulation impossible.' });
        } finally {
            setOccupe(false);
        }
    };

    const enregistrer = async () => {
        setOccupe(true);
        try {
            const res = await api.post(`/rappels/${formulaire.employeeId}`, {
                motif: formulaire.motif,
                dateEffet: formulaire.dateEffet
            });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Rappel établi.' });
            setFormulaire(null);
            setSimulation(null);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        } finally {
            setOccupe(false);
        }
    };

    const annuler = async (ligne) => {
        try {
            const res = await api.post(`/rappels/${ligne.id}/annuler`, {});
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Rappel annulé.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Annulation impossible.' });
        }
    };

    const lignes = donnees?.lignes || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <History className="w-6 h-6 text-orange-600" /> Rappels de salaire
                    </h1>
                    <p className="text-slate-500 mt-1">Ce qui était dû et n'a pas été versé, mois par mois.</p>
                </div>
                <Button onClick={() => { setFormulaire({ employeeId: '', dateEffet: '', motif: '' }); setSimulation(null); }}>
                    Établir un rappel
                </Button>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                    Le rappel est calculé en refaisant le brut de chaque mois avec le salaire qui aurait dû
                    s'appliquer — heures supplémentaires et prime d'ancienneté comprises, puisqu'elles en dépendent.
                    Il entre dans le brut du mois où il est versé et y est cotisé au taux de ce mois-là.
                    <strong> Si votre cabinet impose un rattachement aux mois d'origine</strong>, le montant reste juste
                    mais sa ventilation fiscale devra être revue.
                </span>
            </div>

            {donnees && lignes.some((l) => l.statut === 'A_VERSER') && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">En attente de versement</CardTitle>
                        <CardDescription>
                            {donnees.aVerser} rappel(s), {montant(donnees.montantAVerser)} au total. Ils partiront
                            automatiquement sur la prochaine paie du salarié concerné.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {lignes.length === 0 && <li className="p-6 text-sm text-slate-500">Aucun rappel établi.</li>}
                        {lignes.map((l) => (
                            <li key={l.id} className="p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-slate-800">{l.nom}</p>
                                        <p className="text-xs text-slate-500">
                                            {l.motif} · du {date(l.periodeDebut)} au {date(l.periodeFin)}
                                            {l.verseLe && ` · versé le ${date(l.verseLe)}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-slate-800">{montant(l.total)}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${TONS[l.statut] || ''}`}>
                                            {LIBELLES[l.statut] || l.statut}
                                        </span>
                                        {l.statut === 'A_VERSER' && (
                                            <button onClick={() => annuler(l)} title="Annuler ce rappel">
                                                <X className="w-4 h-4 text-slate-400 hover:text-rose-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {Array.isArray(l.lignes) && l.lignes.length > 0 && (
                                    <ul className="mt-2 text-xs text-slate-600 space-y-0.5">
                                        {l.lignes.map((d) => (
                                            <li key={d.periode}>
                                                {d.periode} : {montant(d.baseVersee)} versé, {montant(d.baseDue)} dû
                                                — écart {montant(d.ecart)}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {formulaire && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
                    onClick={() => { setFormulaire(null); setSimulation(null); }}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Établir un rappel</h2>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Salarié</span>
                            <select value={formulaire.employeeId}
                                onChange={(e) => { setFormulaire((f) => ({ ...f, employeeId: e.target.value })); setSimulation(null); }}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                <option value="">Choisir…</option>
                                {salaries.map((s) => (
                                    <option key={s.id} value={s.id}>{s.lastName} {s.firstName}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Date d'effet de la décision</span>
                            <input type="date" value={formulaire.dateEffet}
                                onChange={(e) => { setFormulaire((f) => ({ ...f, dateEffet: e.target.value })); setSimulation(null); }}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Motif</span>
                            <input value={formulaire.motif} placeholder="Augmentation signée le 12 juin, effet au 1er mars"
                                onChange={(e) => setFormulaire((f) => ({ ...f, motif: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>

                        <Button variant="outline" onClick={simuler} disabled={occupe || !formulaire.employeeId || !formulaire.dateEffet}>
                            <Search className="w-4 h-4 mr-1" /> Calculer sans enregistrer
                        </Button>

                        {simulation && (
                            <div className="rounded-lg border border-slate-200 p-3 text-sm space-y-2 max-h-64 overflow-auto">
                                <p className="font-medium text-slate-800">Total : {montant(simulation.total)}</p>
                                {simulation.lignes.length === 0 && (
                                    <p className="text-slate-500">Aucun écart à rattraper sur cette période.</p>
                                )}
                                <ul className="space-y-0.5 text-xs text-slate-600">
                                    {simulation.lignes.map((d) => (
                                        <li key={d.periode}>
                                            {d.periode} : brut {montant(d.brutVerse)} → {montant(d.brutDu)} (+{montant(d.ecart)})
                                        </li>
                                    ))}
                                </ul>
                                {simulation.manques?.length > 0 && (
                                    <div className="text-xs text-amber-700 border-t pt-2">
                                        {simulation.manques.map((m) => (
                                            <p key={m.periode}>{m.periode} : {m.motif}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => { setFormulaire(null); setSimulation(null); }}>
                                Annuler
                            </Button>
                            <Button onClick={enregistrer} disabled={occupe || !simulation || simulation.total <= 0}>
                                Établir le rappel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
