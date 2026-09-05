import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldX, Loader2, Building2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Page publique atteinte en scannant le QR d'une attestation.
 * Le visiteur est un tiers (banque, bailleur, administration) qui tient le
 * document en main : on lui confirme l'authenticité et on réaffiche les
 * mentions du document, rien de plus.
 */
export function VerifyDocument() {
    const { token } = useParams();
    const [state, setState] = useState({ status: 'loading' });

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await fetch(`${API_URL}/api/public/verify/${token}`);
                const data = await res.json();
                setState({ status: 'done', data });
            } catch {
                setState({ status: 'error' });
            }
        };
        verify();
    }, [token]);

    const formatDate = (value) => {
        if (!value) return '—';
        const d = new Date(value);
        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const TYPE_LABELS = {
        ATTESTATION_TRAVAIL: 'Attestation de travail',
        BULLETIN_PAIE: 'Bulletin de paie'
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
                {state.status === 'loading' && (
                    <div className="p-12 flex flex-col items-center gap-4 text-slate-500">
                        <Loader2 className="animate-spin" size={32} />
                        <p className="text-sm font-medium">Vérification en cours…</p>
                    </div>
                )}

                {state.status === 'error' && (
                    <div className="p-10 text-center space-y-3">
                        <ShieldX className="mx-auto text-slate-400" size={40} />
                        <p className="text-slate-700 font-semibold">Vérification impossible</p>
                        <p className="text-sm text-slate-500">
                            Le service est momentanément injoignable. Réessayez dans quelques instants.
                        </p>
                    </div>
                )}

                {state.status === 'done' && state.data?.valide && (
                    <>
                        <div className="bg-emerald-500 px-6 py-5 text-white flex items-center gap-3">
                            <ShieldCheck size={28} />
                            <div>
                                <p className="font-bold text-lg leading-tight">Document authentique</p>
                                <p className="text-emerald-50 text-xs">Émis par {state.data.organisation}</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <Field label="Type de document" value={TYPE_LABELS[state.data.type] || state.data.type} />
                            <Field label="Titulaire" value={state.data.titulaire} />
                            <Field label="Fonction" value={state.data.fonction} />
                            <Field label="Département" value={state.data.departement} />
                            <Field label="Date d'embauche" value={formatDate(state.data.dateEmbauche)} />
                            <Field label="Document émis le" value={formatDate(state.data.emisLe)} />

                            <p className="text-xs text-slate-400 border-t border-slate-100 pt-4 leading-relaxed">
                                Ces informations proviennent du registre de l'employeur et correspondent
                                à celles portées sur le document au moment de son émission. Aucune donnée
                                de rémunération ni coordonnée personnelle n'est communiquée.
                            </p>
                        </div>
                    </>
                )}

                {state.status === 'done' && state.data && !state.data.valide && (
                    <>
                        <div className="bg-rose-500 px-6 py-5 text-white flex items-center gap-3">
                            <ShieldX size={28} />
                            <div>
                                <p className="font-bold text-lg leading-tight">
                                    {state.data.motif === 'REVOQUE' ? 'Document révoqué' : 'Document non reconnu'}
                                </p>
                                <p className="text-rose-50 text-xs">
                                    {state.data.motif === 'REVOQUE'
                                        ? 'Ce document a été annulé par l\'employeur'
                                        : 'Aucun document ne correspond à ce code'}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 space-y-3 text-sm text-slate-600">
                            {state.data.motif === 'REVOQUE' ? (
                                <>
                                    <Field label="Émis le" value={formatDate(state.data.emisLe)} />
                                    <Field label="Révoqué le" value={formatDate(state.data.revoqueLe)} />
                                    {state.data.revoqueRaison && (
                                        <Field label="Motif" value={state.data.revoqueRaison} />
                                    )}
                                    <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
                                        Ce document ne doit plus être considéré comme valide. Rapprochez-vous
                                        de l'employeur pour obtenir une version à jour.
                                    </p>
                                </>
                            ) : (
                                <p className="leading-relaxed">
                                    Le code scanné ne correspond à aucun document émis. Le document
                                    présenté peut être falsifié, ou le code mal lu. Vérifiez le scan et,
                                    en cas de doute, contactez directement l'employeur.
                                </p>
                            )}
                        </div>
                    </>
                )}

                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center gap-2 text-xs text-slate-400">
                    <Building2 size={13} />
                    Vérification d'authenticité · SIRH-SII
                </div>
            </motion.div>
        </div>
    );
}

const Field = ({ label, value }) => (
    <div className="flex justify-between items-start gap-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0 pt-0.5">{label}</span>
        <span className="text-sm font-medium text-slate-800 text-right">{value || '—'}</span>
    </div>
);
