import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Lock, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Retrait d'un document remis par les ressources humaines.
 *
 * Les salariés n'ouvrent plus de session : un bulletin de paie n'avait donc
 * plus aucun moyen de leur parvenir. La RH produit un lien, le transmet par le
 * canal de son choix, et cette page le sert.
 *
 * Ce que la page ne montre pas est aussi important que ce qu'elle montre :
 * avant la vérification, ni le nom du destinataire ni l'intitulé du document.
 * Un lien transféré par erreur ne doit pas dire de qui il s'agit.
 */
export function PublicDocument() {
    const { token } = useParams();
    const [etat, setEtat] = useState({ phase: 'lecture' });
    const [naissance, setNaissance] = useState('');
    const [document, setDocument] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [envoi, setEnvoi] = useState(false);

    useEffect(() => {
        let vivant = true;
        fetch(`${API_URL}/api/public/documents/${token}`)
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!vivant) return;
                if (!res.ok || !data.valide) {
                    setEtat({ phase: 'refus', motif: data.motif || "Ce lien n'est pas valide." });
                    return;
                }
                if (data.verification === 'AUCUNE') {
                    setDocument({ titre: data.titre, expireLe: data.expireLe, remplace: data.remplace });
                    setEtat({ phase: 'pret', organisation: data.organisation });
                } else {
                    setEtat({ phase: 'verification', organisation: data.organisation, expireLe: data.expireLe });
                }
            })
            .catch(() => {
                if (vivant) setEtat({ phase: 'refus', motif: 'Le service est momentanément injoignable.' });
            });
        return () => { vivant = false; };
    }, [token]);

    const ouvrir = async (evenement) => {
        evenement.preventDefault();
        setEnvoi(true);
        setErreur(null);
        try {
            const res = await fetch(`${API_URL}/api/public/documents/${token}/ouvrir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ naissance })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.valide) {
                setErreur(
                    (data.motif || 'Vérification refusée.')
                    + (data.essaisRestants !== undefined
                        ? ` Il vous reste ${data.essaisRestants} essai(s).`
                        : '')
                );
                return;
            }
            setDocument(data);
            setEtat((e) => ({ ...e, phase: 'pret' }));
        } catch {
            setErreur('Le service est momentanément injoignable.');
        } finally {
            setEnvoi(false);
        }
    };

    const lienFichier = `${API_URL}/api/public/documents/${token}/fichier`
        + (naissance ? `?naissance=${encodeURIComponent(naissance)}` : '');

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
                <div className="bg-slate-900 px-6 py-5 text-white">
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                        {etat.organisation || 'Ressources humaines'}
                    </p>
                    <h1 className="text-lg font-bold mt-1 flex items-center gap-2">
                        <FileText size={18} /> Votre document
                    </h1>
                </div>

                {etat.phase === 'lecture' && (
                    <div className="p-10 flex flex-col items-center gap-3 text-slate-500">
                        <Loader2 className="animate-spin" size={26} />
                        <p className="text-sm">Vérification du lien…</p>
                    </div>
                )}

                {etat.phase === 'refus' && (
                    <div className="p-8 flex flex-col items-center gap-3 text-center">
                        <ShieldAlert size={30} className="text-rose-500" />
                        <p className="text-sm text-slate-700 leading-relaxed">{etat.motif}</p>
                    </div>
                )}

                {etat.phase === 'verification' && (
                    <form onSubmit={ouvrir} className="p-6 space-y-4">
                        <div className="flex items-start gap-2.5 text-slate-600">
                            <Lock size={16} className="mt-0.5 shrink-0 text-slate-400" />
                            <p className="text-sm leading-relaxed">
                                Pour ouvrir ce document, indiquez votre date de naissance.
                                Ce contrôle évite qu'un lien transmis par erreur donne accès
                                à vos informations.
                            </p>
                        </div>

                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Date de naissance
                            <input
                                type="date"
                                required
                                value={naissance}
                                onChange={(e) => setNaissance(e.target.value)}
                                className="mt-1.5 w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-normal normal-case tracking-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </label>

                        {erreur && (
                            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                                {erreur}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={envoi || !naissance}
                            className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:opacity-40"
                        >
                            {envoi ? 'Vérification…' : 'Ouvrir mon document'}
                        </button>
                    </form>
                )}

                {etat.phase === 'pret' && document && (
                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-900 leading-snug">{document.titre}</p>
                                {document.destinataire && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Remis à {document.destinataire}
                                    </p>
                                )}
                            </div>
                        </div>

                        {document.remplace && (
                            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-relaxed">
                                Ce bulletin a été remplacé depuis par une version rectifiée. Demandez le
                                nouveau lien au service des ressources humaines.
                            </p>
                        )}

                        <a
                            href={lienFichier}
                            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800"
                        >
                            <Download size={16} /> Télécharger
                        </a>

                        {(document.expireLe || etat.expireLe) && (
                            <p className="text-xs text-slate-500 text-center">
                                Ce lien reste valable jusqu'au{' '}
                                {new Date(document.expireLe || etat.expireLe).toLocaleDateString('fr-FR')}.
                                Conservez le fichier, il ne sera plus accessible ensuite.
                            </p>
                        )}
                    </div>
                )}

                <div className="border-t border-slate-100 px-6 py-3">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Ce lien vous est personnel. Si vous l'avez reçu par erreur,
                        signalez-le au service des ressources humaines.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
