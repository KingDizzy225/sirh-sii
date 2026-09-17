import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { DoorOpen, Copy, MessageCircle, Pencil, Eye } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

/**
 * Pré-accueil des futurs salariés : ce qu'ils voient avant leur premier jour.
 *
 * Seuls les salariés dont l'embauche est à venir, ou date de moins de trente
 * jours, sont listés. Le lien ne change pas quand on modifie le programme.
 */

const dateLongue = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

function numeroWhatsapp(telephone) {
    const chiffres = String(telephone || '').replace(/\D/g, '');
    if (chiffres.length === 10) return `225${chiffres}`;
    if (chiffres.length === 13 && chiffres.startsWith('225')) return chiffres;
    return null;
}

const PAR_DEFAUT = ['IDENTITE', 'NAISSANCE', 'RIB', 'PHOTO', 'CNPS'];

export function PreAccueil() {
    const [donnees, setDonnees] = useState({ pieces: {}, lignes: [] });
    const [employes, setEmployes] = useState([]);
    const [sites, setSites] = useState([]);
    const [cible, setCible] = useState(null);
    const [saisie, setSaisie] = useState({});
    const [message, setMessage] = useState(null);
    const [envoi, setEnvoi] = useState(false);

    const charger = useCallback(async () => {
        try {
            const [res, resEmployes, resSites] = await Promise.all([api.get('/preaccueil'), api.get('/employees'), api.get('/worksites')]);
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : { pieces: {}, lignes: [] });
            setEmployes(listeSure(resEmployes?.data, 'salariés').filter((e) => e.status !== 'TERMINATED'));
            setSites(listeSure(resSites?.data, 'sites'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const ouvrir = (ligne) => {
        const p = ligne.preAccueil;
        setCible(ligne);
        setSaisie({
            responsableId: p?.responsableId || ligne.responsableParDefaut || '',
            workSiteId: p?.workSiteId || '',
            heureArrivee: p?.heureArrivee || '08:00',
            programme: p?.programme || '',
            motAccueil: p?.motAccueil || '',
            piecesAttendues: p?.piecesAttendues || PAR_DEFAUT
        });
    };

    const enregistrer = async (evenement) => {
        evenement.preventDefault();
        setEnvoi(true);
        try {
            const res = await api.post(`/preaccueil/${cible.employeeId}`, saisie);
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Enregistré.' });
            setCible(null);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        } finally {
            setEnvoi(false);
        }
    };

    const envoyer = (ligne) => {
        const texte = `Bonjour ${ligne.prenom}, bienvenue chez nous ! Tout pour préparer votre arrivée du ${dateLongue(ligne.dateArrivee)} : ${ligne.preAccueil.lien}`;
        window.open(`https://wa.me/${numeroWhatsapp(ligne.telephone) || ''}?text=${encodeURIComponent(texte)}`, '_blank', 'noopener');
    };

    const copier = async (lien) => {
        try { await navigator.clipboard.writeText(lien); setMessage({ ton: 'ok', texte: 'Lien copié.' }); } catch { setMessage({ ton: 'alerte', texte: lien }); }
    };

    const basculerPiece = (code) => setSaisie((s) => ({
        ...s,
        piecesAttendues: s.piecesAttendues.includes(code) ? s.piecesAttendues.filter((c) => c !== code) : [...s.piecesAttendues, code]
    }));

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><DoorOpen className="w-6 h-6 text-orange-600" /> Pré-accueil</h1>
                <p className="text-slate-500 mt-1">
                    Avant son premier jour, le futur salarié reçoit un lien : qui l'accueille, où, à quelle heure, son programme, et les pièces à déposer à l'avance.
                </p>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            <Card>
                <CardContent className="p-0">
                    {donnees.lignes.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">Aucune arrivée prévue. Un salarié créé avec une date d'embauche à venir apparaîtra ici.</p>
                    ) : (
                        <ul className="divide-y">
                            {donnees.lignes.map((l) => (
                                <li key={l.employeeId} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-slate-800">{l.nom}</p>
                                        <p className="text-sm text-slate-500">
                                            {[l.fonction, l.service].filter(Boolean).join(' · ')} — <span className="first-letter:uppercase">{dateLongue(l.dateArrivee)}</span>
                                            {l.joursAvant > 0 ? ` (dans ${l.joursAvant} j)` : l.joursAvant === 0 ? " (aujourd'hui)" : ' (arrivé)'}
                                        </p>
                                        {l.preAccueil && (
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                                <span>Pièces : {l.preAccueil.piecesRecues.length} / {l.preAccueil.piecesAttendues.length} reçues</span>
                                                {l.preAccueil.ouvertLe
                                                    ? <span className="flex items-center gap-1 text-emerald-700"><Eye className="w-3.5 h-3.5" /> ouvert {l.preAccueil.ouvertures}×</span>
                                                    : <span>jamais ouvert</span>}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {l.preAccueil && l.preAccueil.etat === 'OUVERT' && (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => envoyer(l)}><MessageCircle className="w-4 h-4 text-emerald-600" /></Button>
                                                <Button variant="outline" size="sm" onClick={() => copier(l.preAccueil.lien)}><Copy className="w-4 h-4" /></Button>
                                            </>
                                        )}
                                        <Button size="sm" onClick={() => ouvrir(l)}><Pencil className="w-4 h-4 mr-1" /> {l.preAccueil ? 'Modifier' : 'Préparer'}</Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {cible && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setCible(null)}>
                    <form onSubmit={enregistrer} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Arrivée de {cible.nom}</h2>
                        <div className="grid md:grid-cols-3 gap-3">
                            <label className="block md:col-span-2">
                                <span className="text-sm font-medium text-slate-700">Qui l'accueille</span>
                                <select value={saisie.responsableId} onChange={(e) => setSaisie((s) => ({ ...s, responsableId: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                    <option value="">—</option>
                                    {employes.filter((e) => e.id !== cible.employeeId).map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Heure d'arrivée</span>
                                <input type="time" value={saisie.heureArrivee} onChange={(e) => setSaisie((s) => ({ ...s, heureArrivee: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Lieu</span>
                            <select value={saisie.workSiteId} onChange={(e) => setSaisie((s) => ({ ...s, workSiteId: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                <option value="">—</option>
                                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Programme des premiers jours</span>
                            <textarea rows={5} value={saisie.programme} onChange={(e) => setSaisie((s) => ({ ...s, programme: e.target.value }))}
                                placeholder={'08:00 — Accueil et café\n09:00 — Visite de l\'agence\n11:00 — Formation caisse'}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Mot d'accueil (facultatif)</span>
                            <textarea rows={2} value={saisie.motAccueil} onChange={(e) => setSaisie((s) => ({ ...s, motAccueil: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <fieldset>
                            <legend className="text-sm font-medium text-slate-700 mb-2">Pièces à déposer</legend>
                            <div className="grid md:grid-cols-2 gap-2">
                                {Object.entries(donnees.pieces).map(([code, libelle]) => (
                                    <label key={code} className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={saisie.piecesAttendues.includes(code)} onChange={() => basculerPiece(code)} /> {libelle}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setCible(null)}>Annuler</Button>
                            <Button type="submit" disabled={envoi}>{envoi ? 'Enregistrement…' : 'Enregistrer'}</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
