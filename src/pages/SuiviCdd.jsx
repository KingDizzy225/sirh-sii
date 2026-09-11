import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileClock, X, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Suivi des contrats à durée déterminée.
 *
 * L'application ne connaissait d'un CDD que sa date de fin. Rien ne disait
 * depuis quand le salarié enchaînait les contrats, ni qu'un renouvellement
 * ferait dépasser la durée maximale — au-delà de laquelle le contrat risque
 * d'être requalifié en CDI. Ni qu'un salarié travaillait encore après le terme.
 *
 * L'écran classe les contrats du plus exposé au moins exposé, et le
 * renouvellement refuse une date qui dépasserait le plafond.
 */

const ETATS = {
    DEPASSE: { libelle: 'Plafond dépassé', classe: 'bg-rose-50 text-rose-700 border-rose-200' },
    ECHU_EN_POSTE: { libelle: 'Terme échu, en poste', classe: 'bg-rose-50 text-rose-700 border-rose-200' },
    SANS_TERME: { libelle: 'Sans terme', classe: 'bg-rose-50 text-rose-700 border-rose-200' },
    PLAFOND_ATTEINT: { libelle: 'Plafond atteint', classe: 'bg-amber-50 text-amber-800 border-amber-200' },
    ECHEANCE_PROCHE: { libelle: 'Échéance proche', classe: 'bg-amber-50 text-amber-800 border-amber-200' },
    INCOMPLET: { libelle: 'Dossier incomplet', classe: 'bg-slate-100 text-slate-600 border-slate-200' },
    EN_COURS: { libelle: 'En cours', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ECHU: { libelle: 'Échu', classe: 'bg-slate-100 text-slate-500 border-slate-200' }
};

// Un renouvellement n'a de sens que si le terme existe et que le plafond le permet.
const RENOUVELABLES = new Set(['ECHEANCE_PROCHE', 'EN_COURS', 'ECHU_EN_POSTE']);

const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—');
const jourIso = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export function SuiviCdd() {
    const [donnees, setDonnees] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [message, setMessage] = useState(null);
    const [cible, setCible] = useState(null);
    const [saisie, setSaisie] = useState({ nouvelleFin: '', motif: '' });
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState(null);

    const charger = useCallback(async () => {
        setChargement(true);
        try {
            const res = await api.get('/cdd');
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture des CDD impossible.' });
            setDonnees(null);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const ouvrir = (ligne) => {
        setCible(ligne);
        setSaisie({ nouvelleFin: '', motif: '' });
        setErreur(null);
    };

    const renouveler = async (evenement) => {
        evenement.preventDefault();
        setEnvoi(true);
        setErreur(null);
        try {
            const res = await api.post(`/cdd/${cible.employeeId}/renouveler`, saisie);
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Contrat renouvelé.' });
            setCible(null);
            charger();
        } catch (err) {
            // Le refus porte sa raison : date au-delà du plafond, terme absent.
            setErreur(err.message || 'Renouvellement refusé.');
        } finally {
            setEnvoi(false);
        }
    };

    const lignes = donnees?.lignes || [];
    const aTraiter = lignes.filter((l) => !['EN_COURS', 'ECHU'].includes(l.etat)).length;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen">
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <FileClock className="text-indigo-600 h-8 w-8" /> Suivi des CDD
                </h2>
                <p className="text-slate-500 mt-1 font-medium max-w-3xl">
                    Durée cumulée, renouvellements et plafond de {donnees?.regles?.dureeMaxMois ?? 24} mois
                    renouvellements compris. Au-delà, ou si le salarié travaille après le terme, le contrat
                    risque d'être requalifié en CDI.
                </p>
            </div>

            {message && (
                <div className={`rounded-xl border p-3 text-sm ${message.ton === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
                <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-sm font-bold text-slate-800">
                        {lignes.length} CDD en cours{aTraiter > 0 ? ` — ${aTraiter} à traiter` : ''}
                    </CardTitle>
                    <CardDescription>Classés du plus exposé au moins exposé.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    {chargement ? (
                        <p className="p-8 text-center text-sm text-slate-500">Chargement…</p>
                    ) : lignes.length === 0 ? (
                        <p className="p-8 text-center text-sm text-slate-500">
                            Aucun salarié en CDD. Le type de contrat se renseigne sur la fiche du salarié.
                        </p>
                    ) : (
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-slate-50/30 text-left text-slate-500 uppercase tracking-wide">
                                    <th className="p-3">Salarié</th>
                                    <th className="p-3">Entrée</th>
                                    <th className="p-3">Terme</th>
                                    <th className="p-3">Cumul</th>
                                    <th className="p-3">Renouv.</th>
                                    <th className="p-3">Situation</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lignes.map((l) => {
                                    const etat = ETATS[l.etat] || ETATS.EN_COURS;
                                    return (
                                        <tr key={l.employeeId} className="border-t border-slate-100 align-top">
                                            <td className="p-3">
                                                <div className="font-bold text-slate-900">{l.nom}</div>
                                                <div className="text-[10px] text-slate-400 uppercase">{l.poste} · {l.service}</div>
                                            </td>
                                            <td className="p-3 text-slate-600">{date(l.debut)}</td>
                                            <td className="p-3 text-slate-900 font-semibold">{date(l.fin)}</td>
                                            <td className="p-3 text-slate-600">{l.cumulMois != null ? `${l.cumulMois} mois` : '—'}</td>
                                            <td className="p-3 text-slate-600">{l.renouvellements}</td>
                                            <td className="p-3 max-w-md">
                                                <span className={`inline-block text-[10px] font-bold border rounded px-2 py-0.5 ${etat.classe}`}>
                                                    {etat.libelle}
                                                </span>
                                                {l.message && <p className="text-slate-600 mt-1 leading-relaxed">{l.message}</p>}
                                                {(l.avertissements || []).map((a, i) => (
                                                    <p key={i} className="text-[11px] text-slate-400 mt-1">{a}</p>
                                                ))}
                                            </td>
                                            <td className="p-3 text-right">
                                                {RENOUVELABLES.has(l.etat) && (
                                                    <Button size="sm" onClick={() => ouvrir(l)} className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold">
                                                        Renouveler
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {cible && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[110]">
                    <Card className="w-full max-w-md border-none shadow-2xl">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-lg font-black">Renouveler le CDD</CardTitle>
                                <CardDescription className="text-xs">{cible.nom} — terme actuel {date(cible.fin)}</CardDescription>
                            </div>
                            <button onClick={() => setCible(null)} aria-label="Fermer" className="text-slate-400 hover:text-slate-700">
                                <X size={18} />
                            </button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={renouveler} className="space-y-4">
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Renouvellement possible jusqu'au <span className="font-bold">{date(cible.finMaxLegale)}</span> au plus tard.
                                    Au-delà, le contrat dépasserait le plafond : passer le salarié en CDI depuis sa fiche.
                                </p>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Nouveau terme
                                    <input
                                        type="date"
                                        required
                                        min={jourIso(cible.fin)}
                                        max={jourIso(cible.finMaxLegale)}
                                        value={saisie.nouvelleFin}
                                        onChange={(e) => setSaisie((s) => ({ ...s, nouvelleFin: e.target.value }))}
                                        className="mt-1.5 w-full h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal normal-case"
                                    />
                                </label>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Motif
                                    <textarea
                                        required
                                        value={saisie.motif}
                                        onChange={(e) => setSaisie((s) => ({ ...s, motif: e.target.value }))}
                                        placeholder="Surcroît d'activité lié au lancement de la campagne…"
                                        className="mt-1.5 w-full min-h-[80px] rounded-lg border border-slate-200 p-3 text-sm font-normal normal-case"
                                    />
                                </label>
                                {erreur && (
                                    <p className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-3 flex gap-2">
                                        <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {erreur}
                                    </p>
                                )}
                                <Button type="submit" disabled={envoi} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                    {envoi ? 'Enregistrement…' : 'Renouveler'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
