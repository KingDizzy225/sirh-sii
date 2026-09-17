import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { ImageUp, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api.js';
import { rechargerIdentite, logoUrl, degradeMarque } from '../lib/identite.js';

/**
 * Identité de l'entreprise, dans les paramètres.
 *
 * Remplace un formulaire factice : logo « transféré » perdu au rechargement,
 * raison sociale, immatriculation et adresse pré-remplies d'exemples, et un
 * bouton « Enregistrer » qui n'enregistrait rien.
 */

const CHAMPS = [
    ['nomCommercial', 'Nom affiché', 'SII Côte d\'Ivoire'],
    ['raisonSociale', 'Raison sociale', ''],
    ['rccm', 'N° RCCM', 'CI-ABJ-…'],
    ['slogan', 'Slogan (facultatif)', ''],
    ['adresse', 'Adresse', ''],
    ['ville', 'Ville', 'Abidjan'],
    ['telephone', 'Téléphone', ''],
    ['email', 'Adresse électronique', ''],
    ['siteWeb', 'Site web', '']
];

export function IdentiteEntreprise() {
    const [saisie, setSaisie] = useState(null);
    const [apercu, setApercu] = useState(null);
    const [message, setMessage] = useState(null);
    const [envoi, setEnvoi] = useState(false);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/identite');
            if (res?.data) {
                const d = res.data;
                setSaisie(Object.fromEntries([...CHAMPS.map(([cle]) => [cle, d[cle] || '']), ['couleurPrincipale', d.couleurPrincipale], ['couleurSecondaire', d.couleurSecondaire]]));
                setApercu(d);
            }
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || "Lecture de l'identité impossible." });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const enregistrer = async () => {
        setEnvoi(true);
        try {
            const res = await api.put('/identite', saisie);
            const avertissements = res?.data?.avertissements || [];
            setMessage({ ton: avertissements.length ? 'alerte' : 'ok', texte: [res?.data?.message, ...avertissements].filter(Boolean).join(' ') });
            await rechargerIdentite();
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Enregistrement impossible.' });
        } finally {
            setEnvoi(false);
        }
    };

    const deposerLogo = async (fichier) => {
        if (!fichier) return;
        try {
            const donnees = new FormData();
            donnees.append('logo', fichier);
            const res = await api.post('/identite/logo', donnees);
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Logo enregistré.' });
            await rechargerIdentite();
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Logo non enregistré.' });
        }
    };

    if (!saisie) return <p className="text-sm text-slate-500">Lecture de l'identité…</p>;

    const vue = { ...apercu, ...saisie, nom: saisie.nomCommercial || apercu?.nom };

    return (
        <div className="space-y-6">
            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm flex gap-2 ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    {message.ton !== 'ok' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />} {message.texte}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Identité de l'entreprise</CardTitle>
                    <CardDescription>Reprise sur les écrans d'agence, les badges, le pré-accueil, les bilans annuels, les bulletins et les attestations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-2xl p-6 text-white flex items-center gap-4" style={{ background: degradeMarque(vue) }}>
                        {logoUrl(apercu) ? (
                            <img src={logoUrl(apercu)} alt="" className="w-16 h-16 object-contain bg-white rounded-xl p-1" />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-white/20" />
                        )}
                        <div>
                            <p className="text-2xl font-black">{vue.nom}</p>
                            {vue.slogan && <p className="opacity-90">{vue.slogan}</p>}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 border rounded-lg px-3 py-2 hover:bg-slate-50">
                            <ImageUp className="w-4 h-4" /> Déposer le logo
                            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => deposerLogo(e.target.files?.[0])} />
                        </label>
                        {[['couleurPrincipale', 'Couleur principale'], ['couleurSecondaire', 'Couleur secondaire']].map(([cle, libelle]) => (
                            <label key={cle} className="flex items-center gap-2 text-sm text-slate-700">
                                <input type="color" value={saisie[cle]} onChange={(e) => setSaisie((s) => ({ ...s, [cle]: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
                                {libelle}
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500">Logo en PNG, JPEG ou WebP, 2 Mo au plus. Les pages publiques écrivent en blanc sur les couleurs : choisissez-les assez foncées.</p>

                    <div className="grid gap-4 md:grid-cols-2">
                        {CHAMPS.map(([cle, libelle, exemple]) => (
                            <label key={cle} className="block">
                                <span className="text-sm font-medium text-slate-700">{libelle}</span>
                                <input value={saisie[cle]} placeholder={exemple} onChange={(e) => setSaisie((s) => ({ ...s, [cle]: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={enregistrer} disabled={envoi}>{envoi ? 'Enregistrement…' : "Enregistrer l'identité"}</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
