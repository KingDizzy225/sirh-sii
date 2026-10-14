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

        const stockerPointageOffline = (donnees) => {
            try {
                const existants = JSON.parse(localStorage.getItem('sirh_pointages_offline') || '[]');
                existants.push({ ...donnees, dateOffline: new Date().toISOString() });
                localStorage.setItem('sirh_pointages_offline', JSON.stringify(existants));
            } catch (e) {
                console.error('Erreur stockage pointage offline:', e);
            }
        };

        const synchroniserPointagesOffline = async () => {
            try {
                const enAttente = JSON.parse(localStorage.getItem('sirh_pointages_offline') || '[]');
                if (!enAttente.length) return;
                const restants = [];
                for (const item of enAttente) {
                    try {
                        const r = await fetch(`${API_URL}/api/public/badges/${item.jeton}/pointer`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ecran: item.ecran, code: item.code, ...item.position, offlineSync: true, horodatageInitial: item.dateOffline })
                        });
                        if (!r.ok && r.status !== 410) restants.push(item);
                    } catch {
                        restants.push(item);
                    }
                }
                localStorage.setItem('sirh_pointages_offline', JSON.stringify(restants));
            } catch (e) {
                console.error('Erreur sync pointages offline:', e);
            }
        };

        window.addEventListener('online', synchroniserPointagesOffline);

        const envoyer = async (position) => {
            try {
                const res = await fetch(`${API_URL}/api/public/badges/${jeton}/pointer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ecran, code, ...position })
                });
                const corps = await res.json().catch(() => ({}));
                if (res.ok && corps.type) {
                    setEtat({ phase: 'ok', ...corps });
                    synchroniserPointagesOffline();
                } else {
                    setEtat({ phase: res.status === 403 ? 'sansBadge' : 'erreur', message: corps.error || 'Pointage impossible.' });
                }
            } catch {
                // Coupure réseau ou mode hors-ligne : sauvegarde résiliente locale
                stockerPointageOffline({ jeton, ecran, code, position });
                setEtat({
                    phase: 'ok_offline',
                    heure: new Date(),
                    enregistre: true,
                    type: 'CLOCK_IN',
                    site: 'Agence (Sauvegardé hors-ligne)',
                    message: 'Pointage horodaté & enregistré sur ce téléphone ! Il sera synchronisé dès le retour du réseau.'
                });
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
    const isOffline = etat.phase === 'ok_offline';

    const [humeurVotee, setHumeurVotee] = useState(false);

    const voterHumeur = async (humeur) => {
        setHumeurVotee(true);
        const jeton = lireBadgeMemorise();
        try {
            await fetch(`${API_URL}/api/public/pulsation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jeton, humeur, siteNom: etat.site })
            });
        } catch (e) {
            console.error('Erreur vote humeur:', e);
        }
    };

    return (
        <div className={`min-h-screen text-white flex flex-col items-center justify-center p-8 text-center gap-5 ${isOffline ? 'bg-amber-600' : arrivee ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220 }}>
                {arrivee ? <CheckCircle2 className="w-24 h-24" /> : <LogOut className="w-24 h-24" />}
            </motion.div>
            <p className="text-6xl font-black tabular-nums">{heure}</p>
            <h1 className="text-2xl font-bold">
                {isOffline ? 'Pointage hors-ligne validé' : (etat.enregistre ? (arrivee ? 'Arrivée enregistrée' : 'Départ enregistré') : 'Déjà enregistré')}
            </h1>
            <p className="text-lg opacity-90">{etat.site}</p>
            <p className="text-xl max-w-sm">{etat.message}</p>
            {isOffline && (
                <div className="bg-black/20 rounded-xl px-4 py-3 text-sm max-w-sm border border-white/20">
                    📡 Votre badge a été horodaté en local. La présence remontera dès que votre connexion internet sera rétablie.
                </div>
            )}
            
            {/* Micro-sondage émotionnel en 1 tap au départ */}
            {!arrivee && !humeurVotee && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 max-w-sm w-full"
                >
                    <p className="text-sm font-semibold mb-3">Comment s'est passée ta journée ?</p>
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => voterHumeur('FEU')} className="flex flex-col items-center p-2 rounded-xl bg-white/10 hover:bg-white/25 transition">
                            <span className="text-3xl">🔥</span>
                            <span className="text-[10px] mt-1 font-bold">En feu</span>
                        </button>
                        <button onClick={() => voterHumeur('BIEN')} className="flex flex-col items-center p-2 rounded-xl bg-white/10 hover:bg-white/25 transition">
                            <span className="text-3xl">😊</span>
                            <span className="text-[10px] mt-1 font-bold">Bien</span>
                        </button>
                        <button onClick={() => voterHumeur('FATIGUE')} className="flex flex-col items-center p-2 rounded-xl bg-white/10 hover:bg-white/25 transition">
                            <span className="text-3xl">🥱</span>
                            <span className="text-[10px] mt-1 font-bold">Épuisé</span>
                        </button>
                        <button onClick={() => voterHumeur('COMPLIQUE')} className="flex flex-col items-center p-2 rounded-xl bg-white/10 hover:bg-white/25 transition">
                            <span className="text-3xl">😤</span>
                            <span className="text-[10px] mt-1 font-bold">Compliqué</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {!arrivee && humeurVotee && (
                <p className="text-sm bg-white/15 px-4 py-2 rounded-full text-indigo-100">
                    ✨ Merci pour ton ressenti ! Repose-toi bien.
                </p>
            )}

            {etat.horsPerimetre && !isOffline && (
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
