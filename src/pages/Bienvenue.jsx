import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, User, MapPin, Clock, CheckCircle2, Upload, PartyPopper, CalendarDays } from 'lucide-react';
import { useIdentite, logoUrl, degradeMarque } from '../lib/identite.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Page de pré-accueil : ce que le futur salarié ouvre avant son premier jour.
 */

function Carte({ site }) {
    const conteneur = useRef(null);
    useEffect(() => {
        if (!conteneur.current || !site) return undefined;
        const carte = L.map(conteneur.current, { zoomControl: false, attributionControl: true, dragging: false, scrollWheelZoom: false })
            .setView([site.latitude, site.longitude], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(carte);
        L.circleMarker([site.latitude, site.longitude], { radius: 10, color: '#fff', weight: 3, fillColor: '#f97316', fillOpacity: 1 }).addTo(carte);
        return () => carte.remove();
    }, [site]);
    return <div ref={conteneur} className="h-48 rounded-2xl overflow-hidden z-0" />;
}

export function Bienvenue() {
    const { token } = useParams();
    const [page, setPage] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [envoi, setEnvoi] = useState(null);
    const [retour, setRetour] = useState(null);
    const [photoOk, setPhotoOk] = useState(true);
    const identite = useIdentite();

    const charger = React.useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/public/preaccueil/${token}`, { cache: 'no-store' });
            const corps = await res.json().catch(() => ({}));
            if (res.ok && corps.prenom) setPage(corps);
            else setErreur(corps.motif || corps.error || "Ce lien n'est pas valide.");
        } catch {
            setErreur('Connexion impossible. Réessayez.');
        }
    }, [token]);

    useEffect(() => { charger(); }, [charger]);

    const deposer = async (code, fichier) => {
        if (!fichier) return;
        setEnvoi(code);
        setRetour(null);
        try {
            const donnees = new FormData();
            donnees.append('fichier', fichier);
            const res = await fetch(`${API_URL}/api/public/preaccueil/${token}/pieces/${code}`, { method: 'POST', body: donnees });
            const corps = await res.json().catch(() => ({}));
            setRetour({ ok: res.ok, texte: corps.message || corps.error || (res.ok ? 'Reçu.' : 'Envoi impossible.') });
            if (res.ok) charger();
        } catch {
            setRetour({ ok: false, texte: 'Pas de connexion. Réessayez.' });
        } finally {
            setEnvoi(null);
        }
    };

    if (erreur) return <div className="min-h-screen flex items-center justify-center p-8 text-center text-slate-600">{erreur}</div>;
    if (!page) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;

    const jour = new Date(page.dateArrivee).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    const recues = page.pieces.filter((p) => p.recue).length;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="text-white px-6 pt-10 pb-16 text-center" style={{ background: degradeMarque(identite) }}>
                {logoUrl(identite) && <img src={logoUrl(identite)} alt="" className="h-16 w-16 object-contain bg-white rounded-2xl p-1 mx-auto mb-4" />}
                <p className="uppercase tracking-[0.25em] text-sm opacity-90">{page.organisation}</p>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black mt-3">
                    Bienvenue, {page.prenom} !
                </motion.h1>
                {page.fonction && <p className="mt-2 opacity-90">{page.fonction}</p>}
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8">
                    {page.joursAvant > 0 ? (
                        <>
                            <p className="text-8xl font-black leading-none tabular-nums">{page.joursAvant}</p>
                            <p className="text-xl mt-2">jour{page.joursAvant > 1 ? 's' : ''} avant votre arrivée</p>
                        </>
                    ) : (
                        <p className="text-3xl font-bold flex items-center justify-center gap-3">
                            <PartyPopper className="w-8 h-8" /> {page.joursAvant === 0 ? "C'est aujourd'hui !" : 'Vous êtes des nôtres.'}
                        </p>
                    )}
                </motion.div>
            </header>

            <main className="max-w-md mx-auto px-4 -mt-10 pb-12 space-y-4">
                <section className="bg-white rounded-2xl shadow-sm p-5">
                    <p className="flex items-center gap-3 text-slate-800"><CalendarDays className="w-5 h-5 text-orange-500" /> <span className="first-letter:uppercase">{jour}</span></p>
                    {page.heureArrivee && <p className="flex items-center gap-3 text-slate-800 mt-2"><Clock className="w-5 h-5 text-orange-500" /> Arrivée à {page.heureArrivee.replace(':', ' h ')}</p>}
                    {page.site && <p className="flex items-center gap-3 text-slate-800 mt-2"><MapPin className="w-5 h-5 text-orange-500" /> {page.site.nom}</p>}
                </section>

                {page.responsable && (
                    <section className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
                        {page.responsable.photo && photoOk ? (
                            <img src={`${API_URL}/api/public/preaccueil/${token}/photo-responsable`} alt="" onError={() => setPhotoOk(false)}
                                className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-100" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center"><User className="w-10 h-10 text-orange-500" /></div>
                        )}
                        <div>
                            <p className="text-sm text-slate-500">Vous serez accueilli(e) par</p>
                            <p className="text-lg font-bold text-slate-900">{page.responsable.prenom} {page.responsable.nom}</p>
                            {page.responsable.fonction && <p className="text-sm text-slate-600">{page.responsable.fonction}</p>}
                        </div>
                    </section>
                )}

                {page.motAccueil && (
                    <section className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-slate-800 italic whitespace-pre-line">« {page.motAccueil} »</section>
                )}

                {page.site && Number.isFinite(page.site.latitude) && (
                    <section className="bg-white rounded-2xl shadow-sm p-3">
                        <Carte site={page.site} />
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${page.site.latitude},${page.site.longitude}`} target="_blank" rel="noopener noreferrer"
                            className="block text-center text-orange-600 font-semibold mt-3">Itinéraire</a>
                    </section>
                )}

                {page.programme && (
                    <section className="bg-white rounded-2xl shadow-sm p-5">
                        <h2 className="font-bold text-slate-900 mb-3">Votre programme</h2>
                        <ol className="space-y-2">
                            {page.programme.split('\n').filter((ligne) => ligne.trim()).map((ligne, i) => (
                                <li key={i} className="flex gap-3 text-slate-700"><span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0" />{ligne}</li>
                            ))}
                        </ol>
                    </section>
                )}

                {page.pieces.length > 0 && (
                    <section className="bg-white rounded-2xl shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-bold text-slate-900">Vos pièces</h2>
                            <span className="text-sm text-slate-500">{recues} / {page.pieces.length}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">Déposez-les dès maintenant (photo ou PDF) : votre premier jour sera consacré à l'essentiel.</p>
                        {retour && <p className={`text-sm mb-3 ${retour.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{retour.texte}</p>}
                        <ul className="space-y-2">
                            {page.pieces.map((p) => (
                                <li key={p.code} className="flex items-center justify-between gap-3 border rounded-xl px-3 py-2">
                                    <span className="text-sm text-slate-700">{p.libelle}</span>
                                    {p.recue ? (
                                        <span className="flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle2 className="w-5 h-5" /> Reçue</span>
                                    ) : (
                                        <label className="text-sm text-orange-600 font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                                            {envoi === p.code ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Déposer
                                            <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" capture="environment" className="hidden"
                                                disabled={envoi !== null} onChange={(e) => deposer(p.code, e.target.files?.[0])} />
                                        </label>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
        </div>
    );
}
