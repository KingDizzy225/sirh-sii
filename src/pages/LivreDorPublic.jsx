import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, BookHeart, Send, Heart, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Livre d'or : la page où l'on écrit, et celle où la personne lit.
 */

const TEINTES = ['bg-amber-100', 'bg-rose-100', 'bg-sky-100', 'bg-emerald-100', 'bg-violet-100', 'bg-orange-100'];

export function LivreDorEcrire() {
    const { jeton } = useParams();
    const [livre, setLivre] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [saisie, setSaisie] = useState({ auteur: '', message: '' });
    const [envoi, setEnvoi] = useState(false);
    const [merci, setMerci] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/public/livres-dor/${jeton}`, { cache: 'no-store' })
            .then(async (res) => {
                const corps = await res.json().catch(() => ({}));
                if (res.ok && corps.titre) setLivre(corps);
                else setErreur(corps.error || "Ce livre d'or n'existe pas.");
            })
            .catch(() => setErreur('Connexion impossible.'));
    }, [jeton]);

    const envoyer = async (evenement) => {
        evenement.preventDefault();
        setEnvoi(true);
        setErreur(null);
        try {
            const res = await fetch(`${API_URL}/api/public/livres-dor/${jeton}/mots`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saisie)
            });
            const corps = await res.json().catch(() => ({}));
            if (res.ok) setMerci(corps.message || 'Merci !');
            else setErreur(corps.error || 'Envoi impossible.');
        } catch {
            setErreur('Connexion impossible.');
        } finally {
            setEnvoi(false);
        }
    };

    if (!livre) {
        return <div className="min-h-screen flex items-center justify-center p-8 text-slate-600">{erreur || <Loader2 className="w-10 h-10 animate-spin text-amber-500" />}</div>;
    }

    const date = new Date(livre.dateRemise).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 p-4 flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <BookHeart className="w-12 h-12 text-amber-500 mx-auto" />
                    <p className="text-sm text-amber-700 mt-2 uppercase tracking-widest">{livre.occasion}</p>
                    <h1 className="text-3xl font-black text-slate-900 mt-1">{livre.titre}</h1>
                    <p className="text-slate-600 mt-2">
                        Un mot pour {livre.prenom}, remis le {date}. {livre.nombreMots > 0 && `${livre.nombreMots} collègue${livre.nombreMots > 1 ? 's ont' : ' a'} déjà écrit.`}
                    </p>
                </div>

                {merci ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow p-8 text-center">
                        <Heart className="w-14 h-14 text-rose-500 mx-auto fill-rose-500" />
                        <p className="text-xl font-bold text-slate-900 mt-4">{merci}</p>
                    </motion.div>
                ) : !livre.ouvert ? (
                    <div className="bg-white rounded-3xl shadow p-8 text-center text-slate-600"><Lock className="w-8 h-8 mx-auto mb-3" />Ce livre est clos.</div>
                ) : (
                    <form onSubmit={envoyer} className="bg-white rounded-3xl shadow p-6 space-y-4">
                        <textarea required rows={6} maxLength={livre.messageMax} value={saisie.message}
                            onChange={(e) => setSaisie((s) => ({ ...s, message: e.target.value }))}
                            placeholder={`Votre mot pour ${livre.prenom}…`}
                            className="w-full rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
                        <p className="text-right text-xs text-slate-400 -mt-3">{saisie.message.length} / {livre.messageMax}</p>
                        <input required minLength={2} maxLength={60} value={saisie.auteur} onChange={(e) => setSaisie((s) => ({ ...s, auteur: e.target.value }))}
                            placeholder="Signé (votre prénom)" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
                        {erreur && <p className="text-sm text-rose-700">{erreur}</p>}
                        <button disabled={envoi} className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                            {envoi ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Envoyer mon mot
                        </button>
                        <p className="text-xs text-slate-400 text-center">Les autres mots restent secrets jusqu'au jour de la remise.</p>
                    </form>
                )}
            </div>
        </div>
    );
}

export function LivreDorRemise() {
    const { jeton } = useParams();
    const [livre, setLivre] = useState(null);
    const [attente, setAttente] = useState(null);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/public/livres-dor/remise/${jeton}`, { cache: 'no-store' })
            .then(async (res) => {
                const corps = await res.json().catch(() => ({}));
                if (res.ok && Array.isArray(corps.mots)) setLivre(corps);
                else if (res.status === 403) setAttente(corps);
                else setErreur(corps.error || "Ce livre d'or n'existe pas.");
            })
            .catch(() => setErreur('Connexion impossible.'));
    }, [jeton]);

    if (erreur) return <div className="min-h-screen flex items-center justify-center p-8 text-slate-600">{erreur}</div>;
    if (attente) {
        return (
            <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-8 text-center gap-3">
                <Lock className="w-12 h-12 text-amber-500" />
                <p className="text-xl text-slate-800">{attente.error}</p>
            </div>
        );
    }
    if (!livre) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-violet-50 px-4 py-10">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-10">
                <BookHeart className="w-14 h-14 text-amber-500 mx-auto" />
                <p className="text-sm text-amber-700 mt-3 uppercase tracking-widest">{livre.organisation}</p>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-2">{livre.titre}</h1>
                <p className="text-lg text-slate-600 mt-3">
                    {livre.prenom}, {livre.mots.length} collègue{livre.mots.length > 1 ? 's' : ''} {livre.mots.length > 1 ? 'ont' : 'a'} pris le temps de vous écrire.
                </p>
            </motion.header>
            <div className="max-w-5xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-4">
                {livre.mots.map((m, i) => (
                    <motion.figure key={i} initial={{ opacity: 0, y: 30, rotate: i % 2 ? 1.5 : -1.5 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.12, 4) }}
                        className={`break-inside-avoid mb-4 rounded-2xl p-5 shadow-sm ${TEINTES[i % TEINTES.length]}`}>
                        <blockquote className="text-slate-800 text-lg leading-relaxed whitespace-pre-line">{m.message}</blockquote>
                        <figcaption className="mt-3 font-semibold text-slate-600">— {m.auteur}</figcaption>
                    </motion.figure>
                ))}
            </div>
        </div>
    );
}
