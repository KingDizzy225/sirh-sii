import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plane, Info, Plus, Check, X } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Ordres de mission.
 *
 * Les notes de frais remboursaient après coup ; ce qui manquait est
 * l'autorisation écrite de partir, et le forfait de séjour. L'écran montre
 * d'abord ce qui attend une décision, puis ce qui reste à solder — les deux
 * choses qui coûtent quand on les oublie.
 */

const montant = (n) => (n == null ? '—' : new Intl.NumberFormat('fr-CI').format(Math.round(n)) + ' F');
const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');

const TONS = {
    DEMANDEE: 'bg-amber-100 text-amber-800',
    AUTORISEE: 'bg-sky-100 text-sky-800',
    EFFECTUEE: 'bg-indigo-100 text-indigo-800',
    SOLDEE: 'bg-emerald-100 text-emerald-800',
    REFUSEE: 'bg-rose-100 text-rose-800',
    ANNULEE: 'bg-slate-100 text-slate-500'
};

export function Missions() {
    const [donnees, setDonnees] = useState(null);
    const [message, setMessage] = useState(null);
    const [ajout, setAjout] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/missions');
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const demander = async (evenement) => {
        evenement.preventDefault();
        try {
            const res = await api.post('/missions', {
                employeeId: ajout.employeeId, objet: ajout.objet, destination: ajout.destination,
                zone: ajout.zone, debut: ajout.debut, fin: ajout.fin,
                perDiemJour: ajout.perDiemJour, avance: ajout.avance, moyenTransport: ajout.moyenTransport
            });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Mission demandée.' });
            setAjout(null);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Demande impossible.' });
        }
    };

    const decider = async (ligne, accord) => {
        const motif = accord ? null : window.prompt('Motif du refus');
        if (!accord && !motif) return;
        try {
            const res = await api.post(`/missions/${ligne.id}/decider`, { accord, motif });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Décision enregistrée.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Décision impossible.' });
        }
    };

    const cloturer = async (ligne, solde) => {
        try {
            const res = await api.post(`/missions/${ligne.id}/cloturer`, { solde });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Mission clôturée.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Clôture impossible.' });
        }
    };

    const lignes = donnees?.lignes || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Plane className="w-6 h-6 text-orange-600" /> Ordres de mission
                    </h1>
                    <p className="text-slate-500 mt-1">Qui part, qui l'a autorisé, et ce qui est dû au forfait.</p>
                </div>
                <Button onClick={() => setAjout({
                    employeeId: '', objet: '', destination: '', zone: 'INTERIEUR',
                    debut: '', fin: '', perDiemJour: '', avance: '', moyenTransport: ''
                })}>
                    <Plus className="w-4 h-4 mr-1" /> Demander une mission
                </Button>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            {donnees?.avertissement && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {donnees.avertissement}
                </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                    <strong>Le per diem n'est pas un remboursement.</strong> Il couvre le séjour au forfait ;
                    les frais réels justifiés — transport, hôtel facturé — restent des notes de frais.
                    Les confondre revient à payer deux fois la même nuit.
                </span>
            </div>

            {donnees?.avanceNonSoldee > 0 && (
                <Card className="border-amber-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-amber-900">
                            {montant(donnees.avanceNonSoldee)} d'avances non soldées
                        </CardTitle>
                        <CardDescription>
                            Missions effectuées dont l'avance n'a pas été régularisée : de l'argent sorti que
                            personne ne réclame.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Missions</CardTitle>
                    <CardDescription>
                        {donnees?.enAttente > 0 ? `${donnees.enAttente} en attente de décision.` : 'Aucune décision en attente.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {lignes.length === 0 && <li className="p-6 text-sm text-slate-500">Aucune mission enregistrée.</li>}
                        {lignes.map((l) => (
                            <li key={l.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium text-slate-800">{l.nom} — {l.destination}</p>
                                    <p className="text-xs text-slate-500">
                                        {l.objet} · {date(l.debut)} → {date(l.fin)} · {l.jours} jour(s) · {l.zone}
                                        {l.autorisePar && ` · autorisée par ${l.autorisePar}`}
                                        {l.motifRefus && ` · refusée : ${l.motifRefus}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-800">{montant(l.montantPrevu)}</p>
                                        {l.avance > 0 && <p className="text-xs text-slate-500">avance {montant(l.avance)}</p>}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${TONS[l.statut] || ''}`}>{l.statut}</span>
                                    {l.statut === 'DEMANDEE' && (
                                        <>
                                            <button onClick={() => decider(l, true)} title="Autoriser">
                                                <Check className="w-4 h-4 text-slate-400 hover:text-emerald-600" />
                                            </button>
                                            <button onClick={() => decider(l, false)} title="Refuser">
                                                <X className="w-4 h-4 text-slate-400 hover:text-rose-600" />
                                            </button>
                                        </>
                                    )}
                                    {l.statut === 'AUTORISEE' && (
                                        <Button size="sm" variant="outline" onClick={() => cloturer(l, false)}>Constater</Button>
                                    )}
                                    {l.statut === 'EFFECTUEE' && (
                                        <Button size="sm" onClick={() => cloturer(l, true)}>Solder</Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {ajout && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setAjout(null)}>
                    <form onSubmit={demander} onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl max-h-[90vh] overflow-auto">
                        <h2 className="text-lg font-bold text-slate-900">Demander une mission</h2>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Salarié</span>
                            <select required value={ajout.employeeId}
                                onChange={(e) => setAjout((a) => ({ ...a, employeeId: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                <option value="">Choisir…</option>
                                {(donnees?.salaries || []).map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Objet</span>
                            <input required value={ajout.objet} placeholder="Installation du site de Bouaké"
                                onChange={(e) => setAjout((a) => ({ ...a, objet: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Destination</span>
                                <input required value={ajout.destination}
                                    onChange={(e) => setAjout((a) => ({ ...a, destination: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Zone</span>
                                <select value={ajout.zone} onChange={(e) => setAjout((a) => ({ ...a, zone: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                    {(donnees?.zones || []).map((z) => <option key={z} value={z}>{z}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Départ</span>
                                <input required type="date" value={ajout.debut}
                                    onChange={(e) => setAjout((a) => ({ ...a, debut: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Retour</span>
                                <input required type="date" value={ajout.fin}
                                    onChange={(e) => setAjout((a) => ({ ...a, fin: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Per diem / jour</span>
                                <input type="number" min="0" value={ajout.perDiemJour}
                                    placeholder={donnees?.forfaits ? String(donnees.forfaits[ajout.zone] ?? '') : 'à saisir'}
                                    onChange={(e) => setAjout((a) => ({ ...a, perDiemJour: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Avance versée</span>
                                <input type="number" min="0" value={ajout.avance}
                                    onChange={(e) => setAjout((a) => ({ ...a, avance: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Moyen de transport</span>
                            <input value={ajout.moyenTransport}
                                onChange={(e) => setAjout((a) => ({ ...a, moyenTransport: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setAjout(null)}>Annuler</Button>
                            <Button type="submit">Demander</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
