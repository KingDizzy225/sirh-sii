import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { CalendarRange, AlertTriangle, AlertOctagon, CheckCircle2, Info, X } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Prévision des absences : sites en lignes, jours en colonnes.
 *
 * Chaque case dit le pourcentage d'effectif disponible, et l'état (normal,
 * tendu, critique) n'est jamais porté par la seule couleur : une icône et le
 * libellé l'accompagnent dans la légende, l'infobulle et le détail.
 */

// Palette de statuts : réservée aux états, jamais à une série.
const ETATS = {
    NORMAL: { libelle: 'Normal', couleur: '#0ca30c', icone: CheckCircle2 },
    TENDU: { libelle: 'Tendu', couleur: '#fab219', icone: AlertTriangle },
    CRITIQUE: { libelle: 'Critique', couleur: '#d03b3b', icone: AlertOctagon },
    FERIE: { libelle: 'Férié', couleur: null, icone: null },
    FERME: { libelle: 'Fermé', couleur: null, icone: null },
    INCONNU: { libelle: 'Sans effectif connu', couleur: null, icone: null }
};

const JOURS_COURTS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const dateLongue = (cle) => new Date(`${cle}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

/** Fond teinté à partir de la couleur de statut : le texte reste à l'encre principale. */
const teinte = (hex, alpha) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

function Case({ jour, onSurvol, onClic, actif }) {
    const etat = ETATS[jour.niveau];
    const taux = jour.estimationPct ?? jour.disponibilitePct;
    const Icone = etat.icone;
    const style = etat.couleur
        ? { background: teinte(etat.couleur, jour.niveau === 'NORMAL' ? 0.14 : 0.3), boxShadow: actif ? `inset 0 0 0 2px ${etat.couleur}` : undefined }
        : { background: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 4px, #e2e8f0 4px, #e2e8f0 6px)' };
    return (
        <td className="p-0">
            <button
                type="button"
                onMouseEnter={onSurvol}
                onFocus={onSurvol}
                onClick={onClic}
                aria-label={`${dateLongue(jour.date)} : ${etat.libelle}${taux !== undefined && taux !== null ? `, ${taux} % disponibles` : ''}`}
                className="w-11 h-10 rounded-[4px] text-[11px] font-semibold text-slate-800 tabular-nums flex flex-col items-center justify-center leading-none"
                style={style}
            >
                {Icone && jour.niveau !== 'NORMAL' && <Icone className="w-3 h-3 mb-0.5" style={{ color: etat.couleur }} aria-hidden />}
                {etat.couleur ? `${taux}` : <span className="text-slate-500 text-[10px]">{jour.niveau === 'FERIE' ? 'Fér.' : jour.niveau === 'FERME' ? '—' : '?'}</span>}
            </button>
        </td>
    );
}

export function PrevisionAbsences() {
    const [jours, setJours] = useState(42);
    const [donnees, setDonnees] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [survol, setSurvol] = useState(null);
    const [selection, setSelection] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get(`/previsions/absences?jours=${jours}`);
            setDonnees(res?.data && Array.isArray(res.data.sites) ? res.data : null);
            setErreur(null);
        } catch (err) {
            setErreur(err.message || 'Prévision indisponible.');
        }
    }, [jours]);

    useEffect(() => { charger(); }, [charger]);

    const dates = useMemo(() => donnees?.sites?.[0]?.jours?.map((j) => j.date) || [], [donnees]);
    const alertes = useMemo(() => (donnees?.sites || []).flatMap((s) => s.jours.filter((j) => j.niveau === 'CRITIQUE').map((j) => ({ site: s.nom, ...j }))), [donnees]);
    const detail = selection || survol;
    const historiqueOk = donnees && donnees.historique.semaines >= donnees.historique.semainesRequises;

    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CalendarRange className="w-6 h-6 text-indigo-600" /> Prévision des absences</h1>
                    <p className="text-slate-500 mt-1">Part de l'effectif habituel disponible, agence par agence, sur les semaines à venir.</p>
                </div>
                <select value={jours} onChange={(e) => setJours(Number(e.target.value))} className="rounded-lg border px-3 py-2 bg-white text-sm">
                    {[14, 42, 90].map((j) => <option key={j} value={j}>{j} jours</option>)}
                </select>
            </div>

            {erreur && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{erreur}</div>}

            {donnees && (
                <div className={`rounded-lg border px-4 py-3 text-sm flex gap-2 ${historiqueOk ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    {historiqueOk
                        ? `Les chiffres combinent les congés validés, les fériés et le taux de présence observé sur ${donnees.historique.semaines} semaines.`
                        : `Historique de pointage : ${donnees.historique.semaines} semaine(s) sur les ${donnees.historique.semainesRequises} nécessaires. Les chiffres ne tiennent compte que des congés validés et des fériés : c'est un plancher, pas une estimation de l'absentéisme.`}
                </div>
            )}

            {alertes.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                    <p className="font-semibold flex items-center gap-2"><AlertOctagon className="w-4 h-4" /> {alertes.length} journée(s) critique(s)</p>
                    <p className="mt-1">{alertes.slice(0, 6).map((a) => `${a.site} le ${dateLongue(a.date)}`).join(' · ')}{alertes.length > 6 ? '…' : ''}</p>
                </div>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-slate-600" aria-label="Légende">
                {['NORMAL', 'TENDU', 'CRITIQUE'].map((code) => {
                    const Icone = ETATS[code].icone;
                    return (
                        <span key={code} className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-[4px] flex items-center justify-center" style={{ background: teinte(ETATS[code].couleur, 0.3) }}>
                                <Icone className="w-3 h-3" style={{ color: ETATS[code].couleur }} aria-hidden />
                            </span>
                            {ETATS[code].libelle}
                            {code === 'TENDU' && donnees && ` (< ${Math.round(donnees.seuils.tendu * 100)} %)`}
                            {code === 'CRITIQUE' && donnees && ` (< ${Math.round(donnees.seuils.critique * 100)} %)`}
                        </span>
                    );
                })}
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-[4px]" style={{ background: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 4px, #e2e8f0 4px, #e2e8f0 6px)' }} /> Férié ou fermé</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-4">
                <Card>
                    <CardContent className="p-3 overflow-x-auto">
                        {donnees && donnees.sites.length === 0 && <p className="p-4 text-sm text-slate-500">Aucun site actif avec des pointages récents.</p>}
                        {donnees && donnees.sites.length > 0 && (
                            <table className="border-separate" style={{ borderSpacing: 2 }}>
                                <thead>
                                    <tr>
                                        <th className="sticky left-0 bg-white z-10" />
                                        {dates.map((cle) => {
                                            const d = new Date(`${cle}T12:00:00Z`);
                                            return (
                                                <th key={cle} className={`text-[10px] font-medium text-slate-500 w-11 ${d.getUTCDay() === 1 ? 'border-l border-slate-200' : ''}`}>
                                                    <span className="block">{JOURS_COURTS[d.getUTCDay()]}</span>
                                                    <span className="block tabular-nums">{d.getUTCDate()}</span>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {donnees.sites.map((s) => (
                                        <tr key={s.id}>
                                            <th scope="row" className="sticky left-0 bg-white z-10 text-left pr-3 text-sm font-medium text-slate-800 whitespace-nowrap">
                                                {s.nom}<span className="block text-[11px] font-normal text-slate-500">{s.habituel} habituel{s.habituel > 1 ? 's' : ''}</span>
                                            </th>
                                            {s.jours.map((j) => (
                                                <Case key={j.date} jour={j}
                                                    actif={selection?.siteId === s.id && selection?.date === j.date}
                                                    onSurvol={() => setSurvol({ ...j, site: s.nom, siteId: s.id, habituel: s.habituel })}
                                                    onClic={() => setSelection({ ...j, site: s.nom, siteId: s.id, habituel: s.habituel })} />
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                <Card className="self-start lg:sticky lg:top-4">
                    <CardContent className="p-5">
                        {!detail ? (
                            <p className="text-sm text-slate-500">Survolez ou touchez une case pour le détail.</p>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-slate-900">{detail.site}</p>
                                        <p className="text-sm text-slate-500 first-letter:uppercase">{dateLongue(detail.date)}</p>
                                    </div>
                                    {selection && <button onClick={() => setSelection(null)} aria-label="Fermer"><X className="w-4 h-4 text-slate-400" /></button>}
                                </div>
                                <p className="text-sm font-medium flex items-center gap-2 text-slate-800">
                                    {ETATS[detail.niveau].icone && React.createElement(ETATS[detail.niveau].icone, { className: 'w-4 h-4', style: { color: ETATS[detail.niveau].couleur }, 'aria-hidden': true })}
                                    {ETATS[detail.niveau].libelle}{detail.ferie ? ` — ${detail.ferie}` : ''}{detail.pont ? ' · pont' : ''}
                                </p>
                                {detail.disponibilitePct !== undefined && (
                                    <dl className="text-sm grid grid-cols-[1fr_auto] gap-y-1">
                                        <dt className="text-slate-500">Effectif habituel</dt><dd className="tabular-nums text-slate-800">{detail.habituel}</dd>
                                        <dt className="text-slate-500">En congé validé</dt><dd className="tabular-nums text-slate-800">{detail.enConge}</dd>
                                        <dt className="text-slate-500">Disponibles (congés)</dt><dd className="tabular-nums text-slate-800">{detail.disponibilitePct} %</dd>
                                        <dt className="text-slate-500">Estimation (historique)</dt><dd className="tabular-nums text-slate-800">{detail.estimationPct === null ? '—' : `${detail.estimationPct} %`}</dd>
                                    </dl>
                                )}
                                {detail.noms?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">En congé</p>
                                        <ul className="text-sm text-slate-800 space-y-0.5">{detail.noms.map((n) => <li key={n}>{n}</li>)}</ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
