import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, AlertTriangle, MinusCircle, Loader2, Stethoscope } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext';

/**
 * Sonde de bout en bout.
 *
 * L'état des services dit quelles clés sont posées ; la sonde, elle, exerce
 * les chemins : elle scelle puis vérifie un document, écrit sur le disque,
 * contrôle la chaîne du journal et l'âge de la dernière sauvegarde.
 */

const NIVEAUX = {
    OK: { icone: CheckCircle2, couleur: 'text-emerald-600', fond: 'bg-emerald-50 border-emerald-200' },
    ALERTE: { icone: AlertTriangle, couleur: 'text-rose-600', fond: 'bg-rose-50 border-rose-200' },
    ABSENT: { icone: MinusCircle, couleur: 'text-slate-400', fond: 'bg-slate-50 border-slate-200' }
};

const dateHeure = (d) => (d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');

export function Sonde() {
    const { user } = useAuth();
    const [derniere, setDerniere] = useState(null);
    const [historique, setHistorique] = useState([]);
    const [enCours, setEnCours] = useState(false);
    const [erreur, setErreur] = useState(null);

    const charger = useCallback(async () => {
        try {
            const { data } = await api.get('/sonde');
            if (data && Array.isArray(data.historique)) {
                setDerniere(data.derniere);
                setHistorique(data.historique);
            }
        } catch (err) {
            setErreur(err.message || 'Comptes rendus indisponibles.');
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const lancer = async () => {
        setEnCours(true);
        setErreur(null);
        try {
            const { data } = await api.post('/sonde', {});
            if (data && Array.isArray(data.resultats)) setDerniere(data);
            charger();
        } catch (err) {
            setErreur(err.message || "La sonde n'a pas pu s'exécuter.");
        } finally {
            setEnCours(false);
        }
    };

    const resultats = derniere?.resultats || [];
    const estAdmin = ['ADMIN', 'Administrator'].includes(user?.role);

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-indigo-600" /> Contrôle de bout en bout
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Passage automatique chaque nuit à 3 h. Il scelle et vérifie un document, écrit sur le disque,
                        contrôle la chaîne du journal et l'âge de la dernière sauvegarde.
                    </CardDescription>
                </div>
                {estAdmin && (
                    <Button onClick={lancer} disabled={enCours} className="h-9 text-xs shrink-0">
                        {enCours ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Contrôle en cours…</> : 'Lancer maintenant'}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {erreur && <p className="text-sm text-rose-700">{erreur}</p>}

                {!derniere ? (
                    <p className="text-sm text-slate-500">
                        Aucun passage enregistré. Le premier aura lieu cette nuit{estAdmin ? ', ou dès maintenant.' : '.'}
                    </p>
                ) : (
                    <>
                        <p className={`text-sm rounded-lg border px-3 py-2 ${derniere.ok ? NIVEAUX.OK.fond : NIVEAUX.ALERTE.fond}`}>
                            {derniere.ok
                                ? `Tout répond — contrôle du ${dateHeure(derniere.lanceeLe)}, en ${Math.round((derniere.dureeMs || 0) / 100) / 10} s.`
                                : `${derniere.echecs} point(s) en défaut — contrôle du ${dateHeure(derniere.lanceeLe)}.`}
                        </p>

                        <ul className="divide-y">
                            {resultats.map((r) => {
                                const niveau = NIVEAUX[r.niveau] || NIVEAUX.ABSENT;
                                const Icone = niveau.icone;
                                return (
                                    <li key={r.nom} className="py-2 flex items-start gap-3">
                                        <Icone className={`w-4 h-4 shrink-0 mt-0.5 ${niveau.couleur}`} aria-hidden />
                                        <div className="text-sm">
                                            <span className="font-medium text-slate-800">{r.libelle}</span>
                                            <span className="text-slate-400 text-xs"> · {r.niveau === 'ABSENT' ? 'non configuré' : r.niveau === 'OK' ? 'répond' : 'en défaut'}</span>
                                            <p className="text-slate-600">{r.detail}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {historique.length > 1 && (
                            <p className="text-xs text-slate-500">
                                Passages précédents : {historique.slice(1, 8).map((h) => `${dateHeure(h.lanceeLe)} ${h.ok ? '✓' : `✗ ${h.echecs}`}`).join(' · ')}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
