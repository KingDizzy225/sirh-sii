import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, LogOut, Loader2, ShieldX, IdCard, MapPinOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Clé sous laquelle la carte du badge mémorise son jeton sur ce téléphone. */
export const CLE_BADGE = 'sirh_badge_jeton';

export const lireBadgeMemorise = () => {
    try { return localStorage.getItem(CLE_BADGE); } catch { return null; }
};

/**
 * Page ouverte par le scan du QR affiché sur l'écran d'agence.
 *
 * Le téléphone est reconnu par le badge ouvert au moins une fois dessus : rien
 * à saisir. La position est demandée mais pas exigée — le scan de l'écran est
 * déjà la preuve de présence ; la position sert à repérer un QR relayé à
 * distance.
 */
export function Pointer() {
    const [params] = useSearchParams();
    const [etat, setEtat] = useState({ phase: 'attente' });
    const lance = useRef(false);

    useEffect(() => {
        if (lance.current) return;
        lance.current = true;

        const jeton = lireBadgeMemorise();
        const ecran = params.get('e');
        const code = params.get('c');
        if (!ecran || !code) { setEtat({ phase: 'erreur', message: 'QR incomplet. Scannez à nouveau l\'écran.' }); return; }
        if (!jeton) { setEtat({ phase: 'sansBadge' }); return; }

        const envoyer = async (position) => {
            try {
                const res = await fetch(`${API_URL}/api/public/badges/${jeton}/pointer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ecran, code, ...position })
                });
                const corps = await res.json().catch(() => ({}));
                if (res.ok && corps.type) setEtat({ phase: 'ok', ...corps });
                else setEtat({ phase: res.status === 403 ? 'sansBadge' : 'erreur', message: corps.error || 'Pointage impossible.' });
            } catch {
                setEtat({ phase: 'erreur', message: 'Pas de connexion. Réessayez en scannant à nouveau.' });
            }
        };

        if (!navigator.geolocation) { envoyer({}); return; }
        // Le code vit trente secondes : on n'attend pas la position plus de quatre.
        navigator.geolocation.getCurrentPosition(
            (p) => envoyer({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy }),
            () => envoyer({}),
            { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 }
        );
    }, [params]);

    if (etat.phase === 'attente') {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-orange-400" />
                <p className="text-lg">Pointage en cours…</p>
            </div>
        );
    }

    if (etat.phase === 'sansBadge') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8 text-center gap-4">
                <IdCard className="w-16 h-16 text-orange-500" />
                <h1 className="text-2xl font-bold text-slate-900">Téléphone non reconnu</h1>
                <p className="text-slate-600 max-w-sm">
                    {etat.message || "Ouvrez d'abord le lien de votre badge numérique sur ce téléphone, puis scannez à nouveau l'écran."}
                </p>
            </div>
        );
    }

    if (etat.phase === 'erreur') {
        return (
            <div className="min-h-screen bg-rose-600 text-white flex flex-col items-center justify-center p-8 text-center gap-4">
                <ShieldX className="w-16 h-16" />
                <p className="text-xl max-w-sm">{etat.message}</p>
            </div>
        );
    }

    const arrivee = etat.type === 'CLOCK_IN';
    const heure = etat.heure ? new Date(etat.heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    return (
        <div className={`min-h-screen text-white flex flex-col items-center justify-center p-8 text-center gap-5 ${arrivee ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220 }}>
                {arrivee ? <CheckCircle2 className="w-24 h-24" /> : <LogOut className="w-24 h-24" />}
            </motion.div>
            <p className="text-6xl font-black tabular-nums">{heure}</p>
            <h1 className="text-2xl font-bold">
                {etat.enregistre ? (arrivee ? 'Arrivée enregistrée' : 'Départ enregistré') : 'Déjà enregistré'}
            </h1>
            <p className="text-lg opacity-90">{etat.site}</p>
            <p className="text-xl">{etat.message}</p>
            {etat.horsPerimetre && (
                <p className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-3 text-sm max-w-sm">
                    <MapPinOff className="w-5 h-5 shrink-0" /> Votre téléphone semble loin de l'agence : le pointage est enregistré mais signalé à la RH.
                </p>
            )}
        </div>
    );
}

/**
 * Page ouverte par le scan du QR projeté pendant une formation.
 * Même reconnaissance du téléphone que pour pointer : le badge.
 */
export function Emarger() {
    const [params] = useSearchParams();
    const [etat, setEtat] = useState({ phase: 'attente' });
    const lance = useRef(false);

    useEffect(() => {
        if (lance.current) return;
        lance.current = true;
        const jeton = lireBadgeMemorise();
        const session = params.get('s');
        const code = params.get('c');
        if (!session || !code) { setEtat({ phase: 'erreur', message: 'QR incomplet. Scannez à nouveau.' }); return; }
        if (!jeton) { setEtat({ phase: 'sansBadge' }); return; }
        fetch(`${API_URL}/api/public/badges/${jeton}/emarger`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session, code })
        })
            .then(async (res) => {
                const corps = await res.json().catch(() => ({}));
                if (res.ok && corps.action) setEtat({ phase: 'ok', ...corps });
                else setEtat({ phase: res.status === 403 ? 'sansBadge' : 'erreur', message: corps.error || 'Émargement impossible.' });
            })
            .catch(() => setEtat({ phase: 'erreur', message: 'Pas de connexion. Scannez à nouveau.' }));
    }, [params]);

    if (etat.phase === 'attente') {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-sky-400" /></div>;
    }
    if (etat.phase === 'sansBadge') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8 text-center gap-4">
                <IdCard className="w-16 h-16 text-sky-500" />
                <h1 className="text-2xl font-bold text-slate-900">Téléphone non reconnu</h1>
                <p className="text-slate-600 max-w-sm">{etat.message || "Ouvrez d'abord le lien de votre badge numérique sur ce téléphone, puis scannez à nouveau."}</p>
            </div>
        );
    }
    if (etat.phase === 'erreur') {
        return (
            <div className="min-h-screen bg-rose-600 text-white flex flex-col items-center justify-center p-8 text-center gap-4">
                <ShieldX className="w-16 h-16" /><p className="text-xl max-w-sm">{etat.message}</p>
            </div>
        );
    }
    const depart = etat.action === 'DEPART';
    return (
        <div className={`min-h-screen text-white flex flex-col items-center justify-center p-8 text-center gap-5 ${depart ? 'bg-indigo-600' : 'bg-sky-600'}`}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220 }}>
                {depart ? <LogOut className="w-24 h-24" /> : <CheckCircle2 className="w-24 h-24" />}
            </motion.div>
            <h1 className="text-2xl font-bold">{etat.action === 'ARRIVEE' ? 'Présence enregistrée' : depart ? 'Départ enregistré' : 'Déjà enregistré'}</h1>
            <p className="text-lg opacity-90">{etat.formation}</p>
            <p className="text-xl">{etat.message}</p>
        </div>
    );
}
