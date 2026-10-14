import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Repeat, Check, X, Flame, AlertCircle, MapPin, Plus, Radio } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

/**
 * Remplacements proposés par les salariés depuis leur badge et SOS Renforts.
 */

const ETATS = {
    ACCEPTEE: { libelle: 'À valider', classe: 'bg-amber-50 text-amber-800 border-amber-200', ordre: 0 },
    OUVERTE: { libelle: 'Cherche un remplaçant', classe: 'bg-sky-50 text-sky-700 border-sky-200', ordre: 1 },
    VALIDEE: { libelle: 'Validé', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200', ordre: 2 },
    REFUSEE: { libelle: 'Refusé', classe: 'bg-slate-100 text-slate-500 border-slate-200', ordre: 3 },
    ANNULEE: { libelle: 'Retiré', classe: 'bg-slate-100 text-slate-500 border-slate-200', ordre: 3 },
    ECHUE: { libelle: 'Échu', classe: 'bg-slate-100 text-slate-500 border-slate-200', ordre: 4 }
};

export function Remplacements() {
    const [demandes, setDemandes] = useState([]);
    const [sosList, setSosList] = useState([]);
    const [sites, setSites] = useState([]);
    const [message, setMessage] = useState(null);
    const [modalSos, setModalSos] = useState(false);
    const [formSos, setFormSos] = useState({ workSiteId: '', date: new Date().toISOString().slice(0, 10), debut: '08:00', fin: '17:00', motif: 'Absence maladie imprévue d\'un agent de caisse', prime: 10000 });
    const [envoiSos, setEnvoiSos] = useState(false);

    const charger = useCallback(async () => {
        try {
            const [resRemplacements, resSos, resSites] = await Promise.all([
                api.get('/remplacements'),
                api.get('/remplacements/sos').catch(() => ({ data: [] })),
                api.get('/worksites').catch(() => ({ data: [] }))
            ]);
            setDemandes(listeSure(resRemplacements?.data, 'remplacements'));
            setSosList(listeSure(resSos?.data, 'SOS'));
            setSites(listeSure(resSites?.data, 'sites'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    const lancerSos = async (e) => {
        e.preventDefault();
        setEnvoiSos(true);
        try {
            const res = await api.post('/remplacements/sos', formSos);
            setMessage({ ton: 'ok', texte: `🆘 Alerte SOS Renfort diffusée ! ${res?.data?.salariesNotifies || 0} salariés disponibles notifiés dans la zone.` });
            setModalSos(false);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.response?.data?.error || err.message || 'Échec du lancement SOS.' });
        } finally {
            setEnvoiSos(false);
        }
    };

    useEffect(() => { charger(); }, [charger]);

    const decider = async (demande, valider) => {
        let corps = {};
        if (!valider) {
            const motif = window.prompt('Motif du refus (il sera communiqué aux deux salariés)');
            if (!motif) return;
            corps = { motif };
        }
        try {
            const res = valider
                ? await api.post(`/remplacements/${demande.id}/valider`, corps)
                : await api.post(`/remplacements/${demande.id}/refuser`, corps);
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Décision enregistrée.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Décision impossible.' });
        }
    };

    const tries = [...demandes].sort((a, b) =>
        (ETATS[a.etat]?.ordre ?? 9) - (ETATS[b.etat]?.ordre ?? 9) || new Date(a.creneau.date) - new Date(b.creneau.date));
    const aValider = demandes.filter((d) => d.etat === 'ACCEPTEE').length;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Repeat className="w-6 h-6 text-orange-600" /> Remplacements & Bourse d'Équipe
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Les salariés proposent leur créneau depuis leur badge ; un collègue du même service le reprend.
                        {aValider > 0 && <strong className="text-amber-700"> {aValider} à valider.</strong>}
                    </p>
                </div>
                <Button onClick={() => setModalSos(true)} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 shadow-sm">
                    <Flame className="w-4 h-4 animate-pulse" /> 🆘 Lancer un SOS Renfort
                </Button>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            {sosList.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-sm uppercase tracking-wider">
                        <Radio className="w-4 h-4 text-rose-600 animate-pulse" /> Alertes Renfort Agence en Direct ({sosList.length})
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sosList.map((sos) => (
                            <div key={sos.id} className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-600" /> {sos.siteNom}</span>
                                        <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">+{sos.prime?.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                    <p className="text-sm text-slate-700 mt-1.5 font-medium">{sos.motif}</p>
                                    <p className="text-xs text-slate-500 mt-1">Date : {sos.date} ({sos.debut} - {sos.fin})</p>
                                </div>
                                <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs text-slate-500">
                                    <span>Diffusé à {sos.salariesNotifies} salariés proches</span>
                                    <span className="font-semibold text-emerald-700">{sos.statut}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Card>
                <CardContent className="p-0">
                    {tries.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">Aucune demande ces quatorze derniers jours.</p>
                    ) : (
                        <ul className="divide-y">
                            {tries.map((d) => {
                                const etat = ETATS[d.etat] || ETATS.ECHUE;
                                return (
                                    <li key={d.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-slate-800 first-letter:uppercase">{d.creneau.libelle}</p>
                                            <p className="text-sm text-slate-600">
                                                {d.demandeur}{d.remplacant ? <> → <strong>{d.remplacant}</strong></> : ''} <span className="text-slate-400">· {d.service}</span>
                                            </p>
                                            {d.motif && <p className="text-xs text-slate-500 mt-0.5">Motif : {d.motif}</p>}
                                            {d.motifRefus && <p className="text-xs text-rose-700 mt-0.5">Refus : {d.motifRefus}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full border ${etat.classe}`}>{etat.libelle}</span>
                                            {d.etat === 'ACCEPTEE' && (
                                                <Button size="sm" onClick={() => decider(d, true)}><Check className="w-4 h-4 mr-1" /> Valider</Button>
                                            )}
                                            {['ACCEPTEE', 'OUVERTE'].includes(d.etat) && (
                                                <Button size="sm" variant="outline" onClick={() => decider(d, false)}><X className="w-4 h-4 mr-1" /> Refuser</Button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {modalSos && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden">
                        <div className="bg-rose-50 px-6 py-4 border-b border-rose-200">
                            <h2 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                                <Flame className="w-5 h-5 text-rose-600" /> Déclencher un SOS Renfort Agence
                            </h2>
                            <p className="text-xs text-rose-700 mt-0.5">
                                Notifie instantanément les collègues disponibles dans un rayon de 30 km.
                            </p>
                        </div>
                        <form onSubmit={lancerSos} className="p-6 space-y-4 text-sm">
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Agence en sous-effectif</label>
                                <select
                                    value={formSos.workSiteId}
                                    onChange={(e) => setFormSos(s => ({ ...s, workSiteId: e.target.value }))}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                                >
                                    <option value="">Sélectionner une agence…</option>
                                    {sites.filter(s => s.isActive !== false).map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={formSos.date}
                                        onChange={(e) => setFormSos(s => ({ ...s, date: e.target.value }))}
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Heure début</label>
                                    <input
                                        value={formSos.debut}
                                        onChange={(e) => setFormSos(s => ({ ...s, debut: e.target.value }))}
                                        placeholder="08:00"
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Heure fin</label>
                                    <input
                                        value={formSos.fin}
                                        onChange={(e) => setFormSos(s => ({ ...s, fin: e.target.value }))}
                                        placeholder="17:00"
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Motif de l'urgence</label>
                                <input
                                    value={formSos.motif}
                                    onChange={(e) => setFormSos(s => ({ ...s, motif: e.target.value }))}
                                    placeholder="Ex: Maladie inopinée, affluence exceptionnelle..."
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Prime de renfort proposée (FCFA)</label>
                                <input
                                    type="number"
                                    step="1000"
                                    value={formSos.prime}
                                    onChange={(e) => setFormSos(s => ({ ...s, prime: Number(e.target.value) }))}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono font-semibold"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setModalSos(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={envoiSos} className="bg-rose-600 hover:bg-rose-700 text-white font-medium">
                                    {envoiSos ? 'Diffusion en cours…' : 'Diffuser l\'alerte SOS'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
