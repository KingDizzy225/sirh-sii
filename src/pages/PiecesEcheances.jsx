import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    IdCard, AlertTriangle, Clock, CheckCircle2, ShieldQuestion,
    Upload, X, Lock, FileWarning
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext';

/**
 * Titres et habilitations à échéance des salariés.
 *
 * Les prestataires disposaient d'un dossier de pièces daté et relancé ; les
 * salariés n'avaient rien. Un permis expiré au volant d'un véhicule de service
 * engage l'entreprise, et l'application ne savait pas dire qui était concerné.
 *
 * L'écran range ce qui a expiré en premier : c'est l'ordre dans lequel on veut
 * traiter, pas l'ordre alphabétique.
 */

const ETATS = {
    EXPIREE: { libelle: 'Expiré', classe: 'bg-rose-50 text-rose-700 border-rose-200', Icone: AlertTriangle },
    BIENTOT_EXPIREE: { libelle: 'À renouveler', classe: 'bg-amber-50 text-amber-700 border-amber-200', Icone: Clock },
    VALIDE: { libelle: 'Valide', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icone: CheckCircle2 },
    SANS_ECHEANCE: { libelle: 'Sans échéance', classe: 'bg-slate-50 text-slate-600 border-slate-200', Icone: ShieldQuestion }
};

const dateFr = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
};

/** Délai en clair : « expiré depuis 12 jours » se lit mieux que « −12 ». */
const delai = (jours) => {
    if (jours === null || jours === undefined) return null;
    if (jours < 0) return `expiré depuis ${Math.abs(jours)} jour(s)`;
    if (jours === 0) return "expire aujourd'hui";
    return `dans ${jours} jour(s)`;
};

export function PiecesEcheances() {
    const { token } = useAuth();
    const [lignes, setLignes] = useState([]);
    const [synthese, setSynthese] = useState(null);
    const [types, setTypes] = useState([]);
    const [fenetre, setFenetre] = useState(60);
    const [chargement, setChargement] = useState(true);
    const [message, setMessage] = useState(null);
    const [salaries, setSalaries] = useState([]);
    const [formulaire, setFormulaire] = useState(null);

    const charger = useCallback(async () => {
        setChargement(true);
        try {
            const res = await api.get(`/pieces/echeances?jours=${fenetre}`);
            setLignes(Array.isArray(res?.data?.lignes) ? res.data.lignes : []);
            setSynthese(res?.data?.synthese || null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture des échéances impossible.' });
            setLignes([]);
        } finally {
            setChargement(false);
        }
    }, [fenetre]);

    useEffect(() => { charger(); }, [charger]);

    useEffect(() => {
        api.get('/pieces/types')
            .then((res) => { if (Array.isArray(res?.data?.types)) setTypes(res.data.types); })
            .catch(() => {});
        api.get('/employees')
            .then((res) => { if (Array.isArray(res?.data)) setSalaries(res.data); })
            .catch(() => {});
    }, []);

    const controler = async (piece, decision) => {
        let motif;
        if (decision === 'REFUSEE') {
            // Un refus sans motif laisse le salarié sans rien à corriger : le
            // serveur le refuse, autant le demander ici.
            motif = window.prompt('Motif du refus (communiqué au salarié) :');
            if (!motif) return;
        }
        try {
            await api.post(`/pieces/${piece.id}/controle`, { decision, motif });
            setMessage({
                ton: 'succes',
                texte: decision === 'VALIDE' ? 'Pièce validée.' : 'Pièce refusée, le motif est enregistré.'
            });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Contrôle impossible.' });
        }
    };

    const enregistrer = async (evenement) => {
        evenement.preventDefault();
        const donnees = new FormData(evenement.target);
        const employeeId = donnees.get('employeeId');
        if (!employeeId) return;

        try {
            const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const racine = base.endsWith('/api') ? base.slice(0, -4) : base;
            const res = await fetch(`${racine}/api/pieces/employe/${employeeId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: donnees
            });
            if (!res.ok) {
                const detail = await res.json().catch(() => ({}));
                setMessage({ ton: 'alerte', texte: detail.error || "Enregistrement refusé." });
                return;
            }
            setFormulaire(null);
            setMessage({ ton: 'succes', texte: 'Pièce enregistrée.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        }
    };

    const cartes = [
        { libelle: 'Expirés', valeur: synthese?.expirees ?? 0, couleur: 'rose', Icone: AlertTriangle },
        { libelle: 'À renouveler', valeur: synthese?.aRenouveler ?? 0, couleur: 'amber', Icone: Clock },
        { libelle: 'En attente de contrôle', valeur: synthese?.aControler ?? 0, couleur: 'sky', Icone: FileWarning }
    ];

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <IdCard className="text-sky-600" size={32} />
                        Titres & habilitations
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        Permis de conduire, aptitude médicale, habilitations, titres de séjour.
                        Les pièces expirées sont présentées en premier.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="fenetre" className="text-sm text-slate-500">Échéances sous</label>
                    <select
                        id="fenetre"
                        value={fenetre}
                        onChange={(e) => setFenetre(Number(e.target.value))}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    >
                        {[30, 60, 90, 180, 365].map((j) => (
                            <option key={j} value={j}>{j} jours</option>
                        ))}
                    </select>
                    <Button
                        onClick={() => setFormulaire({})}
                        className="bg-slate-900 hover:bg-slate-800 text-white h-10"
                    >
                        <Upload size={15} className="mr-2" /> Enregistrer une pièce
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`text-sm rounded-xl p-3 border ${
                    message.ton === 'succes'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                    {message.texte}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cartes.map((c) => (
                    <Card key={c.libelle} className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className={`p-2 w-fit rounded-lg bg-${c.couleur}-50 text-${c.couleur}-600 mb-4`}>
                                <c.Icone size={20} />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{c.libelle}</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{c.valeur}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle className="text-lg font-black">Pièces à traiter</CardTitle>
                    <CardDescription>
                        Une pièce déposée par un salarié attend une vérification avant d'être prise en compte.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {chargement ? (
                        <div className="p-12 text-center text-slate-400">Lecture des dossiers…</div>
                    ) : lignes.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            Aucune pièce n'expire dans les {fenetre} prochains jours, et aucune n'attend
                            de contrôle. Les dossiers vides n'apparaissent pas ici : l'application ne
                            sait pas quelles pièces chaque poste exige.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            <AnimatePresence initial={false}>
                                {lignes.map((l) => {
                                    const etat = ETATS[l.etat] || ETATS.SANS_ECHEANCE;
                                    return (
                                        <motion.div
                                            key={l.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-slate-900">{l.salarie.nom}</span>
                                                    <span className="text-xs text-slate-400">
                                                        {l.salarie.poste}{l.salarie.service ? ` · ${l.salarie.service}` : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="text-sm text-slate-700">{l.libelle}</span>
                                                    {l.restreinte && (
                                                        <span
                                                            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5"
                                                            title="Pièce personnelle : seules les ressources humaines et l'intéressé en voient le contenu."
                                                        >
                                                            <Lock size={9} /> contenu restreint
                                                        </span>
                                                    )}
                                                    {l.statut === 'A_CONTROLER' && (
                                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-700 bg-sky-50 border border-sky-200 rounded px-1.5 py-0.5">
                                                            déposée par le salarié
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Échéance {dateFr(l.expireLe)}
                                                    {delai(l.joursRestants) ? ` — ${delai(l.joursRestants)}` : ''}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${etat.classe}`}>
                                                    <etat.Icone size={12} /> {etat.libelle}
                                                </span>
                                                {l.statut === 'A_CONTROLER' && (
                                                    <>
                                                        <Button
                                                            onClick={() => controler(l, 'VALIDE')}
                                                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        >
                                                            Valider
                                                        </Button>
                                                        <Button
                                                            onClick={() => controler(l, 'REFUSEE')}
                                                            variant="ghost"
                                                            className="h-8 text-xs text-rose-600 hover:bg-rose-50"
                                                        >
                                                            Refuser
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>

            {formulaire && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-lg border-none shadow-xl">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-lg font-black">Enregistrer une pièce</CardTitle>
                                <CardDescription className="text-xs">
                                    Enregistrée ici, la pièce est réputée contrôlée : vous l'avez sous les yeux.
                                </CardDescription>
                            </div>
                            <button onClick={() => setFormulaire(null)} className="text-slate-400 hover:text-slate-700" aria-label="Fermer">
                                <X size={18} />
                            </button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={enregistrer} className="space-y-3">
                                <select name="employeeId" required className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm">
                                    <option value="">Choisir un salarié…</option>
                                    {salaries.map((s) => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                    ))}
                                </select>

                                <select name="type" required className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm">
                                    <option value="">Type de pièce…</option>
                                    {types.map((t) => (
                                        <option key={t.code} value={t.code}>{t.libelle}</option>
                                    ))}
                                </select>

                                <input name="reference" placeholder="Référence (facultatif)"
                                       className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm" />

                                <div className="grid grid-cols-2 gap-3">
                                    <label className="text-xs text-slate-500">
                                        Délivrée le
                                        <input type="date" name="delivreeLe"
                                               className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm mt-1" />
                                    </label>
                                    <label className="text-xs text-slate-500">
                                        Expire le
                                        <input type="date" name="expireLe"
                                               className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm mt-1" />
                                    </label>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    L'échéance laissée vide est déduite de la date de délivrance, selon
                                    la durée de validité du type choisi. Une pièce sans échéance ne
                                    serait jamais relancée.
                                </p>

                                <input type="file" name="fichier" accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                                       className="w-full text-sm" />

                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                    Enregistrer
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
