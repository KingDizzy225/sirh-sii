import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookHeart, Copy, MessageCircle, Lock, EyeOff, Eye, Gift } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

/**
 * Livres d'or : on en ouvre un pour une occasion, on fait circuler le lien
 * d'écriture, et le jour venu on remet le lien de lecture à la personne.
 */

const dateCourte = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function numeroWhatsapp(telephone) {
    const chiffres = String(telephone || '').replace(/\D/g, '');
    if (chiffres.length === 10) return `225${chiffres}`;
    if (chiffres.length === 13 && chiffres.startsWith('225')) return chiffres;
    return null;
}

export function LivresDor() {
    const [donnees, setDonnees] = useState({ occasions: {}, livres: [] });
    const [employes, setEmployes] = useState([]);
    const [saisie, setSaisie] = useState({ beneficiaireId: '', occasion: 'RETRAITE', titre: '', dateRemise: '', afficherMur: true });
    const [ouvert, setOuvert] = useState(null);
    const [mots, setMots] = useState([]);
    const [message, setMessage] = useState(null);

    const charger = useCallback(async () => {
        try {
            const [res, resEmployes] = await Promise.all([api.get('/livres-dor'), api.get('/employees')]);
            setDonnees(res?.data && Array.isArray(res.data.livres) ? res.data : { occasions: {}, livres: [] });
            setEmployes(listeSure(resEmployes?.data, 'salariés'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const chargerMots = useCallback(async (id) => {
        try {
            const res = await api.get(`/livres-dor/${id}/mots`);
            setMots(listeSure(res?.data, 'mots'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture des mots impossible.' });
        }
    }, []);

    const creer = async (evenement) => {
        evenement.preventDefault();
        try {
            await api.post('/livres-dor', saisie);
            setMessage({ ton: 'ok', texte: "Livre d'or ouvert. Partagez le lien d'écriture dans le groupe WhatsApp de l'équipe." });
            setSaisie({ beneficiaireId: '', occasion: 'RETRAITE', titre: '', dateRemise: '', afficherMur: true });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Création impossible.' });
        }
    };

    const basculerMot = async (livre, mot) => {
        try {
            await api.post(`/livres-dor/${livre.id}/mots/${mot.id}/masquer`, { masque: !mot.masque });
            chargerMots(livre.id);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Modération impossible.' });
        }
    };

    const clore = async (livre) => {
        if (!window.confirm(`Clore « ${livre.titre} » ? Plus personne ne pourra y écrire.`)) return;
        try {
            const res = await api.post(`/livres-dor/${livre.id}/clore`, {});
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Livre clos.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Clôture impossible.' });
        }
    };

    const partager = (texte, numero = '') => window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texte)}`, '_blank', 'noopener');
    const copier = async (lien) => {
        try { await navigator.clipboard.writeText(lien); setMessage({ ton: 'ok', texte: 'Lien copié.' }); } catch { setMessage({ ton: 'alerte', texte: lien }); }
    };

    const actifs = employes.filter((e) => e.status !== 'TERMINATED');

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BookHeart className="w-6 h-6 text-amber-500" /> Livres d'or</h1>
                <p className="text-slate-500 mt-1">
                    Retraite, naissance, mariage, dix ans de maison : les collègues écrivent par un lien, la personne reçoit tous les mots le jour venu.
                </p>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            <Card>
                <CardHeader><CardTitle>Ouvrir un livre d'or</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={creer} className="grid md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Pour qui</span>
                            <select required value={saisie.beneficiaireId} onChange={(e) => {
                                const choisi = actifs.find((x) => x.id === e.target.value);
                                setSaisie((s) => ({ ...s, beneficiaireId: e.target.value, titre: s.titre || (choisi ? `Pour ${choisi.firstName}` : '') }));
                            }} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                <option value="">—</option>
                                {actifs.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Occasion</span>
                            <select value={saisie.occasion} onChange={(e) => setSaisie((s) => ({ ...s, occasion: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                {Object.entries(donnees.occasions).map(([code, libelle]) => <option key={code} value={code}>{libelle}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Titre</span>
                            <input required minLength={3} maxLength={120} value={saisie.titre} onChange={(e) => setSaisie((s) => ({ ...s, titre: e.target.value }))}
                                placeholder="Bonne retraite, Mamadou !" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Jour de la remise</span>
                            <input required type="date" value={saisie.dateRemise} onChange={(e) => setSaisie((s) => ({ ...s, dateRemise: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                        </label>
                        <label className="flex items-center gap-2 text-sm md:col-span-2">
                            <input type="checkbox" checked={saisie.afficherMur} onChange={(e) => setSaisie((s) => ({ ...s, afficherMur: e.target.checked }))} />
                            Inviter à écrire sur les écrans de salle du personnel (jamais sur les écrans en vitrine)
                        </label>
                        <div className="md:col-span-2"><Button type="submit">Ouvrir le livre d'or</Button></div>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {donnees.livres.map((l) => (
                    <Card key={l.id}>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-900">{l.titre}</p>
                                    <p className="text-sm text-slate-500">
                                        {l.occasionLibelle} · {l.beneficiaire} · remise le {dateCourte(l.dateRemise)} · <strong>{l.nombreMots} mot{l.nombreMots > 1 ? 's' : ''}</strong>
                                        {l.remiseOuverteLe && <span className="text-emerald-700"> · lu</span>}
                                        {!l.ouvertAuxMots && <span> · clos</span>}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {l.ouvertAuxMots && (
                                        <>
                                            <Button variant="outline" size="sm" onClick={() => partager(`Laissons un mot pour ${l.beneficiaire.split(' ')[0]} ! « ${l.titre} » : ${l.lienContribution}`)}>
                                                <MessageCircle className="w-4 h-4 mr-1 text-emerald-600" /> Inviter
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => copier(l.lienContribution)}><Copy className="w-4 h-4" /></Button>
                                            <Button variant="outline" size="sm" onClick={() => clore(l)}><Lock className="w-4 h-4" /></Button>
                                        </>
                                    )}
                                    <Button size="sm" onClick={() => partager(`${l.titre} — vos collègues vous ont écrit : ${l.lienRemise}`, numeroWhatsapp(l.telephoneBeneficiaire) || '')}>
                                        <Gift className="w-4 h-4 mr-1" /> Remettre
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => {
                                        if (ouvert === l.id) { setOuvert(null); return; }
                                        setOuvert(l.id);
                                        chargerMots(l.id);
                                    }}>{ouvert === l.id ? 'Masquer les mots' : 'Lire les mots'}</Button>
                                </div>
                            </div>
                            {ouvert === l.id && (
                                <ul className="space-y-2">
                                    {mots.length === 0 && <li className="text-sm text-slate-500">Aucun mot pour l'instant.</li>}
                                    {mots.map((m) => (
                                        <li key={m.id} className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 ${m.masque ? 'opacity-50' : ''}`}>
                                            <p className="text-sm text-slate-700 whitespace-pre-line">{m.message} <span className="text-slate-400">— {m.auteur}</span></p>
                                            <button onClick={() => basculerMot(l, m)} title={m.masque ? 'Rétablir' : 'Masquer'} className="text-slate-500 hover:text-slate-900 shrink-0">
                                                {m.masque ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
