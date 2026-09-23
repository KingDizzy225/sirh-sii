import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { HandCoins, AlertTriangle, Info } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Indemnités journalières de la CNPS.
 *
 * L'entreprise avançait le salaire pendant les congés de maternité et les
 * arrêts pour accident du travail, et ne réclamait jamais rien. Ce qui compte
 * ici, ce sont les arrêts sans créance ouverte : c'est de l'argent sorti dont
 * personne ne tenait le compte.
 */

const montant = (n) => (n == null ? '—' : new Intl.NumberFormat('fr-CI').format(Math.round(n)) + ' F');
const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');

const TONS = {
    A_RECLAMER: 'bg-amber-100 text-amber-800',
    RECLAMEE: 'bg-sky-100 text-sky-800',
    REMBOURSEE: 'bg-emerald-100 text-emerald-800',
    ABANDONNEE: 'bg-slate-100 text-slate-500'
};

export function IndemnitesJournalieres() {
    const [donnees, setDonnees] = useState(null);
    const [message, setMessage] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/indemnites-journalieres');
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const ouvrir = async (candidat) => {
        try {
            const res = await api.post('/indemnites-journalieres', {
                type: candidat.type, origineId: candidat.origineId, employeeId: candidat.employeeId,
                debut: candidat.debut, fin: candidat.fin, jours: candidat.jours
            });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Créance ouverte.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Ouverture impossible.' });
        }
    };

    const reclamer = async (ligne) => {
        const saisi = window.prompt('Montant réclamé à la CNPS', String(Math.round(ligne.montantEstime || 0)));
        if (saisi === null) return;
        const reference = window.prompt('Référence du dépôt (facultative)', '') || null;
        try {
            const res = await api.post(`/indemnites-journalieres/${ligne.id}/reclamer`, {
                montantReclame: Number(saisi), reference
            });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Demande enregistrée.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        }
    };

    const encaisser = async (ligne) => {
        const saisi = window.prompt('Montant effectivement remboursé', String(Math.round(ligne.montantReclame || 0)));
        if (saisi === null) return;
        try {
            const res = await api.post(`/indemnites-journalieres/${ligne.id}/encaisser`, {
                montantRembourse: Number(saisi)
            });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Remboursement enregistré.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        }
    };

    const lignes = donnees?.lignes || [];
    const candidats = donnees?.candidats || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <HandCoins className="w-6 h-6 text-orange-600" /> Indemnités journalières CNPS
                </h1>
                <p className="text-slate-500 mt-1">Ce que l'entreprise a avancé, et ce qu'elle doit récupérer.</p>
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

            {donnees && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Estimé, non réclamé</p>
                        <p className="text-2xl font-bold text-slate-900">{montant(donnees.totalEstime)}</p>
                        <p className="text-xs text-slate-500">une estimation n'est pas une créance</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Réclamé</p>
                        <p className="text-2xl font-bold text-slate-900">{montant(donnees.totalReclame)}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Encaissé</p>
                        <p className="text-2xl font-bold text-emerald-700">{montant(donnees.totalRembourse)}</p>
                    </CardContent></Card>
                </div>
            )}

            {candidats.length > 0 && (
                <Card className="border-amber-200">
                    <CardHeader>
                        <CardTitle className="text-base text-amber-900">
                            {candidats.length} arrêt(s) sans créance ouverte
                        </CardTitle>
                        <CardDescription>
                            Congés de maternité et arrêts pour accident du travail que personne n'a réclamés.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {candidats.map((c) => (
                                <li key={c.origineId} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-slate-800">{c.nom}</p>
                                        <p className="text-xs text-slate-500">
                                            {c.type === 'MATERNITE' ? 'Maternité' : 'Accident du travail'} ·
                                            {' '}{date(c.debut)} → {date(c.fin)} · {c.jours} jour(s)
                                            {c.declareCnps === false && ' · non déclaré à la CNPS'}
                                        </p>
                                    </div>
                                    {c.forclos
                                        ? <span className="text-xs text-rose-700">
                                            Délai de dépôt dépassé ({c.joursDepuisLaFin} jours)
                                          </span>
                                        : <Button size="sm" onClick={() => ouvrir(c)}>Ouvrir la créance</Button>}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                    L'application ne calcule pas le droit : le taux, les plafonds et la durée indemnisable
                    relèvent du régime CNPS et changent. Elle rapproche ce qui a été avancé de ce qui reste à
                    réclamer, et distingue toujours <strong>l'estimation</strong>, <strong>la demande</strong> et
                    <strong> l'encaissement</strong> — trois montants qui ne s'additionnent pas.
                </span>
            </div>

            <Card>
                <CardHeader><CardTitle>Créances suivies</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {lignes.length === 0 && <li className="p-6 text-sm text-slate-500">Aucune créance ouverte.</li>}
                        {lignes.map((l) => (
                            <li key={l.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium text-slate-800">{l.nom}</p>
                                    <p className="text-xs text-slate-500">
                                        {l.type === 'MATERNITE' ? 'Maternité' : 'Accident du travail'} ·
                                        {' '}{date(l.debut)} → {date(l.fin)} · {l.jours} jour(s)
                                        {l.reference && ` · réf. ${l.reference}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right text-xs text-slate-500">
                                        {l.montantEstime != null && <p>estimé {montant(l.montantEstime)}</p>}
                                        {l.montantReclame != null && <p>réclamé {montant(l.montantReclame)}</p>}
                                        {l.montantRembourse != null && (
                                            <p className="text-emerald-700 font-semibold">reçu {montant(l.montantRembourse)}</p>
                                        )}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${TONS[l.statut] || ''}`}>{l.statut}</span>
                                    {l.statut === 'A_RECLAMER' && (
                                        <Button size="sm" variant="outline" onClick={() => reclamer(l)}>Déposer</Button>
                                    )}
                                    {l.statut === 'RECLAMEE' && (
                                        <Button size="sm" onClick={() => encaisser(l)}>Encaisser</Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
