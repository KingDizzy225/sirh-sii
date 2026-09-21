import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Scale, Info, Archive } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Provision pour congés payés — la dette sociale.
 *
 * Les soldes étaient tenus en jours et jamais valorisés : ce que l'entreprise
 * devrait si tout le monde partait demain n'apparaissait nulle part.
 */

const montant = (n) => (n == null ? '—' : new Intl.NumberFormat('fr-CI').format(Math.round(n)) + ' F');
const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');

export function ProvisionConges() {
    const [donnees, setDonnees] = useState(null);
    const [message, setMessage] = useState(null);
    const [occupe, setOccupe] = useState(false);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/provisions');
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const arreter = async () => {
        const note = window.prompt('Note de l\'arrêté (facultative)', '');
        if (note === null) return;
        setOccupe(true);
        try {
            const res = await api.post('/provisions/arreter', { note });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Provision arrêtée.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Arrêté impossible.' });
        } finally {
            setOccupe(false);
        }
    };

    const lignes = donnees?.lignes || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Scale className="w-6 h-6 text-orange-600" /> Provision pour congés payés
                    </h1>
                    <p className="text-slate-500 mt-1">Ce que l'entreprise devrait si tout le monde partait demain.</p>
                </div>
                <Button onClick={arreter} disabled={occupe}>
                    <Archive className="w-4 h-4 mr-1" /> Arrêter à aujourd'hui
                </Button>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            {donnees && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Dette totale</p>
                        <p className="text-2xl font-bold text-slate-900">{montant(donnees.total)}</p>
                        <p className="text-xs text-slate-500">charges patronales comprises</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Dont congés</p>
                        <p className="text-2xl font-bold text-slate-900">{montant(donnees.totalConges)}</p>
                        <p className="text-xs text-slate-500">+ {montant(donnees.totalCharges)} de charges</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Jours dus</p>
                        <p className="text-2xl font-bold text-slate-900">{donnees.joursDus}</p>
                        {donnees.sansValorisation > 0 && (
                            <p className="text-xs text-amber-700">{donnees.sansValorisation} salarié(s) non valorisable(s)</p>
                        )}
                    </CardContent></Card>
                </div>
            )}

            {donnees && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        <strong>Méthode :</strong> {donnees.methode} Une convention collective peut retenir une autre
                        assiette. Le chiffre est un ordre de grandeur sincère et reproductible, pas un arrêté comptable —
                        il porte sa méthode pour qu'un comptable puisse la discuter.
                    </span>
                </div>
            )}

            {donnees?.arretes?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Arrêtés</CardTitle>
                        <CardDescription>États figés à une date. C'est le détail figé qui fait foi, pas le calcul du jour.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {donnees.arretes.map((a) => (
                                <li key={a.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-slate-800">Au {date(a.arreteAu)}</p>
                                        <p className="text-xs text-slate-500">
                                            {a.salaries} salarié(s){a.creePar && ` · ${a.creePar}`}{a.note && ` · ${a.note}`}
                                        </p>
                                    </div>
                                    <span className="font-semibold">{montant(a.totalConges + a.totalCharges)}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Détail par salarié</CardTitle>
                    <CardDescription>Du plus lourd au plus léger.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {lignes.length === 0 && <li className="p-6 text-sm text-slate-500">Aucune dette à afficher.</li>}
                        {lignes.map((l) => (
                            <li key={l.employeeId} className="p-4 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="font-medium text-slate-800">{l.nom}</p>
                                    <p className="text-xs text-slate-500">
                                        {l.jours} jour(s) · {l.departement || 'Sans département'}
                                        {l.source === 'FICHE' && ' · valorisé sur la fiche, faute de bulletin'}
                                        {l.source === 'INCONNU' && ' · aucune base de valorisation'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-800">{montant(l.total)}</p>
                                    {l.valeurJour != null && (
                                        <p className="text-xs text-slate-500">{montant(l.valeurJour)} par jour</p>
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
