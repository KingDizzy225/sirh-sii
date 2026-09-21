import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Gift, Bus, Info, Search, Plus, Square } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Prime de transport et avantages en nature.
 *
 * Deux natures d'élément que le bulletin confondait avec une prime ordinaire :
 * la première est exonérée jusqu'à un plafond, la seconde entre dans l'assiette
 * sans être versée en argent.
 */

const montant = (n) => new Intl.NumberFormat('fr-CI').format(Math.round(n || 0)) + ' F';
const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');

export function Avantages() {
    const [donnees, setDonnees] = useState(null);
    const [filtre, setFiltre] = useState('');
    const [ajout, setAjout] = useState(null);
    const [message, setMessage] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/avantages');
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const definirTransport = async (ligne) => {
        const saisi = window.prompt(`Prime de transport mensuelle de ${ligne.nom}`, String(ligne.primeTransport || 0));
        if (saisi === null) return;
        try {
            const res = await api.post(`/avantages/transport/${ligne.employeeId}`, { montant: Number(saisi) });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Prime enregistrée.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        }
    };

    const ajouter = async (evenement) => {
        evenement.preventDefault();
        try {
            const res = await api.post(`/avantages/${ajout.employeeId}`, {
                type: ajout.type, montantMensuel: Number(ajout.montantMensuel), debut: ajout.debut, fin: ajout.fin || null, note: ajout.note
            });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Avantage enregistré.' });
            setAjout(null);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Ajout impossible.' });
        }
    };

    const terminer = async (avantage) => {
        const fin = window.prompt('Date de fin (AAAA-MM-JJ)', new Date().toISOString().slice(0, 10));
        if (!fin) return;
        try {
            const res = await api.post(`/avantages/${avantage.id}/terminer`, { fin });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Avantage clos.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Clôture impossible.' });
        }
    };

    const lignes = donnees?.lignes || [];
    const visibles = useMemo(() => {
        const f = filtre.trim().toLowerCase();
        const avecQuelqueChose = lignes.filter((l) => l.primeTransport > 0 || l.avantages.length > 0);
        if (f) return lignes.filter((l) => l.nom.toLowerCase().includes(f));
        return avecQuelqueChose.length > 0 ? avecQuelqueChose : lignes.slice(0, 10);
    }, [lignes, filtre]);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Gift className="w-6 h-6 text-orange-600" /> Transport et avantages en nature</h1>
                <p className="text-slate-500 mt-1">Ce qui s'ajoute au salaire sans être une prime ordinaire, et qui ne se traite pas comme elle.</p>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            {donnees && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        La prime de transport est exonérée jusqu'à <strong>{montant(donnees.plafondTransportExonere)}</strong> par mois
                        (<code>TRANSPORT_PLAFOND_EXONERE</code>) ; l'excédent entre dans l'assiette. Les avantages en nature y entrent
                        entièrement, puis se retranchent du net à payer — le salarié les reçoit en nature.
                        <strong> Faites confirmer le plafond et les valeurs par votre cabinet</strong> : l'application n'en invente aucune.
                    </span>
                </div>
            )}

            <div className="relative max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="Rechercher un salarié"
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Salariés</CardTitle>
                    <CardDescription>
                        {filtre ? 'Résultats de la recherche.' : 'Salariés ayant une prime de transport ou un avantage en nature.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {visibles.length === 0 && <li className="p-6 text-sm text-slate-500">Aucun salarié à afficher.</li>}
                        {visibles.map((l) => (
                            <li key={l.employeeId} className="p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-slate-800">{l.nom}</p>
                                        <p className="text-xs text-slate-500">{l.fonction}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm text-slate-700 flex items-center gap-1">
                                            <Bus className="w-4 h-4 text-orange-500" /> {montant(l.primeTransport)}
                                        </span>
                                        <Button variant="outline" size="sm" onClick={() => definirTransport(l)}>Transport</Button>
                                        <Button size="sm" onClick={() => setAjout({ employeeId: l.employeeId, nom: l.nom, type: 'LOGEMENT', montantMensuel: '', debut: new Date().toISOString().slice(0, 10), fin: '', note: '' })}>
                                            <Plus className="w-4 h-4 mr-1" /> Avantage
                                        </Button>
                                    </div>
                                </div>
                                {l.avantages.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {l.avantages.map((a) => {
                                            const clos = a.fin && new Date(a.fin) < new Date();
                                            return (
                                                <li key={a.id} className={`text-sm flex items-center justify-between gap-2 ${clos ? 'text-slate-400' : 'text-slate-700'}`}>
                                                    <span>
                                                        {donnees.types[a.type] || a.type} · {montant(a.montantMensuel)} · depuis le {date(a.debut)}
                                                        {a.fin && ` jusqu'au ${date(a.fin)}`}
                                                        {a.note && ` — ${a.note}`}
                                                    </span>
                                                    {!a.fin && (
                                                        <button onClick={() => terminer(a)} title="Clore cet avantage" className="shrink-0">
                                                            <Square className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                                                        </button>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                                {l.totalEnCours > 0 && (
                                    <p className="text-xs text-slate-500 mt-1">Total des avantages en cours : {montant(l.totalEnCours)} par mois.</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {ajout && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setAjout(null)}>
                    <form onSubmit={ajouter} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Avantage en nature — {ajout.nom}</h2>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Nature</span>
                            <select value={ajout.type} onChange={(e) => setAjout((a) => ({ ...a, type: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                {Object.entries(donnees?.types || {}).map(([code, libelle]) => <option key={code} value={code}>{libelle}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Valeur mensuelle retenue</span>
                            <input required type="number" min="1" value={ajout.montantMensuel}
                                onChange={(e) => setAjout((a) => ({ ...a, montantMensuel: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Depuis</span>
                                <input required type="date" value={ajout.debut} onChange={(e) => setAjout((a) => ({ ...a, debut: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Jusqu'au (facultatif)</span>
                                <input type="date" value={ajout.fin} onChange={(e) => setAjout((a) => ({ ...a, fin: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Note</span>
                            <input value={ajout.note} onChange={(e) => setAjout((a) => ({ ...a, note: e.target.value }))}
                                placeholder="Villa de fonction, Cocody" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setAjout(null)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
