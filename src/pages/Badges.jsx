import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { IdCard, Copy, MessageCircle, Ban, Camera, Search, ShieldCheck } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

/**
 * Badges numériques : la carte professionnelle sur le téléphone du salarié.
 *
 * La RH émet le badge avec une photo, puis transmet le lien au salarié. Le
 * lien s'envoie par WhatsApp depuis le téléphone de la RH — aucun raccordement
 * à l'API WhatsApp n'est nécessaire pour cela.
 */

const ETATS = {
    VALIDE: { libelle: 'Actif', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    EXPIRE: { libelle: 'Expiré', classe: 'bg-amber-50 text-amber-800 border-amber-200' },
    REVOQUE: { libelle: 'Annulé', classe: 'bg-slate-100 text-slate-500 border-slate-200' },
    SALARIE_SORTI: { libelle: 'Éteint (départ)', classe: 'bg-slate-100 text-slate-500 border-slate-200' }
};

const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

/** Numéro ivoirien au format international attendu par wa.me. */
function numeroWhatsapp(telephone) {
    const chiffres = String(telephone || '').replace(/\D/g, '');
    if (chiffres.length === 10) return `225${chiffres}`;
    if (chiffres.length === 13 && chiffres.startsWith('225')) return chiffres;
    return null;
}

export function Badges() {
    const [lignes, setLignes] = useState([]);
    const [filtre, setFiltre] = useState('');
    const [message, setMessage] = useState(null);
    const [cible, setCible] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [envoi, setEnvoi] = useState(false);
    // L'aperçu occupe de la mémoire tant qu'on ne le libère pas.
    const apercu = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
    useEffect(() => () => { if (apercu) URL.revokeObjectURL(apercu); }, [apercu]);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/badges');
            setLignes(listeSure(res?.data, 'badges'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture des badges impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const visibles = useMemo(() => {
        const f = filtre.trim().toLowerCase();
        return f ? lignes.filter((l) => `${l.nom} ${l.fonction || ''} ${l.departement || ''}`.toLowerCase().includes(f)) : lignes;
    }, [lignes, filtre]);

    const actifs = lignes.filter((l) => l.badge?.etat === 'VALIDE').length;

    const emettre = async (evenement) => {
        evenement.preventDefault();
        setEnvoi(true);
        try {
            const donnees = new FormData();
            if (photo) donnees.append('photo', photo);
            const res = await api.post(`/badges/${cible.employeeId}/emettre`, donnees);
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Badge émis.' });
            setCible(null);
            setPhoto(null);
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Émission impossible.' });
        } finally {
            setEnvoi(false);
        }
    };

    const revoquer = async (ligne) => {
        const motif = window.prompt(`Motif de l'annulation du badge de ${ligne.nom} (perte, vol, changement de poste…)`);
        if (!motif) return;
        try {
            const res = await api.post(`/badges/${ligne.badge.id}/revoquer`, { motif });
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Badge annulé.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Annulation impossible.' });
        }
    };

    const copier = async (lien) => {
        try {
            await navigator.clipboard.writeText(lien);
            setMessage({ ton: 'ok', texte: 'Lien de la carte copié.' });
        } catch {
            setMessage({ ton: 'alerte', texte: lien });
        }
    };

    const envoyerWhatsapp = (ligne) => {
        const numero = numeroWhatsapp(ligne.telephone);
        const texte = `Bonjour ${ligne.nom.split(' ')[0]}, voici votre badge professionnel numérique : ${ligne.badge.lienPorteur}\n` +
            "Ajoutez-le à l'écran d'accueil de votre téléphone pour le présenter en clientèle. Ce lien est personnel : ne le transférez pas.";
        window.open(`https://wa.me/${numero || ''}?text=${encodeURIComponent(texte)}`, '_blank', 'noopener');
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><IdCard className="w-6 h-6 text-orange-600" /> Badges numériques</h1>
                    <p className="text-slate-500 mt-1">
                        La carte professionnelle sur le téléphone. Un client la scanne et vérifie en direct ; au départ du salarié, elle s'éteint seule.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border rounded-lg px-3 py-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> {actifs} badge{actifs > 1 ? 's' : ''} actif{actifs > 1 ? 's' : ''} sur {lignes.length} salariés
                </div>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            <div className="relative max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="Rechercher un salarié"
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2" />
            </div>

            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b bg-slate-50">
                                <th className="py-3 px-4">Salarié</th><th className="py-3 px-4">Badge</th>
                                <th className="py-3 px-4">Expire le</th><th className="py-3 px-4">Scans</th><th className="py-3 px-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {visibles.map((l) => {
                                const etat = l.badge ? ETATS[l.badge.etat] : null;
                                const actif = l.badge?.etat === 'VALIDE';
                                return (
                                    <tr key={l.employeeId} className="border-b last:border-0">
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-slate-800">{l.nom}</p>
                                            <p className="text-xs text-slate-500">{[l.fonction, l.departement].filter(Boolean).join(' · ')}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            {etat ? <span className={`text-xs px-2 py-1 rounded-full border ${etat.classe}`}>{etat.libelle}</span>
                                                : <span className="text-xs text-slate-400">Aucun</span>}
                                            {l.badge && !l.badge.photo && actif && <span className="ml-2 text-xs text-amber-700">sans photo</span>}
                                        </td>
                                        <td className="py-3 px-4">{actif ? date(l.badge.expireLe) : '—'}</td>
                                        <td className="py-3 px-4">{l.badge ? l.badge.verifications : '—'}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-end gap-2 whitespace-nowrap">
                                                {actif && (
                                                    <>
                                                        <Button variant="outline" size="sm" onClick={() => envoyerWhatsapp(l)} title={numeroWhatsapp(l.telephone) ? 'Envoyer par WhatsApp' : 'Numéro absent : choisir le destinataire dans WhatsApp'}>
                                                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => copier(l.badge.lienPorteur)}><Copy className="w-4 h-4" /></Button>
                                                        <Button variant="outline" size="sm" onClick={() => revoquer(l)}><Ban className="w-4 h-4 text-rose-600" /></Button>
                                                    </>
                                                )}
                                                <Button size="sm" onClick={() => { setCible(l); setPhoto(null); }}>
                                                    {actif ? 'Renouveler' : 'Émettre'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {cible && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setCible(null)}>
                    <form onSubmit={emettre} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Badge de {cible.nom}</h2>
                        {cible.badge?.etat === 'VALIDE' && (
                            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                Le badge actuel sera annulé : l'ancien lien ne s'ouvrira plus. Sans nouvelle photo, la photo actuelle est conservée.
                            </p>
                        )}
                        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-orange-400">
                            {photo ? (
                                <img src={apercu} alt="Aperçu" className="w-32 h-32 object-cover rounded-full" />
                            ) : (
                                <Camera className="w-10 h-10 text-slate-400" />
                            )}
                            <span className="text-sm text-slate-600">{photo ? photo.name : "Photo d'identité (JPEG, PNG ou WebP, 5 Mo max.)"}</span>
                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                        </label>
                        <p className="text-xs text-slate-500">
                            Sans photo, le vérificateur ne peut comparer aucun visage : le badge prouve alors l'emploi, pas l'identité du porteur.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setCible(null)}>Annuler</Button>
                            <Button type="submit" disabled={envoi}>{envoi ? 'Émission…' : 'Émettre le badge'}</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
