import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Banknote, Download, Send, Ban, AlertTriangle, Info } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

/**
 * Lots de virement.
 *
 * Rien ne produisait d'ordre de paiement, et aucun bulletin n'était jamais
 * marqué payé. C'est ici — et seulement ici — que le statut « payé » se pose,
 * et qu'il se retire si le lot est annulé.
 */

const ETATS = {
    PREPARE: { libelle: 'Préparé', classe: 'bg-sky-50 text-sky-700 border-sky-200' },
    EMIS: { libelle: 'Émis', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ANNULE: { libelle: 'Annulé', classe: 'bg-slate-100 text-slate-500 border-slate-200' }
};

const montant = (n) => new Intl.NumberFormat('fr-CI').format(Math.round(n || 0)) + ' FCFA';
const dateHeure = (d) => (d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const moisCourant = () => new Date().toISOString().slice(0, 7);

export function Virements() {
    const [periode, setPeriode] = useState(moisCourant());
    const [preparation, setPreparation] = useState(null);
    const [lots, setLots] = useState([]);
    const [formats, setFormats] = useState([]);
    const [formatId, setFormatId] = useState('');
    const [message, setMessage] = useState(null);
    const [enCours, setEnCours] = useState(false);

    const charger = useCallback(async () => {
        try {
            const [resLots, resFormats] = await Promise.all([api.get('/virements'), api.get('/virements/formats')]);
            setLots(listeSure(resLots?.data, 'lots'));
            setFormats(Array.isArray(resFormats?.data?.formats) ? resFormats.data.formats : []);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    const preparer = useCallback(async () => {
        try {
            const res = await api.get(`/virements/preparation?periode=${periode}`);
            setPreparation(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setPreparation(null);
            setMessage({ ton: 'alerte', texte: err.message || 'Préparation impossible.' });
        }
    }, [periode]);

    useEffect(() => { charger(); }, [charger]);
    useEffect(() => { preparer(); }, [preparer]);

    const creer = async () => {
        setEnCours(true);
        try {
            const res = await api.post('/virements', { periode, formatId: formatId || null });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Lot préparé.' });
            charger();
            preparer();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Création impossible.' });
        } finally {
            setEnCours(false);
        }
    };

    const telecharger = async (lot) => {
        try {
            const res = await fetch(`${API_URL}/api/virements/${lot.id}/fichier`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) {
                const url = window.URL.createObjectURL(await res.blob());
                const lien = document.createElement('a');
                lien.href = url;
                lien.setAttribute('download', `virements-${lot.periode}.txt`);
                document.body.appendChild(lien);
                lien.click();
                lien.remove();
                window.URL.revokeObjectURL(url);
                setMessage({ ton: 'ok', texte: 'Fichier produit. Vérifiez-le avant de le remettre à la banque.' });
                charger();
            } else {
                const detail = await res.json().catch(() => ({}));
                setMessage({ ton: 'alerte', texte: detail.error || `Téléchargement refusé (HTTP ${res.status}).` });
            }
        } catch {
            setMessage({ ton: 'alerte', texte: 'Service injoignable.' });
        }
    };

    const emettre = async (lot) => {
        if (!window.confirm(`Marquer le lot de ${lot.periode} comme émis ? ${lot.nombreLignes} bulletin(s) passeront au statut « payé ».`)) return;
        try {
            const res = await api.post(`/virements/${lot.id}/emettre`, {});
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Lot émis.' });
            charger();
            preparer();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Émission impossible.' });
        }
    };

    const annuler = async (lot) => {
        const motif = window.prompt('Motif de l\'annulation (il reste au dossier)');
        if (!motif) return;
        try {
            const res = await api.post(`/virements/${lot.id}/annuler`, { motif });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Lot annulé.' });
            charger();
            preparer();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Annulation impossible.' });
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Banknote className="w-6 h-6 text-emerald-600" /> Virements des salaires</h1>
                <p className="text-slate-500 mt-1">
                    Produit l'ordre de paiement à partir des bulletins approuvés du mois, au format attendu par votre banque.
                </p>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            {formats.length === 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        Aucun format bancaire n'est décrit : le fichier sortira au format CSV générique.
                        Demandez sa spécification à votre banque — colonnes, ordre, séparateur, largeurs —
                        et faites-la saisir ; le programme n'a pas à changer pour cela.
                    </span>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Préparer un lot</CardTitle>
                    <CardDescription>Seuls les bulletins approuvés, non encore payés, et dont le salarié a des coordonnées bancaires.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Période</span>
                            <input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)}
                                className="mt-1 rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Format</span>
                            <select value={formatId} onChange={(e) => setFormatId(e.target.value)}
                                className="mt-1 rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                <option value="">CSV générique</option>
                                {formats.filter((f) => f.actif).map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                            </select>
                        </label>
                        <Button onClick={creer} disabled={enCours || !preparation || preparation.lignes.length === 0}>
                            {enCours ? 'Préparation…' : 'Préparer le lot'}
                        </Button>
                    </div>

                    {preparation && (
                        <>
                            <p className="text-sm text-slate-700">
                                <strong>{preparation.totaux.lignes}</strong> virement(s) pour <strong>{montant(preparation.totaux.montant)}</strong>.
                            </p>
                            {preparation.ecartes.length > 0 && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                    <p className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {preparation.ecartes.length} salarié(s) écarté(s)</p>
                                    <ul className="mt-1 space-y-0.5">
                                        {preparation.ecartes.slice(0, 8).map((e, i) => <li key={i}>{e.nom} — {e.motif}</li>)}
                                    </ul>
                                </div>
                            )}
                            {preparation.comptesPartages.length > 0 && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                    <p className="font-semibold">Comptes partagés</p>
                                    <ul className="mt-1 space-y-0.5">
                                        {preparation.comptesPartages.map((c) => <li key={c.compte}>{c.noms.join(', ')} — même compte</li>)}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Lots</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {lots.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">Aucun lot produit à ce jour.</p>
                    ) : (
                        <ul className="divide-y">
                            {lots.map((lot) => {
                                const etat = ETATS[lot.statut] || ETATS.ANNULE;
                                return (
                                    <li key={lot.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {lot.periode} · {lot.nombreLignes} virement(s) · {montant(lot.montantTotal)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {lot.format} · préparé le {dateHeure(lot.creeLe)}{lot.creePar ? ` par ${lot.creePar}` : ''}
                                                {lot.emisLe && ` · émis le ${dateHeure(lot.emisLe)}`}
                                                {lot.annuleLe && ` · annulé : ${lot.annuleMotif}`}
                                            </p>
                                            {lot.empreinte && <p className="text-[11px] font-mono text-slate-400 break-all">empreinte {lot.empreinte.slice(0, 32)}…</p>}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full border ${etat.classe}`}>{etat.libelle}</span>
                                            {lot.statut !== 'ANNULE' && (
                                                <Button variant="outline" size="sm" onClick={() => telecharger(lot)}><Download className="w-4 h-4 mr-1" /> Fichier</Button>
                                            )}
                                            {lot.statut === 'PREPARE' && (
                                                <Button size="sm" onClick={() => emettre(lot)}><Send className="w-4 h-4 mr-1" /> Marquer émis</Button>
                                            )}
                                            {lot.statut !== 'ANNULE' && (
                                                <Button variant="outline" size="sm" onClick={() => annuler(lot)}><Ban className="w-4 h-4 text-rose-600" /></Button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
