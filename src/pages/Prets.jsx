import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Landmark, Plus, X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';

/**
 * Prêts au personnel.
 *
 * Une avance ne se remboursait qu'en une fois : un salarié empruntant cinq cent
 * mille francs voyait la somme retenue d'un coup sur un seul bulletin, ou bien
 * la RH créait cinq avances fictives dont plus rien ne disait qu'elles n'en
 * formaient qu'une.
 *
 * L'écran montre l'échéancier avant l'engagement, parce que c'est à ce
 * moment-là que la mensualité se discute — pas après la première retenue.
 */

const fcfa = (n) => `${Math.round(Number(n) || 0).toLocaleString('fr-FR')} F`;

const STATUTS = {
    EN_COURS: { libelle: 'En cours', classe: 'bg-sky-50 text-sky-700 border-sky-200' },
    SOLDE: { libelle: 'Soldé', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ANNULE: { libelle: 'Annulé', classe: 'bg-slate-100 text-slate-500 border-slate-200' }
};

export function Prets() {
    const [prets, setPrets] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [message, setMessage] = useState(null);
    const [formulaireOuvert, setFormulaireOuvert] = useState(false);
    const [saisie, setSaisie] = useState({ employeeId: '', montant: '', echeances: 6, premiereEcheance: '', motif: '' });
    const [simulation, setSimulation] = useState(null);

    const charger = useCallback(async () => {
        setChargement(true);
        try {
            const res = await api.get('/prets');
            setPrets(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture des prêts impossible.' });
            setPrets([]);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);
    useEffect(() => {
        api.get('/employees')
            .then((res) => { if (Array.isArray(res?.data)) setSalaries(res.data); })
            .catch(() => {});
    }, []);

    // La simulation suit la saisie : l'échéancier et la quotité se voient
    // avant l'engagement, non après.
    useEffect(() => {
        if (!formulaireOuvert || !saisie.employeeId || !saisie.montant || !saisie.echeances) {
            setSimulation(null);
            return;
        }
        let vivant = true;
        api.post('/prets/simuler', {
            employeeId: saisie.employeeId,
            montant: Number(saisie.montant),
            echeances: Number(saisie.echeances),
            premiereEcheance: saisie.premiereEcheance || undefined
        })
            .then((res) => { if (vivant && res?.data) setSimulation(res.data); })
            .catch(() => { if (vivant) setSimulation(null); });
        return () => { vivant = false; };
    }, [formulaireOuvert, saisie.employeeId, saisie.montant, saisie.echeances, saisie.premiereEcheance]);

    const accorder = async (evenement) => {
        evenement.preventDefault();
        try {
            await api.post('/prets', {
                employeeId: saisie.employeeId,
                montant: Number(saisie.montant),
                echeances: Number(saisie.echeances),
                premiereEcheance: saisie.premiereEcheance || undefined,
                motif: saisie.motif || undefined
            });
            setFormulaireOuvert(false);
            setSaisie({ employeeId: '', montant: '', echeances: 6, premiereEcheance: '', motif: '' });
            setMessage({ ton: 'succes', texte: 'Prêt accordé. Les retenues se feront automatiquement sur la paie.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || "L'accord a été refusé." });
        }
    };

    const annuler = async (pret) => {
        const motif = window.prompt("Motif de l'annulation :");
        if (!motif) return;
        try {
            const res = await api.post(`/prets/${pret.id}/annuler`, { motif });
            setMessage({
                ton: 'succes',
                texte: `Prêt annulé. ${fcfa(res?.data?.restantAbandonne || 0)} abandonné(s). `
                    + (res?.data?.reserve || '')
            });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Annulation impossible.' });
        }
    };

    const enCours = prets.filter((p) => p.statut === 'EN_COURS');
    const totalRestant = enCours.reduce((t, p) => t + (p.restantDu || 0), 0);

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Landmark className="text-teal-600" size={32} />
                        Prêts au personnel
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        Remboursables en plusieurs mensualités, retenues automatiquement sur la paie.
                    </p>
                </div>
                <Button
                    onClick={() => setFormulaireOuvert(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white h-10"
                >
                    <Plus size={15} className="mr-2" /> Accorder un prêt
                </Button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Prêts en cours</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{enCours.length}</h3>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Restant dû</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{fcfa(totalRestant)}</h3>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle className="text-lg font-black">Prêts</CardTitle>
                    <CardDescription>
                        Le restant dû est la somme des échéances non retenues, jamais un compteur tenu à part.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {chargement ? (
                        <div className="p-12 text-center text-slate-400">Lecture des prêts…</div>
                    ) : prets.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">Aucun prêt enregistré.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {prets.map((p) => {
                                const st = STATUTS[p.statut] || STATUTS.EN_COURS;
                                const part = p.montant > 0 ? Math.round((p.rembourse / p.montant) * 100) : 0;
                                return (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-5 flex flex-wrap items-center justify-between gap-4"
                                    >
                                        <div className="min-w-[220px] flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-slate-900">
                                                    {p.salarie?.nom || '—'}
                                                </span>
                                                <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${st.classe}`}>
                                                    {st.libelle}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {fcfa(p.montant)} sur {p.echeances} mois
                                                {p.motif ? ` — ${p.motif}` : ''}
                                            </p>
                                            <div className="mt-2 h-1.5 w-full max-w-xs bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-500 rounded-full"
                                                    style={{ width: `${Math.min(part, 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1">
                                                {p.echeancesSoldees} / {p.echeances} échéance(s) retenue(s)
                                                {p.prochaine ? ` · prochaine en ${p.prochaine.periode}` : ''}
                                            </p>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Restant dû</p>
                                            <p className="font-mono font-bold text-slate-900">{fcfa(p.restantDu)}</p>
                                            {p.statut === 'EN_COURS' && (
                                                <Button
                                                    onClick={() => annuler(p)}
                                                    variant="ghost"
                                                    className="h-7 mt-1 text-xs text-rose-600 hover:bg-rose-50"
                                                >
                                                    Annuler
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {formulaireOuvert && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <Card className="w-full max-w-lg border-none shadow-xl my-8">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-lg font-black">Accorder un prêt</CardTitle>
                                <CardDescription className="text-xs">
                                    L'échéancier est arrêté à l'accord et ne bouge plus.
                                </CardDescription>
                            </div>
                            <button
                                onClick={() => setFormulaireOuvert(false)}
                                aria-label="Fermer"
                                className="text-slate-400 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={accorder} className="space-y-3">
                                <select
                                    required value={saisie.employeeId}
                                    onChange={(e) => setSaisie({ ...saisie, employeeId: e.target.value })}
                                    aria-label="Salarié"
                                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                                >
                                    <option value="">Choisir un salarié…</option>
                                    {salaries.map((s) => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                    ))}
                                </select>

                                <div className="grid grid-cols-2 gap-3">
                                    <label className="text-xs text-slate-500">
                                        Montant (FCFA)
                                        <input
                                            type="number" min="1" required value={saisie.montant}
                                            onChange={(e) => setSaisie({ ...saisie, montant: e.target.value })}
                                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm mt-1"
                                        />
                                    </label>
                                    <label className="text-xs text-slate-500">
                                        Mensualités
                                        <input
                                            type="number" min="1" max="24" required value={saisie.echeances}
                                            onChange={(e) => setSaisie({ ...saisie, echeances: e.target.value })}
                                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm mt-1"
                                        />
                                    </label>
                                </div>

                                <label className="block text-xs text-slate-500">
                                    Première retenue (facultatif — le mois prochain par défaut)
                                    <input
                                        type="month" value={saisie.premiereEcheance}
                                        onChange={(e) => setSaisie({ ...saisie, premiereEcheance: e.target.value })}
                                        className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm mt-1"
                                    />
                                </label>

                                <input
                                    value={saisie.motif}
                                    onChange={(e) => setSaisie({ ...saisie, motif: e.target.value })}
                                    placeholder="Motif (facultatif)"
                                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                                />

                                {simulation && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
                                        <p className="text-slate-600">
                                            Net mensuel {fcfa(simulation.netMensuel)}
                                            {simulation.netEstime && ' (estimé, aucun bulletin enregistré)'} ·
                                            retenue maximale {fcfa(simulation.plafondMensuel)}
                                            {' '}({Math.round(simulation.quotiteMax * 100)} %)
                                            {simulation.encoursMensuel > 0
                                                && ` · déjà retenu ${fcfa(simulation.encoursMensuel)}`}
                                        </p>

                                        {simulation.empechements.length > 0 ? (
                                            <div className="text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-start gap-1.5">
                                                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                                                <span>{simulation.empechements.join(' ')}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-emerald-800 flex items-center gap-1.5">
                                                    <CheckCircle2 size={13} />
                                                    {simulation.lignes.length} mensualité(s) de {fcfa(simulation.lignes[0]?.montant)}
                                                    {simulation.lignes.length > 1
                                                     && simulation.lignes[simulation.lignes.length - 1].montant !== simulation.lignes[0].montant
                                                     && `, la dernière de ${fcfa(simulation.lignes[simulation.lignes.length - 1].montant)}`}
                                                </p>
                                                <p className="text-slate-500">
                                                    De {simulation.lignes[0]?.periode} à{' '}
                                                    {simulation.lignes[simulation.lignes.length - 1]?.periode}.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={Boolean(simulation && simulation.empechements.length > 0)}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40"
                                >
                                    Accorder
                                </Button>

                                <p className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-snug">
                                    <Info size={12} className="mt-0.5 shrink-0" />
                                    Les retenues tombent automatiquement sur la paie du mois
                                    correspondant. Aucune saisie mensuelle n'est nécessaire.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
