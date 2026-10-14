import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Cake, Megaphone, Heart, Wallet, WifiOff, MonitorOff, BookHeart, ScanLine, ClipboardList, PartyPopper, Trophy, Sparkles, Award } from 'lucide-react';
import { useIdentite, logoUrl } from '../lib/identite.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ConfettisOverlay() {
    const particules = [
        { c: 'bg-amber-400', l: '5%', d: 0, s: 14 },
        { c: 'bg-rose-500', l: '12%', d: 0.4, s: 18 },
        { c: 'bg-orange-400', l: '20%', d: 0.2, s: 16 },
        { c: 'bg-emerald-400', l: '28%', d: 0.7, s: 12 },
        { c: 'bg-sky-400', l: '35%', d: 0.1, s: 15 },
        { c: 'bg-purple-400', l: '42%', d: 0.5, s: 14 },
        { c: 'bg-pink-400', l: '50%', d: 0.3, s: 18 },
        { c: 'bg-yellow-300', l: '58%', d: 0.8, s: 13 },
        { c: 'bg-orange-500', l: '65%', d: 0.2, s: 15 },
        { c: 'bg-teal-400', l: '72%', d: 0.6, s: 12 },
        { c: 'bg-indigo-400', l: '80%', d: 0.4, s: 16 },
        { c: 'bg-rose-400', l: '88%', d: 0.1, s: 14 },
        { c: 'bg-amber-300', l: '95%', d: 0.7, s: 15 },
    ];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {particules.map((p, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -40, opacity: 1, rotate: 0 }}
                    animate={{ y: ['0vh', '110vh'], rotate: [0, 720], x: [0, (i % 2 === 0 ? 30 : -30), 0] }}
                    transition={{ repeat: Infinity, duration: 4.5 + (i % 3), delay: p.d, ease: 'linear' }}
                    style={{ left: p.l, width: p.s, height: p.s }}
                    className={`absolute rounded-sm ${p.c} shadow-md`}
                />
            ))}
        </div>
    );
}

/**
 * Mur d'agence : la page qui tourne en boucle sur la TV de la boutique.
 *
 * Elle ne se connecte pas — c'est le jeton du lien qui l'autorise — et elle
 * doit tenir des jours sans qu'on y touche. D'où trois règles :
 *
 *  - elle se rafraîchit seule chaque minute, et garde le dernier contenu si le
 *    réseau tombe, en le signalant discrètement plutôt qu'en s'éteignant ;
 *  - un panneau vide ne s'affiche pas : pas d'« aucune annonce » en boucle sur
 *    un écran de vitrine ;
 *  - tout se lit à trois mètres.
 */

const ROTATION_MS = 12000;
const PASSATION_CATEGORIES = { INCIDENT: 'Incident', CLIENT: 'Client', CONSIGNE: 'Consigne', MATERIEL: 'Matériel' };
const CODE_MS = 8000;
const RAFRAICHISSEMENT_MS = 60000;

const heure = (d) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dateLongue = (d) => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const jourAnniversaire = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * QR de pointage, en permanence dans un coin quand l'écran sert de borne.
 * Il est redemandé toutes les huit secondes : un code vit trente secondes.
 */
function QrPointage({ token }) {
    const [qr, setQr] = useState(null);
    useEffect(() => {
        let actif = true;
        const charger = async () => {
            try {
                const res = await fetch(`${API_URL}/api/public/ecrans/${token}/code`, { cache: 'no-store' });
                const corps = await res.json().catch(() => null);
                if (actif && res.ok && corps?.qr) setQr(corps.qr);
                else if (actif) setQr(null);
            } catch { if (actif) setQr(null); }
        };
        charger();
        const minuterie = setInterval(charger, CODE_MS);
        return () => { actif = false; clearInterval(minuterie); };
    }, [token]);

    if (!qr) return null;
    return (
        <div className="absolute right-0 bottom-0 bg-white rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-2 z-10">
            <img src={qr} alt="" className="w-56 h-56" />
            <p className="text-slate-900 text-xl font-bold flex items-center gap-2"><ScanLine className="w-6 h-6 text-orange-500" /> Pointez ici</p>
        </div>
    );
}

function Panneau({ icone: Icone, titre, teinte, children }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full flex flex-col"
        >
            <div className="flex items-center gap-4 mb-8">
                <span className={`p-4 rounded-2xl ${teinte}`}><Icone className="w-10 h-10" /></span>
                <h2 className="text-5xl font-bold tracking-tight">{titre}</h2>
            </div>
            <div className="flex-1 min-h-0">{children}</div>
        </motion.section>
    );
}

export function MurAgence() {
    const { token } = useParams();
    const [contenu, setContenu] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [horsLigne, setHorsLigne] = useState(false);
    const [maintenant, setMaintenant] = useState(new Date());
    const [indice, setIndice] = useState(0);
    const identite = useIdentite();

    const charger = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/public/ecrans/${token}`, { cache: 'no-store' });
            if (res.status === 404) {
                setErreur("Cet écran n'est plus actif.");
                setContenu(null);
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const corps = await res.json();
            if (res.ok && corps && corps.presence) {
                setContenu(corps);
                setErreur(null);
                setHorsLigne(false);
            }
        } catch {
            // On garde l'affichage précédent : une TV qui s'éteint à chaque
            // coupure réseau finit débranchée.
            setHorsLigne(true);
        }
    }, [token]);

    useEffect(() => {
        charger();
        const minuterie = setInterval(charger, RAFRAICHISSEMENT_MS);
        return () => clearInterval(minuterie);
    }, [charger]);

    useEffect(() => {
        const horloge = setInterval(() => setMaintenant(new Date()), 1000);
        return () => clearInterval(horloge);
    }, []);

    // Seuls les panneaux qui ont quelque chose à dire entrent dans la rotation.
    const panneaux = [];
    if (contenu) {
        if (contenu.celebration) panneaux.push('celebration');
        panneaux.push('presence');
        if (contenu.anniversaires.length > 0) panneaux.push('anniversaires');
        if (contenu.annonces.length > 0) panneaux.push('annonces');
        if (contenu.kudos.length > 0) panneaux.push('kudos');
        if ((contenu.livresDor || []).length > 0) panneaux.push('livres');
        if (contenu.battle) panneaux.push('battle');
        if (contenu.passation) panneaux.push('passation');
    }
    const nombrePanneaux = panneaux.length;

    useEffect(() => {
        if (nombrePanneaux < 2) return undefined;
        const rotation = setInterval(() => setIndice((i) => (i + 1) % nombrePanneaux), ROTATION_MS);
        return () => clearInterval(rotation);
    }, [nombrePanneaux]);

    if (erreur) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-6">
                <MonitorOff className="w-20 h-20" />
                <p className="text-3xl">{erreur}</p>
            </div>
        );
    }

    if (!contenu) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
                <span className="animate-spin h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const courant = panneaux[indice % nombrePanneaux];

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white flex flex-col p-12 select-none cursor-none">
            <header className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-6">
                    {logoUrl(identite) && <img src={logoUrl(identite)} alt="" className="h-24 w-24 object-contain bg-white rounded-2xl p-2" />}
                    <div>
                        <p className="text-2xl font-semibold uppercase tracking-[0.3em]" style={{ color: identite.couleurPrincipale }}>{contenu.organisation}</p>
                        <h1 className="text-4xl font-bold mt-2">{contenu.site || contenu.nom}</h1>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-8xl font-black tabular-nums leading-none">{heure(maintenant)}</p>
                    <p className="text-2xl text-slate-300 mt-3 first-letter:uppercase">{dateLongue(maintenant)}</p>
                </div>
            </header>

            <main className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
                    {courant === 'celebration' && contenu.celebration && (
                        <motion.section
                            key="celebration"
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.04 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="h-full flex flex-col justify-center items-center text-center relative px-8"
                        >
                            <ConfettisOverlay />
                            <div className="mb-6 flex items-center justify-center gap-6">
                                <span className="p-5 rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-2xl">
                                    <PartyPopper className="w-14 h-14 animate-bounce" />
                                </span>
                                <span className="text-2xl font-black uppercase tracking-[0.3em] text-amber-300 bg-amber-500/15 px-8 py-3 rounded-full border border-amber-400/30 shadow-lg">
                                    {contenu.celebration.type === 'ANNIVERSAIRE' ? '🎉 Célébration Spéciale' : '🏆 Challenge & Fierté Agence'}
                                </span>
                                <span className="p-5 rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-2xl">
                                    <Trophy className="w-14 h-14 animate-pulse" />
                                </span>
                            </div>

                            <motion.h2
                                initial={{ y: 20 }}
                                animate={{ y: 0 }}
                                className="text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 drop-shadow-2xl mb-8 leading-tight max-w-5xl"
                            >
                                {contenu.celebration.titre}
                            </motion.h2>

                            {contenu.celebration.sousTitre && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl text-slate-100 max-w-4xl font-normal leading-relaxed bg-white/10 backdrop-blur-md px-12 py-7 rounded-3xl border border-white/20 shadow-2xl"
                                >
                                    {contenu.celebration.sousTitre}
                                </motion.p>
                            )}

                            {contenu.celebration.beneficiaire && (
                                <div className="mt-8">
                                    <span className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-3xl font-bold shadow-2xl flex items-center gap-3">
                                        <Sparkles className="w-8 h-8 text-amber-200" /> À l'honneur : {contenu.celebration.beneficiaire}
                                    </span>
                                </div>
                            )}
                        </motion.section>
                    )}

                    {courant === 'presence' && (
                        <Panneau key="presence" icone={Users} titre="Aujourd'hui en agence" teinte="bg-emerald-500/20 text-emerald-300">
                            <div className="flex items-center gap-16 h-full">
                                <p className="text-[14rem] font-black leading-none text-emerald-300 tabular-nums">{contenu.presence.nombre}</p>
                                <div className="flex-1">
                                    <p className="text-4xl text-slate-300 mb-8">
                                        {contenu.presence.nombre === 0 ? 'Personne n\'a encore pointé.' : contenu.presence.nombre === 1 ? 'collaborateur présent' : 'collaborateurs présents'}
                                    </p>
                                    {contenu.presence.noms && (
                                        <div className="flex flex-wrap gap-4">
                                            {contenu.presence.noms.slice(0, 18).map((nom, i) => (
                                                <motion.span key={nom + i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="px-6 py-3 rounded-full bg-white/10 text-3xl font-medium">{nom}</motion.span>
                                            ))}
                                            {contenu.presence.noms.length > 18 && (
                                                <span className="px-6 py-3 text-3xl text-slate-400">et {contenu.presence.noms.length - 18} autres</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Panneau>
                    )}

                    {courant === 'anniversaires' && (
                        <Panneau key="anniversaires" icone={Cake} titre="Anniversaires de la semaine" teinte="bg-pink-500/20 text-pink-300">
                            <div className="grid grid-cols-2 gap-6">
                                {contenu.anniversaires.slice(0, 8).map((a, i) => (
                                    <motion.div key={a.prenom + a.jour} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        className={`rounded-3xl p-8 ${a.aujourdhui ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-white/10'}`}>
                                        <p className="text-5xl font-bold">{a.aujourdhui ? `🎉 ${a.prenom}` : a.prenom}</p>
                                        <p className="text-2xl mt-2 opacity-80 first-letter:uppercase">{a.aujourdhui ? "C'est aujourd'hui !" : jourAnniversaire(a.jour)}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </Panneau>
                    )}

                    {courant === 'annonces' && (
                        <Panneau key="annonces" icone={Megaphone} titre="À la une" teinte="bg-orange-500/20 text-orange-300">
                            <div className="space-y-6">
                                {contenu.annonces.slice(0, 3).map((a, i) => (
                                    <motion.article key={a.titre + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                                        className={`rounded-3xl p-8 ${i === 0 ? 'bg-white/15' : 'bg-white/5'}`}>
                                        <p className="text-orange-300 text-xl uppercase tracking-widest">{a.categorie}</p>
                                        <h3 className="text-4xl font-bold mt-2">{a.titre}</h3>
                                        {i === 0 && <p className="text-2xl text-slate-200 mt-4 leading-relaxed">{a.corps}</p>}
                                    </motion.article>
                                ))}
                            </div>
                        </Panneau>
                    )}

                    {courant === 'kudos' && (
                        <Panneau key="kudos" icone={Heart} titre="Merci à…" teinte="bg-rose-500/20 text-rose-300">
                            <div className="grid grid-cols-2 gap-6">
                                {contenu.kudos.slice(0, 4).map((k, i) => (
                                    <motion.blockquote key={i} initial={{ opacity: 0, rotate: -2 }} animate={{ opacity: 1, rotate: 0 }} transition={{ delay: i * 0.15 }}
                                        className="rounded-3xl bg-white/10 p-8">
                                        <p className="text-3xl leading-snug">« {k.message} »</p>
                                        <footer className="text-2xl text-rose-300 mt-5 font-semibold">{k.de} → {k.pour}</footer>
                                    </motion.blockquote>
                                ))}
                            </div>
                        </Panneau>
                    )}
                    {courant === 'livres' && (
                        <Panneau key="livres" icone={BookHeart} titre="Livre d'or" teinte="bg-amber-500/20 text-amber-300">
                            <div className="space-y-6">
                                {contenu.livresDor.slice(0, 2).map((l, i) => (
                                    <motion.div key={l.titre + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                                        className="rounded-3xl bg-white/10 p-8">
                                        <h3 className="text-4xl font-bold">{l.titre}</h3>
                                        <p className="text-2xl text-amber-200 mt-2">
                                            {l.nombreMots} mot{l.nombreMots > 1 ? 's' : ''} pour {l.prenom} — laissez le vôtre, le lien circule sur WhatsApp.
                                        </p>
                                        <div className="grid grid-cols-3 gap-4 mt-6">
                                            {l.extraits.map((x, j) => (
                                                <blockquote key={j} className="bg-white/10 rounded-2xl p-5 text-xl leading-snug">
                                                    « {x.message} »<footer className="text-amber-300 mt-2 text-lg">— {x.auteur}</footer>
                                                </blockquote>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </Panneau>
                    )}
                    {courant === 'battle' && contenu.battle && (
                        <Panneau key="battle" icone={Trophy} titre="Live Battle des Agences" teinte="bg-amber-500/20 text-amber-300">
                            <div className="rounded-3xl bg-linear-to-r from-orange-500/20 to-amber-500/20 border border-amber-400/30 p-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black uppercase tracking-wider text-amber-300">
                                        👑 Agence N°1 de la semaine :
                                    </span>
                                    <span className="text-4xl font-extrabold text-white bg-amber-500/30 px-6 py-2 rounded-2xl border border-amber-300/40">
                                        {contenu.battle.topAgence}
                                    </span>
                                </div>
                                <div className="p-6 bg-black/30 rounded-2xl border border-white/10">
                                    <p className="text-2xl text-slate-300 font-medium">Sprint en cours :</p>
                                    <p className="text-4xl font-bold text-orange-200 mt-2">{contenu.battle.defiEnCours}</p>
                                </div>
                            </div>
                        </Panneau>
                    )}
                    {courant === 'passation' && (
                        <Panneau key="passation" icone={ClipboardList} titre="Passation d'équipe" teinte="bg-sky-500/20 text-sky-300">
                            <p className="text-2xl text-slate-300 mb-6">
                                Laissé par {contenu.passation.auteur} à {new Date(contenu.passation.le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — encore ouvert :
                            </p>
                            <ul className="space-y-4">
                                {contenu.passation.elements.map((x, i) => (
                                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        className="rounded-2xl bg-white/10 px-6 py-4 text-3xl flex gap-4">
                                        <span className="text-sky-300 text-xl uppercase tracking-widest shrink-0 w-44 pt-1">{PASSATION_CATEGORIES[x.categorie] || x.categorie}</span>
                                        <span>{x.texte}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </Panneau>
                    )}
                </AnimatePresence>
                {contenu.pointage && <QrPointage token={token} />}
            </main>

            <footer className="flex items-center justify-between mt-8 text-2xl text-slate-400">
                <div className="flex gap-3">
                    {panneaux.map((p, i) => (
                        <span key={p} className={`h-2 rounded-full transition-all duration-500 ${i === indice % nombrePanneaux ? 'w-16 bg-orange-400' : 'w-6 bg-white/20'}`} />
                    ))}
                </div>
                <div className="flex items-center gap-8">
                    {contenu.prochainePaie && (
                        <span className="flex items-center gap-3">
                            <Wallet className="w-7 h-7 text-emerald-400" />
                            {contenu.prochainePaie.dansJours === 0 ? "Paie aujourd'hui" : `Paie dans ${contenu.prochainePaie.dansJours} jour${contenu.prochainePaie.dansJours > 1 ? 's' : ''}`}
                        </span>
                    )}
                    {horsLigne && (
                        <span className="flex items-center gap-2 text-amber-400"><WifiOff className="w-6 h-6" /> Hors ligne</span>
                    )}
                </div>
            </footer>
        </div>
    );
}
