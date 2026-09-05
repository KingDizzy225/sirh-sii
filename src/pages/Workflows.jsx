import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
    Zap, CalendarClock, UserPlus, UserMinus, Bell, PartyPopper,
    Clock, Mail, RefreshCw, AlertTriangle, CheckCircle2, PlayCircle, Info
} from 'lucide-react';
import { api, listeSure } from '../lib/api';
import { cn } from '@/lib/utils';

/**
 * Automatisations réellement en place.
 *
 * Cette page listait auparavant des « recettes » inventées, avec des compteurs
 * d'exécution écrits en dur — « 45 exécutions » — pour des règles qui
 * n'existaient nulle part. Le catalogue ci-dessous décrit ce que le serveur
 * exécute vraiment ; `jobName` fait le lien avec l'historique d'exécution
 * enregistré dans `ScheduledJobRun`.
 */
const AUTOMATISATIONS = [
    {
        jobName: 'LEAVE_ACCRUAL',
        nom: 'Acquisition des congés',
        declencheur: 'Le 1er de chaque mois, à 02h00',
        effet: 'Crédite chaque salarié actif de ses jours de congés du mois.',
        icone: CalendarClock, couleur: 'text-emerald-600'
    },
    {
        jobName: 'DEADLINE_ALERTS',
        nom: "Alertes d'échéances",
        declencheur: 'Chaque jour, à 07h00',
        effet: "Signale fins de contrat, fins de période d'essai et visites médicales à venir.",
        icone: Bell, couleur: 'text-amber-600'
    },
    {
        jobName: 'PENDING_REMINDERS',
        nom: 'Relance des demandes en attente',
        declencheur: "Chaque jour, à 08h00",
        effet: 'Relance les validateurs sur les congés, notes de frais et acomptes sans réponse.',
        icone: Clock, couleur: 'text-sky-600'
    },
    {
        jobName: 'TIMELOG_ANOMALIES',
        nom: 'Anomalies de pointage',
        declencheur: 'Chaque jour, à 06h00, sur la veille close',
        effet: "Repère les journées restées ouvertes faute de pointage de sortie.",
        icone: AlertTriangle, couleur: 'text-rose-600'
    },
    {
        jobName: 'CELEBRATIONS',
        nom: 'Célébrations du jour',
        declencheur: 'Chaque jour, à 07h30',
        effet: 'Annonce anniversaires de naissance et d’ancienneté.',
        icone: PartyPopper, couleur: 'text-fuchsia-600'
    },
    {
        jobName: 'WEEKLY_DIGEST',
        nom: 'Récapitulatif hebdomadaire',
        declencheur: 'Chaque lundi, à 08h00',
        effet: "Envoie à la RH l'état des demandes à traiter et des échéances de la semaine.",
        icone: Mail, couleur: 'text-indigo-600'
    }
];

/**
 * Automatisations déclenchées par un événement, non par l'horloge. Elles
 * n'apparaissent pas dans l'historique des traitements planifiés : elles
 * s'exécutent au moment de l'action, et sont listées pour que le tableau des
 * automatisations soit complet.
 */
const SUR_EVENEMENT = [
    {
        nom: "Parcours d'intégration",
        declencheur: "À la création d'une fiche salarié",
        effet: "Crée les formalités d'arrivée selon le parcours actif, ou le socle livré.",
        lien: '/workflow-builder', lienLibelle: 'Modifier le parcours',
        icone: UserPlus, couleur: 'text-emerald-600'
    },
    {
        nom: 'Parcours de départ',
        declencheur: "À l'ouverture d'un dossier de départ",
        effet: 'Crée les formalités de sortie et prépare le décompte final.',
        lien: '/offboarding', lienLibelle: 'Voir les départs',
        icone: UserMinus, couleur: 'text-amber-600'
    },
    {
        nom: 'Notification des décisions',
        declencheur: "À chaque validation ou refus d'une demande",
        effet: 'Informe le salarié concerné, en notification et par email si le SMTP est configuré.',
        icone: Bell, couleur: 'text-sky-600'
    }
];

const dateHeure = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleString('fr-FR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
};

export function Workflows() {
    const [executions, setExecutions] = useState([]);
    const [planificationActive, setPlanificationActive] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [lancement, setLancement] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [message, setMessage] = useState(null);

    const charger = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const { data } = await api.get('/jobs/status');
            setExecutions(listeSure(data?.executions, 'exécutions'));
            setPlanificationActive(data?.planificationActive ?? null);
        } catch (e) {
            setErreur(e.message || 'Chargement impossible.');
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => { charger(); }, []);

    const lancer = async () => {
        setLancement(true);
        setErreur(null);
        try {
            await api.post('/jobs/run', {});
            setMessage('Traitements dus exécutés. Ceux déjà passés pour la période ne sont pas rejoués.');
            setTimeout(() => setMessage(null), 5000);
            charger();
        } catch (e) {
            setErreur(e.message || "L'exécution a échoué.");
        } finally {
            setLancement(false);
        }
    };

    // Dernière exécution connue de chaque traitement.
    const derniere = useMemo(() => {
        const m = new Map();
        for (const e of executions) {
            if (!m.has(e.jobName)) m.set(e.jobName, e);
        }
        return m;
    }, [executions]);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            {message && (
                <div className="fixed top-20 right-8 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
                    {message}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Zap className="h-8 w-8 text-amber-500" />
                        Automatisations
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Ce que l'application exécute d'elle-même, et quand elle l'a fait pour la dernière fois.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={charger} title="Actualiser">
                        <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
                    </Button>
                    <Button onClick={lancer} disabled={lancement}>
                        <PlayCircle size={16} className="mr-1.5" />
                        {lancement ? 'Exécution…' : 'Exécuter les traitements dus'}
                    </Button>
                </div>
            </div>

            {erreur && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-800">{erreur}</p>
                </div>
            )}

            {planificationActive === false && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-900">
                        La planification est désactivée sur ce serveur
                        (<code>DISABLE_SCHEDULED_JOBS</code>). Aucun de ces traitements ne se
                        déclenchera de lui-même ; le bouton ci-dessus reste utilisable.
                    </p>
                </div>
            )}

            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-base">Traitements planifiés</CardTitle>
                    <CardDescription>
                        Déclenchés par l'horloge du serveur. Une période déjà traitée n'est jamais
                        rejouée, y compris après un redémarrage.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {AUTOMATISATIONS.map(a => {
                        const exec = derniere.get(a.jobName);
                        const Icone = a.icone;
                        return (
                            <div key={a.jobName} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                                <div className="mt-0.5 shrink-0"><Icone size={18} className={a.couleur} /></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm text-slate-800">{a.nom}</span>
                                        <Badge variant="outline" className="text-[10px] text-slate-500">{a.declencheur}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{a.effet}</p>
                                    {exec?.details && (
                                        <p className="text-[11px] text-slate-400 mt-1 truncate">{exec.details}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    {exec ? (
                                        <>
                                            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                                                <CheckCircle2 size={12} /> {dateHeure(exec.runAt)}
                                            </span>
                                            <span className="text-[10px] text-slate-400">période {exec.period}</span>
                                        </>
                                    ) : (
                                        // « Jamais exécuté » et « exécuté sans rien faire » sont
                                        // deux états distincts : le premier peut signaler un
                                        // serveur qui ne tourne pas, le second est normal.
                                        <span className="text-[11px] text-slate-400">
                                            {chargement ? '…' : 'jamais exécuté'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-base">Déclenchées par un événement</CardTitle>
                    <CardDescription>
                        Exécutées au moment de l'action, elles n'apparaissent donc pas dans
                        l'historique des traitements planifiés.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {SUR_EVENEMENT.map(a => {
                        const Icone = a.icone;
                        return (
                            <div key={a.nom} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                                <div className="mt-0.5 shrink-0"><Icone size={18} className={a.couleur} /></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm text-slate-800">{a.nom}</span>
                                        <Badge variant="outline" className="text-[10px] text-slate-500">{a.declencheur}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{a.effet}</p>
                                </div>
                                {a.lien && (
                                    <a href={a.lien}
                                        className="text-[11px] font-semibold text-indigo-600 hover:underline shrink-0 mt-1">
                                        {a.lienLibelle}
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {executions.length > 0 && (
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-base">Vingt dernières exécutions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1.5">
                            {executions.map(e => (
                                <div key={e.id} className="flex items-center gap-3 text-xs py-1 border-b border-slate-100 last:border-0">
                                    <span className="font-mono text-slate-400 w-32 shrink-0">{dateHeure(e.runAt)}</span>
                                    <span className="font-semibold text-slate-700 w-48 shrink-0 truncate">
                                        {AUTOMATISATIONS.find(a => a.jobName === e.jobName)?.nom || e.jobName}
                                    </span>
                                    <span className="text-slate-500 truncate">{e.details || '—'}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500">
                    Cette page listait auparavant des règles qui n'existaient nulle part, assorties
                    de compteurs d'exécution écrits en dur. Elle ne décrit désormais que des
                    automatisations réellement en place, avec leur dernière exécution enregistrée.
                </p>
            </div>
        </div>
    );
}
