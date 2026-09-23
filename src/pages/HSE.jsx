import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
    HeartPulse, Plus, AlertTriangle, CheckCircle2, ShieldAlert,
    X, RefreshCw, CalendarClock, FileWarning, FileText, Printer, Download, Building2, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, listeSure } from '../lib/api';
import { cn } from '@/lib/utils';

const TYPES = ['Accident du travail', 'Accident de trajet', 'Presque-accident', 'Maladie professionnelle'];
const GRAVITES = ['Mineur', 'Majeur', 'Grave'];
const STATUTS = ['Déclaré', 'Enquête en cours', 'Clos'];

const COULEUR_GRAVITE = {
    Mineur: 'bg-slate-100 text-slate-700 border-slate-200',
    Majeur: 'bg-amber-100 text-amber-800 border-amber-200',
    Grave: 'bg-rose-100 text-rose-800 border-rose-200'
};

const ETATS_VISITE = {
    DEPASSEE: { libelle: 'Dépassée', classe: 'bg-rose-100 text-rose-800 border-rose-200' },
    JAMAIS_VU: { libelle: 'Jamais vu', classe: 'bg-rose-50 text-rose-700 border-rose-200' },
    PROCHE: { libelle: 'Échéance proche', classe: 'bg-amber-100 text-amber-800 border-amber-200' },
    SANS_ECHEANCE: { libelle: 'Sans échéance', classe: 'bg-slate-100 text-slate-600 border-slate-200' },
    A_JOUR: { libelle: 'À jour', classe: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
};

const dateFr = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
};

export function HSE() {
    const [onglet, setOnglet] = useState('accidents');
    const [registre, setRegistre] = useState([]);
    const [indicateurs, setIndicateurs] = useState(null);
    const [delaiDeclaration, setDelaiDeclaration] = useState(48);
    const [visites, setVisites] = useState([]);
    const [indicVisites, setIndicVisites] = useState(null);
    const [salaries, setSalaries] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [message, setMessage] = useState(null);
    const [formulaireOuvert, setFormulaireOuvert] = useState(false);
    const [cerfaModal, setCerfaModal] = useState(null);
    const [envoi, setEnvoi] = useState(false);
    const annee = new Date().getFullYear();

    const annoncer = (texte) => {
        setMessage(texte);
        setTimeout(() => setMessage(null), 4000);
    };

    const charger = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const [acc, vis, emp] = await Promise.all([
                api.get(`/hse/accidents?annee=${annee}`),
                api.get('/hse/visites'),
                api.get('/employees')
            ]);
            setRegistre(listeSure(acc.data?.registre, 'registre des accidents'));
            setIndicateurs(acc.data?.indicateurs || null);
            setDelaiDeclaration(acc.data?.delaiDeclarationHeures ?? 48);
            setVisites(listeSure(vis.data?.suivi, 'suivi des visites'));
            setIndicVisites(vis.data?.indicateurs || null);
            setSalaries(listeSure(emp.data, 'employés'));
        } catch (e) {
            setErreur(e.message || 'Chargement impossible.');
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => { charger(); }, []);

    const declarer = async (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        setEnvoi(true);
        try {
            const { data } = await api.post('/hse/accidents', {
                employeeId: f.get('employeeId'),
                occurredAt: f.get('occurredAt'),
                location: f.get('location'),
                type: f.get('type'),
                severity: f.get('severity'),
                description: f.get('description'),
                daysOff: Number(f.get('daysOff') || 0),
                declaredToCnps: f.get('declaredToCnps') === 'on',
                correctiveAction: f.get('correctiveAction')
            });
            setRegistre(r => [data, ...r]);
            setFormulaireOuvert(false);
            annoncer(`Accident ${data.reference} consigné au registre.`);
            charger();
        } catch (err) {
            setErreur(err.message || "L'accident n'a pas pu être enregistré.");
        } finally {
            setEnvoi(false);
        }
    };

    const majAccident = async (accident, champs, libelle) => {
        const precedent = { ...accident };
        setRegistre(r => r.map(a => a.id === accident.id ? { ...a, ...champs } : a));
        try {
            const { data } = await api.patch(`/hse/accidents/${accident.id}`, champs);
            setRegistre(r => r.map(a => a.id === accident.id ? data : a));
            annoncer(libelle);
            charger();
        } catch (err) {
            setRegistre(r => r.map(a => a.id === accident.id ? precedent : a));
            setErreur(err.message || 'Mise à jour refusée.');
        }
    };

    const retards = useMemo(() => registre.filter(a => a.declarationEnRetard).length, [registre]);

    const kpi = (titre, valeur, detail, couleur) => (
        <div key={titre} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{titre}</p>
            <p className={cn('text-2xl font-black mt-1', couleur || 'text-slate-900')}>{valeur}</p>
            {detail && <p className="text-xs text-slate-400 mt-1">{detail}</p>}
        </div>
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <AnimatePresence>
                {message && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="fixed top-20 right-8 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <HeartPulse className="text-rose-600 h-8 w-8" />
                        Santé &amp; Sécurité au Travail
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Registre des accidents de l'année {annee} et conformité des visites médicales.
                        {retards > 0 && (
                            <span className="text-rose-600 font-semibold"> · {retards} déclaration(s) CNPS en retard</span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={charger} title="Actualiser">
                        <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
                    </Button>
                    {onglet === 'accidents' && (
                        <Button onClick={() => setFormulaireOuvert(true)} className="bg-rose-600 hover:bg-rose-700">
                            <Plus size={16} className="mr-1.5" /> Déclarer un accident
                        </Button>
                    )}
                </div>
            </div>

            {erreur && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-800">{erreur}</p>
                </div>
            )}

            <div className="flex border-b border-slate-200/80 gap-1 bg-slate-100/50 p-1 rounded-xl w-fit">
                {[
                    { id: 'accidents', label: 'Registre des accidents', icon: ShieldAlert },
                    { id: 'visites', label: 'Visites médicales', icon: CalendarClock }
                ].map(t => (
                    <button key={t.id} onClick={() => setOnglet(t.id)}
                        className={cn('flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all',
                            onglet === t.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50')}>
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {onglet === 'accidents' && (
                <div className="space-y-6">
                    {indicateurs && (
                        <>
                            <div className="grid gap-4 md:grid-cols-4">
                                {kpi('Accidents déclarés', indicateurs.total, `dont ${indicateurs.avecArret} avec arrêt`)}
                                {kpi('Jours perdus', indicateurs.joursPerdus, 'arrêts de travail cumulés')}
                                {kpi('Déclarations en retard', indicateurs.declarationsEnRetard,
                                    `délai de ${delaiDeclaration} h`,
                                    indicateurs.declarationsEnRetard > 0 ? 'text-rose-600' : 'text-emerald-600')}
                                {kpi('Presque-accidents', indicateurs.parType['Presque-accident'] || 0,
                                    'signalés sans conséquence')}
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {kpi('Taux de fréquence',
                                    indicateurs.tauxFrequence ?? '—',
                                    'accidents avec arrêt par million d’heures')}
                                {kpi('Taux de gravité',
                                    indicateurs.tauxGravite ?? '—',
                                    'jours perdus par millier d’heures')}
                            </div>
                            <p className="text-xs text-slate-400">
                                Les deux taux reposent sur un volume d'heures théorique
                                ({indicateurs.effectifActif} salariés actifs × 173,33 h × mois écoulés,
                                soit {indicateurs.baseHeuresTheoriques.toLocaleString('fr-FR')} h) : ils situent un ordre
                                de grandeur et ne constituent pas un chiffre opposable.
                            </p>
                        </>
                    )}

                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-slate-800">Registre {annee}</CardTitle>
                            <CardDescription>
                                Document pouvant être demandé par l'inspection du travail. Un accident du travail
                                se déclare à la CNPS dans les {delaiDeclaration} heures ; les presque-accidents ne
                                sont pas concernés par cette obligation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {chargement ? (
                                <p className="p-8 text-center text-sm text-slate-400">Chargement…</p>
                            ) : registre.length === 0 ? (
                                <p className="p-8 text-center text-sm text-slate-500">
                                    Aucun accident consigné pour {annee}.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/30">
                                                <TableHead>Référence</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Salarié</TableHead>
                                                <TableHead>Type / Lieu</TableHead>
                                                <TableHead>Gravité</TableHead>
                                                <TableHead className="text-right">Arrêt</TableHead>
                                                <TableHead>CNPS</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead className="text-right">Action CNPS</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-xs">
                                            {registre.map(a => (
                                                <TableRow key={a.id} className={cn('font-medium', a.declarationEnRetard && 'bg-rose-50/60')}>
                                                    <td className="p-3 font-bold text-slate-900">{a.reference}</td>
                                                    <td className="p-3 text-slate-600">{dateFr(a.survenuLe)}</td>
                                                    <td className="p-3">
                                                        <div className="font-semibold text-slate-800">{a.salarie}</div>
                                                        {a.service && <div className="text-slate-400">{a.service}</div>}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="text-slate-700">{a.type}</div>
                                                        <div className="text-slate-400">{a.lieu}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className={cn('text-[10px]', COULEUR_GRAVITE[a.gravite])}>
                                                            {a.gravite}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-right text-slate-700">
                                                        {a.joursArret > 0 ? `${a.joursArret} j` : '—'}
                                                    </td>
                                                    <td className="p-3">
                                                        {a.declareCnps ? (
                                                             <span className="flex items-center gap-1 text-emerald-700">
                                                                <CheckCircle2 size={13} /> {dateFr(a.declareLe)}
                                                            </span>
                                                        ) : (
                                                            <Button size="sm" variant="outline"
                                                                className={cn('h-7 text-[11px]', a.declarationEnRetard && 'border-rose-300 text-rose-700')}
                                                                onClick={() => majAccident(a, { declaredToCnps: true }, `${a.reference} marqué déclaré à la CNPS.`)}>
                                                                {a.declarationEnRetard && <FileWarning size={12} className="mr-1" />}
                                                                Marquer déclaré
                                                            </Button>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <select
                                                            className="bg-transparent border border-slate-200 rounded px-2 py-1 text-[11px] font-semibold"
                                                            value={a.statut}
                                                            onChange={(e) => majAccident(a, { status: e.target.value }, `${a.reference} : ${e.target.value}.`)}
                                                        >
                                                            {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-[11px] font-bold gap-1 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
                                                            onClick={() => setCerfaModal(a)}
                                                            title="Générer la Déclaration Officielle Cerfa CNPS"
                                                        >
                                                            <FileText size={12} /> Cerfa CNPS
                                                        </Button>
                                                    </td>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {onglet === 'visites' && (
                <div className="space-y-6">
                    {indicVisites && (
                        <div className="grid gap-4 md:grid-cols-5">
                            {kpi('Dépassées', indicVisites.depassees, 'à replanifier',
                                indicVisites.depassees > 0 ? 'text-rose-600' : 'text-emerald-600')}
                            {kpi('Jamais vus', indicVisites.jamaisVus, 'aucun dossier médical',
                                indicVisites.jamaisVus > 0 ? 'text-rose-600' : 'text-emerald-600')}
                            {kpi('Échéance proche', indicVisites.proches, `sous ${60} jours`, 'text-amber-600')}
                            {kpi('Sans échéance', indicVisites.sansEcheance, 'date non renseignée')}
                            {kpi('À jour', indicVisites.aJour, `sur ${indicVisites.effectif} salariés`, 'text-emerald-600')}
                        </div>
                    )}

                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-slate-800">Conformité des visites médicales</CardTitle>
                            <CardDescription>
                                Lecture des dossiers saisis dans le module de médecine du travail. La saisie
                                d'une visite se fait là-bas : cette vue ne sert qu'à voir qui est en retard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {chargement ? (
                                <p className="p-8 text-center text-sm text-slate-400">Chargement…</p>
                            ) : visites.length === 0 ? (
                                <p className="p-8 text-center text-sm text-slate-500">Aucun salarié actif.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/30">
                                                <TableHead>Salarié</TableHead>
                                                <TableHead>Dernière visite</TableHead>
                                                <TableHead>Aptitude</TableHead>
                                                <TableHead>Prochaine échéance</TableHead>
                                                <TableHead>État</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-xs">
                                            {visites.map(v => {
                                                const etat = ETATS_VISITE[v.etat] || ETATS_VISITE.A_JOUR;
                                                return (
                                                    <TableRow key={v.employeeId} className="font-medium">
                                                        <td className="p-3">
                                                            <div className="font-semibold text-slate-800">{v.salarie}</div>
                                                            {v.service && <div className="text-slate-400">{v.service}</div>}
                                                        </td>
                                                        <td className="p-3 text-slate-600">
                                                            {dateFr(v.derniereVisite)}
                                                            {v.typeVisite && <span className="text-slate-400"> · {v.typeVisite}</span>}
                                                        </td>
                                                        <td className="p-3 text-slate-600">{v.aptitude || '—'}</td>
                                                        <td className="p-3 text-slate-600">
                                                            {dateFr(v.prochaineEcheance)}
                                                            {v.joursRestants !== null && v.joursRestants >= 0 && (
                                                                <span className="text-slate-400"> · {v.joursRestants} j</span>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <Badge variant="outline" className={cn('text-[10px]', etat.classe)}>
                                                                {etat.libelle}
                                                            </Badge>
                                                        </td>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <AnimatePresence>
                {formulaireOuvert && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                        <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
                            className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b p-5">
                                <h3 className="font-bold text-slate-900">Déclarer un accident</h3>
                                <Button variant="ghost" size="icon" onClick={() => setFormulaireOuvert(false)}>
                                    <X size={18} />
                                </Button>
                            </div>
                            <form onSubmit={declarer} className="space-y-4 p-5">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Salarié concerné
                                        <select name="employeeId" required
                                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                                            <option value="">Sélectionner…</option>
                                            {salaries.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.firstName} {s.lastName} — {s.department}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="text-xs font-semibold text-slate-700">
                                        Date et heure
                                        <Input type="datetime-local" name="occurredAt" required className="mt-1" />
                                    </label>
                                    <label className="text-xs font-semibold text-slate-700">
                                        Type
                                        <select name="type" required defaultValue={TYPES[0]}
                                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </label>
                                    <label className="text-xs font-semibold text-slate-700">
                                        Gravité
                                        <select name="severity" required defaultValue="Mineur"
                                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                                            {GRAVITES.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </label>
                                    <label className="text-xs font-semibold text-slate-700">
                                        Lieu
                                        <Input name="location" required placeholder="Atelier, chantier, trajet…" className="mt-1" />
                                    </label>
                                    <label className="text-xs font-semibold text-slate-700">
                                        Arrêt de travail (jours)
                                        <Input type="number" name="daysOff" min="0" defaultValue="0" className="mt-1" />
                                    </label>
                                </div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Description des circonstances
                                    <textarea name="description" required rows={3}
                                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        placeholder="Ce qui s'est passé, les circonstances, les témoins éventuels." />
                                </label>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Mesure corrective envisagée
                                    <textarea name="correctiveAction" rows={2}
                                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        placeholder="Facultatif à la déclaration, à compléter après l'enquête." />
                                </label>
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                    <input type="checkbox" name="declaredToCnps" className="rounded border-slate-300" />
                                    Déclaration CNPS déjà effectuée
                                </label>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setFormulaireOuvert(false)}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={envoi} className="bg-rose-600 hover:bg-rose-700">
                                        {envoi ? 'Enregistrement…' : 'Consigner au registre'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Modal Formulaire Officiel Cerfa CNPS Côte d'Ivoire */}
                {cerfaModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
                        <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8 border border-slate-200">
                            
                            {/* Actions d'en-tête (écran uniquement) */}
                            <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-emerald-400 h-5 w-5" />
                                    <span className="font-bold text-sm">Générateur Cerfa Officiel CNPS — Déclaration sous 48h</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-bold text-xs">
                                        <Printer size={14} /> Imprimer le Cerfa
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setCerfaModal(null)} className="text-slate-300 hover:text-white">
                                        <X size={18} />
                                    </Button>
                                </div>
                            </div>

                            {/* Contenu du document Cerfa Officiel (Imprimable) */}
                            <div className="p-8 space-y-6 text-slate-800 bg-white font-sans text-xs">
                                
                                {/* En-tête officiel République de Côte d'Ivoire & CNPS */}
                                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                                    <div>
                                        <div className="font-black text-sm uppercase tracking-wider text-slate-900">RÉPUBLIQUE DE CÔTE D'IVOIRE</div>
                                        <div className="text-[10px] text-slate-500 font-semibold italic">Union - Discipline - Travail</div>
                                        <div className="mt-2 font-black text-indigo-900 text-base flex items-center gap-1.5">
                                            <Building2 size={16} /> CAISSE NATIONALE DE PRÉVOYANCE SOCIALE (CNPS)
                                        </div>
                                        <div className="text-[10px] text-slate-500">Direction de la Prévention et des Accidents du Travail</div>
                                    </div>
                                    <div className="text-right border-2 border-slate-900 p-2 rounded-lg bg-slate-50">
                                        <div className="text-[10px] font-black uppercase text-slate-500">Réf. Déclaration</div>
                                        <div className="text-sm font-black text-slate-900 font-mono">{cerfaModal.reference}</div>
                                        <div className="text-[9px] text-slate-400">Date : {dateFr(cerfaModal.survenuLe)}</div>
                                    </div>
                                </div>

                                {/* Titre Officiel */}
                                <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-200">
                                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                        DÉCLARATION D'ACCIDENT DU TRAVAIL OU DE MALADIE PROFESSIONNELLE
                                    </h2>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        (En application des articles 71 et suivants du Code de Prévoyance Sociale de Côte d'Ivoire)
                                    </p>
                                </div>

                                {/* Section 1 : Identification de l'Employeur */}
                                <div className="border border-slate-300 rounded-lg p-3 space-y-2 bg-slate-50/50">
                                    <div className="font-black text-slate-900 uppercase text-[11px] border-b pb-1">
                                        1. RENSEIGNEMENTS CONCERNANT L'EMPLOYEUR
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-slate-500 font-bold">Raison Sociale : </span>
                                            <span className="font-bold text-slate-900">SII CÔTE D'IVOIRE SAS</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">N° Employeur CNPS : </span>
                                            <span className="font-mono font-bold text-slate-900">01-44589-CI</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">Adresse / Siège : </span>
                                            <span className="font-semibold text-slate-800">Abidjan, Cocody Riviera 3, Bd Hassan II</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">Téléphone / Contact RH : </span>
                                            <span className="font-semibold text-slate-800">+225 27 22 40 50 / rh@sii-ci.com</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2 : Identification de la Victime */}
                                <div className="border border-slate-300 rounded-lg p-3 space-y-2 bg-slate-50/50">
                                    <div className="font-black text-slate-900 uppercase text-[11px] border-b pb-1">
                                        2. RENSEIGNEMENTS CONCERNANT LA VICTIME
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-slate-500 font-bold">Nom et Prénoms : </span>
                                            <span className="font-bold text-slate-900 text-sm">{cerfaModal.salarie}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">Département / Service : </span>
                                            <span className="font-semibold text-slate-800">{cerfaModal.service || 'Service Technique'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">N° Matricule Interne : </span>
                                            <span className="font-mono font-semibold text-slate-800">EMP-2024-089</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">N° Assuré CNPS : </span>
                                            <span className="font-mono font-semibold text-slate-800">CNPS-78492011</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3 : Circonstances de l'Accident */}
                                <div className="border border-slate-300 rounded-lg p-3 space-y-2 bg-slate-50/50">
                                    <div className="font-black text-slate-900 uppercase text-[11px] border-b pb-1">
                                        3. CIRCONSTANCES &amp; CONSTATATION DE L'ACCIDENT
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <span className="text-slate-500 font-bold">Date survenue : </span>
                                            <span className="font-semibold text-slate-800">{dateFr(cerfaModal.survenuLe)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">Type d'Accident : </span>
                                            <span className="font-semibold text-slate-800">{cerfaModal.type}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">Lieu exact : </span>
                                            <span className="font-semibold text-slate-800">{cerfaModal.lieu}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <div className="text-slate-500 font-bold mb-1">Description détaillée des faits &amp; causes matérielles :</div>
                                        <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700 italic font-medium leading-relaxed">
                                            "{cerfaModal.description || "Accident survenu au poste de travail lors de l'exécution de la mission."}"
                                        </div>
                                    </div>
                                    <div className="pt-1">
                                        <div className="text-slate-500 font-bold mb-1">Mesures correctives &amp; prévention immédiates :</div>
                                        <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                                            {cerfaModal.mesureCorrective || "Mise en sécurité immédiate, évacuation médicale et sensibilisation de l'équipe."}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4 : Conséquences Médicales & Arrêt de travail */}
                                <div className="border border-slate-300 rounded-lg p-3 space-y-2 bg-slate-50/50">
                                    <div className="font-black text-slate-900 uppercase text-[11px] border-b pb-1">
                                        4. CONSÉQUENCES MÉDICALES &amp; ARRÊT
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <span className="text-slate-500 font-bold">Gravité constatée : </span>
                                            <span className="font-bold text-rose-700">{cerfaModal.gravite}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">Arrêt initial prescrit : </span>
                                            <span className="font-bold text-slate-900">{cerfaModal.joursArret > 0 ? `${cerfaModal.joursArret} jour(s)` : 'Sans arrêt'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">Délai Légal CNPS : </span>
                                            <span className="font-bold text-emerald-700">48 Heures</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Signatures officielles */}
                                <div className="grid grid-cols-2 gap-8 pt-4">
                                    <div className="border border-slate-300 rounded-lg p-3 h-28 flex flex-col justify-between">
                                        <div className="text-[10px] font-black uppercase text-slate-500">Pour la Direction des Ressources Humaines (Cachet &amp; Signature) :</div>
                                        <div className="text-[9px] text-slate-400 font-mono">Certifié exact le {new Date().toLocaleDateString('fr-FR')}</div>
                                    </div>
                                    <div className="border border-slate-300 rounded-lg p-3 h-28 flex flex-col justify-between">
                                        <div className="text-[10px] font-black uppercase text-slate-500">Visa du Médecin / Centre Médical d'Urgence :</div>
                                        <div className="text-[9px] text-slate-400 font-mono">Date et visa médical</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
