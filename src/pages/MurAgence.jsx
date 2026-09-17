import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Cake, Megaphone, Heart, Wallet, WifiOff, MonitorOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
const RAFRAICHISSEMENT_MS = 60000;

const heure = (d) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dateLongue = (d) => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const jourAnniversaire = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

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
        panneaux.push('presence');
        if (contenu.anniversaires.length > 0) panneaux.push('anniversaires');
        if (contenu.annonces.length > 0) panneaux.push('annonces');
        if (contenu.kudos.length > 0) panneaux.push('kudos');
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
                <div>
                    <p className="text-orange-400 text-2xl font-semibold uppercase tracking-[0.3em]">{contenu.organisation}</p>
                    <h1 className="text-4xl font-bold mt-2">{contenu.site || contenu.nom}</h1>
                </div>
                <div className="text-right">
                    <p className="text-8xl font-black tabular-nums leading-none">{heure(maintenant)}</p>
                    <p className="text-2xl text-slate-300 mt-3 first-letter:uppercase">{dateLongue(maintenant)}</p>
                </div>
            </header>

            <main className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
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
                </AnimatePresence>
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
