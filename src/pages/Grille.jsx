import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Scale, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Grille conventionnelle : les minima opposables, et les salaires qui passent
 * en dessous.
 *
 * Le salaire était un nombre libre : un salarié payé sous le minimum de sa
 * catégorie ne se voyait qu'au contrôle de l'inspection du travail.
 */

const montant = (n) => (n === null || n === undefined ? '—' : new Intl.NumberFormat('fr-CI').format(Math.round(n)) + ' F');

export function Grille() {
    const [donnees, setDonnees] = useState(null);
    const [saisie, setSaisie] = useState({ convention: '', categorie: '', echelon: '', salaireMinimum: '', ordre: '' });
    const [affectation, setAffectation] = useState(null);
    const [message, setMessage] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/grille');
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture de la grille impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const enregistrer = async (evenement) => {
        evenement.preventDefault();
        try {
            const res = await api.post('/grille', { ...saisie, salaireMinimum: Number(saisie.salaireMinimum), ordre: Number(saisie.ordre) || 0 });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Minimum enregistré.' });
            setSaisie((s) => ({ ...s, categorie: '', echelon: '', salaireMinimum: '' }));
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        }
    };

    const retirer = async (ligne) => {
        if (!window.confirm(`Retirer « ${ligne.categorie} ${ligne.echelon} » de la grille en vigueur ?`)) return;
        try {
            const res = await api.post(`/grille/${ligne.id}/retirer`, {});
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Ligne retirée.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Retrait impossible.' });
        }
    };

    const affecter = async (evenement) => {
        evenement.preventDefault();
        try {
            const res = await api.post(`/grille/affecter/${affectation.employeeId}`, {
                categorie: affectation.categorie, echelon: affectation.echelon
            });
            setMessage({ ton: res?.data?.controle?.conforme ? 'ok' : 'alerte', texte: res?.data?.message || 'Catégorie affectée.' });
            setAffectation(null);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Affectation impossible.' });
        }
    };

    const grille = donnees?.grille?.filter((l) => l.actif) || [];
    const lignes = donnees?.lignes || [];
    const aCorriger = lignes.filter((l) => !l.conforme);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Scale className="w-6 h-6 text-indigo-600" /> Grille conventionnelle</h1>
                <p className="text-slate-500 mt-1">
                    Les minima de votre convention, et le contrôle de chaque salaire. Le minimum légal s'applique quand il est plus élevé.
                </p>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    {message.texte}
                </div>
            )}

            {donnees && donnees.smig === null && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <strong>SMIG non déclaré.</strong> Posez <code>SMIG_MENSUEL</code> sur le serveur : sans lui, seuls les salariés
                    dotés d'une catégorie sont contrôlés, et aucun plancher légal ne s'applique aux autres.
                </div>
            )}

            {donnees && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        ['Lignes de grille', donnees.lignesGrille],
                        ['Effectif contrôlé', donnees.effectif],
                        ['Sous le minimum', donnees.sousMinimum],
                        ['Sans catégorie', donnees.sansCategorie]
                    ].map(([libelle, valeur]) => (
                        <Card key={libelle}><CardContent className="p-4">
                            <p className={`text-2xl font-bold tabular-nums ${libelle === 'Sous le minimum' && valeur > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{valeur}</p>
                            <p className="text-xs text-slate-500">{libelle}</p>
                        </CardContent></Card>
                    ))}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Ajouter un minimum</CardTitle>
                    <CardDescription>Une ligne par catégorie et par échelon. Saisir à nouveau la même met le montant à jour.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={enregistrer} className="grid md:grid-cols-5 gap-3 items-end">
                        {[
                            ['convention', 'Convention', 'Commerce'],
                            ['categorie', 'Catégorie', 'A1'],
                            ['echelon', 'Échelon', '1er'],
                            ['salaireMinimum', 'Minimum mensuel', '120000'],
                            ['ordre', 'Ordre', '10']
                        ].map(([cle, libelle, exemple]) => (
                            <label key={cle} className="block">
                                <span className="text-sm font-medium text-slate-700">{libelle}</span>
                                <input required={['convention', 'categorie', 'salaireMinimum'].includes(cle)}
                                    type={['salaireMinimum', 'ordre'].includes(cle) ? 'number' : 'text'}
                                    value={saisie[cle]} placeholder={exemple}
                                    onChange={(e) => setSaisie((s) => ({ ...s, [cle]: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        ))}
                        <div className="md:col-span-5"><Button type="submit">Enregistrer</Button></div>
                    </form>

                    {grille.length > 0 && (
                        <div className="overflow-x-auto mt-5">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500 border-b">
                                        <th className="py-2 pr-4">Convention</th><th className="py-2 pr-4">Catégorie</th>
                                        <th className="py-2 pr-4">Échelon</th><th className="py-2 pr-4 text-right">Minimum</th><th className="py-2" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {grille.map((l) => (
                                        <tr key={l.id} className="border-b last:border-0">
                                            <td className="py-2 pr-4">{l.convention}</td>
                                            <td className="py-2 pr-4 font-medium text-slate-800">{l.categorie}</td>
                                            <td className="py-2 pr-4">{l.echelon}</td>
                                            <td className="py-2 pr-4 text-right tabular-nums">{montant(l.salaireMinimum)}</td>
                                            <td className="py-2 text-right">
                                                <button onClick={() => retirer(l)} title="Retirer de la grille en vigueur"><Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-600" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Salaires contrôlés</CardTitle>
                    <CardDescription>
                        {aCorriger.length > 0
                            ? `${aCorriger.length} salaire(s) sous le minimum applicable.`
                            : 'Aucun salaire sous le minimum applicable.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b bg-slate-50">
                                <th className="py-3 px-4">Salarié</th><th className="py-3 px-4">Catégorie</th>
                                <th className="py-3 px-4 text-right">Salaire</th><th className="py-3 px-4 text-right">Minimum</th>
                                <th className="py-3 px-4 text-right">Écart</th><th className="py-3 px-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {[...lignes].sort((a, b) => (a.conforme === b.conforme ? 0 : a.conforme ? 1 : -1)).map((l) => (
                                <tr key={l.employeeId} className={`border-b last:border-0 ${!l.conforme ? 'bg-rose-50/40' : ''}`}>
                                    <td className="py-2 px-4">
                                        <p className="font-medium text-slate-800">{l.nom}</p>
                                        <p className="text-xs text-slate-500">{[l.fonction, l.typeContrat].filter(Boolean).join(' · ')}</p>
                                    </td>
                                    <td className="py-2 px-4">{l.categorie ? `${l.categorie}${l.echelon ? ` · ${l.echelon}` : ''}` : <span className="text-amber-700">à définir</span>}</td>
                                    <td className="py-2 px-4 text-right tabular-nums">{montant(l.salaire)}</td>
                                    <td className="py-2 px-4 text-right tabular-nums">{montant(l.minimum)}<span className="block text-[11px] text-slate-400">{l.origine === 'SMIG' ? 'légal' : l.origine === 'CONVENTION' ? 'convention' : '—'}</span></td>
                                    <td className={`py-2 px-4 text-right tabular-nums ${l.conforme ? 'text-slate-600' : 'text-rose-700 font-semibold'}`}>
                                        {l.ecart === null ? '—' : montant(l.ecart)}
                                    </td>
                                    <td className="py-2 px-4 text-right whitespace-nowrap">
                                        {l.conforme
                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" aria-label="Conforme" />
                                            : <AlertTriangle className="w-4 h-4 text-rose-600 inline" aria-label="Sous le minimum" />}
                                        <Button variant="outline" size="sm" className="ml-2"
                                            onClick={() => setAffectation({ employeeId: l.employeeId, nom: l.nom, categorie: l.categorie || '', echelon: l.echelon || '' })}>
                                            Catégorie
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {affectation && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setAffectation(null)}>
                    <form onSubmit={affecter} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Catégorie de {affectation.nom}</h2>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Catégorie</span>
                            <select value={affectation.categorie} onChange={(e) => setAffectation((a) => ({ ...a, categorie: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                <option value="">Aucune</option>
                                {[...new Set(grille.map((l) => l.categorie))].map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Échelon</span>
                            <select value={affectation.echelon} onChange={(e) => setAffectation((a) => ({ ...a, echelon: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                <option value="">—</option>
                                {grille.filter((l) => l.categorie === affectation.categorie).map((l) => <option key={l.id} value={l.echelon}>{l.echelon}</option>)}
                            </select>
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setAffectation(null)}>Annuler</Button>
                            <Button type="submit">Affecter</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
