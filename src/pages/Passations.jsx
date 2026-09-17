import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ClipboardList, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Suivi des passations d'équipe, pour la direction.
 *
 * Ce qui a été signalé, par agence et par catégorie, et ce qui reste ouvert.
 * L'écran compte et montre ; il ne prétend pas reconnaître qu'un même
 * incident revient — c'est la lecture des éléments qui le dit.
 */

const COULEURS = { INCIDENT: 'bg-rose-100 text-rose-800', CLIENT: 'bg-sky-100 text-sky-800', CONSIGNE: 'bg-slate-100 text-slate-700', MATERIEL: 'bg-amber-100 text-amber-800' };
const dateHeure = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export function Passations() {
    const [jours, setJours] = useState(30);
    const [site, setSite] = useState('');
    const [donnees, setDonnees] = useState(null);
    const [erreur, setErreur] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get(`/passations?jours=${jours}${site ? `&site=${site}` : ''}`);
            setDonnees(res?.data && Array.isArray(res.data.bilan) ? res.data : null);
        } catch (err) {
            setErreur(err.message || 'Lecture impossible.');
        }
    }, [jours, site]);

    useEffect(() => { charger(); }, [charger]);

    const categories = donnees?.categories || {};

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="w-6 h-6 text-sky-600" /> Passations d'équipe</h1>
                    <p className="text-slate-500 mt-1">Ce que les équipes se transmettent à la relève, depuis leur badge, agence par agence.</p>
                </div>
                <div className="flex gap-2">
                    {site && <button onClick={() => setSite('')} className="text-sm border rounded-lg px-3 py-2 bg-white">Toutes les agences</button>}
                    <select value={jours} onChange={(e) => setJours(Number(e.target.value))} className="rounded-lg border px-3 py-2 bg-white text-sm">
                        {[7, 30, 90].map((j) => <option key={j} value={j}>{j} derniers jours</option>)}
                    </select>
                </div>
            </div>

            {erreur && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{erreur}</div>}

            {donnees && donnees.bilan.length === 0 && (
                <Card><CardContent className="p-6 text-sm text-slate-500">
                    Aucune passation sur la période. Les salariés écrivent la leur depuis leur badge numérique, rubrique « Passation ».
                </CardContent></Card>
            )}

            {donnees && donnees.bilan.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Par agence</CardTitle></CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500 border-b bg-slate-50">
                                    <th className="py-3 px-4">Agence</th><th className="py-3 px-4 text-right">Passations</th>
                                    {Object.entries(categories).map(([code, libelle]) => <th key={code} className="py-3 px-4 text-right">{libelle}</th>)}
                                    <th className="py-3 px-4 text-right">Encore ouverts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donnees.bilan.map((b) => (
                                    <tr key={b.workSiteId} onClick={() => setSite(b.workSiteId)} className="border-b last:border-0 hover:bg-slate-50 cursor-pointer">
                                        <td className="py-3 px-4 font-medium text-slate-800">{b.nom}</td>
                                        <td className="py-3 px-4 text-right tabular-nums">{b.passations}</td>
                                        {Object.keys(categories).map((code) => <td key={code} className="py-3 px-4 text-right tabular-nums">{b.parCategorie[code] || 0}</td>)}
                                        <td className="py-3 px-4 text-right">
                                            {b.ouverts > 0
                                                ? <span className="inline-flex items-center gap-1 text-amber-700 font-semibold"><AlertTriangle className="w-4 h-4" /> {b.ouverts}{b.joursOuvert > 0 ? ` · ${b.joursOuvert} j` : ''}</span>
                                                : <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {donnees?.recentes?.length > 0 && (
                <div className="space-y-3">
                    <h2 className="font-semibold text-slate-800">Passations récentes{site ? ` — ${donnees.recentes[0]?.site || ''}` : ''}</h2>
                    {donnees.recentes.map((p) => (
                        <Card key={p.id}>
                            <CardContent className="p-4">
                                <p className="text-xs text-slate-500 mb-2">{p.site} · {p.auteur} · {dateHeure(p.creeLe)} · lue par {p.acquittements} personne{p.acquittements > 1 ? 's' : ''}</p>
                                <ul className="space-y-1.5">
                                    {p.elements.map((e) => (
                                        <li key={e.id} className={`text-sm flex items-start gap-2 ${e.resoluLe ? 'text-slate-400' : 'text-slate-800'}`}>
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${COULEURS[e.categorie]}`}>{e.categorieLibelle}</span>
                                            <span className={e.resoluLe ? 'line-through' : ''}>{e.texte}</span>
                                            {e.resoluLe && <span className="text-xs text-emerald-700 shrink-0">réglé par {e.resoluPar}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
