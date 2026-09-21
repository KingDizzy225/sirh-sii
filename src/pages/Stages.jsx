import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GraduationCap, Info, Pencil, Trash2 } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

/**
 * Stagiaires et apprentis.
 *
 * Enregistrés comme salariés ordinaires, ils faussaient l'effectif, la masse
 * salariale et le seuil qui déclenche l'élection des délégués.
 */

const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');
const jourIso = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const montant = (n) => new Intl.NumberFormat('fr-CI').format(Math.round(n || 0)) + ' F';

export function Stages() {
    const [donnees, setDonnees] = useState(null);
    const [salaries, setSalaries] = useState([]);
    const [saisie, setSaisie] = useState(null);
    const [message, setMessage] = useState(null);

    const charger = useCallback(async () => {
        try {
            const [res, resSalaries] = await Promise.all([api.get('/stages'), api.get('/employees')]);
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
            setSalaries(listeSure(resSalaries?.data, 'salariés').filter((s) => s.status !== 'TERMINATED'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const enregistrer = async (evenement) => {
        evenement.preventDefault();
        try {
            const res = await api.post(`/stages/${saisie.employeeId}`, {
                ...saisie, gratificationMensuelle: Number(saisie.gratificationMensuelle) || 0
            });
            setMessage({ ton: 'ok', texte: `${res?.data?.message || 'Convention enregistrée.'} ${res?.data?.netEstime ? `Net estimé : ${montant(res.data.netEstime)}.` : ''}` });
            setSaisie(null);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        }
    };

    const supprimer = async (ligne) => {
        if (!window.confirm(`Retirer la convention de ${ligne.nom} ?`)) return;
        try {
            const res = await api.post(`/stages/${ligne.employeeId}/supprimer`, {});
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Convention retirée.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Suppression impossible.' });
        }
    };

    const lignes = donnees?.lignes || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-violet-600" /> Stagiaires et apprentis</h1>
                    <p className="text-slate-500 mt-1">Convention, tuteur, terme et gratification. Ils ne comptent pas dans l'effectif des délégués.</p>
                </div>
                <Button onClick={() => setSaisie({ employeeId: '', typeContrat: 'STAGE', ecole: '', niveau: '', tuteurId: '', debut: '', fin: '', gratificationMensuelle: '', objet: '' })}>
                    Nouvelle convention
                </Button>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            {donnees && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" /> {donnees.avertissement}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Conventions</CardTitle>
                    <CardDescription>{donnees ? `${donnees.enCours} en cours sur ${lignes.length} enregistrée(s).` : ''}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {lignes.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">Aucune convention. Créez d'abord le salarié, puis sa convention ici.</p>
                    ) : (
                        <ul className="divide-y">
                            {lignes.map((l) => (
                                <li key={l.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            {l.nom} <span className="text-xs text-slate-500">{l.typeContrat === 'APPRENTISSAGE' ? 'apprenti' : 'stagiaire'}</span>
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {[l.ecole, l.niveau].filter(Boolean).join(' · ')}
                                            {l.tuteur ? ` · tuteur ${l.tuteur}` : ' · sans tuteur'}
                                            {` · du ${date(l.debut)} au ${date(l.fin)}`}
                                            {` · ${montant(l.gratificationMensuelle)} par mois`}
                                        </p>
                                        {l.jusquAuTerme >= 0 && l.jusquAuTerme <= 30 && (
                                            <p className="text-xs text-amber-700 mt-0.5">Terme dans {l.jusquAuTerme} jour(s) : prévoir l'attestation ou l'embauche.</p>
                                        )}
                                        {l.jusquAuTerme < 0 && <p className="text-xs text-slate-500 mt-0.5">Terme dépassé.</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setSaisie({
                                            employeeId: l.employeeId, typeContrat: l.typeContrat === 'APPRENTISSAGE' ? 'APPRENTISSAGE' : 'STAGE',
                                            ecole: l.ecole || '', niveau: l.niveau || '', tuteurId: l.tuteurId || '',
                                            debut: jourIso(l.debut), fin: jourIso(l.fin),
                                            gratificationMensuelle: l.gratificationMensuelle || '', objet: l.objet || ''
                                        })}><Pencil className="w-4 h-4" /></Button>
                                        <Button variant="outline" size="sm" onClick={() => supprimer(l)}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {saisie && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setSaisie(null)}>
                    <form onSubmit={enregistrer} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Convention</h2>
                        <div className="grid md:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Salarié</span>
                                <select required value={saisie.employeeId} onChange={(e) => setSaisie((s) => ({ ...s, employeeId: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                    <option value="">Choisir</option>
                                    {salaries.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Nature</span>
                                <select value={saisie.typeContrat} onChange={(e) => setSaisie((s) => ({ ...s, typeContrat: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                    <option value="STAGE">Stage</option><option value="APPRENTISSAGE">Apprentissage</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">École ou centre</span>
                                <input value={saisie.ecole} onChange={(e) => setSaisie((s) => ({ ...s, ecole: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Niveau</span>
                                <input value={saisie.niveau} onChange={(e) => setSaisie((s) => ({ ...s, niveau: e.target.value }))}
                                    placeholder="BTS 2e année" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Tuteur</span>
                                <select value={saisie.tuteurId} onChange={(e) => setSaisie((s) => ({ ...s, tuteurId: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                    <option value="">Aucun</option>
                                    {salaries.filter((s) => s.id !== saisie.employeeId).map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Gratification mensuelle</span>
                                <input type="number" min="0" value={saisie.gratificationMensuelle}
                                    onChange={(e) => setSaisie((s) => ({ ...s, gratificationMensuelle: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Début</span>
                                <input required type="date" value={saisie.debut} onChange={(e) => setSaisie((s) => ({ ...s, debut: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Terme</span>
                                <input required type="date" value={saisie.fin} onChange={(e) => setSaisie((s) => ({ ...s, fin: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Objet du stage</span>
                            <textarea rows={3} value={saisie.objet} onChange={(e) => setSaisie((s) => ({ ...s, objet: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setSaisie(null)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
