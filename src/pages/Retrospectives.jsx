import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Sparkles, Copy, MessageCircle, RotateCcw, Eye } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * « Mon année chez SII » : production et envoi des liens de bilan.
 *
 * Le bilan n'est pas figé : il est recalculé à chaque ouverture. Produire les
 * liens tôt en décembre ne fige donc rien — le salarié qui l'ouvre en janvier
 * voit l'année complète.
 */

const dateCourte = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

function numeroWhatsapp(telephone) {
    const chiffres = String(telephone || '').replace(/\D/g, '');
    if (chiffres.length === 10) return `225${chiffres}`;
    if (chiffres.length === 13 && chiffres.startsWith('225')) return chiffres;
    return null;
}

export function Retrospectives() {
    const anneeCourante = new Date().getFullYear();
    const [annee, setAnnee] = useState(anneeCourante);
    const [donnees, setDonnees] = useState(null);
    const [message, setMessage] = useState(null);
    const [envoi, setEnvoi] = useState(false);

    const charger = useCallback(async () => {
        try {
            const res = await api.get(`/retrospectives?annee=${annee}`);
            setDonnees(res?.data && Array.isArray(res.data.lignes) ? res.data : null);
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, [annee]);

    useEffect(() => { charger(); }, [charger]);

    const generer = async () => {
        setEnvoi(true);
        try {
            const res = await api.post('/retrospectives/generer', { annee });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Liens produits.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Production impossible.' });
        } finally {
            setEnvoi(false);
        }
    };

    const annuler = async (ligne) => {
        if (!window.confirm(`Annuler le lien de ${ligne.nom} ? Le lien déjà envoyé cessera de fonctionner.`)) return;
        try {
            await api.post(`/retrospectives/${ligne.lien.id}/revoquer`, {});
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Annulation impossible.' });
        }
    };

    const envoyer = (ligne) => {
        const texte = `Bonjour ${ligne.prenom} ! Votre année ${annee} chez nous, en quelques chiffres : ${ligne.lien.url}\n` +
            "Votre date de naissance vous sera demandée à l'ouverture. Ce lien vous est personnel.";
        window.open(`https://wa.me/${numeroWhatsapp(ligne.telephone) || ''}?text=${encodeURIComponent(texte)}`, '_blank', 'noopener');
    };

    const copier = async (url) => {
        try { await navigator.clipboard.writeText(url); setMessage({ ton: 'ok', texte: 'Lien copié.' }); } catch { setMessage({ ton: 'alerte', texte: url }); }
    };

    const lignes = donnees?.lignes || [];
    const produits = lignes.filter((l) => l.lien).length;
    const ouverts = lignes.filter((l) => l.lien?.ouvertLe).length;
    const sansNaissance = lignes.filter((l) => !l.dateNaissanceConnue).length;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="rounded-2xl p-6 bg-gradient-to-br from-orange-500 via-rose-500 to-purple-700 text-white">
                <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6" /> Mon année chez nous</h1>
                <p className="mt-2 max-w-2xl opacity-90">
                    Chaque salarié reçoit le bilan de son année : jours pointés, formations, remerciements reçus, congés, ancienneté.
                    Uniquement des chiffres réels ; une rubrique sans donnée n'apparaît pas.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                    <select value={annee} onChange={(e) => setAnnee(Number(e.target.value))} className="rounded-lg px-3 py-2 text-slate-900">
                        {[anneeCourante, anneeCourante - 1].map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <Button onClick={generer} disabled={envoi} className="bg-white text-slate-900 hover:bg-slate-100">
                        {envoi ? 'Production…' : 'Produire les liens manquants'}
                    </Button>
                    <span className="text-sm opacity-90">{produits} lien(s) · {ouverts} ouvert(s)</span>
                </div>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}
            {sansNaissance > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {sansNaissance} salarié(s) n'ont pas de date de naissance au dossier : aucun lien ne peut leur être produit, faute de pouvoir vérifier qui l'ouvre.
                </div>
            )}

            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b bg-slate-50">
                                <th className="py-3 px-4">Salarié</th><th className="py-3 px-4">Lien</th><th className="py-3 px-4">Ouvert</th><th className="py-3 px-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {lignes.map((l) => (
                                <tr key={l.employeeId} className="border-b last:border-0">
                                    <td className="py-3 px-4 font-medium text-slate-800">{l.nom}</td>
                                    <td className="py-3 px-4">
                                        {l.lien ? (l.lien.etat === 'VALIDE' ? `Produit le ${dateCourte(l.lien.creeLe)}` : <span className="text-rose-700">{l.lien.etat === 'BLOQUEE' ? 'Bloqué (échecs)' : 'Expiré'}</span>)
                                            : !l.dateNaissanceConnue ? <span className="text-amber-700">Date de naissance manquante</span>
                                            : <span className="text-slate-400">Non produit</span>}
                                    </td>
                                    <td className="py-3 px-4">
                                        {l.lien?.ouvertLe ? <span className="flex items-center gap-1 text-emerald-700"><Eye className="w-4 h-4" /> {dateCourte(l.lien.ouvertLe)} ({l.lien.ouvertures}×)</span> : '—'}
                                    </td>
                                    <td className="py-3 px-4">
                                        {l.lien && (
                                            <div className="flex justify-end gap-2">
                                                {l.lien.etat === 'VALIDE' && (
                                                    <>
                                                        <Button variant="outline" size="sm" onClick={() => envoyer(l)}><MessageCircle className="w-4 h-4 text-emerald-600" /></Button>
                                                        <Button variant="outline" size="sm" onClick={() => copier(l.lien.url)}><Copy className="w-4 h-4" /></Button>
                                                    </>
                                                )}
                                                <Button variant="outline" size="sm" title="Annuler et permettre un nouveau lien" onClick={() => annuler(l)}><RotateCcw className="w-4 h-4" /></Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
