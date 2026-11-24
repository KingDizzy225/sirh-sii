import React, { useMemo } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, UserPlus, TrendingUp, CalendarDays, Sparkles, AlertTriangle,
    Award, Layers, Clock
} from 'lucide-react';
import { calculer } from '../lib/indicateurs.js';

/**
 * Bande d'indicateurs de l'accueil.
 *
 * Tout ce qui s'affiche ici est calculé sur l'effectif que l'écran a chargé —
 * aucun chiffre n'est écrit dans la page. Quand une donnée manque, la vignette
 * l'annonce au lieu d'afficher zéro : « 14 fiches sans date de naissance »
 * n'est pas la même information qu'une pyramide des âges vide.
 */

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444', '#84cc16'];
const nombre = (n) => (n === null || n === undefined ? '—' : new Intl.NumberFormat('fr-FR').format(n));

function Vignette({ icone: Icone, libelle, valeur, unite, precision, ton = 'indigo', alerte = false }) {
    const tons = {
        indigo: 'from-indigo-50 to-white text-indigo-600 border-indigo-100',
        emerald: 'from-emerald-50 to-white text-emerald-600 border-emerald-100',
        amber: 'from-amber-50 to-white text-amber-600 border-amber-100',
        rose: 'from-rose-50 to-white text-rose-600 border-rose-100',
        sky: 'from-sky-50 to-white text-sky-600 border-sky-100',
        violet: 'from-violet-50 to-white text-violet-600 border-violet-100'
    };
    return (
        <div className={`rounded-2xl border bg-gradient-to-br p-4 transition-shadow hover:shadow-md ${tons[ton] || tons.indigo}`}>
            <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{libelle}</p>
                <Icone className="w-4 h-4 shrink-0" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
                {valeur}
                {unite && <span className="text-sm font-bold text-slate-400 ml-1">{unite}</span>}
            </p>
            {precision && (
                <p className={`text-[11px] mt-1 leading-snug ${alerte ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
                    {precision}
                </p>
            )}
        </div>
    );
}

function Carte({ titre, sousTitre, enfants, className = '' }) {
    return (
        <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
            <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-800">{titre}</h3>
                {sousTitre && <p className="text-[11px] text-slate-500 mt-0.5">{sousTitre}</p>}
            </div>
            {enfants}
        </div>
    );
}

export function IndicateursRH({ salaries }) {
    const k = useMemo(() => calculer(salaries), [salaries]);

    if (k.effectif === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Aucun salarié actif : les indicateurs n'ont rien à mesurer.
            </div>
        );
    }

    const departements = k.parDepartement.slice(0, 8).map((d, i) => ({
        nom: d.libelle.length > 22 ? `${d.libelle.slice(0, 21)}…` : d.libelle,
        nombre: d.nombre,
        fill: PALETTE[i % PALETTE.length]
    }));
    const pyramide = k.pyramide.filter((t) => t.nombre > 0);

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Indicateurs de l'effectif</h2>
                    <p className="text-xs text-slate-500">
                        Calculés sur les {nombre(k.effectif)} salariés actifs chargés par cet écran.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                <Vignette icone={Users} libelle="Effectif actif" valeur={nombre(k.effectif)}
                    precision={`${nombre(k.talents.encadrants)} encadrant(s)`} />
                <Vignette icone={UserPlus} libelle="Arrivées 12 mois" valeur={nombre(k.arrivees12)} ton="emerald"
                    precision={`dont ${nombre(k.arriveesMois)} ce mois-ci`} />
                <Vignette icone={TrendingUp} libelle="Rotation" valeur={k.rotationPct ?? '—'} unite="%" ton="amber"
                    precision={`${nombre(k.departs12)} départ(s) sur 12 mois`} />
                <Vignette icone={Clock} libelle="Ancienneté médiane" valeur={k.ancienneteMediane ?? '—'} unite="ans" ton="sky"
                    precision={k.sansDateEmbauche > 0 ? `${k.sansDateEmbauche} fiche(s) sans date d'embauche` : 'sur toutes les fiches'}
                    alerte={k.sansDateEmbauche > 0} />
                <Vignette icone={CalendarDays} libelle="Congés dus" valeur={nombre(k.conges.joursDus)} unite="j" ton="violet"
                    precision={`${k.conges.moyenne ?? '—'} jour(s) par salarié`} />
                <Vignette icone={AlertTriangle} libelle="Risque de départ élevé" valeur={nombre(k.talents.risqueEleve)}
                    ton={k.talents.risqueEleve > 0 ? 'rose' : 'emerald'}
                    precision={k.talents.risquePct !== null ? `${k.talents.risquePct} % de l'effectif` : null}
                    alerte={k.talents.risqueEleve > 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Carte titre="Effectif sur douze mois" sousTitre="Présents à la fin de chaque mois"
                    className="lg:col-span-2"
                    enfants={
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={k.courbeEffectif} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="degradeEffectif" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                                    <XAxis dataKey="libelle" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                                        formatter={(v) => [`${v} salarié(s)`, 'Effectif']}
                                    />
                                    <Area type="monotone" dataKey="effectif" stroke="#6366f1" strokeWidth={2.5}
                                        fill="url(#degradeEffectif)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    } />

                <Carte titre="Pyramide des âges"
                    sousTitre={k.sansDateNaissance > 0
                        ? `${k.sansDateNaissance} fiche(s) sans date de naissance, hors décompte`
                        : 'sur toutes les fiches'}
                    enfants={
                        pyramide.length === 0
                            ? <p className="text-xs text-slate-400 py-10 text-center">Aucune date de naissance renseignée.</p>
                            : (
                                <div className="h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pyramide} dataKey="nombre" nameKey="libelle"
                                                innerRadius={42} outerRadius={72} paddingAngle={3}>
                                                {pyramide.map((t, i) => (
                                                    <Cell key={t.libelle} fill={PALETTE[i % PALETTE.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                                                formatter={(v, n) => [`${v} salarié(s)`, n]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )
                    } />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Carte titre="Effectif par département" sousTitre="Les huit premiers"
                    className="lg:col-span-2"
                    enfants={
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={departements} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="nom" width={150}
                                        tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                                        formatter={(v) => [`${v} salarié(s)`, 'Effectif']}
                                    />
                                    <Bar dataKey="nombre" radius={[0, 8, 8, 0]} barSize={16}>
                                        {departements.map((d) => <Cell key={d.nom} fill={d.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    } />

                <div className="space-y-4">
                    <Carte titre="Parité"
                        sousTitre={k.parite.nonRenseigne > 0
                            ? `${k.parite.nonRenseigne} fiche(s) sans genre, exclues du ratio`
                            : 'sur toutes les fiches'}
                        enfants={
                            <div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black text-slate-900 tabular-nums">
                                        {k.parite.partFemmesPct ?? '—'}<span className="text-base text-slate-400">%</span>
                                    </span>
                                    <span className="text-xs text-slate-500 mb-1.5">de femmes</span>
                                </div>
                                <div className="mt-3 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                                    <div className="bg-pink-400 h-full" style={{ width: `${k.parite.partFemmesPct || 0}%` }} />
                                    <div className="bg-sky-400 h-full flex-1" />
                                </div>
                                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                                    <span>{nombre(k.parite.femmes)} femmes</span>
                                    <span>{nombre(k.parite.hommes)} hommes</span>
                                </div>
                            </div>
                        } />

                    <Carte titre="Compétences"
                        sousTitre={`${nombre(k.competences.couverture)} salarié(s) ont au moins une compétence relevée`}
                        enfants={
                            <div className="space-y-2">
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-2xl font-black text-slate-900 tabular-nums">{nombre(k.competences.distinctes)}</p>
                                        <p className="text-[11px] text-slate-500">compétences distinctes</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-emerald-600 tabular-nums">{nombre(k.competences.experts)}</p>
                                        <p className="text-[11px] text-slate-500">niveaux experts</p>
                                    </div>
                                </div>
                                {k.competences.fragiles.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Tenues par un seul expert, ou aucun
                                        </p>
                                        <ul className="mt-1 space-y-0.5">
                                            {k.competences.fragiles.slice(0, 3).map((c) => (
                                                <li key={c.libelle} className="text-[11px] text-slate-600 truncate">
                                                    {c.libelle} <span className="text-slate-400">— {c.experts} expert(s)</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        } />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Vignette icone={Sparkles} libelle="Relève immédiate" valeur={nombre(k.talents.releveImmediate)} ton="emerald"
                    precision="prêts à prendre un poste" />
                <Vignette icone={Layers} libelle="Postes distincts" valeur={nombre(k.parPoste.length)}
                    precision={`pour ${nombre(k.parDepartement.length)} département(s)`} />
                <Vignette icone={Award} libelle="Compétences relevées" valeur={nombre(k.competences.relevees)} ton="violet"
                    precision={`${nombre(k.competences.distinctes)} distinctes`} />
                <Vignette icone={UserPlus} libelle="Intégrations en cours" valeur={nombre(k.talents.integrationEnCours)} ton="sky"
                    precision="parcours d'accueil non terminé" />
            </div>
        </section>
    );
}
