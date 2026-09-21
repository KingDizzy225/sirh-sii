import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileSearch, Download, Search, Info } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

/**
 * Droit d'accès : tout ce que la base sait d'une personne, en un fichier.
 *
 * La loi ivoirienne n° 2013-450 ouvre ce droit. Y répondre imposait jusqu'ici
 * de parcourir à la main une quarantaine de tables, avec le risque d'un
 * dossier incomplet — qui vaut refus.
 *
 * L'export est lui-même tracé dans le journal d'audit : savoir qui a extrait
 * le dossier de qui fait partie de ce qu'on doit pouvoir dire.
 */

export function DroitAcces() {
    const [salaries, setSalaries] = useState([]);
    const [filtre, setFiltre] = useState('');
    const [choisi, setChoisi] = useState(null);
    const [message, setMessage] = useState(null);
    const [enCours, setEnCours] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/employees');
            setSalaries(listeSure(res?.data, 'salariés'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture des salariés impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const visibles = useMemo(() => {
        const f = filtre.trim().toLowerCase();
        if (!f) return salaries.slice(0, 12);
        return salaries
            .filter((s) => `${s.firstName} ${s.lastName} ${s.matricule || ''} ${s.department || ''}`.toLowerCase().includes(f))
            .slice(0, 12);
    }, [salaries, filtre]);

    const exporter = async (salarie, format) => {
        setEnCours(`${salarie.id}-${format}`);
        setMessage(null);
        try {
            const res = await fetch(`${API_URL}/api/employees/${salarie.id}/dossier?format=${format}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('sirh_token')}` }
            });
            if (res.ok) {
                const url = window.URL.createObjectURL(await res.blob());
                const lien = document.createElement('a');
                lien.href = url;
                lien.setAttribute('download', `dossier-${salarie.lastName}-${salarie.firstName}.${format}`.toLowerCase());
                document.body.appendChild(lien);
                lien.click();
                lien.remove();
                window.URL.revokeObjectURL(url);
                setMessage({ ton: 'ok', texte: `Dossier de ${salarie.firstName} ${salarie.lastName} exporté. L'extraction est tracée dans le journal d'audit.` });
            } else {
                const detail = await res.json().catch(() => ({}));
                setMessage({ ton: 'alerte', texte: detail.error || `Export refusé (HTTP ${res.status}).` });
            }
        } catch {
            setMessage({ ton: 'alerte', texte: "Service injoignable : le dossier n'a pas été produit." });
        } finally {
            setEnCours(null);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileSearch className="w-6 h-6 text-indigo-600" /> Droit d'accès</h1>
                <p className="text-slate-500 mt-1">
                    Rassemble tout ce que le système détient sur une personne : dossier, contrat, bulletins, congés,
                    pointages, documents, formations, et la liste de ceux qui ont consulté son dossier.
                </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                    Deux formats : le <strong>PDF</strong> se remet à la personne, le <strong>JSON</strong> porte le détail complet.
                    Les fichiers eux-mêmes (bulletins, pièces) ne sont pas incorporés : ils se remettent par lien.
                    Les conclusions du médecin du travail en sont exclues — leur communication relève de lui.
                </span>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Choisir la personne</CardTitle>
                    <CardDescription>Recherche par nom, matricule ou service.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input value={filtre} onChange={(e) => { setFiltre(e.target.value); setChoisi(null); }}
                            placeholder="Nom du salarié" className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2" />
                    </div>

                    <ul className="divide-y">
                        {visibles.length === 0 && <li className="py-3 text-sm text-slate-500">Aucun salarié ne correspond.</li>}
                        {visibles.map((s) => (
                            <li key={s.id} className={`py-3 flex flex-wrap items-center justify-between gap-3 ${choisi === s.id ? 'bg-indigo-50/50' : ''}`}>
                                <div>
                                    <p className="font-medium text-slate-800">{s.firstName} {s.lastName}</p>
                                    <p className="text-xs text-slate-500">
                                        {[s.positionTitle, s.department, s.matricule].filter(Boolean).join(' · ')}
                                        {s.status === 'TERMINATED' && ' · sorti'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => { setChoisi(s.id); exporter(s, 'pdf'); }} disabled={enCours !== null}>
                                        <Download className="w-4 h-4 mr-1" /> {enCours === `${s.id}-pdf` ? 'Export…' : 'PDF'}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => { setChoisi(s.id); exporter(s, 'json'); }} disabled={enCours !== null}>
                                        <Download className="w-4 h-4 mr-1" /> {enCours === `${s.id}-json` ? 'Export…' : 'JSON'}
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {!filtre && salaries.length > 12 && (
                        <p className="text-xs text-slate-500">12 salariés affichés sur {salaries.length}. Affinez la recherche.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
