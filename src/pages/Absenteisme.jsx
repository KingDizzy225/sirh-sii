import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    Tooltip as RechartsTooltip, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
    Activity, HeartPulse, Repeat, Info, AlertTriangle, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';

/**
 * Absentéisme mesuré.
 *
 * Les absences étaient enregistrées, les congés aussi, les pointages depuis le
 * 8 septembre — et rien n'en tirait un taux. C'est l'indicateur social le plus
 * regardé, et le seul que l'entreprise ne pouvait pas produire.
 *
 * L'écran est bâti autour d'une distinction, et non d'un chiffre : deux
 * services au même taux, l'un fait d'arrêts longs et l'autre d'absences
 * courtes répétées, n'appellent pas la même conversation. Un taux global seul
 * ferait manquer les deux.
 */

const pourcent = (v) => (v === null || v === undefined ? '—' : `${v.toLocaleString('fr-FR')} %`);

export function Absenteisme() {
    const [bilan, setBilan] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [profondeur, setProfondeur] = useState(12);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const fin = new Date();
            const debut = new Date();
            debut.setMonth(debut.getMonth() - (profondeur - 1));
            const cle = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const res = await api.get(`/analytics/absenteisme?du=${cle(debut)}&au=${cle(fin)}`);
            setBilan(res?.data || null);
        } catch (err) {
            setErreur(err.message || "Le calcul de l'absentéisme n'a pas abouti.");
            setBilan(null);
        } finally {
            setChargement(false);
        }
    }, [profondeur]);

    useEffect(() => { charger(); }, [charger]);

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Activity className="text-violet-600" size={32} />
                        Absentéisme
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        Arrêts maladie, congés sans solde et absences non justifiées.
                        Les congés annuels et la maternité sont exclus.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="profondeur" className="text-sm text-slate-500">Sur</label>
                    <select
                        id="profondeur"
                        value={profondeur}
                        onChange={(e) => setProfondeur(Number(e.target.value))}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    >
                        {[3, 6, 12, 24].map((n) => (
                            <option key={n} value={n}>{n} mois</option>
                        ))}
                    </select>
                </div>
            </div>

            {chargement && (
                <div className="p-12 text-center text-slate-400">Lecture des absences…</div>
            )}

            {erreur && !chargement && (
                <div className="text-sm rounded-xl p-4 bg-rose-50 text-rose-800 border border-rose-200">
                    {erreur}
                </div>
            )}

            {bilan && !chargement && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Le taux, et de quoi le défendre. Un taux dont on ignore
                        le dénominateur ne se discute pas en réunion. */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6 flex flex-wrap items-end gap-8">
                            <div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    Taux d'absentéisme
                                </p>
                                <h3 className="text-5xl font-black text-slate-900 mt-1">
                                    {pourcent(bilan.taux)}
                                </h3>
                            </div>
                            <div className="text-sm text-slate-600 space-y-1 flex-1 min-w-[280px]">
                                <p>
                                    <span className="font-semibold">{bilan.joursAbsence.toLocaleString('fr-FR')}</span>
                                    {' '}jour(s) d'absence sur{' '}
                                    <span className="font-semibold">{bilan.joursTheoriques.toLocaleString('fr-FR')}</span>
                                    {' '}jours théoriques, pour {bilan.effectif} salarié(s).
                                </p>
                                <p className="text-xs text-slate-500">{bilan.formule}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* La distinction qui fait tout l'écran. */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm border-l-4 border-l-rose-400">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-black flex items-center gap-2">
                                    <HeartPulse size={18} className="text-rose-500" />
                                    Arrêts longs
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Plus de {bilan.perimetre.seuilArretCourt} jours. Relèvent de la santé au travail.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-black text-slate-900">
                                    {bilan.arretsLongs}
                                    <span className="text-base font-medium text-slate-400 ml-2">
                                        arrêt(s), {bilan.joursArretsLongs.toLocaleString('fr-FR')} jour(s)
                                    </span>
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm border-l-4 border-l-amber-400">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-black flex items-center gap-2">
                                    <Repeat size={18} className="text-amber-500" />
                                    Absences courtes
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {bilan.perimetre.seuilArretCourt} jours ou moins. Leur répétition est un signal d'encadrement.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-black text-slate-900">
                                    {bilan.arretsCourts}
                                    <span className="text-base font-medium text-slate-400 ml-2">absence(s)</span>
                                </p>
                                <p className="text-sm text-slate-600 mt-2">
                                    {bilan.salariesEnRepetition === 0
                                        ? 'Aucun salarié ne cumule des absences courtes répétées.'
                                        : `${bilan.salariesEnRepetition} salarié(s) cumulent au moins `
                                          + `${bilan.perimetre.seuilRepetition} absences courtes.`}
                                </p>
                                {bilan.retards > 0 && (
                                    <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
                                        <Clock size={12} className="mt-0.5 shrink-0" />
                                        {bilan.retards} retard(s) enregistré(s) sur la période. Ils ne sont
                                        pas comptés dans le taux : arriver en retard n'est pas s'absenter.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Par service */}
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-base font-black">Par service</CardTitle>
                                <CardDescription className="text-xs">
                                    Deux services au même taux peuvent appeler des conversations opposées :
                                    regarder la colonne des causes, pas seulement celle du taux.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {bilan.parService.length === 0 ? (
                                    <p className="p-6 text-sm text-slate-500">Aucun service renseigné.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                                    <th className="px-6 py-2 font-bold">Service</th>
                                                    <th className="px-3 py-2 font-bold text-right">Taux</th>
                                                    <th className="px-3 py-2 font-bold text-right">Longs</th>
                                                    <th className="px-6 py-2 font-bold text-right">Courtes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {bilan.parService.map((s) => (
                                                    <tr key={s.service} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-2.5 font-medium text-slate-800">{s.service}</td>
                                                        <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                                                            {pourcent(s.taux)}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-mono text-rose-600">
                                                            {s.arretsLongs || '—'}
                                                        </td>
                                                        <td className="px-6 py-2.5 text-right font-mono text-amber-600">
                                                            {s.arretsCourts || '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Par mois */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-black">Par mois</CardTitle>
                                <CardDescription className="text-xs">
                                    {bilan.fiabilite.tendanceAffichable
                                        ? 'Un arrêt à cheval sur deux mois compte dans les deux.'
                                        : bilan.fiabilite.motif}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[280px]">
                                {bilan.fiabilite.tendanceAffichable ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={bilan.parMois} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="libelle"
                                                axisLine={false} tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10 }}
                                                tickFormatter={(v) => String(v).split(' ')[0].slice(0, 4)}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit=" %" />
                                            <RechartsTooltip
                                                formatter={(v, n, p) => [`${v} % — ${p.payload.jours} jour(s)`, 'Absentéisme']}
                                                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                                            />
                                            <Bar dataKey="taux" radius={[6, 6, 0, 0]} barSize={22}>
                                                {bilan.parMois.map((m) => (
                                                    <Cell key={m.mois} fill={m.taux > 0 ? '#8b5cf6' : '#e2e8f0'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center gap-2 px-6">
                                        <Info size={20} className="text-slate-300" />
                                        <p className="text-sm text-slate-500 max-w-sm">{bilan.fiabilite.motif}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Ce qu'il faut savoir avant de citer ce chiffre. */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                Ce que ce taux mesure, et ce qu'il ne mesure pas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-slate-600">
                            <p>
                                <span className="font-semibold text-slate-800">Retenu :</span>{' '}
                                {bilan.perimetre.retenus}.{' '}
                                <span className="font-semibold text-slate-800">Écarté :</span>{' '}
                                {bilan.perimetre.ecartes}.
                            </p>
                            <p className="text-xs text-slate-500">{bilan.perimetre.pourquoi}</p>

                            <p className="text-xs text-amber-700 flex items-start gap-1.5 pt-1">
                                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                                {bilan.reserve}
                            </p>

                            {bilan.fiabilite.typesInconnus.length > 0 && (
                                <p className="text-xs text-amber-700 flex items-start gap-1.5">
                                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                                    Type(s) de congé non classé(s) : {bilan.fiabilite.typesInconnus.join(', ')}.
                                    Ils ne sont ni comptés ni écartés sciemment ; à trancher avant de publier ce taux.
                                </p>
                            )}

                            {bilan.fiabilite.datesIncoherentes > 0 && (
                                <p className="text-xs text-amber-700 flex items-start gap-1.5">
                                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                                    {bilan.fiabilite.datesIncoherentes} arrêt(s) portent une date de fin
                                    antérieure à leur date de début.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
