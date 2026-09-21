import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { FileBarChart, AlertTriangle, HelpCircle } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Bilan social annuel.
 *
 * Chaque indicateur porte sa définition : un effectif « à fin d'exercice » et
 * un effectif « moyen » ne donnent pas le même nombre, et un taux
 * d'absentéisme change du simple au double selon ce qu'on y met. Le lecteur
 * doit savoir ce qu'il compare.
 */

const nombre = (n) => (n == null ? '—' : new Intl.NumberFormat('fr-CI').format(n));
const argent = (n) => (n == null ? '—' : new Intl.NumberFormat('fr-CI').format(Math.round(n)) + ' F');
const pct = (n) => (n == null ? '—' : `${n} %`);

function Indicateur({ libelle, valeur, precision, definition }) {
    return (
        <div className="py-3 flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                    {libelle}
                    {definition && (
                        <span title={definition}><HelpCircle className="w-3.5 h-3.5 text-slate-400" /></span>
                    )}
                </p>
                {precision && <p className="text-xs text-slate-500">{precision}</p>}
            </div>
            <p className="text-lg font-semibold text-slate-900 shrink-0">{valeur}</p>
        </div>
    );
}

export function BilanSocial() {
    const [donnees, setDonnees] = useState(null);
    const [annee, setAnnee] = useState(new Date().getFullYear() - 1);
    const [erreur, setErreur] = useState(null);

    const charger = useCallback(async (exercice) => {
        try {
            const res = await api.get(`/bilan-social?annee=${exercice}`);
            setDonnees(res?.data && res.data.effectifs ? res.data : null);
        } catch (err) {
            setErreur(err.message || 'Lecture impossible.');
        }
    }, []);

    useEffect(() => { charger(annee); }, [charger, annee]);

    const d = donnees;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileBarChart className="w-6 h-6 text-orange-600" /> Bilan social
                    </h1>
                    <p className="text-slate-500 mt-1">Les chiffres de l'exercice, rassemblés une fois pour toutes.</p>
                </div>
                <input type="number" value={annee} onChange={(e) => setAnnee(Number(e.target.value))}
                    className="w-28 rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            {erreur && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{erreur}</div>
            )}

            {d && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{d.avertissement}</span>
                </div>
            )}

            {d?.reserves?.length > 0 && (
                <Card className="border-amber-200">
                    <CardHeader className="pb-3"><CardTitle className="text-base text-amber-900">Réserves</CardTitle></CardHeader>
                    <CardContent className="pt-0">
                        <ul className="text-sm text-amber-900 space-y-1 list-disc pl-5">
                            {d.reserves.map((r) => <li key={r}>{r}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {d && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Effectifs</CardTitle></CardHeader>
                        <CardContent className="divide-y pt-0">
                            <Indicateur libelle="À fin d'exercice" valeur={nombre(d.effectifs.finExercice)} definition={d.definitions.effectifFin} />
                            <Indicateur libelle="Effectif moyen" valeur={nombre(d.effectifs.moyen)} definition={d.definitions.effectifMoyen} />
                            <Indicateur libelle="Part des femmes" valeur={pct(d.effectifs.partFemmes)}
                                precision={`${d.effectifs.femmes} femmes, ${d.effectifs.hommes} hommes`} />
                            <div className="py-3">
                                <p className="text-sm font-medium text-slate-800 mb-1">Par contrat</p>
                                <ul className="text-sm text-slate-600 space-y-0.5">
                                    {d.effectifs.parContrat.map((r) => (
                                        <li key={r.libelle} className="flex justify-between"><span>{r.libelle}</span><span>{r.nombre}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Mouvements</CardTitle></CardHeader>
                        <CardContent className="divide-y pt-0">
                            <Indicateur libelle="Entrées" valeur={nombre(d.mouvements.entrees)} definition={d.definitions.entrees} />
                            <Indicateur libelle="Sorties" valeur={nombre(d.mouvements.sorties)} definition={d.definitions.sorties} />
                            <Indicateur libelle="Rotation" valeur={pct(d.mouvements.rotationPct)} definition={d.definitions.rotation} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Absentéisme</CardTitle></CardHeader>
                        <CardContent className="divide-y pt-0">
                            <Indicateur libelle="Taux" valeur={pct(d.absenteisme.tauxPct)} definition={d.definitions.absenteisme} />
                            <Indicateur libelle="Jours de maladie" valeur={nombre(d.absenteisme.joursMaladie)} />
                            <Indicateur libelle="Absences non justifiées" valeur={nombre(d.absenteisme.absencesNonJustifiees)} />
                            <Indicateur libelle="Congés payés pris" valeur={nombre(d.absenteisme.joursCongesPayes)}
                                precision="Exclus du taux d'absentéisme" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Formation</CardTitle></CardHeader>
                        <CardContent className="divide-y pt-0">
                            <Indicateur libelle="Heures" valeur={nombre(d.formation.heures)} definition={d.definitions.formation} />
                            <Indicateur libelle="Par salarié" valeur={nombre(d.formation.heuresParSalarie)} />
                            <Indicateur libelle="Salariés formés" valeur={nombre(d.formation.salariesFormes)} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Sécurité</CardTitle></CardHeader>
                        <CardContent className="divide-y pt-0">
                            <Indicateur libelle="Accidents du travail" valeur={nombre(d.securite.accidents)} definition={d.definitions.accidents} />
                            <Indicateur libelle="Dont graves" valeur={nombre(d.securite.graves)} />
                            <Indicateur libelle="Jours d'arrêt" valeur={nombre(d.securite.joursArret)} />
                            <Indicateur libelle="Non déclarés à la CNPS" valeur={nombre(d.securite.nonDeclares)} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Rémunérations</CardTitle></CardHeader>
                        <CardContent className="divide-y pt-0">
                            <Indicateur libelle="Masse salariale brute" valeur={argent(d.remuneration.masseSalarialeBrute)}
                                definition={d.definitions.masseSalariale} precision={`${d.remuneration.bulletins} bulletin(s)`} />
                            <Indicateur libelle="Charges patronales" valeur={argent(d.remuneration.chargesPatronales)} />
                            <Indicateur libelle="Écart de rémunération" valeur={pct(d.remuneration.ecartPct)}
                                definition={d.definitions.ecartRemuneration}
                                precision={`H ${argent(d.remuneration.salaireMoyenHommes)} · F ${argent(d.remuneration.salaireMoyenFemmes)}`} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
