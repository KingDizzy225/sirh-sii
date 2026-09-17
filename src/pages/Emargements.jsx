import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { QrCode, Download, Lock, ExternalLink, FileSpreadsheet } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

/**
 * Émargement des formations : ouvrir l'écran à projeter, lire la feuille,
 * exporter l'état de justification.
 */

const STATUTS = {
    PRESENT: { libelle: 'Présent', classe: 'bg-emerald-50 text-emerald-700' },
    DEPART_NON_EMARGE: { libelle: 'Départ non émargé', classe: 'bg-amber-50 text-amber-800' },
    ABSENT: { libelle: 'Absent', classe: 'bg-rose-50 text-rose-700' },
    NON_INSCRIT: { libelle: 'Présent non inscrit', classe: 'bg-sky-50 text-sky-700' }
};
const date = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const heure = (d) => (d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—');

export function Emargements() {
    const [sessions, setSessions] = useState([]);
    const [feuille, setFeuille] = useState(null);
    const [message, setMessage] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/emargements');
            setSessions(listeSure(res?.data, 'sessions'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const lireFeuille = async (id) => {
        try {
            const res = await api.get(`/emargements/${id}`);
            setFeuille(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Feuille indisponible.' });
        }
    };

    const ouvrir = async (s) => {
        try {
            const res = await api.post(`/emargements/${s.id}/ouvrir`, {});
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Émargement ouvert.' });
            if (res?.data?.lienEcran) window.open(res.data.lienEcran, '_blank', 'noopener');
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Ouverture impossible.' });
        }
    };

    const fermer = async (s) => {
        try {
            const res = await api.post(`/emargements/${s.id}/fermer`, {});
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Émargement fermé.' });
            charger();
            if (feuille?.session?.id === s.id) lireFeuille(s.id);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Fermeture impossible.' });
        }
    };

    const exporter = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/emargements/${id}/csv`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) {
                const url = window.URL.createObjectURL(await res.blob());
                const lien = document.createElement('a');
                lien.href = url;
                lien.setAttribute('download', `emargement-${id.slice(0, 8)}.csv`);
                document.body.appendChild(lien);
                lien.click();
                lien.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const detail = await res.json().catch(() => ({}));
                setMessage({ ton: 'alerte', texte: detail.error || `Export refusé (HTTP ${res.status}).` });
            }
        } catch {
            setMessage({ ton: 'alerte', texte: "Service injoignable : l'état n'a pas été produit." });
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><QrCode className="w-6 h-6 text-sky-600" /> Émargement des formations</h1>
                <p className="text-slate-500 mt-1">
                    Ouvrez l'émargement et projetez l'écran dans la salle : les participants scannent le QR avec leur badge, à l'arrivée et au départ.
                </p>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>{message.texte}</div>
            )}

            <Card>
                <CardContent className="p-0">
                    {sessions.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">Aucune session de formation dans les deux mois passés ou à venir. Les sessions se créent dans « Formation ».</p>
                    ) : (
                        <ul className="divide-y">
                            {sessions.map((s) => (
                                <li key={s.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-slate-800">{s.titre}</p>
                                        <p className="text-sm text-slate-500">
                                            {date(s.date)} · {s.dureeHeures} h · {s.formateur} · {s.inscrits} inscrit{s.inscrits > 1 ? 's' : ''}
                                            {s.emargement && ` · ${s.emargement.presents} émargé${s.emargement.presents > 1 ? 's' : ''}`}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {s.emargement?.ouverte ? (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => window.open(s.emargement.lienEcran, '_blank', 'noopener')}><ExternalLink className="w-4 h-4 mr-1" /> Écran</Button>
                                                <Button variant="outline" size="sm" onClick={() => fermer(s)}><Lock className="w-4 h-4 mr-1" /> Fermer</Button>
                                            </>
                                        ) : (
                                            <Button size="sm" onClick={() => ouvrir(s)}><QrCode className="w-4 h-4 mr-1" /> {s.emargement ? 'Rouvrir' : "Ouvrir l'émargement"}</Button>
                                        )}
                                        {s.emargement && (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => lireFeuille(s.id)}><FileSpreadsheet className="w-4 h-4 mr-1" /> Feuille</Button>
                                                <Button variant="outline" size="sm" onClick={() => exporter(s.id)}><Download className="w-4 h-4" /></Button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {feuille && (
                <Card>
                    <CardContent className="p-5 space-y-4">
                        <div className="flex flex-wrap justify-between gap-2">
                            <div>
                                <h2 className="font-bold text-slate-900">{feuille.session.titre}</h2>
                                <p className="text-sm text-slate-500">{date(feuille.session.date)} · {feuille.session.dureeHeures} h prévues · {feuille.session.formateur}</p>
                            </div>
                            <p className="text-sm text-slate-600">
                                {feuille.totaux.presents} présent(s) sur {feuille.totaux.inscrits} inscrit(s) · {feuille.totaux.heures} h suivies au total
                            </p>
                        </div>
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{feuille.avertissement}</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500 border-b">
                                        <th className="py-2 pr-4">Participant</th><th className="py-2 pr-4">Matricule</th><th className="py-2 pr-4">Arrivée</th>
                                        <th className="py-2 pr-4">Départ</th><th className="py-2 pr-4 text-right">Heures</th><th className="py-2">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feuille.lignes.map((l) => (
                                        <tr key={l.employeeId} className="border-b last:border-0">
                                            <td className="py-2 pr-4 font-medium text-slate-800">{l.nom}</td>
                                            <td className="py-2 pr-4">{l.matricule || '—'}</td>
                                            <td className="py-2 pr-4">{heure(l.arrivee)}</td>
                                            <td className="py-2 pr-4">{heure(l.depart)}</td>
                                            <td className="py-2 pr-4 text-right tabular-nums">{l.heures ?? '—'}</td>
                                            <td className="py-2"><span className={`text-xs px-2 py-1 rounded-full ${STATUTS[l.statut].classe}`}>{STATUTS[l.statut].libelle}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
