import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CalendarDays, Sparkles, Plus, Trash2, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';

/**
 * Calendrier des jours fériés.
 *
 * L'application n'en connaissait aucun : le 7 août se décomptait comme un jour
 * de congé ordinaire, et le compteur, crédité en jours ouvrables, était débité
 * en jours calendaires.
 *
 * L'écran repose sur une distinction : ce que l'application calcule — fêtes
 * fixes et fêtes chrétiennes mobiles — et ce qu'elle ne peut pas calculer. Les
 * fêtes musulmanes suivent le calendrier lunaire et sont arrêtées par décret ;
 * les deviner fausserait chaque congé qui les traverse.
 */

const SOURCES = {
    LEGAL_FIXE: { libelle: 'Fixe', classe: 'bg-slate-100 text-slate-600 border-slate-200' },
    LEGAL_MOBILE: { libelle: 'Mobile', classe: 'bg-sky-50 text-sky-700 border-sky-200' },
    DECRET: { libelle: 'Décret', classe: 'bg-violet-50 text-violet-700 border-violet-200' },
    ENTREPRISE: { libelle: 'Entreprise', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
};

const dateFr = (v) => new Date(v).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
});

export function JoursFeries() {
    const [annee, setAnnee] = useState(new Date().getFullYear());
    const [donnees, setDonnees] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [message, setMessage] = useState(null);
    const [saisie, setSaisie] = useState({ date: '', libelle: '', source: 'DECRET' });

    const charger = useCallback(async () => {
        setChargement(true);
        try {
            const res = await api.get(`/jours-feries?annee=${annee}`);
            setDonnees(res?.data || null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture du calendrier impossible.' });
            setDonnees(null);
        } finally {
            setChargement(false);
        }
    }, [annee]);

    useEffect(() => { charger(); }, [charger]);

    const engendrer = async () => {
        try {
            const res = await api.post('/jours-feries/engendrer', { annee });
            setMessage({ ton: 'succes', texte: res?.data?.message || 'Calendrier engendré.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Génération impossible.' });
        }
    };

    const ajouter = async (evenement) => {
        evenement.preventDefault();
        try {
            await api.post('/jours-feries', saisie);
            setSaisie({ date: '', libelle: '', source: 'DECRET' });
            setMessage({ ton: 'succes', texte: 'Jour férié enregistré.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement refusé.' });
        }
    };

    const retirer = async (ferie) => {
        if (!window.confirm(`Retirer « ${ferie.libelle} » du calendrier ?`)) return;
        try {
            const res = await api.delete(`/jours-feries/${ferie.id}`);
            setMessage({ ton: 'succes', texte: res?.data?.message || 'Jour férié retiré.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Suppression impossible.' });
        }
    };

    const annees = [];
    for (let a = new Date().getFullYear() - 1; a <= new Date().getFullYear() + 2; a++) annees.push(a);

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <CalendarDays className="text-indigo-600" size={32} />
                        Jours fériés
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        Ils conditionnent le décompte des congés : un jour férié traversé
                        par un congé n'est pas retiré du solde.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={annee}
                        onChange={(e) => setAnnee(Number(e.target.value))}
                        aria-label="Année"
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    >
                        {annees.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <Button onClick={engendrer} className="bg-slate-900 hover:bg-slate-800 text-white h-10">
                        <Sparkles size={15} className="mr-2" /> Engendrer {annee}
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`text-sm rounded-xl p-3 border ${
                    message.ton === 'succes'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                    {message.texte}
                </div>
            )}

            {chargement && <div className="p-12 text-center text-slate-400">Lecture du calendrier…</div>}

            {donnees && !chargement && (
                <>
                    {donnees.aDecreter.length > 0 && (
                        <Card className="border-none shadow-sm border-l-4 border-l-amber-400">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-black flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-amber-500" />
                                    À saisir : {donnees.aDecreter.length} fête(s) non enregistrée(s)
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Ces fêtes suivent le calendrier lunaire et sont arrêtées par décret.
                                    L'application ne les calcule pas : les deviner fausserait chaque
                                    congé qui les traverse.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    {donnees.aDecreter.map((f) => (
                                        <li key={f.code}>· {f.libelle}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-base font-black">Calendrier {donnees.annee}</CardTitle>
                                <CardDescription className="text-xs">
                                    {donnees.convention.explication}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {donnees.feries.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500 text-sm">
                                        Aucun jour férié enregistré pour {donnees.annee}.
                                        {donnees.calculablesAbsents.length > 0 && (
                                            <> « Engendrer {donnees.annee} » en pose {donnees.calculablesAbsents.length}.</>
                                        )}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        <AnimatePresence initial={false}>
                                            {donnees.feries.map((f) => {
                                                const src = SOURCES[f.source] || SOURCES.DECRET;
                                                return (
                                                    <motion.div
                                                        key={f.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-slate-900">{f.libelle}</p>
                                                            <p className="text-xs text-slate-500 capitalize">{dateFr(f.date)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${src.classe}`}>
                                                                {src.libelle}
                                                            </span>
                                                            <button
                                                                onClick={() => retirer(f)}
                                                                aria-label={`Retirer ${f.libelle}`}
                                                                className="text-slate-300 hover:text-rose-600 p-1"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm h-fit">
                            <CardHeader>
                                <CardTitle className="text-base font-black flex items-center gap-2">
                                    <Plus size={16} /> Ajouter un jour
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Fête décrétée, ou jour chômé propre à l'entreprise.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={ajouter} className="space-y-3">
                                    <label className="block text-xs text-slate-500">
                                        Date
                                        <input
                                            type="date" required value={saisie.date}
                                            onChange={(e) => setSaisie({ ...saisie, date: e.target.value })}
                                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm mt-1"
                                        />
                                    </label>
                                    <label className="block text-xs text-slate-500">
                                        Libellé
                                        <input
                                            required value={saisie.libelle}
                                            onChange={(e) => setSaisie({ ...saisie, libelle: e.target.value })}
                                            placeholder="Fête de la Tabaski"
                                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm mt-1"
                                        />
                                    </label>
                                    <label className="block text-xs text-slate-500">
                                        Nature
                                        <select
                                            value={saisie.source}
                                            onChange={(e) => setSaisie({ ...saisie, source: e.target.value })}
                                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm mt-1"
                                        >
                                            <option value="DECRET">Fixée par décret</option>
                                            <option value="ENTREPRISE">Propre à l'entreprise</option>
                                        </select>
                                    </label>
                                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                        Enregistrer
                                    </Button>
                                </form>

                                <p className="text-[11px] text-slate-500 mt-4 flex items-start gap-1.5 leading-snug">
                                    <Info size={12} className="mt-0.5 shrink-0" />
                                    Retirer un jour ne modifie pas les congés déjà validés : ils
                                    conservent la durée arrêtée au moment de leur validation.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
