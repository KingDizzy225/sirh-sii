import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Lock, ChevronRight, ChevronLeft, Share2, Eye, EyeOff, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * « Mon année chez SII » : le bilan d'une année, en diapositives.
 *
 * Chaque diapositive naît d'une rubrique réellement renseignée : un salarié qui
 * ne pointe pas ne voit pas de diapositive « présence ». La dernière résume
 * l'année en une carte à partager — sans la rémunération, qui ne s'affiche
 * qu'à la demande et ne figure jamais sur l'image partagée.
 */

const nombre = (n) => new Intl.NumberFormat('fr-FR').format(n);
const CATEGORIES = { Teamwork: "l'esprit d'équipe", Innovation: "l'innovation", Leadership: 'le leadership', Efficiency: "l'efficacité" };

function Compteur({ valeur, decimales = 0 }) {
    const [affiche, setAffiche] = useState(0);
    useEffect(() => {
        let image;
        const debut = performance.now();
        const pas = (t) => {
            const avancement = Math.min(1, (t - debut) / 1400);
            setAffiche(valeur * (1 - Math.pow(1 - avancement, 3)));
            if (avancement < 1) image = requestAnimationFrame(pas);
        };
        image = requestAnimationFrame(pas);
        return () => cancelAnimationFrame(image);
    }, [valeur]);
    return <span className="tabular-nums">{nombre(Number(affiche.toFixed(decimales)))}</span>;
}

function Diapo({ fond, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45 }}
            className={`absolute inset-0 rounded-[2rem] p-8 flex flex-col justify-center text-white ${fond}`}
        >
            {children}
        </motion.div>
    );
}

const Grand = ({ children }) => <p className="text-7xl font-black leading-none my-4">{children}</p>;
const Petit = ({ children }) => <p className="text-xl opacity-90 leading-snug">{children}</p>;

function construireDiapos(b, montrerRemuneration, setMontrerRemuneration) {
    const diapos = [];
    diapos.push(
        <Diapo key="intro" fond="bg-gradient-to-br from-orange-500 via-rose-500 to-purple-700">
            <Sparkles className="w-12 h-12 mb-6" />
            <p className="text-2xl opacity-90">Bonjour {b.salarie.prenom},</p>
            <p className="text-5xl font-black leading-tight mt-2">voici votre année {b.annee} chez {b.organisation}.</p>
            {!b.anneeComplete && <p className="mt-6 opacity-80">Arrêtée au {new Date(b.arreteAu).toLocaleDateString('fr-FR')}.</p>}
        </Diapo>
    );
    if (b.arriveeCetteAnnee) {
        diapos.push(
            <Diapo key="arrivee" fond="bg-gradient-to-br from-sky-500 to-indigo-700">
                <Petit>Tout a commencé le</Petit>
                <p className="text-5xl font-black my-4">{new Date(b.arriveeCetteAnnee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                <Petit>Bienvenue dans l'équipe. C'était votre première année.</Petit>
            </Diapo>
        );
    } else if (b.anciennete.jalonFranchi) {
        diapos.push(
            <Diapo key="jalon" fond="bg-gradient-to-br from-amber-400 to-orange-600">
                <Petit>Cette année, vous avez franchi le cap des</Petit>
                <Grand><Compteur valeur={b.anciennete.jalonFranchi} /> an{b.anciennete.jalonFranchi > 1 ? 's' : ''}</Grand>
                <Petit>chez {b.organisation}. Merci pour votre fidélité.</Petit>
            </Diapo>
        );
    }
    if (b.presence) {
        diapos.push(
            <Diapo key="presence" fond="bg-gradient-to-br from-emerald-500 to-teal-700">
                <Petit>Vous avez été au rendez-vous</Petit>
                <Grand><Compteur valeur={b.presence.joursPointes} /> jours</Grand>
                <Petit>pointés dans l'année.</Petit>
            </Diapo>
        );
    }
    if (b.formations) {
        diapos.push(
            <Diapo key="formations" fond="bg-gradient-to-br from-violet-500 to-fuchsia-700">
                <Petit>Vous avez appris</Petit>
                <Grand><Compteur valeur={b.formations.heures} decimales={1} /> h</Grand>
                <Petit>{b.formations.nombre} formation{b.formations.nombre > 1 ? 's' : ''}, dont :</Petit>
                <ul className="mt-4 space-y-1 text-lg">
                    {b.formations.intitules.slice(0, 4).map((t) => <li key={t}>• {t}</li>)}
                </ul>
            </Diapo>
        );
    }
    if (b.reconnaissance?.recus > 0) {
        const r = b.reconnaissance;
        const principale = Object.entries(r.categories).sort((x, y) => y[1] - x[1])[0]?.[0];
        diapos.push(
            <Diapo key="merci" fond="bg-gradient-to-br from-rose-500 to-red-700">
                <Petit>Vos collègues vous ont dit merci</Petit>
                <Grand><Compteur valeur={r.recus} /> fois</Grand>
                {principale && <Petit>Surtout pour {CATEGORIES[principale] || principale}.</Petit>}
                {r.dernierMot && (
                    <blockquote className="mt-6 bg-white/15 rounded-2xl p-5 text-lg">
                        « {r.dernierMot.message} »{r.dernierMot.de && <footer className="mt-2 font-semibold">— {r.dernierMot.de}</footer>}
                    </blockquote>
                )}
            </Diapo>
        );
    }
    if (b.reconnaissance?.envoyes > 0) {
        diapos.push(
            <Diapo key="donne" fond="bg-gradient-to-br from-pink-500 to-purple-700">
                <Petit>Et vous avez remercié</Petit>
                <Grand><Compteur valeur={b.reconnaissance.colleguesRemercies} /></Grand>
                <Petit>collègue{b.reconnaissance.colleguesRemercies > 1 ? 's' : ''}. La reconnaissance, ça se partage.</Petit>
            </Diapo>
        );
    }
    if (b.conges) {
        diapos.push(
            <Diapo key="conges" fond="bg-gradient-to-br from-cyan-500 to-blue-700">
                <Petit>Vous avez aussi pris le temps de souffler</Petit>
                <Grand><Compteur valeur={b.conges.joursPris} decimales={b.conges.joursPris % 1 ? 1 : 0} /> jours</Grand>
                <Petit>de congé{b.conges.plusLongueAbsence > 1 ? `, dont une pause de ${b.conges.plusLongueAbsence} jours` : ''}.</Petit>
                {b.conges.soldeActuel !== null && <p className="mt-6 bg-white/15 rounded-xl px-4 py-3">Il vous en reste {nombre(b.conges.soldeActuel)} aujourd'hui.</p>}
            </Diapo>
        );
    }
    if (b.remuneration) {
        diapos.push(
            <Diapo key="remuneration" fond="bg-gradient-to-br from-slate-700 to-slate-900">
                <Petit>Votre rémunération a évolué cette année.</Petit>
                {montrerRemuneration ? (
                    <>
                        {b.remuneration.evolutionPct !== null && <Grand>+{nombre(b.remuneration.evolutionPct)} %</Grand>}
                        <Petit>{b.remuneration.depuis ? `De ${nombre(b.remuneration.depuis)} à ` : 'Jusqu\'à '}{nombre(b.remuneration.vers)} FCFA de salaire de base.</Petit>
                    </>
                ) : (
                    <button onClick={(e) => { e.stopPropagation(); setMontrerRemuneration(true); }}
                        className="mt-6 self-start flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-xl px-5 py-3 text-lg">
                        <Eye className="w-5 h-5" /> Afficher le détail
                    </button>
                )}
                <p className="mt-6 text-sm opacity-70 flex items-center gap-2"><EyeOff className="w-4 h-4" /> Cette page n'apparaît jamais sur l'image à partager.</p>
            </Diapo>
        );
    }
    return diapos;
}

function CarteResume({ b }) {
    const tuiles = [
        b.presence && ['jours pointés', b.presence.joursPointes],
        b.formations && ['h de formation', b.formations.heures],
        b.reconnaissance?.recus > 0 && ['mercis reçus', b.reconnaissance.recus],
        b.conges && ['jours de congé', b.conges.joursPris],
        ['an' + (b.anciennete.annees > 1 ? 's' : '') + " d'ancienneté", b.anciennete.annees]
    ].filter(Boolean);
    return (
        <div className="w-full rounded-[2rem] p-8 bg-gradient-to-br from-orange-500 via-rose-500 to-purple-700 text-white">
            <p className="uppercase tracking-[0.25em] text-sm opacity-90">{b.organisation}</p>
            <p className="text-4xl font-black mt-2">Mon année {b.annee}</p>
            <p className="text-lg opacity-90">{b.salarie.prenom}{b.salarie.fonction ? ` · ${b.salarie.fonction}` : ''}</p>
            <div className="grid grid-cols-2 gap-3 mt-6">
                {tuiles.map(([libelle, valeur]) => (
                    <div key={libelle} className="bg-white/15 rounded-2xl p-4">
                        <p className="text-3xl font-black tabular-nums">{nombre(valeur)}</p>
                        <p className="text-sm opacity-90">{libelle}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MonAnnee() {
    const { token } = useParams();
    const [accueil, setAccueil] = useState(null);
    const [bilan, setBilan] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [dateNaissance, setDateNaissance] = useState('');
    const [envoi, setEnvoi] = useState(false);
    const [indice, setIndice] = useState(0);
    const [montrerRemuneration, setMontrerRemuneration] = useState(false);
    const carteRef = useRef(null);

    useEffect(() => {
        fetch(`${API_URL}/api/public/retrospectives/${token}`)
            .then(async (res) => {
                const corps = await res.json().catch(() => ({}));
                if (res.ok && corps.prenom) setAccueil(corps);
                else setErreur(corps.motif || corps.error || 'Ce lien ne fonctionne pas.');
            })
            .catch(() => setErreur('Connexion impossible. Réessayez.'));
    }, [token]);

    const ouvrir = async (evenement) => {
        evenement.preventDefault();
        setEnvoi(true);
        setErreur(null);
        try {
            const res = await fetch(`${API_URL}/api/public/retrospectives/${token}/ouvrir`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dateNaissance })
            });
            const corps = await res.json().catch(() => ({}));
            if (res.ok && corps.salarie) setBilan(corps);
            else setErreur(corps.error || corps.motif || 'Ouverture impossible.');
        } catch {
            setErreur('Connexion impossible. Réessayez.');
        } finally {
            setEnvoi(false);
        }
    };

    const partager = async () => {
        if (!carteRef.current) return;
        const toile = await html2canvas(carteRef.current, { backgroundColor: null, scale: 2 });
        const blob = await new Promise((r) => toile.toBlob(r, 'image/png'));
        const fichier = new File([blob], `mon-annee-${bilan.annee}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [fichier] })) {
            await navigator.share({ files: [fichier], title: `Mon année ${bilan.annee}` }).catch(() => {});
        } else {
            const lien = document.createElement('a');
            lien.href = URL.createObjectURL(blob);
            lien.download = fichier.name;
            lien.click();
            URL.revokeObjectURL(lien.href);
        }
    };

    if (!accueil && !erreur) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-400" /></div>;
    }

    if (!bilan) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-orange-900 text-white flex items-center justify-center p-6">
                <div className="w-full max-w-sm text-center">
                    {accueil ? (
                        <>
                            <Sparkles className="w-12 h-12 mx-auto text-orange-300" />
                            <h1 className="text-4xl font-black mt-4">{accueil.prenom}, votre année {accueil.annee} vous attend.</h1>
                            <form onSubmit={ouvrir} className="mt-8 space-y-4 text-left">
                                <label className="block">
                                    <span className="text-sm opacity-80 flex items-center gap-2"><Lock className="w-4 h-4" /> Pour vérifier que c'est bien vous : votre date de naissance</span>
                                    <input type="date" required value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)}
                                        className="mt-2 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white [color-scheme:dark]" />
                                </label>
                                {erreur && <p className="text-rose-300 text-sm">{erreur}</p>}
                                <button disabled={envoi} className="w-full rounded-xl bg-orange-500 hover:bg-orange-400 py-3 font-bold text-lg disabled:opacity-60">
                                    {envoi ? 'Ouverture…' : 'Découvrir mon année'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <p className="text-lg opacity-90">{erreur}</p>
                    )}
                </div>
            </div>
        );
    }

    const diapos = construireDiapos(bilan, montrerRemuneration, setMontrerRemuneration);
    const total = diapos.length + 1;
    const surResume = indice >= diapos.length;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 gap-4">
            <div className="w-full max-w-sm flex gap-1">
                {Array.from({ length: total }).map((_, i) => (
                    <span key={i} className={`h-1 flex-1 rounded-full ${i <= indice ? 'bg-white' : 'bg-white/20'}`} />
                ))}
            </div>
            <div className="relative w-full max-w-sm aspect-[9/14]" onClick={() => setIndice((i) => Math.min(total - 1, i + 1))}>
                <AnimatePresence mode="wait">
                    {surResume ? (
                        <motion.div key="resume" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="absolute inset-0 flex flex-col justify-center gap-4" onClick={(e) => e.stopPropagation()}>
                            <div ref={carteRef}><CarteResume b={bilan} /></div>
                            <button onClick={partager} className="w-full rounded-xl bg-white text-slate-900 py-3 font-bold flex items-center justify-center gap-2">
                                <Share2 className="w-5 h-5" /> Partager mon année
                            </button>
                        </motion.div>
                    ) : React.cloneElement(diapos[indice], { key: diapos[indice].key })}
                </AnimatePresence>
            </div>
            <div className="w-full max-w-sm flex justify-between text-white/70">
                <button onClick={() => setIndice((i) => Math.max(0, i - 1))} disabled={indice === 0} className="p-2 disabled:opacity-30"><ChevronLeft className="w-7 h-7" /></button>
                <span className="text-sm self-center">{surResume ? 'Votre résumé' : 'Touchez pour continuer'}</span>
                <button onClick={() => setIndice((i) => Math.min(total - 1, i + 1))} disabled={surResume} className="p-2 disabled:opacity-30"><ChevronRight className="w-7 h-7" /></button>
            </div>
        </div>
    );
}
