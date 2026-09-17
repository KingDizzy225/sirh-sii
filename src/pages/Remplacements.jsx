import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Repeat, Check, X } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

/**
 * Remplacements proposés par les salariés depuis leur badge.
 *
 * Le créneau ne change de titulaire qu'ici, à la validation. Les demandes des
 * quatorze derniers jours sont affichées, les plus urgentes d'abord.
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
    const [message, setMessage] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/remplacements');
            setDemandes(listeSure(res?.data, 'remplacements'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

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
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Repeat className="w-6 h-6 text-orange-600" /> Remplacements</h1>
                <p className="text-slate-500 mt-1">
                    Les salariés proposent leur créneau depuis leur badge ; un collègue du même service le reprend. Le planning ne change qu'à votre validation.
                    {aValider > 0 && <strong className="text-amber-700"> {aValider} à valider.</strong>}
                </p>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
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
        </div>
    );
}
