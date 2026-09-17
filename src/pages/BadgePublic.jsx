import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldX, Loader2, User, RotateCw } from 'lucide-react';

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
    const [maintenant, setMaintenant] = useState(new Date());

    useEffect(() => {
        fetch(`${API_URL}/api/public/badges/${jeton}`, { cache: 'no-store' })
            .then(async (res) => {
                const corps = await res.json().catch(() => ({}));
                if (res.ok && corps.valide) setBadge(corps);
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
                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-slate-900 text-white p-8 flex flex-col">
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] opacity-90">{badge.organisation}</p>
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
