import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldX, Loader2, User, RotateCw, CalendarClock, Repeat, Check, X, ClipboardList, Plus, Trash2, CheckCheck, Wallet, FileText, AlarmClock, PhoneCall, ChevronDown } from 'lucide-react';
import { CLE_BADGE } from './Pointer';
import { useIdentite, logoUrl, degradeMarque } from '../lib/identite.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Badge numérique : la carte du porteur, et la page de vérification du tiers.
 *
 * La carte se retourne : au recto l'identité, au verso le QR. Le QR ne mène pas
 * à cette carte mais à la vérification, servie par le serveur à l'instant du
 * scan — une capture d'écran de la carte ne passe donc pas pour une
 * vérification.
 */

const photoDe = (jeton) => `${API_URL}/api/public/badges/${jeton}/photo`;
const date = (d) => new Date(d).toLocaleDateString('fr-FR');

function Photo({ jeton, disponible, taille = 'w-32 h-32' }) {
    const [echec, setEchec] = useState(false);
    if (!disponible || echec) {
        return <div className={`${taille} rounded-full bg-white/20 flex items-center justify-center`}><User className="w-1/2 h-1/2 text-white/70" /></div>;
    }
    return <img src={photoDe(jeton)} alt="" onError={() => setEchec(true)} className={`${taille} rounded-full object-cover ring-4 ring-white/80`} />;
}

export function BadgeCarte() {
    const { jeton } = useParams();
    const [badge, setBadge] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [verso, setVerso] = useState(false);
    const identite = useIdentite();
    const [maintenant, setMaintenant] = useState(new Date());

    useEffect(() => {
        fetch(`${API_URL}/api/public/badges/${jeton}`, { cache: 'no-store' })
            .then(async (res) => {
                const corps = await res.json().catch(() => ({}));
                if (res.ok && corps.valide) {
                    setBadge(corps);
                    // Le téléphone se souvient du badge : scanner l'écran d'agence suffira pour pointer.
                    try { localStorage.setItem(CLE_BADGE, jeton); } catch { /* navigation privée */ }
                }
                else setErreur(corps.motif || corps.error || 'Badge indisponible.');
            })
            .catch(() => setErreur('Connexion impossible. Vérifiez le réseau et réessayez.'));
    }, [jeton]);

    // L'heure qui défile montre que la carte est vivante, pas une image figée.
    useEffect(() => {
        const t = setInterval(() => setMaintenant(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    if (erreur) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center gap-4">
                <ShieldX className="w-16 h-16 text-slate-400" />
                <p className="text-slate-700 max-w-sm">{erreur}</p>
            </div>
        );
    }
    if (!badge) {
        return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 gap-6">
            <div className="w-full max-w-sm aspect-[5/8] [perspective:1200px]" onClick={() => setVerso((v) => !v)}>
                <motion.div animate={{ rotateY: verso ? 180 : 0 }} transition={{ duration: 0.6 }}
                    className="relative w-full h-full [transform-style:preserve-3d] cursor-pointer">
                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl overflow-hidden shadow-2xl text-white p-8 flex flex-col" style={{ background: degradeMarque(identite, 160) }}>
                        <div className="flex items-center gap-3">
                            {logoUrl(identite) && <img src={logoUrl(identite)} alt="" className="h-10 w-10 object-contain bg-white rounded-lg p-0.5" />}
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] opacity-90">{badge.organisation}</p>
                        </div>
                        <p className="text-xs opacity-70 mt-1">Carte professionnelle</p>
                        <div className="flex-1 flex flex-col items-center justify-center gap-5">
                            <Photo jeton={jeton} disponible={badge.photo} taille="w-40 h-40" />
                            <div className="text-center">
                                <p className="text-3xl font-bold leading-tight">{badge.prenom}</p>
                                <p className="text-3xl font-bold leading-tight uppercase">{badge.nom}</p>
                                {badge.fonction && <p className="mt-3 text-lg opacity-90">{badge.fonction}</p>}
                                {badge.departement && <p className="text-sm opacity-70">{badge.departement}</p>}
                            </div>
                        </div>
                        <div className="flex items-end justify-between text-xs opacity-80">
                            <div>
                                {badge.matricule && <p>Matricule {badge.matricule}</p>}
                                <p>Valable jusqu'au {date(badge.expireLe)}</p>
                            </div>
                            <p className="tabular-nums text-base font-semibold">{maintenant.toLocaleTimeString('fr-FR')}</p>
                        </div>
                    </div>
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl shadow-2xl bg-white p-8 flex flex-col items-center justify-center gap-5 text-center">
                        <img src={badge.qr} alt="QR de vérification" className="w-64 h-64" />
                        <p className="text-slate-800 font-semibold">Scannez pour vérifier</p>
                        <p className="text-slate-500 text-sm">La vérification s'affiche en direct, avec la photo enregistrée par l'employeur.</p>
                    </div>
                </motion.div>
            </div>
            <p className="text-slate-400 text-sm flex items-center gap-2"><RotateCw className="w-4 h-4" /> Touchez la carte pour la retourner</p>
            <MesCreneaux jeton={jeton} />
            <MonDossier jeton={jeton} />
            <Passations jeton={jeton} />
        </div>
    );
}

export function BadgeVerification() {
    const { jeton } = useParams();
    const [resultat, setResultat] = useState(null);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/public/badges/verifier/${jeton}`, { cache: 'no-store' })
            .then(async (res) => {
                const corps = await res.json().catch(() => null);
                if (corps && typeof corps.valide === 'boolean') setResultat(corps);
                else setErreur(res.ok ? 'Réponse inattendue.' : 'Vérification indisponible.');
            })
            .catch(() => setErreur('Connexion impossible. Réessayez.'));
    }, [jeton]);

    if (erreur) {
        return <div className="min-h-screen flex items-center justify-center p-6 text-slate-600">{erreur}</div>;
    }
    if (!resultat) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-slate-400" /></div>;
    }

    const heure = new Date(resultat.verifieLe).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'medium' });

    if (!resultat.valide) {
        return (
            <div className="min-h-screen bg-rose-600 text-white flex flex-col items-center justify-center p-8 text-center gap-5">
                <ShieldX className="w-24 h-24" />
                <h1 className="text-3xl font-bold">Badge non valide</h1>
                <p className="text-lg max-w-sm opacity-90">
                    Ce badge ne correspond à aucun salarié en activité de {resultat.organisation}.
                </p>
                <p className="text-sm opacity-75">Vérifié le {heure}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-emerald-600 text-white flex flex-col items-center justify-center p-8 text-center gap-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <ShieldCheck className="w-20 h-20" />
            </motion.div>
            <h1 className="text-3xl font-bold">Badge valide</h1>
            <Photo jeton={jeton} disponible={resultat.photo} taille="w-44 h-44" />
            <div>
                <p className="text-2xl font-bold">{resultat.titulaire}</p>
                {resultat.fonction && <p className="text-lg opacity-90">{resultat.fonction}</p>}
                <p className="mt-2 opacity-90">Salarié(e) de {resultat.organisation}</p>
            </div>
            <p className="text-sm bg-white/15 rounded-xl px-4 py-3 max-w-sm">
                Comparez la photo avec la personne en face de vous.<br />Vérifié le {heure}
            </p>
            {!resultat.photo && (
                <p className="text-sm opacity-80 max-w-sm">Aucune photo n'est enregistrée : demandez une pièce d'identité pour confirmer.</p>
            )}
        </div>
    );
}

const jourCourt = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/**
 * Créneaux du salarié et remplacements, sous la carte.
 * Rien ne s'affiche si le salarié n'a aucun créneau et rien à reprendre.
 */
const fcfa = (n) => (n == null ? '—' : new Intl.NumberFormat('fr-CI').format(Math.round(n)) + ' F');
const mois = (d) => new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Bloc repliable : sur un téléphone, tout déplier d'emblée noierait le reste. */
function Bloc({ titre, icone: Icone, resume, enfants, ouvertParDefaut = false }) {
    const [ouvert, setOuvert] = useState(ouvertParDefaut);
    return (
        <section className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <button onClick={() => setOuvert((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left">
                <span className="flex items-center gap-2 text-white font-semibold">
                    <Icone className="w-4 h-4 opacity-80" /> {titre}
                </span>
                <span className="flex items-center gap-2 text-slate-300 text-sm">
                    {resume}
                    <ChevronDown className={`w-4 h-4 transition-transform ${ouvert ? 'rotate-180' : ''}`} />
                </span>
            </button>
            {ouvert && <div className="px-4 pb-4">{enfants}</div>}
        </section>
    );
}

/**
 * Le dossier du salarié : ses droits, ses bulletins expliqués, ses échéances,
 * ses astreintes, et ses attestations.
 *
 * Le portail lui permettait de demander sans rien lui montrer : il remplissait
 * une demande de congés sans connaître son solde, et recevait un bulletin dont
 * l'explication restait de l'autre côté du guichet.
 */
function MonDossier({ jeton }) {
    const [dossier, setDossier] = useState(null);

    useEffect(() => {
        let vivant = true;
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/public/badges/${jeton}/dossier`);
                const corps = await res.json().catch(() => null);
                if (vivant && res.ok && corps && corps.droits) setDossier(corps);
            } catch { /* hors ligne : la carte reste utilisable */ }
        })();
        return () => { vivant = false; };
    }, [jeton]);

    if (!dossier) return null;

    const d = dossier.droits;
    const echeancesProches = (dossier.echeances || []).filter((e) => e.dans === null || e.dans <= 180);

    return (
        <div className="w-full flex flex-col items-center gap-3">
            <Bloc titre="Mes droits" icone={Wallet} ouvertParDefaut
                resume={`${d.conges.solde} jour(s)`}
                enfants={
                    <div className="space-y-3 text-sm text-slate-200">
                        <div>
                            <p className="font-semibold text-white">{d.conges.solde} jour(s) de congés</p>
                            {d.conges.valeurJour != null && (
                                <p className="text-slate-400 text-xs">
                                    soit environ {fcfa(d.conges.solde * d.conges.valeurJour)} — {fcfa(d.conges.valeurJour)} par jour
                                </p>
                            )}
                            {d.conges.detail && (
                                <ul className="mt-1 text-xs text-slate-400 space-y-0.5">
                                    <li>Acquis cette année : {d.conges.detail.acquis} jour(s)</li>
                                    {d.conges.detail.majorationAnciennete > 0 && (
                                        <li>Majoration d'ancienneté : +{d.conges.detail.majorationAnciennete}</li>
                                    )}
                                    {d.conges.detail.majorationEnfants > 0 && (
                                        <li>Majoration pour enfants : +{d.conges.detail.majorationEnfants}</li>
                                    )}
                                    <li>Pris cette année : {d.conges.joursPris} jour(s)</li>
                                </ul>
                            )}
                        </div>
                        {d.anciennete.annees > 0 && (
                            <p>
                                Ancienneté : {d.anciennete.annees} an(s)
                                {d.anciennete.montantMensuel > 0 && (
                                    <span className="text-slate-400">
                                        {' '}— prime de {fcfa(d.anciennete.montantMensuel)} par mois
                                        {!d.anciennete.active && ' (non versée à ce jour)'}
                                    </span>
                                )}
                            </p>
                        )}
                        {d.primeFinAnnee.parametree && d.primeFinAnnee.acquis != null && (
                            <p>
                                Prime de fin d'année {d.primeFinAnnee.annee} : {fcfa(d.primeFinAnnee.acquis)} acquis
                                <span className="text-slate-400"> ({d.primeFinAnnee.moisComptes} mois de présence)</span>
                            </p>
                        )}
                        {d.rappels.length > 0 && d.rappels.map((r) => (
                            <p key={r.id} className="text-amber-300">
                                Rappel à venir : {fcfa(r.total)} — {r.motif}
                            </p>
                        ))}
                    </div>
                } />

            {dossier.bulletins.length > 0 && (
                <Bloc titre="Mes bulletins" icone={FileText}
                    resume={mois(dossier.bulletins[0].periode)}
                    enfants={
                        <div className="space-y-4">
                            {dossier.bulletins.map((b) => (
                                <div key={b.id} className="text-sm">
                                    <p className="font-semibold text-white">
                                        {mois(b.periode)} — net {fcfa(b.net)}
                                    </p>
                                    <ul className="mt-1 space-y-0.5 text-xs">
                                        {b.lignes.map((l, i) => (
                                            <li key={`${b.id}-${i}`} className="flex justify-between gap-3">
                                                <span className="text-slate-300">{l.libelle}</span>
                                                <span className={l.sens === 'debit' ? 'text-rose-300' : 'text-slate-200'}>
                                                    {l.sens === 'debit' ? '−' : ''}{fcfa(l.montant)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    {!b.complet && (
                                        <p className="text-xs text-amber-300 mt-1">
                                            Ce bulletin est antérieur au détail enregistré : certaines lignes manquent.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    } />
            )}

            {echeancesProches.length > 0 && (
                <Bloc titre="Mes échéances" icone={AlarmClock}
                    resume={`${echeancesProches.length}`}
                    enfants={
                        <ul className="space-y-1 text-sm text-slate-200">
                            {echeancesProches.map((e) => (
                                <li key={e.code}>
                                    {e.libelle} — <span className="text-slate-400">{date(e.date)}</span>
                                    {e.precision && <span className="text-slate-400"> · {e.precision}</span>}
                                </li>
                            ))}
                        </ul>
                    } />
            )}

            {dossier.astreintes.length > 0 && (
                <Bloc titre="Mes astreintes" icone={PhoneCall}
                    resume={`${dossier.astreintes.length}`}
                    enfants={
                        <ul className="space-y-1 text-sm text-slate-200">
                            {dossier.astreintes.map((a) => (
                                <li key={a.id}>
                                    {date(a.debut)} → {date(a.fin)} · {a.type}
                                    {a.compensation > 0 && <span className="text-slate-400"> — {fcfa(a.compensation)}</span>}
                                </li>
                            ))}
                        </ul>
                    } />
            )}

        </div>
    );
}

function MesCreneaux({ jeton }) {
    const [espace, setEspace] = useState(null);
    const [message, setMessage] = useState(null);
    const [occupe, setOccupe] = useState(null);

    const charger = React.useCallback(async () => {
        try {
            // Sans options : le serveur répond déjà « no-store ».
            const res = await fetch(`${API_URL}/api/public/badges/${jeton}/espace`);
            const corps = await res.json().catch(() => null);
            if (res.ok && corps && Array.isArray(corps.creneaux)) setEspace(corps);
        } catch { /* hors ligne : la carte reste utilisable */ }
    }, [jeton]);

    useEffect(() => { charger(); }, [charger]);

    // Trois appels écrits en toutes lettres : la vérification des routes lit les
    // adresses dans le code, et ne saurait pas lire un chemin assemblé.
    const proposer = (shiftId, motif) => agir(() => fetch(`${API_URL}/api/public/badges/${jeton}/remplacements`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shiftId, motif }) }), shiftId);
    const retirer = (demandeId, shiftId) => agir(() => fetch(`${API_URL}/api/public/badges/${jeton}/remplacements/${demandeId}/annuler`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }), shiftId);
    const prendre = (demandeId) => agir(() => fetch(`${API_URL}/api/public/badges/${jeton}/remplacements/${demandeId}/accepter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }), demandeId);

    const agir = async (appel, id) => {
        setOccupe(id);
        setMessage(null);
        try {
            const res = await appel();
            const reponse = await res.json().catch(() => ({}));
            setMessage({ ok: res.ok, texte: reponse.message || reponse.error || (res.ok ? 'Fait.' : 'Action impossible.') });
            charger();
        } catch {
            setMessage({ ok: false, texte: 'Pas de connexion.' });
        } finally {
            setOccupe(null);
        }
    };

    if (!espace || (espace.creneaux.length === 0 && espace.aReprendre.length === 0 && espace.mesReprises.length === 0)) return null;

    const ETATS = {
        OUVERTE: 'Proposé à vos collègues',
        ACCEPTEE: 'Repris — en attente de validation',
        REFUSEE: 'Remplacement refusé',
        ECHUE: 'Trop tard pour remplacer'
    };

    return (
        <div className="w-full max-w-sm space-y-4">
            {message && (
                <p className={`text-sm rounded-xl px-4 py-3 ${message.ok ? 'bg-emerald-500/20 text-emerald-100' : 'bg-rose-500/20 text-rose-100'}`}>{message.texte}</p>
            )}

            {espace.creneaux.length > 0 && (
                <section className="bg-white/5 rounded-2xl p-4">
                    <h2 className="text-white font-semibold flex items-center gap-2 mb-3"><CalendarClock className="w-5 h-5 text-orange-400" /> Mes prochains créneaux</h2>
                    <ul className="space-y-2">
                        {espace.creneaux.map((c) => (
                            <li key={c.id} className="bg-white/10 rounded-xl p-3 text-white">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="capitalize">{jourCourt(c.date)} · {c.debut}–{c.fin}</span>
                                    {!c.demande || c.demande.etat === 'REFUSEE' ? (
                                        <button disabled={occupe === c.id} onClick={() => {
                                            const motif = window.prompt('Pourquoi cherchez-vous un remplaçant ? (facultatif)') ?? null;
                                            if (motif !== null) proposer(c.id, motif);
                                        }} className="text-xs bg-orange-500 hover:bg-orange-400 rounded-lg px-3 py-1.5 flex items-center gap-1">
                                            <Repeat className="w-3.5 h-3.5" /> Me faire remplacer
                                        </button>
                                    ) : ['OUVERTE', 'ACCEPTEE'].includes(c.demande.etat) ? (
                                        <button disabled={occupe === c.id} onClick={() => retirer(c.demande.id, c.id)}
                                            className="text-xs bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Retirer</button>
                                    ) : null}
                                </div>
                                {c.demande && (
                                    <p className="text-xs text-slate-300 mt-1">
                                        {ETATS[c.demande.etat] || c.demande.etat}{c.demande.remplacant ? ` · ${c.demande.remplacant}` : ''}
                                        {c.demande.etat === 'REFUSEE' && c.demande.motifRefus ? ` : ${c.demande.motifRefus}` : ''}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {espace.aReprendre.length > 0 && (
                <section className="bg-white/5 rounded-2xl p-4">
                    <h2 className="text-white font-semibold flex items-center gap-2 mb-3"><Repeat className="w-5 h-5 text-emerald-400" /> Créneaux à reprendre</h2>
                    <ul className="space-y-2">
                        {espace.aReprendre.map((d) => (
                            <li key={d.id} className="bg-white/10 rounded-xl p-3 text-white flex items-center justify-between gap-2">
                                <span>
                                    <span className="capitalize block">{jourCourt(d.creneau.date)} · {d.creneau.debut}–{d.creneau.fin}</span>
                                    <span className="text-xs text-slate-300">Pour {d.demandeur}{d.motif ? ` · ${d.motif}` : ''}</span>
                                </span>
                                {d.dejaOccupe ? (
                                    <span className="text-xs text-slate-400">Vous travaillez ce jour-là</span>
                                ) : (
                                    <button disabled={occupe === d.id} onClick={() => prendre(d.id)}
                                        className="text-xs bg-emerald-500 hover:bg-emerald-400 rounded-lg px-3 py-1.5 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Je prends</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {espace.mesReprises.length > 0 && (
                <section className="bg-white/5 rounded-2xl p-4 text-white">
                    <h2 className="font-semibold mb-2">Mes remplacements</h2>
                    <ul className="space-y-1 text-sm">
                        {espace.mesReprises.map((d) => (
                            <li key={d.id} className="capitalize">
                                {jourCourt(d.creneau.date)} · {d.creneau.debut}–{d.creneau.fin} pour {d.demandeur} —{' '}
                                <span className="normal-case">{d.etat === 'VALIDEE' ? 'validé' : 'en attente de validation'}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

const CATEGORIES_PASSATION = { INCIDENT: 'Incident', CLIENT: 'Client à rappeler', CONSIGNE: 'Consigne', MATERIEL: 'Matériel' };
const heureCourte = (d) => new Date(d).toLocaleString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });

/**
 * Passation d'équipe, sous la carte : lire ce qu'a laissé l'équipe précédente,
 * l'acquitter, régler un point, et écrire la sienne en partant.
 */
function Passations({ jeton }) {
    const [donnees, setDonnees] = useState(null);
    const [redaction, setRedaction] = useState(null);
    const [message, setMessage] = useState(null);
    const [envoi, setEnvoi] = useState(false);

    const charger = React.useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/public/badges/${jeton}/passations`);
            const corps = await res.json().catch(() => null);
            if (res.ok && corps && Array.isArray(corps.sites)) setDonnees(corps);
        } catch { /* hors ligne */ }
    }, [jeton]);

    useEffect(() => { charger(); }, [charger]);

    const acquitter = async (id) => {
        await fetch(`${API_URL}/api/public/badges/${jeton}/passations/${id}/acquitter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
        charger();
    };

    const resoudre = async (id) => {
        await fetch(`${API_URL}/api/public/badges/${jeton}/passations/elements/${id}/resoudre`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
        charger();
    };

    const envoyer = async () => {
        setEnvoi(true);
        setMessage(null);
        try {
            const elements = redaction.elements.filter((e) => e.texte.trim());
            const res = await fetch(`${API_URL}/api/public/badges/${jeton}/passations`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workSiteId: redaction.workSiteId, elements })
            });
            const corps = await res.json().catch(() => ({}));
            setMessage({ ok: res.ok, texte: corps.message || corps.error || 'Envoi impossible.' });
            if (res.ok) { setRedaction(null); charger(); }
        } catch {
            setMessage({ ok: false, texte: 'Pas de connexion.' });
        } finally {
            setEnvoi(false);
        }
    };

    if (!donnees || donnees.sites.length === 0) return null;

    return (
        <div className="w-full max-w-sm space-y-4">
            {message && <p className={`text-sm rounded-xl px-4 py-3 ${message.ok ? 'bg-emerald-500/20 text-emerald-100' : 'bg-rose-500/20 text-rose-100'}`}>{message.texte}</p>}
            {donnees.sites.map(({ site, passations, reportes }) => (
                <section key={site.id} className="bg-white/5 rounded-2xl p-4 text-white space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2"><ClipboardList className="w-5 h-5 text-sky-400" /> Passation · {site.nom}</h2>
                        {!redaction && (
                            <button onClick={() => setRedaction({ workSiteId: site.id, elements: [{ categorie: 'CONSIGNE', texte: '' }] })}
                                className="text-xs bg-sky-500 hover:bg-sky-400 rounded-lg px-3 py-1.5 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Écrire</button>
                        )}
                    </div>

                    {redaction?.workSiteId === site.id && (
                        <div className="bg-white/10 rounded-xl p-3 space-y-2">
                            {redaction.elements.map((e, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex gap-2">
                                        <select value={e.categorie} onChange={(ev) => setRedaction((r) => ({ ...r, elements: r.elements.map((x, j) => (j === i ? { ...x, categorie: ev.target.value } : x)) }))}
                                            className="bg-slate-800 rounded-lg px-2 py-1 text-sm flex-1">
                                            {Object.entries(CATEGORIES_PASSATION).map(([code, libelle]) => <option key={code} value={code}>{libelle}</option>)}
                                        </select>
                                        {redaction.elements.length > 1 && (
                                            <button onClick={() => setRedaction((r) => ({ ...r, elements: r.elements.filter((_, j) => j !== i) }))} className="p-1"><Trash2 className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                    <textarea rows={2} maxLength={500} value={e.texte} placeholder="Ce que l'équipe suivante doit savoir"
                                        onChange={(ev) => setRedaction((r) => ({ ...r, elements: r.elements.map((x, j) => (j === i ? { ...x, texte: ev.target.value } : x)) }))}
                                        className="w-full bg-slate-800 rounded-lg px-3 py-2 text-sm" />
                                </div>
                            ))}
                            <div className="flex justify-between gap-2">
                                {redaction.elements.length < 10 && (
                                    <button onClick={() => setRedaction((r) => ({ ...r, elements: [...r.elements, { categorie: 'INCIDENT', texte: '' }] }))}
                                        className="text-xs text-sky-300 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Autre point</button>
                                )}
                                <div className="flex gap-2 ml-auto">
                                    <button onClick={() => setRedaction(null)} className="text-xs bg-white/15 rounded-lg px-3 py-1.5">Annuler</button>
                                    <button disabled={envoi} onClick={envoyer} className="text-xs bg-sky-500 rounded-lg px-3 py-1.5">{envoi ? '…' : 'Transmettre'}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {passations.length === 0 && reportes.length === 0 && <p className="text-sm text-slate-400">Rien de laissé récemment.</p>}

                    {passations.map((p) => (
                        <div key={p.id} className="bg-white/10 rounded-xl p-3">
                            <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                                <span className="capitalize">{p.auteur} · {heureCourte(p.creeLe)}</span>
                                {p.acquitteeParMoi
                                    ? <span className="flex items-center gap-1 text-emerald-300"><CheckCheck className="w-4 h-4" /> Lu</span>
                                    : <button onClick={() => acquitter(p.id)} className="bg-emerald-500 text-white rounded-lg px-2 py-1">J'ai lu</button>}
                            </div>
                            <ul className="space-y-1.5">
                                {p.elements.map((e) => (
                                    <li key={e.id} className={`text-sm flex items-start justify-between gap-2 ${e.resoluLe ? 'opacity-50 line-through' : ''}`}>
                                        <span><span className="text-sky-300 text-xs uppercase mr-1">{e.categorieLibelle}</span>{e.texte}</span>
                                        {!e.resoluLe && <button onClick={() => resoudre(e.id)} title="Réglé" className="shrink-0 p-1"><Check className="w-4 h-4 text-emerald-300" /></button>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {reportes.length > 0 && (
                        <div className="bg-amber-500/15 rounded-xl p-3">
                            <p className="text-xs text-amber-200 mb-2">Toujours ouvert depuis les relèves précédentes</p>
                            <ul className="space-y-1.5">
                                {reportes.map((e) => (
                                    <li key={e.id} className="text-sm flex items-start justify-between gap-2">
                                        <span><span className="text-amber-200 text-xs uppercase mr-1">{e.categorieLibelle}</span>{e.texte}</span>
                                        <button onClick={() => resoudre(e.id)} title="Réglé" className="shrink-0 p-1"><Check className="w-4 h-4 text-emerald-300" /></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            ))}
        </div>
    );
}
